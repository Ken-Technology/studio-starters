# Website conversion audit
Type: audit · Format: page · Library template: site-audit
## Goal
Give one account a free, scored review of its own website, read as a first-time visitor would, with two rewrites and three fixes. The sender earns a call by showing the work first.
## Who reads it
The person who owns the website or the pipeline at the account (marketing, growth or a founder). A shared link (no person) greets "Hi there" and reads as an audit for the team at the account.
## The one ask
Book 20 minutes to go through the rest of the site.
## Sections
1. Intro - the audit title with the domain, the one thing that most gets in a visitor's way, a short lead and a booking button
2. Score - a conversion score out of 100 and six bars scored out of 10
3. Findings - for each of the six criteria, the quote copied from their site, where it sits and what it costs a visitor
4. Rewrites - two rewrites, the hero headline and the main button, each shown next to the current text
5. First screen - a sketch of the first screen with a note on the headline, subline, main button, navigation and proof row
6. Top fixes - three fixes in order, each with what to change and how long it takes
7. Booking - the closing note, the sender's signature and the booking button
## Variables and sources
- `data.site`: `scrape.page` on `https://<account.domain>`, up to 12000 characters
- `data.about`: `scrape.page` on `https://<account.domain>/about`, up to 6000 characters
- `data.headline`, `data.criteria`, `data.callouts`, `data.fixes`: Ken writes them (prompt step) from the homepage text, the About text, the industry, size band and dossier summary; six scored criteria with exact quotes
- `data.rewrites`: Ken writes it (prompt step) from the site text and `data.criteria`
- A grade step checks `data.rewrites` for banned words, dashes, placeholders and prices, with two retries
- `account.name`, `account.domain`, `account.industry`, `account.size_band`, `account.dossier.summary`
- `person.first_name`, `person.last_name`, `person.title`, `sender.name`, `sender.title`, `brand.name`, `brand.colors`, `brand.fonts`, `brand.logo_url`
## Tone
A reviewer talking to a peer: direct, honest about strengths and weaknesses, plain words, quotes their own copy word for word.
## Open questions
- Your booking link, since the page has two booking buttons
- Which accounts have a readable homepage; the audit does not run when `data.site` is empty
