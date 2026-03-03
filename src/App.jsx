import { useState } from 'react'
import './App.css'

const tabs = [
  { id: 'data', label: 'Au Data', icon: 'Au' },
  { id: 'globe', label: 'Globe', icon: '🌐' },
  { id: 'inflow', label: 'Inflow', icon: '↓' },
  { id: 'my-gold', label: 'My Gold', icon: '▭' },
]

function MethodologyPage() {
  return (
    <main className="doc-page">
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
  return (
    <main className="doc-page">
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

function HomePage() {
  const [activeTab, setActiveTab] = useState('globe')

  return (
    <main className="earth-shell">
      <div className="top-links">
        <a href="/methodology">Methodology</a>
        <a href="/data-sources">Data Sources</a>
      </div>

      <section className="loading-panel" aria-live="polite">
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

  return <HomePage />
}

export default App
