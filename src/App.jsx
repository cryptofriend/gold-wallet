import { useEffect, useMemo, useState } from 'react'
import countriesData from '../gold-data/countries.json'
import './App.css'

const tabs = [
  { id: 'data', label: 'Au Data', icon: 'Au' },
  { id: 'globe', label: 'Globe', icon: '🌐' },
  { id: 'inflow', label: 'Inflow', icon: '↓' },
  { id: 'my-gold', label: 'My Gold', icon: '▭' },
]

const FX_RATES = {
  usd: 1,
  eur: 0.92,
  gbp: 0.79,
  jpy: 149.8,
  aud: 1.53,
  cad: 1.36,
  inr: 82.9,
}

const CURRENCY_META = {
  usd: { label: 'US Dollar', symbol: '$' },
  eur: { label: 'Euro', symbol: '€' },
  gbp: { label: 'British Pound', symbol: '£' },
  jpy: { label: 'Japanese Yen', symbol: '¥' },
  aud: { label: 'Australian Dollar', symbol: 'A$' },
  cad: { label: 'Canadian Dollar', symbol: 'C$' },
  inr: { label: 'Indian Rupee', symbol: '₹' },
}

const FALLBACK_XAU_USD = 2320

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')

const countryPath = (country) => `/countries/${country.iso2.toLowerCase()}-${slugify(country.country)}`

const formatMoney = (value) =>
  typeof value === 'number' ? `$${Math.round(value).toLocaleString()}` : 'N/A'

const getConfidence = (country) => {
  let score = 0

  if (typeof country.reserves_usd_including_gold === 'number') score += 30
  if (typeof country.imports_usd === 'number') score += 20
  if (typeof country.exports_usd === 'number') score += 20
  if (typeof country.production_tonnes === 'number') score += 20
  if (Array.isArray(country.sources) && country.sources.length > 0) score += 10

  if (score >= 80) return { level: 'High', score }
  if (score >= 50) return { level: 'Medium', score }
  return { level: 'Low', score }
}

const UNIT_MULTIPLIERS = {
  ounce: 1,
  oz: 1,
  gram: 1 / 31.1034768,
  g: 1 / 31.1034768,
  kilo: 1000 / 31.1034768,
  kg: 1000 / 31.1034768,
}

const UNIT_LABELS = {
  ounce: 'troy ounce',
  oz: 'troy ounce',
  gram: 'gram',
  g: 'gram',
  kilo: 'kilogram',
  kg: 'kilogram',
}

function usePageMeta(title, description) {
  useEffect(() => {
    document.title = title

    let desc = document.querySelector('meta[name="description"]')
    if (!desc) {
      desc = document.createElement('meta')
      desc.setAttribute('name', 'description')
      document.head.appendChild(desc)
    }

    desc.setAttribute('content', description)
  }, [title, description])
}

function useFreshness() {
  return useMemo(() => {
    const updatedDates = (countriesData.countries || [])
      .map((country) => new Date(country.updated_at).getTime())
      .filter((value) => Number.isFinite(value))

    const latest = updatedDates.length ? Math.max(...updatedDates) : null
    const staleAfterMs = 7 * 24 * 60 * 60 * 1000

    if (!latest) {
      return {
        status: 'unknown',
        label: 'Freshness unknown',
        detail: 'No valid updated_at found in dataset.',
      }
    }

    const ageMs = Date.now() - latest

    if (ageMs <= staleAfterMs) {
      return {
        status: 'fresh',
        label: 'Data fresh',
        detail: `Last sync: ${new Date(latest).toLocaleString()}`,
      }
    }

    return {
      status: 'stale',
      label: 'Using last-known snapshot',
      detail: `Latest update is stale (${new Date(latest).toLocaleString()}).`,
    }
  }, [])
}

function FreshnessBadge() {
  const freshness = useFreshness()

  return (
    <div className={`freshness-badge ${freshness.status}`}>
      <strong>{freshness.label}</strong>
      <span>{freshness.detail}</span>
    </div>
  )
}

