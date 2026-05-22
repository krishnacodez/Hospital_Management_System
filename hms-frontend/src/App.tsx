import { useState } from 'react'
import type { FormEvent } from 'react'
import type { ReactElement } from 'react'
import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { AdminDashboard } from './admin/AdminDashboard'
import { loginRequest, persistAuthSession } from './auth/authApi'
import { MediSphereLogo } from './components/MediSphereLogo'
import { Sidebar } from './components/Sidebar'
import { DoctorDashboard } from './doctor/DoctorDashboard'
import { PatientDashboard } from './patient/PatientDashboard'

function Layout() {
  const location = useLocation()
  const isLogin =
    location.pathname === '/login' || location.pathname === '/'

  return (
    <div className={`app-shell${isLogin ? ' app-shell--login' : ''}`}>
      <Sidebar />
      <div className="app-main">
        <main className="app-content">
          <Outlet />
        </main>
      </div>
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
      <div className="login-page__bg" aria-hidden>
        <div className="login-page__orb login-page__orb--1" />
        <div className="login-page__orb login-page__orb--2" />
        <div className="login-page__grid" />
      </div>

      <div className="login-page__hero">
        <MediSphereLogo size="lg" />
        <h1 className="login-page__headline">
          AI-powered healthcare, simplified
        </h1>
        <p className="login-page__lead">
          Manage appointments, prescriptions, and intelligent specialist
          recommendations — all in one modern hospital platform.
        </p>
        <ul className="login-page__features">
          <li>
            <span className="login-page__feature-icon" aria-hidden>✦</span>
            Smart symptom analysis
          </li>
          <li>
            <span className="login-page__feature-icon" aria-hidden>✦</span>
            Role-based dashboards
          </li>
          <li>
            <span className="login-page__feature-icon" aria-hidden>✦</span>
            Secure clinical workflows
          </li>
        </ul>
      </div>

      <form
        className={`login-form${submitting ? ' login-form--submitting' : ''}`}
        onSubmit={handleLogin}
      >
        <div className="login-copy">
          <p className="login-eyebrow">Welcome back</p>
          <h2>Sign in to MediSphere</h2>
          <p className="login-subtitle">
            Enter your credentials to access your dashboard
          </p>
        </div>
        <label className="field-label" htmlFor="login-email">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          placeholder="you@hospital.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
        <label className="field-label" htmlFor="login-password">
          Password
        </label>
        <input
          id="login-password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value)
            if (error) {
              setError('')
            }
          }}
          autoComplete="current-password"
          required
        />
        {error ? (
          <p className="error-text error-text--boxed" role="alert">
            {error}
          </p>
        ) : null}
        <button type="submit" className="primary-button login-submit" disabled={submitting}>
          {submitting ? (
            <>
              <span className="btn-spinner" aria-hidden />
              Signing in…
            </>
          ) : (
            'Sign in'
          )}
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
  return (
    <div className="not-found-page">
      <EmptyStateIcon />
      <h2>Page not found</h2>
      <p className="status-text">The page you requested does not exist.</p>
      <a href="/login" className="primary-button">
        Back to sign in
      </a>
    </div>
  )
}

function EmptyStateIcon() {
  return (
    <span className="empty-state__icon" aria-hidden>
      🔍
    </span>
  )
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
