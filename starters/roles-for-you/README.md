# Roles for you

One page per candidate on a recruiting campaign, listing the campaign's open roles that fit them: the primary role and its extra roles, up to four. Each role shows its company, location, remote policy, pay and must-haves, a short "why you" line, a button to book a call and a link to the job. There is no company on the page: it reads the candidate (`person.*`) and the roles (`roles`).

It needs the workspace's `recruiting` flag and runs on a recruiting campaign with a role.

## How it fills

1. `prompt` reads `roles` and the candidate's current title, employer, skills and experience summary, and writes `data.intro` and `data.fits`: the roles that fit this person, best first, each with a title copied from the role and a one or two sentence "why you". It never sees the candidate's name or any dates.

The page matches each role to its fit by title. When the fill found fits, only those roles show. When it found none, or has not run yet, every role shows without a "why you" line, and `intro` falls back to a general line.

## Samples

- `priya-three-roles.json`: three open roles and two fits, so two roles show.
- `sam-no-fits.json`: no fill yet. Every role shows, and the intro is the fallback.
- `northwind-shared.json`: the shared link, with `"person": null`.
