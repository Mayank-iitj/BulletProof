# Design System and UX — BulletProof

## 1. Design principles
1. **Confident, not corporate.** An arena-meets-editorial feel; the experiment is the hero.
2. **One job per screen.** Paste, rewrite, copy. No clutter.
3. **Show the science.** Numbers are visible, honest, and explained in plain words.
4. **Fast feels premium.** Streaming, skeletons, and sub-100ms interactions.

## 2. Brand
- **Name:** BulletProof · **Tagline:** *"Your bullets, battle-tested."*
- **Voice:** direct, witty, honest. Example empty state: "Paste a bullet. We'll make it earn its place."
- **Logo:** a bold square-bracket `[ ]` mark with a bullet dot inside, doubling as the metric-placeholder motif.

## 3. Design tokens
**Color (dark-first, light supported)**
| Token | Dark | Light | Use |
|---|---|---|---|
| `--bg` | `#0B0D12` | `#FAFAF7` | Page |
| `--surface` | `#141821` | `#FFFFFF` | Cards |
| `--surface-2` | `#1C2230` | `#F1F1EC` | Inputs |
| `--text` | `#EDEFF5` | `#12141A` | Body |
| `--muted` | `#8A93A6` | `#5C6475` | Secondary |
| `--border` | `#262D3D` | `#E2E2DA` | Lines |
| `--accent` | `#7CFFB2` | `#0A8F4F` | Primary CTA, winner |
| `--team-concise` | `#6EA8FF` | `#2F6FE0` | Variant color |
| `--team-impact` | `#FFB84D` | `#C77700` | Variant color |
| `--team-story` | `#C792FF` | `#7C3AED` | Variant color |
| `--danger` | `#FF6B6B` | `#D32F2F` | Errors |

Contrast: all text/background pairs >= 4.5:1 (verify with a checker). Variant colors are never the only signal; always paired with a label and icon.

**Typography**
- Display: **Fraunces** (600) for headlines (editorial flair)
- UI/Body: **Inter** (400/500/600)
- Data/mono: **JetBrains Mono** for numbers and placeholders
- Scale: 12 / 14 / 16 / 18 / 24 / 32 / 48 / 72; line-height 1.5 body, 1.1 display

**Spacing / radius / elevation:** 4px base grid; radius 8 (inputs), 16 (cards), 999 (pills); elevation via 1px borders plus a soft glow on focus (`0 0 0 3px accent/25%`), not heavy shadows.

## 4. Screens

### 4.1 Workbench (`/`)
```
┌──────────────────────────────────────────────────────────┐
│ [ • ] BulletProof                 Arena   Method   ☾    │
├──────────────────────────────────────────────────────────┤
│   Your bullets, battle-tested.                           │
│   Paste a weak bullet. Get three sharper ones.           │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Worked on backend of project                  27/500│  │
│  └────────────────────────────────────────────────────┘  │
│  Target role (optional) [ Backend Engineer ▾ ]           │
│                                  [ Rewrite  ⌘↵ ]         │
│                                                          │
│  ┌ Suggestion 1 ──────────────────────────  [Copy] ┐   │
│  │ Built REST APIs in Node.js serving [N] daily…     │   │
│  └───────────────────────────────────────────────────┘   │
│  (2 more cards)         👍 👎      ↻ Regenerate          │
│                                                          │
│  ▸ Live: 812 people have tested bullets · See the Arena  │
└──────────────────────────────────────────────────────────┘
```
Interactions: streaming text per card; `⌘/Ctrl+Enter` submits; copy turns the button to a check with haptic-like scale animation; placeholders like `[X%]` are highlighted in mono with a tooltip ("Replace with your real number"); after copy, a toast reveals the variant: **"You were in Team Impact. See how it's doing →"**.

### 4.2 Arena (`/arena`)
```
┌ THE ARENA · Experiment: Rewrite style ────── ● LIVE ─────┐
│  Hypothesis: Impact-first rewrites get copied more.       │
│                                                          │
│  ┌ Control ┐  ┌ Team Impact ┐  ┌ Team Story ┐            │
│  │ 33.5%   │  │ 44.1% 👑    │  │ 33.7%      │  copy rate │
│  │ n=275   │  │ n=270       │  │ n=267      │            │
│  │ 4% win  │  │ 93% win     │  │ 3% win     │            │
│  └─────────┘  └─────────────┘  └────────────┘            │
│  [ Win-probability over time — line chart ]              │
│  [ Credible intervals — dot-and-whisker ]                │
│  Decision rule: ship at ≥95%. Status: collecting 812/1200│
│  Guardrails ✓ latency 2.9s · ✓ errors 0.4%               │
│  "What does this mean?" ▾ plain-language explainer       │
│  Mirror of Flagsmith results · updated 12s ago           │
└──────────────────────────────────────────────────────────┘
```
Moments of delight: a progress bar toward the 1,200 target, a crown on the leader, confetti once when `shipped`, and a "Ship the winner" explainer showing the Flagsmith toggle screenshot.

### 4.3 Method (`/method`)
Hypothesis, variants with real prompt excerpts, metric definitions, sample-size math, decision rules, privacy statement, and the open-source repo link. Credibility page for judges.

## 5. Components
`BulletInput`, `RoleSelect`, `SuggestionCard` (states: streaming, ready, copied), `VariantRevealToast`, `RatingBar`, `ArenaStatCard`, `WinProbChart` (Recharts), `IntervalPlot`, `GuardrailPill`, `ProgressToTarget`, `ExplainerAccordion`, `CookieNotice`, `PausedBanner` (kill switch), `WinnerBanner`.

## 6. States
| State | UX |
|---|---|
| Empty | Friendly prompt plus 3 clickable example bullets |
| Loading | Skeleton cards, streaming text |
| Error | Inline message with Retry; never a blank screen |
| Paused (kill switch) | Calm banner: "AI is taking a break. Back soon." |
| Rate limited | Countdown timer |
| Winner shipped | Banner: "Team Impact won with 96% win probability" |

## 7. Motion
150-250ms ease-out; staggered card entrance (40ms); number count-up on Arena; respects `prefers-reduced-motion` (disable confetti and count-up).

## 8. Accessibility
WCAG 2.2 AA; full keyboard flow; visible focus rings; `aria-live="polite"` for streaming results; chart data available as a table; labels not color-only; touch targets >= 44px; tested with VoiceOver and axe.

## 9. Responsive
Mobile-first (most college traffic is mobile via WhatsApp or Instagram links). Cards stack; the Arena stat cards become a horizontal swipe; sticky bottom "Rewrite" button on mobile.

## 10. Social and share assets
OG image (1200x630) generated dynamically: live win probability on the card, so every share advertises the experiment. Favicon: `[•]`.
