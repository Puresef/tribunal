# The Tribunal — Product Requirements Document

> **Version:** 0.3 (Merged — Full Detail)
> **Date:** 2026-03-14
> **Status:** Draft for Review

---

## 1. Vision & Problem Statement

### The Broken Status Quo

Every major platform that touches truth has a fatal flaw:

| Platform | Flaw |
|---|---|
| Reddit / X | Binary upvotes. No dimensional reasoning. Mob rules. |
| PolitiFact / Snopes | Expert gatekeepers. Community is passive. Doesn't scale. |
| Kialo | Structured but sterile. Zero entertainment value. Niche forever. |
| Community Notes | Better, but still binary agree/disagree. No scoring theater. |
| Polymarket | Brilliant mechanic, but scores *outcomes*, not *evidence*. Finance-gated. |

**The gap:** No platform makes *evaluating evidence* the core experience. Nowhere is the act of judging visible, performative, dramatic, and shareable.

### The Tribunal

**The world's first evidence performance arena.** Community judges score submissions across credibility dimensions with the drama of Olympic scoring, the rigor of peer review, and the dopamine of a live leaderboard.

> **One-liner:** "Rotten Tomatoes meets ESPN — for evidence."

**Domain-agnostic by design.** Politics, science, legal disputes, journalism, historical claims, health, religion, tech scandals — any claim that rests on evidence is Tribunal-ready. The platform doesn't care *what* the truth is. It cares about *how well you proved it.*

### Origin Story

The concept emerged from an Islamic theological proofs project — a community trying to rigorously score evidence for metaphysical claims. The insight: **the scoring mechanic itself was more engaging than the content.** When judges gave wildly split scores (high source credibility, low logical strength), the tension was electric. That drama is the product. The religion use case is now just one row in a much larger table.

---

## 2. Market Positioning

### Category Creation

The Tribunal creates a new category: **Participatory Evidence Scoring.** Not fact-checking (top-down). Not debate (adversarial). Not prediction markets (financial). This is *evidence as competitive performance, judged live by the crowd.*

### Why This Is Polymarket-Scale

Polymarket proved that turning evaluation into a game creates massive engagement — but it has structural ceilings:

| | Polymarket | The Tribunal |
|---|---|---|
| **Participation barrier** | Must stake money | Free to judge |
| **What's scored** | Binary outcome predictions | Evidence quality across 3 dimensions |
| **Resolution** | Binary, one-time | Continuous, evolving |
| **Engagement fuel** | Financial gain/loss | Reputation + scoring drama |
| **TAM** | Crypto-native speculators (~5M) | Anyone who argues about evidence (~500M+) |
| **Virality** | Low (finance screenshots) | High (split score cards are inherently meme-able) |
| **Regulatory risk** | Extreme (gambling laws) | Low (community opinion scoring) |

**The Tribunal takes Polymarket's insight** (make evaluation a competitive game) **and removes every ceiling** (money, binary resolution, regulatory, TAM).

### Full Competitive Landscape

| Platform | What They Do | The Tribunal's Edge |
|---|---|---|
| **Polymarket** | Financial prediction markets | We score *evidence*, not outcomes. No money barrier. |
| **Kialo** | Structured debate trees | We make evaluation *visible and dramatic*; Kialo buries it in nested text |
| **Community Notes** | Crowdsourced fact-checking | Dimensional scoring, not binary agree/disagree |
| **PolitiFact / Snopes** | Expert fact-checking | We democratize evaluation; experts earn verified status, not gatekeep it |
| **AllSides** | Media bias ratings | We go evidence-level, not outlet-level |
| **Wikipedia** | Collaborative reference | We score evidence *in real time*, not static consensus |

### Target Audience (Launch Priority)

1. **Debate & reasoning enthusiasts** — people who already argue about evidence on X, Reddit, Discord
2. **Citizen journalists & OSINT community** — people who evaluate sources as a skill
3. **Students & academics** — trained in evaluating evidence quality
4. **General curious public** — drawn by the spectacle, retained by the mechanics

---

## 3. Core Concepts & Terminology

