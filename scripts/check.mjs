#!/usr/bin/env node
// Structural check for every bundle in starters/. Zero dependencies, Node 20+.
//
//   node scripts/check.mjs            check everything, exit 1 on any error
//   node scripts/check.mjs rd-doc     check one bundle (index.json is still checked)
//
// It covers the rules a static scan can prove. Kenso's validator runs the full set (Liquid parse,
// filled-data rules, Web Risk) when a bundle is pushed; this script catches the common mistakes first.
// A Library template (a folder with library.json) also gets its library.json, preview/ and index.json entry checked.
import fs from 'node:fs';
import path from 'node:path';
import { LIBRARY_FIELDS, buildIndex, staleEntries } from './build-index.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const STARTERS = path.join(ROOT, 'starters');

const TYPES = ['reverse_demo', 'landing_page', 'audit', 'report', 'event', 'calculator', 'recruiting', 'other'];
const FORMATS = ['page', 'doc'];
const SLOT_TYPES = ['string', 'number', 'integer', 'boolean', 'array', 'object'];
// description and title are notes for the template's author; Kenso accepts them and checks nothing in them.
const SLOT_KEYWORDS = new Set(['type', 'properties', 'required', 'items', 'minLength', 'maxLength', 'minItems', 'maxItems', 'enum', 'format', 'fallback', 'description', 'title']);
const KEN_ROOTS = ['account', 'person', 'sender', 'brand', 'link', 'asset_url', 'data', 'role', 'roles'];
const BIND_FROM = ['account.', 'person.', 'role.', 'knowledge.', 'defaults.'];
// A variable path written without {{ }}, like data.segments or account.domain.
const VARIABLE_PATH = /^\s*(account|person|sender|brand|link|role|roles|knowledge|defaults|data)(\.[A-Za-z0-9_]+|\[\d+\])+\s*$/;
const TOOLS = ['ken_search.people', 'ken_search.companies', 'ken_search.count', 'enrich.email', 'scrape.page', 'ken.copy', 'chart.data'];
const CATEGORIES = ['prospecting', 'deal', 'events', 'customers', 'interactive', 'content', 'partners', 'recruiting'];
const NEEDS = ['dataset', 'webhook', 'knowledge', 'video'];
const COVER = { width: 1280, height: 800, bytes: 400 * 1024 };
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
// `requires` (ken-backend recipe-requires) is on every kind but bind: the step does not run while a listed slot is empty.
const STEP_FIELDS = {
  bind: { required: ['from', 'to'], optional: [] },
  tool: { required: ['tool', 'to'], optional: ['args', 'requires'] },
  prompt: { required: ['prompt', 'to'], optional: ['inputs', 'model', 'requires'] },
  grade: { required: ['rubric', 'on'], optional: ['retries', 'pass_score', 'requires', 'checks'] },
  webhook: { required: ['url', 'to'], optional: ['headers', 'timeout_s', 'requires'] },
  dataset: { required: ['dataset', 'to'], optional: ['where', 'limit', 'requires'] },
};
// A grade step's `checks` (ken-backend recipe-grade-checks): string rules Kenso runs on the graded slots before the judge.
const GRADE_CHECKS = ['no_placeholders', 'no_dashes', 'no_prices', 'no_test_noun', 'no_real_emphasis', 'no_signoff'];
const KIT = ['ken/cta', 'ken/chart', 'ken/booking', 'ken/form'];
// The Studio validator's script sources (csp.scriptSources in ken-backend Ken.Redirector.Edge/src/studio/policy.json),
// matched the way CSP matches them: a source ending in '/' is a path prefix, any other source is one exact URL.
// Alpine loads only as its CSP build from jsDelivr: the standard build needs 'unsafe-eval', which the Studio CSP leaves out.
const SCRIPT_CDNS = [
  'https://cdn.jsdelivr.net/npm/chart.js@4',
  'https://cdn.jsdelivr.net/npm/chart.js@4/',
  'https://cdn.jsdelivr.net/npm/@alpinejs/csp@3/',
  'https://cdn.jsdelivr.net/npm/motion@11',
  'https://cdn.jsdelivr.net/npm/motion@11/',
];
const scriptAllowed = (src) => SCRIPT_CDNS.some((c) => (c.endsWith('/') ? src.startsWith(c) : src === c));
const FRAME_HOSTS = [
  'calendly.com', 'cal.com', 'meetings.hubspot.com', 'chilipiper.com', 'savvycal.com',
  'loom.com', 'youtube.com', 'youtube-nocookie.com', 'vimeo.com', 'wistia.com', 'wistia.net',
];
const STYLE_HOSTS = ['https://fonts.googleapis.com/'];
const LIQUID_TAGS = new Set(['if', 'elsif', 'else', 'endif', 'unless', 'endunless', 'for', 'endfor', 'break', 'continue',
  'assign', 'capture', 'endcapture', 'case', 'when', 'endcase', 'render', 'comment', 'endcomment', 'raw', 'endraw']);
const LIQUID_FILTERS = new Set(['default', 'escape', 'escape_once', 'upcase', 'downcase', 'capitalize', 'size', 'date', 'join',
  'split', 'round', 'times', 'divided_by', 'plus', 'minus', 'modulo', 'abs', 'ceil', 'floor', 'at_least', 'at_most', 'first',
  'last', 'map', 'sort', 'reverse', 'uniq', 'compact', 'slice', 'truncate', 'truncatewords', 'strip', 'lstrip', 'rstrip',
  'strip_html', 'strip_newlines', 'newline_to_br', 'replace', 'replace_first', 'remove', 'remove_first', 'append',
  'prepend', 'url_encode', 'raw']);
const ASSET_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.woff', '.woff2', '.csv', '.pdf']);
const BUNDLE_FILES = new Set(['studio.json', 'template.liquid', 'fallback.liquid', 'README.md', 'brief.md', 'ideas.md', 'assets', 'samples']);
// The ## headings of brief.md, in order; ## Open questions may follow them (README "The plan").
const BRIEF_HEADINGS = ['Goal', 'Who reads it', 'The one ask', 'Sections', 'Variables and sources', 'Tone'];
const SAMPLE_KEYS = new Set(['account', 'person', 'sender', 'brand', 'data', 'role', 'roles']);
const LIMITS = { template: 256 * 1024, asset: 200 * 1024, bundle: 1024 * 1024 };
const EMAIL = /[\w.+-]+@[\w-]+\.[\w.-]+/;
const PHONE = /\+?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/;
const DASHES = /[—–]/;

let errors = 0;
let warnings = 0;

function bundleChecker(slug) {
  const issues = [];
  const err = (file, msg) => issues.push({ level: 'error', file, msg });
  const warn = (file, msg) => issues.push({ level: 'warning', file, msg });
  return { issues, err, warn };
}

