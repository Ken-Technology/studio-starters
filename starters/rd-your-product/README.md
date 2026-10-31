# Your product, run on their data

A one-page result for one account: your product runs on the account's own data, and the page shows the main number, what it found, a chart, and what it means for them. The samples use a fictional site speed checker called Pagepace, but the slots are generic: one headline metric, a list of findings, chart data, a scope line and a link to the full report.

## How the recipe runs

1. `run` (`webhook`): Kenso POSTs the account to your endpoint. Your JSON answer fills `metric`, `findings`, `chart`, `chart_title`, `scope` and `report_url`.
2. `explain` (`prompt`): writes `headline` and `meaning` ("What this means for {account}") from your result and Kenso's research on the account. Every number it writes has to come from your result. It `requires` `metric` and `findings`, so it runs only when your endpoint answered.
3. `check` (`grade`): rejects a narrative with numbers or claims that are not in your result, and retries once. It `requires` `headline` and `meaning`, so it is skipped with `explain`.

To use it, replace `https://api.your-product.example/ken/studio` in `studio.json` with your endpoint, change the copy in `template.liquid` that talks about the check, and keep the slot schema and this README in sync if you rename anything.

## Request

Kenso sends one `POST` per account, with `Content-Type: application/json`.

Headers (Standard Webhooks):

| Header | Value |
|---|---|
| `webhook-id` | Unique id for this call. Use it to drop duplicates. |
| `webhook-timestamp` | Unix time in seconds. |
| `webhook-signature` | `v1,` followed by the base64 HMAC-SHA256 signature. See "Checking the signature". |

Body:

```json
{
  "account": {
    "name": "Harborline",
    "domain": "harborline.example",
    "industry": "insurance",
    "size_band": "51-200",
    "dossier": {
      "summary": "Harborline sells boat and yacht insurance online. Most new customers start on the quote page, and the site runs search ads that point to it.",
      "why_now": "Added jet ski cover in September and is advertising it on search.",
      "angle": "The quote page is where the ad money lands."
    }
  },
  "person": null,
  "data": {},
  "template": { "id": 4182, "versionId": 9917 },
  "assetId": 230551
}
```

| Field | Notes |
|---|---|
| `account` | Kenso's account variables. `domain` is what most products need. Any field except `name` can be null. |
| `person` | `null` or `{first_name, last_name, title}`. Answers are cached per account, so do not make the result depend on the person. |
| `data` | Slots filled by earlier recipe steps. Empty in this starter, because the webhook runs first. Move a `bind` step above it to send more. |
| `template`, `assetId` | Ids for your logs. |

## Response

Return `200` with a JSON object of at most 256 KB. Its top-level keys are the slot names in the step's `to` list. Kenso takes those keys, ignores any others, and checks each one against its slot schema in `studio.json`.

| Key | Type | Required | Limits | On the page |
|---|---|---|---|---|
| `metric` | object | yes | see below | The big readout in the hero |
| `metric.label` | string | yes | 2 to 48 characters | What was measured, like "Mobile load time, quote page" |
| `metric.value` | string | yes | 1 to 12 characters | The number, as text, so it can be "6.2", "41" or "8.4 MB" |
| `metric.unit` | string | no | at most 12 characters | Shown small after the value, like "sec" or "/100" |
| `metric.status` | string | no | `good`, `fair` or `poor` | A colored label and a three-step meter |
| `metric.context` | string | no | at most 160 characters | One line under the number |
| `findings` | array | yes | 1 to 6 items | The numbered list. Order them most important first. |
| `findings[].title` | string | yes | 3 to 80 characters | The finding in plain words |
| `findings[].severity` | string | yes | `high`, `medium` or `low` | "Fix first", "Fix soon" or "Small". The first `high` one is shown as "Where I would start". |
| `findings[].detail` | string | no | at most 280 characters | One or two sentences of evidence |
| `findings[].where` | string | no | at most 80 characters | A path or area, like "/quote" or "All pages" |
| `chart` | array | no | 2 to 8 items | A bar chart. Hidden when missing. |
| `chart[].label` | string | yes | at most 28 characters | Bar label |
| `chart[].value` | number | yes | a number, not a string | Bar value |
| `chart_title` | string | no | at most 60 characters | Chart title. Falls back to "What we measured on {domain}". |
| `scope` | string | no | at most 200 characters | What was checked and when |
| `report_url` | string | no | an `https://` URL | An "Open the full report" link |

