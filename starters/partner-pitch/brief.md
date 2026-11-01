# Partnership pitch
Type: landing_page · Format: page · Library template: partner-pitch
## Goal
Show one potential partner that the two customer bases overlap, with a joint offer and a first step small enough to say yes to.
## Who reads it
A partnerships or leadership contact at the partner company, named in the "To" line. A shared link (no person) is addressed to "Partnerships and leadership" at the account.
## The one ask
Book a 30 minute call to compare customer lists.
## Sections
1. Opening - "[your company] and [their company]", the two-circle motif, the headline, a summary, from, to, why now and a booking button
2. Where customers meet - who they serve, who we serve and the shared customer in the middle
3. Example companies - four to six companies from a company search that fit both customer bases
4. The joint offer - what the customer gets, what each side brings and how it runs
5. First step - the smallest next step, what is needed from them and the booking button
## Variables and sources
- `data.knowledge`: bind from `knowledge.stable`, the notes about what you sell and who buys it
- `data.why_now`: bind from `account.dossier.why_now`
- `data.site`: `scrape.page` on `https://{{ account.domain }}` (markdown, up to 12,000 characters)
- `data.partner_customers`, `data.partner_offer`, `data.search`: Ken writes them (prompt step "read") from `data.site`, `data.knowledge`, `account.industry` and `account.size_band`
- `data.candidates`: `ken_search.companies` with the filters in `data.search` (12 companies)
- `data.examples`: Ken picks them (prompt step "examples") from `data.candidates`, `data.partner_customers` and `data.knowledge`
- `data.headline`, `data.summary`, `data.our_customers`, `data.our_offer`, `data.overlap`, `data.offer`, `data.first_step`: Ken writes them (prompt step "pitch") from the notes, the site text, the examples and why-now; a grade step checks these and `data.examples`
- `account.name`, `person.first_name`, `person.title`, `sender.name`, `sender.title`, `brand.name`, `brand.logo_url`: header, memo lines and signature; the buttons use `link.booking_url`
## Tone
One person proposing a small experiment to a peer: plain and specific, no "synergy" or "win-win". Neither side names a customer.
## Open questions
- Add notes on what you sell and who buys it to Knowledge; without them the pitch step returns nothing and the page shows its fallback
- The booking calendar behind the Book 30 minutes buttons
- Whether you can promise the joint offer's steps (a co-hosted webinar, a referral, a bundle) before the page goes out
