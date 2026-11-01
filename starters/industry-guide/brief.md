# Industry playbook
Type: other · Format: doc · Library template: industry-guide
## Goal
Give one account a short guide with five moves for its industry and the reader's role, so the sender is the person who knew what to do first.
## Who reads it
A leader at the account, written for their title (for example operations or sales). A shared link (no person) is written for the team at the account and the title drops the role.
## The one ask
Book 20 minutes, or reply with the move to talk through.
## Sections
1. Cover - the title, who it was written for and the list of the five moves
2. Move 1 - the smallest change: what it changes, a worked example and a first step for this week
3. Move 2 - the next change, with the same three parts
4. Move 3 - the middle change, with the same three parts
5. Move 4 - a bigger change, with the same three parts
6. Move 5 - the largest change, with the same three parts
7. Where to start - which move to begin with, how the sender helps, the booking button and the news that shaped it
## Variables and sources
- `data.industry`: bind from `account.industry`
- `data.role`: bind from `person.title`
- `data.dossier`: bind from `account.dossier.summary`
- `data.signals`: bind from `account.signals`
- `data.offer`, `data.pov`, `data.account_notes`: Ken writes them (prompt step) from workspace and account Knowledge (`knowledge.stable`, `knowledge.scoped`)
- `data.title`, `data.intro`, `data.moves`, `data.closing`: Ken writes them (second prompt step) from the industry, role, summary, news, offer, point of view and account notes; a grade step checks all four
- `account.name`, `account.size_band`, `person.first_name`, `person.last_name`, `sender.name`, `sender.title`, `brand.name`: read straight from Kenso
## Tone
One experienced person writing to a peer, in second person. Plain, specific, sentence case, with no statistics unless the inputs have them.
## Open questions
- Your offer and how you think the work should be done, in workspace Knowledge; without them Ken writes from an operator's view and the "How we help" box stays empty
- The sender's booking calendar for the Book 20 minutes button
