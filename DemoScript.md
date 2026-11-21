# Demo Video Script: 2:30

**Goal:** judges feel the problem, see the product, understand exactly what Flagsmith does, and trust the result.
**Format:** screen recording plus voiceover, with a small face-cam optional. Clean audio beats fancy editing. Add captions.

## Structure
| Time | Scene | On screen | Voiceover |
|---|---|---|---|
| 0:00-0:15 | **Hook** | A bad bullet; "Worked on backend of project." | "Recruiters spend seconds on your resume, and AI rewriters all claim to be the best. But nobody measures which style people actually use. So we did." |
| 0:15-0:35 | **Product** | Workbench: paste, 3 rewrites, copy | "BulletProof rewrites resume bullets in three styles. Each user gets exactly one style, chosen by Flagsmith." |
| 0:35-1:05 | **The Flagsmith setup** | Flagsmith dashboard: multivariate flag `rewrite_style` 34/33/33, metric `bullet_copied`, experiment config; kill switch and remote config flags | "One multivariate flag holds three prompt styles. The metric is a real event: did the user copy a rewrite? We pre-registered our hypothesis and decision rules before launching." |
| 1:05-1:30 | **How it's wired** | Architecture diagram: browser to Next.js to Flagsmith, LLM, DB | "Flags are evaluated server-side per anonymous identity, sticky for each user. Kill switch and budget cap keep it safe." |
| 1:30-2:00 | **The result** | Flagsmith win-probability panel and `/arena` live chart; n=1,2xx | "After N real users, Team Impact is copied X% more often, a Y% chance it's the best. Here's the interval, and here's what that means in plain English." |
| 2:00-2:20 | **Ship the winner** | Flip the flag to 100% Impact; winner banner appears | "No redeploy. One toggle in the same flag, and every user gets the winner." |
| 2:20-2:30 | **Close** | Logo, URL, repo, "Open source" | "BulletProof: AI that's tuned by evidence, powered by Flagsmith." |

## If the result is inconclusive
Swap scene 5 for: "No variant crossed 95%, so we don't ship by gut. Here's what we learned and the sample size to settle it." Honest rigor is a strong story.

## Recording checklist
- 1080p, 1.25x zoom on UI, hide bookmarks and notifications
- Use real production data, not mock numbers
- Show the Flagsmith dashboard **and** the app (proves integration)
- Voiceover recorded separately in a quiet room; normalize audio
- Burned-in captions; end card with URL and repo
- Export MP4 H.264 <=3 min; test playback on your phone

## Thumbnail / cover
Three coloured "team" cards with the winner crowned, and the text **"3 AI styles. 1,200 users. 1 winner."**
