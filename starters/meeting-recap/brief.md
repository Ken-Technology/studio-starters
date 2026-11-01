# Meeting recap
Type: other · Format: page · Library template: meeting-recap
## Goal
Send the people on a call a written recap of what was heard, what was agreed and who does what by when, so the deal moves to the next call.
## Who reads it
The person from the account who was on the call, named in the header, who may forward it to their team. A shared link (no person) opens with "Hello," and reads as a recap for the whole account. With no call notes yet, the page says it is still being written up.
## The one ask
Book the next call.
## Sections
1. Title and call details - the title, the date, length and channel of the call, and who was on it from each side
2. Note from the sender - a short first-person thank-you and a request to reply if anything is off
3. What we heard - 3 to 6 topics the account described, each in one to three sentences
4. What we agreed - the decisions from the call, as a numbered list
5. Next steps - a table of what, who and by when, split into the account's tasks and the sender's
6. What we mentioned - the links and resources that came up on the call
7. Book the next call - the booking link and an offer to fix anything that is off
## Variables and sources
- `data.notes`: bind from `knowledge.scoped`, the account's call notes and transcripts
- `data.title`, `data.note`, `data.call`, `data.heard`, `data.agreed`, `data.steps`, `data.resources`, `data.sources`: Ken writes them (prompt step "recap") from `data.notes`, `account.name`, `account.domain`, `person.first_name`, `person.last_name`, `person.title`, `sender.name` and `brand.name`; it uses only the most recent call and returns nothing when there are no call notes
- A grade step checks `data.note`, `data.heard`, `data.agreed` and `data.steps` against the notes: owners named, dates as given, no invented details
- `account.name`, `person.first_name`, `person.title`, `sender.name`, `sender.title`, `brand.name`, `brand.logo_url`: header, greeting and signature
## Tone
One person writing to the people they just met: plain, warm, no flattery. It thanks them for the time and never says "as discussed" or "circle back".
## Open questions
- Get the call notes or transcript into the account's Knowledge before the page is filled
- The booking calendar behind the Book the next call buttons