Example:

```json
{
  "metric": {
    "label": "Mobile load time, quote page",
    "value": "6.2",
    "unit": "sec",
    "status": "poor",
    "context": "Measured on a mid-range phone over 4G. The other three pages we checked load in under 3 seconds."
  },
  "findings": [
    {
      "title": "The quote form waits on a chat script",
      "detail": "A 1.9 MB chat widget loads before the form can show. On a phone that adds about 2.4 seconds before anyone can start a quote.",
      "severity": "high",
      "where": "/quote"
    },
    {
      "title": "Images are not cached",
      "severity": "low",
      "where": "All pages"
    }
  ],
  "chart": [
    { "label": "Home", "value": 2.9 },
    { "label": "Quote", "value": 6.2 },
    { "label": "Coverage options", "value": 2.4 }
  ],
  "chart_title": "Mobile load time by page, in seconds",
  "scope": "4 pages on harborline.example, tested from a mid-range phone over 4G on October 12.",
  "report_url": "https://app.pagepace.example/r/harborline-7f3k"
}
```

Content rules Kenso enforces on every filled value: no email addresses or phone numbers of anyone, and no Liquid (`{{` or `{%`). Write labels short instead of relying on truncation.

## Timeouts, retries and caching

- Each attempt waits up to `timeout_s` seconds (20 in this starter, 30 at most).
- A timeout, a 5xx or a connection error is retried twice, after 1 second and then 4 seconds. A 4xx is final and is not retried.
- A successful answer is cached for 24 hours per template version, account and step, so refills and teammates reuse it. Publish a new template version to force fresh calls.
- If every attempt fails, the slots fall back, and `explain` and `check` do not run, so the page ends ready rather than in review. Optional slots use their fallback or are hidden. While `metric` or `findings` is missing or invalid, the link shows `fallback.liquid`, which tells the reader the results are on their way and offers the booking link.

## Checking the signature

Checking it is optional. Kenso signs every call the Standard Webhooks way, so any Standard Webhooks or Svix library can verify it with your template's secret (`whsec_...`), which you read from `GET /v1/asset-templates/{templateId}/webhook-secret`.

The signed content is `{webhook-id}.{webhook-timestamp}.{raw body}`. The key is the base64-decoded part of the secret after `whsec_`. Verify against the raw request body, before any JSON parsing.

Node, no dependencies:

```js
import crypto from 'node:crypto';

export function verifyKen(rawBody, headers, secret) {
  const id = headers['webhook-id'];
  const ts = headers['webhook-timestamp'];
  if (!id || !ts || Math.abs(Date.now() / 1000 - Number(ts)) > 300) return false;
  const key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
  const expected = crypto.createHmac('sha256', key).update(`${id}.${ts}.${rawBody}`).digest('base64');
  return String(headers['webhook-signature'] ?? '').split(' ').some((part) => {
    const [version, sig] = part.split(',');
    return version === 'v1' && sig?.length === expected.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  });
}
```

Python, with the `standardwebhooks` package:

```python
from standardwebhooks.webhooks import Webhook

Webhook(secret).verify(raw_body, headers)  # raises if the signature is wrong
```

If you would rather check a shared token, add a static header to the step, for example `"headers": {"Authorization": "Bearer {{ secret.PAGEPACE_TOKEN }}"}`. Kenso fills `{{ secret.NAME }}` from your workspace secrets. Never put a raw token in `studio.json`.

## Samples

- `harborline.json`: a full result with the default look.
- `oakhurst-shared.json`: the shared link (no person), with brand colors and fonts set.
- `fieldnote-partial.json`: only `metric` and `findings`, so the optional slots fall back or hide.
