# Roadmap, Risks, and Submission Checklist

Hackathon: **Nov 26-29, 2026** (online). Today is Nov 21. Times are IST; adjust to the official schedule on the Schedule tab.

## Phase 0: Before the hack (Nov 21-25, planning only)
- [ ] Ask on Discord/FAQ: is pre-written code allowed? **If unclear, do not write code.**
- [ ] Create accounts: Flagsmith Cloud, Vercel, Neon, Upstash, Anthropic API key
- [ ] Star Flagsmith on GitHub (AirPods draw)
- [ ] Fill the Pirates team (3 open seats). Ideal roles: **Frontend/Design**, **Growth/Traffic and video editor**, **You: backend and experiment**
- [ ] Read the Experimentation docs, the PayPal button example, and the "set up with a coding agent" page
- [ ] Draft 20 example bullets and the 3 prompt specs (text only)
- [ ] Line up 10 people who will share the link on Day 2

## Phase 1: Day 1 (Nov 26): Foundation and flags
| Block | Work |
|---|---|
| 0-2h | Scaffold Next.js, deploy empty app to Vercel, set env |
| 2-4h | Run Flagsmith's setup prompt in Claude Code: creates flag `rewrite_style`, metric, and experiment (approve changes); add `llm_kill_switch`, `model_config` |
| 4-8h | `/api/rewrite` end to end with 3 prompts; session cookie; flag evaluation; safe defaults |
| 8-11h | `tracker.ts`, `/api/events`, DB schema, confirm events appear in Flagsmith |
| 11-13h | Basic workbench UI (functional, not pretty) |
**Exit gate:** a full generate and copy loop shows events inside Flagsmith.

## Phase 2: Day 2 (Nov 27): Polish and launch
| Block | Work |
|---|---|
| 0-3h | Design pass: tokens, cards, streaming, reveal toast, mobile |
| 3-5h | Rate limits, budget cap, validation, prompt-injection defence |
| 5-7h | A/A test, SRM and parity checks, pre-registration commit |
| **7h** | **LAUNCH the experiment** and traffic push #1 |
| 7-12h | Arena page (live stats and charts), `/method` |
**Exit gate:** production live, experiment running, >=300 exposed users by end of day.

## Phase 3: Day 3 (Nov 28): Traffic, results, story
| Block | Work |
|---|---|
| Morning | Traffic push #2 and #3, monitor guardrails, fix bugs (no prompt changes!) |
| Midday | README, architecture diagram, screenshots, OG image |
| Afternoon | Record screens and voiceover drafts, test rollout toggle on staging |
| Evening | Check win probability; apply decision rules; **ship the winner via the same flag** (or document inconclusive) |
**Exit gate:** >=1,000 exposed users, winner decision made.

## Phase 4: Day 4 (Nov 29): Ship it
- [ ] Final data pull and screenshots (Flagsmith win-probability panel plus Arena)
- [ ] Record and edit the demo video (`DemoScript.md`); upload; verify captions and audio
- [ ] Final README pass; repo public; `.env.example`; license (MIT)
- [ ] Submit early, with a 2h buffer before the deadline
- [ ] Keep the app live and the kill switch armed through judging

## Risk register
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Not enough traffic | Med | High | Traffic plan, 10 pre-committed sharers, honest "directional" fallback |
| Flagsmith event API differs from assumption | Med | High | Isolated `tracker.ts`; ask on Discord Day 1; DB mirror as backup |
| LLM cost spike | Low | Med | Daily budget cap, kill switch, Haiku-tier model, rate limits |
| Abuse or prompt injection | Med | Med | Sanitiser, delimiters, output validation, limits |
| Vercel or API outage during judging | Low | High | Recorded video plus screenshots; health endpoint; static fallback Arena snapshot |
| No clear winner | Med | Low | Pre-registered "inconclusive" path, honest story |
| Scope creep | High | High | P0-only until Day 2 launch; cut order in PRD |
| Team lacks time | Med | Med | One-person-viable MVP; docs enable parallel work |

## Cut list (in order)
FR-12 CSV export, FR-10 opt-in storage, FR-9 `/method` (keep a minimal version), FR-7 remote model config, confetti and polish.

## Submission checklist
- [ ] Public repo with README (problem, hypothesis, architecture, results, how Flagsmith is used, run instructions)
- [ ] Live URL working on mobile
- [ ] Demo video (<=3 min) clear on problem, build, and Flagsmith's role
- [ ] Screenshots: flag config, experiment setup, win-probability result, rollout
- [ ] Results section with honest numbers and limitations
- [ ] Flagsmith starred, team code (CKR24F) registered, all members listed
- [ ] Track selected: **Test Something Real**
- [ ] Re-read judging scorecard one last time and match each item to evidence
