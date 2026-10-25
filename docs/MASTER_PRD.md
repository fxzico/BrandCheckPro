# MASTER PRODUCT REQUIREMENT DOCUMENT
## The Executive Brand Operating System — Freemium B2B SaaS for Global Brand Guardians

| Document Control | Value |
|---|---|
| Version | 1.0 (LOCKED — Single-Shot Generation) |
| Date | 2026-10-26 |
| Status | Executive decisions locked; engineering-ready |
| Naming Candidates (Phase 0 A/B/C) | **A: Britual** (`britual.com`) · **B: Brandvertising** · **C: BrandCheckPro / Brandometer** |
| Build Method | 100% AI Vibe-Coding under the Modular Vibe-Coding Protocol (Section 2) |
| Stack | Next.js App Router · Tailwind CSS · Supabase (PostgreSQL + Auth) · Vercel · LLM APIs |
| Strategic Core | `sumit-sir` doctrine (5 Gears, 8Ps, PQ, SMART) |
| Execution Engine | `gstack` workflow gates embedded per phase |
| North-Star Question | *"How Frictionless is your Brand Engine?"* |

> **Doctrine (non-negotiable):** Products have rationales. Brands have *emotionales*. Advertising ≠ Branding — they multiply, not compete. The consumer is the medium. Word-of-mouth is the world's strongest medium. ₹0 paid ads, ever.

---

# SECTION 1 — EXECUTIVE SUMMARY, 5 GEARS & SMART OBJECTIVE

## 1.1 Product Vision

Brand Guardians — startup founders, CMOs, Brand Managers, enterprise tech leads — are drowning. Not for lack of data, but because every brand touchpoint (hoarding, retail signage, packaging, call-centre script, Instagram caption) lives in a different dashboard, a different agency deck, a different Excel sheet. Managing it all is exhausting. Controlling it is worse.

This product is the **Executive Brand Operating System**: a single dark-mode flight-deck cockpit where one pulse — the **Friction Score** — tells the Guardian whether every touchpoint is on-brand, and four governance modes (MANUAL → ALERT → COPILOT → AUTOPILOT) let them choose exactly how much control to delegate to AI.

It is not another analytics dashboard. It is the business of **removing frustration and restoring calm control** over every brand touchpoint. Kodak thought it was in the photography business; it was in the memories business. We are not in the dashboard business. We are in the **calm-control business**.

## 1.2 The Locked 5 Brand-Building Gears (sumit-sir Protocol)

The five gears are the product's constitutional spine. They are stored verbatim in the `brand_constitutions` table (Section 4.1), each hard-validated at the database layer to **<144 characters**. They are immutable once locked (versioned, not editable — see §4.1 triggers).

| # | Gear | Locked Text | Chars | Limit |
|---|------|-------------|:-----:|:-----:|
| 1 | **Obvious Emotional Truth** | Brand guardians find managing and controlling so many fragmented brand touchpoints utterly exhausting and frustrating | **117** | <144 ✅ |
| 2 | **The Real Business** | The business of removing frustration and restoring calm control over every brand touchpoint | **91** | <144 ✅ |
| 3 | **Target Mindset** | The overwhelmed brand guardian—from startup founder to corporate CMO—drowning in disconnected dashboards and chaotic channels | **125** | <144 ✅ |
| 4 | **Persona** (3 adjectives) | Quietly Observant. Methodically Calm. Street-Sharp | **50** | <144 ✅ |
| 5 | **The Branding Eyedea** | The Frictionless Brand Engine: One single pulse for every brand touchpoint | **74** | <144 ✅ |

**Enforcement rules:**
- The `<144 char` discipline is enforced three ways: (a) Postgres `CHECK (char_length(...) < 144)` constraints, (b) Zod `.max(143)` refinements in the contract layer, (c) a live character counter in the Constitution Locker UI that turns the field's border `brandNeon` → red at 140.
- Gear 4's three adjectives (**Quietly Observant · Methodically Calm · Street-Sharp**) are stored as a `text[3]` array and become the deterministic tone rubric for every Brand Alarm Meter audit (Section 4.2).
- The gears route every strategic question through the Univbrands five questions; any feature proposal that cannot name which gear it serves is rejected at `/plan-ceo-review`.

## 1.3 Target Audience

Global Brand Guardians: startup founders, CMOs, Brand Managers, and enterprise CTOs/tech leads — milestone logos: **Coca-Cola, Nestlé, Cadbury, and ₹10Cr+ revenue brands** — united by one mindset (Gear 3): drowning in fragmented dashboards and chaotic channels. The wedge cohort (Phase 1) is 100 beta Brand Managers drawn from Sumit Sir's 10,000-strong LinkedIn network and the AIC-Techno cohort.

## 1.4 The Consumer As The Medium & The Prosumer Quotient

The platform's growth engine is the product itself: every Guardian who britualises a touchpoint and shares the verdict is the medium. Growth is measured by the **Prosumer Quotient**:

$$PQ = \frac{2R + 3P}{C}$$

where $R$ = repeat users (active ≥3 sessions in trailing 30d), $P$ = active recommenders/prosumers (sent ≥1 accepted invite or shared ≥1 public audit verdict in trailing 30d), $C$ = total registered users.

**Interpretation bands (locked):**
| PQ | Meaning | Board-level action |
|---|---|---|
| < 1.0 | Brand is renting attention | Fix product before any marketing |
| 1.0 – 2.0 | Organic pulse forming | Feed prosumers (Friends of the Brand offers) |
| **> 2.0** | **Exponential growth engine (Phase 2 exit gate)** | Raise angel round; growth is self-financing |
| → 10 | People will fund the brand themselves | Category leadership; ecosystem plays |

PQ is computed nightly by the `calc_pq()` SQL function (§4.1.7) into `pq_snapshots`, and rendered live as the **PQ Gauge** (Pillar 1 of the cockpit).

## 1.5 The 6 Core Cockpit Pillars

| # | Pillar | Widget | Data Source | Governance Hook |
|---|--------|--------|-------------|-----------------|
| 1 | **Prosumer Quotient (PQ)** | Radial pulse gauge, live | `pq_snapshots` | ALERT if PQ drops >15% WoW |
| 2 | **Urgent vs. Important Projects** | Eisenhower 2×2 board | `projects_eisenhower` | COPILOT re-triages stale "urgent" items nightly |
| 3 | **Guardian Time & Work-Life Balance** | Weekly hours donut: needle-moving 4% vs. review chaos | calendar sync + audit timestamps | ALERT on >6h/week in review chaos |
| 4 | **Prioritized "Things To Do"** | Top-3 weekly needle-moving actions card | derived from Pillars 2, 5, 6 | COPILOT proposes, MANUAL approves |
| 5 | **Weekly Return on Marketing Spend (W-RoMS)** | Bar: weekly spend vs. direct weekly sales return | connector webhooks (Phase 2) | AUTOPILOT pauses negative-return channels (Phase 3) |
| 6 | **Brand Alarm Meter** | 0–100% compliance dial + 3-point constitution check | `touchpoint_audits` | Core of ALERT/COPILOT (§4.2) |

