# UX_LOOP.md — Gold Wallet Continuous UI Improvement System

## Objective
Run a continuous weekly loop to improve usability and trust clarity:
**Improve → Test → Measure → Improve**

---

## Weekly Loop

### 1) Improve (Mon)
Pick 1–2 high-impact UI tasks only.
Each task must include:
- Problem statement
- Hypothesis
- Expected KPI impact
- Rollback plan

### 2) Test (Tue–Wed)
Validate with:
- Core flow QA (desktop + mobile):
  1. Open `/price/gold/usd/ounce`
  2. Open `/countries`
  3. Open `/countries/us-united-states`
- Visual sanity checks (spacing, hierarchy, readability)
- Optional: 3–5 user feedback snapshots

### 3) Measure (Thu)
Track KPI deltas:
- Time to first insight
- Countries CTR from home/index
- Bounce rate on country pages
- Pages per session
- Return visits (7-day)

### 4) Decide (Fri)
For each shipped UI change:
- **Keep** if KPI moved in expected direction
- **Iterate** if mixed signal
- **Kill/Roll back** if no movement after 7 days

---

## Current UX KPI Set (v1)
- Activation: click to first country page
- Readability: % users scrolling past summary block
- Trust: interactions with source/freshness/confidence UI
- Retention proxy: repeat sessions in 7 days

---

## PR Requirements for UI Work
Every UI PR must include:
1. Hypothesis
2. Expected KPI impact
3. Rollback strategy
4. Localhost test URLs
5. Before/after screenshot (where possible)

Commit title format:
`feat(vX.Y.Z): <ui-change> [hypothesis: ...]`

---

## Guardrails
- No mega redesigns in a single PR
- Mobile-first checks required
- Preserve data trust signals (freshness/sources/confidence)
- Keep changes reversible
- If no measurable movement in 7 days, iterate or remove

---

## Suggested 4-Week UX Focus
Week A: Navigation clarity + page orientation
Week B: Country page readability and hierarchy
Week C: Trust panel usability (sources/freshness/confidence)
Week D: Conversion widgets (watchlist/alerts CTA)

Then repeat the loop.
