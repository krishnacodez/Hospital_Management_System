import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { readApiErrorMessage } from '../admin/apiError'
import type { AppointmentRow, Doctor } from '../admin/types'
import { API_BASE } from '../auth/authApi'
import { DashboardHeader } from '../components/DashboardHeader'

/** `datetime-local` value → ISO local string Jackson accepts for LocalDateTime */
function normalizeDateTimeLocal(value: string): string {
  const trimmed = value.trim()
  if (trimmed.length === 16 && trimmed.includes('T')) {
    return `${trimmed}:00`
  }
  return trimmed
}

/** Current local time as `datetime-local` min value (YYYY-MM-DDTHH:mm). */
function localDatetimeInputMin(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

type ApiListEnvelope<T> = {
  success?: boolean
  message?: string
  data?: T | { data?: T; content?: T }
}

type ApiEnvelope<T> = {
  success?: boolean
  message?: string
  data?: T | null
}

function extractAppointmentList(
  responseData: ApiListEnvelope<AppointmentRow[]>,
): AppointmentRow[] {
  const root = responseData?.data
  if (Array.isArray(root)) {
    return root
  }
  if (root && typeof root === 'object') {
    const nested = root as { data?: AppointmentRow[]; content?: AppointmentRow[] }
    if (Array.isArray(nested.data)) {
      return nested.data
    }
    if (Array.isArray(nested.content)) {
      return nested.content
    }
  }
  return []
}

function formatAppointmentTime(iso: string): string {
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) {
      return iso
    }
    return d.toLocaleString()
  } catch {
    return iso
  }
}

function statusBadgeClass(status: string): string {
  const normalized = status.toUpperCase()
  if (normalized === 'PENDING') {
    return 'status-badge status-badge--pending'
  }
  if (normalized === 'APPROVED') {
    return 'status-badge status-badge--approved'
  }
  if (normalized === 'COMPLETED') {
    return 'status-badge status-badge--completed'
  }
  return 'status-badge'
}

