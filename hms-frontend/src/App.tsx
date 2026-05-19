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
import { loginRequest, persistAuthSession } from './auth/authApi'
import { DoctorDashboard } from './doctor/DoctorDashboard'
import { PatientDashboard } from './patient/PatientDashboard'

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
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()

    if (!trimmedEmail) {
      setError('Email is required.')
      return
    }
    if (!trimmedPassword) {
      setError('Password is required.')
      return
    }

    setError('')
    setSubmitting(true)

    try {
      const data = await loginRequest(trimmedEmail, trimmedPassword)
      persistAuthSession(data)

      if (data.role === 'ADMIN') {
        navigate('/admin')
      } else if (data.role === 'DOCTOR') {
        navigate('/doctor')
      } else {
        navigate('/patient')
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Invalid credentials'
      setError(message)
    } finally {
      setSubmitting(false)
    }
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
        <button type="submit" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Login'}
        </button>
      </form>
    </section>
  )
}

function AdminPage() {
  return <AdminDashboard />
}

function DoctorPage() {
  return <DoctorDashboard />
}

function PatientPage() {
  return <PatientDashboard />
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
