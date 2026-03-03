import { useMemo, useState } from 'react'
import countriesData from '../gold-data/countries.json'
import priceData from '../gold-data/price.json'
import './App.css'

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')

function CountriesIndex() {
  const [query, setQuery] = useState('')

  const countries = countriesData.countries
  const filtered = useMemo(() => {
    if (!query.trim()) return countries

    const q = query.toLowerCase()
    return countries.filter(
      (country) =>
        country.country.toLowerCase().includes(q) ||
        country.iso2.toLowerCase().includes(q) ||
        (country.currency || '').toLowerCase().includes(q),
    )
  }, [countries, query])

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
        {filtered.map((country) => {
          const slug = slugify(country.country)

          return (
            <a key={country.iso2} href={`/countries/${slug}`} className="country-card">
              <h2>{country.country}</h2>
              <p>ISO2: {country.iso2}</p>
              <p>Currency: {country.currency || 'N/A'}</p>
              <p>
                Reserves (USD incl. gold):{' '}
                {country.reserves_usd_including_gold
                  ? `$${Math.round(country.reserves_usd_including_gold).toLocaleString()}`
                  : 'N/A'}
              </p>
            </a>
          )
        })}
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
    return (
      <main className="fallback-page">
        <h1>Country pages are next</h1>
        <p>This route is reserved for country detail pages in the next task.</p>
        <a href="/countries">Back to Countries Index</a>
      </main>
    )
  }

  return (
    <main className="fallback-page">
      <h1>Gold Wallet</h1>
      <a href="/countries">Go to Countries Index</a>
    </main>
  )
}

export default App
