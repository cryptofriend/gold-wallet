import './App.css'

const years = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015]

const countries = [
  { name: 'China', x: '66%', y: '37%', size: '22%', tone: 'tone-5' },
  { name: 'India', x: '57%', y: '50%', size: '16%', tone: 'tone-4' },
  { name: 'Saudi Arabia', x: '44%', y: '45%', size: '12%', tone: 'tone-3' },
  { name: 'Turkey', x: '42%', y: '32%', size: '10%', tone: 'tone-2' },
  { name: 'Indonesia', x: '70%', y: '62%', size: '14%', tone: 'tone-3' },
  { name: 'Australia', x: '77%', y: '77%', size: '18%', tone: 'tone-1' },
]

function App() {
  return (
    <main className="earth-view">
      <div className="stars" />

      <section className="hint-card">
        <h1>Find your country</h1>
        <p>and click to see reserves</p>
      </section>

      <section className="globe-wrap" aria-label="Gold reserves globe preview">
        <div className="glow" />
        <div className="globe">
          <div className="latitude-lines" />
          <div className="longitude-lines" />
          {countries.map((country) => (
            <button
              key={country.name}
              type="button"
              className={`country ${country.tone}`}
              style={{ left: country.x, top: country.y, width: country.size }}
              aria-label={country.name}
            >
              {country.name}
            </button>
          ))}
        </div>
      </section>

      <aside className="year-rail" aria-label="Year filter">
        {years.map((year, index) => (
          <button key={year} type="button" className={index === 0 ? 'active' : ''}>
            {year}
          </button>
        ))}
      </aside>

      <aside className="legend" aria-label="Reserves legend">
        <h2>Reserves $</h2>
        <ul>
          <li><span className="dot tone-1" />$1+</li>
          <li><span className="dot tone-2" />$50B+</li>
          <li><span className="dot tone-3" />$150B+</li>
          <li><span className="dot tone-4" />$300B+</li>
          <li><span className="dot tone-5" />$500B+</li>
          <li><span className="dot tone-6" />$1T+</li>
        </ul>
      </aside>

      <div className="zoom-controls" aria-label="Zoom controls">
        <button type="button" aria-label="Zoom in">
          +
        </button>
        <button type="button" aria-label="Zoom out">
          −
        </button>
      </div>
    </main>
  )
}

export default App
