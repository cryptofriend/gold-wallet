import { useState } from 'react'
import './App.css'

const tabs = [
  { id: 'data', label: 'Au Data', icon: 'Au' },
  { id: 'globe', label: 'Globe', icon: '🌐' },
  { id: 'inflow', label: 'Inflow', icon: '↓' },
  { id: 'my-gold', label: 'My Gold', icon: '▭' },
]

function App() {
  const [activeTab, setActiveTab] = useState('globe')

  return (
    <main className="earth-shell">
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

export default App
