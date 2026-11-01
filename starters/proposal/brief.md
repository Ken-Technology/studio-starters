# Proposal and pilot plan
Type: other · Format: doc · Library template: proposal
## Goal
Turn the deal notes into a proposal the champion can forward inside the account, with a 30-day pilot, success criteria, timeline, price and a way to approve.
## Who reads it
The champion named on the cover, and the CFO or security lead they forward it to, who were not on the calls. It is written in the third person about the account. A shared link (no person) is prepared for the account itself.
## The one ask
Approve the 30-day pilot plan. The scoping call button comes first when the scope is not yet agreed.
## Sections
1. Cover - the title, a subhead, who it is prepared for and the Book the scoping call button
2. The problem - the problem in the account's own words, quotes from the calls and what it costs today
3. Scope - what is in scope for the pilot and what waits until year one
4. The pilot - the 30-day pilot, its success criteria and the rule for passing
5. Timeline - week by week, with the tasks and owners
6. The team - who works on the pilot on both sides, with their time
7. Investment - the pilot fee and year-one prices, with a total and the terms
8. Next steps - what happens next and a second scoping call button
9. Sign-off - signature lines for both companies and an approve-on-this-page form
## Variables and sources
- `data.notes`, `data.offer`, `data.our_team`: Ken collects them (prompt step "knowledge") from `knowledge.scoped` (call notes and transcripts for this account) and `knowledge.stable` (your offer and team), copied and never added to
- `data.title`, `data.sub`, `data.valid_until`, `data.pilot_window`, `data.problem_when`, `data.problem_lead`, `data.quotes`, `data.cost_source`, `data.cost_today`, `data.problem_close`, `data.scope_lead`, `data.scope_in`, `data.scope_out`, `data.scope_close`, `data.pilot_lead`, `data.criteria`, `data.pass_rule`: Ken writes them (prompt step "story") from the notes, the offer, the account facts, `person.first_name`, `person.title`, `sender.name` and `brand.name`
- `data.timeline_lead`, `data.timeline_span`, `data.weeks`, `data.tasks`, `data.timeline_note`, `data.team_lead`, `data.team`, `data.investment_lead`, `data.investment`, `data.investment_total`, `data.investment_note`, `data.next_steps`, `data.signoff_lead`: Ken writes them (prompt step "plan") from the notes, the offer, the team list and the criteria
- A grade step checks the problem, scope, criteria, tasks, team, investment, next steps and sign-off copy: quotes word for word, only prices from the offer, dates that agree
- `account.name`, `account.domain`, `person.first_name`, `person.last_name`, `person.title`, `sender.name`, `brand.name`: cover, byline, signature lines and the approve form
## Tone
One person writing to a colleague, formal enough to forward: plain, specific, no selling. No placeholders, and no price or date that the notes and offer do not state.
## Open questions
- Put the offer in Knowledge: pilot length, fee, year-one prices and periods, what is not included, tax and billing terms, and how long a proposal stays valid
- Put the deal notes in the account's Knowledge: the problem and its cost, the people, dates and success criteria agreed
- Who from your side works on a pilot, with titles and time, since the team section copies them
- The booking calendar for the scoping call
