# See you at the conference
Type: event · Format: page · Library template: conference-meetup
## Goal
Book a 20 minute meeting with one account at a conference you both attend, at the booth or over a coffee nearby.
## Who reads it
A buyer at the account who is already going to the show, reading on a phone between sessions. A shared link (no person) drops the greeting and reads "For the team at [account]".
## The one ask
Pick a time at the show.
## Sections
1. See you there - the conference name, dates and venue, the booth number on a sign and who the page is for
2. Personal note - a short note from the sender on why 20 minutes with this account is worth it, written by Ken
3. At the booth - the booth note and the hours for each day, with who is there
4. Our session - the talk title, day, time, stage and speaker (shown only when a talk is set)
5. Side events - the dinners, breakfasts and panels the sender will attend, grouped by day
6. Pick a time - where to find the booth and the booking calendar
## Variables and sources
- `data.why_now`: bind from `account.dossier.why_now`
- `data.personal_line`: Ken writes it (prompt step) from `account.dossier.summary`, `data.why_now`, `account.industry` and `account.size_band`; a grade step checks it
- `data.conference_name`, `data.dates_text`, `data.venue`, `data.city`, `data.hall`, `data.booth`, `data.booth_note`, `data.booth_hours`, `data.side_events` and `data.talk`: set once in the template
- `account.name`, `person.first_name`, `person.last_name`, `person.title`, `sender.name`, `sender.title`, `brand.name`, `brand.logo_url`, `brand.colors`, `brand.fonts`: read straight from Kenso
## Tone
A colleague at the next stand, easy and practical. Short lines, a concrete reason to meet, no sales pitch.
## Open questions
- Your conference, dates, venue, hall and booth number
- Who is at the booth each day, and your hours
- Whether you speak (the Our session section stays hidden without a talk) and which side events you will attend
- The booking calendar for the Pick a time slots
