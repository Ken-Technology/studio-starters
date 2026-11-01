# We built you a campaign
Type: reverse_demo · Format: page · Library template: rd-ken-native
## Goal
Show one account the six people it should email first and the first emails to them, so the sender can walk through a campaign the account has already half-seen.
## Who reads it
A founder or sales lead at the account, greeted by first name. A shared link (no person) opens with "Hi there" and the emails are signed "Your name".
## The one ask
Book 20 minutes to go through the shortlist and the emails.
## Sections
1. Hero - headline, a short note from the sender and a slip with the counts of people found, shortlisted and emails written
2. Who we looked for - the audience in two or three sentences, with chips for the filters
3. Shortlist - six cards with name, title, company, a one-line reason and a LinkedIn link
4. First emails - up to three first emails with subject, body and an optional PS
5. Next step - "Should I keep going?", what the call covers and the booking button
## Variables and sources
- `data.dossier`, `data.why_now`: bind from `account.dossier.summary` and `account.dossier.why_now`
- `data.search`, `data.brief`, `data.audience`: Ken writes them (prompt step `target`) from the dossier, why-now and the account's industry and size band
- `data.people`: `ken_search.people`, up to 12 buyers found with the filters in `data.search`
- `data.draft`: `ken.copy`, the core of the first email, written once from `data.brief` and `data.audience`
- `data.headline`, `data.intro`, `data.shortlist`, `data.emails`: Ken writes them (prompt step `pick`) from the people, the draft and the audience; a grade step checks `data.emails`
- `account.name`, `person.first_name`, `person.title`, `sender.name`, `sender.title`, `brand.logo_url`, `brand.name`
- `data.audience` falls back to a generic line in the template when it is empty
## Tone
Plain, one person to one person, short sentences a person would say out loud. A first pass from public information, not a pitch.
## Open questions
- Who sends it: sender name, title and booking link
- What the account sells, so `data.brief` and the draft lean on one real fact from the dossier