function MethodologyPage() {
  usePageMeta('Gold Wallet Methodology', 'How Gold Wallet aggregates and normalizes market data.')

  return (
    <main className="doc-page">
      <FreshnessBadge />
      <h1>Methodology</h1>
      <p>
        Gold Wallet aggregates public datasets into a unified country-level gold market schema designed for
        both human readability and machine consumption.
      </p>

      <h2>Principles</h2>
      <ul>
        <li>Every metric includes source attribution and update timestamp.</li>
        <li>Raw source metrics are normalized into a stable schema.</li>
        <li>Missing values are represented as null/N/A instead of guessed values.</li>
        <li>Fallback uses last-known-good snapshots when upstream sources fail.</li>
      </ul>

      <h2>Current core fields</h2>
      <ul>
        <li>country, iso2, currency</li>
        <li>reserves_tonnes (when available)</li>
        <li>imports_usd / exports_usd</li>
        <li>production_tonnes</li>
        <li>updated_at, sources[]</li>
      </ul>

      <a href="/data-sources">See Data Sources →</a>
    </main>
  )
}

function DataSourcesPage() {
  usePageMeta('Gold Wallet Data Sources', 'Source registry for gold market metrics and update cadence.')

  return (
    <main className="doc-page">
      <FreshnessBadge />
      <h1>Data Sources</h1>
      <p>Current source registry and cadence notes.</p>

      <h2>Source registry</h2>
      <ul>
        <li>
          <strong>World Bank API</strong> — reserves and trade proxy indicators
          <br />
          <a href="https://api.worldbank.org/" target="_blank" rel="noreferrer">
            https://api.worldbank.org/
          </a>
        </li>
        <li>
          <strong>REST Countries</strong> — ISO and currency mapping
          <br />
          <a href="https://restcountries.com/" target="_blank" rel="noreferrer">
            https://restcountries.com/
          </a>
        </li>
        <li>
          <strong>Alpha Vantage</strong> — XAU/USD price feed (key-based)
          <br />
          <a href="https://www.alphavantage.co/" target="_blank" rel="noreferrer">
            https://www.alphavantage.co/
          </a>
        </li>
        <li>
          <strong>USGS</strong> — annual production reference seed
          <br />
          <a
            href="https://www.usgs.gov/centers/national-minerals-information-center/gold-statistics-and-information"
            target="_blank"
            rel="noreferrer"
          >
            USGS Gold Statistics
          </a>
        </li>
      </ul>

      <h2>Caveats</h2>
      <ul>
        <li>Trade values are currently merchandise-level proxies, not pure gold-only for every country.</li>
        <li>Some indicators are periodic (monthly/annual), not real-time.</li>
      </ul>

      <a href="/methodology">← Back to Methodology</a>
    </main>
  )
}

