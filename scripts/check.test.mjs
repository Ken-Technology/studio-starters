// Tests for check.mjs. Zero dependencies, Node 20+: node --test scripts/check.test.mjs
//
// Each test copies index.json, starters/ and check.mjs into a temp folder, applies one edit to a starter
// and runs the real check there, so a rule is tested on the template line it guards. The Library tests
// build their own repo from library-fixture.mjs instead, so they do not depend on the old starters.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { LIBRARY, SAMPLES, SLUG, png, writeLibrary } from './library-fixture.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

function copyScripts(dir) {
  fs.mkdirSync(path.join(dir, 'scripts'));
  for (const f of ['check.mjs', 'build-index.mjs']) fs.cpSync(path.join(ROOT, 'scripts', f), path.join(dir, 'scripts', f));
}

// edits: [file under starters/, text to find, replacement]. Each find must match exactly once.
function check(edits = []) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-check-'));
  try {
    fs.cpSync(path.join(ROOT, 'index.json'), path.join(dir, 'index.json'));
    fs.cpSync(path.join(ROOT, 'starters'), path.join(dir, 'starters'), { recursive: true });
    copyScripts(dir);
    for (const [file, find, replace] of edits) {
      const full = path.join(dir, 'starters', file);
      const text = fs.readFileSync(full, 'utf8');
      assert.equal(text.split(find).length, 2, `${file} should hold "${find}" exactly once`);
      fs.writeFileSync(full, text.replace(find, replace));
    }
    const run = spawnSync(process.execPath, [path.join(dir, 'scripts', 'check.mjs')], { encoding: 'utf8' });
    return { status: run.status, out: run.stdout + run.stderr };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test('every starter passes as committed', () => {
  const { status, out } = check();
  assert.equal(status, 0, out);
});

test('an inline script fails', () => {
  const { status, out } = check([['event-invite/template.liquid', '</body>', '<script>document.title = "x";</script></body>']]);
  assert.equal(status, 1, out);
  assert.match(out, /inline <script> is not allowed/);
});

test('a JSON-LD data block passes', () => {
  const { status, out } = check([['event-invite/template.liquid', '</body>', '<script type="application/ld+json">{"@type": "Event"}</script></body>']]);
  assert.equal(status, 0, out);
});

test('newline_to_br assigned to a local and printed without raw fails', () => {
  const { status, out } = check([['rd-your-product/template.liquid', '<p>{{ text | raw }}</p>', '<p>{{ text }}</p>']]);
  assert.equal(status, 1, out);
  assert.match(out, /template\.liquid: line \d+: newline_to_br output is escaped at render/);
});

test('raw with no escape earlier in the chain fails', () => {
  const { status, out } = check([[
    'audit-rewrites/template.liquid',
    '{{ data.summary | escape | newline_to_br | strip_newlines | raw }}',
    '{{ data.summary | newline_to_br | strip_newlines | raw }}',
  ]]);
  assert.equal(status, 1, out);
  assert.match(out, /template\.liquid: line \d+: \| raw prints the value unescaped/);
});

test('raw straight on a slot fails', () => {
  const { status, out } = check([['audit-rewrites/template.liquid', '<p>{{ data.summary | escape | newline_to_br | strip_newlines | raw }}</p>', '<p>{{ data.summary | raw }}</p>']]);
  assert.equal(status, 1, out);
  assert.match(out, /\| raw prints the value unescaped/);
});

test('raw on a local built from unescaped data fails', () => {
  const { status, out } = check([[
    'rd-your-product/template.liquid',
    "assign paras = data.meaning | escape | newline_to_br",
    "assign paras = data.meaning | newline_to_br",
  ]]);
  assert.equal(status, 1, out);
  assert.match(out, /\| raw prints the value unescaped/);
});

test('role and roles are Ken variables', () => {
  const { status, out } = check();
  assert.equal(status, 0, out);
  assert.doesNotMatch(out, /variable "roles?" is not a Ken variable/);
});

test('a recruiting sample without role.title fails', () => {
  const { status, out } = check([[
    'role-pitch/samples/northwind-shared.json',
    '"role": { "title": "Senior Backend Engineer"',
    '"role": { "name": "Senior Backend Engineer"',
  ]]);
  assert.equal(status, 1, out);
  assert.match(out, /samples\/northwind-shared\.json: role\.title is required in a recruiting sample/);
});

test('a sample of any other type still needs account.name', () => {
  const { status, out } = check([['event-invite/samples/copperline-shared.json', '"name": "Copperline Supply"', '"label": "Copperline Supply"']]);
  assert.equal(status, 1, out);
  assert.match(out, /samples\/copperline-shared\.json: account\.name is required/);
});

test('a bind from role. passes and a bind from roles fails', () => {
  const ok = check([['role-pitch/studio.json', '"from": "role.title"', '"from": "role.company"']]);
  assert.equal(ok.status, 0, ok.out);
  const bad = check([['role-pitch/studio.json', '"from": "role.title"', '"from": "roles"']]);
  assert.equal(bad.status, 1, bad.out);
  assert.match(bad.out, /bind from must start with account\., person\., role\., knowledge\./);
});

test('an unknown type still fails', () => {
  const { status, out } = check([['role-pitch/studio.json', '"type": "recruiting"', '"type": "hiring"']]);
  assert.equal(status, 1, out);
  assert.match(out, /type must be one of reverse_demo, landing_page, audit, report, event, calculator, recruiting, other/);
});

// --- Library templates -----------------------------------------------------------------------

const EMPTY_INDEX = '{\n  "kenStudio": "1",\n  "starters": []\n}\n';
const OLD_ENTRY = `{
      "slug": "old-starter",
      "name": "Signals brief",
      "type": "report",
      "format": "page",
      "description": "A starter from before the Library.",
      "showcases": ["bind", "tool", "prompt"],
      "version": "1.0.0"
    }`;

const run = (dir, script) => spawnSync(process.execPath, [path.join(dir, 'scripts', script)], { encoding: 'utf8' });

function editJson(file, change) {
  const value = JSON.parse(fs.readFileSync(file, 'utf8'));
  change(value);
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

// A repo holding the Library fixture with index.json built for it. `setup(dir)` runs before the index is built,
// `edit(bundle, dir)` after, so an edit that changes the entry leaves index.json stale.
function checkLibrary(edit = () => {}, { setup = () => {} } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-library-'));
  try {
    copyScripts(dir);
    const bundle = writeLibrary(dir);
    fs.writeFileSync(path.join(dir, 'index.json'), EMPTY_INDEX);
    setup(dir);
    const built = run(dir, 'build-index.mjs');
    assert.equal(built.status, 0, built.stdout + built.stderr);
    edit(bundle, dir);
    const res = run(dir, 'check.mjs');
    return { status: res.status, out: res.stdout + res.stderr, index: fs.readFileSync(path.join(dir, 'index.json'), 'utf8') };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

const library = (change) => (bundle) => editJson(path.join(bundle, 'library.json'), change);

test('a Library template passes', () => {
  const { status, out } = checkLibrary();
  assert.equal(status, 0, out);
  assert.match(out, /OK\s+demo-library/);
});

const INVALID = [
  ['no description', (l) => delete l.description, /library\.json: description must be a non-empty string/],
  ['an exclamation mark in the description', (l) => { l.description = 'A brief for one account!'; }, /library\.json: description has an em or en dash or an exclamation mark/],
  ['an en dash in the description', (l) => { l.description = 'A brief \u2013 for one account.'; }, /library\.json: description has an em or en dash or an exclamation mark/],
  ['an unknown category', (l) => { l.category = 'sales'; }, /library\.json: category must be one of prospecting, deal, events, customers, interactive, content, partners, recruiting/],
  ['seven tags', (l) => { l.tags = ['a', 'b', 'c', 'd', 'e', 'f', 'g']; }, /library\.json: tags must be a list of 0 to 6 strings of at most 32 characters/],
  ['a tag over 32 characters', (l) => { l.tags = ['x'.repeat(33)]; }, /library\.json: tags must be a list of 0 to 6 strings of at most 32 characters/],
  ['tags as a string', (l) => { l.tags = 'signals'; }, /library\.json: tags must be a list/],
  ['featured as a string', (l) => { l.featured = 'yes'; }, /library\.json: featured must be true or false/],
  ['an unknown need', (l) => { l.needs = ['crm']; }, /library\.json: needs must be a list of distinct values from dataset, webhook, knowledge, video/],
  ['a two-part version', (l) => { l.version = '1.0'; }, /library\.json: version must be semver like 1\.0\.0/],
  ['a date that does not exist', (l) => { l.updatedAt = '2026-02-30'; }, /library\.json: updatedAt must be a real date as YYYY-MM-DD/],
  ['a date in another format', (l) => { l.updatedAt = '10/29/2026'; }, /library\.json: updatedAt must be a real date as YYYY-MM-DD/],
  ['two samples', (l) => { l.samples = l.samples.slice(0, 2); }, /library\.json: samples must list at least 3 samples as \{id, label\}/],
  ['a sample id with capitals', (l) => { l.samples[0].id = 'Acme'; }, /library\.json: samples\[0\]: id must match \^\[a-z0-9-\]\+\$/],
  ['a duplicate sample id', (l) => { l.samples[2].id = 'acme'; }, /library\.json: samples\[2\]: duplicate id "acme"/],
  ['a sample with no label', (l) => { delete l.samples[1].label; }, /library\.json: samples\[1\]: label is required/],
  ['an exclamation mark in a sample label', (l) => { l.samples[1].label = 'Globex, shared link!'; }, /library\.json: samples\[1\]: label has an em or en dash or an exclamation mark/],
  ['a listed sample with no file', (l) => { l.samples.push({ id: 'umbrella', label: 'Umbrella' }); }, /library\.json: samples\[3\]: samples\/umbrella\.json does not exist/],
  ['an unknown field', (l) => { l.status = 'draft'; }, /library\.json: unknown field "status"/],
  ['no featured', (l) => delete l.featured, /library\.json: featured must be true or false/],
  ['no updatedAt', (l) => delete l.updatedAt, /library\.json: updatedAt must be a real date as YYYY-MM-DD/],
  ['a tag that is not a string', (l) => { l.tags = [5]; }, /library\.json: tags must be a list of 0 to 6 strings/],
  ['needs as a string', (l) => { l.needs = 'dataset'; }, /library\.json: needs must be a list of distinct values/],
  ['a need listed twice', (l) => { l.needs = ['dataset', 'dataset']; }, /library\.json: needs must be a list of distinct values/],
  ['samples as an object', (l) => { l.samples = { acme: 'Acme' }; }, /library\.json: samples must list at least 3 samples as \{id, label\}/],
  ['a sample that is not an object', (l) => { l.samples[0] = 'acme'; }, /library\.json: samples\[0\]: id must match/],
  ['an unknown field in a sample', (l) => { l.samples[0].note = 'first'; }, /library\.json: samples\[0\]: unknown field "note"/],
  ['a branded sample first', (l) => { l.samples = [l.samples[1], l.samples[0], l.samples[2]]; }, /library\.json: samples\[0\]: the cover comes from the first sample, so list a sample in the default brand first/],
];
for (const [name, change, message] of INVALID) {
  test(`library.json with ${name} fails`, () => {
    const { status, out } = checkLibrary(library(change));
    assert.equal(status, 1, out);
    assert.match(out, message);
  });
}

test('library.json that is not JSON fails', () => {
  const { status, out } = checkLibrary((bundle) => fs.writeFileSync(path.join(bundle, 'library.json'), '{"description": '));
  assert.equal(status, 1, out);
  assert.match(out, /library\.json: not valid JSON/);
});

test('a missing cover fails', () => {
  const { status, out } = checkLibrary((bundle) => fs.rmSync(path.join(bundle, 'preview', 'cover.png')));
  assert.equal(status, 1, out);
  assert.match(out, /preview\/cover\.png: missing; run npm run render -- demo-library/);
});

test('a cover of the wrong size fails', () => {
  const { status, out } = checkLibrary((bundle) => fs.writeFileSync(path.join(bundle, 'preview', 'cover.png'), png(1280, 720)));
  assert.equal(status, 1, out);
  assert.match(out, /preview\/cover\.png: 1280x720, must be 1280x800/);
});

test('a cover that is not a PNG fails', () => {
  const { status, out } = checkLibrary((bundle) => fs.writeFileSync(path.join(bundle, 'preview', 'cover.png'), 'GIF89a'));
  assert.equal(status, 1, out);
  assert.match(out, /preview\/cover\.png: not a PNG/);
});

test('a cover over 400 KB fails', () => {
  const { status, out } = checkLibrary((bundle) => fs.writeFileSync(path.join(bundle, 'preview', 'cover.png'), png(1280, 800, 410 * 1024)));
  assert.equal(status, 1, out);
  assert.match(out, /preview\/cover\.png: \d+ KB, over 400 KB/);
});

test('a missing sample preview fails', () => {
  const { status, out } = checkLibrary((bundle) => fs.rmSync(path.join(bundle, 'preview', 'acme.html')));
  assert.equal(status, 1, out);
  assert.match(out, /preview\/acme\.html: missing; run npm run render -- demo-library/);
});

test('a preview that is a file, not a folder, fails with messages', () => {
  const { status, out } = checkLibrary((bundle) => {
    fs.rmSync(path.join(bundle, 'preview'), { recursive: true });
    fs.writeFileSync(path.join(bundle, 'preview'), 'not a folder');
  });
  assert.equal(status, 1, out);
  assert.match(out, /preview\/cover\.png: missing/);
  assert.doesNotMatch(out, /\n\s+at /);
});

test('any other file in preview/ fails', () => {
  const { status, out } = checkLibrary((bundle) => fs.writeFileSync(path.join(bundle, 'preview', 'old-sample.html'), '<!doctype html>'));
  assert.equal(status, 1, out);
  assert.match(out, /preview\/old-sample\.html: unexpected file; preview\/ holds cover\.png and one <sampleId>\.html per listed sample/);
});

test('a stale index.json fails and names the entry', () => {
  const { status, out } = checkLibrary(library((l) => { l.version = '1.0.1'; }));
  assert.equal(status, 1, out);
  assert.match(out, /ERROR index\.json: stale \("demo-library" differs\); run npm run build-index/);
});

test('an index.json without the Library entry fails and names it', () => {
  const { status, out } = checkLibrary((bundle, dir) => fs.writeFileSync(path.join(dir, 'index.json'), EMPTY_INDEX));
  assert.equal(status, 1, out);
  assert.match(out, /ERROR index\.json: stale \("demo-library" is missing\); run npm run build-index/);
});

test('a sample file not listed in library.json fails', () => {
  const { status, out } = checkLibrary((bundle) => fs.writeFileSync(path.join(bundle, 'samples', 'umbrella.json'), JSON.stringify(SAMPLES.acme)));
  assert.equal(status, 1, out);
  assert.match(out, /samples\/umbrella\.json: not listed in library\.json samples; list it or delete it/);
});

test('a CSV next to the samples is data, not a sample', () => {
  const { status, out } = checkLibrary((bundle) => fs.writeFileSync(path.join(bundle, 'samples', 'peers.csv'), 'name,value\nAcme,1\n'));
  assert.equal(status, 0, out);
});

test('a Library template with no "person": null sample fails', () => {
  const { status, out } = checkLibrary((bundle) => editJson(path.join(bundle, 'samples', 'globex-shared.json'), (s) => {
    s.person = { first_name: 'Ana', last_name: 'Lund', title: 'CFO' };
  }));
  assert.equal(status, 1, out);
  assert.match(out, /library\.json: no listed sample has "person": null; add one for the shared link/);
});

test('a folder without library.json is checked as before and keeps its index entry', () => {
  const setup = (dir) => {
    const old = writeLibrary(dir, { slug: 'old-starter' });
    fs.rmSync(path.join(old, 'library.json'));
    fs.rmSync(path.join(old, 'preview'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.json'), `{\n  "kenStudio": "1",\n  "starters": [\n    ${OLD_ENTRY}\n  ]\n}\n`);
  };
  const ok = checkLibrary(() => {}, { setup });
  assert.equal(ok.status, 0, ok.out);
  assert.match(ok.out, /OK\s+old-starter/);
  assert.ok(ok.index.includes(OLD_ENTRY), ok.index);
  // A preview/ folder is still an unexpected file in a bundle without library.json.
  const bad = checkLibrary((bundle, dir) => fs.mkdirSync(path.join(dir, 'starters', 'old-starter', 'preview')), { setup });
  assert.equal(bad.status, 1, bad.out);
  assert.match(bad.out, /preview: unexpected file/);
});

test('ken_search.count is a recipe tool', () => {
  const ok = checkLibrary();
  assert.equal(ok.status, 0, ok.out);
  assert.doesNotMatch(ok.out, /tool must be one of/);
  const bad = checkLibrary((bundle) => editJson(path.join(bundle, 'studio.json'), (m) => { m.recipe[1].tool = 'ken_search.counts'; }));
  assert.equal(bad.status, 1, bad.out);
  assert.match(bad.out, /recipe\[1\] \(market\): tool must be one of [^\n]*ken_search\.count,/);
});

test('a bind from account.signals passes', () => {
  const ok = checkLibrary();
  assert.equal(ok.status, 0, ok.out);
  assert.doesNotMatch(ok.out, /bind from must start with/);
  const bad = checkLibrary((bundle) => editJson(path.join(bundle, 'studio.json'), (m) => { m.recipe[0].from = 'signals'; }));
  assert.equal(bad.status, 1, bad.out);
  assert.match(bad.out, /recipe\[0\] \(signals\): bind from must start with account\./);
});

// --- defaults.<slot> (ken-backend DEV-5800) --------------------------------------------------

const recipe = (change) => (bundle) => editJson(path.join(bundle, 'studio.json'), (m) => change(m.recipe));

test('defaults.<slot> passes in prompt text, inputs and bind.from when the slot has a fallback', () => {
  const { status, out } = checkLibrary(recipe((r) => {
    r.splice(1, 0, { id: 'seed', kind: 'bind', from: 'defaults.headline', to: 'data.headline' });
    r[3].prompt = 'Rewrite "{{ defaults.headline }}" for {{ account.name }}.';
    r[3].inputs.push('defaults.headline');
  }));
  assert.equal(status, 0, out);
});

const DEFAULTS_INVALID = [
  ['an input of a slot with no fallback', (r) => r[2].inputs.push('defaults.market'), /recipe\[2\] \(headline\): input "defaults\.market" reads slot "market", which has no fallback/],
  ['an input of a slot that does not exist', (r) => r[2].inputs.push('defaults.event_title'), /recipe\[2\] \(headline\): input "defaults\.event_title" reads slot "event_title", which is not a declared slot/],
  ['an input of defaults alone', (r) => r[2].inputs.push('defaults'), /recipe\[2\] \(headline\): input "defaults" must be defaults\.<slot>/],
  ['a bind from a slot that does not exist', (r) => { r[0].from = 'defaults.agenda'; }, /recipe\[0\] \(signals\): bind from "defaults\.agenda" reads slot "agenda", which is not a declared slot/],
  ['prompt text reading a slot with no fallback', (r) => { r[2].prompt = 'Count {{ defaults.signals | size }} signals.'; }, /recipe\[2\] \(headline\): prompt "defaults\.signals" reads slot "signals", which has no fallback/],
  ['tool args reading a slot that does not exist', (r) => { r[1].args.segments[0].label = '{{ defaults.segment }}'; }, /recipe\[1\] \(market\): args "defaults\.segment" reads slot "segment", which is not a declared slot/],
];

for (const [name, change, message] of DEFAULTS_INVALID) {
  test(`defaults.<slot> fails for ${name}`, () => {
    const { status, out } = checkLibrary(recipe(change));
    assert.equal(status, 1, out);
    assert.match(out, message);
  });
}

test('recipe text reading a slot no earlier step writes fails and points at defaults', () => {
  const text = checkLibrary(recipe((r) => { r[1].args.segments[0].label = '{{ data.headline }}'; }));
  assert.equal(text.status, 1, text.out);
  assert.match(text.out, /recipe\[1\] \(market\): args reads data\.headline, which no earlier step writes, so the step sees nothing; read the slot's fallback as \{\{ defaults\.headline \}\}/);
  const input = checkLibrary(recipe((r) => r.unshift({ id: 'angle', kind: 'prompt', prompt: 'Pick an angle.', inputs: ['data.headline'], to: 'data.market' })));
  assert.equal(input.status, 1, input.out);
  assert.match(input.out, /recipe\[0\] \(angle\): input "data\.headline" is not filled by an earlier step; read the slot's fallback as "defaults\.headline"/);
});

test('recipe text reading a slot an earlier step writes passes', () => {
  const { status, out } = checkLibrary(recipe((r) => { r[2].prompt = 'Write a headline from {{ data.signals | json }}.'; }));
  assert.equal(status, 0, out);
});

test('a Knowledge path other than knowledge.stable or knowledge.scoped warns', () => {
  const bad = checkLibrary(recipe((r) => r[2].inputs.push('knowledge.offer')));
  assert.equal(bad.status, 0, bad.out);
  assert.match(bad.out, /warning studio\.json: recipe\[2\] \(headline\): "knowledge\.offer" is not Knowledge; it holds only knowledge\.stable and knowledge\.scoped/);
  const ok = checkLibrary(recipe((r) => r[2].inputs.push('knowledge.stable', 'knowledge.scoped')));
  assert.equal(ok.status, 0, ok.out);
  assert.doesNotMatch(ok.out, /is not Knowledge/);
});

test('a slot may carry a description', () => {
  const { status, out } = checkLibrary((bundle) => editJson(path.join(bundle, 'studio.json'), (m) => { m.slots.properties.headline.description = 'One line, sentence case.'; }));
  assert.equal(status, 0, out);
});
