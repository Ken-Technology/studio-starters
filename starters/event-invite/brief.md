# Dinner or webinar invite
Type: event · Format: page · Library template: event-invite
## Goal
Fill a small dinner or a short webinar by inviting one person at each target account to save a seat, with a line on why their company belongs in the room.
## Who reads it
A sales or revenue leader at the account, invited by name. A shared link (no person) reads "An invitation for the team at [account]".
## The one ask
Save my seat, through the RSVP form. When no seats are left, the same form becomes a waitlist.
## Sections
1. Invitation - the event name, whether it is a dinner or a webinar, who it is for, the seats stamp and the personal line from the host
2. Details - date, time, venue and city for a dinner or the platform for a webinar, and who else is coming by role
3. Agenda - how the evening runs, or what the webinar covers, as timed items
4. RSVP - seats left, and the form that saves the seat
## Variables and sources
- `data.why_now`: bind from `account.dossier.why_now`
- `data.why_you`: Ken writes it (prompt step) from `account.name`, `account.industry`, `account.size_band`, `account.dossier.summary` and `data.why_now`; a general line with the account name is the fallback
- `data.event_name`, `data.format`, `data.date_text`, `data.time_text`, `data.city`, `data.venue`, `data.platform`, `data.host`, `data.guests`, `data.seats_left` and `data.agenda`: set once in the template
- `account.name`, `person.first_name`, `person.last_name`, `sender.name`, `brand.name`, `brand.logo_url`, `brand.colors`, `brand.fonts`: read straight from Kenso
## Tone
A host writing to a peer. Warm and short, no pitch, no names of other guests.
## Open questions
- Your event: name, dinner or webinar, date, time, and the city and venue or the platform
- Who is coming by role, how many seats are left and the agenda
- The line starting "The event" in the `data.why_you` prompt must match your event
