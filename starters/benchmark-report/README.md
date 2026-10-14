# Peer benchmark report

A short report that puts one account next to companies in the same industry and size band. It downloads as a PDF. The numbers come from a CSV you upload to the template, so no model ever does arithmetic: the `dataset` step picks the rows, the template draws the ranges from them, and the `prompt` step only copies numbers it finds in those rows.

## How it fills

1. `peers` (`dataset`): picks the rows of your `peers` dataset where `industry` equals the account's industry and `size_band` equals the account's size band, up to 12 rows, into `data.benchmarks`.
2. `site` (`tool scrape.page`): reads the account's homepage into `data.site`, so the report can mention one or two things a visitor can see there.
3. `report` (`prompt`): writes the headline, summary, focus metric, chart, observations, takeaways and next steps from `data.benchmarks` and `data.site`. It returns nothing when there are no rows, and the slot fallbacks take over.

Section 2 of the page is drawn straight from `data.benchmarks`: one line per row with the 25th percentile, the median and the 75th percentile. The PDF adds a blank line next to each metric for the reader's own number.

## The CSV

Upload it to the template as a dataset named `peers` (or rename it and change `"dataset"` in the `peers` step). One row is one metric for one peer group. `samples/peers.csv` is a working example with made-up numbers: three industries, three size bands and six outbound metrics, 54 rows. The `benchmarks` slot declares these exact column names and types, so Ken maps each CSV column onto the property of the same name. `metric`, `p25`, `median` and `p75` are required on every row.

| Column | Type | What it means |
|---|---|---|
| `industry` | text | The peer group's industry. Use the same values Ken has for accounts, which are lowercase LinkedIn industries such as `software development` or `financial services`. The `where` filter matches it against `account.industry`, ignoring case. |
| `size_band` | text | The peer group's employee band, written the way Ken writes `account.size_band`, such as `11-50`, `51-200` or `201-500`. The `where` filter matches it against `account.size_band`. |
| `metric` | text | The metric name as a reader should see it, such as `Cold email reply rate`. Keep it under 40 characters. |
| `unit` | text | `%` for percentages (the page adds the % sign to each number). Anything else, such as `days` or `meetings`, is shown in the line under the metric name. |
| `better` | text | `higher` or `lower`: which direction is good. The page says so under each metric, and the prompt uses it to tell the strong end from the weak one. |
| `p25` | number | The 25th percentile for the peer group. |
| `median` | number | The median for the peer group. |
| `p75` | number | The 75th percentile for the peer group. |
| `sample_size` | integer | How many companies reported this metric. Shown as "88 companies". |
| `source` | text | Where the numbers come from, such as `2026 customer survey`. The page prints the first row's source under the list. |

Rules that keep the report right:

- Write plain numbers: `3.4`, not `3.4%` or `3,4`. Use a dot for decimals and no thousands separators.
- Keep `p25 <= median <= p75` on every row, even when lower is better. The page draws each range from zero to a little past `p75`.
- At most 12 metrics per industry and size band (the step's `limit`). Six to eight reads best.
- One row per `(industry, size_band, metric)`. If a peer group is too small to publish, leave its rows out; the report then says it has no peer data for that group and falls back to general advice.
- Quote any value that contains a comma, as `samples/peers.csv` does for `transportation, logistics, supply chain and storage`.

### Changing the filter

`where` is a list of `{column, op, value}`. `value` may be a Ken variable (`account.industry`, `account.size_band`) or a literal. To compare against every size band in the industry instead, drop the `size_band` filter and raise `limit`; to fix the peer group for a campaign, use a literal such as `{"column": "size_band", "op": "eq", "value": "51-200"}`. `op` can also be `in` (a list of values) or `between` (two numbers).

## Samples

- `larkspur.json`: full fill for a software company, with a person.
- `tidewater-shared.json`: the shared link (`person` is null), with brand colors and fonts set.
- `cobalt-partial.json`: the headline, focus, chart, observations and takeaways are missing, so the slot fallbacks show and the focus box drops out.
