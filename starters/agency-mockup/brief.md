# Your new homepage, sketched
Type: reverse_demo · Format: page · Library template: agency-mockup
## Goal
Show one account what the top of its own homepage could say, using only words and facts already on its site, so a call to walk through it is an easy yes.
## Who reads it
The head of marketing or a founder at the account, addressed by first name when there is a person. On a shared link (no person) the page opens "This is the top of..." and the header says "Shared with the team".
## The one ask
Book 30 minutes to walk through the sketch, or reply with notes.
## Sections
1. Intro - their headline today next to the sketched one, who it was sketched for and by, and a short summary of what changed
2. The hero - their hero as it reads today, then the sketched hero with numbered marks and a note for each change
3. The section below - the one section after the hero, today's version and the rewrite with its three points and notes
4. Next step - the booking button, a how-this-was-made note and the sender's signature
## Variables and sources
- `data.site`: `scrape.page` on `https://{{ account.domain }}`, markdown, up to 12000 characters
- `data.summary`, `data.today`, `data.sketch`, `data.notes`: Ken writes them (prompt step) from `data.site`, `account.name`, `account.domain`, `account.industry`, `account.dossier.summary`, `brand.name` and `sender.name`; `data.today` is quoted word for word from the site
- A grade step checks `data.summary`, `data.today`, `data.sketch` and `data.notes` for verbatim quotes, true facts, a specific headline, banned words, dashes and prices, with up to 2 retries
- `account.name`, `account.domain`: header, captions and footer
- `person.first_name`, `person.last_name`, `person.title`: the "Sketched for" line
- `sender.name`, `sender.title`, `brand.name`, `brand.logo_url`: the "By" line and the signature
- `brand.colors.primary`, `brand.colors.secondary`, `brand.fonts.heading`, `brand.fonts.body`: accent colours and type, with built-in defaults
## Tone
One designer writing to one person. Plain words, short sentences, nothing the site does not already say, no hype.
## Open questions
- Your name, title, brand colours and fonts, so the page reads as yours
- Your booking link, behind the Book 30 minutes button
- Whether to sketch the homepage or point the scrape at another page, since the layout is one hero plus one section
