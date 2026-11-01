# Roles for you
Type: recruiting · Format: page · Library template: roles-for-you
## Goal
Show one candidate the open roles that fit their background, each with a one-line reason, so they pick a call about the ones that interest them.
## Who reads it
One candidate, not an account: recruiting pages are per candidate and read the person's current title, employer, skills and experience summary. A shared link (no person) reads "A few roles that might fit you" and lists the roles with no fit lines.
## The one ask
Book a 15-minute intro, on one role or on all of them. Without a booking link the page asks them to reply with times.
## Sections
1. Intro - a headline with their first name, a greeting and why you are writing, signed by the sender
2. The roles - up to four role cards with company, location, remote policy, pay, a "Why you" line, three must-haves, a booking button and a job link
3. Book a call - one 15-minute call that covers all the roles, with the booking button and a way to say none fit
## Variables and sources
- `data.intro`, `data.fits`: Ken writes them (prompt step `fits`) from `roles` and `person.current_title`, `person.current_company`, `person.skills`, `person.experience_summary`; it never sees the name or dates; there is no grade step
- `roles`: the campaign's primary role and extra roles (title, company, location, remote policy, pay range, highlights, job URL), read when the page renders
- The page matches each role to its fit by title; when `data.fits` is empty every role shows with no "Why you" line, and `data.intro` falls back to a general line
- `person.first_name`, `sender.name`, `sender.title`, `brand.logo_url`, `link.booking_url`
## Tone
A recruiter writing to one person: plain, specific, no flattery and no recruiting cliches. Only the work counts, never age, family or school dates.
## Open questions
- The roles on the campaign: each needs a title, pay range, must-haves and job link before the page is useful
- Whether to show every open role to everyone or only the roles that fit