| Term | Definition |
|---|---|
| **Claim** | A top-level assertion submitted for community evaluation |
| **Evidence** | A submission attached to a Claim — a source, argument, or data point |
| **Performance** | The live moment a new Evidence enters the scoring queue |
| **Judge** | Any community member who scores Evidence |
| **Tribunal** | A focused scoring session — open (ongoing) or scheduled (event) |
| **Score Card** | A judge's 3-dimensional rating, displayed like Olympic scoring (9.2 · 8.7 · 9.5) |
| **Composite** | Weighted aggregate score for a piece of evidence |
| **The Board** | Main view — live-ranked leaderboard of Claims by composite |
| **Radar Chart** | Per-evidence dimensional breakdown — reveals controversy visually |
| **Split** | When a score card has a >3.0 spread across dimensions — the viral moment |

---

## 4. Scoring Mechanics

### 4.1 The Three Dimensions

| Dimension | Measures | Scale | Anchors |
|---|---|---|---|
| **Source Credibility** | Trustworthiness of origin | 1.0 – 10.0 | 1 = anon blog · 5 = news report · 10 = peer-reviewed primary source |
| **Logical Strength** | Soundness of reasoning | 1.0 – 10.0 | 1 = non-sequitur · 5 = plausible inference · 10 = deductive proof |
| **Relevance** | Directness to the claim | 1.0 – 10.0 | 1 = tangential · 5 = related · 10 = directly dispositive |

### 4.2 Score Aggregation

```
Evidence Composite = (Source × 0.35) + (Logic × 0.40) + (Relevance × 0.25)
```

Claim Composite = weighted average of all Evidence Composites, factoring:
- Judge count per evidence (higher N → more weight)
- Judge tier (Verified = 2×, Senior = 1.5×, Standard = 1×)
- Recency (slight boost for newer evidence reflecting evolving understanding)

### 4.3 Controversy Detection

Evidence is flagged **Controversial** when:
- σ > 2.5 on any dimension across judges, OR
- max dimension avg − min dimension avg > 3.0

Controversial evidence gets the split radar chart — the visual firework that drives sharing.

### 4.4 Circumstantial Evidence & Unresolved Claims

Not all claims reach a decisive composite. When evidence on both sides is weak or indirect, **circumstantial evidence scores honestly** rather than being excluded:

- A probabilistic inference scores: Source ~6, Logic ~4.5 ("consistent with the claim"), Relevance ~7 → composite ~5.7
- No single piece closes the claim — but 15 consistent circumstantial pieces can move a claim from 3.0 to 5.5–6.0 through accumulation

This creates a formal third claim state:

| State | Composite Range | Meaning | Visual |
|---|---|---|---|
| **Active** | Any | Judging in progress | Pulsing indicator |
| **Unresolved** | 4.0 – 6.5 | Evidence genuinely insufficient either way | Amber treatment — honest uncertainty |
| **Settled** | < 2.0 or > 8.5 (with N ≥ 50 judges) | Community consensus reached | Trophy treatment |

**Unresolved** is a feature, not a failure. It appears as its own filter on The Board ("Most Uncertain") and signals epistemic honesty — the platform acknowledges when evidence doesn't close a question. Against Settled claims, the contrast is informative: a 5.2 composite Unresolved claim and a 9.5 Settled claim tell very different, both useful, stories.

### 4.4 Score Card Display

Each judge's rating appears as an **Olympic-style Score Card:**

```
┌──────────────────────────────┐
│  Judge: @CriticalThinker42   │
│  ───────────────────────     │
│  Source:    9.2               │
│  Logic:     4.1               │
│  Relevance: 8.8               │
│  ───────────────────────     │
│  🏅 Senior Judge · Streak 47 │
└──────────────────────────────┘
```

Score cards animate in one-by-one during live Tribunal sessions — like Olympic judge reveals.

---

## 5. User Roles & Progression

```
Spectator → Member → Judge → Senior Judge → Verified Judge → Chief Justice
  (view)    (submit)  (score)  (submit claims)  (weighted 2×)   (elected/topic)
```

### 5.1 Permissions by Role

