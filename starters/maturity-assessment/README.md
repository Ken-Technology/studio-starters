# Maturity assessment

A self-assessment page for each account. The reader answers eight questions across four areas (Process, Data, Automation and Team), each on a scale of 1 to 4. The page then shows the overall score, the stage the account is at, a radar chart and a table of the four area scores next to the account's peers, the three next steps that match the weakest areas, and a booking button.

## How it fills

1. `peer_scores` (`dataset`): the row of your `peers` dataset where `industry` equals the account's industry, into `data.peers`. With no matching row the peer comparison drops out: no dashed peer line, no peer column, no peer marker on the stage bar and no source note. The score, the stage and the next steps still work.
2. `copy` (`prompt`): writes `data.headline`, `data.intro` (one or two lines to the reader on why this is worth three minutes) and `data.steps` (one next step for each of the four areas, from the account's industry and size only).
3. `grade`: checks that copy for the banned words, dashes and placeholders, then scores it against a short rubric.

The questions (`data.questions`), the area names (`data.dimensions`) and the stage names (`data.stages`) are slots with fallbacks. They are the same for every account, so edit them once in the template. The scoring and the Alpine state follow them, with these limits: exactly 8 questions, each tagged `dimension` 1 to 4 in the order of `dimensions`, 4 answers per question, 4 areas, 4 stages. Area names are at most 12 characters so the radar labels fit.

If the fill fails, `fallback.liquid` shows a short page with the booking button.

## How the page works

The page loads only the Alpine CSP build (`https://cdn.jsdelivr.net/npm/@alpinejs/csp@3/dist/cdn.min.js`). All state sits in one `x-data` object literal: the current question (`q`, -1 for the start, 0 to 7 for the questions, 8 for the result), the answers (`a`) and the peer scores (`p`, seeded from `data.peers`). The CSP build cannot run getters or methods in a literal, so each derived number (the four area scores, the overall score, the stage, the number answered, the peer average and the next-step order) is an `x-effect` on a hidden element that writes its value back into the state. The radar polygons and dots are SVG attributes bound to those numbers. With JavaScript off the page shows the start view, a note and the booking link.

The next steps are ranked by area score, lowest first, with ties going to the earlier area. The page shows the first three.

## The CSV

Upload it to the template as a dataset named `peers` (or rename it and change `"dataset"` in the `peer_scores` step). One row is one peer group, and the page reads the first matching row, so keep one row per industry. `samples/peers.csv` is a working example with made-up numbers for seven industries. The `peers` slot declares these exact column names and types, so Kenso maps each CSV column onto the property of the same name.

| Column | Type | Required | What it means |
|---|---|---|---|
| `industry` | text | yes | The peer group's industry, written the way Kenso writes `account.industry`: lowercase LinkedIn industries such as `construction` or `hospitals and health care`. The `where` filter matches it against the account, ignoring case. |
| `peer_group` | text | yes | The group in plain words, as it should read after "assessments by", such as `logistics companies between 200 and 1,000 people`. Shown on the start view and in the source note. Under 120 characters. |
| `assessments` | integer | yes | How many companies answered, such as `64`. Shown as "64 assessments" and "64 companies". |
| `score_1` | number | yes | The group's average for the first area (Process by default), from 1 to 4. |
| `score_2` | number | yes | The average for the second area (Data by default). |
| `score_3` | number | yes | The average for the third area (Automation by default). |
| `score_4` | number | yes | The average for the fourth area (Team by default). |
| `source` | text | no | Where the figures come from, such as `Collected by Northbeam in 2026`. Printed under the result, followed by "Scores are self-reported." |

Rules that keep the page right:

- Write plain numbers with a dot for decimals and no thousands separators: `2.6`, not `2,6`, and `1200`, not `1,200`. Kenso drops a row whose number it cannot read. Scores run from 1 to 4, the same scale as the answers.
- The score columns follow the order of the `dimensions` slot. If you rename or reorder the areas, reorder the columns to match.
- Use only figures you collected. The page shows them as given and never fills a gap.
- Quote any value that contains a comma, as `samples/peers.csv` does.
- Cover the industries you sell into. An account whose industry has no row gets the page without the peer comparison.

### Changing the filter

`where` is a list of `{column, op, value}`. `value` may be a Kenso variable (`account.industry`, `account.size_band`) or a literal. To pick a group by size as well, add a `size_band` column and a second condition, and keep one row for each combination.

## Samples

- `brightwave.json`: a logistics company with a person, in the default brand (`brand.colors` and `brand.fonts` null).
- `marlowe-dental.json`: a dental group, with a dark green primary and a serif heading font.
- `stonegate-shared.json`: the shared link (`person` is null), with a bright orange primary and a geometric sans.
- `quillmark-partial.json`: nothing filled and no peer row, so the headline and intro take their fallbacks and the peer comparison is hidden.

The preview pages show the start view. Open one in a browser and answer the questions to see the result.
