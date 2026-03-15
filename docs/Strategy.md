# Strategy — The Tribunal

## What we are building

The Tribunal is an **evidence scoring arena**: people submit evidence for a claim, judges score it across 3 dimensions, and the platform makes **the act of judging** visible, dramatic, and shareable.

### Product north star

**Make scoring more visible, more dramatic, more shareable.**

## Strategic stance: multi-domain on purpose

We will not pick one “forever domain.” We will launch with **two deliberate lanes** because they produce different kinds of value:

- **Lane A: Politics / news / OSINT**
    - Primary output: **virality + acquisition**
    - Why: high-frequency claims, constant novelty, strong screenshot culture
- **Lane B: Religion / theology (and other evergreen meaning domains)**
    - Primary output: **depth + retention + identity**
    - Why: sustained participation, long threads of evidence, “community of judges” feeling

We will treat domains as **content flavors** on top of one core mechanic, not as separate products.

## Core loops

### 1) Screenshot loop (growth)

1. Controversial evidence gets judged
2. Split shows up (radar + 3 numbers)
3. A score card is posted
4. Someone disagrees and joins to judge

**Design principle:** every controversial moment must have a **one-click share artifact**.

### 2) Session loop (activation)

- Schedule a time window around a single claim.
- Encourage concentrated judging.
- End with a “verdict card” and biggest split.

### 3) Reputation loop (retention)

- Judges build a record.
- Streaks and signature rulings create identity.
- Higher tiers get more influence and access.

## Market positioning (decision)

We are **not**:

- A fact-checking authority
- A debate platform
- A prediction market

We are:

- A **public scoring interface for evidence quality**

### One-liner options (pick one to ship)

- **Olympic judging for evidence**
- Rotten Tomatoes meets ESPN — for evidence
- “Take it to the Tribunal.”

## Brand system: make [tribunal.so](http://tribunal.so) feel clean

We will treat the URL as part of the brand, not an afterthought.

### Make .so a rhetorical device (not “a TLD you apologize for”)

`tribunal.so` can read like a sentence fragment: **“Tribunal, so…”**

- “Tribunal. So… what’s the verdict?”
- Marketing line: **“[tribunal.so](http://tribunal.so) — so, what’s your verdict?”**

This frames `.so` as an intentional prompt rather than an odd domain ending.

- Use [**TRIBUNAL.SO**](http://TRIBUNAL.SO) as a consistent lockup in key brand moments.
- Prefer saying it as: **“Tribunal dot so”** (two words) rather than spelling the letters.
- Teach the URL passively via repeated exposure:
    - Score cards
    - Session recap cards
    - The app header / logo lockup
- Use short, intentional link shapes so the TLD feels purposeful:
    - `tribunal.so/c/<claim>`
    - `tribunal.so/e/<evidence>`

## Launch strategy: dual-lane seeding

### Lane A seed set (Politics / news)

Goal: produce **fast splits**.

- Breaking claims with mixed-quality sources
- Claims where source credibility is high but logic is contested, and vice versa

### Lane B seed set (Religion / theology)

Goal: produce **meaningful participation**.

- Well-known contested claims that invite structured evidence
- Claims where “unresolved” is an honest outcome

### Operating model

- Curate 10–30 starter claims.
- Run 2–3 weekly “Tribunal Nights.”
- Treat each session as a content event with a recap artifact.

## MVP decisions (what matters first)

Must prove:

- People will judge.
- Splits happen.
- Shares happen.

So MVP must include:

- Claim + evidence + judging
- Composite + controversy detection
- Radar chart + score cards
- Share image / OG card

## Metrics and success criteria (early)

- **Activation:** % of new users who submit ≥1 rating in first session
- **Engagement:** ratings per active claim per week
- **Virality:** shares per controversial claim
- **Retention:** D7 judge retention for judges who rate ≥5 items

## Tech strategy note: re-check the PRD stack against the real hot paths

The PRD’s stack section was a quick recommendation and deserves scrutiny now that the product is more defined.

### The three hot paths that define the stack

Your tech choices are good or bad based on how they handle these three paths, not general CRUD:

| Hot Path | What Happens | Load Profile |
| --- | --- | --- |
| Live Scoring | 1000 judges submit ratings in a 15-min Tribunal session | 1000 concurrent writes + broadcast to all viewers |
| The Board | Every score cascades into composite recalculation → leaderboard re-rank | High-frequency reads, ~1 write/sec updating rankings |
| OG Image Generation | Every rating generates a shareable score card image for X | Burst compute on every submit |

### Layer-by-layer assessment (current recommendation)

#### Frontend: Next.js + React

- **Verdict:** ✅ correct choice
- **Why:** SSR gives you SEO on Claim pages + Settled Claims Hall. RSC keeps The Board performant.
- **Risk:** bundle bloat; real-time heavy views can fight server-oriented patterns.
- **Watch:** if Live Tribunals dominate, consider a separate realtime client at `live.tribunal.so` (v2 concern).

#### Database: Supabase (Postgres)

- **Verdict:** ⚠️ correct for now, needs augmentation
- **Why:** Postgres + RLS + Supabase DX is perfect for MVP.
- **Risk:** synchronous composite recalculation will bottleneck writes at scale.
- **Add later:** Redis for hot state (leaderboards, live composites, session state) + async job queue for recompute off the write path.

#### Real-time: Supabase Realtime

- **Verdict:** ❌ likely breaks first at scale
- **Why it’s fine for MVP:** zero-config, good for early concurrency.
- **Why it breaks:** connection-based fan-out; 1K–10K viewers per room is the danger zone.
- **Plan:** start here, migrate before Phase 2 Live Tribunals to Ably/Pusher or PartyKit / Durable Objects.

#### Auth: Supabase Auth

- **Verdict:** ✅ correct choice

#### Search: Meilisearch

- **Verdict:** ✅ correct choice

#### Hosting: Vercel

- **Verdict:** ⚠️ correct for launch; watch cost + websocket constraints
- **Plan later:** Cloudflare Pages/Workers or [Fly.io](http://Fly.io) as real-time becomes central.

#### Analytics: PostHog

- **Verdict:** ✅ correct choice

### Web vs Native

- **Recommendation:** Web-first. PWA second (Phase 2). Native only when retention supports a daily habit (later-stage).

### Scaling roadmap (high-level)

| Stage | Users | What changes |
| --- | --- | --- |
| Launch | &lt; 1K | Current stack is fine. Supabase can handle everything. |
| Traction | 1K–10K | Add Redis for leaderboard caching. Add async job queue for composite recalculation. |
| Growth | 10K–100K | Migrate realtime to Ably/PartyKit. Add object storage for OG images. Consider Vercel → Cloudflare migration. |
| Scale | 100K+ | Read replicas. CDN-cached Board with small staleness tolerance. Dedicated infra for Live Tribunals. Native app consideration. |

## Risks we should actively manage

- Judge capture and coordinated gaming
- Low-quality submissions
- Cold start (not enough judges per claim)

## Decisions to make next

- Confirm the “ship” one-liner.
- Define the first 3 session topics (1 per lane + 1 wildcard).
- Define seeding quality bar for evidence links.
- Define moderation stance and what gets removed vs. scored low.