| Action | Spectator | Member | Judge | Senior Judge | Verified Judge |
|---|---|---|---|---|---|
| View The Board | ✅ | ✅ | ✅ | ✅ | ✅ |
| View score breakdowns | ✅ | ✅ | ✅ | ✅ | ✅ |
| Submit Evidence | ❌ | ✅ | ✅ | ✅ | ✅ |
| Score Evidence | ❌ | ❌ | ✅ | ✅ | ✅ |
| Submit Claims | ❌ | ❌ | ❌ | ✅ | ✅ |
| Weighted scoring (2×) | ❌ | ❌ | ❌ | ❌ | ✅ |
| Challenge Settled Claims | ❌ | ❌ | ❌ | ✅ | ✅ |
| Moderate / flag | ❌ | ❌ | ❌ | ✅ | ✅ |

### 5.2 Judicial Record

Each judge accumulates a visible **Judicial Record:**
- **Consistency Score** — tracks alignment with eventual consensus (rewards early accurate outliers, not conformity)
- **Domain Specialties** — topics with highest judging accuracy
- **Activity Streak** — continuous engagement
- **Signature Rulings** — their most divergent scores later validated by consensus
- **Overturned Count** — transparency, not punishment

---

## 6. Core Features (MVP)

### 6.1 The Board
Live-ranked leaderboard. The home screen.
- Claim cards: title, topic tag, composite score (large, animated), evidence count, judge count, sparkline trend
- Badges: 🔥 active judging now, ⚡ controversial (high dimensional split)
- Sort/filter: Trending | Top Rated | Most Controversial | Newest | By Topic

### 6.2 Claim Detail Page
- **Hero section:** Claim title, submitter, composite score (large), total judges, radar chart, score trend timeline
- **Evidence feed:** Each piece of evidence as a card with score card mosaic + per-evidence radar chart + "Judge This" CTA
- **Tabs:** All Evidence | Supporting | Challenging | Most Controversial
- **Score History:** timeline of composite change as evidence was added and judged

### 6.3 Scoring Interface
Full-screen modal. Deliberate, focused. Three sliders (1.0–10.0 in 0.1 increments). Anchor descriptions visible as helper text per slider position. Submit → animated score card reveal showing judge's scores alongside the running average. Option to write a short public justification after submission.

### 6.4 Live Tribunal Sessions
Scheduled 15–30 min events for high-activity Claims. Evidence enters sequentially as "performances." Score cards animate in real-time as judges submit. Session ends → summary card: biggest movers, most controversial evidence, MVP Judge.

### 6.5 Judicial Profile
Rank, progression bar, consistency graph, domain badges, scoring history, signature rulings.

---

## 7. Domain Examples

The Tribunal is not *about* any topic. It's infrastructure for evaluating evidence on *any* topic:

| Domain | Example Claim | Why It Works |
|---|---|---|
| **Politics** | "The border wall reduced illegal crossings by 40%" | Source vs. NGO data splits — viral radar charts |
| **Health** | "Intermittent fasting extends lifespan" | Logical strength battleground — correlation vs. causation |
| **Tech** | "AI will replace 30% of jobs by 2030" | Source credibility varies wildly (tweet vs. MIT study) |
| **Legal** | "This contract clause is enforceable in California" | Verified Judges with JDs carry weighted scores |
| **History** | "The Library of Alexandria's destruction set civilization back 1000 years" | Relevance splits — high-credibility sources, questionable relevance |
| **Religion** | "The Quran's embryology descriptions predate modern science" | The origin use case — theological proofs with rigorous scoring |
| **Science** | "Cold fusion is achievable with current technology" | Source credibility (fringe) vs. logical strength |
| **Journalism** | "This outlet's coverage of X was balanced" | Meta-evaluation — judging the judges of information |
| **Conspiracy** | "The moon landing was staged" | Evergreen content engine — settled score + permanent challenge stream |

---

## 8. Information Architecture

```
The Tribunal
├── The Board (home / live leaderboard)
│   ├── Claim Detail
│   │   ├── Evidence Feed
│   │   │   └── Scoring Interface (modal)
│   │   ├── Score History Timeline
│   │   └── Radar Charts
│   └── Live Tribunal Session (event mode)
├── Submit
│   ├── Submit Claim (Senior+ only)
│   └── Submit Evidence (Member+)
├── Explore
│   ├── By Topic
│   ├── Most Controversial
│   ├── Recently Judged
│   └── Settled Claims Hall (trophy archive)
├── My Record
│   ├── Judicial Profile
│   ├── Scoring History
│   └── Domain Badges
├── Leaderboards
│   ├── Top Claims (all-time)
│   ├── Top Judges (by consistency)
│   └── Most Active Tribunals
└── Settings & Auth
```

