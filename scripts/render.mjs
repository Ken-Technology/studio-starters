#!/usr/bin/env node
// Renders the previews of each Library template (a folder with library.json): preview/<sampleId>.html for every
// sample library.json lists, and preview/cover.png, the first screen of the first sample at 1280x800.
//
//   npm run render                          every Library template
//   npm run render -- <slug> [<slug>...]    the named ones
//   node scripts/render.mjs --html-only     the HTML only, no browser (CI renders it and compares)
//
// The HTML is the sample run through template.liquid with LiquidJS set up like the edge (ken-backend
// Ken.Redirector.Edge/src/studio/render.ts), and the kit snippets ported in scripts/kit/. A preview has no link:
// link.booking_url and link.page_url are "#", and asset_url is the bundle's assets/ folder on main. Same inputs, same bytes.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Liquid } from 'liquidjs';
import { renderBooking } from './kit/booking.mjs';
import { renderChart } from './kit/chart.mjs';
import { renderCta } from './kit/cta.mjs';
import { renderForm } from './kit/form.mjs';
import { escapeHtml } from './kit/html.mjs';

export const RAW_BASE = 'https://raw.githubusercontent.com/Ken-Technology/studio-starters/main/starters';
// The edge serves {{ asset_url }}/<path> from the bundle's assets/ folder (ken-backend Ken.Redirector.Edge/src/studio/paths.ts),
// so a preview's asset_url is that folder on main.
export const assetUrl = (slug) => `${RAW_BASE}/${slug}/assets`;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const COVER = { width: 1280, height: 800, bytes: 400 * 1024 };
const KIT = { cta: renderCta, chart: renderChart, booking: renderBooking, form: renderForm };
const UNRESOLVED_LIQUID = /\{\{|\{%/;

function stringifyOutput(value) {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.map(stringifyOutput).join('');
  return String(value);
}

// {{ }} output is HTML-escaped and keeps existing entities, so a template's own | escape is not escaped twice.
function escapeOutput(value) {
  return escapeHtml(stringifyOutput(value)).replace(/&amp;(#\d{1,7}|#x[0-9a-f]{1,6}|[a-z][a-z0-9]{1,31});/gi, '&$1;');
}

function engine(templates, outputEscape) {
  return new Liquid({
    ...(outputEscape ? { outputEscape } : {}),
    strictVariables: false,
    strictFilters: true,
    ownPropertyOnly: true,
    relativeReference: false,
    templates,
    timezoneOffset: 0,
    locale: 'en-US',
  });
}

// The edge also escapes {% echo %} and {% cycle %}. They are left out here because check.mjs rejects both tags.
// `{% render 'ken/chart', ... %}` resolves to a one-tag partial whose tag reads the render arguments and the Ken globals.
const pageEngine = engine(Object.fromEntries(Object.keys(KIT).map((name) => [`ken/${name}`, `{% ken_kit "${name}" %}`])), escapeOutput);
pageEngine.registerTag('ken_kit', {
  parse(token) {
    this.kit = token.args.trim().replace(/^["']|["']$/g, '');
  },
  render(context) {
    return KIT[this.kit]?.({ get: (p) => context.getSync([...p]) }) ?? '';
  },
});
// Slot fallbacks: Liquid over Ken variables only, not escaped here; the page escapes the slot where it prints it.
const textEngine = engine({});

function escapedKen(value) {
  if (typeof value === 'string') return escapeHtml(value);
  if (Array.isArray(value)) return value.map(escapedKen);
  if (value !== null && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, escapedKen(v)]));
  return value;
}

function present(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
}

function resolveFallback(fallback, ken) {
  if (typeof fallback !== 'string' || !UNRESOLVED_LIQUID.test(fallback)) return fallback;
  try {
    const output = textEngine.parseAndRenderSync(fallback, escapedKen(ken));
    return UNRESOLVED_LIQUID.test(output) ? '' : output;
  } catch {
    return '';
  }
}

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

// One sample as the page a person would see. Always template.liquid: fallback.liquid is for a failed fill, and a
// sample with "person": null is the shared link, not a failure. An empty slot takes its fallback, as on the edge.
export function renderSample({ slug, manifest, template }, sample) {
  const booking = '#';
  const ken = {
    account: sample.account,
    person: sample.person,
    sender: sample.sender,
    brand: sample.brand,
    link: { page_url: '#', booking_url: booking, refresh_url: null, pdf_url: null },
    asset_url: assetUrl(slug),
    ...(sample.role ? { role: { ...sample.role, booking_url: booking } } : {}),
    ...(sample.roles ? { roles: sample.roles.map((role) => ({ ...role, booking_url: booking })) } : {}),
  };
  const data = { ...sample.data };
  for (const [name, slot] of Object.entries(manifest.slots?.properties ?? {})) {
    if (present(data[name])) continue;
    if (Object.hasOwn(slot, 'fallback')) data[name] = resolveFallback(slot.fallback, ken);
    else delete data[name];
  }
  const scope = { ...ken, data, _ken: { link_id: 0, booking_inline: null, purpose: 'preview', preview: true, form_fields: null } };
  const html = pageEngine.renderSync(pageEngine.parse(template), scope, { globals: scope });
  if (UNRESOLVED_LIQUID.test(html)) throw new Error('the page holds unresolved Liquid ({{ or {%), which the edge would not serve');
  return html;
}

// Every listed sample of starters/<slug> under root, as [{id, html}] in library.json order.
export function renderHtml(root, slug) {
  const dir = path.join(root, 'starters', slug);
  const bundle = { slug, manifest: readJson(path.join(dir, 'studio.json')), template: fs.readFileSync(path.join(dir, 'template.liquid'), 'utf8') };
  const samples = readJson(path.join(dir, 'library.json')).samples ?? [];
  if (!samples.length) throw new Error('library.json lists no samples');
  return samples.map(({ id }) => {
    try {
      return { id, html: renderSample(bundle, readJson(path.join(dir, 'samples', `${id}.json`))) };
    } catch (e) {
      throw new Error(`samples/${id}.json: ${e.message}`);
    }
  });
}

// A 1280x800 screenshot of the page's first screen after fonts load and images settle, palette-compressed under 400 KB.
async function renderCover(dir, slug, html) {
  const { chromium } = await import('playwright');
  const { default: sharp } = await import('sharp');
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: COVER.width, height: COVER.height }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    // asset_url points at main, which does not have a new template's assets yet: serve them from its assets/ folder.
    const base = `${assetUrl(slug)}/`;
    const assets = path.join(dir, 'assets');
    await page.route((url) => url.href.startsWith(base), (route) => {
      const rel = decodeURIComponent(new URL(route.request().url()).pathname.slice(new URL(base).pathname.length));
      const file = path.resolve(assets, rel);
      if (!file.startsWith(`${assets}${path.sep}`) || !fs.existsSync(file)) return route.fulfill({ status: 404 });
      return route.fulfill({ path: file });
    });
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map((img) => img.complete || new Promise((done) => {
        img.addEventListener('load', done);
        img.addEventListener('error', done);
      })));
    });
    const shot = await page.screenshot({ type: 'png', animations: 'disabled' });
    for (const colours of [256, 128, 64, 32]) {
      const png = await sharp(shot).png({ palette: true, colours, effort: 10, compressionLevel: 9 }).toBuffer();
      if (png.length <= COVER.bytes) return png;
    }
    throw new Error(`cover.png stays over ${COVER.bytes / 1024} KB at 32 colours`);
  } finally {
    await browser.close();
  }
}

