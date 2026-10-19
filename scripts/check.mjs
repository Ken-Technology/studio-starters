#!/usr/bin/env node
// Structural check for every bundle in starters/. Zero dependencies, Node 20+.
//
//   node scripts/check.mjs            check everything, exit 1 on any error
//   node scripts/check.mjs rd-doc     check one bundle (index.json is still checked)
//
// It covers the rules a static scan can prove. Ken's validator runs the full set (Liquid parse,
// filled-data rules, Web Risk) when a bundle is pushed; this script catches the common mistakes first.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const STARTERS = path.join(ROOT, 'starters');

const TYPES = ['reverse_demo', 'landing_page', 'audit', 'report', 'event', 'calculator', 'other'];
const FORMATS = ['page', 'doc'];
const SLOT_TYPES = ['string', 'number', 'integer', 'boolean', 'array', 'object'];
const SLOT_KEYWORDS = new Set(['type', 'properties', 'required', 'items', 'minLength', 'maxLength', 'minItems', 'maxItems', 'enum', 'format', 'fallback']);
const KEN_ROOTS = ['account', 'person', 'sender', 'brand', 'link', 'asset_url', 'data'];
const BIND_FROM = ['account.', 'person.', 'knowledge.'];
const TOOLS = ['ken_search.people', 'ken_search.companies', 'enrich.email', 'scrape.page', 'ken.copy', 'chart.data'];
// `requires` (ken-backend recipe-requires) is on every kind but bind: the step does not run while a listed slot is empty.
const STEP_FIELDS = {
  bind: { required: ['from', 'to'], optional: [] },
  tool: { required: ['tool', 'to'], optional: ['args', 'requires'] },
  prompt: { required: ['prompt', 'to'], optional: ['inputs', 'model', 'requires'] },
  grade: { required: ['rubric', 'on'], optional: ['retries', 'pass_score', 'requires', 'checks'] },
  webhook: { required: ['url', 'to'], optional: ['headers', 'timeout_s', 'requires'] },
  dataset: { required: ['dataset', 'to'], optional: ['where', 'limit', 'requires'] },
};
// A grade step's `checks` (ken-backend recipe-grade-checks): string rules Ken runs on the graded slots before the judge.
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
  'prepend', 'url_encode']);
const ASSET_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.woff', '.woff2', '.csv', '.pdf']);
const BUNDLE_FILES = new Set(['studio.json', 'template.liquid', 'fallback.liquid', 'README.md', 'assets', 'samples']);
const SAMPLE_KEYS = new Set(['account', 'person', 'sender', 'brand', 'data']);
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

