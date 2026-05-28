import { useState } from 'react'
import type { FormEvent } from 'react'
import type { ReactElement } from 'react'
import {
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { AdminDashboard } from './admin/AdminDashboard'
import {
  loginRequest,
  persistAuthSession,
  registerPatientRequest,
} from './auth/authApi'
import { MediSphereLogo } from './components/MediSphereLogo'
import { Sidebar } from './components/Sidebar'
import { DoctorDashboard } from './doctor/DoctorDashboard'
import { PatientDashboard } from './patient/PatientDashboard'

function Layout() {
  const location = useLocation()
  const isAuthPage =
    location.pathname === '/login' ||
    location.pathname === '/register/patient' ||
    location.pathname === '/'

  return (
    <div className={`app-shell${isAuthPage ? ' app-shell--login' : ''}`}>
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
          <p className="login-eyebrow">Welcome to MediSphere</p>
          <h2>AI Powered Healthcare Platform</h2>
          <p className="login-subtitle">
            Sign in to continue
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
        <div className="auth-switch">
          <p className="status-text">Don&apos;t have an account?</p>
          <Link to="/register/patient" className="secondary-button auth-switch__button">
            Register as Patient
          </Link>
        </div>
      </form>
    </section>
  )
}

function RegisterPatientPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    const trimmedName = name.trim()
    const trimmedEmail = email.trim().toLowerCase()
    const trimmedPhone = phone.trim()
    const trimmedGender = gender.trim()
    const parsedAge = Number(age)

    if (!trimmedName) {
      setError('Full name is required.')
      return
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(trimmedEmail)) {
      setError('Please enter a valid email address.')
      return
    }
    if (password.trim().length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Confirm password does not match.')
      return
    }
    if (!Number.isFinite(parsedAge) || parsedAge < 1 || parsedAge > 120) {
      setError('Age must be between 1 and 120.')
      return
    }
    if (!trimmedGender) {
      setError('Gender is required.')
      return
    }
    if (!trimmedPhone) {
      setError('Phone is required.')
      return
    }

    try {
      setSubmitting(true)
      await registerPatientRequest({
        name: trimmedName,
        email: trimmedEmail,
        password,
        age: parsedAge,
        gender: trimmedGender,
        phone: trimmedPhone,
      })
      setSuccess('Account created successfully. You can sign in now.')
      window.setTimeout(() => navigate('/login'), 900)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to create account.'
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
        <h1 className="login-page__headline">Create Patient Account</h1>
        <p className="login-page__lead">
          Register as a patient to book appointments, receive prescriptions, and
          use MediSphere AI recommendations.
        </p>
      </div>

      <form className="login-form register-form" onSubmit={handleRegister}>
        <div className="login-copy">
          <p className="login-eyebrow">Patient Registration</p>
          <h2>Create your account</h2>
          <p className="login-subtitle">Only patients can self-register.</p>
        </div>
        <div className="register-form__field">
          <label className="field-label" htmlFor="register-name">
            Full Name
          </label>
          <input
            id="register-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter full name"
            required
          />
        </div>
        <div className="register-form__field">
          <label className="field-label" htmlFor="register-email">
            Email
          </label>
          <input
            id="register-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
        <div className="register-form__field">
          <label className="field-label" htmlFor="register-password">
            Password
          </label>
          <div className="password-field">
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '🙈' : '👁'}
            </button>
          </div>
        </div>
        <div className="register-form__field">
          <label className="field-label" htmlFor="register-confirm-password">
            Confirm Password
          </label>
          <div className="password-field">
            <input
              id="register-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword((v) => !v)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? '🙈' : '👁'}
            </button>
          </div>
        </div>
        <div className="form-grid form-grid--auth">
          <div className="register-form__field">
            <label className="field-label" htmlFor="register-age">
              Age
            </label>
            <input
              id="register-age"
              type="number"
              min={1}
              max={120}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
            />
          </div>
          <div className="register-form__field">
            <label className="field-label" htmlFor="register-gender">
              Gender
            </label>
            <select
              id="register-gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
            >
              <option value="">Select gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
              <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
            </select>
          </div>
        </div>
        <div className="register-form__field">
          <label className="field-label" htmlFor="register-phone">
            Phone
          </label>
          <input
            id="register-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter phone number"
            required
          />
        </div>
        {error ? (
          <p className="error-text error-text--boxed" role="alert">
            {error}
          </p>
        ) : null}
        {success ? <p className="success-text">{success}</p> : null}
        <button type="submit" className="primary-button login-submit" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create Patient Account'}
        </button>
        <div className="auth-switch">
          <p className="status-text">Already have an account?</p>
          <Link to="/login" className="secondary-button auth-switch__button">
            Back to Login
          </Link>
        </div>
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
        <Route path="/register/patient" element={<RegisterPatientPage />} />
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
