import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom'

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
    <form className="login-form" onSubmit={handleLogin}>
      <h2>Login Page</h2>
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
  )
}

function AdminPage() {
  return <h2>Admin Dashboard</h2>
}

function DoctorPage() {
  return <h2>Doctor Dashboard</h2>
}

function PatientPage() {
  return <h2>Patient Dashboard</h2>
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
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/doctor" element={<DoctorPage />} />
        <Route path="/patient" element={<PatientPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
