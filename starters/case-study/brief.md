# Built for you case study
Type: landing_page · Format: page · Library template: case-study
## Goal
Show one account the customer story closest to its own situation, retold so it can see itself in it, and turn that into a call.
## Who reads it
A buyer or department lead at the account, named in the kicker when there is a person. A shared link (no person) reads "Picked for" the account.
## The one ask
Book 20 minutes to walk through what the customer did.
## Sections
1. Hero - the headline, a short intro, the customer, the result and the time it took
2. The story - what the customer and the account have in common, where the customer started and what they changed
3. Result and quote - the result figure with its metric and timeframe, and the customer's quote by job title
4. Why it applies - why the story applies to the account and one honest line on what is different
5. Book a call - the booking button and the sender's signature
## Variables and sources
- `data.stories`: dataset `case-studies`, rows where `industry` equals `account.industry`, up to 5
- `data.size_matches`: dataset `case-studies`, rows where `size_band` equals `account.size_band`, up to 8; the backup when no story shares the industry
- `data.headline`, `data.dek`, `data.customer`, `data.customer_about`, `data.parallel`, `data.before`, `data.after`, `data.result`, `data.quote`, `data.fit`: Ken writes them (prompt step) from the two story lists, `account.name`, `account.industry`, `account.size_band`, `account.dossier.summary` and `account.dossier.why_now`; the customer, result and quote are copied from the row word for word
- No grade step; the prompt bans invented numbers, dashes and hype words. With no matching rows the page shows its fallbacks
- `account.name`, `account.domain`: kicker, headings and footer
- `person.first_name`: the kicker
- `sender.name`, `sender.title`, `brand.name`, `brand.logo_url`: "Picked by" line, logo and signature
## Tone
One person telling a peer about a customer. Plain, specific, a little warm, with the results exactly as the customer approved them.
## Open questions
- Upload the `case-studies` CSV: one row per story with `customer`, `industry`, `size_band`, `problem`, `approach`, `result_metric`, `result_value`, `timeframe`, `quote` and `quote_author_title`
- Which customers agreed to be named and which quotes are approved
- Which industries you sell into, since accounts with no same-industry story get a same-size story and a note on what differs
