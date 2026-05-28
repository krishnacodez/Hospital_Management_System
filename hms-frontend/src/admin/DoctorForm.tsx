import type { FormEvent } from 'react'
import { useState } from 'react'
import { DOCTOR_SPECIALIZATION_OPTIONS } from './doctorSpecializations'

type DoctorFormProps = {
  name: string
  specialization: string
  email: string
  password: string
  isSubmitting: boolean
  onNameChange: (value: string) => void
  onSpecializationChange: (value: string) => void
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function DoctorForm({
  name,
  specialization,
  email,
  password,
  isSubmitting,
  onNameChange,
  onSpecializationChange,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: DoctorFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const isInvalid =
    name.trim() === '' ||
    specialization.trim() === '' ||
    email.trim() === '' ||
    password.trim() === ''

  return (
    <form className="form-card" onSubmit={onSubmit}>
      <div className="section-copy">
        <p className="login-eyebrow">Admin Tools</p>
        <h3>Add Doctor</h3>
      </div>
      <div className="form-grid">
        <input
          type="text"
          placeholder="Enter doctor name"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          required
        />
        <select
          value={specialization}
          onChange={(event) => onSpecializationChange(event.target.value)}
          required
          aria-label="Doctor specialization"
        >
          <option value="">Select specialization</option>
          {DOCTOR_SPECIALIZATION_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          required
        />
        <div className="password-field">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Set password"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            minLength={6}
            required
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>
      <p className="status-text">
        Admin-assigned doctor credentials are required for doctor login.
      </p>
      <button
        type="submit"
        className="primary-button"
        disabled={isSubmitting || isInvalid}
      >
        {isSubmitting ? 'Adding...' : 'Add Doctor'}
      </button>
    </form>
  )
}