// Writes preview/ for starters/<slug>: one HTML page per listed sample and, unless htmlOnly, cover.png. Any other
// file in preview/ is removed, since check.mjs allows nothing else there.
export async function renderPreviews(root, slug, { htmlOnly = false } = {}) {
  const dir = path.join(root, 'starters', slug);
  const pages = renderHtml(root, slug);
  const preview = path.join(dir, 'preview');
  fs.mkdirSync(preview, { recursive: true });
  const keep = new Set(['cover.png', ...pages.map((p) => `${p.id}.html`)]);
  for (const name of fs.readdirSync(preview)) if (!keep.has(name)) fs.rmSync(path.join(preview, name), { recursive: true });
  for (const p of pages) fs.writeFileSync(path.join(preview, `${p.id}.html`), p.html);
  if (!htmlOnly) fs.writeFileSync(path.join(preview, 'cover.png'), await renderCover(dir, slug, pages[0].html));
  return pages.map((p) => p.id);
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const htmlOnly = args.includes('--html-only');
  const named = args.filter((a) => !a.startsWith('--'));
  const starters = path.join(ROOT, 'starters');
  const library = fs.readdirSync(starters).filter((f) => fs.existsSync(path.join(starters, f, 'library.json'))).sort();
  const unknown = named.filter((slug) => !library.includes(slug));
  if (unknown.length) {
    console.error(`not a Library template (no starters/<slug>/library.json): ${unknown.join(', ')}`);
    process.exit(1);
  }
  const slugs = named.length ? named : library;
  if (!slugs.length) console.log('no Library templates to render');
  let failed = 0;
  for (const slug of slugs) {
    try {
      const ids = await renderPreviews(ROOT, slug, { htmlOnly });
      console.log(`rendered ${slug}: ${ids.map((id) => `${id}.html`).join(', ')}${htmlOnly ? '' : ', cover.png'}`);
    } catch (e) {
      failed++;
      console.error(`FAIL ${slug}: ${e.message}`);
    }
  }
  process.exit(failed ? 1 : 0);
}
