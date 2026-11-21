# CLAUDE.md: instructions for the coding agent

You are building **BulletProof** (see `README.md`, `PRD.md`, `TRD.md`, `API.md`, `SystemDesign.md`, `Design.md`, `ExperimentPlan.md`). Follow these rules.

## Working agreements
1. **Read the docs first.** The TRD is the source of truth for stack and structure; `API.md` for contracts.
2. **Ask before changing anything in Flagsmith.** Propose the flag, metric, and experiment configuration and wait for human approval before creating or editing them. Never touch production flags without confirmation.
3. **Isolate uncertainty.** All Flagsmith event ingestion lives in `lib/tracker.ts`. Check Flagsmith's current Experimentation docs (https://docs.flagsmith.com/experimentation) for the real method before implementing; do not guess endpoints.
4. **Never change prompts after the experiment launches.** Prompts live in `lib/prompts/`; add a guard test that hashes them and fails CI if they change after the `EXPERIMENT_LOCKED` marker is set.
5. **Fail safe.** Flagsmith, LLM, DB, and Redis failures must degrade gracefully (see the matrix in `SystemDesign.md`). Never block the user on a flag outage.
6. **Privacy.** Do not store raw user text unless `allowTextStorage` is true. Never log bullets.
7. **Secrets.** Only via env vars; never commit keys; keep `.env.example` current.
8. **Quality bar.** TypeScript strict, Zod at every boundary, Vitest for logic, Playwright for the main flow, axe for a11y.
9. **Scope.** Build P0 first (see PRD). Do not add features outside the PRD without asking.
10. **Commits.** Small, conventional commits (`feat:`, `fix:`, `docs:`); commit `ExperimentPlan.md` before launch as pre-registration.

## Build order
1. Scaffold, deploy, env
2. `lib/flags.ts` (safe defaults) and `lib/session.ts`
3. `lib/prompts/*` and `lib/llm.ts` with validation
4. `/api/rewrite`
5. `lib/tracker.ts` and `/api/events`; verify events appear in Flagsmith
6. Workbench UI per `Design.md`
7. Rate limit, budget, kill switch
8. `/api/results`, `lib/stats.ts`, Arena page
9. Tests, A/A check, polish, `/method`

## Definition of done per task
Types pass, tests pass, no console errors, a11y check clean, docs updated if the contract changed.
