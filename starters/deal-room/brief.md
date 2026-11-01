# Deal room
Type: landing_page · Format: page · Library template: deal-room
## Goal
Give everyone on the buying side one live page for an open deal: the next meeting, who does what by when, who is involved and what to read.
## Who reads it
The champion at the account and the colleagues they forward it to, such as a finance or security reviewer. A shared link (no person) reads "Deal room for [account]" with no name, and the note opens without a greeting.
## The one ask
Check the plan and say what is off, then book 20 minutes if it is easier to talk.
## Sections
1. Deal header - the account name, what the room is for, the key facts such as next meeting, stage and decision date
2. Personal note - a short note from the sender on what the page holds and what the reader should check
3. Agenda - the agenda for the next booked meeting, with times, topics and who leads each
4. Action plan - the mutual plan in date order, with who owns each step and what is done
5. People - the people at the account and on your side, names and titles only
6. Resources - what you shared or promised, such as a case study, a security pack, a pricing summary or a recording
7. Book a call - "Need to talk sooner?" with the booking button
## Variables and sources
- `data.notes`: bind from `knowledge.scoped`, the account's deal notes, call transcripts and files
- `data.company`: bind from `knowledge.stable`, your workspace Knowledge on your team and what you share with buyers
- `data.lede`, `data.facts`, `data.agenda`, `data.plan`, `data.their_people`, `data.our_people`, `data.resources`, `data.as_of`: Ken writes them (prompt step) from the notes, the company Knowledge, `account.*`, `person.*` and `sender.*`; the step needs `data.notes`
- `data.note`: Ken writes it (second prompt step) from the notes, facts, agenda, plan and resources; a grade step checks it
- `account.name`, `person.first_name`, `person.last_name`, `person.title`, `sender.name`, `sender.title`, `brand.name`, `brand.logo_url`: read straight from Kenso
## Tone
A colleague writing a plan down for busy people. Plain, specific, a little warm, nothing invented.
## Open questions
- Upload deal notes or call transcripts for each account to Knowledge; without notes the room stays empty
- Add your team, case studies, security pack and pricing summary to workspace Knowledge, with links, so the resources list can use them
- The sender's booking calendar for the two Book 20 minutes buttons