## 1.6 The 4 Governance Modes

| Mode | Name | Behaviour | Tier |
|---|---|---|---|
| 1 | **MANUAL** | Guardian takes over. 10-second magic-link approval, direct overrides. The honest foundation. | Free |
| 2 | **ALERT** | Brand Alarm Meter fires on voice drift or urgent bottlenecks; human intervenes. | Free |
| 3 | **COPILOT** | AI evaluates uploaded projects/communications against the locked Brand Constitution; Guardian approves. | Premium |
| 4 | **AUTOPILOT** | Routine multi-channel execution and CRM sync run autonomously under constitution guardrails. | Premium/Enterprise (Phase 3) |

## 1.7 The Extendible Visual Metaphor System (logo-designer spec)

The branding eyedea — **The Frictionless Brand Engine: one single pulse** — is the visual system's generative seed. One metaphor, infinite extensions.

**1.7.1 Master SVG mark spec.**
- Pure vector SVG, single `<path>`-family construction: a continuous pulse-line (ECG-style) that completes one full revolution inside a circular engine ring — the "single pulse for every touchpoint" drawn literally.
- Geometry on a 64×64 grid; stroke-only construction (no fills in the primary mark), stroke width 4 units at 64px (scales as `vector-effect="non-scaling-stroke"` off; pure proportional geometry).
- Colors: `brandNeon #38BDF8` pulse on `brandBgDark #0B0F19` (dark mode); `brandBlue #2563EB` on `brandBgLight #F8FAFC` (light mode). Palette frozen — matches existing BrandCheck Pro assets.
- **Monochrome stamp test:** must survive 1-color reproduction (black on white, white on black, fax/favicon/emboss) with zero geometry loss; pulse-break detail must remain legible at 1-color 100% scale-down.
- **Micro-scale validation:** legible at **16px** (favicon: pulse simplified to single chevron variant) and **32px** (app icon: full ring, stroke 2px equivalent). Three size-variants (`mark-16.svg`, `mark-32.svg`, `mark-master.svg`) are hand-tuned, never auto-scaled.
- Wordmark lockups: horizontal (mark left, wordmark right) and stacked; clearspace = height of pulse amplitude.

**1.7.2 UI telemetry extension.** The pulse-line is the rendering primitive for every telemetry widget: the PQ Gauge's needle is a travelling pulse; the Brand Alarm Meter is the pulse-line flatlining/spiking; compliance scores render as pulse amplitude (100% = clean sine, 0% = flatline). Status badges are the four gear positions of a motorcycle gearbox — N/MANUAL, 1/ALERT, 2/COPILOT, 3/AUTOPILOT — because brand building is as easy as riding a motorcycle 🏍. Widgets inherit mark geometry tokens from a single `brand-tokens.json` so the metaphor never forks.

**1.7.3 The 3,650-reel sustainable template system.** Phase 0–4 content marketing is **one educational reel per day for 10 years (3,650 reels) at ₹0 paid spend**. Sustainability comes from a template engine, not heroics: 12 locked After-Effects→Remotion templates (one per content pillar: gear explainers, touchpoint autopsies, crisis case studies, PQ math, guardian time, constitution clinics, three-right-answers, friend-of-the-brand offers, motorcycle metaphors, obituary/tribute formats, unconference recaps, AMA answers). Daily production = swap JSON payload (headline ≤90 chars, one story, one question at the end) → render → publish. A single operator sustains 15 min/day. Every reel ends with a question and an invitation — the consumer as the medium, word-of-mouse as the channel.

## 1.8 Sumit Sir's SMART Objective Framework

Every objective in this PRD passes SMART (each objective itself must be expressible in <280 characters):

| Letter | Definition | Locked Commitment |
|---|---|---|
| **S — Sustainable** | Scalable & eco-conscious | Vercel + Supabase serverless footprint (no idle servers); free-tier-first architecture (§4.1 free-tier budget); template-driven content (§1.7.3); zero paid-ad carbon-waste growth loops |
| **M — Measurable** | Hard cohort targets | **100 → 1,000 → 10,000 → 1,000,000** registered Guardians; internal **PQ > 2.0** gate before Phase 2→3 scaling; per-phase exit metrics in §3 matrix |
| **A — Allowable Cost** | **₹0 paid advertising, forever** | Growth exclusively via Self-Financing Promotions, Friends of the Brand co-marketing, and the Gmail-style invite loop (§4.3) |
| **R — Reviewable** | Milestones inspectable | Every phase has gstack `/retro` + `/benchmark` gates with published scorecards; PQ snapshots are immutable audit trail |
| **T — Time-bound** | Sprint-locked | Phase 0: 4 weeks · Phase 1: 12 weeks · Phase 2: 2 quarters · Phase 3: 4 quarters · Phase 4: 24-month horizon (§3) |

---

# SECTION 2 — VIBE-CODING & GSTACK ANTI-HALLUCINATION ARCHITECTURE

## 2.1 The Problem: The Week-3 Vibe-Coding Collapse

Pure AI vibe-coding follows a known failure curve. Weeks 1–2 feel magical: prompts become pages. Then, around Week 3, the codebase crosses the AI's effective context capacity. One bug fix spawns 30 regressions because the model: (a) rewrites files it doesn't fully see, (b) duplicates logic across files it forgot existed, (c) drifts from implicit contracts, and (d) runs destructive commands while "fixing." The fix is not better prompting. The fix is **architecture that keeps every unit of code inside one context window** and **workflow gates that forbid unreviewed change**.

## 2.2 The Modular Vibe-Coding Protocol (MVCP) — Hard Rules

1. **File-size limit: <250 lines per file, enforced.** ESLint rule `max-lines: ["error", 250]` fails CI. A file that fits in one screen fits in one prompt; the AI can always see 100% of what it edits.
2. **Isolated domain folders.** All code lives under `src/domains/<domain>/` with this fixed internal anatomy:
   ```
   src/domains/
     constitution/   (api/  components/  hooks/  lib/  contracts.ts  index.ts)
     alarm-meter/    eisenhower/  pq-gauge/  invites/  approvals/
     time-tracker/   roms/        cockpit/   billing/  connectors/
   ```
   - Domains may **only** import each other's `contracts.ts` and `index.ts` public surface (enforced by ESLint `no-restricted-imports` + dependency-cruiser).
   - Cross-domain data flows through contracts, never through direct table/component reach-ins.
3. **Immutable contract schemas.** Every domain boundary is a Zod schema + generated TypeScript type, versioned in `contracts.ts`. Contracts are append-only: fields may be added, never renamed or removed without a major-version bump and `/plan-eng-review` sign-off. The `britualise_payload` contract (§4.2) is the reference implementation.
4. **Database as constitution.** All invariants that matter (char limits, score ranges, invite caps) live as Postgres constraints — the model cannot hallucinate past a `CHECK`.
5. **One feature = one branch = one gstack gate chain** (§2.3). No drive-by edits. The AI never touches a file outside the branch's declared blast radius (`/freeze` + `/guard`).
6. **Deterministic AI boundaries.** All LLM calls run at `temperature: 0` with versioned prompt hashes recorded in `model_meta`; prompt snapshots are regression-tested (§2.4 spine files, §4.2 guardrails).