function resolvePatientId(): number | null {
  const raw = localStorage.getItem('patientId')
  if (!raw) {
    return null
  }
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

function isDoctorBookable(doctor: Doctor): boolean {
  return doctor.available !== false
}

export function PatientDashboard() {
  const patientId = useMemo(() => resolvePatientId(), [])
  const displayName = localStorage.getItem('name')

  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [doctorsLoading, setDoctorsLoading] = useState(true)
  const [doctorsError, setDoctorsError] = useState('')

  const [appointments, setAppointments] = useState<AppointmentRow[]>([])
  const [appointmentsLoading, setAppointmentsLoading] = useState(true)
  const [appointmentsError, setAppointmentsError] = useState('')

  const [selectedDoctorId, setSelectedDoctorId] = useState('')
  const [appointmentDateTime, setAppointmentDateTime] = useState('')
  const [reason, setReason] = useState('')
  const [bookingSubmitting, setBookingSubmitting] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [bookingSuccess, setBookingSuccess] = useState('')

  const bookableDoctors = useMemo(
    () => doctors.filter(isDoctorBookable),
    [doctors],
  )

  const datetimeMin = useMemo(() => localDatetimeInputMin(), [])

  const loadDoctors = useCallback(async () => {
    try {
      setDoctorsLoading(true)
      setDoctorsError('')
      const response = await fetch(`${API_BASE}/doctors`)
      if (!response.ok) {
        throw new Error('Failed to load doctors.')
      }
      const data = (await response.json()) as Doctor[]
      setDoctors(Array.isArray(data) ? data : [])
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to load doctors right now.'
      setDoctorsError(message)
      setDoctors([])
    } finally {
      setDoctorsLoading(false)
    }
  }, [])

  const loadAppointments = useCallback(async () => {
    if (patientId === null) {
      setAppointments([])
      setAppointmentsLoading(false)
      return
    }
    try {
      setAppointmentsLoading(true)
      setAppointmentsError('')
      const response = await fetch(
        `${API_BASE}/appointments/patient/${patientId}`,
      )
      const responseData = (await response.json()) as ApiListEnvelope<
        AppointmentRow[]
      >

      if (!response.ok || responseData.success === false) {
        throw new Error(
          responseData.message || `Request failed (${response.status})`,
        )
      }

      const list = extractAppointmentList(responseData)
      list.sort((a, b) => {
        const ta = new Date(a.appointmentTime).getTime()
        const tb = new Date(b.appointmentTime).getTime()
        return tb - ta
      })
      setAppointments(list)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to load appointments.'
      setAppointmentsError(message)
      setAppointments([])
    } finally {
      setAppointmentsLoading(false)
    }
  }, [patientId])

  useEffect(() => {
    void loadDoctors()
  }, [loadDoctors])

  useEffect(() => {
    void loadAppointments()
  }, [loadAppointments])

  const handleBookAppointment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBookingSuccess('')
    setBookingError('')

    if (patientId === null) {
      setBookingError(
        'Missing patient account in this session. Please log out and sign in again.',
      )
      return
    }

    const doctorId = Number(selectedDoctorId)
    if (!Number.isFinite(doctorId) || doctorId <= 0) {
      setBookingError('Please select a doctor.')
      return
    }

    const trimmedReason = reason.trim()
    if (trimmedReason === '') {
      setBookingError('Reason is required.')
      return
    }

    const dt = appointmentDateTime.trim()
    if (dt === '') {
      setBookingError('Appointment date and time is required.')
      return
    }

    const normalized = normalizeDateTimeLocal(dt)
    const chosenMs = new Date(normalized).getTime()
    if (Number.isNaN(chosenMs)) {
      setBookingError('Invalid date and time.')
      return
    }
    if (chosenMs <= Date.now()) {
      setBookingError('Please choose a future date and time.')
      return
    }

    try {
      setBookingSubmitting(true)
      const response = await fetch(`${API_BASE}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          doctorId,
          appointmentTime: normalized,
          reason: trimmedReason,
          status: 'PENDING',
        }),
      })

      const body = (await response.json()) as ApiEnvelope<AppointmentRow>

      if (!response.ok || body.success === false) {
        throw new Error(
          readApiErrorMessage(
            body,
            'Unable to book appointment. Please try again.',
          ),
        )
      }

      setBookingSuccess('Appointment requested successfully. Status: PENDING.')
      setSelectedDoctorId('')
      setAppointmentDateTime('')
      setReason('')
      await loadAppointments()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to book appointment.'
      setBookingError(message)
    } finally {
      setBookingSubmitting(false)
    }
  }

  if (patientId === null) {
    return (
      <section className="dashboard-page patient-dashboard">
        <DashboardHeader title="Patient Dashboard" />
        <div className="management-card">
          <p className="error-text">
            Missing patient account in this session. Please log out and sign in
            again.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="dashboard-page patient-dashboard">
      <DashboardHeader title="Patient Dashboard" />

      {displayName ? (
        <p className="status-text">Signed in as {displayName}</p>
      ) : null}

      <div className="management-card">
        <div className="management-header">
          <p className="login-eyebrow">Care team</p>
          <h3>Available doctors</h3>
          <p className="management-subtitle">
            Browse our specialists. Only doctors marked available can be selected
            for booking.
          </p>
        </div>
        {doctorsError && <p className="error-text">{doctorsError}</p>}
        {doctorsLoading ? (
          <p className="status-text">Loading doctors...</p>
        ) : doctors.length === 0 ? (
          <p className="status-text">No doctors are listed yet.</p>
        ) : (
          <div className="item-list">
            {doctors.map((doctor) => {
              const available = isDoctorBookable(doctor)
              return (
                <article key={doctor.id} className="item-card">
                  <h4>{doctor.name}</h4>
                  <p className="appointment-meta">
                    {doctor.specialization ?? 'General'}
                  </p>
                  <p
                    className={
                      available
                        ? 'doctor-availability doctor-availability--yes'
                        : 'doctor-availability doctor-availability--no'
                    }
                  >
                    {available ? 'Available for booking' : 'Unavailable'}
                  </p>
                </article>
              )
            })}
          </div>
        )}
      </div>

      <form className="form-card" onSubmit={handleBookAppointment}>
        <div className="section-copy">
          <p className="login-eyebrow">Scheduling</p>
          <h3>Book an appointment</h3>
          <p className="management-subtitle">
            Choose a doctor, date and time, and a short reason for your visit.
          </p>
        </div>
        {bookingError && <p className="error-text">{bookingError}</p>}
        {bookingSuccess && <p className="success-text">{bookingSuccess}</p>}
        <div className="form-grid form-grid--appointment">
          <select
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            required
            aria-label="Select doctor"
          >
            <option value="">Select doctor</option>
            {bookableDoctors.map((d) => (
              <option key={d.id} value={String(d.id)}>
                {d.name} — {d.specialization ?? 'General'}
              </option>
            ))}
          </select>
          <input
            type="datetime-local"
            min={datetimeMin}
            value={appointmentDateTime}
            onChange={(e) => {
              setAppointmentDateTime(e.target.value)
              if (bookingError) setBookingError('')
              if (bookingSuccess) setBookingSuccess('')
            }}
            required
            aria-label="Appointment date and time"
          />
        </div>
        <div className="form-grid">
          <textarea
            placeholder="Reason for visit (required)"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value)
              if (bookingError) setBookingError('')
              if (bookingSuccess) setBookingSuccess('')
            }}
            required
            rows={4}
          />
        </div>
        {doctors.length > 0 && bookableDoctors.length === 0 ? (
          <p className="status-text">
            No doctors are available for booking right now.
          </p>
        ) : null}
        <button
          type="submit"
          className="primary-button"
          disabled={
            bookingSubmitting ||
            bookableDoctors.length === 0 ||
            selectedDoctorId === ''
          }
        >
          {bookingSubmitting ? 'Booking…' : 'Request appointment'}
        </button>
      </form>

      <div className="management-card">
        <div className="management-header">
          <p className="login-eyebrow">Your care</p>
          <h3>My appointments</h3>
          <p className="management-subtitle">
            Track visit times and status. Your doctor will approve or complete
            visits from their dashboard.
          </p>
        </div>
        {appointmentsError && (
          <p className="error-text">{appointmentsError}</p>
        )}
        {appointmentsLoading ? (
          <p className="status-text">Loading your appointments...</p>
        ) : appointments.length === 0 ? (
          <p className="status-text">You have no appointments yet.</p>
        ) : (
          <div className="item-list">
            {appointments.map((a) => (
              <article
                key={a.id}
                className="item-card appointment-card doctor-appointment-card"
              >
                <div className="appointment-card-body">
                  <div className="appointment-card-row">
                    <h4>{a.doctorName}</h4>
                    <span className={statusBadgeClass(a.status)}>
                      {a.status}
                    </span>
                  </div>
                  <p className="appointment-meta">
                    {formatAppointmentTime(a.appointmentTime)}
                  </p>
                  <p className="appointment-reason">{a.reason}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
