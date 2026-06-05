import { useEffect, useState } from 'react'
import apiClient from '../api/apiClient'

function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [name, setName] = useState('')
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await apiClient.get('/user/profile')
        setProfile(response.data)
        setName(response.data.name || '')
      } catch (err) {
        setError(err.response?.data?.detail || 'Could not load profile.')
      }
    }

    loadProfile()
  }, [])

  async function handleProfileSubmit(event) {
    event.preventDefault()
    setMessage('')
    setError('')
    setIsSavingProfile(true)

    try {
      const response = await apiClient.put('/user/profile', { name })
      setProfile((current) => ({ ...current, name: response.data.name }))
      setMessage('Profile updated successfully.')
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not update profile.')
    } finally {
      setIsSavingProfile(false)
    }
  }

  function handlePasswordChange(event) {
    const { name: fieldName, value } = event.target
    setPasswordData((current) => ({ ...current, [fieldName]: value }))
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault()
    setMessage('')
    setError('')
    setIsChangingPassword(true)

    try {
      const response = await apiClient.put('/user/change-password', passwordData)
      setPasswordData({ old_password: '', new_password: '' })
      setMessage(response.data.message || 'Password changed successfully.')
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not change password.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Profile</p>
          <h2>Welcome, {profile?.name || 'User'}</h2>
          <p>{profile?.email || 'Manage your account details.'}</p>
        </div>
      </header>

      {message && <div className="page-message success-message">{message}</div>}
      {error && <div className="page-message error-message">{error}</div>}

      <section className="profile-grid">
        <form className="profile-card" onSubmit={handleProfileSubmit}>
          <div className="section-heading">
            <p className="eyebrow">Account</p>
            <h2>Edit profile</h2>
          </div>

          <label>
            Name
            <input name="name" onChange={(event) => setName(event.target.value)} required type="text" value={name} />
          </label>

          <label>
            Email
            <input disabled type="email" value={profile?.email || ''} />
          </label>

          <button disabled={isSavingProfile} type="submit">
            {isSavingProfile ? 'Saving...' : 'Save profile'}
          </button>
        </form>

        <form className="profile-card" onSubmit={handlePasswordSubmit}>
          <div className="section-heading">
            <p className="eyebrow">Security</p>
            <h2>Change password</h2>
          </div>

          <label>
            Current password
            <input
              autoComplete="current-password"
              name="old_password"
              onChange={handlePasswordChange}
              required
              type="password"
              value={passwordData.old_password}
            />
          </label>

          <label>
            New password
            <input
              autoComplete="new-password"
              minLength="6"
              name="new_password"
              onChange={handlePasswordChange}
              required
              type="password"
              value={passwordData.new_password}
            />
          </label>

          <button disabled={isChangingPassword} type="submit">
            {isChangingPassword ? 'Changing...' : 'Change password'}
          </button>
        </form>
      </section>
    </div>
  )
}

export default ProfilePage