function readJson(file, err, label) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    err(label, `not valid JSON: ${e.message}`);
    return null;
  }
}

function walkFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkFiles(full));
    else out.push(full);
  }
  return out;
}

// --- slot schema -----------------------------------------------------------------------------

function checkSchema(schema, where, err) {
  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
    err('studio.json', `${where}: schema must be an object`);
    return;
  }
  for (const key of Object.keys(schema)) {
    if (!SLOT_KEYWORDS.has(key)) err('studio.json', `${where}: keyword "${key}" is outside the slot schema subset`);
  }
  if (!SLOT_TYPES.includes(schema.type)) err('studio.json', `${where}: type must be one of ${SLOT_TYPES.join(', ')}`);
  if ('format' in schema && schema.format !== 'uri') err('studio.json', `${where}: format may only be "uri"`);
  if ('enum' in schema && !Array.isArray(schema.enum)) err('studio.json', `${where}: enum must be an array`);
  for (const k of ['minLength', 'maxLength', 'minItems', 'maxItems']) {
    if (k in schema && !(Number.isInteger(schema[k]) && schema[k] >= 0)) err('studio.json', `${where}: ${k} must be a non-negative integer`);
  }
  if (schema.properties) {
    if (schema.type !== 'object') err('studio.json', `${where}: properties only belong on type object`);
    for (const [name, child] of Object.entries(schema.properties)) checkSchema(child, `${where}.${name}`, err);
  }
  if (schema.required) {
    if (!Array.isArray(schema.required)) err('studio.json', `${where}: required must be an array`);
    else for (const r of schema.required) if (!schema.properties || !(r in schema.properties)) err('studio.json', `${where}: required "${r}" is not in properties`);
  }
  if (schema.items) {
    if (schema.type !== 'array') err('studio.json', `${where}: items only belong on type array`);
    checkSchema(schema.items, `${where}[]`, err);
  }
}

// Null and a blank string read as "no value" (ken-backend StudioSlotValueValidator.IsAbsent).
const absent = (v) => v === null || v === undefined || (typeof v === 'string' && !v.trim());
const URI = /^https?:\/\/[^\s/?#]\S*$/i;
const kindOf = (v) => (v === null ? 'null' : Array.isArray(v) ? 'array' : Number.isInteger(v) ? 'integer' : typeof v);

// Validates a value against the subset the way ken-backend StudioSlotValueValidator does, for sample data and slot
// fallbacks alike: lengths count code points, a uri is an absolute http(s) URL, and an absent object field is skipped.
function validateValue(schema, value, where) {
  const out = [];
  if (value === undefined) return out;
  const t = schema.type;
  const actual = kindOf(value);
  if (t && !(t === actual || (t === 'number' && actual === 'integer'))) return [`${where}: expected ${t}, got ${actual}`];
  if (Array.isArray(schema.enum) && !schema.enum.some((e) => JSON.stringify(e) === JSON.stringify(value))) out.push(`${where}: not one of ${schema.enum.join(', ')}`);
  if (actual === 'string') {
    const length = [...value].length;
    if ('minLength' in schema && length < schema.minLength) out.push(`${where}: ${length} characters, shorter than ${schema.minLength}`);
    if ('maxLength' in schema && length > schema.maxLength) out.push(`${where}: ${length} characters, longer than ${schema.maxLength}`);
    if (schema.format === 'uri' && !URI.test(value.trim())) out.push(`${where}: not an absolute http(s) URL`);
  }
  if (actual === 'array') {
    if ('minItems' in schema && value.length < schema.minItems) out.push(`${where}: fewer than ${schema.minItems} items`);
    if ('maxItems' in schema && value.length > schema.maxItems) out.push(`${where}: more than ${schema.maxItems} items`);
    if (schema.items) value.forEach((v, i) => out.push(...validateValue(schema.items, v, `${where}[${i}]`)));
  }
  if (actual === 'object') {
    for (const r of schema.required ?? []) if (absent(value[r])) out.push(`${where}.${r}: required`);
    for (const [k, v] of Object.entries(value)) {
      if (schema.properties?.[k] && !absent(v)) out.push(...validateValue(schema.properties[k], v, `${where}.${k}`));
    }
  }
  return out;
}

function stringsIn(value, out = []) {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => stringsIn(v, out));
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => stringsIn(v, out));
  return out;
}

// Every string in a step's args as [path, text], like ['segments[0].label', 'Same industry'].
function argStrings(value, at = '', out = []) {
  if (typeof value === 'string') out.push([at, value]);
  else if (Array.isArray(value)) value.forEach((v, i) => argStrings(v, `${at}[${i}]`, out));
  else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) argStrings(v, at ? `${at}.${k}` : k, out);
  return out;
}

// --- Liquid and HTML scan --------------------------------------------------------------------

function liquidTags(text) {
  return [...text.matchAll(/\{%-?\s*([\s\S]*?)\s*-?%\}/g)].map((m) => ({ body: m[1], index: m.index }));
}

function liquidOutputs(text) {
  return [...text.matchAll(/\{\{-?\s*([\s\S]*?)\s*-?\}\}/g)].map((m) => ({ body: m[1], index: m.index }));
}

function lineOf(text, index) {
  return text.slice(0, index).split('\n').length;
}

function stripStrings(s) {
  return s.replace(/'[^']*'|"[^"]*"/g, '""');
}

// The variable a Liquid expression starts from, and the filters it runs, in order.
function chainOf(expr) {
  const body = stripStrings(expr);
  return { root: body.match(/^\s*([a-z_]\w*)/i)?.[1], filters: [...body.matchAll(/\|\s*([a-z_][a-z0-9_]*)/g)].map((f) => f[1]) };
}

const escapes = (filters) => filters.includes('escape') || filters.includes('escape_once');

