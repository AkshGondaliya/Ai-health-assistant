import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import apiClient from '../api/apiClient'
import { isAuthenticated } from '../auth/tokenStorage'

function RegisterPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />
  }

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await apiClient.post('/auth/register', formData)
      navigate('/login', {
        replace: true,
        state: { message: 'Account created. Please sign in.' },
      })
    } catch (err) {
      setError(
        err.response?.data?.detail || 'Registration failed. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-copy">
          <p className="eyebrow">AI Health Assistant</p>
          <h1>Create account</h1>
          <p>
            Register once, then use your account across the assistant features.
          </p>
        </div>

        <form className="auth-card auth-form" onSubmit={handleSubmit}>
          <div className="form-header">
            <h2>Register</h2>
            <p>Enter your details to get started.</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-fields">
            <label>
              Name
              <input
                autoComplete="name"
                name="name"
                onChange={handleChange}
                placeholder="Your name"
                required
                type="text"
                value={formData.name}
              />
            </label>

            <label>
              Email
              <input
                autoComplete="email"
                name="email"
                onChange={handleChange}
                placeholder="you@example.com"
                required
                type="email"
                value={formData.email}
              />
            </label>

            <label>
              Password
              <input
                autoComplete="new-password"
                minLength="6"
                name="password"
                onChange={handleChange}
                placeholder="Create a password"
                required
                type="password"
                value={formData.password}
              />
            </label>
          </div>

          <div className="auth-actions">
            <button disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>

            <div className="auth-meta">
              <span>By continuing you agree to our health data policy.</span>
              <span>Secure signup</span>
            </div>
          </div>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </section>
    </main>
  )
}

export default RegisterPage