## 2.3 gstack Command → Workflow Mapping (embedded architectural spec)

Every gstack command below is embedded as a **written protocol** executed at its gate — not an interactive blocker. Each entry: purpose → exact steps → exit artifact.

### Strategy & Architecture Gates

**`/office-hours` — Demand Validation Protocol (runs in Phase 0, then monthly).**
Purpose: prove demand with humans before code. Steps: (1) Aha Tree fieldwork — 3 hypothesised emotionales tested in street conversations (bus stops, airports, agency corridors) under a plausible white lie, because people lie when they know it's research; (2) distill 10 candidate truths; (3) Google Form to ≥100 target-mindset respondents; (4) the truth that beats the benchmark truth wins. Exit artifact: signed demand memo naming the winning emotional truth (already locked: Gear 1) and 10 verbatim guardian quotes archived in `docs/research/`.

**`/plan-ceo-review` — 10-Star Product Vision Protocol (gate before every phase).**
Steps: (1) describe the feature as shipped; (2) ask "what would make this a 10-star experience for a Guardian?" — iterate until the answer is concrete; (3) kill or defer anything that doesn't serve a named Gear; (4) confirm SMART compliance (<280 chars, ₹0 paid spend path). Exit artifact: 10-star vision paragraph pasted at the top of the phase plan.

**`/plan-eng-review` — Data Flow, State Trees & Edge Cases (gate before every build sprint).**
Steps: (1) draw the data flow: table → contract → API route → component; (2) enumerate the state tree (loading/empty/error/success for every widget); (3) list edge cases explicitly (zero-division in PQ when C=0, expired magic links, concurrent constitution locks, invite-cap race); (4) verify every new field has a contract schema and every new table has RLS. Exit artifact: eng-review checklist committed alongside the plan.

**`/plan-design-review` & `/design-consultation` — UI/UX & Design System (gate before any cockpit work).**
Steps: (1) check against the flight-deck doctrine — executive, zero-clutter, dark-mode first (`brandBgDark #0B0F19`), one question per screen, the pulse metaphor honored (§1.7); (2) every widget must answer "so what?" in ≤5 words; (3) mobile degradation plan; (4) accessibility pass (WCAG 2.2 AA contrast on neon-on-dark). Exit artifact: annotated wireframe + tokens diff.

### Vibe-Coding Safety Guardrails

**`/careful` — Destructive-Command Prevention (always-on).**
Protocol: before any terminal action, classify as SAFE (read-only, builds, tests), CAUTION (writes outside declared blast radius), or FORBIDDEN (`rm -rf`, force-push to main, `git reset --hard` with uncommitted work, mass file deletion, schema drops without migration). CAUTION/FORBIDDEN require an explicit human token in the commit message (`HUMAN-OK: <reason>`). AI never self-approves.

**`/freeze` — Lock Working Directories (invoked at every bug fix).**
Protocol: snapshot the list of files implicated by the failing test/bug; write `.gstack/freeze.json` with the exact allowed paths; all edits outside the freeze set are rejected at pre-commit. Purpose: a bug fix in `alarm-meter/` can never touch `invites/` — killing the 1-fix→30-regressions cascade at the root.

**`/guard` — Regression Tripwires (companion to /freeze).**
Protocol: before the fix, capture the green state — run the full affected-domain test suite and store hashes of contract test results; after the fix, the guard re-runs them and diffs. Any unrelated test that flips from green→red aborts the merge automatically, even if the fix "works."

### Verification & Deployment Gates

**`/review` — Staff-Level Diff Audit (every PR).** Checklist: contracts honored, file-size limit, RLS present on new tables, no cross-domain imports, no secrets, magic numbers named, each diff hunk justified in the PR body.

**`/investigate` — Root-Cause Debugging (before any fix).** Protocol: reproduce deterministically → isolate via binary search on commits → read the actual error (never guess) → state the root cause in one sentence → only then patch. Blind-guess fixes are rejected at `/review`.

**`/qa` & `/qa-only` — Playwright Headless E2E (webapp-testing spec, every merge).** Suites: (a) **magic-link flow** — request link → email captured from Supabase Inbucket/local SMTP → click → session established ≤10s wall-clock (the "10-second approval" promise is a tested assertion, not a slogan); (b) **constitution locker** — create/lock/version; (c) **britualise audit round-trip** — POST §4.2 payload → score persisted → cockpit dial updates; (d) **invite loop** — 3-invite cap enforced; (e) **deterministic AI guardrails** — golden-prompt snapshots: fixed payloads must return scores within ±2 points across runs at temperature 0, and any blacklist hit must be deterministic (exact match, not probabilistic). `/qa-only` runs tests without build for mid-sprint iteration.

**`/cso` — OWASP & STRIDE Security Audit (every phase gate).** OWASP: injection (parameterised queries only), broken auth (RLS penetration tests — attempt cross-workspace reads as forged user), sensitive-data exposure (constitutions are crown jewels), rate limiting on audit endpoints. STRIDE per domain: spoofing (magic-link token entropy ≥128 bits, single-use, 10-min TTL), tampering (contract validation on every mutation), repudiation (immutable `pq_snapshots`, audit log), info disclosure, DoS (invite/audit quotas per workspace), elevation of privilege (role matrix tests).

**`/ship` — Merge & Release (PR green → main).** Requires: `/review` ✅, `/qa` ✅, `/cso` ✅, freeze-set respected.

**`/land-and-deploy` — Vercel Production Cut.** Preview → staging → production with env var diff check and migration dry-run.

**`/canary` — Gradual Rollout.** 5% of workspaces for 48h on any schema or prompt-version change; auto-rollback if audit error rate >1% or magic-link p95 >10s.

**`/benchmark` — Phase Metrics Publication.** Cohort count, PQ, activation (first audit ≤24h), invite acceptance rate, W-RoMS data coverage — committed to `docs/benchmarks/` per phase.

**`/retro` — Phase Retrospective.** Three questions, Sumit-style: What did we build that served a Gear? What did we build that served only our vanity? What gets broken because "if it is fixed, let's break it"? Output feeds the next `/plan-ceo-review`.

## 2.4 Context-Window Spine Files (exact committed contents)

Three files pin every AI collaborator to the protocol. `CLAUDE.md` and `GEMINI.md` are identical content (kept in sync by CI checksum); `.cursorrules` re-exports the same rules.

