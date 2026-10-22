# Role pitch for one candidate

One page per candidate on a recruiting campaign. It says why their background fits the role, what the role and the team are, the pay range and how hiring works, with a button to book a short intro and an optional video from the hiring manager. There is no company on the page: it reads the candidate (`person.*`) and the campaign's role (`role.*`).

It needs the workspace's `recruiting` flag and runs on a recruiting campaign whose role is set.

## How it fills

1. `bind` copies `role.title` into `data.headline`.
2. `prompt` writes `data.why_you` (why this person's work fits the role's must-haves) and `data.team` (the team and the work, from the role's description). It reads the candidate's current title, employer, skills and experience summary, and the role's title, company, description and must-haves. It never sees the candidate's name or any dates.

The pay range, location, remote policy, must-haves and job link come straight from the role when the page renders. If the prompt fails, `why_you` falls back to a general line and the page still works. `process` is the same for every candidate: edit its `fallback` in `studio.json` once.

## Hiring manager video

`video` is `{provider, id}`: `provider` is `loom`, `youtube` or `vimeo`, and `id` is the video's id (the part after `/share/` on Loom, after `v=` on YouTube, the number on Vimeo). To show one video on every page, give the slot a static fallback in `studio.json`, like `"fallback": {"provider": "loom", "id": "4f1c2e9a7b3d4e5f8a6b9c0d1e2f3a4b"}`. Without it the video is left out.

## Samples

- `maya-backend.json`: every slot filled, a Loom video and a role with pay.
- `devon-partial.json`: only `team` filled. The headline comes from `role.title` and the rest from fallbacks; the role has no pay and no job link.
- `northwind-shared.json`: the shared link, with `"person": null`.
