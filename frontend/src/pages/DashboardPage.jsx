import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../api/apiClient'

function formatNumber(value) {
  if (value === null || value === undefined) {
    return '--'
  }

  return Number(value).toFixed(2)
}

function getRiskColor(risk) {
  if (risk === 'High') return '#dc2626'
  if (risk === 'Moderate') return '#f59e0b'
  if (risk === 'Normal') return '#0f766e'
  return '#2563eb'
}

function DashboardPage() {
  const [profile, setProfile] = useState(null)
  const [summary, setSummary] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [history, setHistory] = useState([])
  const [goal, setGoal] = useState(null)
  const [goalWeight, setGoalWeight] = useState('')
  const [goalMessage, setGoalMessage] = useState('')
  const [isSavingGoal, setIsSavingGoal] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const riskCounts = useMemo(() => {
    return history.reduce((counts, item) => {
      counts[item.risk_level] = (counts[item.risk_level] || 0) + 1
      return counts
    }, {})
  }, [history])

  useEffect(() => {
    let isMounted = true

    async function loadDashboard() {
      try {
        const [profileResponse, summaryResponse, analyticsResponse, historyResponse, goalResponse] =
          await Promise.all([
            apiClient.get('/user/profile'),
            apiClient.get('/dashboard'),
            apiClient.get('/analytics'),
            apiClient.get('/history'),
            apiClient.get('/user/goal'),
          ])

        if (isMounted) {
          setProfile(profileResponse.data)
          setSummary(summaryResponse.data)
          setAnalytics(analyticsResponse.data)
          setHistory(historyResponse.data.slice().reverse())
          setGoal(goalResponse.data)
          if (goalResponse.data?.target_weight_kg) {
            setGoalWeight(String(goalResponse.data.target_weight_kg))
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.detail || 'Could not load dashboard.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      isMounted = false
    }
  }, [])

  async function handleGoalSubmit(event) {
    event.preventDefault()
    setError('')
    setGoalMessage('')
    setIsSavingGoal(true)

    try {
      const response = await apiClient.put('/user/goal', {
        target_weight_kg: Number(goalWeight),
      })
      setGoal(response.data)
      setGoalMessage('Target goal saved.')
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not update target goal.')
    } finally {
      setIsSavingGoal(false)
    }
  }

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h2>Welcome, {profile?.name || 'User'}</h2>
          <p>Latest prediction status and analytics in one place.</p>
        </div>
        <Link className="primary-link" to="/predict">
          New prediction
        </Link>
      </header>

      {error && <div className="page-message error-message">{error}</div>}
      {goalMessage && <div className="page-message success-message">{goalMessage}</div>}

      <section className="hero-strip">
        <div>
          <p className="eyebrow">Latest result</p>
          <h2>{summary?.latest_prediction || 'No prediction yet'}</h2>
          <p>
            {summary?.latest_prediction
              ? 'Review your newest BMI, risk level, and trend below.'
              : 'Run your first prediction to generate personalized suggestions.'}
          </p>
        </div>
        <div className="metric-cluster">
          <div>
            <span>{summary?.total_predictions ?? 0}</span>
            <p>Total checks</p>
          </div>
          <div>
            <span>{summary?.latest_bmi ?? '--'}</span>
            <p>Latest BMI</p>
          </div>
          <div>
            <span>{summary?.latest_risk ?? '--'}</span>
            <p>Latest risk</p>
          </div>
        </div>
      </section>

      <section className="analytics-grid">
        <article className="analytics-card">
          <p className="card-label">Average BMI</p>
          <strong>{formatNumber(analytics?.average_bmi)}</strong>
          <p>Mean BMI from saved predictions.</p>
        </article>
        <article className="analytics-card">
          <p className="card-label">Highest BMI</p>
          <strong>{formatNumber(analytics?.highest_bmi)}</strong>
          <p>Highest value in your history.</p>
        </article>
        <article className="analytics-card">
          <p className="card-label">Lowest BMI</p>
          <strong>{formatNumber(analytics?.lowest_bmi)}</strong>
          <p>Lowest value in your history.</p>
        </article>
      </section>

      <section className="goal-panel">
        <div className="section-heading">
          <p className="eyebrow">Target goal</p>
          <h2>Set your target weight</h2>
          <p>We will track BMI progress toward this weight.</p>
        </div>

        <form className="goal-form" onSubmit={handleGoalSubmit}>
          <label>
            Target weight (kg)
            <input
              min="20"
              name="target_weight"
              onChange={(event) => setGoalWeight(event.target.value)}
              step="0.1"
              type="number"
              value={goalWeight}
            />
          </label>
          <button disabled={isSavingGoal} type="submit">
            {isSavingGoal ? 'Saving...' : 'Save goal'}
          </button>
        </form>

        <p className="goal-helper">
          {goal?.target_weight_kg
            ? `Current target: ${Number(goal.target_weight_kg).toFixed(1)} kg`
            : 'No target goal set yet.'}
        </p>
      </section>

      <section className="dashboard-layout">
        <article className="trend-panel">
          <div className="section-heading">
            <p className="eyebrow">Recent BMI</p>
            <h2>Trend preview</h2>
          </div>

          {isLoading ? (
            <p>Loading...</p>
          ) : history.length ? (
            <div className="bar-chart">
              {history.slice(0, 5).reverse().map((item) => (
                <div className="bar-row" key={item.id}>
                  <span>{Number(item.bmi).toFixed(1)}</span>
                  <div>
                    <i
                      style={{
                        backgroundColor: getRiskColor(item.risk_level),
                        width: `${Math.max((item.bmi / 40) * 100, 8)}%`,
                      }}
                    />
                  </div>
                  <small>{item.risk_level}</small>
                </div>
              ))}
            </div>
          ) : (
            <p>No BMI trend yet.</p>
          )}
        </article>

        <aside className="insight-panel">
          <div className="section-heading">
            <p className="eyebrow">Risk distribution</p>
            <h2>Saved checks</h2>
          </div>

          <div className="risk-list">
            {['Low', 'Normal', 'Moderate', 'High'].map((risk) => (
              <div className="risk-row" key={risk}>
                <span style={{ backgroundColor: getRiskColor(risk) }} />
                <p>{risk}</p>
                <strong>{riskCounts[risk] || 0}</strong>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </div>
  )
}

export default DashboardPage
