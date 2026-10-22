// Tests for check.mjs. Zero dependencies, Node 20+: node --test scripts/check.test.mjs
//
// Each test copies index.json, starters/ and check.mjs into a temp folder, applies one edit to a starter
// and runs the real check there, so a rule is tested on the template line it guards.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

// edits: [file under starters/, text to find, replacement]. Each find must match exactly once.
function check(edits = []) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-check-'));
  try {
    fs.cpSync(path.join(ROOT, 'index.json'), path.join(dir, 'index.json'));
    fs.cpSync(path.join(ROOT, 'starters'), path.join(dir, 'starters'), { recursive: true });
    fs.mkdirSync(path.join(dir, 'scripts'));
    fs.cpSync(path.join(ROOT, 'scripts', 'check.mjs'), path.join(dir, 'scripts', 'check.mjs'));
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
