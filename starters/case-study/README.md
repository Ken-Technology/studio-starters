# Built for you case study

A one-page customer story for each account. Ken picks the story from your own case studies that sits closest to the account, and retells it so the reader can see their own situation in it: what the customer and the account have in common, where the customer started, what changed, the result, the quote, and why it applies. The page ends with a booking button.

## How it fills

1. `same_industry` (`dataset`): rows of your `case-studies` dataset where `industry` equals the account's industry, up to 5, into `data.stories`.
2. `same_size` (`dataset`): rows where `size_band` equals the account's size band, up to 8, into `data.size_matches`. This is the backup when you have no story from the account's industry.
3. `story` (`prompt`): picks one row (same industry first, closest size and problem next) and writes the page. The customer name, result and quote are copied from the row word for word; the prompt may not add a number that is not in the row. If both lists are empty, it returns nothing and the page shows its fallbacks: a generic headline and intro, a short "still matching a story" note, and the booking button.

The account side of the comparison comes only from what Ken knows about the account: `account.industry`, `account.size_band` and the dossier (`account.dossier.summary`, `account.dossier.why_now`). If the dossier is thin, the "Why this story" table shrinks rather than guessing.

## The CSV

Upload it to the template as a dataset named `case-studies` (or rename it and change `"dataset"` in both dataset steps). One row is one customer story. `samples/case-studies.csv` is a working example with 12 made-up stories for a made-up accounts payable product. The `stories` and `size_matches` slots declare these exact column names, so Ken maps each CSV column onto the property of the same name.

| Column | Type | Required | What it means |
|---|---|---|---|
| `customer` | text | yes | The customer's name as you would say it out loud, such as `Granite Ridge Builders`. Only list customers who agreed to be named. |
| `industry` | text | yes | The customer's industry, written the way Ken writes `account.industry`: lowercase LinkedIn industries such as `construction` or `hospitals and health care`. `same_industry` matches it against the account, ignoring case. |
| `size_band` | text | no | The customer's employee band, written the way Ken writes `account.size_band`, such as `11-50`, `51-200` or `201-500`. `same_size` matches it against the account. |
| `problem` | text | yes | Where the customer started, in two or three plain sentences. Specific beats general: "invoices sat on six project managers' desks for weeks" beats "slow approvals". |
| `approach` | text | yes | What they changed with you, in one or two sentences. |
| `result_metric` | text | yes | What the result measures, such as `Days to approve a subcontractor invoice`. Under 80 characters. |
| `result_value` | text | yes | The result as you want it shown, such as `19 to 4`, `31% to 88%` or `140k USD a year`. It is printed large, so keep it under 20 characters. |
| `timeframe` | text | no | How long it took, as a duration: `3 months`, `6 weeks`. The page prints "Over 3 months". |
| `quote` | text | no | A quote from the customer, word for word. Leave it empty if you do not have an approved one. |
| `quote_author_title` | text | no | The job title of the person quoted, such as `Controller`. The page shows the title and the company, never a person's name. |

Rules that keep the page right:

- One row per story, under 600 characters per cell. Keep it to stories you are happy to show any prospect.
- No email addresses or phone numbers anywhere in the CSV. Ken rejects filled pages that contain them.
- No em dashes or en dashes; the prompt copies the quote and result as written.
- Quote any value that contains a comma, as the sample does for `transportation, logistics, supply chain and storage`.
- Cover the industries you sell into. When an account's industry has no story, the page falls back to a same-size story from another industry and says plainly what is different.

### Changing the filters

`where` is a list of `{column, op, value}`. `value` may be a Ken variable (`account.industry`, `account.size_band`) or a literal. `op` is `eq` (ignores case), `in` (a list of values) or `between` (two numbers). To match on a column you add yourself, such as `region`, add it to the CSV and to the `stories` item properties, then filter on it.

## Samples

- `harborview.json`: a construction company with a person, matched to a construction story of the same size.
- `coldwater-shared.json`: the shared link (`person` is null), with brand colors and fonts set.
- `mosswood-partial.json`: no story from the account's industry, so the prompt picked a same-size story from another industry; the dek, comparison table, quote and fit are missing, so the slot fallbacks show.