---

## 9. Platform Strategy: The X Symbiosis

### The Thesis: Don't Fight X — Be Its Scoreboard

X (Twitter) is the world's real-time discourse firehose. It's where claims are *made* — presidents post there, wars are narrated there, controversies ignite there. Every other platform (Reddit, TikTok, Facebook) largely repurposes X content.

**The Tribunal should never compete with X for claim generation.** X is the courtroom lobby where everyone is yelling. The Tribunal is the bench where the judges sit.

```
X is where claims are MADE          (firehose — volume)
The Tribunal is where claims are SCORED   (courtroom — rigor)
X is where scores are SHARED        (screenshots — virality)
                      ↓
         The loop feeds itself
```

### Integration Playbook

| Tactic | How It Works | Why It Matters |
|---|---|---|
| **@TribunalBot** | Tag `@TribunalBot` on any X post → bot auto-creates a Claim with the post as source evidence | Zero-friction ingestion from X's firehose. Every tag is free distribution |
| **Score Card OG Images** | Every rating generates a screenshot-native image (radar chart + scores) optimized for X | X culture runs on screenshots. Score cards are designed to be the screenshot |
| **Thread Verdicts** | At 50+ judges, Tribunal auto-posts: "THE VERDICT on [claim]" — composite, wildest split, most controversial evidence | Authoritative content X users quote-tweet to win arguments |
| **Trending Import** | Tribunal surfaces trending X topics, auto-suggests Claims for the community to formalize | Rides X's trend cycle |

**Key insight:** "Take it to The Tribunal" should become a phrase — the way "Google it" or "Wikipedia it" became reflexive.

### Platform-Agnostic Distribution (Beyond X)

The embed widget is independent of X — a `<script>` tag that works anywhere:
- Substack newsletters, Ghost blogs, WordPress
- News site articles (composites update live as more judges score)
- Academic and policy blogs — "this claim has been judged by N judges: 6.2/10"
- Discord bots — summon Tribunal scores inside a server with a slash command

X amplifies viral moments. Embeds create persistent, compounding distribution on every platform independently.

### Why X Can't Replicate This

- Community Notes is binary (helpful/not). No dimensional drama.
- X has no incentive to *resolve* disputes — it wants engagement, not resolution.
- The cumulative judicial record and scoring vocabulary are network effects X can't bolt on.

---

## 10. Claim Lifecycle & Evergreen Engagement

### Claim Temperature Classification

| Type | Examples | Velocity | Risk |
|---|---|---|---|
| 🔴 **Hot** | Breaking news, elections, active conflicts | Hourly/daily new claims | None — natural churn |
| 🟡 **Warm** | Tech predictions, health debates, policy | Weekly/monthly evolution | Low — occasional re-scoring |
| 🟢 **Evergreen** | Conspiracy, religion, history, philosophy | Rarely — finite evidence pool | High — risk of stagnation |

### Solving the Evergreen Problem

**The core insight:** "Is the earth flat?" settling at 9.7 isn't a dead end — it's an asset. A settled claim is a *trophy.*

#### 1. Settled Claims Hall
A prestige archive with distinct visual treatment. These pages become permanent SEO magnets ("is the earth flat tribunal score" → top Google result) and carry the **"Tribunal Certified" badge** — an embeddable stamp that becomes the internet's citation.

#### 2. The Challenge System
Anyone (Senior+ rank) can formally challenge a Settled Claim:
- Must submit *new* evidence OR argue existing evidence deserves rescoring
- Triggers a fresh Tribunal session on the challenge
- If the Challenge shifts composite >0.5: Claim reopens, loses Settled status
- If not: "Dismissed" — and the challenger's judicial record reflects it (skin in the game)

**Why this works for conspiracy:** Flat earthers will *constantly* challenge the settled score. Each challenge is a content event. Most get dismissed (entertainment). Occasionally one forces a genuine rescore (drama). The challenge feed *itself* is engagement.

#### 3. Counter-Claim Forking

When a Claim approaches Settled status, the platform suggests fork claims — but only forks that **require a different evidence domain**. Restatements of the same claim using the same evidence are rejected; they'd just settle by the same evidence pool.

