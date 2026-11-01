# Be our guest
Type: event · Format: page · Library template: podcast-invite
## Goal
Invite one guest at each target account onto the sender's podcast or interview series, with an angle and three questions drawn from the account's own work.
## Who reads it
A senior practitioner at the account, invited by name and title. A shared link (no person) reads as an invitation for the account and "the team".
## The one ask
Pick a time to record, or reply with a week that works. For a written series, say yes and get the questions.
## Sections
1. Invitation - "Be our guest", the show card, the invite line, how long it takes and the sender's signature
2. The angle - the working episode title, what the conversation would cover and three starting questions
3. What it takes - four steps: pick a time, record, approve the cut, it goes out
4. The show - the show's tagline, audience, format, where it is published, the host and recent episodes
5. Book a time - the booking button and a line to reply instead
## Variables and sources
- `data.site`: `scrape.page` on `https://{{ account.domain }}` (markdown, up to 8,000 characters)
- `data.writing`: `scrape.page` on `https://{{ account.domain }}/blog` (up to 6,000 characters)
- `data.invite_line`, `data.episode_title`, `data.angle`, `data.questions`: Ken writes them (prompt step "pitch") from the site, the blog, `account.industry`, `account.size_band`, the dossier summary and why-now, `person.first_name`, `person.title`, `sender.name`, `brand.name` and the show details; a grade step checks all four
- `person.first_name`, `person.last_name`, `person.title`, `account.name`: the greeting, the guest card and the "for" line
- `sender.name`, `sender.title`, `brand.name`, `brand.logo_url`: signature and header; the buttons use `link.booking_url`
- `data.show_name`, `data.show_format`, `data.show_tagline`, `data.audience`, `data.episode_length`, `data.recording`, `data.published_on`, `data.turnaround`, `data.host_about`, `data.recent_episodes`: set once in the template
## Tone
A host writing to a guest: plain words said out loud, no flattery, no "I noticed". The angle ends by saying what the host will not do: no product talk.
## Open questions
- Your show's name, format (video, audio or written), length, audience and where it is published
- Your recent episodes, since the page lists them when you add them
- The booking calendar behind the Pick a time button
