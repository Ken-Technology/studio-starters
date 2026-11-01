# Printable checklist
Type: other · Format: doc · Library template: checklist-doc
## Goal
Give one account a useful, printable checklist for a decision its team is likely making, so the sender is the one who helped before any pitch.
## Who reads it
The person at the account who owns that decision, addressed by name and title when there is a person. A shared link (no person) reads "shared with the team".
## The one ask
Book 20 minutes if any check is still open.
## Sections
1. Title and intro - the number of checks, the title, who the list is for and who it is prepared for
2. The checks - 10 to 14 yes or no checks with a one-line why each, tickable and printable, with a running tally
3. Next step - an offer to help with open checks, the booking button and the sender's signature
## Variables and sources
- `data.dossier`: bind from `account.dossier.summary`
- `data.offer`: Ken writes it (prompt step) from the workspace Knowledge (`knowledge.stable`); one or two sentences on what you sell, empty when Knowledge does not say
- `data.title`, `data.intro`, `data.checks`, `data.closing`: Ken writes them (prompt step) from `account.name`, `account.industry`, `account.size_band`, `data.dossier`, `data.offer` and `sender.name`; no check may name or describe your product
- A grade step checks `data.title`, `data.intro`, `data.checks` and `data.closing` for useful, specific and distinct checks, with no sign-off, dashes or placeholders, with 1 retry
- `account.name`: cover and headings
- `person.first_name`, `person.last_name`, `person.title`: the "Prepared for" line
- `sender.name`, `sender.title`, `brand.name`: signature and wordmark
## Tone
A useful document, not a pitch. Plain, short sentences, each check an instruction that starts with a verb.
## Open questions
- Put what you sell in the workspace Knowledge, since Ken uses it to choose which decision the checklist is about
- Whether you want one decision for every account or a decision chosen per account from the dossier
