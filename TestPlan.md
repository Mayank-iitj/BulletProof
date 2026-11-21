# Test Plan

## 1. Unit (Vitest)
- `prompts/*`: each variant produces its expected style constraints.
- `llm.validate()`: rejects non-3 outputs, over-length, system-prompt echo, fabricated numerals (regex for digits not in input or placeholders).
- `stats.ts`: Beta-Binomial P(best) against known fixtures; Wilson interval correctness.
- `session.ts`, `ratelimit.ts`, `budget.ts`: edge cases (cap reached, concurrent writes).
- Input sanitiser: URLs, control chars, 501 chars, empty, emoji.

## 2. Integration
- `/api/rewrite` with Flagsmith mocked: each variant to correct prompt; kill switch on gives 503; Flagsmith down gives default variant plus `flag_fallback` log.
- `/api/events` idempotency; unknown type gives 400; `reveal` only on `bullet_copied`.
- `/api/results` math matches the DB for seeded data.

## 3. End-to-end (Playwright)
1. Paste an example, get 3 cards, copy one, see the reveal toast.
2. Variant stickiness: reload and repeat; the same variant (check via admin debug header).
3. Rate limit: 11th request in 10 min shows a countdown.
4. Kill switch: toggle in a staging Flagsmith environment; paused banner appears within the TTL.
5. Mobile viewport (iPhone 13 and Pixel 7) and keyboard-only flow.

## 4. Experiment integrity (run before launch)
- **A/A test:** point 2 variants at the same prompt, send 300 synthetic sessions; confirm no spurious "winner" and a balanced split.
- **Sample ratio mismatch** check script on the assignment log.
- **Event parity:** DB event counts vs Flagsmith-reported counts within 2%; investigate any gap.
- **Sticky identity:** 100 repeated evaluations per identity return the same variant.

## 5. Load (k6, light)
Ramp to 30 VUs for 3 min against a stubbed LLM, then 5 VUs against the real LLM. Pass: p95 < 4s, error < 1%, no DB connection exhaustion.

## 6. Security
Prompt-injection corpus (20 strings, e.g. "ignore previous instructions...") must yield sanitized output; secrets scan (gitleaks); header check (securityheaders.com); admin routes reject without token.

## 7. Accessibility and performance
axe-core CI check; manual VoiceOver pass; Lighthouse >= 95 on `/`, `/arena`, `/method`.

## 8. Pre-launch gate (go/no-go)
- [ ] All P0 tests green
- [ ] A/A test clean
- [ ] Kill switch verified on production
- [ ] Budget cap verified
- [ ] Pre-registration committed (`ExperimentPlan.md`)
- [ ] Event parity OK
