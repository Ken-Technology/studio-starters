# Personal video page

One page per account with the sender's video on top, three reasons the page was made for that account, and a booking block. The video is one recording for the whole campaign, or one per account from a CSV. Ken writes the three reasons and the intro from what it knows about the account.

## How it fills

1. `video_by_domain` (`dataset`): the row of your `videos` dataset whose `domain` equals the account's domain, into `data.video_rows`. With no dataset or no matching row, the page uses the campaign video instead.
2. `copy` (`prompt`): writes `data.title`, `data.intro` and `data.reasons` (exactly three `{heading, body}` items) from the account's industry, size band, dossier and signals, plus `knowledge.stable` (your offer) and `knowledge.scoped` (notes on the account) when the workspace has them. It never sees the person's name, so every person at an account gets the same copy and the page greets them itself.
3. `grade`: checks the copy for dashes, prices, placeholders and sign-offs, then has a judge score it for specific facts, plain words, honesty and flow. One retry, then the page is marked for review.

If the prompt fails, `fallback.liquid` shows a short note with the booking block.

## The video

`data.video_url` is a slot with an empty default. To show one video on every page of the campaign, edit its `fallback` in `studio.json`:

```json
"video_url": { "type": "string", "maxLength": 400, "fallback": "https://www.loom.com/share/0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d" }
```

A row from the `videos` dataset wins over the campaign video, so you can record one video for most accounts and a personal one for the few that matter.

Paste the link the way the provider gives it. The page turns it into the embed itself:

| Provider | Link forms the page understands |
|---|---|
| Loom | `https://www.loom.com/share/<id>` or `https://www.loom.com/embed/<id>` |
| YouTube | `https://www.youtube.com/watch?v=<id>`, `https://youtu.be/<id>`, `https://www.youtube.com/shorts/<id>` or an embed link |
| Vimeo | `https://vimeo.com/<id>`, `https://vimeo.com/<id>/<hash>` for an unlisted video, or `https://player.vimeo.com/video/<id>` |
| Wistia | `https://<account>.wistia.com/medias/<id>` or `https://fast.wistia.net/embed/iframe/<id>` |

Any other link is ignored and the page renders without a video: the stage shows the title, the intro and the sender, and the copy says "wrote" instead of "recorded".

## The CSV

Upload it to the template as a dataset named `videos` (or rename it and change `"dataset"` in the first recipe step). One row per account. `samples/videos.csv` is a working example.

| Column | Required | What it means |
|---|---|---|
| `domain` | yes | The account's domain the way Ken writes `account.domain`, such as `cobaltstreet.example`. The step matches it ignoring case. |
| `video_url` | yes | The video link for that account, in one of the forms above. |

Keep it to accounts that have their own recording. Every other account gets the campaign video.

## Samples

- `orchard-mechanical.json`: the default brand, a person, no video. The first sample makes the cover, and this one shows the page as a note.
- `cobalt-street.json`: a dark navy primary with a serif heading (Lora, Source Sans 3), a person, and a YouTube video from the dataset row.
- `pinecrest-shared.json`: the shared link with `"person": null`, a bright orange primary with a geometric sans (Outfit, DM Sans), and a Vimeo campaign video.
- `larkspur.json`: a violet primary (Bricolage Grotesque, Hanken Grotesk), a person, and a Loom campaign video.

The sample video ids are made up, so a provider shows its "not found" frame in the previews. A real link plays in place.
