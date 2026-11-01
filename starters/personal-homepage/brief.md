# Your homepage, for them
Type: landing_page · Format: page · Library template: personal-homepage
## Goal
Rewrite the sender's homepage for one account, using facts from its own site, so the reader sees what the sender would do for their team and books a time.
## Who reads it
Someone on the team that would use the product, named in the "A page for" line and written for by role. A shared link (no person) reads as a page for the team at the account.
## The one ask
Book 20 minutes with the sender.
## Sections
1. Hero - the headline for the account's industry, a two-sentence subhead, who the page is for and three facts we noticed on their site, each with a source
2. Use cases - three rows set as "Today at [account]" against "With [sender]"
3. Customer story - the closest customer story with a quote and a bar chart (hidden when no story matches)
4. Rollout - a three-step plan that starts small
5. Questions - a short FAQ
6. Book a time - the sender's name and an inline booking calendar
## Variables and sources
- `data.site`: `scrape.page` on `https://{{ account.domain }}` (markdown, up to 12,000 characters)
- `data.careers`: `scrape.page` on `https://{{ account.domain }}/careers` (up to 6,000 characters)
- `data.signals_raw`: bind from `account.signals`
- `data.product`: Ken writes it (prompt step "product") from `knowledge.stable` and `brand.name`
- `data.hero`, `data.noticed`, `data.uses_lead`, `data.uses`, `data.rollout_lead`, `data.rollout`, `data.faq`: Ken writes them (prompt step "write") from the site, the careers page, the news, `data.product`, the account facts, `person.first_name`, `person.title` and `sender.name`; the step needs `data.site`
- `data.stories`: `dataset` step on the `customer-stories` CSV, rows where `industry` equals `account.industry` (up to 3); columns that matter are `industry`, `size_band`, `summary`, `quote`, `chart_title` and `chart_points`
- `data.story`: Ken picks the closest row (prompt step "peer_story") and copies its numbers into the chart
- A grade step checks the copy and `data.story`: every noticed fact must be on the site or in the news
- `account.name`, `person.first_name`, `person.last_name`, `sender.name`, `sender.title`, `brand.name`, `brand.logo_url`: header, memo line and booking block
## Tone
One person writing to one team: plain, specific, no marketing adjectives. It says what was seen and invites a correction.
## Open questions
- Add what you sell, who it is for and how a rollout runs to Knowledge, since every use case and rollout step comes from it
- Optional: upload a `customer-stories` CSV (`industry`, `size_band`, `summary`, `chart_title`, `chart_points`, with `quote` and `quote_author_title` optional); without it the customer story hides
- The booking calendar behind the Book 20 minutes buttons
