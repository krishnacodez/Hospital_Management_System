import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { readApiErrorMessage } from '../admin/apiError'
import type { AppointmentRow, Doctor } from '../admin/types'
import { API_BASE } from '../auth/authApi'
import { DashboardHeader } from '../components/DashboardHeader'
import { EmptyState } from '../components/EmptyState'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { StatusBadge } from '../components/StatusBadge'
import { PrescriptionViewModal } from '../components/PrescriptionViewModal'
import { fetchPrescriptionsForPatient } from '../prescription/prescriptionApi'
import type { PrescriptionDto } from '../prescription/types'

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

function confidenceBadgeClass(level: string): string {
  const u = level.toUpperCase()
  if (u === 'HIGH') {
    return 'confidence-badge confidence-badge--high'
  }
  if (u === 'MEDIUM') {
    return 'confidence-badge confidence-badge--medium'
  }
  return 'confidence-badge confidence-badge--low'
}

function formatPrescriptionDate(iso: string | null | undefined): string {
  if (!iso) {
    return '—'
  }
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

function resolvePatientId(): number | null {
  const raw = localStorage.getItem('patientId')
  if (!raw) {
    return null
  }
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

type RecommendDoctorResponse = {
  specialization: string
  confidence: string
  matchedKeywords: string[]
  message: string
}

function normalizeSpec(s: string | null | undefined): string {
  return (s ?? '').trim().toLowerCase()
}

function isDoctorBookable(doctor: Doctor): boolean {
  return doctor.available !== false
}

function isRecommendedDoctor(
  doctor: Doctor,
  rec: RecommendDoctorResponse | null,
): boolean {
  if (!rec) {
    return false
  }
  return (
    normalizeSpec(doctor.specialization) ===
    rec.specialization.trim().toLowerCase()
  )
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

  const [prescriptions, setPrescriptions] = useState<PrescriptionDto[]>([])
  const [prescriptionsLoading, setPrescriptionsLoading] = useState(true)
  const [prescriptionsError, setPrescriptionsError] = useState('')
  const [viewPrescription, setViewPrescription] = useState<PrescriptionDto | null>(
    null,
  )

  const [selectedDoctorId, setSelectedDoctorId] = useState('')
  const [appointmentDateTime, setAppointmentDateTime] = useState('')
  const [reason, setReason] = useState('')
  const [bookingSubmitting, setBookingSubmitting] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [bookingSuccess, setBookingSuccess] = useState('')

  const [symptomInput, setSymptomInput] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeDots, setAnalyzeDots] = useState(0)
  const [recommendError, setRecommendError] = useState('')
  const [recommendation, setRecommendation] =
    useState<RecommendDoctorResponse | null>(null)

  const sortedDoctors = useMemo(() => {
    const target = recommendation?.specialization?.trim().toLowerCase()
    if (!target) {
      return doctors
    }
    return [...doctors].sort((a, b) => {
      const matchA = normalizeSpec(a.specialization) === target
      const matchB = normalizeSpec(b.specialization) === target
      if (matchA !== matchB) {
        return matchA ? -1 : 1
      }
      const ba = isDoctorBookable(a) ? 0 : 1
      const bb = isDoctorBookable(b) ? 0 : 1
      if (ba !== bb) {
        return ba - bb
      }
      return a.name.localeCompare(b.name)
    })
  }, [doctors, recommendation])

  const sortedBookableDoctors = useMemo(
    () => sortedDoctors.filter(isDoctorBookable),
    [sortedDoctors],
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

  const sortedPrescriptions = useMemo(() => {
    return [...prescriptions].sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return tb - ta
    })
  }, [prescriptions])

  const loadPrescriptions = useCallback(async () => {
    if (patientId === null) {
      setPrescriptions([])
      setPrescriptionsLoading(false)
      return
    }
    try {
      setPrescriptionsLoading(true)
      setPrescriptionsError('')
      const list = await fetchPrescriptionsForPatient(patientId)
      setPrescriptions(list)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to load prescriptions.'
      setPrescriptionsError(message)
      setPrescriptions([])
    } finally {
      setPrescriptionsLoading(false)
    }
  }, [patientId])

  useEffect(() => {
    void loadDoctors()
  }, [loadDoctors])

  useEffect(() => {
    void loadAppointments()
  }, [loadAppointments])

  useEffect(() => {
    void loadPrescriptions()
  }, [loadPrescriptions])

  useEffect(() => {
    if (!analyzing) {
      return
    }
    const id = window.setInterval(() => {
      setAnalyzeDots((n) => (n + 1) % 4)
    }, 450)
    return () => window.clearInterval(id)
  }, [analyzing])

  useEffect(() => {
    if (!recommendation) {
      return
    }
    const target = recommendation.specialization.trim().toLowerCase()
    const first = sortedBookableDoctors.find(
      (d) => normalizeSpec(d.specialization) === target,
    )
    if (first) {
      setSelectedDoctorId(String(first.id))
    }
  }, [recommendation, sortedBookableDoctors])

  const handleAnalyzeSymptoms = async () => {
    setRecommendError('')
    const trimmed = symptomInput.trim()
    if (trimmed.length < 3) {
      setRecommendError(
        'Please enter at least 3 characters describing your symptoms.',
      )
      return
    }
    setAnalyzing(true)
    setAnalyzeDots(0)
    setRecommendation(null)
    try {
      const response = await fetch(`${API_BASE}/recommend-doctor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: trimmed }),
      })
      const data = (await response.json()) as RecommendDoctorResponse & {
        errors?: Record<string, string>
        message?: string
      }
      if (!response.ok) {
        throw new Error(
          readApiErrorMessage(data, 'Unable to analyze symptoms right now.'),
        )
      }
      setRecommendation({
        specialization: data.specialization,
        confidence: data.confidence,
        matchedKeywords: Array.isArray(data.matchedKeywords)
          ? data.matchedKeywords
          : [],
        message: data.message ?? '',
      })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to analyze symptoms.'
      setRecommendError(message)
    } finally {
      setAnalyzing(false)
    }
  }

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
      await loadPrescriptions()
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

  const pendingAppts = appointments.filter(
    (a) => a.status.toUpperCase() === 'PENDING',
  ).length

  return (
    <section className="dashboard-page patient-dashboard">
      <DashboardHeader
        title="Patient Dashboard"
        subtitle={
          displayName
            ? `Your care hub — appointments, AI insights, and prescriptions`
            : undefined
        }
      />

      <div className="dashboard-stats">
        <div className="stat-card stat-card--accent">
          <p className="stat-card__label">Appointments</p>
          <p className="stat-card__value">{appointments.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-card__label">Pending</p>
          <p className="stat-card__value">{pendingAppts}</p>
        </div>
        <div className="stat-card">
          <p className="stat-card__label">Prescriptions</p>
          <p className="stat-card__value">{prescriptions.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-card__label">Doctors</p>
          <p className="stat-card__value">{doctors.length}</p>
        </div>
      </div>

      <div className="symptom-ai-hero management-card">
        <div className="management-header">
          <p className="login-eyebrow">Smart care</p>
          <h3>
            <span aria-hidden>🩺 </span>
            Find the Right Specialist
          </h3>
          <p className="management-subtitle">
            Describe your symptoms in plain language. Our clinical keyword engine
            suggests the best-matching specialty—no data leaves this hospital app.
          </p>
        </div>
        <div className="form-grid">
          <textarea
            className="symptom-ai-textarea"
            placeholder="Example: chest pain and shortness of breath, or skin rash and itching..."
            value={symptomInput}
            onChange={(e) => {
              setSymptomInput(e.target.value)
              if (recommendError) {
                setRecommendError('')
              }
            }}
            rows={5}
            aria-label="Describe your symptoms"
          />
        </div>
        {recommendError ? <p className="error-text">{recommendError}</p> : null}
        <div className="symptom-ai-actions">
          <button
            type="button"
            className="primary-button symptom-ai-button"
            disabled={analyzing || symptomInput.trim().length < 3}
            onClick={() => void handleAnalyzeSymptoms()}
          >
            {analyzing
              ? `Analyzing symptoms${'.'.repeat(analyzeDots)}`
              : 'Analyze Symptoms'}
          </button>
          {recommendation ? (
            <button
              type="button"
              className="logout-button"
              onClick={() => {
                setRecommendation(null)
                setRecommendError('')
              }}
            >
              Clear recommendation
            </button>
          ) : null}
        </div>
        {analyzing ? (
          <p className="symptom-ai-scanning" aria-live="polite">
            Scanning symptom patterns…
          </p>
        ) : null}
        {recommendation ? (
          <div className="symptom-ai-result">
            <div className="symptom-ai-result-header">
              <span className="symptom-ai-result-icon" aria-hidden>
                🧠
              </span>
              <div className="symptom-ai-result-titles">
                <p className="login-eyebrow">AI recommendation</p>
                <h4>Recommended specialist</h4>
              </div>
              <span
                className={confidenceBadgeClass(recommendation.confidence)}
              >
                {recommendation.confidence}
              </span>
            </div>
            <p className="symptom-ai-specialist">{recommendation.specialization}</p>
            <p className="symptom-ai-message">{recommendation.message}</p>
            {recommendation.matchedKeywords.length > 0 ? (
              <div className="symptom-chip-row">
                <span className="symptom-chip-label">Matched symptoms</span>
                <div className="symptom-chip-wrap">
                  {recommendation.matchedKeywords.map((kw) => (
                    <span key={kw} className="symptom-chip">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="symptom-ai-suggested">
              <p className="symptom-chip-label">Suggested doctors</p>
              {sortedBookableDoctors.filter((d) =>
                isRecommendedDoctor(d, recommendation),
              ).length === 0 ? (
                <p className="status-text">
                  No available doctors for this specialization yet. See the full
                  directory below.
                </p>
              ) : (
                <div className="item-list item-list--compact">
                  {sortedBookableDoctors
                    .filter((d) => isRecommendedDoctor(d, recommendation))
                    .map((d) => (
                      <article
                        key={d.id}
                        className="item-card item-card--ai-recommended"
                      >
                        <h4>{d.name}</h4>
                        <p className="appointment-meta">
                          {d.specialization ?? 'General'}
                        </p>
                      </article>
                    ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      <div className="management-card">
        <div className="management-header">
          <p className="login-eyebrow">Care team</p>
          <h3>Available doctors</h3>
          <p className="management-subtitle">
            {recommendation
              ? 'Recommended specialty doctors appear first and are highlighted.'
              : 'Browse our specialists. Only doctors marked available can be selected for booking.'}
          </p>
        </div>
        {doctorsError && <p className="error-text">{doctorsError}</p>}
        {doctorsLoading ? (
          <LoadingSpinner label="Loading doctors…" />
        ) : doctors.length === 0 ? (
          <EmptyState
            icon="🩺"
            title="No doctors available"
            description="Check back later when specialists are registered."
          />
        ) : (
          <div className="item-list">
            {sortedDoctors.map((doctor) => {
              const available = isDoctorBookable(doctor)
              const rec = isRecommendedDoctor(doctor, recommendation)
              return (
                <article
                  key={doctor.id}
                  className={`item-card${rec ? ' item-card--ai-recommended' : ''}`}
                >
                  <h4>{doctor.name}</h4>
                  <p className="appointment-meta">
                    {doctor.specialization ?? 'General'}
                  </p>
                  {rec ? (
                    <p className="symptom-ai-match-badge">Recommended match</p>
                  ) : null}
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
            {sortedBookableDoctors.map((d) => (
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
        {doctors.length > 0 && sortedBookableDoctors.length === 0 ? (
          <p className="status-text">
            No doctors are available for booking right now.
          </p>
        ) : null}
        <button
          type="submit"
          className="primary-button"
          disabled={
            bookingSubmitting ||
            sortedBookableDoctors.length === 0 ||
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
          <LoadingSpinner label="Loading your appointments…" />
        ) : appointments.length === 0 ? (
          <EmptyState
            icon="📅"
            title="No appointments yet"
            description="Book a visit with a doctor using the form above."
          />
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
                    <StatusBadge status={a.status} />
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

      <div className="management-card patient-prescriptions-card">
        <div className="management-header">
          <p className="login-eyebrow">Pharmacy</p>
          <h3>My prescriptions</h3>
          <p className="management-subtitle">
            Prescriptions issued after completed visits. Tap a card to see full
            details.
          </p>
        </div>
        {prescriptionsError ? (
          <p className="error-text">{prescriptionsError}</p>
        ) : null}
        {prescriptionsLoading ? (
          <LoadingSpinner label="Loading prescriptions…" />
        ) : sortedPrescriptions.length === 0 ? (
          <EmptyState
            icon="💊"
            title="No prescriptions yet"
            description="After your doctor completes a visit, prescriptions will appear here."
          />
        ) : (
          <div className="item-list">
            {sortedPrescriptions.map((rx) => (
              <button
                key={rx.id}
                type="button"
                className="item-card patient-prescription-card"
                onClick={() => setViewPrescription(rx)}
              >
                <div className="patient-prescription-card-inner">
                  <div className="appointment-card-row">
                    <h4>{rx.doctorName}</h4>
                    <span className="status-badge status-badge--approved">
                      Rx
                    </span>
                  </div>
                  <p className="appointment-meta">
                    {formatPrescriptionDate(rx.createdAt ?? null)}
                  </p>
                  <p className="appointment-reason">{rx.diagnosis}</p>
                  <p className="patient-prescription-preview">
                    {rx.medicines.length} medicine
                    {rx.medicines.length === 1 ? '' : 's'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {viewPrescription ? (
        <PrescriptionViewModal
          prescription={viewPrescription}
          onClose={() => setViewPrescription(null)}
        />
      ) : null}
    </section>
  )
}
