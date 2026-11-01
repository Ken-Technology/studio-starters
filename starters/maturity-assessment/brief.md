# Maturity assessment
Type: calculator · Format: page · Library template: maturity-assessment
## Goal
Get one account's operations lead to answer eight questions and see a score, a stage and a peer comparison, so the sender can talk through the weakest areas on a call.
## Who reads it
An operations or process lead at the account, named in the header. A shared link (no person) reads "Prepared for" the account and the result says "self-assessed".
## The one ask
Book 30 minutes to walk through the results.
## Sections
1. Start - the headline, what the quiz covers, the four areas and a Start button
2. Questions - eight questions, one at a time, four answers each
3. Result - the stage, the overall score out of 4, a radar chart and a table of the four area scores next to peers
4. Next steps - the three moves that match the weakest areas, from Ken's four
5. Book a call - the sender, a line on the call and the booking button
## Variables and sources
- `data.peers`: `dataset` step on the `peers` CSV, the row where `industry` equals `account.industry`; columns that matter are `industry`, `peer_group`, `assessments`, `score_1` to `score_4` and `source`. With no match the peer comparison drops out
- `data.headline`, `data.intro`, `data.steps`: Ken writes them (prompt step "copy") from `account.name`, `account.domain`, `account.industry`, `account.size_band`, the dossier summary and why-now, `person.first_name`, `person.title`, `sender.name` and `brand.name`; a grade step checks all three
- `account.name`, `person.first_name`, `person.last_name`, `sender.name`, `sender.title`, `brand.name`, `brand.logo_url`: header, result line and call-to-action
- `data.questions`, `data.dimensions`, `data.stages` and the other fixed content: set once in the template, from their fallbacks (8 questions, 4 areas, 4 stages)
## Tone
One person talking to a peer: plain, specific, a little warm. The page never says how mature the account already is and nothing is scored against them.
## Open questions
- Upload the `peers` CSV with `industry`, `peer_group`, `assessments`, `score_1` to `score_4` and an optional `source`, using only figures you collected
- Whether the eight questions and four area names fit what your product fixes
- The booking calendar behind the Book 30 minutes buttons
