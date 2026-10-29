# Fits your stack

One page per account on how your product plugs into the tools that account likely runs. Ken reads the account's website and careers page, guesses the tools they mention, and marks every one as a guess. Each guessed tool that is in your integration list gets a block with what the integration does, what moves, how it is set up, and what changes for the people who use that tool. The page ends with a booking button.

## How it fills

1. `catalog` (`dataset`): every row of your `integrations` dataset, up to 60, into `data.integrations`. No filter: the whole list is the catalog the page matches against and lists at the end.
2. `site` and `careers` (`scrape.page`): the account's home page and `https://<domain>/careers` as text, into `data.site` and `data.careers`. The careers page may not exist; the page then says it guessed from the site only.
3. `guess` (`prompt`, needs `data.site`): lists at most 8 tools the pages name, each with a one-line clue quoting the page and where it was seen. A tool the pages do not name is left out: the prompt may not infer tools from the industry or size. Tools that are in your list are spelled the way your `tool` column spells them.
4. `copy` (`prompt`, needs `data.tools`): the headline, the intro, one "what changes for your team" line per guessed tool that has a row in your list, and the closing. Facts about an integration come only from its row; facts about the account come only from the clue.
5. `grade`: checks the copy for dashes, hype, placeholders and sign-offs, then a judge scores it for honesty (tools stay guesses), grounding (every integration claim is in its row), plain words and specificity. One retry.

What the page shows with thin data:

- No tools found: the stack card hides, the first section says so plainly and asks for the reader's stack, the integration and setup sections hide, and the whole catalog is listed.
- Guessed tools but none in your list: the integration and setup sections hide, and the catalog section names the tools that are not in your list yet.
- No CSV rows: the integration, setup and catalog sections hide, and the tool rows show no connection status.
- A failed fill: `fallback.liquid`, a short page with the booking button.

## The CSV

Upload it to the template as a dataset named `integrations` (or rename it and change `"dataset"` in the `catalog` step). One row is one integration. `samples/integrations.csv` is a working example with 21 made-up integrations for a made-up contract management product. The `integrations` slot declares these exact column names, so Ken maps each CSV column onto the property of the same name.

| Column | Type | Example | Required | What it means |
|---|---|---|---|---|
| `tool` | text, under 60 characters | `NetSuite` | yes | The tool's name as people say it. The page matches guessed tools against this column, so spell it the way the vendor does. |
| `category` | text, under 28 characters | `ERP and accounting` | yes | What kind of tool it is. Printed next to the name and used to sort the catalog chips. |
| `aliases` | text, under 120 characters | `Oracle NetSuite` | no | Other names for the same tool, comma-separated, so a careers page that says `SFDC` still matches `Salesforce`. |
| `connection` | text, under 60 characters | `Native, two-way` | yes | How it connects, in a few words: `Native, two-way`, `Native, one-way`, `Native`, `CSV import`, `Through Zapier`. Printed as a label. |
| `summary` | text, under 320 characters | `A vendor approved in Plinth becomes a NetSuite vendor record, and a signed contract raises its purchase order.` | yes | What the integration does, in one or two plain sentences. The "what changes for your team" line is written from this and from `syncs`, so say what a user notices, not what the API does. |
| `syncs` | text, under 200 characters | `Vendors, purchase orders and bills, every 15 minutes` | no | What moves between the tools, in which direction, how often. Printed as "What moves". |
| `setup` | text, under 160 characters | `About an hour with a NetSuite admin` | no | How long setup takes and who does it. Printed as "Setup" and collected into the "Setting it up" list. |
| `docs_url` | https URL, under 200 characters | `https://docs.example.com/netsuite` | no | Your docs page for the integration. Printed as a link when it starts with `https://`. |

Rules that keep the page right:

- One row per tool. Keep it to integrations that work today; the page says "connects to today".
- No email addresses or phone numbers anywhere in the CSV. Ken rejects filled pages that contain them.
- No em dashes or en dashes, and no exclamation marks; the page prints cells as written.
- Quote any cell that contains a comma, as the sample does for `Native, two-way`.
- Keep `summary` to things a buyer can check in your docs. The grader fails a "what changes" line that claims more than the row says.

## Samples

- `alder-ridge.json`: a hospital group with a person, in the default brand. Five tools guessed, four of them in the list.
- `marlow-freight.json`: a freight carrier with a person, with a dark navy primary and a serif heading font. Four tools guessed, three in the list.
- `oakhaven-shared.json`: the shared link (`person` is null) for a construction company, with a bright orange primary and a geometric sans. Five tools guessed, three in the list.
- `pennant-partial.json`: a partial fill. No CSV rows, two tools guessed, and no closing, so the closing falls back and the integration, setup and catalog sections hide.
