# Peer benchmark report
Type: report · Format: doc · Library template: benchmark-report
## Goal
Put one account next to companies of its industry and size band on a handful of metrics, so it sees where to look first and takes a call to go through the numbers.
## Who reads it
A department lead or founder at the account, greeted by first name. A shared link (no person) opens "Hi there," and the cover names the account only. It downloads as a PDF.
## The one ask
Book 20 minutes to go through the numbers.
## Sections
1. Cover - the title, who it is prepared for and by, a short note and what is inside
2. Summary - the headline, a short summary, what we saw on their site and the one metric to look at first with a chart
3. Benchmarks - every metric with the 25th percentile, median and 75th percentile, and a blank line for their own number
4. Takeaways - three things that stand out, each built on the peer rows
5. Next steps - 2 to 4 actions for this month and the booking button
## Variables and sources
- `data.benchmarks`: dataset `peers`, rows where `industry` equals `account.industry` and `size_band` equals `account.size_band`, up to 12; columns `metric`, `unit`, `better`, `p25`, `median`, `p75`, `sample_size`, `source`
- `data.site`: `scrape.page` on `https://{{ account.domain }}`
- `data.headline`, `data.summary`, `data.focus`, `data.chart`, `data.observations`, `data.takeaways`, `data.next_steps`: Ken writes them (prompt step) from `data.benchmarks`, `data.site`, `account.name`, `account.industry`, `account.size_band` and `account.dossier.summary`; numbers are copied from the rows, never calculated. The step does not run without peer rows, and the page shows its fallback instead
- No grade step; the prompt itself bans dashes, hype words and invented numbers
- `account.name`, `account.domain`: cover and headings
- `person.first_name`, `person.last_name`: greeting and "Prepared for"
- `sender.name`, `sender.title`, `brand.name`, `brand.logo_url`: "Prepared by", cover mark and signature
## Tone
One person writing to one person. Direct and specific, short sentences, numbers quoted from the peer rows.
## Open questions
- Upload the `peers` CSV: one row per industry, size band and metric, with `metric`, `unit`, `better`, `p25`, `median`, `p75`, `sample_size` and `source`
- Which industries and size bands the CSV covers, since an account outside them gets the fallback page with the booking button
- Your name, title, brand and booking link
