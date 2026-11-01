# Monthly brief
Type: other · Format: page · Library template: newsletter
## Goal
Send one account a one-screen monthly brief with a note on its industry, one idea drawn from its own site and one resource from the sender, so the sender stays in touch until the account is ready to talk.
## Who reads it
A named lead at the account, reading on a phone. A shared link (no person) greets "Hi there," and is addressed to the account.
## The one ask
Book 15 minutes if one of the three parts is worth a conversation. Otherwise the next brief comes in a month.
## Sections
1. Masthead and intro - the account's name, the headline for the month, a greeting and a one-line intro, next to an envelope addressed to the reader
2. Industry note - an observation on the account's industry, with a line on what on their site prompted it
3. One idea - something the account could do this month, with a first step
4. Resource - one item from the sender's material, with a link when it has one
5. Sign-off and call - the booking button, the sender's signature and an optional PS
## Variables and sources
- `data.site`: `scrape.page` on `https://{{ account.domain }}` (markdown, up to 10,000 characters)
- `data.headline`, `data.intro`, `data.note`, `data.idea`, `data.resource`, `data.ps`: Ken writes them (prompt step "write") from `data.site`, `knowledge.stable`, `account.name`, `account.industry`, `account.size_band`, the dossier summary and why-now, `person.first_name`, `person.title`, `sender.name` and `brand.name`; a grade step checks all six
- `account.name`, `person.first_name`, `person.last_name`, `person.title`: the envelope and greeting
- `sender.name`, `sender.title`, `brand.name`, `brand.logo_url`: the return address and signature; the button uses `link.booking_url`
## Tone
One person writing to a peer: short sentences, short paragraphs, readable in under three minutes. No newsletter talk and no invented facts.
## Open questions
- Add the material Ken may pick the resource from (guides, posts, tools) to Knowledge; with none, the resource part asks the reader to reply
- The booking calendar behind the Book 15 minutes button
- How often you send it, since the footer promises once a month
