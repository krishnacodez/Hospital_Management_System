import type { FormEvent } from 'react'

type PatientFormProps = {
  name: string
  email: string
  isSubmitting: boolean
  onNameChange: (value: string) => void
  onEmailChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function PatientForm({
  name,
  email,
  isSubmitting,
  onNameChange,
  onEmailChange,
  onSubmit,
}: PatientFormProps) {
  return (
    <form className="form-card" onSubmit={onSubmit}>
      <div className="section-copy">
        <p className="login-eyebrow">Admin Tools</p>
        <h3>Add Patient</h3>
      </div>
      <div className="form-grid">
        <input
          type="text"
          placeholder="Enter patient name"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Enter patient email"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          required
        />
      </div>
      <button
        type="submit"
        className="primary-button"
        disabled={isSubmitting || name.trim() === '' || email.trim() === ''}
      >
        {isSubmitting ? 'Adding...' : 'Add Patient'}
      </button>
    </form>
  )
}

