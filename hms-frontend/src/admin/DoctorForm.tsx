import type { FormEvent } from 'react'

type DoctorFormProps = {
  name: string
  specialization: string
  email: string
  isSubmitting: boolean
  onNameChange: (value: string) => void
  onSpecializationChange: (value: string) => void
  onEmailChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function DoctorForm({
  name,
  specialization,
  email,
  isSubmitting,
  onNameChange,
  onSpecializationChange,
  onEmailChange,
  onSubmit,
}: DoctorFormProps) {
  const isInvalid = name.trim() === '' || specialization.trim() === ''

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
        <input
          type="text"
          placeholder="Enter specialization"
          value={specialization}
          onChange={(event) => onSpecializationChange(event.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Enter email (optional)"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
        />
      </div>
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

