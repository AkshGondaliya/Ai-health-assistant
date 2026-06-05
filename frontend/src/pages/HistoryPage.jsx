import { useEffect, useMemo, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import apiClient from '../api/apiClient'

function HistoryPage() {
  const [history, setHistory] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const chartData = useMemo(() => {
    if (!history.length) {
      return []
    }

    return history
      .slice()
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .slice(-20)
      .map((item, index) => {
        const dateLabel = item.created_at
          ? new Date(item.created_at).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })
          : `Entry ${index + 1}`

        return {
          name: dateLabel,
          bmi: Number(item.bmi) || 0,
          risk: item.risk_level,
        }
      })
  }, [history])

  async function loadHistory(showLoading = false) {
    if (showLoading) {
      setIsLoading(true)
    }

    try {
      const response = await apiClient.get('/history')
      setHistory(response.data.slice().reverse())
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not load history.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    async function fetchHistory() {
      try {
        const response = await apiClient.get('/history')

        if (isMounted) {
          setHistory(response.data.slice().reverse())
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.detail || 'Could not load history.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchHistory()

    return () => {
      isMounted = false
    }
  }, [])

  async function handleDelete(id) {
    try {
      await apiClient.delete(`/history/${id}`)
      await loadHistory()
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not delete prediction.')
    }
  }

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">History</p>
          <h2>Prediction history</h2>
          <p>Review previous obesity predictions, BMI values, and suggestions.</p>
        </div>
      </header>

      {error && <div className="page-message error-message">{error}</div>}

      <section className="history-section flush">
        {isLoading ? (
          <p>Loading history...</p>
        ) : history.length ? (
          <div className="history-list">
            <article className="history-chart">
              <div>
                <h3>BMI trend over time</h3>
                <p>Track how your BMI changes across predictions.</p>
              </div>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(15, 23, 42, 0.1)" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
                    <Tooltip
                      formatter={(value, name, props) => [`${value}`, 'BMI']}
                      labelFormatter={(label) => `Date: ${label}`}
                      contentStyle={{ borderRadius: 10, borderColor: 'rgba(15, 23, 42, 0.1)' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="bmi"
                      stroke="#0b6b5f"
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </article>

            {history.map((item) => (
              <article className="history-item history-item-expanded" key={item.id}>
                <div>
                  <strong>{item.prediction}</strong>
                  <p>BMI {item.bmi} - {item.risk_level} risk</p>
                  <p>{item.recommendation || 'No suggestions saved.'}</p>
                </div>
                <button onClick={() => handleDelete(item.id)} type="button">
                  Delete
                </button>
              </article>
            ))}
          </div>
        ) : (
          <p>No predictions yet.</p>
        )}
      </section>
    </div>
  )
}

export default HistoryPage
