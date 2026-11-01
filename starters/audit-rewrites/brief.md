# Website audit with rewrites
Type: audit · Format: page · Library template: audit-rewrites
## Goal
Show one account a free read of its own website: the lines that get in a buyer's way, then three rewrites its team can paste in, so a 20-minute call is worth taking.
## Who reads it
A marketing lead or founder at the account, greeted by first name. A shared link (no person) opens "Hi there," and reads the same.
## The one ask
Book 20 minutes to go through the rest of the site.
## Sections
1. Intro - the headline, a short summary and a count of notes by how much they matter
2. Findings - 4 to 6 quoted lines from their site, worst first, each with what it costs with a buyer
3. Rewrites - three before and after pairs with a one-line reason and a word count
4. Next steps - 2 or 3 small changes for this week and the booking button
## Variables and sources
- `data.site`: `scrape.page` on `https://{{ account.domain }}`
- `data.pricing`: `scrape.page` on `https://{{ account.domain }}/pricing`; when it cannot be read, the notes say nothing about pricing
- `data.headline`, `data.summary`, `data.findings`: Ken writes them (prompt step) from `account.name`, `account.domain`, `account.industry`, `account.dossier.summary`, `data.site` and `data.pricing`; every quote is copied exactly
- `data.rewrites`, `data.next_steps`: Ken writes them (prompt step) from `data.site`, `data.pricing` and `data.findings`
- A grade step checks `data.rewrites` for verbatim "before" lines, specific and shorter "after" lines and plain words, with up to 2 retries
- `account.name`, `account.domain`: title, slug line and closing paragraph
- `person.first_name`: the greeting
- `sender.name`, `sender.title`, `brand.name`, `brand.logo_url`: slug line and signature
- `brand.colors.primary`, `brand.fonts.heading`, `brand.fonts.body`: accent and type, with built-in defaults
## Tone
A sharp copy editor writing to a peer. Plain words, quoted lines, what the buyer thinks next, no hype and no judgement on design.
## Open questions
- Your name, title and brand, so the page is signed as you
- Your booking link, behind the Book 20 minutes button
- Whether the account has a /pricing page; without one the notes cover the homepage only
