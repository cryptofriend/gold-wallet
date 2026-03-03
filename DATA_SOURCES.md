# DATA_SOURCES — Gold Market by Country (PR#1)

## Goal
Select reliable sources for:
1) global gold price
2) country reserves
3) country imports/exports (gold)
4) country production
5) full country universe coverage

## Candidate APIs

| Data Need | Provider | Access | Freshness | Coverage | Notes |
|---|---|---|---|---|---|
| Spot gold price (XAU/USD) | Alpha Vantage Commodities API | API key | Near real-time / intraday | Global market price | Good developer docs; free tier rate limits. |
| Spot gold price (XAU/*) | GoldAPI.io | API key | Real-time | Multiple currencies | Purpose-built for precious metals; paid tiers for production reliability. |
| Reserves (includes gold, USD) | World Bank Indicators API (`FI.RES.TOTL.CD`) | Public | Periodic (macro cadence) | ~296 country/entities | Easy integration; metric is reserves incl. gold (not tonnes-only). |
| Gold trade (imports/exports by product code) | UN Comtrade API | API key / quota model | Monthly/annual official trade stats | Global | Use HS code `7108` for non-monetary gold trade. |
| Country reference list (names/ISO/currency) | REST Countries API | Public | Static-ish | Global countries | Great for canonical ISO2 + currency mapping. |

## Recommendation (PR#1 decision)

### Primary stack
1. **Price:** Alpha Vantage (XAU/USD)  
2. **Reserves:** World Bank API (`FI.RES.TOTL.CD`)  
3. **Imports/Exports:** UN Comtrade (`HS 7108`)  
4. **Country universe:** REST Countries API (ISO2 + currency)

### Production data note
A universally clean free real-time API for **country gold production tonnes** is hard to source.
Recommended approach for v1:
- ingest annual production from authoritative public datasets (e.g., USGS publications/data feeds)
- store as yearly snapshot in repo cache
- refresh on schedule

## Integration plan (next PRs)

### PR#2
- Add `scripts/fetch-country-universe.mjs` (REST Countries)
- Add `scripts/fetch-reserves.mjs` (World Bank)
- Normalize output into `gold-data/countries-live.json` with timestamps

### PR#3
- Add UN Comtrade ingestion for `imports_usd` and `exports_usd` (HS 7108)
- Merge into normalized country records by ISO2

### PR#4
- Add price ingestion client + cache (`gold-data/price-live.json`)
- Wire `/countries` and `/countries/<slug>` pages to live normalized data

## Constraints to keep in mind
- Some sources are not true real-time (macro/trade cadence).
- Must show `updated_at` and source attribution per field.
- Keep fallback to cached JSON when API limits/errors occur.
