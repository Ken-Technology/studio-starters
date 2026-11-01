# Congratulations note
Type: other · Format: page · Library template: congrats
## Goal
Congratulate one account on something that just happened to them, give one practical idea for their next 90 days and open a short conversation.
## Who reads it
The person who got the news, or a leader at the account close to it, such as the new hire, the founder or the head of the team. A shared link (no person) greets "To the team at [account]".
## The one ask
Book 15 minutes to talk the idea through.
## Sections
1. Congratulations - the headline naming the occasion, with its date and the source link
2. The note - one to three short paragraphs on what happened and why it matters for a company like theirs
3. One idea for the next 90 days - a single idea they can start without you, with what it gets them
4. Talk it through - a soft offer to talk it over, the booking button and an optional PS on a second piece of news
## Variables and sources
- `data.signals`: bind from `account.signals`
- `data.why_now`: bind from `account.dossier.why_now`
- `data.occasion`, `data.headline`, `data.note`, `data.idea_title`, `data.idea`, `data.ps`: Ken writes them (prompt step) from the signals, `data.why_now`, `account.dossier.summary`, `account.industry`, `account.size_band`, `person.first_name` and `person.title`; a grade step checks the headline, note, idea, ask and PS
- `data.ask`: Ken writes it in the same prompt step and the grade step checks it; the fallback is a 15 minute offer with no slides
- `account.name`, `person.first_name`, `person.last_name`, `person.title`, `sender.name`, `brand.name`: read straight from Kenso
## Tone
One person writing to a peer they respect. Warm, plain, no gushing, no pitch for the product.
## Open questions
- The sender's booking calendar for the 15 minute buttons
- Which kinds of news count as an occasion for your accounts: new role, funding, launch or milestone
