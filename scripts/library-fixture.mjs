// A small Library template for the tests of check.mjs, build-index.mjs and render.mjs. Zero dependencies.
//
// writeLibrary(root) writes starters/demo-library/ under root: a bundle that passes check.mjs, with library.json,
// three samples (one with "person": null) and preview/ (a blank 1280x800 cover and placeholder sample pages).
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

export const SLUG = 'demo-library';

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'latin1');
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}

// A white 8-bit grayscale PNG. `padding` adds a tEXt chunk of that many bytes, for a file over the size limit.
export function png(width, height, padding = 0) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  const row = Buffer.concat([Buffer.from([0]), Buffer.alloc(width, 0xff)]);
  const pixels = zlib.deflateSync(Buffer.concat(Array.from({ length: height }, () => row)));
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    ...(padding ? [chunk('tEXt', Buffer.alloc(padding, 0x61))] : []),
    chunk('IDAT', pixels),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

export const STUDIO = {
  kenStudio: '1',
  name: 'Signals brief',
  type: 'report',
  format: 'page',
  slug: 'signals-brief',
  slots: {
    type: 'object',
    properties: {
      signals: {
        type: 'array',
        maxItems: 10,
        items: { type: 'object', properties: { type: { type: 'string' }, title: { type: 'string' }, date: { type: 'string' }, source_url: { type: 'string' } } },
      },
      market: { type: 'array', maxItems: 8, items: { type: 'object', properties: { label: { type: 'string' }, value: { type: 'number' } } } },
      headline: { type: 'string', maxLength: 90, fallback: 'A short brief for {{ account.name }}' },
    },
    required: ['headline'],
  },
  recipe: [
    { id: 'signals', kind: 'bind', from: 'account.signals', to: 'data.signals' },
    {
      id: 'market',
      kind: 'tool',
      tool: 'ken_search.count',
      args: { kind: 'companies', segments: [{ label: 'Same industry', filters: { industries: ['{{ account.industry }}'] } }] },
      to: 'data.market',
    },
    { id: 'headline', kind: 'prompt', prompt: 'Write a headline for {{ account.name }}.', inputs: ['account.name', 'data.signals'], to: 'data.headline' },
  ],
  sections: [
    { id: 'intro', label: 'Intro' },
    { id: 'market', label: 'Market' },
  ],
};

export const TEMPLATE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
{%- assign accent = brand.colors.primary | default: '#1f4e79' %}
<title>{{ account.name | escape }}</title>
<style>body{margin:0;font-family:system-ui,sans-serif;color:#1f2937}main{max-width:720px;margin:0 auto;padding:48px 24px}h1{color:{{ accent }}}</style>
</head>
<body>
<main>
<section data-section="intro">
<h1>{{ data.headline | escape }}</h1>
<p>Hi {{ person.first_name | default: 'there' | escape }}.</p>
{%- for s in data.signals %}
<p>{{ s.date | escape }}: {{ s.title | escape }}</p>
{%- endfor %}
</section>
<section data-section="market">
{% render 'ken/chart', type: 'bar', data: data.market, title: 'Companies like yours' %}
{% render 'ken/cta', label: 'Book 20 minutes', kind: 'booking' %}
</section>
</main>
</body>
</html>
`;

export const FALLBACK = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Brief</title></head>
<body><main><p>Fallback page for {{ account.name | escape }}</p></main></body>
</html>
`;

export const LIBRARY = {
  description: 'A one-page brief with the latest news on an account and a count of companies like it.',
  category: 'prospecting',
  tags: ['signals', 'market size'],
  featured: false,
  needs: [],
  version: '1.0.0',
  updatedAt: '2026-10-29',
  samples: [
    { id: 'acme', label: 'Acme, filled for one person' },
    { id: 'globex-shared', label: 'Globex, shared link' },
    { id: 'initech-partial', label: 'Initech, partial fill' },
  ],
};

const SENDER = { name: 'Dana Park', title: null, signature_html: null };
const DEFAULT_BRAND = { name: 'Paperwell', logo_url: null, colors: null, fonts: null };

export const SAMPLES = {
  acme: {
    account: { name: 'Acme Tools', domain: 'acme.example', industry: 'machinery' },
    person: { first_name: 'Lee', last_name: 'Ortiz', title: 'Head of Sales' },
    sender: SENDER,
    brand: DEFAULT_BRAND,
    data: {
      headline: 'What changed at Acme Tools this quarter',
      signals: [
        { type: 'funding', title: 'Raised a Series B', date: '2026-09-14', source_url: 'https://news.example/acme' },
        { type: 'hiring', title: 'Hiring 12 sales roles', date: '2026-08-02', source_url: 'https://jobs.example/acme' },
      ],
      market: [
        { label: 'Same industry', value: 1840 },
        { label: 'Same industry and size', value: 312 },
      ],
    },
  },
  'globex-shared': {
    account: { name: 'Globex', domain: 'globex.example', industry: 'logistics' },
    person: null,
    sender: SENDER,
    brand: { name: 'Paperwell', logo_url: null, colors: { primary: '#7a2e1c', secondary: '#6fb3b8' }, fonts: null },
    data: { headline: 'What changed at Globex this quarter', signals: [], market: [{ label: 'Same industry', value: 920 }] },
  },
  'initech-partial': {
    account: { name: 'Initech', domain: 'initech.example', industry: 'software' },
    person: { first_name: 'Sam', last_name: 'Reed', title: 'COO' },
    sender: SENDER,
    brand: DEFAULT_BRAND,
    data: { signals: [] },
  },
};

const json = (value) => `${JSON.stringify(value, null, 2)}\n`;

// Writes the bundle to <root>/starters/<slug>. Pass `studio`, `template` or `library` to write a variant.
export function writeLibrary(root, { slug = SLUG, studio = STUDIO, template = TEMPLATE, library = LIBRARY } = {}) {
  const dir = path.join(root, 'starters', slug);
  fs.mkdirSync(path.join(dir, 'samples'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'preview'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'studio.json'), json(studio));
  fs.writeFileSync(path.join(dir, 'template.liquid'), template);
  fs.writeFileSync(path.join(dir, 'fallback.liquid'), FALLBACK);
  fs.writeFileSync(path.join(dir, 'library.json'), json(library));
  for (const [id, sample] of Object.entries(SAMPLES)) {
    fs.writeFileSync(path.join(dir, 'samples', `${id}.json`), json(sample));
    fs.writeFileSync(path.join(dir, 'preview', `${id}.html`), `<!doctype html><title>${id}</title>\n`);
  }
  fs.writeFileSync(path.join(dir, 'preview', 'cover.png'), png(1280, 800));
  return dir;
}
