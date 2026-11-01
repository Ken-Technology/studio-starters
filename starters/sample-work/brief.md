# We did the first piece for you
Type: reverse_demo · Format: page · Library template: sample-work
## Goal
Hand one account a small, finished piece of the work you sell, made from its public site and your Knowledge before it asked, so a call about the full version feels earned.
## Who reads it
A senior buyer at the account for that kind of work, greeted by first name when known. A shared link (no person) addresses nobody by name and shows the account alone in "Prepared for".
## The one ask
Book 20 minutes, or reply to the email the link came with.
## Sections
1. Cover - headline, intro and a slip saying who it was made for and by, what the piece is, what it was built from and that it costs nothing
2. What we looked at - the account's site, up to four news items and your notes on the account
3. The piece - 3 to 5 blocks of the finished work, with lists or a before and after rewrite where they fit
4. The full version - what the full work includes beyond this piece
5. Next step - a soft ask, the booking button and the sender's signature
## Variables and sources
- `data.knowledge`: bind from `knowledge.stable` (what you sell and how you work)
- `data.account_notes`: bind from `knowledge.scoped` (your notes on this account)
- `data.dossier`, `data.why_now`, `data.signals`: bind from `account.dossier.summary`, `account.dossier.why_now` and `account.signals`
- `data.site`: `scrape.page` on the account's homepage (`account.domain`), as markdown
- `data.headline`, `data.intro`, `data.kind`, `data.site_note`, `data.blocks`, `data.full_intro`, `data.full`, `data.closing`: Ken writes them (prompt step `piece`) from those six inputs plus the reader's name and title; a grade step checks all eight
- `account.name`, `account.industry`, `person.first_name`, `person.last_name`, `person.title`, `sender.name`, `sender.title`, `brand.name`, `brand.logo_url`, `link.booking_url`
- If Knowledge says nothing about what you sell, Ken makes no piece: the page shows what was looked at, the fallback headline and intro, and waits
## Tone
One person handing a colleague work just finished: plain, specific, short sentences. Never "demo", "pitch", "free" or "I noticed", and every fact comes from the site, the notes or your Knowledge.
## Open questions
- Knowledge: what you sell, how you work and how you write, since Ken picks the piece from it
- The kind of piece your service can make from public information (a plan, a rewrite, an audit or a target profile)
- Whether to add your own notes on each account in `knowledge.scoped`
