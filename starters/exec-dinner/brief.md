# Executive dinner
Type: event · Format: page · Library template: exec-dinner
## Goal
Get one senior buyer at each target account to take a seat at a small, private dinner you host.
## Who reads it
A VP or C-level at the account, invited by name. A shared link (no person) opens with "Hello," and reads as a general invite.
## The one ask
Hold my seat, through the reply card.
## Sections
1. Invitation - headline, subline, date, time, venue and an add-to-calendar link
2. Personal note - why this guest, written by Ken from the account's news and the guest's title
3. The table - the table plan with the guest's seat marked, the other guests by title, the host and the featured guest
4. The evening - the topic, the menu and how the night runs
5. RSVP - the reply card with name, email, guests and dietary needs
## Variables and sources
- `data.why_now`: bind from `account.dossier.why_now`
- `data.invitee_title`: bind from `person.title`
- `data.why_you`: Ken writes it (prompt step) from the account summary, industry, size, why-now, the guest's title and the dinner's topic; a grade step checks it
- `data.headline`, `data.subline`, `data.date_text`, `data.time_text`, `data.venue`, `data.host`, `data.featured_guest`, `data.guests`, `data.topic`, `data.menu`, `data.run_of_show` and the other evening details: set once in the template
- `account.name`, `person.first_name`, `sender.name`, `brand.name`: read straight from Kenso
## Tone
Warm and exclusive, a host writing to a peer. Short lines, no sales pitch, no slides.
## Open questions
- The city, venue, date and time of your dinner, plus the start and end for the add-to-calendar link
- Who hosts, who the featured guest is, and the guest list by title and type of company
- The topic, the menu and the reply-by date
