# Experiment Plan

## Hypothesis
> **H1:** Users who receive *impact-first* rewrites (action verb + outcome + metric placeholder) will copy a rewrite at a higher rate than users who receive *concise* or *narrative* rewrites.

## Variants (multivariate flag `rewrite_style`)
| Key | Name | Style spec | Weight |
|---|---|---|---|
| `concise` | **Control** | One line, <=20 words, strong verb, no invented numbers | 34% |
| `impact` | Team Impact | Action + outcome + metric placeholder like `[X%]`, <=28 words | 33% |
| `story` | Team Story | Context, action, result, 30-40 words | 33% |

Each variant maps to a system-prompt template (`lib/prompts/*.ts`). **Hard rule for all variants:** never fabricate numbers; use bracketed placeholders.

## Unit and exposure
- **Unit:** anonymous session (cookie `bp_sid`, UUIDv4), used as the Flagsmith identity.
- **Exposure:** first time the session calls `/api/rewrite` (flag evaluated server-side, then logged).
- **Sticky:** same identity always gets the same variant.

## Metrics
| Type | Metric | Definition |
|---|---|---|
| **Primary** | `bullet_copied` rate | exposed users with >=1 `bullet_copied` / exposed users |
| Secondary | `rating_up` rate | thumbs-up / users who rated |
| Secondary | `regenerate_clicked` rate | users who regenerated / exposed (lower is better) |
| Guardrail | p95 latency | per variant, must stay <5s |
| Guardrail | error rate | <1% |
| Guardrail | cost per generation | within 20% across variants |

## Sample size sanity check
Assume baseline copy rate ~35%. To see a 10-point absolute lift (35% -> 45%) with ~80% power: n ~ 16·p(1-p)/d² ~ 16·0.2275/0.01 ~ **365 per arm**, so target **~400 per arm, 1,200 total**. The Bayesian engine does not require a fixed n, but this is the credibility target.

## Decision rules (pre-registered before launch)
1. **Ship** a variant if win probability >= 95% and it is not worse on any guardrail.
2. **Inconclusive** if no variant reaches 90% by the deadline. Report directionally and say so honestly in the video. Honesty scores better than a faked win.
3. **Stop** a variant early only for guardrail breach (e.g. error rate >3%).
4. Pre-registration: commit this file to git before launch; the timestamp proves we did not move the goalposts.

## Integrity checks
- Sample ratio check: observed arm split within +-3pp of 34/33/33.
- Bot filtering: ignore sessions with <1.5s between generate and copy, or >20 generations.
- No mid-test prompt edits. Any change restarts the experiment (log in `CHANGELOG`).
- Novelty effect: report day-1 vs day-2 rates.

## Reading the results (for the video)
- **Win probability:** the Bayesian chance this variant is truly best.
- **Lift:** relative improvement vs control, with a credible interval.
- Explain in one sentence: "There is a 96% chance Team Impact beats the control."

## Rollout
Flagsmith: set `rewrite_style` winner to 100% for all identities (same flag, no redeploy). The app shows a banner via the `rewrite_style` value and `/api/results` status = `shipped`.
