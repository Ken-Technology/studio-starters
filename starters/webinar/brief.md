# Webinar invite
Type: event · Format: page · Library template: webinar
## Goal
Get one person at each target account to register for a live session you host, with the start time shown in their own time zone. The takeaways are written for their role and company.
## Who reads it
A manager or leader at the account, invited by name. A shared link (no person) opens with "Hello," and reads as an invite for the team at the account.
## The one ask
Save a seat in the session (the registration form).
## Sections
1. Session and time - the series name, title, subtitle, date, where, start times by city, the seat button and the recording note
2. Note from the host - a short note on why this person should come, signed by the sender
3. Speakers - the speakers, each with a role and one line
4. Agenda - the run of the session with times and minutes
5. What you take away - takeaways written for their role and company
6. Register - the form with name, email, company and title, and a note on the recording
## Variables and sources
- `data.why_now`: bind from `account.dossier.why_now`
- `data.why_you` and `data.takeaways`: Ken writes them (prompt step) from the industry, size band, dossier summary, `person.title`, why-now, and the default agenda and speakers
- `data.local_zone`: Ken picks it (prompt step) from the headquarters city in the dossier, as one of the listed zones; empty when the city is not stated
- A grade step checks `data.why_you` and `data.takeaways` for banned phrases, dashes, placeholders and prices, with one retry
- `account.name`, `account.domain`, `account.industry`, `account.size_band`, `person.first_name`, `person.last_name`, `person.title`
- `sender.name`, `sender.title`, `brand.name`, `brand.colors`, `brand.fonts`, `brand.logo_url`
- `data.kicker`, `data.title`, `data.subtitle`, `data.date_text`, `data.where_text`, `data.zones`, `data.speakers`, `data.agenda`, `data.recording_note`, `data.register_note` and `data.calendar_url`: set once in the template
## Tone
A host inviting a peer: warm, concrete and short, no hype.
## Open questions
- Your session: title, date, time and the cities shown, plus the online link or venue note
- The real speakers and agenda; the template ships with placeholder names
- The add-to-calendar link in `data.calendar_url`, which hides the button when empty
