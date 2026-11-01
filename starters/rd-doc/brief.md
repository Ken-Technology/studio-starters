# Sample outbound campaign doc
Type: reverse_demo · Format: doc · Library template: rd-doc
## Goal
Show one account a free, finished outbound campaign for its own product (strategy, market cuts, sample leads and written emails) so the founder or sales lead wants to talk about running it.
## Who reads it
A founder, head of sales or head of growth at the account, greeted by first name. A shared link (no person) opens with "Hi there" and the emails are signed "The [account] team".
## The one ask
Book 30 minutes to give feedback on the campaign. Without a booking link the page asks for a reply with a time.
## Sections
1. Cover - title, who prepared it, a short note and what is inside
2. Strategy - the one bet, who we go after, the offer, the channels and the two-week goal
3. Segments - a bar chart of the first 1,000 sends across the market cuts, with A vs B ideas for each
4. Funnel - a funnel chart of planning numbers for the first segment and the day-by-day sequence
5. Sample leads - a table of up to 10 people from Search with a one-line reason each
6. Outreach - email 1 and a LinkedIn connect note for up to three of those leads
7. Next steps - what happens next, the offer and the booking button
## Variables and sources
- `data.site`: `scrape.page` on the account's homepage (`account.domain`), as markdown
- `data.dossier`, `data.why_now`: bind from `account.dossier.summary` and `account.dossier.why_now`
- `data.offer`: bind from `knowledge.offer`
- `data.strategy`, `data.segments`, `data.segment_notes`, `data.funnel`, `data.funnel_notes`, `data.search`, `data.sampling_criteria`: Ken writes them (prompt step `plan`) from the site, dossier, why-now and the account's name, domain and industry
- `data.candidates`: `ken_search.people`, up to 30 people found with the filters in `data.search`
- `data.leads`, `data.emails`: Ken writes them (prompt step `copy`) from the candidates, strategy, segments and site; a grade step checks `data.emails` (banned phrases, no dashes, no prices, no unsupported claims)
- `account.name`, `person.first_name`, `person.title`, `sender.name`, `sender.title`, `brand.logo_url`, `brand.colors`, `link.booking_url`
- `data.funnel` has a fallback of 1000 / 460 / 48 / 19 / 9 planning numbers if the plan step does not fill it
## Tone
One person writing to one person: casual, direct, specific, and free with no strings. No "demo", no dashes, no prices, no email addresses.
## Open questions
- The offer in `knowledge.offer`: the low-effort next step the emails ask for
- Who sends it: sender name, title and booking link