Valid forks shift the evidence type entirely:

| Fork Claim | Evidence Domain | Why It Stays Open |
|---|---|---|
| "Is the earth flat?" | Physics / geodesy | SETTLED — closes quickly |
| "Why do millions still believe it?" | Sociology / psychology | Different domain — stays open |
| "Are flat earth influencers grifting?" | Financial / behavioral | Different domain — stays open |
| "Has FES made falsifiable predictions?" | Empirical track record | Different domain — stays open |

The platform auto-screens suggested forks to prevent rephrased duplicates. Every genuinely-forked claim has its own evidence pool and lifecycle.

#### 4. Anniversary Re-Tribunals
Annual rescore events for Settled Evergreen claims. New judges score fresh. Any drift >0.3 is newsworthy and shareable.

#### 5. New Evidence Triggers
RSS/API integrations with academic journals, preprint servers, news feeds — auto-matched to relevant Settled claims, triggering a rescore queue.

#### 6. Cross-Claim Battles
Two competing claims displayed head-to-head with their own evidence pools and composites. The *gap* between composites is the drama — even when both are individually settled.

### The Lifecycle

```
NEW → ACTIVE → TRENDING → CONTROVERSIAL → CONVERGING → SETTLED → ARCHIVED
 │                                                          │
 └──── ← CHALLENGED / FORKED / RE-TRIBUNAL ←───────────────┘
```

No claim truly dies.

---

## 11. Monetization

### Phase 1 — Freemium (Year 1)

| | Free | Pro ($7.99/mo) |
|---|---|---|
| View The Board | ✅ | ✅ |
| Score evidence | 5/day | Unlimited |
| Submit evidence | 2/day | Unlimited |
| Radar chart detail | Top-level | Full drill-down |
| Score history analytics | ❌ | ✅ |
| Custom judge card theme | ❌ | ✅ |
| Live Tribunal priority queue | ❌ | ✅ |
| Verified Judge eligibility | ❌ | ✅ (+ identity check) |
| Ad-free | ❌ | ✅ |

### Phase 2 — B2B & Events (Year 2)

| Stream | Description | Pricing |
|---|---|---|
| **Sponsored Tribunals** | Orgs host branded scoring events (think tanks, media, universities) | $500–$5K/event |
| **API** | Composite credibility scores for newsrooms, fact-checkers, AI pipelines | $99–$999/mo tiered |
| **White-Label** | Private Tribunal instances for law firms, universities, compliance teams | Enterprise |
| **Credentialing** | "Certified Tribunal Judge" — verified track record for résumés/LinkedIn | $49 one-time exam |

### Phase 3 — Prediction Layer (Year 3)
- **Score Forecasting:** will this evidence composite rise or fall with more judges?
- Points-based staking (not real money) initially — regulatory simplicity
- Top forecasters earn reputation + sponsored prediction pool rewards

---

## 12. Growth Loops

### Loop 1: The Screenshot Loop (Primary Organic Engine)
```
Controversial evidence → Split radar chart → Shareable OG image
→ Posted on X → "That's wrong, let ME judge it"
→ Sign-up → Judge → Post THEIR score card → More controversy
```

### Loop 2: The Live Event Loop (FOMO)
```
Scheduled Tribunal announced → Show up during window
→ Real-time score card reveals → Session summary shared
→ Clips posted → Larger turnout next session
```

### Loop 3: The Credential Loop (Professional/B2B)
```
Judge consistently → Judicial Record builds → Earn certification
→ Share on LinkedIn → Professional contacts discover Tribunal
→ Enterprise/API interest → B2B pipeline
```

### Loop 4: The Embed Loop (Distribution)
```
Journalists embed composite widget in articles
→ Readers click through → New users → More evidence
→ Widget score updates → More embeds
```

---

## 13. Technical Architecture

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | Next.js + React | SSR for SEO on Claim pages, RSC for Board performance |
| Real-time | Supabase Realtime | Live score card updates during Tribunal sessions |
| Database | Supabase (PostgreSQL) | RLS for role-based access, JSON for score cards |
| Auth | Supabase Auth | Social login, role progression, verified identity tier |
| Search | Meilisearch | Fast full-text across claims and evidence |
| Analytics | PostHog | Judge behavior, conversion funnels, session engagement |
| Hosting | Vercel | Edge caching for The Board, ISR for Claim detail pages |

