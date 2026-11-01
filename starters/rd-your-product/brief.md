# Your product, run on their data
Type: reverse_demo · Format: page · Library template: rd-your-product
## Goal
Run the sender's product on one account's own data and hand over the result: the main number, what it found and what it means, so a call about the full run is an easy yes.
## Who reads it
The person at the account who owns what the product measures (for a site checker, a head of web or growth), greeted by first name. A shared link (no person) opens with "Hi there".
## The one ask
Book 20 minutes to run the product across the whole site and go through the results.
## Sections
1. Result - the headline, the main number with a status meter and the scope of what was checked
2. Findings - up to six findings, most important first, with a count of what to fix first, soon and small, and an optional chart
3. What it means - what the result means for the account, the finding to start with and a link to the full report
4. Next step - "Want the full picture?" and the booking button
## Variables and sources
- `data.metric`, `data.findings`, `data.chart`, `data.chart_title`, `data.scope`, `data.report_url`: your endpoint (webhook step `run`), which Kenso POSTs the account to; `metric` and `findings` are required, the rest are optional
- `data.headline`, `data.meaning`: Ken writes them (prompt step `explain`) from the webhook result and the dossier; a grade step checks that every number comes from the result
- `account.name`, `account.domain`, `account.dossier.summary`, `account.dossier.why_now`
- `brand.name` is the product's name on the page; `person.first_name`, `sender.name`, `sender.title`, `brand.logo_url`
- Until `metric` and `findings` arrive, the link shows `fallback.liquid`, which says the results are on their way
## Tone
Plain and factual, one person sharing what a tool found. Numbers come only from the result; no hype and no promised outcomes.
## Open questions
- The endpoint URL: replace `https://api.your-product.example/ken/studio` in the `run` step with your own, and follow the request and response contract in the README
- The product name in `brand.name`, and the copy in the template that describes the check (it is written for a site speed check)
- Which metric, findings and chart your product can return for any account domain
