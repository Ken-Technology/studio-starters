# Top 25 list
Type: report · Format: page · Library template: award-list
## Goal
Put one account on a ranked list of companies in its own market that are adding people, so it sees itself next to its peers and takes a call to see the full list.
## Who reads it
A senior operator or founder at the account, named when there is a person ("Made for Sam at Acme"). A shared link (no person) says "Made for" the account only.
## The one ask
Book 20 minutes to get the list with the people behind it.
## Sections
1. Cover - the title, the intro, who it is made for, the account's number on a race bib and four facts about the list
2. Your place - why the account is on the list, up to three dated news items and how its place was set
3. The list - every company ranked by headcount, with the account marked "(you)"
4. How the list was made - the filters in five steps and a funnel from the whole industry down to the pool
5. Next step - the booking button and the sender's signature
## Variables and sources
- `data.industry`: bind from `account.industry`
- `data.signals`: bind from `account.signals`
- `data.counts`: `ken_search.count` of companies in the industry, then with a hiring surge, with headcount up 10% or more, and with both
- `data.candidates`: `ken_search.companies` with industry, a hiring surge (5 net adds in sales, engineering or operations over 6 months) and headcount growth of 10% or more, limit 40
- `data.title`, `data.intro`, `data.entries`, `data.account_rank`, `data.account_line`: Ken writes them (prompt step) from `data.candidates`, `data.signals`, `account.size_band`, `account.dossier.summary` and `account.dossier.why_now`; entries are copied from the candidates only
- A grade step checks `data.entries`, `data.account_line`, `data.title` and `data.intro` for grounded, plain and specific lines
- `account.name`, `account.domain`, `account.industry`, `account.size_band`: the page and the account's row
- `person.first_name`: the "Made for" line
- `sender.name`, `sender.title`, `brand.name`, `brand.logo_url`: the footer and signature
## Tone
One person writing to a peer. Plain, specific, calm, with no claim the company records do not hold. It is your own list, not an award.
## Open questions
- Your name, brand and booking link
- Whether the hiring and growth filters in the recipe fit your market, since they set who is on the list
- Make sure `account.industry` is filled for every account, since the search steps need it
