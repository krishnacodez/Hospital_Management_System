import { useNavigate } from 'react-router-dom'

export function DashboardHeader({ title }: { title: string }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('role')
    navigate('/login')
  }

  return (
    <section className="dashboard-page">
      <div className="dashboard-header-row">
        <h2>{title}</h2>
        <button type="button" className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </section>
  )
}

