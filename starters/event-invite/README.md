# Dinner or webinar invite

A personal invite with a form that saves the seat. The event details are the same for every account. Only the short note about why this company belongs in the room is written per account.

## Set up your event

Edit the `fallback` values in `studio.json` once:

| Slot | What it is |
|---|---|
| `event_name` | The name on the card |
| `format` | `dinner` or `webinar`. Webinars hide the venue and the dietary field and ask for a job title instead |
| `date_text`, `time_text` | Written the way you'd say them, like "Thursday, November 13" |
| `city`, `venue` | Dinner only |
| `platform` | Webinar only, like "Zoom" |
| `host` | Defaults to the sender's name |
| `guests` | Who is coming, by role. Never names |
| `seats_left` | Shown on the stamp and above the form. At 0 the page says the table is full and the form becomes a waitlist |
| `agenda` | Up to 8 items, each `{time, title, note}` |

Then update the line that starts with "The event" in the `why_you` prompt so the note matches your event.

## What the recipe does

1. `bind` copies `account.dossier.why_now` into `data.why_now`.
2. `prompt` writes `data.why_you`: one or two sentences, from facts only, on why this company should be there.

If the prompt fails, `why_you` falls back to a general line with the account name, so the invite still works.

## Form

The RSVP uses `{% render 'ken/form' %}`, which posts to Ken. Each submission becomes a signal on the account. Dinners ask for name, email, company and dietary needs; webinars ask for name, email, company and title.
