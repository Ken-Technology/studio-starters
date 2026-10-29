// Tests for build-index.mjs. Zero dependencies, Node 20+: node --test scripts/build-index.test.mjs
//
// Each test builds a repo in a temp folder from library-fixture.mjs, so it does not depend on the committed starters.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { buildIndex, showcases } from './build-index.mjs';
import { LIBRARY, STUDIO, TEMPLATE, writeLibrary } from './library-fixture.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const EMPTY_INDEX = '{\n  "kenStudio": "1",\n  "starters": []\n}\n';
const indexOf = (...entries) => `{\n  "kenStudio": "1",\n  "starters": [\n    ${entries.join(',\n    ')}\n  ]\n}\n`;

function inRepo(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-index-'));
  try {
    fs.mkdirSync(path.join(dir, 'starters'));
    return fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

// An old starter: a bundle with no library.json and no preview/.
function writeOld(dir, slug) {
  const bundle = writeLibrary(dir, { slug });
  fs.rmSync(path.join(bundle, 'library.json'));
  fs.rmSync(path.join(bundle, 'preview'), { recursive: true });
}

test('the committed index.json is what build-index.mjs writes', () => {
  const text = fs.readFileSync(path.join(ROOT, 'index.json'), 'utf8');
  assert.equal(buildIndex(ROOT, text), text);
});

test('Library entries come after the kept entries, sorted by slug', () => {
  inRepo((dir) => {
    writeLibrary(dir, { slug: 'zeta-brief' });
    writeLibrary(dir, { slug: 'alpha-brief' });
    writeOld(dir, 'old-b');
    writeOld(dir, 'old-a');
    const current = indexOf('{ "slug": "old-b" }', '{ "slug": "zeta-brief" }', '{ "slug": "old-a" }');
    const slugs = JSON.parse(buildIndex(dir, current)).starters.map((s) => s.slug);
    assert.deepEqual(slugs, ['old-b', 'old-a', 'alpha-brief', 'zeta-brief']);
  });
});

test('a Library entry is slug, name, type, format, showcases, then every library.json field in schema order', () => {
  inRepo((dir) => {
    writeLibrary(dir);
    const entry = JSON.parse(buildIndex(dir, EMPTY_INDEX)).starters[0];
    assert.deepEqual(Object.keys(entry), ['slug', 'name', 'type', 'format', 'showcases', 'description', 'category', 'tags', 'featured', 'needs', 'version', 'updatedAt', 'samples']);
    assert.deepEqual(entry, {
      slug: 'demo-library',
      name: STUDIO.name,
      type: STUDIO.type,
      format: STUDIO.format,
      showcases: ['bind', 'tool', 'prompt', 'ken_search.count', 'ken/chart', 'ken/cta'],
      ...LIBRARY,
    });
  });
});

test('an index of Library entries is 2-space JSON with a trailing newline', () => {
  inRepo((dir) => {
    writeLibrary(dir, { slug: 'one' });
    writeLibrary(dir, { slug: 'two' });
    const text = buildIndex(dir, EMPTY_INDEX);
    assert.equal(text, `${JSON.stringify(JSON.parse(text), null, 2)}\n`);
  });
});

test('showcases are the step kinds, then the tool names, then the kit snippets rendered, then doc', () => {
  assert.deepEqual(showcases(STUDIO, TEMPLATE), ['bind', 'tool', 'prompt', 'ken_search.count', 'ken/chart', 'ken/cta']);
  const doc = {
    ...STUDIO,
    format: 'doc',
    recipe: [
      ...STUDIO.recipe,
      { id: 'leads', kind: 'tool', tool: 'ken_search.people' },
      { id: 'again', kind: 'tool', tool: 'ken_search.count' },
      { id: 'check', kind: 'grade' },
    ],
  };
  const template = [
    "{% render 'ken/form', id: 'rsvp' %}",
    "{% comment %}{% render 'ken/booking' %}{% endcomment %}",
    "{%- raw -%}{% render 'ken/cta' %}{%- endraw -%}",
    '{%- render "ken/chart", data: data.x %}',
    "{% render 'ken/form', id: 'again' %}",
  ].join('\n');
  assert.deepEqual(showcases(doc, template), ['bind', 'tool', 'prompt', 'grade', 'ken_search.count', 'ken_search.people', 'ken/form', 'ken/chart', 'doc']);
});

test('a folder without library.json keeps its entry byte for byte, and an entry with no folder drops out', () => {
  inRepo((dir) => {
    writeOld(dir, 'old-starter');
    const kept = '{ "slug": "old-starter",   "name": "Old {brace} \\"quoted\\" [x]",\n  "showcases": ["a",   "b"], "version": "1.0.0" }';
    const gone = '{\n      "slug": "gone-starter"\n    }';
    assert.equal(buildIndex(dir, indexOf(gone, kept)), indexOf(kept));
  });
});

test('an entry that is not an object stops the build instead of reformatting the kept entries', () => {
  inRepo((dir) => {
    writeOld(dir, 'old-starter');
    assert.throws(() => buildIndex(dir, indexOf('{ "slug": "old-starter" }', 'null')), /every "starters" entry must be an object/);
  });
});

test('a folder that gains library.json gets a generated entry in place of its old one', () => {
  inRepo((dir) => {
    writeLibrary(dir);
    const old = '{ "slug": "demo-library", "showcases": ["dataset"] }';
    const starters = JSON.parse(buildIndex(dir, indexOf(old))).starters;
    assert.equal(starters.length, 1);
    assert.equal(starters[0].category, LIBRARY.category);
  });
});

test('--check exits 0 when index.json is fresh and 1 naming the stale entries', () => {
  inRepo((dir) => {
    fs.mkdirSync(path.join(dir, 'scripts'));
    fs.cpSync(path.join(ROOT, 'scripts', 'build-index.mjs'), path.join(dir, 'scripts', 'build-index.mjs'));
    const run = (...args) => spawnSync(process.execPath, [path.join(dir, 'scripts', 'build-index.mjs'), ...args], { encoding: 'utf8' });
    const indexFile = path.join(dir, 'index.json');
    const bundle = writeLibrary(dir);
    fs.writeFileSync(indexFile, EMPTY_INDEX);

    let res = run('--check');
    assert.equal(res.status, 1, res.stdout);
    assert.match(res.stdout, /index\.json is stale: "demo-library" is missing\. Run npm run build-index/);
    assert.equal(fs.readFileSync(indexFile, 'utf8'), EMPTY_INDEX, '--check never writes');

    res = run();
    assert.equal(res.status, 0, res.stdout + res.stderr);
    res = run('--check');
    assert.equal(res.status, 0, res.stdout);
    assert.match(res.stdout, /index\.json is up to date/);

    const lib = JSON.parse(fs.readFileSync(path.join(bundle, 'library.json'), 'utf8'));
    fs.writeFileSync(path.join(bundle, 'library.json'), JSON.stringify({ ...lib, featured: true }));
    const text = fs.readFileSync(indexFile, 'utf8');
    fs.writeFileSync(indexFile, text.replace('"starters": [\n', '"starters": [\n    { "slug": "gone" },\n'));
    res = run('--check');
    assert.equal(res.status, 1, res.stdout);
    assert.match(res.stdout, /"demo-library" differs; "gone" is listed with no folder\. Run npm run build-index/);

    fs.writeFileSync(path.join(bundle, 'library.json'), '{"description": ');
    res = run();
    assert.equal(res.status, 1, res.stdout + res.stderr);
    assert.match(res.stderr, /^cannot build index\.json: .*library\.json: not valid JSON/);
    assert.doesNotMatch(res.stderr, /\n\s+at /);
  });
});
