# Competitive map
Type: report · Format: page · Library template: competitor-map
## Goal
Show one account where it sits among about six companies that sell the same thing, and which open space on the map it could own, so the buyer wants to talk it through.
## Who reads it
A founder, marketing lead or sales leader at the account, who knows the market and will spot a wrong dot. A shared link (no person) reads "For [account]" instead of the first name.
## The one ask
Book 20 minutes.
## Sections
1. Hero - headline, intro, the market counts, who it is for and the booking button
2. The map - the 2x2 with the account and the competitors placed on two axes
3. How each one positions - one line per company on who it sells to and how
4. The open space - the empty area on the map, why nobody sits there and what the account has that fits
5. Book a call - "Does the map match what you see?" with the booking button and the sender's name
## Variables and sources
- `data.market`: `ken_search.count` over companies, two counts: same industry as `account.industry`, and the same industry with growing headcount
- `data.candidates`: `ken_search.companies` in lookalikes mode for the account, up to 8
- `data.site_account`: `scrape.page` of the account's homepage (`account.domain`)
- `data.site_1` to `data.site_6`: `scrape.page` of the homepages of the first six candidates
- `data.headline`, `data.intro`, `data.axes`, `data.competitors`, `data.account_position`, `data.open_space`: Ken writes them (prompt step) from the candidates, the homepages, `account.dossier.summary`, `account.industry` and `account.size_band`; a grade step checks the headline, intro, competitor lines, account position and open space
- `account.name`, `account.industry`, `person.first_name`, `sender.name`, `sender.title`, `brand.name`, `brand.logo_url`: read straight from Kenso
## Tone
One person explaining a map to a peer. Plain, calm, short sentences, and it says a position is a reading of how a company sells, not a measurement.
## Open questions
- The sender's booking calendar for the two Book 20 minutes buttons
- Whether the page should stay first person ("I will move the dots with you") or speak for a team
