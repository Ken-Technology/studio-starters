#!/usr/bin/env node
// Writes index.json from the bundles in starters/. Zero dependencies, Node 20+.
//
//   node scripts/build-index.mjs           rewrite index.json
//   node scripts/build-index.mjs --check   exit 1 and name the entries that differ when index.json is stale
//
// A folder with library.json (a Library template) gets a generated entry: slug, name, type, format, showcases, then
// every library.json field. A folder without one keeps its entry in index.json byte for byte, and an entry whose
// folder is gone drops out. The kept entries come first in their current order, then the Library entries by slug.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const LIBRARY_FIELDS = ['description', 'category', 'tags', 'featured', 'needs', 'version', 'updatedAt', 'samples'];
const KIT = ['ken/chart', 'ken/cta', 'ken/form', 'ken/booking'];

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    throw new Error(`${file}: ${e.code === 'ENOENT' ? 'missing' : `not valid JSON: ${e.message}`}`);
  }
}

// What a template shows off: its step kinds, its tool names, the kit snippets template.liquid renders, then doc.
// Each in order of first appearance, no duplicates.
export function showcases(manifest, template) {
  const recipe = Array.isArray(manifest.recipe) ? manifest.recipe : [];
  const live = template.replace(/\{%-?\s*(comment|raw)\s*-?%\}[\s\S]*?\{%-?\s*end\1\s*-?%\}/g, '');
  const kit = [...live.matchAll(/\{%-?\s*render\s+['"]([^'"]+)['"]/g)].map((m) => m[1]).filter((k) => KIT.includes(k));
  const all = [
    ...recipe.map((step) => step?.kind),
    ...recipe.filter((step) => step?.kind === 'tool').map((step) => step.tool),
    ...kit,
    ...(manifest.format === 'doc' ? ['doc'] : []),
  ];
  return [...new Set(all.filter((x) => typeof x === 'string' && x))];
}

export function libraryEntry(rootDir, slug) {
  const dir = path.join(rootDir, 'starters', slug);
  const manifest = readJson(path.join(dir, 'studio.json'));
  const library = readJson(path.join(dir, 'library.json'));
  const templatePath = path.join(dir, 'template.liquid');
  const template = fs.existsSync(templatePath) ? fs.readFileSync(templatePath, 'utf8') : '';
  const entry = { slug, name: manifest.name, type: manifest.type, format: manifest.format, showcases: showcases(manifest, template) };
  for (const k of LIBRARY_FIELDS) entry[k] = library?.[k];
  return entry;
}

// The raw text of each element of the top-level "starters" array, in order, so a kept entry is copied byte for byte.
export function entrySpans(text) {
  const spans = [];
  let depth = 0;
  let key = '';
  let inStarters = false;
  let start = -1;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      let j = i + 1;
      while (j < text.length && text[j] !== '"') j += text[j] === '\\' ? 2 : 1;
      if (depth === 1) key = text.slice(i + 1, j);
      i = j;
    } else if (ch === '{' || ch === '[') {
      if (depth === 1 && ch === '[' && key === 'starters') inStarters = true;
      else if (depth === 2 && inStarters) start = i;
      depth++;
    } else if (ch === '}' || ch === ']') {
      depth--;
      if (depth === 2 && inStarters && start >= 0) {
        spans.push(text.slice(start, i + 1));
        start = -1;
      }
      if (depth === 1) inStarters = false;
    }
  }
  return spans;
}

const indent = (json) => json.replace(/\n/g, '\n    ');

// The index.json text for the bundles under rootDir, given the current index.json text.
export function buildIndex(rootDir, currentIndex) {
  const current = JSON.parse(currentIndex);
  const raw = entrySpans(currentIndex);
  const starters = current.starters ?? [];
  if (raw.length !== starters.length) throw new Error('index.json: every "starters" entry must be an object, so it can be kept byte for byte');
  const startersDir = path.join(rootDir, 'starters');
  const folders = fs.readdirSync(startersDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  const library = folders.filter((f) => fs.existsSync(path.join(startersDir, f, 'library.json'))).sort();
  const kept = raw.filter((_, i) => folders.includes(starters[i].slug) && !library.includes(starters[i].slug));
  const made = library.map((slug) => indent(JSON.stringify(libraryEntry(rootDir, slug), null, 2)));
  const items = [...kept, ...made];
  return `{\n  "kenStudio": "1",\n  "starters": ${items.length ? `[\n    ${items.join(',\n    ')}\n  ]` : '[]'}\n}\n`;
}

// What differs between two index.json texts, entry by entry, for the --check message.
export function staleEntries(currentIndex, nextIndex) {
  const bySlug = (text) => {
    let starters = [];
    try {
      starters = JSON.parse(text).starters ?? [];
    } catch {
      return new Map();
    }
    const raw = entrySpans(text);
    return new Map(starters.map((entry, i) => [entry?.slug, raw[i] ?? '']));
  };
  const now = bySlug(currentIndex);
  const next = bySlug(nextIndex);
  const out = [];
  for (const [slug, text] of next) {
    if (!now.has(slug)) out.push(`"${slug}" is missing`);
    else if (now.get(slug) !== text) out.push(`"${slug}" differs`);
  }
  for (const slug of now.keys()) if (!next.has(slug)) out.push(`"${slug}" is listed with no folder`);
  return out.length ? out : ['the order or the formatting differs'];
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
  const file = path.join(root, 'index.json');
  const current = fs.readFileSync(file, 'utf8');
  let next;
  try {
    next = buildIndex(root, current);
  } catch (e) {
    console.error(`cannot build index.json: ${e.message}`);
    process.exit(1);
  }
  if (process.argv.includes('--check')) {
    if (next === current) {
      console.log('index.json is up to date');
      process.exit(0);
    }
    console.log(`index.json is stale: ${staleEntries(current, next).join('; ')}. Run npm run build-index`);
    process.exit(1);
  }
  if (next !== current) fs.writeFileSync(file, next);
  console.log(next === current ? 'index.json is up to date' : 'wrote index.json');
}
