// Tests for render.mjs and the kit ports. Needs `npm ci` (LiquidJS; the cover test also Playwright Chromium and sharp):
// node --test scripts/render.test.mjs
//
// The Library fixture (library-fixture.mjs) is rendered in a temp folder, then indexed and checked with the real scripts.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { renderChart } from './kit/chart.mjs';
import { RAW_BASE, renderPreviews, renderSample } from './render.mjs';
import { SAMPLES, SLUG, STUDIO, TEMPLATE, writeLibrary } from './library-fixture.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const EMPTY_INDEX = '{\n  "kenStudio": "1",\n  "starters": []\n}\n';

async function inRepo(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-render-'));
  try {
    return await fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

const scopeOf = (vars) => ({ get: (p) => p.reduce((v, k) => (v && typeof v === 'object' ? v[k] : undefined), vars) });
const render = (sample, template = TEMPLATE, manifest = STUDIO) => renderSample({ slug: SLUG, manifest, template }, sample);

// Output of ken-backend Ken.Redirector.Edge/src/studio/kit/chart.ts for the same scopes.
test('ken/chart draws the same SVG as the edge', () => {
  assert.equal(
    renderChart(scopeOf({ type: 'bar', data: [{ label: 'Same industry', value: 1840 }, { label: 'Same industry and size', value: 312 }], title: 'Companies like yours', _ken: { purpose: 'preview' } })),
    '<figure class="ken-chart" data-ken-chart="bar"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 88" width="100%" role="img" aria-label="Companies like yours" style="max-width:640px;height:auto" font-family="inherit" font-size="13"><title>Companies like yours</title><text x="200" y="25" text-anchor="end" fill="#374151">Same industry</text><rect x="210" y="8" width="360" height="26" rx="4" fill="#2563eb"/><text x="578" y="25" fill="#374151">1,840</text><text x="200" y="61" text-anchor="end" fill="#374151">Same industry and size</text><rect x="210" y="44" width="61" height="26" rx="4" fill="#2563eb"/><text x="279" y="61" fill="#374151">312</text></svg><figcaption>Companies like yours</figcaption></figure>',
  );
  assert.equal(
    renderChart(scopeOf({ type: 'funnel', data: [{ label: 'Sent', value: 1000 }, { label: 'Replied', value: 41.25 }], brand: { colors: { primary: '#7a2e1c' } }, _ken: { purpose: 'preview' } })),
    '<figure class="ken-chart" data-ken-chart="funnel"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 88" width="100%" role="img" style="max-width:640px;height:auto" font-family="inherit" font-size="13"><text x="200" y="25" text-anchor="end" fill="#374151">Sent</text><rect x="210" y="8" width="320" height="26" rx="3" fill="#7a2e1c" fill-opacity="1"/><text x="540" y="25" fill="#374151">1,000 (100%)</text><text x="200" y="61" text-anchor="end" fill="#374151">Replied</text><rect x="363.4" y="44" width="13.2" height="26" rx="3" fill="#7a2e1c" fill-opacity="0.8"/><text x="540" y="61" fill="#374151">41.3 (4%)</text></svg></figure>',
  );
});

test('the Library fixture renders, indexes and checks clean', async () => {
  await inRepo(async (dir) => {
    writeLibrary(dir);
    fs.writeFileSync(path.join(dir, 'starters', SLUG, 'preview', 'stale.html'), 'left over from a sample that was removed');
    const ids = await renderPreviews(dir, SLUG, { htmlOnly: true });
    assert.deepEqual(ids, ['acme', 'globex-shared', 'initech-partial']);
    assert.deepEqual(fs.readdirSync(path.join(dir, 'starters', SLUG, 'preview')).sort(), ['acme.html', 'cover.png', 'globex-shared.html', 'initech-partial.html']);

    fs.writeFileSync(path.join(dir, 'index.json'), EMPTY_INDEX);
    fs.mkdirSync(path.join(dir, 'scripts'));
    for (const f of ['check.mjs', 'build-index.mjs']) fs.cpSync(path.join(ROOT, 'scripts', f), path.join(dir, 'scripts', f));
    for (const script of ['build-index.mjs', 'check.mjs']) {
      const res = spawnSync(process.execPath, [path.join(dir, 'scripts', script)], { encoding: 'utf8' });
      assert.equal(res.status, 0, res.stdout + res.stderr);
    }
  });
});

test('rendering is deterministic', async () => {
  await inRepo(async (dir) => {
    writeLibrary(dir);
    const read = () => ['acme', 'globex-shared', 'initech-partial'].map((id) => fs.readFileSync(path.join(dir, 'starters', SLUG, 'preview', `${id}.html`)));
    await renderPreviews(dir, SLUG, { htmlOnly: true });
    const first = read();
    await renderPreviews(dir, SLUG, { htmlOnly: true });
    assert.deepEqual(read(), first);
  });
});

test('a sample with "person": null renders template.liquid, not fallback.liquid', () => {
  const html = render(SAMPLES['globex-shared']);
  assert.match(html, /<p>Hi there\.<\/p>/);
  assert.match(html, /What changed at Globex this quarter/);
  assert.doesNotMatch(html, /Fallback page/);
});

test('a preview links to "#", reads assets from main and keeps the template defaults for a missing brand', () => {
  const template = TEMPLATE.replace('</main>', '<img src="{{ asset_url }}/logo.svg" alt=""><a href="{{ link.page_url }}">Page</a></main>');
  const acme = render(SAMPLES.acme, template);
  assert.match(acme, /<a class="ken-cta" data-ken-cta="booking" href="#" style="[^"]*background:#111827;/);
  // The edge serves {{ asset_url }}/<path> from assets/, so the preview points at that folder on main.
  assert.match(acme, new RegExp(`<img src="${RAW_BASE}/${SLUG}/assets/logo\\.svg" alt="">`));
  assert.equal(RAW_BASE, 'https://raw.githubusercontent.com/Ken-Technology/studio-starters/main/starters');
  assert.match(acme, /<a href="#">Page<\/a>/);
  assert.match(acme, /h1\{color:#1f4e79\}/);
  assert.match(acme, /fill="#2563eb"/);
  // The sample's own brand color reaches the template and the kit.
  const globex = render(SAMPLES['globex-shared']);
  assert.match(globex, /h1\{color:#7a2e1c\}/);
  assert.match(globex, /<rect x="210" y="8" width="360" height="26" rx="4" fill="#7a2e1c"\/>/);
});

test('an empty slot takes its fallback, rendered over the Ken variables', () => {
  assert.match(render(SAMPLES['initech-partial']), /<h1>A short brief for Initech<\/h1>/);
});

test('output is escaped like the edge, keeping existing entities', () => {
  const sample = structuredClone(SAMPLES.acme);
  sample.data.headline = '<script>x</script> AT&T';
  sample.account.name = "O'Brien & Co";
  const html = render(sample, TEMPLATE.replace('</main>', '<p id="plain">{{ account.name }}</p></main>'));
  assert.match(html, /<h1>&lt;script&gt;x&lt;\/script&gt; AT&amp;T<\/h1>/);
  // | escape, then the edge's own escape keeps the entities the filter wrote instead of escaping them twice.
  assert.match(html, /<title>O&#39;Brien &amp; Co<\/title>/);
  // With no | escape, the edge's own escape still applies.
  assert.match(html, /<p id="plain">O&#39;Brien &amp; Co<\/p>/);
});

test('ken/form and ken/booking render static preview blocks', () => {
  const template = TEMPLATE.replace('</main>', "{% render 'ken/form', id: 'rsvp', fields: 'name*,email*,notes', submit: 'Save my seat' %}{% render 'ken/booking', height: 400 %}</main>");
  const html = render(SAMPLES.acme, template);
  const form = html.match(/<form class="ken-form" data-ken-form="rsvp" data-ken-preview>[\s\S]*?<\/form>/)?.[0];
  assert.ok(form, html);
  assert.doesNotMatch(form, /action=|method=/);
  assert.equal([...form.matchAll(/<(input|textarea)\b(?![^>]*type="hidden")[^>]*>/g)].filter((m) => !/ disabled/.test(m[0])).length, 0, form);
  assert.match(form, /<button type="submit" class="ken-form-submit" disabled[^>]*>Save my seat<\/button>/);
  assert.match(form, /Preview: not saved/);
  const booking = html.match(/<div class="ken-booking" data-ken-booking="preview" style="[^"]*height:400px;[\s\S]*?Preview: the live page shows the booking calendar here\.<\/span><\/div>/)?.[0];
  assert.ok(booking, html);
  assert.match(booking, /<svg [^>]*aria-label="Calendar"/);
  assert.match(booking, /<a class="ken-cta" data-ken-cta="booking" href="#"[^>]*>Book a time<\/a>/);
  assert.doesNotMatch(html, /<iframe/);
});

test('a page with unresolved Liquid fails to render', () => {
  const sample = structuredClone(SAMPLES.acme);
  sample.data.headline = 'Hi {{ person.first_name }}';
  assert.throws(() => render(sample), /unresolved Liquid/);
});

test('the cover reads assets from the local folder, before the template is on main', async () => {
  const { default: sharp } = await import('sharp');
  await inRepo(async (dir) => {
    const template = TEMPLATE.replace('<main>', '<main><img src="{{ asset_url }}/block.png" alt="" style="position:fixed;top:0;left:0;width:200px;height:200px">');
    const bundle = writeLibrary(dir, { template });
    fs.mkdirSync(path.join(bundle, 'assets'));
    await sharp({ create: { width: 200, height: 200, channels: 3, background: '#000000' } }).png().toFile(path.join(bundle, 'assets', 'block.png'));
    await renderPreviews(dir, SLUG);
    const { data, info } = await sharp(path.join(bundle, 'preview', 'cover.png')).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const at = (x, y) => [...data.subarray((y * info.width + x) * info.channels, (y * info.width + x) * info.channels + 3)];
    assert.deepEqual(at(100, 100), [0, 0, 0]);
    assert.notDeepEqual(at(600, 700), [0, 0, 0]);
  });
});

test('the cover is a 1280x800 PNG of at most 400 KB', async () => {
  await inRepo(async (dir) => {
    writeLibrary(dir);
    const cover = path.join(dir, 'starters', SLUG, 'preview', 'cover.png');
    fs.rmSync(cover);
    await renderPreviews(dir, SLUG);
    const png = fs.readFileSync(cover);
    assert.equal(png.toString('latin1', 1, 4), 'PNG');
    assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [1280, 800]);
    assert.ok(png.length <= 400 * 1024, `${png.length} bytes`);
  });
});
