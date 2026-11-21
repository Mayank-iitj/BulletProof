# TRD — Technical Requirements

## 1. Stack
| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15 (App Router), TypeScript** | One repo for UI and API; Vercel deploy in minutes |
| UI | Tailwind CSS + shadcn/ui + Framer Motion | Fast, premium look |
| Flags / Experiments | **Flagsmith Cloud**, Node/JS SDK (server-side evaluation) + React SDK for UI flags | Supported SDKs for Experimentation |
| LLM | Anthropic API, `MODEL_ID` env (default `claude-haiku-5-5`) | Low latency, low cost |
| Database | Postgres (Neon) via Drizzle ORM | Mirror of events and rewrite metadata (audit trail) |
| Rate limiting | Upstash Redis (`@upstash/ratelimit`) | Abuse and cost protection |
| Validation | Zod | Single source of truth for contracts |
| Hosting | Vercel | Edge middleware plus serverless |
| Observability | Vercel logs, Sentry (optional), custom `/api/health` | Lightweight |
| Testing | Vitest, Playwright, k6 (light load) | See `TestPlan.md` |

## 2. Flags (Flagsmith)
| Flag key | Type | Values | Purpose |
|---|---|---|---|
| `rewrite_style` | Multivariate | `concise` / `impact` / `story` | **The experiment** |
| `llm_kill_switch` | Boolean | on = AI disabled | Cost or abuse emergency stop |
| `model_config` | Remote config (JSON) | `{"model":"...","max_tokens":300,"temperature":0.6}` | Tune without redeploy |
| `show_winner_banner` | Boolean | | Announce shipped winner |

Evaluation: server-side per request using identity = `bp_sid`. Traits: `source` (utm_source), `device` (mobile/desktop), `first_seen`. Use SDK local evaluation or a cached environment with a short TTL; fall back to defaults (`concise`, kill switch off) if Flagsmith is unreachable. **Never block the user on a flag outage.**

## 3. Event tracking
```ts
// lib/tracker.ts: the ONLY file that talks to Flagsmith Experimentation ingestion
export type EventType = 'rewrite_generated'|'bullet_copied'|'regenerate_clicked'|'rating_submitted';
export async function track(e: { type: EventType; sessionId: string; variant: string; rewriteId?: string; props?: Record<string, unknown> }): Promise<void>
```
Implementation: (1) write to local `events` table (always), (2) forward to Flagsmith Experimentation via the method in its docs (**confirm exact call**). Both are best-effort, non-blocking (`waitUntil`).

## 4. Non-functional requirements
| NFR | Target |
|---|---|
| Latency | p95 < 4s end-to-end; first token < 1.2s via streaming |
| Availability | Degrade gracefully: LLM or flag failure shows friendly state |
| Throughput | 20 concurrent generations sustained; burst 100 |
| Cost | <= $0.002 per generation; hard daily cap $15 via counter and kill switch |
| Privacy | No raw text stored by default; hash plus length only |
| Accessibility | WCAG 2.2 AA |
| Browser support | Last 2 versions of Chrome, Safari, Firefox, Edge; mobile-first |
| Performance | Lighthouse >= 95 (Perf, A11y, Best Practices) |

## 5. Security and abuse
- Input sanitisation: strip control chars, cap 500 chars, reject URLs and long code blocks.
- **Prompt-injection defence:** user text goes in a delimited `<bullet>` block; system prompt says to treat it as data; output validated (3 strings, length limits, no system-prompt echo).
- Rate limits: 10 generations / 10 min / session, 40 / hour / IP, global budget counter. HTTP 429 with `Retry-After`.
- Bot protection: Cloudflare Turnstile (optional) or honeypot field plus timing check.
- Secrets only in env vars; no keys client-side. `FLAGSMITH_SERVER_KEY` never exposed to the browser.
- Cookies: `bp_sid` HttpOnly, SameSite=Lax, Secure, 30 days. Cookie notice on first visit.
- Admin endpoints guarded by `ADMIN_TOKEN` (constant-time compare).
- Security headers: CSP, HSTS, X-Content-Type-Options, Referrer-Policy.

## 6. Environment variables
```
FLAGSMITH_ENVIRONMENT_KEY=      # client-side key
FLAGSMITH_SERVER_KEY=           # server-side key
FLAGSMITH_API_URL=https://edge.api.flagsmith.com/api/v1/
ANTHROPIC_API_KEY=
MODEL_ID=claude-haiku-5-5
DATABASE_URL=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
ADMIN_TOKEN=
DAILY_BUDGET_USD=15
NEXT_PUBLIC_APP_URL=
```

## 7. Repo structure
```
bulletproof/
  app/
    page.tsx                 # workbench
    arena/page.tsx           # live results
    method/page.tsx
    api/{rewrite,events,feedback,results,health,admin/export}/route.ts
  lib/
    flags.ts                 # Flagsmith client, safe defaults
    tracker.ts               # events -> DB + Flagsmith
    llm.ts                   # Anthropic call, validation
    prompts/{concise,impact,story}.ts
    session.ts  ratelimit.ts  budget.ts  stats.ts
  db/schema.ts  db/migrations/
  components/                # BulletInput, VariantCard, ArenaChart ...
  tests/ e2e/ load/
  docs/                      # these documents
```

## 8. Definition of done
All P0 FRs pass `TestPlan.md`; deployed on a public URL; experiment live with >=1,200 exposed users; README plus demo video complete; `.env.example` committed; no secrets in git history.