function PriceCurrencyPage({ currencyCode, unitCode = 'ounce' }) {
  const code = currencyCode.toLowerCase()
  const unit = unitCode.toLowerCase()

  const rate = FX_RATES[code]
  const meta = CURRENCY_META[code]
  const unitMultiplier = UNIT_MULTIPLIERS[unit]
  const unitLabel = UNIT_LABELS[unit]

  const supported = Boolean(rate && meta && unitMultiplier && unitLabel)

  const title = supported
    ? `Gold Price per ${unitLabel} in ${meta.label} (${code.toUpperCase()}) | Gold Wallet`
    : 'Gold Wallet Price Page Not Found'

  const description = supported
    ? `Gold price per ${unitLabel} in ${meta.label}. Track XAU/${code.toUpperCase()} by unit with transparent data freshness context.`
    : 'Requested gold price page is not available.'

  usePageMeta(title, description)

  if (!supported) {
    return (
      <main className="doc-page">
        <h1>Price page not found</h1>
        <p>Supported currencies: {Object.keys(FX_RATES).join(', ').toUpperCase()}</p>
        <p>Supported units: ounce, gram, kilo</p>
        <a href="/price/gold/usd/ounce">Go to USD ounce gold price</a>
      </main>
    )
  }

  const goldPrice = FALLBACK_XAU_USD * rate * unitMultiplier

  return (
    <main className="doc-page">
      <FreshnessBadge />
      <h1>
        Gold Price ({code.toUpperCase()}) / {unitLabel}
      </h1>
      <p className="price-line">
        {meta.symbol}
        {goldPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        <span> / {unitLabel}</span>
      </p>
      <p>
        Base reference: ${FALLBACK_XAU_USD.toLocaleString()} XAU/USD, converted with FX rate ({rate}) and
        unit multiplier ({unitMultiplier.toFixed(6)}).
      </p>

      <div className="currency-links">
        {Object.keys(FX_RATES).map((c) => (
          <a key={c} href={`/price/gold/${c}/${unit}`}>
            {c.toUpperCase()}
          </a>
        ))}
      </div>

      <div className="unit-links">
        {[
          { slug: 'ounce', label: 'Ounce' },
          { slug: 'gram', label: 'Gram' },
          { slug: 'kilo', label: 'Kilo' },
        ].map((u) => (
          <a key={u.slug} href={`/price/gold/${code}/${u.slug}`}>
            {u.label}
          </a>
        ))}
      </div>
    </main>
  )
}

function CountriesIndexPage() {
  const countries = countriesData.countries || []

  usePageMeta('Gold Countries Index | Gold Wallet', 'Browse all countries and open country-level gold market snapshots.')

  return (
    <main className="doc-page">
      <FreshnessBadge />
      <h1>Countries</h1>
      <p>{countries.length} country pages available.</p>
      <div className="ranking-links">
        <a href="/rankings/reserves">Top Reserves</a>
        <a href="/rankings/production">Top Production</a>
        <a href="/rankings/imports">Top Imports</a>
      </div>
      <div className="countries-grid">
        {countries.map((country) => (
          <a key={country.iso2} className="country-pill" href={countryPath(country)}>
            {country.country}
          </a>
        ))}
      </div>
    </main>
  )
}

function CountryPage({ routeKey }) {
  const [iso2Part] = routeKey.split('-')
  const iso2 = (iso2Part || '').toUpperCase()

  const country = (countriesData.countries || []).find((c) => c.iso2 === iso2)

  if (!country) {
    usePageMeta('Country not found | Gold Wallet', 'Requested country page was not found.')
    return (
      <main className="doc-page">
        <h1>Country not found</h1>
        <a href="/countries">Back to countries</a>
      </main>
    )
  }

  const summary = `${country.country} currently reports ${formatMoney(
    country.reserves_usd_including_gold,
  )} in reserves (including gold, ${country.reserves_usd_year || 'latest available year'}), ${formatMoney(
    country.imports_usd,
  )} merchandise imports (${country.imports_usd_year || 'N/A'}), ${formatMoney(
    country.exports_usd,
  )} merchandise exports (${country.exports_usd_year || 'N/A'}), and production at ${
    typeof country.production_tonnes === 'number' ? `${country.production_tonnes} tonnes` : 'N/A'
  }.`
  const confidence = getConfidence(country)

  usePageMeta(`${country.country} Gold Market Snapshot | Gold Wallet`, summary)

  return (
    <main className="doc-page">
      <FreshnessBadge />
      <a href="/countries">← Back to countries</a>
      <h1>{country.country}</h1>
      <p className="summary-block">{summary}</p>
      <p className={`confidence-pill ${confidence.level.toLowerCase()}`}>
        Confidence: {confidence.level} ({confidence.score}/100)
      </p>

      <section className="trend-placeholder">
        <h2>Trend placeholders</h2>
        <p>Historical reserves, imports, exports, and production charts are queued for the next data pass.</p>
      </section>

      <ul>
        <li>ISO2: {country.iso2}</li>
        <li>Currency: {country.currency || 'N/A'}</li>
        <li>Reserves (USD incl. gold): {formatMoney(country.reserves_usd_including_gold)}</li>
        <li>
          Imports (USD proxy): {formatMoney(country.imports_usd)} {country.imports_usd_year ? `(year ${country.imports_usd_year})` : ''}
        </li>
        <li>
          Exports (USD proxy): {formatMoney(country.exports_usd)} {country.exports_usd_year ? `(year ${country.exports_usd_year})` : ''}
        </li>
        <li>
          Production (tonnes):{' '}
          {typeof country.production_tonnes === 'number' ? country.production_tonnes : 'N/A'}
        </li>
      </ul>
    </main>
  )
}

function RankingsPage({ metric }) {
  const countries = countriesData.countries || []

  const config = {
    reserves: {
      field: 'reserves_usd_including_gold',
      title: 'Top Countries by Reserves (USD incl. gold)',
    },
    production: {
      field: 'production_tonnes',
      title: 'Top Countries by Gold Production (tonnes)',
    },
    imports: {
      field: 'imports_usd',
      title: 'Top Countries by Imports (USD proxy)',
    },
  }[metric]

  if (!config) {
    usePageMeta('Ranking not found | Gold Wallet', 'Requested ranking page was not found.')
    return (
      <main className="doc-page">
        <h1>Ranking not found</h1>
        <a href="/countries">Back to countries</a>
      </main>
    )
  }

  const top = [...countries]
    .filter((c) => typeof c[config.field] === 'number')
    .sort((a, b) => b[config.field] - a[config.field])
    .slice(0, 20)

  usePageMeta(`${config.title} | Gold Wallet`, `Top 20 countries ranked by ${config.field}.`)

  return (
    <main className="doc-page">
      <FreshnessBadge />
      <a href="/countries">← Back to countries</a>
      <h1>{config.title}</h1>
      <ol className="ranking-list">
        {top.map((country) => (
          <li key={country.iso2}>
            <a href={countryPath(country)}>{country.country}</a>
            <span>{config.field.includes('tonnes') ? country[config.field] : formatMoney(country[config.field])}</span>
          </li>
        ))}
      </ol>
    </main>
  )
}

function HomePage() {
  usePageMeta('Gold Wallet', 'Modern gold market intelligence with transparent data sourcing.')
  const [activeTab, setActiveTab] = useState('globe')

  return (
    <main className="earth-shell">
      <div className="top-links">
        <a href="/methodology">Methodology</a>
        <a href="/data-sources">Data Sources</a>
        <a href="/price/gold/usd/ounce">Gold Price</a>
        <a href="/countries">Countries</a>
        <a href="/rankings/reserves">Rankings</a>
      </div>

      <section className="loading-panel" aria-live="polite">
        <FreshnessBadge />
        <div className="spinner-wrap">
          <div className="spinner" />
        </div>
        <p className="loading-title">Loading gold reserves data...</p>
        <p className="loading-subtitle">Fetching data from World Bank API...</p>
      </section>

      <nav className="dock" aria-label="Primary">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`dock-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="dock-icon" aria-hidden="true">
              {tab.icon}
            </span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      <button className="sun-button" type="button" aria-label="Theme">
        ☼
      </button>
    </main>
  )
}

function App() {
  const path = window.location.pathname

  if (path === '/methodology') return <MethodologyPage />
  if (path === '/data-sources') return <DataSourcesPage />
  if (path === '/countries') return <CountriesIndexPage />
  if (path.startsWith('/rankings/')) {
    const metric = path.replace('/rankings/', '').replace(/\/$/, '')
    return <RankingsPage metric={metric} />
  }
  if (path.startsWith('/countries/')) {
    const routeKey = path.replace('/countries/', '').replace(/\/$/, '')
    return <CountryPage routeKey={routeKey} />
  }

  if (path.startsWith('/price/gold/')) {
    const parts = path.replace('/price/gold/', '').split('/').filter(Boolean)
    const currency = parts[0] || 'usd'
    const unit = parts[1] || 'ounce'
    return <PriceCurrencyPage currencyCode={currency} unitCode={unit} />
  }

  return <HomePage />
}

export default App