// Validates a filled value against the subset. Returns a list of problems.
function validateValue(schema, value, where) {
  const out = [];
  if (value === null || value === undefined) return out;
  const t = schema.type;
  const actual = Array.isArray(value) ? 'array' : Number.isInteger(value) ? 'integer' : typeof value;
  const fits = t === actual || (t === 'number' && actual === 'integer');
  if (!fits) return [`${where}: expected ${t}, got ${actual}`];
  if (t === 'string') {
    if ('minLength' in schema && value.length < schema.minLength) out.push(`${where}: shorter than ${schema.minLength}`);
    if ('maxLength' in schema && value.length > schema.maxLength) out.push(`${where}: longer than ${schema.maxLength} (${value.length})`);
    if (schema.format === 'uri' && !/^https?:\/\/[^\s]+$/.test(value)) out.push(`${where}: not a URI`);
  }
  if (schema.enum && !schema.enum.includes(value)) out.push(`${where}: not one of ${schema.enum.join(', ')}`);
  if (t === 'array') {
    if ('minItems' in schema && value.length < schema.minItems) out.push(`${where}: fewer than ${schema.minItems} items`);
    if ('maxItems' in schema && value.length > schema.maxItems) out.push(`${where}: more than ${schema.maxItems} items`);
    if (schema.items) value.forEach((v, i) => out.push(...validateValue(schema.items, v, `${where}[${i}]`)));
  }
  if (t === 'object') {
    for (const r of schema.required ?? []) if (value[r] === undefined || value[r] === null) out.push(`${where}.${r}: required`);
    for (const [k, v] of Object.entries(value)) {
      if (schema.properties?.[k]) out.push(...validateValue(schema.properties[k], v, `${where}.${k}`));
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

function scanLiquid(text, file, { err, warn }, { allowData }) {
  const locals = new Set(['forloop']);
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
    if (name === 'render') {
      const partial = t.body.match(/^render\s+['"]([^'"]+)['"]/)?.[1];
      if (!KIT.includes(partial)) err(file, `line ${lineOf(text, t.index)}: render "${partial}" is not a kit snippet (${KIT.join(', ')})`);
    }
  }
  const exprs = [
    ...tags.filter((t) => !/^(render|comment|endcomment|raw|endraw)\b/.test(t.body)).map((t) => ({ ...t, body: t.body.replace(/^\w+\s*/, '') })),
    ...liquidOutputs(text),
  ];
  for (const e of exprs) {
    const body = stripStrings(e.body);
    for (const f of body.matchAll(/\|\s*([a-z_][a-z0-9_]*)/g)) {
      if (!LIQUID_FILTERS.has(f[1])) err(file, `line ${lineOf(text, e.index)}: filter "${f[1]}" is not in the portable filter list`);
    }
    const roots = [...body.replace(/\|\s*[a-z_][a-z0-9_]*(\s*:)?/g, ' ').matchAll(/(?<![\w.'"-])([a-z_][\w]*)(?=[.\[\s,)]|$)/gi)].map((m) => m[1]);
    for (const r of roots) {
      if (['and', 'or', 'contains', 'in', 'limit', 'offset', 'reversed', 'true', 'false', 'nil', 'null', 'empty', 'blank', 'with', 'as', 'else'].includes(r)) continue;
      if (r === 'data' && !allowData) err(file, `line ${lineOf(text, e.index)}: fallback Liquid may not read data.*; use Ken variables only`);
      if (!KEN_ROOTS.includes(r) && !locals.has(r)) warn(file, `line ${lineOf(text, e.index)}: variable "${r}" is not a Ken variable or a local`);
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
      err(file, `line ${lineOf(plain, m.index)}: CSS url(${m[1]}) loads from outside Ken; use {{ asset_url }}`);
    }
  }
  for (const m of plain.matchAll(/javascript:/gi)) err(file, `line ${lineOf(plain, m.index)}: javascript: URLs are not allowed`);
  for (const m of plain.matchAll(/<[a-z][^>]*\son[a-z]+\s*=/gi)) err(file, `line ${lineOf(plain, m.index)}: inline on* handlers are not allowed; use an inline <script> or Alpine directives`);
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

// --- bundle ----------------------------------------------------------------------------------

function checkBundle(slug, indexEntry) {
  const dir = path.join(STARTERS, slug);
  const c = bundleChecker(slug);
  const { err, warn } = c;
  for (const name of fs.readdirSync(dir)) if (!BUNDLE_FILES.has(name)) err(name, 'unexpected file; a bundle holds studio.json, template.liquid, fallback.liquid, README.md, assets/ and samples/');

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
  for (const [name, s] of Object.entries(props)) {
    if (!('fallback' in s)) continue;
    const fb = s.fallback;
    if (typeof fb === 'string') {
      if (/\{[{%][^}]*\bdata\b/.test(fb)) err('studio.json', `slot "${name}" fallback reads data.*; fallbacks use Ken variables only`);
    } else {
      if (stringsIn(fb).some((x) => /\{[{%]/.test(x))) err('studio.json', `slot "${name}" static fallback contains Liquid; only a string fallback is rendered`);
      for (const p of validateValue(s, fb, `slots.${name}.fallback`)) err('studio.json', p);
    }
  }

  // recipe
  const ids = new Set();
  const filled = new Set();
  const slotOf = (target) => target.match(/^data\.([a-zA-Z0-9_]+)/)?.[1];
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
    if (step.kind === 'tool' && !TOOLS.includes(step.tool)) err('studio.json', `${where}: tool must be one of ${TOOLS.join(', ')}`);
    if (step.kind === 'prompt') {
      for (const input of step.inputs ?? []) {
        const s = slotOf(input);
        if (s && !(filled.has(s) && props[s])) err('studio.json', `${where}: input "${input}" is not filled by an earlier step`);
        if (!s && !KEN_ROOTS.includes(String(input).split('.')[0]) && !String(input).startsWith('knowledge.')) err('studio.json', `${where}: input "${input}" is not a Ken variable or data.<slot>`);
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
    if (!/<\/body>/i.test(text)) err('template.liquid', 'the template is a full HTML document with </body> (Ken injects the tracking script before it)');
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
    for (const k of Object.keys(s)) if (!SAMPLE_KEYS.has(k)) err(label, `unknown key "${k}"; a sample is {account, person, sender, brand, data}`);
    if (!s.account?.name) err(label, 'account.name is required');
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
const index = JSON.parse(fs.readFileSync(path.join(ROOT, 'index.json'), 'utf8'));
const folders = fs.readdirSync(STARTERS, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
const listed = (index.starters ?? []).map((s) => s.slug);
const top = [];
if (index.kenStudio !== '1') top.push('index.json: kenStudio must be "1"');
for (const s of listed) if (!folders.includes(s)) top.push(`index.json: lists "${s}" but starters/${s} does not exist`);
for (const f of folders) if (!listed.includes(f)) top.push(`index.json: starters/${f} is not listed`);
if (new Set(listed).size !== listed.length) top.push('index.json: duplicate slugs');
if (DASHES.test(fs.readFileSync(path.join(ROOT, 'index.json'), 'utf8'))) top.push('index.json: em or en dash; use a period or a comma');
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