```markdown
# CLAUDE.md / GEMINI.md (identical copies) — PROJECT SPINE

You are working on the Executive Brand Operating System (Britual/Brandvertising/BrandCheckPro).
Read MASTER_PRD.md before any task. These rules override your defaults:

## HARD RULES
1. Max 250 lines per file (ESLint enforces). Split before you exceed.
2. Code lives only in src/domains/<domain>/. Cross-domain imports allowed ONLY
   from contracts.ts and index.ts.
3. All boundary data uses the Zod contracts in contracts.ts. Never redefine a
   contract inline. Contracts are append-only.
4. Database invariants belong in Postgres CHECK constraints and RLS policies.
   Migration required for any schema change; never hand-edit production.
5. Every LLM call: temperature 0, prompt version recorded in model_meta.
6. No paid-ad features. No tracking pixels. The consumer is the medium.
7. Brand tokens only from brand-tokens.json (brandNeon #38BDF8, brandBlue #2563EB,
   brandBgDark #0B0F19, brandBgLight #F8FAFC). Dark mode first. Zero clutter.

## WORKFLOW GATES (gstack)
- Bug fix → run /investigate (root cause first), then /freeze + /guard on the
  affected domain, fix ONLY inside .gstack/freeze.json paths.
- New feature → /plan-eng-review checklist must exist in the PR body.
- Never run destructive commands (rm -rf, force-push, schema drop) — /careful
  classifies these FORBIDDEN without a HUMAN-OK token.
- Before merge: /review checklist + /qa Playwright suite + /cso spot audit must pass.

## THE 5 GEARS (every feature must name the gear it serves)
1. Emotional truth: fragmented touchpoints are exhausting (117c)
2. Real business: restoring calm control (91c)
3. Mindset: overwhelmed guardian (125c)
4. Persona: Quietly Observant. Methodically Calm. Street-Sharp (50c)
5. Eyedea: The Frictionless Brand Engine — one pulse per touchpoint (74c)

## DEFINITION OF DONE
Tests green, contracts intact, RLS verified, files <250 lines, PR body lists
the gear served and the gstack gates passed.
```

`.cursorrules` contains the same HARD RULES and WORKFLOW GATES sections verbatim (generated from `CLAUDE.md` by `pnpm run sync:spine`, checksum-verified in CI).

## 2.5 Stack Pinning

| Layer | Choice | Pin Reason |
|---|---|---|
| Framework | Next.js App Router (RSC + route handlers) | Vercel-native, file-based routing keeps AI edits local |
| Styling | Tailwind CSS + `brand-tokens.json` | Utility classes are diff-friendly; no sprawling CSS files |
| DB/Auth | Supabase Postgres + Auth (magic links) | RLS = multi-tenant safety net; free tier covers Phases 0–1 |
| Hosting | Vercel | Preview-per-PR feeds `/qa`; canary via edge config |
| LLM | Provider-agnostic gateway (BYOK-ready, zero-retention) | Contracts fixed at §4.2; model swappable without domain changes |
| Testing | Playwright (E2E), Vitest (unit/contract) | `/qa` and `/qa-only` suites |

---

# SECTION 3 — PHASED PRODUCT ROADMAP (PHASE 0 → PHASE 4)

## 3.0 Comparative Master Matrix

| Dimension | **Phase 0 — Pre-MVP** | **Phase 1 — MVP Magnet** | **Phase 2 — Growth** | **Phase 3 — Scale** | **Phase 4 — Apex** |
|---|---|---|---|---|---|
| Duration | 4 weeks | 12 weeks | 2 quarters | 4 quarters | 24-month horizon |
| Cohort target | 500 waitlist | **100 → 1,000** | **1,000 → 10,000** | **10,000 → 100,000+** | **1,000,000** Guardians |
| Governance modes live | — | MANUAL + ALERT | + COPILOT | + AUTOPILOT | Self-evolving mesh |
| Pricing | Free waitlist | Free (invite-only) | + ₹10,000/mo Premium (₹10Cr+ brands) | + Enterprise SSO contracts | Ecosystem revenue share |
| Hero features | Naming test, logo audit, landing page | Constitution Locker, Brand Alarm Meter ("Britualise It"), Eisenhower Board, 10s magic-link, Time-Reclaimed Tracker, 3-invite loop | Live PQ Gauge, W-RoMS, WLB Calendar Sync, Friends-of-the-Brand connectors, Meet summit engine | Friction Score Aggregator, CV + audio touchpoint audit, enterprise RBAC, SOC2 | Predictive drift prevention, auto-8P briefs, self-healing runtime, HubSpot bridge |
| Infra | Static landing (Vercel free) | Vercel + Supabase **free tier** | Supabase Pro, connector workers | Dedicated clusters, SOC2 controls | Multi-region, HubSpot-native |
| gstack gates | `/office-hours`, `/plan-ceo-review`, `/design-consultation` | + `/plan-eng-review`, `/careful`, `/freeze`, `/guard`, `/qa`, `/cso`, `/ship` | + `/canary`, `/benchmark` per quarter | + SOC2 `/cso` deep audit, `/retro` per release train | + continuous `/benchmark`, acquisition-readiness `/retro` |
| Exit criteria (all required) | Name + URL locked; logo passes stamp/16px test; ≥500 waitlist @ ₹0 | 1,000 users; activation ≥60% (first audit ≤24h); invite acceptance ≥25%; internal PQ ≥1.5 | 10,000 users; **internal PQ >2.0**; ≥40 Premium seats; NPS ≥50 | 100k users; 3 enterprise logos (Coca-Cola/Nestlé/Cadbury class); uptime 99.9% | 1M users; PQ >2.0 sustained 4 quarters; HubSpot integration live in marketplace |

## 3.1 Phase 0 — Pre-MVP: Street Ethnography, URL Lock & Crowdsourced Landing Page (4 weeks)

**Objective (SMART, <280c):** Lock the name, URL, and mark through street truth and crowdsourced proof — 500 Guardians waitlisted at ₹0 spend in 4 weeks.

**Workstreams:**

1. **Aha Tree Ethnography (`/office-hours`).** Three hypothesised emotionales tested in live guardian conversations (agencies, startup mixers, airport lounges — plausible white lie, no questionnaire): (i) fragmentation exhaustion *(hypothesised winner — locked Gear 1)*, (ii) fear of off-brand embarrassment, (iii) loneliness of brand stewardship. Distill to 10 candidate truths → Google Form to 100+ guardians → the truth must beat the benchmark emotional truth to be locked. Output: verbatim quote bank in `docs/research/aha-tree.md`.
2. **Three Right Answers Naming Test.** Candidates: **Plan A — Britual** (*"The daily ritual that makes your brand engine frictionless."*; verb: **Britualise**) · **Plan B — Brandvertising** (*"Monitors your brand's growth beyond just advertising."*; homage to the late Alyque Padamsee) · **Plan C — BrandCheckPro / Brandometer** (legacy diagnostic). Instrument: Google Form — per candidate: 10-point liking scale + word-of-mouth score ("How likely are you to mention this name to a fellow guardian unprompted?", 0–10) + free-text association. ≥100 target-mindset respondents. Decision rule: highest (liking × WOM) product; tie broken toward the candidate with an ownable verb (Britualise).
3. **Logo & Metaphor Audit (logo-designer spec §1.7.1).** Three SVG concepts (one per name) audited: monochrome stamp test, 16px/32px micro-scale legibility, pulse-metaphor extensibility into widgets. Only the winning name's mark proceeds to tokenisation.
4. **Crowdsourced Waitlist Landing Page.** One page, dark flight-deck aesthetic, hero question *"How Frictionless is your Brand Engine?"*, single CTA (email capture → `waitlist` table). Below the fold: the 5 Gears rendered as the five gears of a motorcycle gearbox; the three name candidates shown as live poll results (crowdsourcing the choice is itself the first Self-Financing Promotion — voters become the first prosumers). Zero paid traffic: distribution via Sumit Sir's LinkedIn (10,000 network) + AIC-Techno cohort + daily reel №1 onwards.

