# Quarterly value review

A quarterly business review for one existing customer. It opens with a cover (the quarter and a headline sentence) and then shows stat tiles with the change against last quarter, a line chart of active seats by month, adoption by team, three wins, the plan for next quarter and the renewal timeline. It ends with a booking button and a note on where the numbers come from. It prints to a clean PDF, one section per page.

## How it fills

1. `usage` (`dataset`): rows of your `usage` dataset where `account_domain` equals the account's domain, up to 50, into `data.rows`. One CSV holds every kind of row, told apart by the `kind` column.
2. `write` (`prompt`): writes the headline, a note under each chart, the three wins, the plan and the closing note, only from those rows. It does not run while `data.rows` is empty, and the page then shows its fallbacks.
3. `grade` (`grade`): checks that every number matches the rows and that the copy is plain, with one retry.

The numbers on the page (tiles, deltas, chart, bars, timeline) are never written by the model. The template computes them from `data.rows`: the last `quarter` row is this quarter and the one before it is last quarter. Every section hides when its rows are missing, so a thin export still gives a good page.

## The CSV

Upload it to the template as a dataset named `usage`, or rename it and change `"dataset"` in the `usage` step. `samples/usage.csv` is a working example with four made-up accounts. One row is one fact about one account. Keep the rows of each kind oldest first.

Columns, in this order. A cell that does not apply to a kind stays empty.

| Column | Type | Required | What it means |
|---|---|---|---|
| `account_domain` | text | yes | The account's domain, such as `brightwave.example`. The `usage` step matches it against the account's domain, ignoring case. |
| `kind` | text | yes | `quarter`, `month`, `team` or `milestone`. |
| `label` | text | yes | A `quarter` row: the quarter, like `Q3 2026`. A `month` row: the month as it should show on the chart axis, like `Aug`. A `team` row: the team's name. A `milestone` row: what happens, like `Q4 planning call`. |
| `quarter` | text | `month` rows | The quarter the month belongs to, written exactly like the `label` of its `quarter` row. The chart shades the months of this quarter. |
| `marker` | text | no | On `milestone` rows only: `start` (contract start), `review` (the date of this review) or `renewal` (the renewal date). With all three, the page draws the term meter and the cover says "Month 9 of a 12-month term". Leave empty on other milestones. |
| `date` | date | `milestone` rows | `YYYY-MM-DD`. |
| `hours_saved` | number | no | `quarter` rows: hours saved in the quarter. `team` rows: hours that team saved this quarter. |
| `active_seats` | number | no | `quarter` rows: seats active at the end of the quarter. `month` rows: seats active that month. `team` rows: seats active in the team. |
| `seats` | number | no | `quarter` rows: seats on the contract. `team` rows: seats assigned to the team. |
| `tasks_done` | number | no | `quarter` rows: tasks completed in the quarter. |
| `median_hours` | number | no | `quarter` rows: median hours per task, like `3.1`. Lower is better, and the tile says "faster" or "slower". |
| `detail` | text | no | A `quarter` row: the period in words, like `July to September 2026` (it goes on the cover). A `month` row: a note on what happened that month. A `team` row: what the team does with the product, in a sentence. A `milestone` row: one more sentence. Under 240 characters. |

Rules that keep the page right:

- Each account needs at least one `quarter` row. Without it the page shows only its fallback copy. With two, every tile shows its change against last quarter.
- Use at most 50 rows per account (the dataset step reads 50). A year of months, four quarters, ten teams and ten milestones fits.
- Tiles show only the numbers you filled in: leave `tasks_done` empty and the tasks tile is gone.
- The wins come from the `team` rows with the most `hours_saved`, and the plan from `milestone` rows dated after the one marked `review`, so write those details in plain words you are happy to show the customer.
- No email addresses or phone numbers anywhere in the CSV. Ken rejects filled pages that contain them.
- No em dashes or en dashes. Quote any cell that contains a comma.

## Samples

- `brightwave.json`: a freight company in the default brand, filled for one person. All sections.
- `oakline-shared.json`: the shared link (`person` is null), with a dark green primary and serif headings, and a 24-month term.
- `pinecrest.json`: a small account in a bright orange primary with a geometric sans, three teams and a renewal two weeks out.
- `harlow-pike-partial.json`: a thin export with one quarter and three months, so the adoption, wins, plan and renewal sections are hidden.
- `usage.csv`: the CSV the samples' `rows` come from.
