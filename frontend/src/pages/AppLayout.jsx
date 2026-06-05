import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { clearToken } from '../auth/tokenStorage'

function AppLayout() {
  const navigate = useNavigate()

  function handleLogout() {
    clearToken()
    navigate('/login', { replace: true })
  }

  return (
    <main className="app-layout">
      <aside className="sidebar">
        <div className="brand-block">
          <p className="eyebrow">AI Health</p>
          <h1>Assistant</h1>
        </div>

        <nav className="side-nav">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/predict">Predict</NavLink>
          <NavLink to="/history">History</NavLink>
          <NavLink to="/profile">Profile</NavLink>
        </nav>

        <button className="logout-button" onClick={handleLogout} type="button">
          Logout
        </button>
      </aside>

      <section className="content-shell">
        <Outlet />
      </section>
    </main>
  )
}

export default AppLayout
