# Ken Studio starters

Starter templates for [Ken](https://getken.ai) Studio. A Studio template is built once, then Ken fills it for each account and serves it as a page on your own domain, with a link per person and view tracking. These starters are the gallery behind "Use this starter": copy one into your workspace, edit it, publish it.

## The starters

| Starter | Type / format | What it shows off |
|---|---|---|
| [`rd-doc`](starters/rd-doc) | `reverse_demo` / `doc` | Template #1. A sample outbound campaign built for one account: strategy, segment and funnel charts, sample leads from Ken Search, graded first emails. `tool`, `bind`, `prompt`, `grade`, `ken/chart`, PDF |
| [`rd-ken-native`](starters/rd-ken-native) | `reverse_demo` / `page` | "We built you a campaign": people from Ken Search and the first emails from Ken's copy step |
| [`rd-your-product`](starters/rd-your-product) | `reverse_demo` / `page` | "Your product, run on their data": your endpoint does the work through a `webhook` step |
| [`benchmark-report`](starters/benchmark-report) | `report` / `doc` | The account next to its peers, from a CSV you upload (`dataset`) |
| [`audit-rewrites`](starters/audit-rewrites) | `audit` / `page` | Scrape their site, list what gets in a buyer's way, rewrite three lines, grade the rewrites |
| [`event-invite`](starters/event-invite) | `event` / `page` | A dinner or webinar invite with `ken/form` to save the seat |
| [`case-study`](starters/case-study) | `landing_page` / `page` | The closest customer story per account, from a CSV of your case studies (`dataset`) |
| [`role-pitch`](starters/role-pitch) | `recruiting` / `page` | One page per candidate: why their background fits, the role, the team, the pay range and the process, with a booking button and an optional hiring-manager video |
| [`roles-for-you`](starters/roles-for-you) | `recruiting` / `page` | One page per candidate listing the open roles that fit them, each with a "why you" line and a book or apply button |

`index.json` lists them for tools (`studio_starters_list` and the Studio gallery read it). Each entry has `slug`, `name`, `type`, `format`, `description`, `showcases` and `version`.

## Using a starter

- **In Ken:** Library > Studio > New template, then pick a starter. Ken copies the bundle into your workspace as a draft.
- **From your own agent** (Claude Code, Codex, Cursor and others, over the Ken MCP): list starters with `studio_starters_list`, create a template from one, then edit, `studio_template_validate`, `studio_template_preview` and `studio_template_publish`. The `studio-template-builder` skill walks an agent through it.
- **By hand:** copy `starters/<slug>/` and edit it. Run `node scripts/check.mjs <slug>` before you push it.

## What a bundle is

```
starters/<slug>/
  studio.json        manifest
  template.liquid    a full HTML document, for both formats (see Pages and docs); CSS is an inline <style> block here
  fallback.liquid    shown when the fill is not ready; Ken variables only
  README.md          optional notes, such as a webhook or CSV contract
  assets/            images and other files, referenced as {{ asset_url }}/name.svg; never CSS
  samples/           sample data for previews: <name>.json = {account, person, sender, brand, data}
```

Limits: `template.liquid` 256 KB, each asset 5 MB, a bundle 20 MB. This repo keeps starters smaller (assets under 200 KB, a bundle under 1 MB).

### studio.json

```json
{
  "kenStudio": "1",
  "name": "Sample outbound campaign doc",
  "type": "reverse_demo",
  "format": "doc",
  "slug": "outbound-campaign",
  "slots": { "type": "object", "properties": { "...": {} }, "required": ["..."] },
  "recipe": [ { "id": "...", "kind": "...", "to": "data.x" } ],
  "sections": [ { "id": "cover", "label": "Cover" } ]
}
```

- `type`: `reverse_demo`, `landing_page`, `audit`, `report`, `event`, `calculator`, `recruiting` or `other`. `format`: `page` or `doc`.
- `slug` names the page in its link: `https://go.acme.com/brightwave/outbound-campaign-for-leo`. Lowercase words joined by hyphens, at most 60 characters.
- `slots` describe `data.*` with a JSON Schema subset: `type`, `properties`, `required`, `items`, `minLength`, `maxLength`, `minItems`, `maxItems`, `enum`, `format: "uri"`, plus Studio's `fallback`. Nothing else.
- Every required slot has a `fallback`, or the bundle ships `fallback.liquid`. A fallback is a static JSON value, or a Liquid string that uses only Ken variables (never `data.*`).
- Every element with `data-section="<id>"` in the template appears in `sections`, and every section appears in the template. Ken tracks reading time per section.

### Recipe steps

The recipe fills `data.*` for one account. Steps run in order, and each one writes to declared slots.

| Kind | Fields | What it does |
|---|---|---|
| `bind` | `from`, `to` | Copies `account.*`, `person.*`, `account.dossier.*`, `role.*` or `knowledge.*` into a slot |
| `tool` | `tool`, `args`, `to` | `ken_search.people`, `ken_search.companies`, `enrich.email`, `scrape.page`, `ken.copy`, `chart.data` |
| `prompt` | `prompt`, `inputs`, `to`, `model` | An LLM writes one or more slots; the output is checked against the slot schema. `model` defaults to `cheap` |
| `grade` | `rubric`, `on`, `retries`, `pass_score`, `checks` | A judge scores slots; it retries the steps that wrote them, then marks the page "Needs review". `checks` run first and fail a hit without calling the judge |
| `webhook` | `url`, `headers`, `to`, `timeout_s` | POSTs `{account, person, data}` to your HTTPS endpoint and takes JSON back. Ken signs every request |
| `dataset` | `dataset`, `where`, `limit`, `to` | Picks rows from a CSV uploaded to the template. `where` is `[{column, op: eq\|in\|between, value}]`; `value` may be a Ken variable |

Conventions these starters follow:

- `prompt` text (and `rubric`, tool `args` and dataset `where`) takes output tags over Ken variables and `data.*`, with the filters `default`, `upcase`, `downcase`, `capitalize`, `strip`, `size`, `join`, `truncate` and `json`, like `{{ data.pricing.url | default: 'none' }}`. Tags such as `{% if %}` fail the step when it runs, and `check.mjs` rejects them. `inputs` lists the Ken variables and earlier slots the step reads.
- String values in `tool` args are Liquid too. A string that is exactly one `{{ data.x }}` passes that value through with its type, so `"filters": "{{ data.search }}"` hands Ken Search the filter object a `prompt` step wrote.
- Intermediate results (scraped pages, raw search results) are declared as optional slots, because every `to` must be a declared slot.
- Every kind except `bind` takes `requires`, a list of `data.<slot>` paths that an earlier step writes. While one of them is empty or failed, the step does not run and costs nothing, and its slots fall back. `rd-doc` uses it so `plan` never writes a strategy without the site, and `copy` never names people when the search found none.
- A `grade` step may set `checks`: string rules Ken runs on the graded slots before the judge. `banned` lists words and phrases (`demo` also catches `demos`), and `no_placeholders`, `no_dashes`, `no_prices`, `no_test_noun`, `no_real_emphasis` and `no_signoff` turn on the rest. `skip` names fields copied as given (a lead's `name`, `title`, `linkedin_url`), which the checks do not read. A hit fails the grade at no model cost, and the rewrite is told the rule and the quoted phrase. `rd-doc` turns them all on. ken-backend `docs/studio/validation-rules.md` says what each one matches.
- `ken_search.people` searches one company by default (`company: "account"` or a domain). For people across the market, the starters pass `"company": "any"` with `"filters"`, a Ken Search people filter object (`currentTitles`, `seniorityLevels`, `industries`, `companyHeadcount`, `countries`). Results are `{name, title, company, linkedin_url}` and never carry emails or phone numbers.
- `scrape.page` takes `{url, maxChars, mode}`; `ken.copy` takes `{kind: email|headline|paragraph, brief, tone, maxWords}` and returns one piece of copy; `chart.data` turns rows into `{label, value}` for `ken/chart`.
- A `webhook` gets `{account, person, data, template: {id, versionId}, assetId}` and answers with a JSON object whose top-level keys are the step's `to` slot names. Requests carry Standard Webhooks signature headers. See `starters/rd-your-product/README.md`.
- A `dataset` step returns up to `limit` rows (default 10). `eq` is case-insensitive, `in` takes a list, `between` is numeric. Columns map to the slot's item properties by name.

### Ken variables

Ken supplies these at render time. Recipes never fill them.

| Variable | Fields |
|---|---|
| `account` | `name`, `domain`, `industry`, `size_band`, `dossier.summary`, `dossier.why_now`, `dossier.angle` |
| `person` | `first_name`, `last_name`, `title`. **Null on the shared link**, so always write `{{ person.first_name \| default: 'there' }}`. On a recruiting page also `current_title`, `current_company`, `location`, `skills`, `experience_summary` and `linkedin_url`, set while the page fills too |
| `sender` | `name`, `title`, `signature_html` |
| `brand` | `name`, `logo_url`, `colors.primary`, `colors.secondary`, `fonts.heading`, `fonts.body` |
| `link` | `booking_url`, `refresh_url`, `page_url` |
| `asset_url` | Base URL for `assets/` |
| `role` | Recruiting pages only: `title`, `company`, `location`, `remote_policy` (`onsite`, `hybrid` or `remote`), `pay_range` (like "$150k-$180k a year", empty when the role has no pay), `description`, `highlights` (the must-haves), `job_url`, `booking_url` |
| `roles` | Recruiting pages only: the campaign's roles shaped like `role`, the primary role first, at most 4 |

`brand.colors`, `brand.fonts` and `sender.title` are empty today, so every starter sets a default for them.

A recruiting page (type `recruiting`, behind the workspace's `recruiting` flag) belongs to one candidate on a recruiting campaign, not to an account, so `account` is empty there. Its samples set `"account": null` and carry `role` and `roles`.

### Kit snippets

| Snippet | Call |
|---|---|
| `ken/cta` | `{% render 'ken/cta', label: 'Book 30 minutes', kind: 'booking' %}`, or `href: link.page_url` instead of `kind` |
| `ken/chart` | `{% render 'ken/chart', type: 'bar', data: data.segments, title: '...' %}`. `type` is `bar`, `funnel`, `line` or `pie`. `data` is a list of `{label, value}`; labels are at most 28 characters. Renders inline SVG, no JavaScript |
| `ken/booking` | `{% render 'ken/booking' %}`: the sender's booking page, inline |
| `ken/form` | `{% render 'ken/form', id: 'rsvp', fields: 'name*,email*,company,dietary', submit: 'Save my seat' %}`. `fields` names come from `name`, `email`, `company`, `title`, `guests`, `dietary`, `note`; a trailing `*` makes the field required. Submissions go to Ken and become signals. Previews have no link, so the form renders only on a real link |

### What the HTML can do

Pages are served with a strict Content Security Policy, and validation rejects anything it would block:

- No inline `<script>`: only Ken's own scripts run inline on a page (each with the response's nonce), so a template's inline script never runs and validation rejects it (`csp-inline-script`). External scripts come only from `https://cdn.jsdelivr.net/npm/chart.js@4`, `https://cdn.jsdelivr.net/npm/@alpinejs/csp@3/` (for example `https://cdn.jsdelivr.net/npm/@alpinejs/csp@3/dist/cdn.min.js`) and `https://cdn.jsdelivr.net/npm/motion@11`. Nothing else, so no unpkg. The CSP has no `'unsafe-eval'`, so standard Alpine directives cannot run; use the Alpine CSP build with its state in `x-data` object literals. Use `ken/chart` for charts and `ken/form` for forms.
- No `on*=` attributes and no `javascript:` URLs.
- Images come from `{{ asset_url }}/...`, `brand.logo_url` or `data:` URIs. CSS is an inline `<style>` block in `template.liquid`, never a file under `assets/`. The only external stylesheet is Google Fonts (`https://fonts.googleapis.com`), with the fonts from `https://fonts.gstatic.com`.
- Iframes only from the booking list (Calendly, Cal.com, HubSpot Meetings, Chili Piper, SavvyCal) and the video list (Loom, YouTube, Vimeo, Wistia). Use `ken/booking` for booking.
- No `<form>` tags. Forms go through `ken/form`. No password, card or ID-number fields.
- Filled data never holds email addresses or phone numbers of anyone other than the sender.

### Liquid

Templates use the subset that LiquidJS (the edge renderer) and Shopify Liquid share: `if/elsif/else`, `unless`, `for`, `assign`, `capture`, `case`, `render`, `comment`, `raw`, and standard filters (`default`, `escape`, `upcase`, `size`, `date`, `join`, `split`, `round`, `times`, `divided_by`, `newline_to_br` and the like), plus LiquidJS's `raw`. No custom filters.

- Escape every value you print in HTML: `{{ data.headline | escape }}`. The edge escapes every `{{ }}` output again (existing entities are kept, so `| escape` never escapes twice), which turns markup a filter adds into text. For prose slots, `{{ data.intro | escape | newline_to_br | strip_newlines | raw }}`: `escape` makes the text safe, then `raw` keeps the `<br />` tags. Use `| raw` only on a value you escaped first: `check.mjs` fails an output that ends in `| raw` unless `| escape` comes earlier in its chain or in the `assign` that built the local it prints.
- An empty string is truthy in Liquid. Test optional strings with `{% if data.ps and data.ps != '' %}`.

### Pages and docs

Both formats are a full HTML document with `<meta name="viewport">` and a `</body>`; Ken injects the tracking script before `</body>`. Write mobile-first CSS: most people open these links on a phone.

- **`page`:** a web page.
- **`doc`:** a document that reads top to bottom on the web and downloads as a PDF (add print CSS, for example `break-before: page` per section). The contract calls a doc "Markdown", but the edge renders a doc's Liquid output as HTML with no Markdown step. So doc starters are written only as HTML blocks: every line in the body starts with a tag, with no Markdown syntax, no blank lines inside an element and no four-space indents. CommonMark passes a document like that through unchanged, so it renders the same if a Markdown step is ever added. `rd-doc` is the reference, and `scripts/check.mjs` enforces it.

## Template #1 rules (`rd-doc`)

`rd-doc` ports the reverse-demo Google Doc that Ken's outbound team sent to prospects (Structure A: cover, strategy, segments, funnel, sample leads, outreach, next steps). It keeps that doc's rules, in the prompts and in the grader:

- Never the words "reverse demo" (or "demo") in the page.
- No em dashes or en dashes.
- No email addresses or phone numbers for anyone in the leads table or the emails.
- Chart labels at most 28 characters; segment names at most 24.
- The grade step uses the outbound team's email rubric: score 7.5 or higher with no weak check (quick read, makes sense, easy ask, soft CTA, specific PS, would reply, no weird phrases), one retry at most.
- The pricing line in "What happens next" comes from `knowledge.offer`, so each workspace states its own offer.

## Writing rules for every starter

Page copy reads like one person writing to another. Plain words, short sentences, specific facts from the inputs. No em dashes, no hype words, no invented customers or numbers. Prompts carry the same rules so filled pages follow them too.

## Checking a bundle

```bash
node scripts/check.mjs            # every bundle and index.json
node scripts/check.mjs rd-doc     # one bundle
node --test scripts/check.test.mjs   # tests for check.mjs itself
```

`check.mjs` has no dependencies (Node 20 or newer) and runs on every push and pull request. It checks the manifest fields, the slot schema subset, fallbacks, the recipe (known kinds and tools, `to` targets, inputs filled by earlier steps, https webhooks, timeouts), `data-section` against `sections`, the HTML rules above, the portable Liquid tags and filters, sizes, asset types, dashes, and that each sample has `account.name` (`role.title` on a recruiting starter), matches the slot schema and holds no contact details. Ken's validator runs the full set when you push a bundle, including a Liquid parse and the filled-data rules.

To see a starter rendered, run its samples through LiquidJS with stub kit partials, for example:

```js
// npm install liquidjs (outside this repo), then put stubs in stubs/ken/cta.liquid, chart.liquid, booking.liquid, form.liquid
import fs from 'node:fs';
import { Liquid } from 'liquidjs';
const engine = new Liquid({ root: ['stubs'], extname: '.liquid' });
const template = fs.readFileSync('starters/rd-doc/template.liquid', 'utf8');
const sample = JSON.parse(fs.readFileSync('starters/rd-doc/samples/brightwave.json', 'utf8'));
const html = await engine.parseAndRender(template, { ...sample, link: { booking_url: '#' }, asset_url: '' });
```

The output is the HTML the edge serves, before the tracking script and the real kit snippets.

## Contributing

Add or change a folder under `starters/`, give it at least three samples (one with `"person": null` for the shared link), bump its `version` in `index.json`, and make sure `node scripts/check.mjs` passes.

## License

MIT. See [LICENSE](LICENSE).
