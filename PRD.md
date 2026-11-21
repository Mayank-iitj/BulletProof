# PRD — BulletProof v1.0

**Owner:** @mayyanks · **Team:** Pirates · **Event:** Toggle Wars (Nov 26-29, 2026) · **Status:** Draft for build

## 1. Problem
Students and early-career professionals write resume bullets like "Worked on backend of project." Recruiters skim a resume for about 6-10 seconds; weak bullets lose interviews. Generic AI rewriters exist but nobody knows **which rewrite style people actually prefer** because no tool measures it.

## 2. Vision
The first resume tool that is *empirically* tuned: its rewrite behaviour is chosen by live experiments, not opinions.

## 3. Goals and non-goals
**Goals**
- G1. Deliver instantly useful rewrites (<4s p95).
- G2. Run one rigorous, explainable A/B/C test through Flagsmith Experimentation.
- G3. Make the experiment visible and educational (public Arena page).
- G4. Ship the winning variant using the same flag.

**Non-goals (v1)**
- Accounts or login, resume file upload or parsing, payments, ATS scoring, multi-language, mobile app.

## 4. Personas
| Persona | Need | Behaviour |
|---|---|---|
| **Aarav, 3rd-year CS student** | Placement season, weak bullets | Pastes 3-5 bullets, copies the best |
| **Meera, junior dev** | Quantify impact | Wants metrics-first rewrites |
| **Judge / developer** | Understand how Flagsmith drives the product | Opens Arena page, reads method |

## 5. User stories
- U1. As a user, I paste a bullet and get 3 rewrites fast.
- U2. As a user, I copy a rewrite with one click and rate it.
- U3. As a user, I can regenerate if I dislike the result.
- U4. As a visitor, I can see live experiment results and the methodology.
- U5. As an operator, I can disable AI instantly (kill switch) and roll out the winner without redeploying.
- U6. As a privacy-conscious user, my text is not stored unless I opt in.

## 6. Functional requirements
| ID | Requirement | Priority |
|---|---|---|
| FR-1 | Input: bullet (10-500 chars), optional target role | P0 |
| FR-2 | Output: 3 rewrites, styled per assigned variant | P0 |
| FR-3 | Sticky variant assignment per anonymous session via Flagsmith identity | P0 |
| FR-4 | Events: `rewrite_generated`, `bullet_copied` (primary), `regenerate_clicked`, `rating_submitted` | P0 |
| FR-5 | Public `/arena` page with live win probability, sample size, lift | P0 |
| FR-6 | Kill switch flag disables generation with graceful fallback message | P0 |
| FR-7 | Remote config flag controls model, max tokens, temperature | P1 |
| FR-8 | Post-copy variant reveal toast ("You were in Team Impact") | P1 |
| FR-9 | `/method` page: hypothesis, metric definitions, stats explanation | P1 |
| FR-10 | Opt-in text retention for improvement | P2 |
| FR-11 | Winner rollout banner ("Impact won, now default for everyone") | P1 |
| FR-12 | CSV export of aggregated events (admin) | P2 |

## 7. Success metrics
- **North star:** copy rate = users who copy a rewrite / users who generate one.
- Experiment: >=1,200 unique exposed users, 95% win-probability decision or an honest "inconclusive" report.
- Product: p95 latency <4s, error rate <1%, cost <= $0.002 per generation.
- Hackathon: complete submission with video, README, live URL, public repo.

## 8. Scope and milestones
See `Roadmap.md`. MVP = FR-1..6. Everything else is cut in this order if time runs short: FR-12, FR-10, FR-9, FR-7.

## 9. Risks
Low traffic, LLM cost spikes, abuse or prompt injection, Flagsmith event-API unknowns. Mitigations are in `Roadmap.md` (Risk Register).

## 10. Open questions
- Is pre-hack code allowed? (Ask on Discord.)
- Does Experimentation support a custom event with properties for our primary metric, or only simple counters?
