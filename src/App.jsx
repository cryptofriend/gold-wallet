import countriesData from '../gold-data/countries.json'
import './App.css'

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')

function CountriesIndex() {
  const countries = countriesData.countries

  return (
    <main className="countries-page">
      <header className="countries-header">
        <p className="eyebrow">Gold Market by Country</p>
        <h1>Countries</h1>
        <p>{countries.length} markets available</p>
      </header>

      <section className="countries-grid" aria-label="Countries list">
        {countries.map((country) => {
          const slug = slugify(country.country)

          return (
            <a key={country.iso2} href={`/countries/${slug}`} className="country-card">
              <h2>{country.country}</h2>
              <p>ISO2: {country.iso2}</p>
              <p>Currency: {country.currency}</p>
            </a>
          )
        })}
      </section>
    </main>
  )
}

function App() {
  const path = window.location.pathname

  if (path === '/countries') {
    return <CountriesIndex />
  }

  return (
    <main className="fallback-page">
      <h1>Gold Wallet</h1>
      <p>Open <code>/countries</code> to browse country market pages.</p>
      <a href="/countries">Go to Countries Index</a>
    </main>
  )
}

export default App
