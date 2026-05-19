import { useCallback, useEffect, useState } from 'react'
import type { AppointmentRow } from '../admin/types'
import { API_BASE } from '../auth/authApi'
import { DashboardHeader } from '../components/DashboardHeader'

type ApiListEnvelope<T> = {
  success?: boolean
  message?: string
  data?: T | { data?: T; content?: T }
}

/** Normalize doctor-appointments API body: `{ data: T[] }` or nested `{ data: { data: T[] } }`. */
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

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as {
      message?: string
      error?: string
    }
    return body.message || body.error || `Request failed (${response.status})`
  } catch {
    return `Request failed (${response.status})`
  }
}

function resolveDoctorId(): number | null {
  const raw = localStorage.getItem('doctorId')
  if (!raw) {
    return null
  }
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

export function DoctorDashboard() {
  const [appointments, setAppointments] = useState<AppointmentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const doctorId = resolveDoctorId()
      if (doctorId === null) {
        setError(
          'Missing doctor account in this session. Please log out and sign in again.',
        )
        setAppointments([])
        return
      }

      const url = `${API_BASE}/appointments/doctor/${doctorId}`
      const response = await fetch(url)
      const responseData = (await response.json()) as ApiListEnvelope<
        AppointmentRow[]
      >

      if (!response.ok || responseData.success === false) {
        throw new Error(
          responseData.message || `Request failed (${response.status})`,
        )
      }

      setAppointments(extractAppointmentList(responseData))
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to load appointments.'
      setError(message)
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadAppointments()
  }, [loadAppointments])

  const patchStatus = async (id: number, status: 'APPROVED' | 'COMPLETED') => {
    try {
      setUpdatingId(id)
      setError('')
      const response = await fetch(
        `${API_BASE}/appointments/${id}/status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        },
      )
      if (!response.ok) {
        throw new Error(await readErrorMessage(response))
      }
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a)),
      )
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to update status.'
      setError(message)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <section className="dashboard-page doctor-dashboard">
      <DashboardHeader title="Doctor Dashboard" />

      <div className="management-card">
        <div className="management-header">
          <p className="login-eyebrow">Doctor Dashboard</p>
          <h3>My appointments</h3>
          <p className="management-subtitle">
            Review visits for your patients and move each appointment through
            PENDING → APPROVED → COMPLETED.
          </p>
        </div>

        {error && <p className="error-text">{error}</p>}

        {loading ? (
          <p className="status-text">Loading appointments...</p>
        ) : appointments.length === 0 ? (
          <p className="status-text">No appointments assigned to you yet.</p>
        ) : (
          <div className="item-list">
            {appointments.map((appointment) => {
              const status = appointment.status.toUpperCase()
              const busy = updatingId === appointment.id

              return (
                <article
                  key={appointment.id}
                  className="item-card appointment-card doctor-appointment-card"
                >
                  <div className="appointment-card-body">
                    <div className="appointment-card-row">
                      <h4>{appointment.patientName}</h4>
                      <span className={statusBadgeClass(appointment.status)}>
                        {appointment.status}
                      </span>
                    </div>
                    <p className="appointment-meta">
                      {formatAppointmentTime(appointment.appointmentTime)}
                    </p>
                    <p className="appointment-reason">{appointment.reason}</p>
                    <div className="doctor-appointment-actions">
                      {status === 'PENDING' && (
                        <button
                          type="button"
                          className="primary-button"
                          disabled={busy}
                          onClick={() => void patchStatus(appointment.id, 'APPROVED')}
                        >
                          {busy ? 'Updating…' : 'Approve'}
                        </button>
                      )}
                      {status === 'APPROVED' && (
                        <button
                          type="button"
                          className="primary-button"
                          disabled={busy}
                          onClick={() =>
                            void patchStatus(appointment.id, 'COMPLETED')
                          }
                        >
                          {busy ? 'Updating…' : 'Mark as Completed'}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
