# Role pitch for one candidate
Type: recruiting · Format: page · Library template: role-pitch
## Goal
Invite one candidate to a short intro call by showing why their background fits one open role, what the team does and how hiring works.
## Who reads it
One candidate, not an account: recruiting pages are per candidate and read the person's current title, employer, skills and experience summary. A shared link (no person) reads "An open role", greets "Hi there" and falls back to a general line on why they were picked.
## The one ask
Book a 15-minute intro. Without a booking link the page asks them to reply with times.
## Sections
1. Intro - the role title as the headline, company, location, remote policy and pay range, with the booking button
2. Why you - a greeting and two or three sentences tying their work to the role's must-haves, signed by the sender
3. The role - the team and the work, the must-haves, pay, an optional hiring manager video and a link to the job
4. How it works - the hiring steps from a 15-minute intro to an offer
5. Book a call - a short invitation, the booking button and an easy way to say not now
## Variables and sources
- `data.headline`: bind from `role.title`
- `data.why_you`, `data.team`: Ken writes them (prompt step `pitch`) from `person.current_title`, `person.current_company`, `person.skills`, `person.experience_summary` and the role's title, company, description and must-haves; it never sees the name or dates; there is no grade step
- `data.process`: set once in the template, from its fallback (intro, hiring manager, team, offer)
- `data.video`: optional, a Loom, YouTube or Vimeo id; the page leaves it out when empty
- `role.company`, `role.location`, `role.remote_policy`, `role.pay_range`, `role.highlights`, `role.description`, `role.job_url`
- `person.first_name`, `person.last_name`, `sender.name`, `sender.title`, `brand.logo_url`, `link.booking_url`
## Tone
A recruiter writing to one person: plain, specific, no flattery and no recruiting cliches. Only the work counts, never age, family or school dates.
## Open questions
- The campaign's role: title, pay range, location, must-haves and job link, since the page reads them from the role
- The hiring steps in `data.process`, if yours differ from the four shown
- A hiring manager video (Loom, YouTube or Vimeo), if you have one
