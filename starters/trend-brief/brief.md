# Trend brief
Type: report · Format: doc · Library template: trend-brief
## Goal
Give one account a short brief on three things moving in its industry, each backed by a count of companies from Kenso Search, with what each means for them. It prints to PDF.
## Who reads it
A leader at the account who cares about the market (a founder, a head of strategy or growth). A shared link (no person) reads "Prepared for the team at" the account.
## The one ask
Book 20 minutes to go through the companies behind the counts. With no booking link the page asks for a reply with a time.
## Sections
1. Cover - the baseline count, the three trends as bars with share of the baseline, the headline and the dek
2. Trend 1 - the first count, its share, how it was counted, what the count says and what it means for the account
3. Trend 2 - the same for the second trend, set on a full colour page
4. Trend 3 - the same for the third trend
5. What to do with this - where to start, where you fit if the workspace has an offer, the booking button and the signature
## Variables and sources
- `data.segments` and `data.plan`: Ken writes them (prompt step) from the industry, size band, dossier summary and why-now; four segments (the baseline plus three signals out of six) and three plan items
- `data.counts`: `ken_search.count` tool on `data.segments` with kind `companies`
- `data.headline`, `data.dek`, `data.trends`, `data.so_what`, `data.offer`: Ken writes them (prompt step) from the plan, the counts, the dossier and `knowledge.stable`
- A grade step checks the headline, dek, trends and so-what for banned words, dashes, placeholders and prices, with one retry
- `account.name`, `account.domain`, `account.industry`, `account.size_band`, `account.dossier.summary`, `account.dossier.why_now`
- `person.first_name`, `person.last_name`, `person.title`, `sender.name`, `sender.title`, `brand.name`, `brand.colors`, `brand.fonts`, `brand.logo_url`, `link.booking_url`
## Tone
A knowledgeable peer: plain words, counts and shares stated as counts, no hype and no forecasts.
## Open questions
- What you sell, written into Knowledge, so the "where you fit" paragraph can be filled
- Whether every account has an industry that matches a Kenso Search industry, since the counts filter on it
- Your booking link, so the button shows instead of the reply line
