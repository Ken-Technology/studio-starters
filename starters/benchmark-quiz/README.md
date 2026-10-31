# How do you compare

Five quick questions, then where the account stands against peers in its industry, with one line on each gap. The reader taps an answer per question. Once all five are in, the page shows how many questions they are ahead on, their average standing, and for each question how the peers answered, where the reader sits, and one line on what that gap usually means. The page ends with a booking button.

The questions are template slots: edit the `questions` fallback in `studio.json` once, for your own product and buyer. The peer answers come from a CSV you upload. The interaction runs on the Alpine CSP build with no inline script, and with JavaScript off the page still shows the intro and the five questions.

## How it fills

1. `peers` (`dataset`): the rows of your `peer-answers` dataset where `industry` equals the account's industry, up to 10, into `data.peers`.
2. `intro` (`prompt`): one sentence on why the five questions are worth two minutes for this account, from the dossier only.
3. `lines` (`prompt`, requires `data.peers`): for each question, three one-sentence lines (`ahead`, `level`, `behind`) that the page shows depending on where the reader's answer sits against the median peer. It writes no numbers; the page prints the peer numbers itself. With no peer rows this step does not run.
4. `grade_intro` and `grade_lines` (`grade`): check both for invented facts, hype, dashes and placeholders, with one retry each.

The page computes everything else from the rows: the share of peers per option, the median option, and for each option the percentile rank (peers who picked a weaker option plus half of those who picked the same one). Those numbers are rendered into each answer button, so the browser only adds and compares.

When no row matches the account's industry, or any of the five questions has no row, the comparison hides: the result shows the reader's own five answers on a weakest-to-strongest scale and says that no peer group exists yet.

## The CSV

Upload it to the template as a dataset named `peer-answers` (or rename it and change `"dataset"` in the `peers` step). One row is one question for one industry. `samples/peer-answers.csv` is a working example with made-up numbers for three industries. The `peers` slot declares these exact column names, so Kenso maps each column onto the property of the same name.

| Column | Type | Required | Example | What it means |
|---|---|---|---|---|
| `industry` | text | yes | `construction` | The peer group's industry, written the way Kenso writes `account.industry`: lowercase LinkedIn industries. The `where` filter matches it against the account, ignoring case. |
| `question` | text | yes | `dispatch` | The `key` of the question in the `questions` slot. Every one of the five keys needs a row per industry, or the comparison hides for that industry. |
| `n_1` | integer | yes | `14` | How many peers picked the first option. Options are in the order the template lists them, weakest first. |
| `n_2` | integer | yes | `22` | How many picked the second option. |
| `n_3` | integer | yes | `19` | How many picked the third option. |
| `n_4` | integer | yes | `9` | How many picked the fourth option. |
| `source` | text | no | `Wrenfield field operations survey, 2026` | Where the answers come from. The page prints the first row's source under the peer count and in the method note. |

Rules that keep the page right:

- Write counts, not percentages, as plain integers. The page turns them into shares and rounds them.
- Order the four options of every question from the weakest answer to the strongest, in `studio.json` and in the CSV alike. The whole comparison reads left to right on that order.
- One row per `(industry, question)`. Keep an industry's rows to groups large enough to publish; a group of five is a story, not a benchmark.
- No email addresses or phone numbers anywhere in the CSV. Kenso rejects filled pages that contain them.
- No em dashes or en dashes. Quote any value that contains a comma, as the sample does for the source.

### Changing the questions

`questions` is a slot with a static fallback: five objects with `key`, `label` (at most 28 characters, shown on the result rows), `text` (the question, at most 140) and exactly four `options` (at most 48 characters each). Edit the fallback and keep the keys in step with the CSV. `topic` names what the questions are about ("field work") and appears in the headings.

### Changing the filter

`where` is a list of `{column, op, value}`. `value` may be a Kenso variable (`account.industry`, `account.size_band`) or a literal. To add a size band to the peer group, add a `size_band` column to the CSV and a second condition `{"column": "size_band", "op": "eq", "value": "account.size_band"}`.

## Samples

- `alder-ridge.json`: a construction company with a person, in the template's default brand, with peer rows and lines. The cover comes from it.
- `meridian-shared.json`: the shared link (`person` is null) for a facilities services company, with a bright primary and a geometric sans, with peer rows and lines.
- `larkmoor.json`: a utilities company with a person, dark primary and a serif heading font, and no peer rows, so the result shows its own answers only.