**gstack gates:** `/office-hours` memo → `/plan-ceo-review` 10-star vision → `/design-consultation` landing pass → `/ship`.

## 3.2 Phase 1 — MVP: The Free Web App Magnet (12 weeks, 100 → 1,000 users)

**Objective:** Ship the honest free cockpit to 100 beta Brand Managers (LinkedIn 10k network + AIC-Techno cohort), grow to 1,000 purely on the invite loop. Architecture must run inside **Vercel + Supabase free-tier limits** (§4.1 budget).

**Feature set (each mapped to its Gear):**

1. **Brand Constitution Locker** *(Gear 1–5)* — guided 5-question wizard locks the workspace's gears (<144c enforced live), 3 persona adjectives, and blacklisted clichés list. Locking creates an immutable version (`brand_constitutions.version`); unlocking requires MANUAL mode + reason logged. This is the product's sacred object.
2. **Brand Alarm Meter — the "Britualise It" Engine** *(Gear 5)* — upload/paste any touchpoint (hoarding copy, retail signage, packaging proof text, product-experience script, telephone/complaint script, social/ad campaign) → §4.2 `britualise_payload` → 0–100% compliance score + 3-point constitution check + fix recommendations. Non-binary by design: drift is a dial, not a verdict.
3. **Urgent vs. Important Eisenhower Board** *(Gear 2)* — 2×2 triage (`projects_eisenhower`); nightly COPILOT-preview job flags "urgent" items older than 7 days as misclassified firefighting.
4. **10-Second Magic-Link Approval Flow** *(Gear 4: Methodically Calm)* — Supabase Auth magic links; every approval request (audit override, constitution change) arrives as one link → approve/reject in ≤10s, verified by Playwright wall-clock assertion. MANUAL mode's honest foundation.
5. **Time-Reclaimed Tracker** *(Gear 3)* — hours saved vs. review-chaos baseline; feeds Pillar 3 donut.
6. **Gmail-Style 3-Invite Viral Loop** — every activated Guardian gets exactly 3 invites (`viral_invites`, cap enforced by trigger); acceptance converts invitee → new inviter. Loop telemetry feeds $R$, $P$, $C$ → internal PQ. Target acceptance ≥25%.

**Beta recruitment:** personal LinkedIn invitations (word-of-mouse, never ads); AIC-Techno cohort onboarding session run as an unconference. **Cost: ₹0.**

**gstack gates:** `/plan-eng-review` per domain → MVCP build under `/careful` → per-fix `/freeze`+`/guard` → `/review` → `/qa` (magic-link ≤10s, invite cap, audit round-trip, deterministic AI snapshots) → `/cso` (RLS penetration) → `/ship` → `/land-and-deploy` → `/retro`.

## 3.3 Phase 2 — Growth: Viral Contagion & Angel Readiness (2 quarters, 1,000 → 10,000, internal PQ > 2.0)

**Objective:** Turn prosumers into the growth engine; convert ₹10Cr+ brands to Premium; reach angel readiness with PQ > 2.0 as the headline metric.

