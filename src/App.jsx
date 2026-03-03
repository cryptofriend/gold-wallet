import { useEffect, useMemo, useState } from 'react'
import countriesData from '../gold-data/countries.json'
import priceData from '../gold-data/price.json'
import './App.css'

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')

const allCountries = countriesData.countries.map((country) => ({
  ...country,
  slug: slugify(country.country),
}))

const formatMoney = (value) => {
  if (typeof value !== 'number') return 'N/A'
  return `$${Math.round(value).toLocaleString()}`
}

const formatNumber = (value) => (typeof value === 'number' ? value.toLocaleString() : 'N/A')

function usePageMeta(title, description) {
  useEffect(() => {
    document.title = title

    let tag = document.querySelector('meta[name="description"]')
    if (!tag) {
      tag = document.createElement('meta')
      tag.setAttribute('name', 'description')
      document.head.appendChild(tag)
    }

    tag.setAttribute('content', description)
  }, [title, description])
}

function CountriesIndex() {
  usePageMeta(
    'Gold Wallet — Countries Index',
    'Browse all countries and their latest gold market snapshot fields.',
  )

  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim()) return allCountries

    const q = query.toLowerCase()
    return allCountries.filter(
      (country) =>
        country.country.toLowerCase().includes(q) ||
        country.iso2.toLowerCase().includes(q) ||
        (country.currency || '').toLowerCase().includes(q),
    )
  }, [query])

  return (
    <main className="countries-page">
      <header className="countries-header">
        <p className="eyebrow">Gold Market by Country</p>
        <h1>Global Countries Index</h1>
        <p>
          {countriesData.countries_count} countries • Gold spot:{' '}
          {priceData.price_usd ? `$${Number(priceData.price_usd).toLocaleString()}` : 'Unavailable'}
        </p>
        <p className="meta">Last sync: {new Date(countriesData.generated_at).toLocaleString()}</p>

        <input
          className="country-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search country, ISO2, or currency"
          aria-label="Search countries"
        />
      </header>

      <section className="countries-grid" aria-label="Countries list">
        {filtered.map((country) => (
          <a key={country.iso2} href={`/countries/${country.slug}`} className="country-card">
            <h2>{country.country}</h2>
            <p>ISO2: {country.iso2}</p>
            <p>Currency: {country.currency || 'N/A'}</p>
            <p>Reserves (USD incl. gold): {formatMoney(country.reserves_usd_including_gold)}</p>
          </a>
        ))}
      </section>
    </main>
  )
}

function CountryPage({ slug }) {
  const country = allCountries.find((entry) => entry.slug === slug)

  const description = country
    ? `${country.country} gold market snapshot including reserves, imports/exports, production, and sources.`
    : 'Country not found in Gold Wallet market dataset.'

  usePageMeta(
    country ? `Gold Wallet — ${country.country} Gold Market` : 'Gold Wallet — Country Not Found',
    description,
  )

  const jsonLd = country
    ? {
        '@context': 'https://schema.org',
        '@type': 'Dataset',
        name: `${country.country} Gold Market Snapshot`,
        description,
        dateModified: country.updated_at,
        spatialCoverage: country.country,
        variableMeasured: [
          'reserves_tonnes',
          'imports_usd',
          'exports_usd',
          'production_tonnes',
          'reserves_usd_including_gold',
        ],
        url: `${window.location.origin}/countries/${country.slug}`,
      }
    : null

  if (!country) {
    return (
      <main className="fallback-page">
        <h1>Country not found</h1>
        <a href="/countries">Back to Countries Index</a>
      </main>
    )
  }

  return (
    <main className="country-page">
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}

      <a className="back-link" href="/countries">
        ← All countries
      </a>

      <section className="country-hero">
        <p className="eyebrow">Country Snapshot</p>
        <h1>{country.country}</h1>
        <p>ISO2: {country.iso2} • Currency: {country.currency || 'N/A'}</p>
      </section>

      <section className="metrics-grid">
        <article className="metric-card">
          <h2>Gold reserves (tonnes)</h2>
          <p>{formatNumber(country.reserves_tonnes)}</p>
        </article>
        <article className="metric-card">
          <h2>Merchandise imports (USD proxy)</h2>
          <p>{formatMoney(country.imports_usd)}</p>
          <small>Year: {country.imports_usd_year || 'N/A'}</small>
        </article>
        <article className="metric-card">
          <h2>Merchandise exports (USD proxy)</h2>
          <p>{formatMoney(country.exports_usd)}</p>
          <small>Year: {country.exports_usd_year || 'N/A'}</small>
        </article>
        <article className="metric-card">
          <h2>Production (tonnes)</h2>
          <p>{formatNumber(country.production_tonnes)}</p>
        </article>
        <article className="metric-card">
          <h2>Reserves (USD incl. gold)</h2>
          <p>{formatMoney(country.reserves_usd_including_gold)}</p>
        </article>
        <article className="metric-card">
          <h2>Reserves data year</h2>
          <p>{country.reserves_usd_year || 'N/A'}</p>
        </article>
      </section>

      <section className="sources-section">
        <h2>Sources</h2>
        <ul>
          {country.sources.map((source) => (
            <li key={`${source.name}-${source.url}`}>
              <a href={source.url} target="_blank" rel="noreferrer">
                {source.name}
              </a>
            </li>
          ))}
        </ul>
        <p className="meta">Updated at: {new Date(country.updated_at).toLocaleString()}</p>
      </section>
    </main>
  )
}

function App() {
  const path = window.location.pathname

  if (path === '/' || path === '/countries') {
    return <CountriesIndex />
  }

  if (path.startsWith('/countries/')) {
    const slug = decodeURIComponent(path.replace('/countries/', '').replace(/\/$/, ''))
    return <CountryPage slug={slug} />
  }

  return (
    <main className="fallback-page">
      <h1>Gold Wallet</h1>
      <a href="/countries">Go to Countries Index</a>
    </main>
  )
}

export default App
