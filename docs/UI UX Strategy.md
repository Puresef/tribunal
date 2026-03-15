# UI/UX Strategy — The Tribunal

## UI goal

Turn *judging* into a performance people want to watch, participate in, and share.

## Design pillars

1. **Instant clarity**
    - Users should understand the mechanic in 10 seconds.
    - Three numbers + a radar are the language.
2. **Judging feels ceremonial**
    - Entering the scoring flow should feel like stepping onto the floor.
3. **Controversy is a feature**
    - Splits must be easy to spot, compare, and share.
4. **Share artifacts are first-class UI**
    - Every key state should generate an image worth posting.

## Information hierarchy (home → claim → evidence)

### Home: The Board

Primary job: help users pick what to judge *now*.

- Claim card must show:
    - Composite score (big)
    - Evidence count
    - Judge count
    - “Heat” badges: Active, Controversial, Trending
- Default sort: **Trending**
- Key filters:
    - Most Controversial
    - Newest
    - By Topic

### Claim Detail

Primary job: give one claim a “courtroom.”

- Hero:
    - Claim title
    - Composite + confidence (N judges)
    - Radar summary (claim-level)
    - Sparkline / trend
- Evidence feed:
    - Each evidence item is a card with mini radar + stance + CTA
    - Tabs: All / Supporting / Challenging / Most Controversial

### Evidence card

Primary job: make the evidence skimmable and tempting to judge.

- Show:
    - Source URL preview
    - Stance
    - Current composite
    - Mini radar and “split” indicator
- CTA:
    - **Judge this** (always visible)

## Judging flow (the “stage”)

### Scoring modal

- Full-screen, distraction-free
- 3 sliders with anchored descriptors
- 0.1 increments is fine, but UX should avoid “fiddly” feeling:
    - Provide quick presets (e.g. “Strong source, weak logic”) that map to slider defaults
    - Allow keyboard arrows for fast scoring

### After submit (the reward)

- Animate the score card reveal (one-by-one)
- Show how their score compares to current average
- Immediate actions:
    - Share score card
    - Judge next evidence

## Controversy UX (make the split obvious)

- A “Split” badge when dimension spread exceeds threshold
- Use color and shape, not just numbers:
    - Radar chart highlighted area
    - Subtle pulse for live controversial items

## Share artifact spec (what the image must contain)

- Claim title (short)
- Evidence title / source
- The three numbers
- Radar chart
- “N judges” and timestamp window
- A call-to-action: **“Judge it on [tribunal.so](http://tribunal.so)”**

### URL-as-brand rules (to make .so feel intentional)

- Treat `.so` as part of the voice: **“Tribunal. So… what’s the verdict?”**
- Use [**tribunal.so**](http://tribunal.so) as the default footer on every share card.
- Style the lockup as [**TRIBUNAL.so**](http://TRIBUNAL.so) with `.so` as a lighter/smaller suffix in the wordmark.
- In the landing hero, render `tribunal.so` as the primary URL with `.so` in an accent color.
- In the logo lockup, consider rendering [**TRIBUNAL.SO**](http://TRIBUNAL.SO) as a single unit.
- Keep routes short and legible (they become part of the aesthetic):
    - `tribunal.so/c/<claim>`
    - `tribunal.so/e/<evidence>`

## Domain lane UX (without fragmenting the product)

- Topics are tags, not separate apps.
- Add a “Lane” filter:
    - Fast / Hot (politics/news)
    - Deep / Evergreen (religion/theology + philosophy/history)

## Accessibility and trust

- Always show:
    - What is being scored (the evidence, not the person)
    - That scores are community opinion
    - Confidence signals: N judges, variance

## UX milestones

1. **Playable prototype:** judge 10 items and feel the dopamine
2. **Board browse:** find controversial items instantly
3. **Session mode:** a timed “Tribunal Night” view and recap card