### Core Data Model

```
Claim { id, title, description, topic, submitter_id, composite_score,
        controversy_flag, status (active/settled/archived) }
  └─ Evidence { id, claim_id, submitter_id, stance, content, source_url, composite_score }
       └─ Rating { id, evidence_id, judge_id, source_cred, logical_str,
                   relevance, justification, has_domain_expertise }

JudgeProfile { user_id, rank, consistency_score, total_ratings,
               streak_days, domain_specialties, overturned_count }
TribunalSession { id, claim_id, start_time, end_time, status, participant_count, summary }
Challenge { id, claim_id, challenger_id, new_evidence_id, status (pending/dismissed/upheld) }
```

### Real-Time Flow

```
Judge submits score
  → Write to PostgreSQL
  → Supabase Realtime broadcasts to all claim channel subscribers
  → Composite recalculated (debounced, 2s)
  → Live session: animated score card reveal
  → Controversy flag re-evaluated
  → Board ranking updated
```

---

## 14. Key Metrics

**North Star:** Ratings per Active Claim per Week

| Category | Metric | 6mo Target |
|---|---|---|
| Engagement | DAU/MAU ratio | > 25% |
| Engagement | Ratings per judge per session | > 5 |
| Content | Evidence per claim (avg) | > 8 |
| Retention | D7 judge retention | > 40% |
| Virality | Shares per controversial claim | > 50 |
| Monetization | Free → paid conversion | > 4% |
| Quality | Platform avg consistency score | > 0.65 |

---

## 15. Phased Roadmap

| Phase | Weeks | Deliverables |
|---|---|---|
| **0 — Foundation** | 1–4 | Auth + roles, Claim CRUD, Evidence submission, 3-dimension scoring, basic Board |
| **1 — Drama Layer** | 5–8 | Score Cards (Olympic-style), radar charts, controversy detection, score history, real-time Board |
| **2 — Live Sessions** | 9–12 | Scheduled Tribunals, real-time reveals, session summaries, push notifications |
| **3 — Monetize** | 13–18 | Premium tier, embeddable widget, OG share images, Sponsored Tribunal admin tools, API v1 |
| **4 — Scale** | 19–26 | Verified credentialing, white-label instances, score forecasting, sub-tribunals, dataset licensing |

---

## 16. Risks & Mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| **Judge capture** — power users dominate | High | No single judge > 5% weight; random assignment in Live Tribunals |
| **Low-quality submissions** | High | Reputation-gated Claim submission (Senior+); rate limits; community flagging |
| **Cold start** — not enough judges for live drama | Critical | Seed viral topics; launch Tribunal events; invite OSINT/debate communities first |
| **Coordinated gaming** | Medium | Anomaly detection on scoring patterns; consistency penalties for herding |
| **Legal / defamation** | Medium | ToS: Tribunal scores are community opinion, not fact declarations; DMCA-compliant |

---

## 17. Success Criteria for v1.0

1. **100+ Claims** seeded across 5+ topic categories (including Hot, Warm, and Evergreen)
2. **500+ registered judges** completing at least 1 rating each
3. **3+ live Tribunal sessions** completed with >20 concurrent judges
4. **1 viral moment** — a controversial Claim screenshot shared >1K times on X
5. **D7 judge retention** — 30%+ of judges who completed 5+ ratings return on Day 7
6. **Composite score convergence** — for Claims with 20+ judges, score variance drops below threshold (consensus mechanics work)

---

## 18. The Moat

The Tribunal's defensibility compounds over time across three layers:

1. **The Score Graph** — historical dimensional scoring data on thousands of claims. Valuable to journalists, researchers, AI training pipelines. Nobody else will have this.

2. **The Judicial Network** — a reputation-weighted graph of credentialed evaluators with tracked accuracy. A *professional credential* that gets more valuable as the network grows.

3. **The Scoring Grammar** — "Source: 9.2, Logic: 4.1, Relevance: 8.8" becomes a lingua franca for evidence quality discourse. Once people adopt the vocabulary, switching costs are enormous.

> [!IMPORTANT]
> **Product north star:** Every decision should ask — *"Does this make the scoring more visible, more dramatic, more shareable?"* The content is commodity. The scoring theater is the moat.