function scanLiquid(text, file, { err, warn }, { allowData }) {
  const locals = new Set(['forloop']);
  const defs = [];
  const tags = liquidTags(text);
  let inRaw = false;
  for (const t of tags) {
    const name = t.body.split(/\s+/)[0];
    if (name === 'raw') inRaw = true;
    if (name === 'endraw') inRaw = false;
    if (inRaw && name !== 'raw') continue;
    if (!LIQUID_TAGS.has(name)) err(file, `line ${lineOf(text, t.index)}: tag "${name}" is not in the portable Liquid subset`);
    if (name === 'assign' || name === 'capture') locals.add(t.body.split(/\s+/)[1]?.replace(/=.*/, ''));
    if (name === 'for') locals.add(t.body.split(/\s+/)[1]);
    const def = t.body.match(/^assign\s+(\w+)\s*=([\s\S]*)$/) ?? t.body.match(/^for\s+(\w+)\s+in\s+([\s\S]*)$/);
    if (def) defs.push({ name: def[1], ...chainOf(def[2]) });
    if (name === 'render') {
      const partial = t.body.match(/^render\s+['"]([^'"]+)['"]/)?.[1];
      if (!KIT.includes(partial)) err(file, `line ${lineOf(text, t.index)}: render "${partial}" is not a kit snippet (${KIT.join(', ')})`);
    }
  }
  // A local is escaped when every assign or for that sets it escapes, in its own chain or by reading an escaped local.
  // It holds <br /> tags when any of them runs newline_to_br or reads a local that holds them.
  const escaped = new Set();
  const withBr = new Set();
  for (let changed = true; changed;) {
    changed = false;
    for (const local of new Set(defs.map((d) => d.name))) {
      const own = defs.filter((d) => d.name === local);
      if (!escaped.has(local) && own.every((d) => escapes(d.filters) || escaped.has(d.root))) {
        escaped.add(local);
        changed = true;
      }
      if (!withBr.has(local) && own.some((d) => d.filters.includes('newline_to_br') || withBr.has(d.root))) {
        withBr.add(local);
        changed = true;
      }
    }
  }
  const exprs = [
    ...tags.filter((t) => !/^(render|comment|endcomment|raw|endraw)\b/.test(t.body)).map((t) => ({ ...t, body: t.body.replace(/^\w+\s*/, '') })),
    ...liquidOutputs(text).map((o) => ({ ...o, output: true })),
  ];
  for (const e of exprs) {
    const body = stripStrings(e.body);
    const { root, filters } = chainOf(e.body);
    for (const f of filters) {
      if (!LIQUID_FILTERS.has(f)) err(file, `line ${lineOf(text, e.index)}: filter "${f}" is not in the portable filter list`);
    }
    // Kenso's validator parses Liquid with Scriban, which fails on a negative first argument followed by more (slice: -3, 3).
    const negative = body.match(/\|\s*([a-z_][a-z0-9_]*)\s*:\s*-\s*\d[\d.]*\s*,/i)?.[1];
    if (negative) err(file, `line ${lineOf(text, e.index)}: ${negative} takes a negative first argument and more after it, which Kenso's Liquid parse rejects; use a start of 0 or more, like | plus: 1000 | slice: 1, 3 for the last three digits`);
    // The edge escapes every {{ }} output again, so the <br /> that newline_to_br adds shows as text unless the output ends in raw.
    if (e.output && (filters.includes('newline_to_br') || withBr.has(root)) && filters.at(-1) !== 'raw') {
      err(file, `line ${lineOf(text, e.index)}: newline_to_br output is escaped at render, so <br /> shows as text; end it with | raw after | escape`);
    }
    // raw turns that escape off, so the value has to be escaped before it: in this chain, or in the assign that built the local.
    if (e.output && filters.at(-1) === 'raw' && !escapes(filters) && !escaped.has(root)) {
      err(file, `line ${lineOf(text, e.index)}: | raw prints the value unescaped; put | escape earlier in the chain, or print a local assigned from an escaped value`);
    }
    // A published page or preview gets account.name, domain, industry and size_band only (ken-backend EdgeAccountV1).
    const recipeOnly = body.match(/(?<![\w.])account\.(signals|dossier)\b/)?.[1];
    if (recipeOnly) err(file, `line ${lineOf(text, e.index)}: account.${recipeOnly} is empty on a published page and in previews, which carry only account name, domain, industry and size_band; ${recipeOnly === 'signals' ? 'bind account.signals to an array data.* slot in the recipe and loop over that slot' : 'bind the field to a data.* slot in the recipe and print that slot'}`);
    const roots = [...body.replace(/\|\s*[a-z_][a-z0-9_]*(\s*:)?/g, ' ').matchAll(/(?<![\w.'"-])([a-z_][\w]*)(?=[.\[\s,)]|$)/gi)].map((m) => m[1]);
    for (const r of roots) {
      if (['and', 'or', 'contains', 'in', 'limit', 'offset', 'reversed', 'true', 'false', 'nil', 'null', 'empty', 'blank', 'with', 'as', 'else'].includes(r)) continue;
      if (r === 'data' && !allowData) err(file, `line ${lineOf(text, e.index)}: fallback Liquid may not read data.*; use Kenso variables only`);
      if (!KEN_ROOTS.includes(r) && !locals.has(r)) warn(file, `line ${lineOf(text, e.index)}: variable "${r}" is not a Kenso variable or a local`);
    }
  }
}

function attr(tag, name) {
  return tag.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'))?.slice(2).find((v) => v !== undefined);
}

function hostOf(url) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function scanHtml(text, file, { err }) {
  const plain = text.replace(/\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g, '');
  for (const m of plain.matchAll(/<script\b[^>]*>/gi)) {
    const src = attr(m[0], 'src');
    // Only Kenso's own scripts run inline (csp-inline-script, ken-backend DEV-3699). A JSON data block never runs.
    const dataBlock = ['application/json', 'application/ld+json'].includes((attr(m[0], 'type') ?? '').trim().toLowerCase());
    if (src === undefined && !dataBlock) {
      err(file, `line ${lineOf(plain, m.index)}: inline <script> is not allowed; Studio pages run only Kenso's scripts. Use the kit, CSS or Alpine directives`);
    }
    if (src !== undefined && !scriptAllowed(src)) {
      err(file, `line ${lineOf(plain, m.index)}: script src "${src}" is not on the CDN allow-list (${SCRIPT_CDNS.join(', ')})`);
    }
  }
  for (const m of plain.matchAll(/<iframe\b[^>]*>/gi)) {
    const src = attr(m[0], 'src') ?? '';
    const host = hostOf(src);
    if (!src.startsWith('https://') || !host || !FRAME_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) {
      err(file, `line ${lineOf(plain, m.index)}: iframe src "${src}" is not on the booking/video allow-list; use {% render 'ken/booking' %} for booking`);
    }
  }
  for (const m of plain.matchAll(/<form\b/gi)) err(file, `line ${lineOf(plain, m.index)}: forms only through {% render 'ken/form' %}`);
  for (const m of plain.matchAll(/<input\b[^>]*>/gi)) {
    const type = (attr(m[0], 'type') ?? '').toLowerCase();
    const auto = (attr(m[0], 'autocomplete') ?? '').toLowerCase();
    const name = `${attr(m[0], 'name') ?? ''} ${attr(m[0], 'id') ?? ''}`.toLowerCase();
    if (type === 'password' || auto.startsWith('cc-') || /(card|ccnum|cvv|cvc|ssn|passport|national.?id|tax.?id|iban)/.test(name)) {
      err(file, `line ${lineOf(plain, m.index)}: password, card and ID-number inputs are not allowed`);
    }
  }
  for (const m of plain.matchAll(/<img\b[^>]*>/gi)) {
    const src = (attr(m[0], 'src') ?? '').trim();
    if (!/^(\{\{-?\s*(asset_url|brand\.logo_url)\b|data:)/.test(src)) {
      err(file, `line ${lineOf(plain, m.index)}: image src "${src}" must come from {{ asset_url }}/..., brand.logo_url or a data: URI`);
    }
  }
  for (const m of plain.matchAll(/<link\b[^>]*>/gi)) {
    const href = attr(m[0], 'href') ?? '';
    if (!STYLE_HOSTS.some((h) => href.startsWith(h)) && !/^\{\{-?\s*asset_url\b/.test(href)) {
      err(file, `line ${lineOf(plain, m.index)}: link href "${href}" must be Google Fonts or {{ asset_url }}`);
    }
  }
  for (const m of plain.matchAll(/url\(\s*['"]?(https?:[^'")]+)/gi)) {
    if (!STYLE_HOSTS.some((h) => m[1].startsWith(h)) && !m[1].startsWith('https://fonts.gstatic.com/')) {
      err(file, `line ${lineOf(plain, m.index)}: CSS url(${m[1]}) loads from outside Kenso; use {{ asset_url }}`);
    }
  }
  for (const m of plain.matchAll(/javascript:/gi)) err(file, `line ${lineOf(plain, m.index)}: javascript: URLs are not allowed`);
  for (const m of plain.matchAll(/<[a-z][^>]*\son[a-z]+\s*=/gi)) err(file, `line ${lineOf(plain, m.index)}: inline on* handlers are not allowed; use the kit or Alpine directives`);
}

// The edge renders a doc's Liquid output as HTML, with no Markdown step. A doc is therefore written as HTML blocks
// only: every body line starts with a tag or a Liquid tag. CommonMark passes such a document through unchanged.
function markdownSyntax(text, file, { err }) {
  const body = text.replace(/<(style|script)\b[\s\S]*?<\/\1>/gi, (m) => m.replace(/[^\n]/g, ''));
  body.split('\n').forEach((line, i) => {
    if (/^\s*(#{1,6}\s|\*\*|[-*+]\s|\d+\.\s|>\s)/.test(line)) err(file, `line ${i + 1}: Markdown syntax in a doc; the edge renders HTML, so write it as an HTML element`);
    else if (/^\S/.test(line) && !/^\s*(<|\{[{%])/.test(line)) err(file, `line ${i + 1}: text outside an HTML element; start every line of a doc with a tag`);
    else if (/^ {4,}\S/.test(line)) err(file, `line ${i + 1}: four-space indent turns into a code block under Markdown; do not indent doc lines`);
  });
}

function sectionIds(text) {
  return [...text.matchAll(/data-section\s*=\s*["']([^"']+)["']/g)].map((m) => m[1]);
}

// --- Library template ------------------------------------------------------------------------

const isDate = (v) => {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
};
const shouts = (s) => DASHES.test(s) || s.includes('!');

// Width and height from a PNG's IHDR chunk, or null when the file is not a PNG.
function pngSize(file) {
  const head = fs.readFileSync(file).subarray(0, 24);
  if (head.length < 24 || !head.subarray(0, 8).equals(PNG_SIGNATURE) || head.toString('latin1', 12, 16) !== 'IHDR') return null;
  return { width: head.readUInt32BE(16), height: head.readUInt32BE(20) };
}

// library.json, the listed samples and preview/ (README "The library").
function checkLibrary(slug, dir, { err }) {
  const lib = readJson(path.join(dir, 'library.json'), err, 'library.json');
  if (!lib || typeof lib !== 'object' || Array.isArray(lib)) {
    if (lib) err('library.json', 'must be an object');
    return;
  }
  const bad = (msg) => err('library.json', msg);
  for (const k of Object.keys(lib)) if (!LIBRARY_FIELDS.includes(k)) bad(`unknown field "${k}"`);
  if (typeof lib.description !== 'string' || !lib.description.trim()) bad('description must be a non-empty string');
  else if (shouts(lib.description)) bad('description has an em or en dash or an exclamation mark');
  if (!CATEGORIES.includes(lib.category)) bad(`category must be one of ${CATEGORIES.join(', ')}`);
  if (!Array.isArray(lib.tags) || lib.tags.length > 6 || lib.tags.some((t) => typeof t !== 'string' || !t.trim() || t.length > 32)) bad('tags must be a list of 0 to 6 strings of at most 32 characters');
  if (typeof lib.featured !== 'boolean') bad('featured must be true or false');
  if (!Array.isArray(lib.needs) || lib.needs.some((n) => !NEEDS.includes(n)) || new Set(lib.needs).size !== lib.needs.length) bad(`needs must be a list of distinct values from ${NEEDS.join(', ')}; empty means ready to use`);
  if (typeof lib.version !== 'string' || !/^\d+\.\d+\.\d+$/.test(lib.version)) bad('version must be semver like 1.0.0');
  if (!isDate(lib.updatedAt)) bad('updatedAt must be a real date as YYYY-MM-DD');
  if (!Array.isArray(lib.samples) || lib.samples.length < 3) bad('samples must list at least 3 samples as {id, label}');

  const samplesDir = path.join(dir, 'samples');
  const listed = new Set();
  let personNull = false;
  for (const [i, s] of (Array.isArray(lib.samples) ? lib.samples : []).entries()) {
    const where = `samples[${i}]`;
    if (!s || typeof s.id !== 'string' || !/^[a-z0-9-]+$/.test(s.id)) {
      bad(`${where}: id must match ^[a-z0-9-]+$`);
      continue;
    }
    if (listed.has(s.id)) bad(`${where}: duplicate id "${s.id}"`);
    listed.add(s.id);
    for (const k of Object.keys(s)) if (!['id', 'label'].includes(k)) bad(`${where}: unknown field "${k}"`);
    if (typeof s.label !== 'string' || !s.label.trim()) bad(`${where}: label is required`);
    else if (shouts(s.label)) bad(`${where}: label has an em or en dash or an exclamation mark`);
    const file = path.join(samplesDir, `${s.id}.json`);
    if (!fs.existsSync(file)) bad(`${where}: samples/${s.id}.json does not exist`);
    else {
      let sample = null;
      try {
        sample = JSON.parse(fs.readFileSync(file, 'utf8'));
      } catch {
        // checkBundle reports the invalid JSON.
      }
      if (sample?.person === null) personNull = true;
      // The cover is the first sample's first screen, and the Library shows it in the template's default brand.
      if (i === 0 && (sample?.brand?.colors || sample?.brand?.fonts)) bad(`${where}: the cover comes from the first sample, so list a sample in the default brand first (brand.colors and brand.fonts null)`);
    }
  }
  // Non-JSON files next to the samples (a dataset CSV) are data, not samples.
  for (const f of fs.existsSync(samplesDir) ? fs.readdirSync(samplesDir) : []) {
    if (f.endsWith('.json') && !listed.has(f.slice(0, -5))) err(`samples/${f}`, 'not listed in library.json samples; list it or delete it');
  }
  if (listed.size && !personNull) bad('no listed sample has "person": null; add one for the shared link');

  const preview = path.join(dir, 'preview');
  const cover = path.join(preview, 'cover.png');
  // A try, not throwIfNoEntry: Node 20 still throws ENOTDIR when preview is a file.
  const stat = (f) => {
    try {
      return fs.statSync(f);
    } catch {
      return null;
    }
  };
  const isFile = (f) => stat(f)?.isFile() ?? false;
  if (!isFile(cover)) err('preview/cover.png', `missing; run npm run render -- ${slug}`);
  else {
    const size = pngSize(cover);
    const bytes = fs.statSync(cover).size;
    if (!size) err('preview/cover.png', 'not a PNG');
    else if (size.width !== COVER.width || size.height !== COVER.height) err('preview/cover.png', `${size.width}x${size.height}, must be ${COVER.width}x${COVER.height}`);
    if (bytes > COVER.bytes) err('preview/cover.png', `${Math.ceil(bytes / 1024)} KB, over ${COVER.bytes / 1024} KB`);
  }
  for (const id of listed) if (!isFile(path.join(preview, `${id}.html`))) err(`preview/${id}.html`, `missing; run npm run render -- ${slug}`);
  for (const name of stat(preview)?.isDirectory() ? fs.readdirSync(preview) : []) {
    if (name !== 'cover.png' && !(name.endsWith('.html') && listed.has(name.slice(0, -5)))) {
      err(`preview/${name}`, 'unexpected file; preview/ holds cover.png and one <sampleId>.html per listed sample');
    }
  }
}

// --- the plan --------------------------------------------------------------------------------

// brief.md and ideas.md (README "The plan"). The builder's Plan page and Brief step show them, and a fork copies both.
// Dashes are caught by the text rules in checkBundle, which cover every .md file.
function checkPlan(slug, dir, m, { err }) {
  const lines = (name) => {
    const file = path.join(dir, name);
    if (fs.existsSync(file)) return fs.readFileSync(file, 'utf8').split('\n');
    err(name, 'missing; every template ships its plan, brief.md and ideas.md (README "The plan")');
    return null;
  };

  const brief = lines('brief.md');
  if (brief) {
    if (brief[0] !== `# ${m.name}`) err('brief.md', `line 1 must be "# ${m.name}", the studio.json name`);
    const typeLine = `Type: ${m.type} · Format: ${m.format} · Library template: ${slug}`;
    if (brief[1] !== typeLine) err('brief.md', `line 2 must be "${typeLine}"`);
    const headings = brief.filter((l) => l.startsWith('## ')).map((l) => l.slice(3));
    if (headings.at(-1) === 'Open questions') headings.pop();
    if (headings.join('\n') !== BRIEF_HEADINGS.join('\n')) err('brief.md', `headings must be ${BRIEF_HEADINGS.map((h) => `## ${h}`).join(', ')} in that order, then an optional ## Open questions`);
    const start = brief.indexOf('## Sections');
    if (start >= 0) {
      const end = brief.findIndex((l, i) => i > start && l.startsWith('## '));
      const listed = brief.slice(start + 1, end < 0 ? undefined : end).filter((l) => /^\d+\.\s/.test(l));
      const sections = Array.isArray(m.sections) ? m.sections : [];
      if (listed.length !== sections.length) err('brief.md', `## Sections has ${listed.length} numbered lines, studio.json has ${sections.length} sections; list each one, in order`);
      sections.forEach((s, i) => {
        const want = `${i + 1}. ${s?.label}`;
        const line = listed[i];
        if (line !== undefined && line !== want && !line.startsWith(`${want} `)) err('brief.md', `## Sections line ${i + 1} must start with "${want}", the label of section "${s?.id}"`);
      });
    }
  }

  const ideas = lines('ideas.md');
  if (ideas) {
    if (ideas[0] !== '# Ideas') err('ideas.md', 'line 1 must be "# Ideas"');
    const heads = ideas.flatMap((l, i) => (l.startsWith('## ') ? [i] : []));
    if (heads.length !== 3 || heads.some((at, k) => !new RegExp(`^## ${k + 1}\\. \\S`).test(ideas[at]))) err('ideas.md', 'must hold exactly three ideas, headed "## 1. ", "## 2. " and "## 3. " with a title');
    heads.forEach((at, k) => {
      const body = ideas.slice(at + 1, heads[k + 1]);
      const value = (field) => body.find((l) => l.startsWith(`${field}: `))?.slice(field.length + 2).trim();
      if (value('Starts from') !== slug) err('ideas.md', `idea ${k + 1} needs a "Starts from: ${slug}" line`);
      for (const field of ['Fills', 'Why it gets a reply']) if (!value(field)) err('ideas.md', `idea ${k + 1} needs a "${field}: ..." line`);
    });
  }
}

// --- bundle ----------------------------------------------------------------------------------

function checkBundle(slug, indexEntry) {
  const dir = path.join(STARTERS, slug);
  const c = bundleChecker(slug);
  const { err, warn } = c;
  // A Library template also holds library.json and preview/. Neither is part of the bundle a workspace forks.
  const isLibrary = fs.existsSync(path.join(dir, 'library.json'));
  for (const name of fs.readdirSync(dir)) {
    if (isLibrary && (name === 'library.json' || name === 'preview')) continue;
    if (!BUNDLE_FILES.has(name)) err(name, 'unexpected file; a bundle holds studio.json, template.liquid, fallback.liquid, README.md, brief.md, ideas.md, assets/ and samples/');
  }
  if (isLibrary) checkLibrary(slug, dir, c);

  const manifestPath = path.join(dir, 'studio.json');
  if (!fs.existsSync(manifestPath)) {
    err('studio.json', 'missing');
    return c;
  }
  const m = readJson(manifestPath, err, 'studio.json');
  if (!m) return c;

  if (m.kenStudio !== '1') err('studio.json', 'kenStudio must be "1"');
  if (typeof m.name !== 'string' || !m.name.trim()) err('studio.json', 'name is required');
  if (!TYPES.includes(m.type)) err('studio.json', `type must be one of ${TYPES.join(', ')}`);
  if (!FORMATS.includes(m.format)) err('studio.json', `format must be one of ${FORMATS.join(', ')}`);
  if (typeof m.slug !== 'string' || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(m.slug) || m.slug.length > 60) err('studio.json', 'slug must be lowercase words joined by hyphens, at most 60 characters');
  for (const k of Object.keys(m)) if (!['kenStudio', 'name', 'type', 'format', 'slug', 'slots', 'recipe', 'sections', 'cta'].includes(k)) err('studio.json', `unknown manifest key "${k}"`);
  // cta is optional: the validator accepts it and the renderer ignores it (README). Only its shape is checked.
  if (m.cta !== undefined && (m.cta === null || typeof m.cta !== 'object' || Array.isArray(m.cta))) err('studio.json', 'cta, when present, must be an object');

  const hasFallbackLiquid = fs.existsSync(path.join(dir, 'fallback.liquid'));
  const slots = m.slots;
  const props = slots?.properties ?? {};
  if (!slots || slots.type !== 'object' || !slots.properties) err('studio.json', 'slots must be {"type": "object", "properties": {...}}');
  else checkSchema(slots, 'slots', err);
  for (const r of slots?.required ?? []) {
    if (props[r] && !('fallback' in props[r]) && !hasFallbackLiquid) err('studio.json', `required slot "${r}" needs a fallback, or the bundle needs fallback.liquid`);
  }
  // Kenso checks every fallback against its own slot (ken-backend slot-fallback-invalid). A Liquid string renders first,
  // so only its type is checked; a null or blank fallback is no value.
  for (const [name, s] of Object.entries(props)) {
    if (!('fallback' in s)) continue;
    const fb = s.fallback;
    if (typeof fb === 'string' && /\{[{%]/.test(fb)) {
      if (/\{[{%][^}]*\bdata\b/.test(fb)) err('studio.json', `slot "${name}" fallback reads data.*; fallbacks use Kenso variables only`);
      if (s.type && s.type !== 'string') err('studio.json', `slot "${name}" fallback is a Liquid string but the slot is type ${s.type}; use a static JSON fallback`);
      continue;
    }
    if (stringsIn(fb).some((x) => /\{[{%]/.test(x))) err('studio.json', `slot "${name}" static fallback contains Liquid; only a string fallback is rendered`);
    if (absent(fb)) continue;
    for (const p of validateValue(s, fb, `slots.${name}.fallback`)) err('studio.json', `slot "${name}" fallback does not fit its slot: ${p}`);
  }

  // recipe
  const ids = new Set();
  const filled = new Set();
  const slotOf = (target) => target.match(/^data\.([a-zA-Z0-9_]+)/)?.[1];
  // defaults.<slot> (ken-backend DEV-5800) holds a slot's fallback as the page renders it, so it names a slot with one.
  const defaultsProblem = (ref) => {
    const s = String(ref).match(/^defaults\.([a-zA-Z0-9_]+)/)?.[1];
    if (!s) return `"${ref}" must be defaults.<slot>`;
    if (!props[s]) return `"${ref}" reads slot "${s}", which is not a declared slot`;
    if (!('fallback' in props[s])) return `"${ref}" reads slot "${s}", which has no fallback, so defaults.${s} is always empty`;
    return null;
  };
  if (!Array.isArray(m.recipe) || m.recipe.length === 0) err('studio.json', 'recipe must be a non-empty array');
  for (const [i, step] of (m.recipe ?? []).entries()) {
    const where = `recipe[${i}]${step?.id ? ` (${step.id})` : ''}`;
    if (!step || typeof step.id !== 'string' || !step.id) {
      err('studio.json', `${where}: id is required`);
      continue;
    }
    if (ids.has(step.id)) err('studio.json', `${where}: duplicate id`);
    ids.add(step.id);
    const spec = STEP_FIELDS[step.kind];
    if (!spec) {
      err('studio.json', `${where}: unknown kind "${step.kind}"`);
      continue;
    }
    for (const f of spec.required) if (step[f] === undefined) err('studio.json', `${where}: ${step.kind} needs "${f}"`);
    // Recipe text renders output tags only (StudioRecipeText in ken-backend): a {% %} tag fails the step when it runs.
    for (const f of ['prompt', 'rubric', 'args', 'where']) {
      if (step[f] !== undefined && stringsIn(step[f]).some((x) => x.includes('{%'))) err('studio.json', `${where}: ${f} uses a {% %} tag; recipe text supports output tags like {{ data.x | default: 'text' }} only`);
      // A fill starts with data empty, so an output tag reads only slots that earlier steps write.
      for (const o of liquidOutputs(stringsIn(step[f] ?? []).join('\n'))) {
        const body = stripStrings(o.body);
        for (const ref of body.matchAll(/(?<![\w.])data\.([a-zA-Z0-9_]+)/g)) {
          if (props[ref[1]] && !filled.has(ref[1])) err('studio.json', `${where}: ${f} reads data.${ref[1]}, which no earlier step writes, so the step sees nothing${'fallback' in props[ref[1]] ? `; read the slot's fallback as {{ defaults.${ref[1]} }}` : ''}`);
        }
        for (const ref of body.matchAll(/(?<![\w.])defaults(\.[a-zA-Z0-9_]+)?/g)) {
          const problem = defaultsProblem(ref[0]);
          if (problem) err('studio.json', `${where}: ${f} ${problem}`);
        }
      }
    }
    for (const f of Object.keys(step)) if (!['id', 'kind', ...spec.required, ...spec.optional].includes(f)) err('studio.json', `${where}: unknown field "${f}" for ${step.kind}`);
    if ('requires' in step && step.kind !== 'bind') {
      if (!Array.isArray(step.requires) || step.requires.some((r) => typeof r !== 'string')) err('studio.json', `${where}: requires must be an array of data.<slot> paths`);
      else {
        for (const r of step.requires) {
          const s = r.match(/^data\.([A-Za-z0-9_]+)$/)?.[1];
          if (!s) err('studio.json', `${where}: requires "${r}", which is not a data.<slot> path`);
          else if (!props[s]) err('studio.json', `${where}: requires "${r}", which is not a declared slot`);
          else if (!filled.has(s)) err('studio.json', `${where}: requires "${r}", which no earlier step writes`);
        }
      }
    }
    if ('to' in step) {
      const targets = Array.isArray(step.to) ? step.to : [step.to];
      for (const t of targets) {
        if (typeof t !== 'string' || !slotOf(t)) err('studio.json', `${where}: to "${t}" must be data.<slot>`);
        else if (!props[slotOf(t)]) err('studio.json', `${where}: to "${t}" is not a declared slot`);
        else filled.add(slotOf(t));
      }
    }
    if (step.kind === 'bind' && !BIND_FROM.some((p) => String(step.from).startsWith(p))) err('studio.json', `${where}: bind from must start with ${BIND_FROM.join(', ')}`);
    if (step.kind === 'bind' && String(step.from).startsWith('defaults.') && defaultsProblem(step.from)) err('studio.json', `${where}: bind from ${defaultsProblem(step.from)}`);
    // Knowledge is two lists of {citationId, kind, title, text}; a prompt pulls named fields out of them.
    for (const ref of [step.kind === 'bind' ? step.from : null, ...(step.kind === 'prompt' ? step.inputs ?? [] : [])]) {
      if (/^knowledge\./.test(String(ref)) && !/^knowledge\.(stable|scoped)$/.test(ref)) warn('studio.json', `${where}: "${ref}" is not Knowledge; it holds only knowledge.stable and knowledge.scoped, so extract fields with a prompt over them`);
    }
    if (step.kind === 'tool' && !TOOLS.includes(step.tool)) err('studio.json', `${where}: tool must be one of ${TOOLS.join(', ')}`);
    // A tool gets a value only from an arg that is exactly one output tag (ken-backend StudioRecipeText.TryPassThrough);
    // a bare path reaches it as that text. chart.data's from is the one arg that takes a path.
    if (step.kind === 'tool') {
      for (const [arg, text] of argStrings(step.args)) {
        if (step.tool === 'chart.data' && arg === 'from') continue;
        if (VARIABLE_PATH.test(text)) err('studio.json', `${where}: args.${arg} is the bare path "${text.trim()}", which reaches the tool as that text; write "{{ ${text.trim()} }}" to pass its value`);
      }
    }
    if (step.kind === 'prompt') {
      for (const input of step.inputs ?? []) {
        const s = slotOf(input);
        const root = String(input).split('.')[0];
        if (s && !(filled.has(s) && props[s])) err('studio.json', `${where}: input "${input}" is not filled by an earlier step${props[s] && 'fallback' in props[s] ? `; read the slot's fallback as "defaults.${s}"` : ''}`);
        if (root === 'defaults') {
          const problem = defaultsProblem(input);
          if (problem) err('studio.json', `${where}: input ${problem}`);
        } else if (!s && !KEN_ROOTS.includes(root) && !String(input).startsWith('knowledge.')) err('studio.json', `${where}: input "${input}" is not a Kenso variable, knowledge.*, defaults.<slot> or data.<slot>`);
      }
      if ((step.to && (Array.isArray(step.to) ? step.to : [step.to]).some((t) => !slotOf(t)))) err('studio.json', `${where}: prompt writes only data.*`);
    }
    if (step.kind === 'grade') {
      for (const on of step.on ?? []) if (!props[slotOf(on)] || !filled.has(slotOf(on))) err('studio.json', `${where}: grades "${on}", which no earlier step fills`);
      if ('retries' in step && !(Number.isInteger(step.retries) && step.retries >= 0)) err('studio.json', `${where}: retries must be a non-negative integer`);
      if ('pass_score' in step && !(typeof step.pass_score === 'number' && step.pass_score >= 0 && step.pass_score <= 10)) err('studio.json', `${where}: pass_score is 0 to 10`);
      if ('checks' in step) {
        const c = step.checks;
        const words = (v, max, len) => Array.isArray(v) && v.length <= max && v.every((w) => typeof w === 'string' && w.trim() && w.trim().length <= len);
        if (!c || typeof c !== 'object' || Array.isArray(c)) err('studio.json', `${where}: checks must be an object`);
        else {
          for (const [k, v] of Object.entries(c)) {
            if (k === 'banned') { if (!words(v, 100, 80)) err('studio.json', `${where}: checks.banned is at most 100 words or phrases of at most 80 characters`); }
            else if (k === 'skip') { if (!words(v, 50, Infinity)) err('studio.json', `${where}: checks.skip is at most 50 field names`); }
            else if (!GRADE_CHECKS.includes(k)) err('studio.json', `${where}: checks.${k} is not a check`);
            else if (typeof v !== 'boolean') err('studio.json', `${where}: checks.${k} must be true or false`);
          }
        }
      }
    }
    if (step.kind === 'webhook') {
      if (!/^https:\/\//.test(step.url)) err('studio.json', `${where}: webhook url must be https`);
      if ('timeout_s' in step && !(step.timeout_s > 0 && step.timeout_s <= 30)) err('studio.json', `${where}: timeout_s is at most 30`);
      if (step.headers && Object.values(step.headers).some((v) => typeof v !== 'string')) err('studio.json', `${where}: headers are static strings`);
    }
    if (step.kind === 'dataset') {
      for (const w of step.where ?? []) {
        if (!w.column || !['eq', 'in', 'between'].includes(w.op)) err('studio.json', `${where}: where needs {column, op: eq|in|between, value}`);
      }
      if ('limit' in step && !(Number.isInteger(step.limit) && step.limit > 0)) err('studio.json', `${where}: limit must be a positive integer`);
    }
  }

  // sections
  const declared = (m.sections ?? []).map((s) => s?.id);
  if (!Array.isArray(m.sections) || !m.sections.length) err('studio.json', 'sections must be a non-empty array of {id, label}');
  for (const s of m.sections ?? []) {
    if (!s?.id || !/^[a-z0-9_-]+$/.test(s.id) || !s.label) err('studio.json', `section ${JSON.stringify(s)} needs a lowercase id and a label`);
  }
  if (new Set(declared).size !== declared.length) err('studio.json', 'section ids must be unique');

  checkPlan(slug, dir, m, c);

  // templates
  const templatePath = path.join(dir, 'template.liquid');
  if (!fs.existsSync(templatePath)) err('template.liquid', 'missing');
  else {
    const text = fs.readFileSync(templatePath, 'utf8');
    if (Buffer.byteLength(text) > LIMITS.template) err('template.liquid', `over ${LIMITS.template} bytes`);
    const found = sectionIds(text);
    for (const id of found) if (!declared.includes(id)) err('template.liquid', `data-section="${id}" is not in studio.json sections`);
    for (const id of declared) if (!found.includes(id)) err('template.liquid', `section "${id}" has no data-section="${id}" element`);
    if (new Set(found).size !== found.length) err('template.liquid', 'a data-section id appears more than once');
    scanLiquid(text, 'template.liquid', c, { allowData: true });
    scanHtml(text, 'template.liquid', c);
    if (!/<\/body>/i.test(text)) err('template.liquid', 'the template is a full HTML document with </body> (Kenso injects the tracking script before it)');
    if (m.format === 'doc') markdownSyntax(text, 'template.liquid', c);
    for (const ref of text.matchAll(/data\.([a-zA-Z0-9_]+)/g)) if (!props[ref[1]]) err('template.liquid', `line ${lineOf(text, ref.index)}: data.${ref[1]} is not a declared slot`);
  }
  if (hasFallbackLiquid) {
    const text = fs.readFileSync(path.join(dir, 'fallback.liquid'), 'utf8');
    for (const id of sectionIds(text)) if (!declared.includes(id)) err('fallback.liquid', `data-section="${id}" is not in studio.json sections`);
    scanLiquid(text, 'fallback.liquid', c, { allowData: false });
    scanHtml(text, 'fallback.liquid', c);
    if (!/<\/body>/i.test(text)) err('fallback.liquid', 'the fallback is a full HTML document with </body>');
    if (m.format === 'doc') markdownSyntax(text, 'fallback.liquid', c);
  }

  // assets, sizes, text rules
  let total = 0;
  for (const file of walkFiles(dir)) {
    const rel = path.relative(dir, file);
    if (isLibrary && rel.startsWith(`preview${path.sep}`)) continue;
    const bytes = fs.statSync(file).size;
    total += bytes;
    if (rel.startsWith(`assets${path.sep}`)) {
      if (!ASSET_EXT.has(path.extname(file).toLowerCase())) err(rel, 'asset type must be an image, font, csv or pdf');
      if (bytes > LIMITS.asset) err(rel, `asset over ${LIMITS.asset} bytes`);
      if (file.endsWith('.svg') && /<script|\son[a-z]+\s*=/i.test(fs.readFileSync(file, 'utf8'))) err(rel, 'svg may not contain scripts or on* handlers');
    }
    if (/\.(json|liquid|md|csv|svg)$/.test(file)) {
      const text = fs.readFileSync(file, 'utf8');
      const line = text.split('\n').findIndex((l) => DASHES.test(l));
      if (line >= 0) err(rel, `line ${line + 1}: em or en dash; use a period or a comma`);
      if (/\.liquid$/.test(file) && /reverse[\s-]demo/i.test(text)) err(rel, 'never write "reverse demo" in page copy');
    }
  }
  if (total > LIMITS.bundle) err('.', `bundle is ${total} bytes, over ${LIMITS.bundle}`);

  // samples
  const samplesDir = path.join(dir, 'samples');
  const samples = fs.existsSync(samplesDir) ? fs.readdirSync(samplesDir).filter((f) => f.endsWith('.json')) : [];
  if (samples.length < 3) err('samples/', `needs at least 3 samples, found ${samples.length}`);
  for (const f of samples) {
    const label = `samples/${f}`;
    const s = readJson(path.join(samplesDir, f), err, label);
    if (!s) continue;
    for (const k of Object.keys(s)) if (!SAMPLE_KEYS.has(k)) err(label, `unknown key "${k}"; a sample is {account, person, sender, brand, data}, plus role and roles on a recruiting starter`);
    // A recruiting page belongs to one candidate and has no account (ken-backend DEV-3274); it reads role.* instead.
    if (m.type === 'recruiting') {
      if (!s.role?.title) err(label, 'role.title is required in a recruiting sample');
      if (s.roles !== undefined && !Array.isArray(s.roles)) err(label, 'roles must be a list of roles');
    } else if (!s.account?.name) err(label, 'account.name is required');
    if (!s.data || typeof s.data !== 'object') err(label, 'data is required');
    for (const k of Object.keys(s.data ?? {})) if (!props[k]) err(label, `data.${k} is not a declared slot`);
    for (const p of validateValue({ type: 'object', properties: props }, s.data ?? {}, 'data')) err(label, p);
    for (const r of slots?.required ?? []) if ((s.data?.[r] === undefined || s.data?.[r] === null) && !('fallback' in (props[r] ?? {}))) err(label, `data.${r} is required and has no slot fallback`);
    for (const str of stringsIn(s.data ?? {})) {
      if (EMAIL.test(str)) err(label, `data holds an email address: "${str.match(EMAIL)[0]}"`);
      if (PHONE.test(str)) err(label, `data holds a phone number: "${str.match(PHONE)[0]}"`);
      if (/\{\{|\{%|\[\[|\$\{/.test(str)) err(label, `data holds an unresolved variable: "${str.slice(0, 60)}"`);
    }
  }

  // index entry
  if (!indexEntry) err('index.json', `no entry for "${slug}"`);
  else {
    for (const k of ['slug', 'name', 'type', 'format', 'description', 'showcases', 'version']) if (indexEntry[k] === undefined) err('index.json', `entry "${slug}" needs "${k}"`);
    if (indexEntry.type !== m.type) err('index.json', `entry "${slug}" type ${indexEntry.type} does not match studio.json ${m.type}`);
    if (indexEntry.format !== m.format) err('index.json', `entry "${slug}" format ${indexEntry.format} does not match studio.json ${m.format}`);
    if (!Array.isArray(indexEntry.showcases)) err('index.json', `entry "${slug}" showcases must be an array`);
    if (typeof indexEntry.version !== 'string' || !/^\d+\.\d+\.\d+$/.test(indexEntry.version)) err('index.json', `entry "${slug}" version must be semver like 1.0.0`);
  }
  c.summary = `${Object.keys(props).length} slots, ${(m.recipe ?? []).length} steps, ${declared.length} sections, ${samples.length} samples, ${(total / 1024).toFixed(1)} KB`;
  return c;
}

// --- main ------------------------------------------------------------------------------------

const only = process.argv.slice(2);
const indexText = fs.readFileSync(path.join(ROOT, 'index.json'), 'utf8');
const index = JSON.parse(indexText);
const folders = fs.readdirSync(STARTERS, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
const listed = (index.starters ?? []).map((s) => s.slug);
const top = [];
if (index.kenStudio !== '1') top.push('index.json: kenStudio must be "1"');
for (const s of listed) if (!folders.includes(s)) top.push(`index.json: lists "${s}" but starters/${s} does not exist`);
for (const f of folders) if (!listed.includes(f)) top.push(`index.json: starters/${f} is not listed`);
if (new Set(listed).size !== listed.length) top.push('index.json: duplicate slugs');
if (DASHES.test(indexText)) top.push('index.json: em or en dash; use a period or a comma');
// A Library template's entry is generated, so once there is one, index.json must be exactly what build-index.mjs writes.
if (folders.some((f) => fs.existsSync(path.join(STARTERS, f, 'library.json')))) {
  try {
    const fresh = buildIndex(ROOT, indexText);
    if (fresh !== indexText) top.push(`index.json: stale (${staleEntries(indexText, fresh).join('; ')}); run npm run build-index`);
  } catch (e) {
    top.push(`index.json: build-index.mjs cannot build it: ${e.message}`);
  }
}
for (const t of top) console.log(`ERROR ${t}`);
errors += top.length;

for (const slug of folders.filter((f) => !only.length || only.includes(f))) {
  const c = checkBundle(slug, (index.starters ?? []).find((s) => s.slug === slug));
  const errs = c.issues.filter((i) => i.level === 'error');
  const warns = c.issues.filter((i) => i.level === 'warning');
  errors += errs.length;
  warnings += warns.length;
  console.log(`${errs.length ? 'FAIL' : 'OK  '} ${slug}${c.summary ? `  (${c.summary})` : ''}`);
  for (const i of [...errs, ...warns]) console.log(`     ${i.level === 'error' ? 'error  ' : 'warning'} ${i.file}: ${i.msg}`);
}
console.log(`\n${errors} error(s), ${warnings} warning(s)`);
process.exit(errors ? 1 : 0);
