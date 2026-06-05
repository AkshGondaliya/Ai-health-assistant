import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import apiClient from '../api/apiClient'
import { clearToken } from '../auth/tokenStorage'

function formatNumber(value) {
  if (value === null || value === undefined) {
    return '--'
  }

  return Number(value).toFixed(2)
}

function getRiskColor(risk) {
  if (risk === 'High') {
    return '#dc2626'
  }

  if (risk === 'Moderate') {
    return '#f59e0b'
  }

  if (risk === 'Normal') {
    return '#0f766e'
  }

  return '#2563eb'
}

function AnalyticsPage() {
  const navigate = useNavigate()
  const [analytics, setAnalytics] = useState(null)
  const [history, setHistory] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const riskCounts = useMemo(() => {
    return history.reduce((counts, item) => {
      counts[item.risk_level] = (counts[item.risk_level] || 0) + 1
      return counts
    }, {})
  }, [history])

  const latestRecommendations = useMemo(() => {
    const latest = history[0]

    if (!latest?.recommendation) {
      return []
    }

    return latest.recommendation
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }, [history])

  useEffect(() => {
    let isMounted = true

    async function loadAnalytics() {
      try {
        const [analyticsResponse, historyResponse] = await Promise.all([
          apiClient.get('/analytics'),
          apiClient.get('/history'),
        ])

        if (isMounted) {
          setAnalytics(analyticsResponse.data)
          setHistory(historyResponse.data.slice().reverse())
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.detail || 'Could not load analytics.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadAnalytics()

    return () => {
      isMounted = false
    }
  }, [])

  function handleLogout() {
    clearToken()
    navigate('/login', { replace: true })
  }

  const maxChartBmi = Math.max(
    40,
    ...history.map((item) => Number(item.bmi) || 0),
  )

  return (
    <main className="app-shell">
      <nav className="top-nav">
        <div>
          <p className="eyebrow">AI Health Assistant</p>
          <h1>Analytics</h1>
        </div>
        <div className="nav-actions">
          <Link className="nav-link" to="/dashboard">
            Dashboard
          </Link>
          <Link className="nav-link active" to="/analytics">
            Analytics
          </Link>
          <button className="secondary-button" onClick={handleLogout} type="button">
            Logout
          </button>
        </div>
      </nav>

      {error && <div className="page-message error-message">{error}</div>}

      <section className="analytics-grid">
        <article className="analytics-card">
          <p className="card-label">Average BMI</p>
          <strong>{formatNumber(analytics?.average_bmi)}</strong>
          <p>Overall trend across saved predictions.</p>
        </article>
        <article className="analytics-card">
          <p className="card-label">Highest BMI</p>
          <strong>{formatNumber(analytics?.highest_bmi)}</strong>
          <p>Largest recorded value in your history.</p>
        </article>
        <article className="analytics-card">
          <p className="card-label">Lowest BMI</p>
          <strong>{formatNumber(analytics?.lowest_bmi)}</strong>
          <p>Smallest recorded value in your history.</p>
        </article>
      </section>

      <section className="analytics-layout">
        <article className="trend-panel">
          <div className="section-heading">
            <p className="eyebrow">Trend</p>
            <h2>BMI history</h2>
          </div>

          {isLoading ? (
            <p>Loading chart...</p>
          ) : history.length ? (
            <div className="bar-chart">
              {history.slice(0, 8).reverse().map((item) => (
                <div className="bar-row" key={item.id}>
                  <span>{Number(item.bmi).toFixed(1)}</span>
                  <div>
                    <i
                      style={{
                        backgroundColor: getRiskColor(item.risk_level),
                        width: `${Math.max((item.bmi / maxChartBmi) * 100, 8)}%`,
                      }}
                    />
                  </div>
                  <small>{item.risk_level}</small>
                </div>
              ))}
            </div>
          ) : (
            <p>No predictions yet. Add one from the dashboard.</p>
          )}
        </article>

        <aside className="insight-panel">
          <div className="section-heading">
            <p className="eyebrow">Insights</p>
            <h2>Risk distribution</h2>
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

          <div className="suggestion-box">
            <h3>Latest suggestions</h3>
            <ul>
              {latestRecommendations.length ? (
                latestRecommendations.map((item) => <li key={item}>{item}</li>)
              ) : (
                <li>Run a prediction to unlock suggestion history.</li>
              )}
            </ul>
          </div>
        </aside>
      </section>
    </main>
  )
}

export default AnalyticsPage
