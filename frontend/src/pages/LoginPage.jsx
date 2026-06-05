import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import apiClient from '../api/apiClient'
import { isAuthenticated, setToken } from '../auth/tokenStorage'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from?.pathname || '/dashboard'
  const successMessage = location.state?.message
  const [formData, setFormData] = useState({ email: '', password: '' })
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
      const response = await apiClient.post('/auth/login', formData)
      setToken(response.data.access_token)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-copy">
          <p className="eyebrow">AI Health Assistant</p>
          <h1>Welcome back</h1>
          <p>
            Sign in to continue to your health dashboard and prediction tools.
          </p>
        </div>

        <form className="auth-card auth-form" onSubmit={handleSubmit}>
          <div className="form-header">
            <h2>Login</h2>
            <p>Use your registered email and password.</p>
          </div>

          {successMessage && <div className="success-message">{successMessage}</div>}
          {error && <div className="error-message">{error}</div>}

          <div className="form-fields">
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
                autoComplete="current-password"
                name="password"
                onChange={handleChange}
                placeholder="Enter your password"
                required
                type="password"
                value={formData.password}
              />
            </label>
          </div>

          <div className="auth-actions">
            <button disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>

            <div className="auth-meta">
              <span>Your info stays private.</span>
              <span>Secure login</span>
            </div>
          </div>

          <p className="auth-switch">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </form>
      </section>
    </main>
  )
}

export default LoginPage
