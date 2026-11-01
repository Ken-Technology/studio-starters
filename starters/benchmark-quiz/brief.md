# How do you compare
Type: calculator · Format: page · Library template: benchmark-quiz
## Goal
Get one account to answer five quick questions about how it runs its work, then see where it stands against peers in its industry, so a call about the gaps is the obvious next step.
## Who reads it
An operations or department lead at the account, named in the header when there is a person. A shared link (no person) reads "For" the account only.
## The one ask
Book 20 minutes to go through the five answers with the sender.
## Sections
1. Intro - the title, one line on why the five questions are worth two minutes and who it is for and from
2. Five questions - one tap per question, four options each, weakest to strongest
3. Where you stand - questions ahead of peers, the share of peers behind them and a row per question with the peer spread and a one-line read on the gap
4. Book a call - the booking button and the sender's signature
## Variables and sources
- `data.peers`: dataset `peer-answers`, rows where `industry` equals `account.industry`, up to 10; columns `industry`, `question`, `n_1` to `n_4` and `source`
- `data.intro`: Ken writes it (prompt step) from `account.name`, `account.industry`, `account.size_band`, `account.dossier.summary`, `account.dossier.why_now` and the questions; a grade step checks it
- `data.lines`: Ken writes it (prompt step) from `data.peers` and the questions, an ahead, level and behind line per question; a grade step checks it, and the step does not run without peer rows
- `account.name`, `account.industry`: headings and the peer group
- `person.first_name`, `person.last_name`: header and footer
- `sender.name`, `sender.title`, `brand.name`, `brand.logo_url`: header, signature and footer
- `data.topic`, `data.questions`: set once in the template, from their fallbacks
## Tone
Plain and fair, a peer sharing a quick benchmark. Behind lines describe the usual next step without blame, and no number comes from anywhere but the CSV.
## Open questions
- Upload the `peer-answers` CSV: one row per industry and question, with `industry`, `question`, `n_1` to `n_4` (counts, weakest option first) and a `source`
- Replace the five example questions and `data.topic` (the template ships with field service questions) with your own, keeping the question keys in step with the CSV
- Which industries your CSV covers, since an account with no rows sees only its own answers
