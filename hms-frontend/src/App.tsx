import { useState } from 'react'
import type { FormEvent } from 'react'
import type { ReactElement } from 'react'
import {
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom'
import { AdminDashboard } from './admin/AdminDashboard'
import { DashboardHeader } from './components/DashboardHeader'

function Layout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Hospital Management System</h1>
        <nav className="app-nav">
          <NavLink to="/login">Login</NavLink>
          <NavLink to="/admin">Admin</NavLink>
          <NavLink to="/doctor">Doctor</NavLink>
          <NavLink to="/patient">Patient</NavLink>
        </nav>
      </header>
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  )
}

type Role = 'ADMIN' | 'DOCTOR' | 'PATIENT'

type ProtectedRouteProps = {
  allowedRole: Role
  children: ReactElement
}

function ProtectedRoute({ allowedRole, children }: ProtectedRouteProps) {
  const role = localStorage.getItem('role')

  if (!role) {
    return <Navigate to="/login" replace />
  }

  if (role !== allowedRole) {
    return <Navigate to="/login" replace />
  }

  return children
}

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedPassword = password.trim()
 
    if (trimmedPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setError('')

    let role = 'PATIENT'
    let destination = '/patient'

    if (email.trim().toLowerCase() === 'admin@gmail.com') {
      role = 'ADMIN'
      destination = '/admin'
    } else if (email.trim().toLowerCase() === 'doctor@gmail.com') {
      role = 'DOCTOR'
      destination = '/doctor'
    }

    localStorage.setItem('role', role)
    navigate(destination)
  }

  return (
    <section className="login-page">
      <form className="login-form" onSubmit={handleLogin}>
        <div className="login-copy">
          <p className="login-eyebrow">Hospital Management System</p>
          <h2>Welcome Back</h2>
          <p className="login-subtitle">Access your dashboard</p>
        </div>
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value)
            if (error) {
              setError('')
            }
          }}
          required
        />
        {error && <p className="error-text">{error}</p>}
        <button type="submit">Login</button>
      </form>
    </section>
  )
}

function AdminPage() {
  return <AdminDashboard />
}

function DoctorPage() {
  return (
    <section className="dashboard-page">
      <DashboardHeader title="Doctor Dashboard" />
    </section>
  )
}

function PatientPage() {
  return (
    <section className="dashboard-page">
      <DashboardHeader title="Patient Dashboard" />
    </section>
  )
}

function NotFoundPage() {
  return <h2>Page not found</h2>
}

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor"
          element={
            <ProtectedRoute allowedRole="DOCTOR">
              <DoctorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient"
          element={
            <ProtectedRoute allowedRole="PATIENT">
              <PatientPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
