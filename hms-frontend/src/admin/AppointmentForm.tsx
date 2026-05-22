import type { FormEvent } from 'react'
import type { Doctor, Patient } from './types'

type AppointmentFormProps = {
  patientId: string
  doctorId: string
  appointmentDateTime: string
  reason: string
  patients: Patient[]
  doctors: Doctor[]
  isSubmitting: boolean
  onPatientIdChange: (value: string) => void
  onDoctorIdChange: (value: string) => void
  onDateTimeChange: (value: string) => void
  onReasonChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function AppointmentForm({
  patientId,
  doctorId,
  appointmentDateTime,
  reason,
  patients,
  doctors,
  isSubmitting,
  onPatientIdChange,
  onDoctorIdChange,
  onDateTimeChange,
  onReasonChange,
  onSubmit,
}: AppointmentFormProps) {
  const isInvalid =
    patientId === '' ||
    doctorId === '' ||
    appointmentDateTime.trim() === '' ||
    reason.trim() === ''

  return (
    <form className="form-card" onSubmit={onSubmit}>
      <div className="section-copy">
        <p className="login-eyebrow">Admin Tools</p>
        <h3>Create Appointment</h3>
      </div>
      <div className="form-grid form-grid--appointment">
        <select
          value={patientId}
          onChange={(event) => onPatientIdChange(event.target.value)}
          required
          aria-label="Patient"
        >
          <option value="">Select patient</option>
          {patients.map((patient) => (
            <option key={patient.id} value={String(patient.id)}>
              {patient.name}
            </option>
          ))}
        </select>
        <select
          value={doctorId}
          onChange={(event) => onDoctorIdChange(event.target.value)}
          required
          aria-label="Doctor"
        >
          <option value="">Select doctor</option>
          {doctors.map((doctor) => (
            <option key={doctor.id} value={String(doctor.id)}>
              {doctor.name}
            </option>
          ))}
        </select>
        <input
          type="datetime-local"
          value={appointmentDateTime}
          onChange={(event) => onDateTimeChange(event.target.value)}
          required
          aria-label="Appointment date and time"
        />
        <input
          type="text"
          placeholder="Reason for visit"
          value={reason}
          onChange={(event) => onReasonChange(event.target.value)}
          required
        />
      </div>
      <button
        type="submit"
        className="primary-button"
        disabled={isSubmitting || isInvalid}
      >
        {isSubmitting ? 'Creating...' : 'Create appointment'}
      </button>
    </form>
  )
}
