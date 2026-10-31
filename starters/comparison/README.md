# Us vs what you use today

One page per account that puts your product next to the tool the account most likely uses today, one row per criterion, with your own verdict on each row. The rows come from a comparison CSV you upload. Kenso reads the account's site to work out which tool to compare against, says why it thinks so, and writes a short framing. The page ends with a booking button.

## How it fills

1. `catalog` (`dataset`): every row of your `comparison` dataset, up to 100, into `data.catalog`.
2. `site` (`tool`, `scrape.page`): the account's home page as text, into `data.site`.
3. `pick` (`prompt`): reads the distinct `competitor` values in the catalog and the `clues` column, looks for a tool the site names (careers page, integrations page, booking or signup widget, footer credit), and picks one. It writes `data.current_tool` (copied exactly from the CSV) and `data.evidence`, 0 to 3 lines that each point at something the site says. With nothing on the site, it picks by the clues and leaves the evidence empty, and the page says the tool is a guess.
4. `rows` (`dataset`): the rows where `competitor` equals `data.current_tool`, up to 12, into `data.rows`. Only these rows reach the page.
5. `write` (`prompt`): the headline, the intro and the two fit lines (when the current tool is the better choice, when you are), each built only from the rows and the inputs.
6. `grade` (`grade`): checks the copy for honesty, grounding and plain words, with one retry.

When the catalog is empty, `pick` does not run, and the page shows its fallback headline and intro, a short note that the table is not on the page yet, and the booking button. When `write` fails, the table still shows with the fallback headline and intro.

## The CSV

Upload it to the template as a dataset named `comparison` (or rename it and change `"dataset"` in both dataset steps). One row is one criterion for one competitor. `samples/comparison.csv` is a working example: a made-up dispatch tool for trades contractors, compared against three made-up tools and against spreadsheets. The `catalog` and `rows` slots declare these exact column names, so Kenso maps each CSV column onto the property of the same name.

| Column | Type | Required | What it means |
|---|---|---|---|
| `competitor` | text | yes | The tool's name as people say it, such as `Routeboard`. Spell it the same on every row of that tool. A non-product works too: `Spreadsheets and a whiteboard`. Under 40 characters. |
| `clues` | text | no | What on a company's site or in its industry points to this tool, such as `Careers pages that ask for Routeboard experience; shops with fewer than 20 technicians`. Fill it on one row per tool; blank cells are fine. Kenso reads it only to pick the tool. |
| `criterion` | text | yes | The thing being compared, such as `Dispatch board` or `Getting set up`. Under 48 characters. It is printed as the row heading. |
| `us` | text | yes | How your product handles it, in one or two plain sentences. Under 240 characters. |
| `them` | text | yes | How the competitor handles it, in one or two plain sentences, written fairly. Under 240 characters. |
| `better_fit` | text | yes | Your own verdict on the row: `us`, `them` or `either`. The page marks the better fit and counts the rows each way, so be honest here. |
| `note` | text | no | When the row matters, such as `If most jobs come in through your website, this row counts double`. Under 160 characters. Printed under the criterion. |

Rules that keep the page right:

- Cover every tool you want the page to compare against, with the same criteria for each. Six to eight criteria per tool read well.
- Include the tool a prospect uses when they use nothing, such as `Spreadsheets and a whiteboard`, so the pick step always has a fair option.
- No email addresses or phone numbers anywhere in the CSV. Kenso rejects filled pages that contain them.
- No em dashes or en dashes, and no exclamation marks. The page prints the cells word for word.
- Quote any value that contains a comma, as the sample does.
- Give the other tool rows where it wins. A page where every row goes to you reads like an advert, and the fit section says so plainly when no row goes the other way.

### Changing the filters

`rows` filters on `competitor` with the value Kenso picked (`data.current_tool`). To compare on a second key, such as `plan` or `region`, add the column to the CSV and to both slots' item properties, then add a `where` entry.

## Samples

- `cobble-hill.json`: a plumbing and HVAC contractor with a person, in the template's default brand. The site names Routeboard, so the page compares against it with two evidence lines.
- `pemberton-shared.json`: the shared link (`person` is null) for a law firm, with a dark green primary and a serif heading font. The pick is `Shared drives and email`, from what the site describes.
- `juniper-oak.json`: a candle maker with a person, with a bright orange primary and a geometric sans. The site credits Mailhaven in its footer.
- `brookside-partial.json`: an electrical contractor whose site names no tool, so the pick is `Spreadsheets and a whiteboard` with no evidence, and the `write` step failed, so the headline and intro are the slot fallbacks and the fit lines are missing.