**Feature set:**
1. **COPILOT Mode GA** — assisted decisions across all six pillars; AI proposes, Guardian disposes (10-second magic-link approvals remain the approval rail).
2. **₹10,000/month Premium Tier** — for ₹10Cr+ revenue brands: unlimited audits, COPILOT, connectors, priority support. (Free tier stays genuinely useful — the honest MANUAL+ALERT core.)
3. **Friends of the Brand Connectors** — OAuth/webhook integrations: **HubSpot, Zoho, Salesforce, Shopify**. Win-win co-marketing with each ecosystem (their marketplaces = our Placement; §4.3). Connectors feed sales-return data into Pillar 5.
4. **Automated Live PQ Gauge** — `calc_pq()` nightly → cockpit radial gauge; PQ visible to every Guardian (their own workspace PQ) — transparency as education.
5. **Weekly Return on Marketing Spend Tracker** — spend ingested via connectors + CSV; correlated with weekly sales return; renders the Advertising × Word-of-Mouth comparison honestly.
6. **Work-Life Balance Calendar Sync** — Google/Outlook calendar read-only sync; computes Guardian Time split (needle-moving 4% vs. review chaos); ALERT fires when chaos >6h/week; "Quiet Hour" calendar protection blocks.
7. **"Britual / Brandometer Meet" Summit Engine** — co-hosted city meets (unconference format — brainstorming doesn't happen in conference rooms): tooling for invites, agendas, recap reels; each Meet is a Self-Financing Promotion (hosts cover costs for access; attendees become prosumers).

**Angel readiness package (`/benchmark`):** cohort curves, PQ > 2.0 sustained, Premium MRR, invite-loop K-factor, retention by constitution-lock cohort.

## 3.4 Phase 3 — Scale: Multi-Agent Enterprise Governance Mesh (4 quarters, 10,000 → 100,000+)

**Objective:** Govern brands at Coca-Cola / Nestlé / Cadbury scale — hundreds of touchpoints, dozens of agencies, one pulse.

**Feature set:**
1. **AUTOPILOT Mode GA** — routine, constitution-safe decisions execute autonomously (multi-channel publishing approvals under score thresholds, CRM sync, W-RoMS negative-channel pausing); every autopilot action is logged, reversible, and within Guardian-set guardrail envelopes.
2. **Single-Pane-of-Glass Friction Score Aggregator** — org-wide Friction Score: weighted composite of all touchpoint audit scores, all regions, all sub-brands; drill-down from pulse → region → touchpoint → single hoarding.
3. **Multi-Touchpoint Computer Vision & Audio Audit** — vision models audit planograms, retail signage photos, packaging proofs (logo clearspace, color delta-E vs. brand tokens, constitution-mandated elements); audio models audit call-center recordings against telephone scripts (tone adjective match, blacklist phrases). All CV/audio outputs still resolve to the same §4.2 response contract — one alarm meter, any medium.
4. **Role-Based Enterprise Hierarchy** — `CMO → Brand Manager → Agency Executor` (`membership_role` enum, §4.1): CMO sets constitution, Brand Managers audit, Agency Executors submit; RLS enforces the hierarchy at the row level. **SOC2 Type II programme + SSO/SAML**, audit log immutability, data-residency options.
5. **Multi-agent governance mesh** — per-domain AI agents (copy agent, visual agent, audio agent) coordinated under the constitution; disagreements escalate to ALERT.

**gstack:** SOC2-mapped `/cso` deep audits per release train; `/canary` per enterprise tenant; quarterly `/retro` with customer councils.

## 3.5 Phase 4 — Apex: Autonomous Self-Evolving Brand Ecosystem & HubSpot Acquisition Horizon (24-month horizon, 1,000,000 Guardians)

**Objective:** The product becomes the category; the ecosystem becomes the moat.

**Feature set:**
1. **Predictive Brand Equity & Drift Prevention** — longitudinal `touchpoint_audits` + `pq_snapshots` train drift forecasts: "at current trajectory, your social voice drifts off-constitution in ~6 weeks" — and **auto-generate 8P briefs** (Product, Packaging, Pricing, Placement, Purchase Experience, Prosumer Policy, Profit Policy, Promotion) pre-filled from the workspace's constitution and audit history for Guardian approval.
2. **Self-Healing Runtime & Adaptive UI** — the cockpit re-ranks itself around each Guardian's top 4% needle-moving actions (measured, not assumed); failed connector syncs self-remediate with Guardian notification; the interface literally gets calmer over time — the product embodies Gear 2.
3. **HubSpot Native Ecosystem Bridge** — deep two-way integration (constitution scores as HubSpot contact/company properties; campaigns auto-audited pre-send), marketplace listing, co-selling motion — engineered as the strategic-acquisition horizon: become irreplaceable inside HubSpot's brand-governance surface.
4. **One million Global Brand Guardians** — sustained by the same ₹0-paid-ads doctrine at scale: 3,650-reel library compounding, Meet engine franchised, PQ > 2.0 sustained four consecutive quarters.

---

# SECTION 4 — DATA SCHEMAS, API CONTRACTS & THE 8Ps GO-TO-MARKET BLUEPRINT

## 4.1 Supabase PostgreSQL DDL (production-ready, free-tier-optimised)

Design notes: RLS everywhere; membership resolved via `SECURITY DEFINER` helpers (avoids recursive policy lookups); all invariants as constraints; indexes sized for free-tier (composite, partial where possible); `pgcrypto` for UUIDs.

```sql
-- =============================================================
-- 0. EXTENSIONS & ENUMS
-- =============================================================
create extension if not exists pgcrypto;

create type governance_mode   as enum ('MANUAL','ALERT','COPILOT','AUTOPILOT');
create type touchpoint_type   as enum ('HOARDING','RETAIL_SIGNAGE','PACKAGING',
                                       'PRODUCT_EXPERIENCE','CALL_SCRIPT',
                                       'SOCIAL_CAMPAIGN','EMAIL','WEB','OTHER');
create type eisenhower_quadrant as enum ('DO_FIRST','SCHEDULE','DELEGATE','ELIMINATE');
create type invite_status     as enum ('SENT','ACCEPTED','EXPIRED','REVOKED');
create type membership_role   as enum ('OWNER','CMO','BRAND_MANAGER','AGENCY_EXECUTOR','VIEWER');
create type plan_tier         as enum ('FREE','PREMIUM','ENTERPRISE');

-- =============================================================
-- 1. TABLES
-- =============================================================

create table workspaces (
  id            uuid primary key default gen_random_uuid(),
  name          text not null check (char_length(name) between 1 and 120),
  slug          text not null unique check (slug ~ '^[a-z0-9-]{3,60}$'),
  plan          plan_tier not null default 'FREE',
  default_mode  governance_mode not null default 'MANUAL',
  owner_id      uuid not null references auth.users(id) on delete cascade,
  created_at    timestamptz not null default now()
);

create table workspace_members (
  workspace_id  uuid not null references workspaces(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  role          membership_role not null default 'BRAND_MANAGER',
  created_at    timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

-- The 5 Gears, locked and versioned. <144 chars enforced per gear.
create table brand_constitutions (
  id                 uuid primary key default gen_random_uuid(),
  workspace_id       uuid not null references workspaces(id) on delete cascade,
  version            int  not null default 1,
  emotional_truth    text not null check (char_length(emotional_truth)  < 144),
  real_business      text not null check (char_length(real_business)    < 144),
  target_mindset     text not null check (char_length(target_mindset)   < 144),
  persona_adjectives text[3] not null,                    -- Gear 4: exactly 3
  branding_eyedea    text not null check (char_length(branding_eyedea)  < 144),
  blacklist_cliches  text[] not null default '{}',
  is_active          boolean not null default true,
  locked_by          uuid not null references auth.users(id),
  locked_at          timestamptz not null default now(),
  unique (workspace_id, version),
  check (cardinality(persona_adjectives) = 3)
);

create table touchpoint_audits (
  id                uuid primary key default gen_random_uuid(),
  workspace_id      uuid not null references workspaces(id) on delete cascade,
  constitution_id   uuid not null references brand_constitutions(id),
  touchpoint        touchpoint_type not null,
  channel           text check (char_length(channel) <= 120),
  payload           jsonb not null,               -- §4.2 request echo (minus secrets)
  compliance_score  numeric(5,2) not null check (compliance_score between 0 and 100),
  check_emotional_truth numeric(5,2) not null check (check_emotional_truth between 0 and 100),
  check_tone        numeric(5,2) not null check (check_tone between 0 and 100),
  blacklist_hits    text[] not null default '{}',
  alarm_state       governance_mode not null,     -- recommended governance response
  recommendations   jsonb not null default '[]',
  model_meta        jsonb not null,               -- {model, temperature:0, prompt_version, latency_ms}
  created_by        uuid not null references auth.users(id),
  created_at        timestamptz not null default now()
);

create table projects_eisenhower (
  id             uuid primary key default gen_random_uuid(),
  workspace_id   uuid not null references workspaces(id) on delete cascade,
  title          text not null check (char_length(title) between 1 and 200),
  quadrant       eisenhower_quadrant not null,
  needle_moving  boolean not null default false,  -- part of the 4%?
  weekly_top3_rank smallint check (weekly_top3_rank between 1 and 3),
  status         text not null default 'OPEN' check (status in ('OPEN','DONE','DROPPED')),
  week_of        date not null default date_trunc('week', now())::date,
  created_by     uuid not null references auth.users(id),
  created_at     timestamptz not null default now()
);

-- PQ snapshots: append-only, immutable audit trail (Reviewable).
create table pq_snapshots (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid references workspaces(id) on delete cascade,  -- null = platform-wide
  period_start  date not null,
  period_end    date not null,
  repeat_users  int not null default 0 check (repeat_users >= 0),
  prosumers     int not null default 0 check (prosumers >= 0),
  total_users   int not null default 0 check (total_users >= 0),
  pq            numeric(10,3) not null,
  computed_at   timestamptz not null default now(),
  unique (workspace_id, period_start)
);

create table viral_invites (
  id              uuid primary key default gen_random_uuid(),
  workspace_id    uuid not null references workspaces(id) on delete cascade,
  inviter_user_id uuid not null references auth.users(id),
  invitee_email   text not null check (invitee_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  invite_code     text not null unique default encode(gen_random_bytes(12), 'hex'),
  status          invite_status not null default 'SENT',
  accepted_at     timestamptz,
  created_at      timestamptz not null default now(),
  unique (workspace_id, invitee_email)
);

-- =============================================================
-- 2. RLS HELPER FUNCTIONS (security definer — no policy recursion)
-- =============================================================
create or replace function is_workspace_member(p_workspace uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from workspace_members
                 where workspace_id = p_workspace and user_id = auth.uid());
$$;

create or replace function has_workspace_role(p_workspace uuid, p_roles membership_role[])
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from workspace_members
                 where workspace_id = p_workspace and user_id = auth.uid()
                   and role = any(p_roles));
$$;

-- =============================================================
-- 3. ROW-LEVEL SECURITY
-- =============================================================
alter table workspaces           enable row level security;
alter table workspace_members    enable row level security;
alter table brand_constitutions  enable row level security;
alter table touchpoint_audits    enable row level security;
alter table projects_eisenhower  enable row level security;
alter table pq_snapshots         enable row level security;
alter table viral_invites        enable row level security;

create policy "members read own workspaces"
  on workspaces for select using (is_workspace_member(id));
create policy "owners update workspace"
  on workspaces for update using (has_workspace_role(id, array['OWNER']::membership_role[]));

create policy "members read membership"
  on workspace_members for select using (is_workspace_member(workspace_id));
create policy "owners manage membership"
  on workspace_members for all
  using (has_workspace_role(workspace_id, array['OWNER','CMO']::membership_role[]));

create policy "members read constitutions"
  on brand_constitutions for select using (is_workspace_member(workspace_id));
create policy "cmo+ insert constitution versions"
  on brand_constitutions for insert
  with check (has_workspace_role(workspace_id, array['OWNER','CMO']::membership_role[]));
-- NOTE: no UPDATE/DELETE policies — constitutions are immutable versions.

create policy "members read audits"
  on touchpoint_audits for select using (is_workspace_member(workspace_id));
create policy "members create audits"
  on touchpoint_audits for insert with check (is_workspace_member(workspace_id));

create policy "members manage eisenhower"
  on projects_eisenhower for all using (is_workspace_member(workspace_id));

create policy "members read pq"
  on pq_snapshots for select using (is_workspace_member(workspace_id) or workspace_id is null);

create policy "members read invites"
  on viral_invites for select using (is_workspace_member(workspace_id));
create policy "members send invites"
  on viral_invites for insert with check (
    is_workspace_member(workspace_id) and inviter_user_id = auth.uid());

-- =============================================================
-- 4. INDEXES (free-tier conscious: composite, partial)
-- =============================================================
create index idx_members_user        on workspace_members(user_id);
create index idx_const_ws_active     on brand_constitutions(workspace_id) where is_active;
create index idx_audits_ws_time      on touchpoint_audits(workspace_id, created_at desc);
create index idx_audits_ws_score     on touchpoint_audits(workspace_id, compliance_score);
create index idx_eisenhower_ws_week  on projects_eisenhower(workspace_id, week_of);
create index idx_pq_ws_period        on pq_snapshots(workspace_id, period_start desc);
create index idx_invites_inviter     on viral_invites(inviter_user_id) where status = 'SENT';

-- =============================================================
-- 5. PQ CALCULATION
-- =============================================================
create or replace function calc_pq(p_repeat int, p_prosumers int, p_total int)
returns numeric language plpgsql immutable as $$
begin
  if p_total <= 0 then return 0; end if;             -- edge case: division by zero
  return round((2.0*p_repeat + 3.0*p_prosumers) / p_total, 3);
end; $$;

create or replace function snapshot_pq(p_workspace uuid, p_start date, p_end date)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_r int; v_p int; v_c int; v_id uuid;
begin
  select count(*) filter (where sessions_30d >= 3),
         count(*) filter (where is_prosumer),
         count(*)
    into v_r, v_p, v_c
    from workspace_member_activity                -- nightly materialised view
   where workspace_id = p_workspace;
  insert into pq_snapshots (workspace_id, period_start, period_end,
                            repeat_users, prosumers, total_users, pq)
  values (p_workspace, p_start, p_end, v_r, v_p, v_c, calc_pq(v_r, v_p, v_c))
  on conflict (workspace_id, period_start) do nothing
  returning id into v_id;
  return v_id;
end; $$;

-- =============================================================
-- 6. TRIGGERS — invite cap (Gmail-style 3) & constitution versioning
-- =============================================================
create or replace function enforce_invite_cap() returns trigger
language plpgsql as $$
begin
  if (select count(*) from viral_invites
      where inviter_user_id = new.inviter_user_id and status in ('SENT','ACCEPTED')) >= 3 then
    raise exception 'INVITE_CAP: a guardian carries exactly 3 invites';
  end if;
  return new;
end; $$;
create trigger trg_invite_cap before insert on viral_invites
  for each row execute function enforce_invite_cap();

create or replace function next_constitution_version() returns trigger
language plpgsql as $$
begin
  new.version := coalesce((select max(version) from brand_constitutions
                           where workspace_id = new.workspace_id), 0) + 1;
  update brand_constitutions set is_active = false
   where workspace_id = new.workspace_id and is_active;
  return new;
end; $$;
create trigger trg_constitution_version before insert on brand_constitutions
  for each row execute function next_constitution_version();
```

**Free-tier budget (Phase 1):** ≤1,000 workspaces, ≤50k audits/month, snapshots nightly via `pg_cron` — comfortably inside Supabase free tier (500MB); media uploads deferred to Phase 2 (signed URLs → storage) to protect the budget.

## 4.2 Brand Alarm Meter — JSON Schema & TypeScript/Zod Contract (`britualise_payload`)

This is the reference immutable contract (`src/domains/alarm-meter/contracts.ts`). Version: `prompt_version` tracks the deterministic prompt hash.

```ts
import { z } from "zod";

export const TOUCHPOINTS = [
  "HOARDING","RETAIL_SIGNAGE","PACKAGING","PRODUCT_EXPERIENCE",
  "CALL_SCRIPT","SOCIAL_CAMPAIGN","EMAIL","WEB","OTHER",
] as const;
export const Touchpoint = z.enum(TOUCHPOINTS);
export const GovernanceMode = z.enum(["MANUAL","ALERT","COPILOT","AUTOPILOT"]);

/* ---------- REQUEST ---------- */
export const BritualiseRequest = z.object({
  workspace_id: z.string().uuid(),
  constitution_version: z.number().int().positive().optional(), // default: active
  touchpoint: Touchpoint,
  channel: z.string().max(120).optional(),
  content: z.object({
    headline:   z.string().max(500).optional(),
    body_copy:  z.string().max(10000).optional(),
    transcript: z.string().max(20000).optional(),   // CALL_SCRIPT
    media_refs: z.array(z.string().url()).max(4).optional(), // CV audits (Phase 3)
    locale:     z.string().max(10).default("en-IN"),
  }).refine(c => c.headline || c.body_copy || c.transcript || (c.media_refs?.length ?? 0) > 0,
            { message: "at least one content field required" }),
  options: z.object({
    mode:   GovernanceMode.default("COPILOT"),
    strict: z.boolean().default(true),  // strict: any blacklist hit caps score at 49
  }).default({}),
});
export type BritualiseRequest = z.infer<typeof BritualiseRequest>;

/* ---------- RESPONSE ---------- */
const Score = z.number().min(0).max(100);
export const BritualiseResponse = z.object({
  audit_id: z.string().uuid(),
  compliance_score: Score,                       // the Brand Alarm Meter dial (0–100)
  constitution_check: z.object({
    emotional_truth_alignment: z.object({ score: Score, rationale: z.string().max(500) }),
    adjective_tone_match: z.object({
      adjectives: z.array(z.object({ adjective: z.string(), score: Score })).length(3),
      aggregate:  Score,
    }),
    blacklist_check: z.object({ passed: z.boolean(), hits: z.array(z.string()) }),
  }),
  alarm_state: GovernanceMode,                   // recommended governance response
  recommendations: z.array(z.object({
    issue:    z.string().max(300),
    fix:      z.string().max(300),
    priority: z.enum(["P0","P1","P2"]),
  })).max(5),
  model_meta: z.object({
    model: z.string(), temperature: z.literal(0),
    prompt_version: z.string(), latency_ms: z.number().int().nonnegative(),
  }),
});
export type BritualiseResponse = z.infer<typeof BritualiseResponse>;
```

**Equivalent JSON Schema (OpenAPI/docs):**

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "britualise_payload",
  "type": "object",
  "required": ["workspace_id", "touchpoint", "content"],
  "properties": {
    "workspace_id": { "type": "string", "format": "uuid" },
    "constitution_version": { "type": "integer", "minimum": 1 },
    "touchpoint": { "enum": ["HOARDING","RETAIL_SIGNAGE","PACKAGING","PRODUCT_EXPERIENCE","CALL_SCRIPT","SOCIAL_CAMPAIGN","EMAIL","WEB","OTHER"] },
    "channel": { "type": "string", "maxLength": 120 },
    "content": {
      "type": "object",
      "properties": {
        "headline":   { "type": "string", "maxLength": 500 },
        "body_copy":  { "type": "string", "maxLength": 10000 },
        "transcript": { "type": "string", "maxLength": 20000 },
        "media_refs": { "type": "array", "items": { "type": "string", "format": "uri" }, "maxItems": 4 },
        "locale":     { "type": "string", "maxLength": 10, "default": "en-IN" }
      },
      "anyOf": [
        {"required": ["headline"]}, {"required": ["body_copy"]},
        {"required": ["transcript"]}, {"required": ["media_refs"]}
      ]
    },
    "options": {
      "type": "object",
      "properties": {
        "mode":   { "enum": ["MANUAL","ALERT","COPILOT","AUTOPILOT"], "default": "COPILOT" },
        "strict": { "type": "boolean", "default": true }
      }
    }
  }
}
```

**Deterministic guardrails (webapp-testing spec):** every audit request is executed at `temperature: 0`; the exact prompt + constitution snapshot hash is stored in `model_meta.prompt_version`; the `/qa` suite runs **golden-payload regression** — 12 fixed payloads whose scores must reproduce within ±2 points and whose blacklist hits must be byte-identical across runs; a failing snapshot blocks `/ship`.

## 4.3 The 8Ps of Creating Prosumers — Go-To-Market Blueprint

| P | Strategy | Locked Tactics | Metric |
|---|---|---|---|
| **Product** | The Frictionless Brand Engine — one pulse for every touchpoint | Free tier = MANUAL+ALERT (honest foundation); Premium = COPILOT; Enterprise = AUTOPILOT | Activation ≥60% (first audit ≤24h) |
| **Packaging** | Dark flight-deck cockpit; pulse metaphor everywhere; name = daily ritual verb ("Britualise It") | SVG mark passes stamp/16px tests; every screen answers one question | Brand recall in naming-test follow-ups |
| **Pricing** | Freemium; ₹10,000/mo Premium for ₹10Cr+ brands; Enterprise custom | ₹0 paid ads keeps CAC ≈ ₹0 → pricing is margin, not recovery | ≥40 Premium seats by Phase 2 exit |
| **Placement** | Where guardians already gather — no media buying | LinkedIn (Sumit Sir's 10k network), AIC-Techno cohort, HubSpot/Zoho/Salesforce/Shopify marketplaces, unconference city Meets | Marketplace-sourced signups share |
| **Purchase Experience** | 10-second magic-link from invite to cockpit; first audit free, no card | Playwright-asserted ≤10s auth; constitution wizard ≤10 min to first value | Time-to-first-audit; drop-off funnel |
| **Prosumer Policy** | The consumer IS the medium — every guardian is equipped to recommend | 3-invite Gmail loop; shareable public audit verdicts; Meet hosting kits; prosumer recognition (Friend of the Brand badge) | **PQ = (2R+3P)/C > 2.0**; invite acceptance ≥25% |
| **Profit Policy** | 50%-style alignment ethos adapted to SaaS: value before invoice | Free tier genuinely useful; Premium pays for itself in reclaimed guardian hours (Time-Reclaimed Tracker proves it); enterprise pilots convert on measured Friction-Score delta | Premium MRR; pilot→contract conversion |
| **Promotion** | **Self-Financing Promotions only — ₹0 paid ads** | 3,650 daily template reels (§1.7.3); crowdsourced naming vote (Phase 0 promotes itself); Friends-of-the-Brand co-marketing with connector partners; Britual/Brandometer Meets (hosts fund, we bring the room); SEO/GEO content library on brand-crisis and campaign-failure keywords | Organic share of signups = 100%; reel→signup attribution |

---

## APPENDIX A — Phase Gate Checklist (one line each)

- **P0 exit:** name locked by data · URL secured · logo stamp/16px ✅ · 500 waitlist @ ₹0.
- **P1 exit:** 1,000 users · activation ≥60% · invite acceptance ≥25% · internal PQ ≥1.5 · `/qa`+`/cso` green.
- **P2 exit:** 10,000 users · **PQ > 2.0** · ≥40 Premium seats · connectors GA · `/benchmark` published.
- **P3 exit:** 100,000+ users · 3 enterprise logos · SOC2 Type II · 99.9% uptime.
- **P4 exit:** 1,000,000 Guardians · PQ > 2.0 × 4 quarters · HubSpot bridge live.

*Products have rationales. Brands have emotionales. This PRD is the emotionale, engineered.* 🏍
