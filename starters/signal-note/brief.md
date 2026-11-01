# Three things we noticed
Type: other · Format: page · Library template: signal-note
## Goal
Show one account that you follow what changes at their company: up to three recent signals, what each usually means and one idea for each. It earns a reply or a booked call without a pitch.
## Who reads it
A leader or manager at the account, written to as a peer by name. A shared link (no person) opens with "Hello," and reads as a note to the team at the account.
## The one ask
Pick a time with the sender, or reply to the message the link came with.
## Sections
1. Title - the month, "Three things we noticed at" the account and who it is for
2. Opening - the greeting and a two-line intro to the monthly note
3. Three signals - one to three numbered signals, each with a headline, the fact, what it usually means and one idea
4. Personal note - a short closing note from the sender, signed
5. Book or reply - the booking button and a line to reply instead
6. Sources - the source of every signal, with a link and the date
## Variables and sources
- `data.raw_signals`: bind from `account.signals` (news, hiring and leader moves on the account)
- `data.careers`: `scrape.page` on `https://<account.domain>/careers`, as markdown, up to 6000 characters
- `data.signals`: Ken writes it (prompt step) from the raw signals, the careers text, the dossier summary and why-now, the industry and size band; it picks the strongest one to three and never invents a fact
- `data.note`: Ken writes it (prompt step) from `data.signals`; it says nothing needs an answer and offers to stop writing
- A grade step checks `data.signals` and `data.note` for banned phrases, dashes, placeholders and prices, with one retry
- `account.name`, `account.domain`, `account.industry`, `account.size_band`, `account.dossier.summary`, `account.dossier.why_now`
- `person.first_name`, `person.last_name`, `person.title`: the greeting and the "For ..." line
- `sender.name`, `sender.title`, `brand.name`, `brand.colors`, `brand.fonts`, `brand.logo_url`: the signature and the look
## Tone
One person writing to a peer. Plain, warm, short sentences, hedged with "usually", no flattery and no "I noticed".
## Open questions
- Which signal types feed `account.signals` for your list (hiring, news, leader moves); with none, the page falls back to the account research notes
- Your booking link, and the sender name and title that sign the note
