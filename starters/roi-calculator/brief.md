# ROI calculator
Type: calculator · Format: page · Library template: roi-calculator
## Goal
Give one account a worksheet with live sliders that turns its manual work into a yearly cost, savings, payback and a 3-year return, so the call starts from numbers the reader has already adjusted.
## Who reads it
An operations, finance or department lead at the account who would own the business case, greeted by name in the header. A shared link (no person) reads "Prepared for" the account alone.
## The one ask
Book 30 minutes to go through the four inputs with your own figures.
## Sections
1. Intro - who it is prepared for and why the four starting values are estimates
2. Result - annual savings, 3-year net return, return on cost, hours back a year and tool spend that goes away
3. Your inputs - sliders for people on the work, hours a week, loaded hourly cost and current tool spend, each with Ken's reason
4. Return chart - cumulative return by quarter, net of platform cost and setup fee
5. Where it comes from - the ledger of hours and tool spend behind the savings
6. Book a call - "Walk through the numbers" with the sender and the booking button
7. Assumptions - weeks per year, share of hours recovered, tool spend replaced, price per person, ramp and what is not included
## Variables and sources
- `data.offer`: Ken reads it from `knowledge.stable` (prompt step `offer`): seat price, setup fee, share of hours recovered, share of tool spend replaced and ramp months, each only when Knowledge states it
- `data.work_name`, `data.team_size`, `data.hours_per_week`, `data.hourly_cost`, `data.tool_spend`, `data.reasons`: Ken writes them (prompt step `inputs`) from the account's industry, size band and dossier, and `knowledge.stable`; a grade step checks that the estimates are plausible
- `account.name`, `account.industry`, `account.size_band`, `person.first_name`, `person.last_name`, `sender.name`, `sender.title`, `brand.name`, `brand.logo_url`, `link.booking_url`
- Without a seat price the page shows savings only and says platform cost is not included; the share and ramp default to 40%, 50% and 6 months
- Until the worksheet is filled the link shows `fallback.liquid`, a holding page with the booking button
## Tone
One person writing to a peer, plain and a little warm. Every number is called an estimate or an assumption, never a study, a survey or a customer result.
## Open questions
- Knowledge with your pricing: price per seat, setup fee, share of hours your product takes back, share of tool spend it replaces and months to reach the full result
- Whether to show cost and payback at all, or savings only when you have no list price to share
