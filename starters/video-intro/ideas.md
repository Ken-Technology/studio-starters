# Ideas
## 1. Own video for top accounts
Starts from: video-intro
Fills: `data.video_rows`, `data.video_url`, `data.intro`
Why it gets a reply: a video recorded for them is rare and gets watched.
Record one general video for the campaign and a personal one for the few accounts that matter, listed in the `videos` CSV.
## 2. Written note, no video
Starts from: video-intro
Fills: `data.title`, `data.intro`, `data.reasons`
Why it gets a reply: it costs the sender no recording time and reads in a minute.
Leave the video link empty so the page shows a note, and put the strongest of the three reasons first.
## 3. Signal-led reasons
Starts from: video-intro
Fills: `data.reasons`, `data.intro`, `account.signals`
Why it gets a reply: each reason points at something that just happened at their company.
Tell the copy step to build each reason from a recent signal on the account, with what the sender would do about it.
