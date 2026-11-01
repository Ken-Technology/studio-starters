# Personal video page
Type: landing_page · Format: page · Library template: video-intro
## Goal
Put the sender's video in front of one account with three reasons the page was made for them, and a booking block under it. Without a video it reads as a written note.
## Who reads it
A decision maker at the account. The copy never sees the person's name, so everyone at an account gets the same text and the page greets them. A shared link (no person) reads "This link is for the team".
## The one ask
Book twenty minutes with the sender.
## Sections
1. Video and intro - the video or a watch link, the title line, the sender and a short intro, with a link to the booking block
2. Why this account - three reasons the page was made for them, each with a heading and what the sender would do about it
3. Pick a time - the twenty-minute invitation, the booking calendar and the signature
## Variables and sources
- `data.video_rows`: `dataset` step on your `videos` CSV, the row where `domain` equals `account.domain`, one row (columns `domain`, `video_url`)
- `data.video_url`: set once in the template as the campaign video; a row in `data.video_rows` wins over it
- `data.title`, `data.intro`, `data.reasons`: Ken writes them (prompt step) from the industry, size band, dossier summary, why-now and angle, `account.signals`, `knowledge.stable` and `knowledge.scoped`
- A grade step checks the title, intro and reasons for banned phrases, dashes, prices and placeholders, with one retry
- `account.name`, `account.domain`, `account.industry`, `account.size_band`
- `person.first_name`, `sender.name`, `sender.title`, `brand.name`, `brand.colors`, `brand.fonts`, `brand.logo_url`
## Tone
One person talking to one company: plain, specific and short, on video with no slides.
## Open questions
- Record the video and set its link as the campaign video (Loom, YouTube, Vimeo or Wistia); without one the page shows as a note
- Optional: upload a `videos` CSV with `domain` and `video_url` for the accounts that get their own recording
- What you sell, written into Knowledge, so the three reasons point at something real
