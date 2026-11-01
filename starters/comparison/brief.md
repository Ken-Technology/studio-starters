# Us vs what you use today
Type: landing_page · Format: page · Library template: comparison
## Goal
Put your product next to the tool one account most likely uses today, row by row, and say plainly where each is the better fit, so a call to check it for their setup is an easy yes.
## Who reads it
A buyer or team lead at the account, named in the byline when there is a person. A shared link (no person) reads "For" the account only.
## The one ask
Book 20 minutes to go through the rows that do not hold for their setup.
## Sections
1. Hero and our guess - the headline, the intro, the tool we think they use and why, and the row count for each side
2. Side by side - one row per criterion with both columns and the better fit marked
3. Where each one fits - when their current tool is the better choice and when you are, plus the rows that are about the same
4. Book a call - the booking button and the sender's signature
## Variables and sources
- `data.catalog`: dataset `comparison`, every row, up to 100; columns `competitor`, `clues`, `criterion`, `us`, `them`, `better_fit`, `note`
- `data.site`: `scrape.page` on `https://{{ account.domain }}`, markdown, up to 12000 characters
- `data.current_tool`, `data.evidence`: Ken writes them (prompt step) from `data.catalog`, `data.site`, `account.industry`, `account.size_band` and `account.dossier.summary`; the tool is copied exactly from the CSV and the evidence has 0 to 3 lines from the site
- `data.rows`: dataset `comparison`, rows where `competitor` equals `data.current_tool`, up to 12
- `data.headline`, `data.intro`, `data.them_fit`, `data.us_fit`: Ken writes them (prompt step) from `data.rows`, `data.evidence`, `data.site` and `account.dossier.why_now`
- A grade step checks those four fields and `data.evidence` for honesty and grounding, with 1 retry
- `account.name`, `account.domain`: headings and footer
- `person.first_name`: the byline
- `sender.name`, `sender.title`, `brand.name`, `brand.logo_url`: byline, product name on the page and signature
## Tone
One person writing to a peer, fair to both sides. The tool is our read, not a fact, and the other tool gets its due.
## Open questions
- Upload the `comparison` CSV: one row per criterion and competitor, with a `better_fit` of `us`, `them` or `either` and a `clues` cell for each tool
- Which tools to compare against, including a no-tool option like spreadsheets, and rows where the other tool wins
- Your name, brand and booking link
