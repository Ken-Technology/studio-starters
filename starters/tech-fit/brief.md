# Fits your stack
Type: landing_page · Format: page · Library template: tech-fit
## Goal
Show one account how your product plugs into the tools it likely runs, guessed from its site and careers page and matched to your integration list. A technical buyer sees fit before the first call.
## Who reads it
A technical or operations buyer at the account (IT, RevOps, an ops lead). A shared link (no person) reads "Prepared for" the account name.
## The one ask
Book 20 minutes to agree which tool to connect first, or reply to correct a wrong guess.
## Sections
1. Hero - the headline, the intro, who it is prepared for, a booking button and a strip of the guessed stack on your product's line
2. Tools we spotted - each guessed tool with its category, the clue from their page and whether it connects
3. How it plugs in - one block per tool you connect to, with how it connects, what moves, setup and what changes for their team
4. Setting it up - the setup note for each matched integration, in order
5. Also in our list - the other integrations in your list and the guessed tools that are not in it yet
6. Next step - the closing note, the booking button and the sender's signature
## Variables and sources
- `data.integrations`: `dataset` step on your `integrations` CSV, up to 60 rows (columns `tool`, `category`, `aliases`, `connection`, `summary`, `syncs`, `setup`, `docs_url`)
- `data.site`: `scrape.page` on `https://<account.domain>`, as markdown, up to 12000 characters
- `data.careers`: `scrape.page` on `https://<account.domain>/careers`, as markdown, up to 12000 characters
- `data.tools`: Ken writes it (prompt step) from the site and careers text, spelled as your CSV spells them; at most 8 tools, each with a clue and a source
- `data.headline`, `data.intro`, `data.matches`, `data.closing`: Ken writes them (prompt step) from the guessed tools, your CSV rows and the dossier summary
- A grade step checks the copy for dashes, hype, placeholders, prices and sign-offs, then a judge scores honesty and grounding, with one retry
- `account.name`, `account.domain`, `account.dossier.summary`, `person.first_name`, `person.last_name`, `person.title`, `sender.name`, `sender.title`, `brand.name`, `brand.colors`, `brand.fonts`, `brand.logo_url`
## Tone
One person writing to a peer. Plain and honest: every tool is a guess and says so, and nothing is claimed that your CSV does not say.
## Open questions
- Upload your `integrations` CSV, one row per integration that works today, with `tool`, `category`, `connection` and `summary` filled in
- Which integrations to keep in the list, since every row is shown as "connects today"
