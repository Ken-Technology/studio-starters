# Your homepage, for them

The sender's homepage rewritten for one account: a hero for their industry, three facts we noticed on their site, three use cases set as "Today at <account>" and "With <sender>" for the person's role, one customer story with a bar chart, a three-step rollout, a short FAQ and an inline booking block.

## How it fills

1. `site` and `careers` (`tool scrape.page`): read the account's homepage and its `/careers` page into optional slots.
2. `signals` and `product` (`bind`): news on the account and what the workspace sells, from `knowledge.product`.
3. `write` (`prompt`): writes the hero, the noticed facts with their source URLs, the use cases, the rollout and the FAQ. It `requires` `data.site`, so with no site the link shows `fallback.liquid`.
4. `peers` (`dataset`) and `peer_story` (`prompt`): pick the customer story closest to the account from your CSV and copy its numbers into the chart. With no matching row the story section hides, so the page needs no CSV to work.
5. `grade` (`grade`): checks the copy for dashes, prices, placeholders and hype words, then a judge scores it.

## The optional CSV

Upload it to the template as a dataset named `customer-stories`. One row is one customer story. `samples/customer-stories.csv` is a working example with made-up customers.

| Column | What it means |
|---|---|
| `customer` | The customer's name |
| `industry` | Matched against `account.industry`, ignoring case. Use Ken's lowercase LinkedIn industries |
| `size_band` | Employee band, like `51-200` |
| `city` | Optional |
| `summary` | One or two sentences on who they are and what they did. The page retells this |
| `quote` | Optional, copied word for word |
| `quote_author_title` | Optional, a job title only, never a name |
| `chart_title` | What the bars show, like `Late-load calls per week` |
| `chart_note` | Optional line under the title, like `Eight-week pilot in spring 2026` |
| `chart_points` | 3 to 8 points as `label:value`, joined by `\|`, like `Wk 1:142\|2:131\|Wk 8:76`. Labels at most 10 characters, values plain numbers |
