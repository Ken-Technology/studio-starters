# Market opportunity report
Type: report · Format: doc · Library template: market-report
## Goal
Show one account a printable report on its own market, with every number counted in Search, so the sender opens the conversation with three plays built on those counts.
## Who reads it
A senior commercial or strategy lead at the account, named on the cover. A shared link (no person) reads as "Prepared for your team" with the same counts.
## The one ask
Book 30 minutes to go through the list.
## Sections
1. Cover - headline, the total company count, a one-percent-per-square chart of the segments, the standfirst and who it was prepared for
2. In brief - up to five findings, each a counted figure and one sentence
3. Segments - companies by segment as bars, with a lead and a closing line
4. Regions - share of companies by headquarters region as a stacked bar
5. Buyers - people in each buying role at smaller and larger companies (shown only when role counts exist)
6. Growth signals - counts of companies with growth signals and the share of each segment that is hiring
7. Where you sit - companies by size band and the share hiring, with the account's own band marked (shown only when band counts exist)
8. Three plays - three moves for the account, each quoting the counts it rests on
9. Next steps - the booking button, the sender's signature and a short "how this was built" note
## Variables and sources
- `data.scope`, `data.total_defs`, `data.segment_defs`, `data.region_defs`, `data.role_small_defs`, `data.role_large_defs`, `data.signal_defs`, `data.hiring_defs`, `data.band_defs`, `data.band_hiring_defs`: Ken writes the market and the filters (prompt step "plan") from `account.name`, `account.domain`, `account.industry`, `account.size_band`, `account.dossier.summary` and `account.dossier.why_now`; no numbers
- `data.total`, `data.segments`, `data.regions`, `data.roles_small`, `data.roles_large`, `data.signals`, `data.hiring`, `data.bands`, `data.band_hiring`: counted with `ken_search.count` (companies or people) from the matching `*_defs` filters
- `data.headline`, `data.stand`, `data.brief`, `data.narrative`, `data.plays`, `data.method`: Ken writes them (prompt step "report") from the counts, the account facts, `person.first_name` and `sender.name`; a grade step checks all six against the counts and the banned words
- `account.name`, `account.industry`, `person.first_name`, `person.last_name`, `person.title`: the cover, headings and byline
- `sender.name`, `sender.title`, `brand.name`, `brand.logo_url`, `brand.colors`, `brand.fonts`: signature and look; the booking button uses `link.booking_url`
## Tone
A short research report: plain, specific, one person writing to one peer. Counts are quoted, never turned into percentages by Ken, and there is no hype.
## Open questions
- The booking calendar behind the Book 30 minutes button
- Whether the account dossier (industry, size band, why now) is strong enough for Ken to write sound filters, since every count follows from them
