# Readiness checklist
Type: calculator · Format: page · Library template: readiness-checklist
## Goal
Give one account a short checklist on a topic it is getting ready for, with a live score and the first step for each gap, so a call about closing the gaps feels natural.
## Who reads it
The owner of that topic at the account (for example, the person preparing for an audit or a go-live), greeted by name in the byline. A shared link (no person) reads "For the team at the account" and works for the whole team.
## The one ask
Book 20 minutes to go through the gaps together.
## Sections
1. Hero - headline for the account, a short intro and who it is for and from
2. Score - an inspection-tag card with items in place out of the total, a percentage and a level (Early days, On the way, Ready)
3. The checklist - 6 to 12 tick boxes with a detail line each, some pre-ticked with a "Seen:" note
4. Close these first - the unticked items with a first step each, updating as the reader ticks
5. Book a call - a closing line that names the first gap, the booking button and the sender
## Variables and sources
- `data.topic`, `data.checklist`: Ken writes them once (prompt step `checklist`) from `knowledge.stable` (what you sell, who buys and the outcome buyers work toward), with `brand.name` and `sender.name`
- `data.headline`, `data.intro`, `data.items`, `data.closing`: Ken writes them (prompt step `fit`) from the account's name, domain, industry, size band, dossier, why-now and signals, `knowledge.scoped` and the reader's name and title; it ticks an item only when the inputs say it is in place; a grade step checks all four
- `account.name`, `person.first_name`, `person.last_name`, `person.title`, `sender.name`, `sender.title`, `brand.name`, `brand.logo_url`, `brand.colors`, `link.booking_url`
- Until the checklist is written the link shows `fallback.liquid`, a short holding page with the booking button
## Tone
One experienced person telling a peer what to check. Plain words, short sentences, a little warm, no hype words and no pitch inside the checklist.
## Open questions
- Knowledge: your company, who buys and the outcome buyers get ready for, so Ken can pick the topic and write 8 to 10 items
- Whether you want to edit the checklist before it goes out, since every account gets the same items in the same order
