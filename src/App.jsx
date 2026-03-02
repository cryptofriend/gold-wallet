import { useState } from 'react'
import './App.css'

function App() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!email.trim()) {
      return
    }

    // Placeholder conversion event for future analytics wiring.
    console.info('waitlist_signup_submitted', { email })
    setSubmitted(true)
    setEmail('')
  }

  return (
    <main className="landing">
      <section className="hero">
        <p className="eyebrow">Gold Wallet</p>
        <h1>Turn every spend into automatic gold savings.</h1>
        <p className="subhead">
          Join the waitlist for early access to Gold Command Center and get
          launch perks reserved for first movers.
        </p>

        <form className="waitlist-form" onSubmit={handleSubmit}>
          <label htmlFor="email" className="sr-only">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            placeholder="you@company.com"
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <button type="submit">Join the Priority Waitlist</button>
        </form>

        {submitted && (
          <p className="confirmation">
            You&apos;re in. We&apos;ll send your early-access invite soon.
          </p>
        )}

        <ul className="benefits">
          <li>Weekly invite drops for top waitlist referrals</li>
          <li>1-click onboarding when wallets go live</li>
          <li>Founder updates with product milestones</li>
        </ul>
      </section>
    </main>
  )
}

export default App
