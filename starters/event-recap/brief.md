# Sorry we missed you
Type: event · Format: page · Library template: event-recap
## Goal
Get someone who registered for a webinar and missed it to watch the right part of the recording, then talk it through with the sender.
## Who reads it
A registrant at the account, who gets takeaways picked for their title and company. A shared link (no person) reads "Three things for [account]" and "Picked for [account]" with no role.
## The one ask
Book 20 minutes.
## Sections
1. Intro - "You missed it." with the sender's name and a button to watch from the chapter picked for this reader
2. Recording and chapters - the video player with the chapter list
3. Three takeaways - three takeaways for the reader's role, each linked to its chapter
4. Slides - the slide pages and a download link (hidden when there are none)
5. Transcript excerpt - a few transcript lines and a link to the full transcript (hidden when there is none)
6. Book a call - a short offer to talk, with the booking button
## Variables and sources
- `data.start_at`, `data.takeaways`: Ken writes them (prompt step) from `defaults.chapters`, `defaults.transcript`, `defaults.event_title`, `person.title`, `account.industry`, `account.size_band`, `account.dossier.summary` and `account.dossier.why_now`; a grade step checks the takeaways against the chapter list
- `data.event_title`, `data.recorded_on`, `data.speakers`, `data.video_url`, `data.duration_seconds`, `data.chapters`, `data.slides_url`, `data.slide_pages`, `data.slide_count`, `data.transcript`, `data.transcript_url`, `data.book_title`, `data.book_text` and `data.book_label`: set once in the template
- `account.name`, `person.title`, `person.first_name`, `person.last_name`, `sender.name`, `sender.title`, `brand.name`, `brand.logo_url`: read straight from Kenso
## Tone
One person telling a peer what to watch. Plain and specific, no pitch for the product.
## Open questions
- The recording: video link, length and who spoke
- Chapters with start label, seconds, title and a one line summary; the takeaways are built from these
- Slides and a transcript excerpt, if you want those sections to show
- The wording and booking calendar for the final offer
