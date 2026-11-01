# Quarterly value review
Type: report · Format: doc · Library template: value-review
## Goal
Show one existing customer what they got from the product this quarter, against last quarter, and agree the plan for the next one. It supports the renewal conversation with their own usage numbers.
## Who reads it
The customer's champion or the executive who signs the renewal. A shared link (no person) reads "Prepared for the team" at the account.
## The one ask
Book the planning call for next quarter.
## Sections
1. Cover - the account and quarter, the headline sentence and who it is prepared for
2. Headline outcomes - stat tiles for hours saved, active seats, tasks completed and median time per task, with the change against last quarter
3. Usage by month - a chart of active seats per month, the contract seats as a line and a short note
4. Adoption by team - active seats against assigned seats for each team, with a short note
5. Three wins - one win per team, each with a stat, a title and a line
6. Plan for next quarter - a table of when, what and who
7. Renewal timeline - the term meter and the dated milestones up to renewal
8. Next step - a closing note, the booking button and where the numbers come from
## Variables and sources
- `data.rows`: `dataset` step on your `usage` CSV, rows where `account_domain` equals `account.domain`, up to 50 (columns `kind`, `label`, `quarter`, `marker`, `date`, `hours_saved`, `active_seats`, `seats`, `tasks_done`, `median_hours`, `detail`)
- `data.headline`, `data.usage_note`, `data.adoption_note`, `data.wins`, `data.plan`, `data.next_note`: Ken writes them (prompt step) from `data.rows` only
- A grade step checks that every number matches the rows and the copy is plain, with one retry
- The tiles, deltas, chart, bars and timeline are computed from `data.rows` by the template, never written by Ken
- `account.name`, `account.domain`, `person.first_name`, `person.last_name`, `person.title`, `sender.name`, `sender.title`, `brand.name`, `brand.colors`, `brand.fonts`, `brand.logo_url`
## Tone
A customer success lead reporting to a partner: factual, specific, numbers from the export, no hype.
## Open questions
- Upload your `usage` CSV with one `quarter` row per quarter, `month`, `team` and `milestone` rows, and the account's domain in `account_domain`
- Mark the contract start, this review and the renewal date with the `marker` column so the term meter shows
- Write the `detail` cells in plain words you are happy to show the customer, since the wins and plan come from them
