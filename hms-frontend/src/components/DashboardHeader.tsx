import { useNavigate } from 'react-router-dom'

type DashboardHeaderProps = {
  title: string
  subtitle?: string
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const navigate = useNavigate()
  const displayName = localStorage.getItem('name')
  const role = localStorage.getItem('role')

  const handleLogout = () => {
    localStorage.removeItem('role')
    localStorage.removeItem('doctorId')
    localStorage.removeItem('patientId')
    localStorage.removeItem('name')
    navigate('/login')
  }

  return (
    <header className="dashboard-header">
      <div className="dashboard-header__titles">
        <p className="login-eyebrow">MediSphere</p>
        <h2>{title}</h2>
        {subtitle ? (
          <p className="dashboard-header__subtitle">{subtitle}</p>
        ) : displayName ? (
          <p className="dashboard-header__subtitle">
            Welcome back, {displayName}
            {role ? ` · ${role.charAt(0) + role.slice(1).toLowerCase()}` : ''}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        className="logout-button"
        onClick={handleLogout}
        aria-label="Sign out"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
        </svg>
        Sign out
      </button>
    </header>
  )
}
