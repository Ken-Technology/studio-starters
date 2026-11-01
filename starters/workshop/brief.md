# Workshop invite
Type: event · Format: page · Library template: workshop
## Goal
Fill a small, hands-on workshop with people from your target accounts. The page holds a seat for one person and explains why it fits their company and what their team would take home.
## Who reads it
A manager or practitioner at the account who runs the work the workshop covers, invited by name. A shared link (no person) reads "A seat held for" the account.
## The one ask
Hold a seat (the seat form), or join the waitlist when the room is full.
## Sections
1. Invitation - the title, the tagline and a seat held for them
2. When and where - the seat plan, date, time, venue or platform, seats left, host and a seat button
3. Personal note - why the workshop fits their company, written by Ken and signed by the sender
4. What you leave with - what their team takes home, written by Ken
5. Agenda - the hour by hour run, marking breaks, talks and hands-on parts
6. What to bring - the list of things to bring, who it is for and the group size
7. Host - the host's name, role and a short note on how they run it
8. Seat form - the form with name, email, company, title and a note
## Variables and sources
- `data.why_now`: bind from `account.dossier.why_now`
- `data.why_you` and `data.leave_with`: Ken writes them (prompt step) from the industry, size band, dossier summary, why-now, the default agenda and `data.leave_with`, with the sender and brand names
- A grade step checks `data.why_you` and `data.leave_with` for banned phrases, dashes, placeholders and prices, with one retry
- `account.name`, `account.industry`, `account.size_band`, `person.first_name`, `person.last_name`
- `sender.name`, `sender.title`, `brand.name`, `brand.colors`, `brand.fonts`, `brand.logo_url`
- `data.title`, `data.tagline`, `data.format`, `data.date_text`, `data.time_text`, `data.venue`, `data.city`, `data.platform`, `data.seats`, `data.seats_left`, `data.audience`, `data.agenda`, `data.bring`, `data.host_note` and `data.confirm_note`: set once in the template
## Tone
A host writing to a peer: practical and small-room, no pitch and no flattery.
## Open questions
- The workshop itself: title, date, time, city and venue (or platform if online), and the real agenda
- The number of seats and seats left, since the seat plan and the waitlist switch on them
- What to bring, who it is for, and what you want people to write in the seat form note
