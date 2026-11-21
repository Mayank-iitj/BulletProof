# Traffic Plan: get ~1,200 real users in 48 hours

An experiment with no traffic is just a demo. This is the most common way Track 01 entries fail.

## Targets
| Milestone | Unique exposed users |
|---|---|
| End of Day 2 (Nov 27) | 400 |
| End of Day 3 (Nov 28) | 1,000 |
| Submission (Nov 29 AM) | 1,200+ |

## Channels (ranked by expected yield)
1. **Hackathon community (Discord, team chats):** 2,158 participants all have resumes. Post: "Test my resume tool, it takes 20 seconds, and you're helping an experiment."
2. **College placement groups (WhatsApp/Telegram):** placement season makes the pitch obvious. Ask 5 friends to each post in 2 groups.
3. **LinkedIn and X:** build-in-public thread: "I'm A/B testing AI resume rewrites, here's the live scoreboard" linking to `/arena`. The scoreboard itself invites repeat visits.
4. **Reddit and Dev.to/Hashnode:** r/developersIndia, r/resumes, r/cscareerquestionsIN (follow each subreddit's self-promo rules).
5. **Product Hunt / Hacker News "Show":** low odds but cheap; submit once the Arena shows real data.
6. **Flagsmith community:** share in their Discord; they are the sponsor and will likely engage.

## Copy templates
- **Short:** "Got a weak resume bullet? Paste it, get 3 AI rewrites. Bonus: you're part of a live A/B test. Scoreboard: <url>/arena"
- **Thread hook:** "3 AI styles are fighting over your resume. Whichever you copy most wins. Live data inside."

## Mechanics that raise conversion
- Example bullets one click away (no blank page paralysis).
- Instant value: no signup, <4s.
- Post-copy reveal and "See the Arena" link drive curiosity and shares.
- One-tap share button with a pre-filled message and the dynamic OG image.

## Quality control
- Randomization is by session, so one person re-visiting does not skew results.
- Filter bots and rapid-fire sessions (see `ExperimentPlan.md`).
- Track `source` (utm) as a Flagsmith trait; report channel mix to rule out channel-driven bias between arms (random assignment protects this, but show it).

## If traffic falls short
Report honestly: show credible intervals, say "directional," and explain what n would settle it. Judges reward rigor over fake certainty.
