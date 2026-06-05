import { useEffect, useMemo, useState } from 'react'
import apiClient from '../api/apiClient'

const initialForm = {
  Age: 24,
  Gender: 'Male',
  Height: 1.7,
  Weight: 72,
  family_history_with_overweight: 'yes',
  FAVC: 'no',
  FCVC: 2,
  CH2O: 2,
  FAF: 1,
  TUE: 1,
}

function splitRecommendations(value) {
  if (Array.isArray(value)) return value
  if (!value) return []

  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function PredictPage() {
  const [formData, setFormData] = useState(initialForm)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [goal, setGoal] = useState(null)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const bmiPreview = useMemo(() => {
    const height = Number(formData.Height)
    const weight = Number(formData.Weight)

    if (!height || !weight) return 0

    return Number((weight / (height * height)).toFixed(2))
  }, [formData.Height, formData.Weight])

  const goalProgress = useMemo(() => {
    if (!goal?.target_weight_kg || !result?.bmi) {
      return null
    }

    const height = Number(formData.Height)

    if (!height) {
      return null
    }

    const targetBmi = Number(goal.target_weight_kg) / (height * height)
    const sortedHistory = history
      .slice()
      .sort((a, b) => {
        if (a.created_at && b.created_at) {
          return new Date(a.created_at) - new Date(b.created_at)
        }
        return (a.id || 0) - (b.id || 0)
      })

    const baselineBmi = sortedHistory.length
      ? Number(sortedHistory[0].bmi)
      : Number(result.bmi)

    const deltaTotal = baselineBmi - targetBmi

    if (!deltaTotal) {
      return 0
    }

    const progress = ((baselineBmi - Number(result.bmi)) / deltaTotal) * 100

    return Math.min(Math.max(progress, 0), 100)
  }, [formData.Height, goal, history, result])

  useEffect(() => {
    let isMounted = true

    async function loadSupportingData() {
      try {
        const [historyResponse, goalResponse] = await Promise.all([
          apiClient.get('/history'),
          apiClient.get('/user/goal'),
        ])

        if (isMounted) {
          setHistory(historyResponse.data)
          setGoal(goalResponse.data)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.detail || 'Could not load goal data.')
        }
      }
    }

    loadSupportingData()

    return () => {
      isMounted = false
    }
  }, [])

  function handleChange(event) {
    const { name, type, value } = event.target
    const numericFields = ['Age', 'Height', 'Weight', 'FCVC', 'CH2O', 'FAF', 'TUE']

    setFormData((current) => ({
      ...current,
      [name]: type === 'range' || numericFields.includes(name) ? Number(value) : value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await apiClient.post('/predict', formData)
      setResult(response.data)
      const historyResponse = await apiClient.get('/history')
      setHistory(historyResponse.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Prediction failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Predict</p>
          <h2>Obesity risk prediction</h2>
          <p>Enter lifestyle and body details to get BMI, risk, and suggestions.</p>
        </div>
      </header>

      {error && <div className="page-message error-message">{error}</div>}

      <section className="dashboard-layout">
        <form className="prediction-form" onSubmit={handleSubmit}>
          <div className="section-heading">
            <p className="eyebrow">New prediction</p>
            <h2>Health inputs</h2>
          </div>

          <div className="form-grid">
            <label>
              Age
              <input min="1" name="Age" onChange={handleChange} type="number" value={formData.Age} />
            </label>

            <label>
              Gender
              <select name="Gender" onChange={handleChange} value={formData.Gender}>
                <option>Male</option>
                <option>Female</option>
              </select>
            </label>

            <label>
              Height (meters)
              <input max="2.5" min="1" name="Height" onChange={handleChange} step="0.01" type="number" value={formData.Height} />
            </label>

            <label>
              Weight (kg)
              <input min="20" name="Weight" onChange={handleChange} step="0.1" type="number" value={formData.Weight} />
            </label>

            <label>
              Family overweight history
              <select name="family_history_with_overweight" onChange={handleChange} value={formData.family_history_with_overweight}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </label>

            <label>
              Frequent high calorie food
              <select name="FAVC" onChange={handleChange} value={formData.FAVC}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </label>
          </div>

          <div className="slider-grid">
            {[
              ['FCVC', 'Vegetable intake', 1, 3],
              ['CH2O', 'Water intake', 1, 3],
              ['FAF', 'Physical activity', 0, 3],
              ['TUE', 'Technology time', 0, 3],
            ].map(([name, label, min, max]) => (
              <label key={name}>
                {label}
                <input max={max} min={min} name={name} onChange={handleChange} step="0.5" type="range" value={formData[name]} />
                <span>{formData[name]}</span>
              </label>
            ))}
          </div>

          <div className="form-footer">
            <div className="bmi-preview">
              <span>{bmiPreview || '--'}</span>
              <p>Live BMI preview</p>
            </div>
            <button disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Predicting...' : 'Predict obesity risk'}
            </button>
          </div>
        </form>

        <aside className="result-panel">
          <div className="section-heading">
            <p className="eyebrow">Result</p>
            <h2>{result?.prediction || 'Ready'}</h2>
          </div>

          <div className="result-meter">
            <div style={{ width: `${Math.min((bmiPreview / 40) * 100, 100)}%` }} />
          </div>

          <div className="result-stats">
            <div>
              <span>{result?.bmi ?? '--'}</span>
              <p>BMI</p>
            </div>
            <div>
              <span>{result?.risk_level ?? '--'}</span>
              <p>Risk</p>
            </div>
          </div>

          <div className="suggestion-box">
            <h3>Suggestions</h3>
            <ul>
              {splitRecommendations(result?.recommendation).length ? (
                splitRecommendations(result.recommendation).map((item) => <li key={item}>{item}</li>)
              ) : (
                <li>Submit a prediction to receive personalized suggestions.</li>
              )}
            </ul>
          </div>

          <div className="goal-progress">
            <strong>Target goal progress</strong>
            {goal?.target_weight_kg ? (
              <>
                <p>
                  Target weight: {Number(goal.target_weight_kg).toFixed(1)} kg
                </p>
                <div className="goal-meter">
                  <div style={{ width: `${goalProgress ?? 0}%` }} />
                </div>
                <p>{goalProgress === null ? 'Run a prediction to update progress.' : `${goalProgress.toFixed(0)}% toward goal`}</p>
              </>
            ) : (
              <p>Set a target weight in the dashboard to track progress.</p>
            )}
          </div>
        </aside>
      </section>
    </div>
  )
}

export default PredictPage
