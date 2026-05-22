import { useCallback, useEffect, useMemo, useState } from 'react'
import type { AppointmentRow } from '../admin/types'
import { API_BASE } from '../auth/authApi'
import { DashboardHeader } from '../components/DashboardHeader'
import { EmptyState } from '../components/EmptyState'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { StatusBadge } from '../components/StatusBadge'
import {
  fetchMedicines,
  fetchPrescriptionsForDoctor,
} from '../prescription/prescriptionApi'
import type { MedicineOption, PrescriptionDto } from '../prescription/types'
import { PrescriptionViewModal } from '../components/PrescriptionViewModal'
import { PrescriptionCreateModal } from './PrescriptionCreateModal'

type ApiListEnvelope<T> = {
  success?: boolean
  message?: string
  data?: T | { data?: T; content?: T }
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
  const [prescriptions, setPrescriptions] = useState<PrescriptionDto[]>([])
  const [medicines, setMedicines] = useState<MedicineOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [createForAppointmentId, setCreateForAppointmentId] = useState<
    number | null
  >(null)
  const [viewPrescription, setViewPrescription] = useState<PrescriptionDto | null>(
    null,
  )
  const [toast, setToast] = useState('')

  const prescriptionByAppointmentId = useMemo(() => {
    const map = new Map<number, PrescriptionDto>()
    for (const p of prescriptions) {
      if (p.appointmentId != null && p.appointmentId !== undefined) {
        map.set(p.appointmentId, p)
      }
    }
    return map
  }, [prescriptions])

  const loadAppointments = useCallback(async () => {
    const doctorId = resolveDoctorId()
    if (doctorId === null) {
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
  }, [])

  const loadPrescriptions = useCallback(async () => {
    const doctorId = resolveDoctorId()
    if (doctorId === null) {
      setPrescriptions([])
      return
    }
    setPrescriptions(await fetchPrescriptionsForDoctor(doctorId))
  }, [])

  const loadMedicines = useCallback(async () => {
    setMedicines(await fetchMedicines())
  }, [])

  const refreshAll = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const doctorId = resolveDoctorId()
      if (doctorId === null) {
        setError(
          'Missing doctor account in this session. Please log out and sign in again.',
        )
        setAppointments([])
        setPrescriptions([])
        return
      }
      await Promise.all([loadAppointments(), loadPrescriptions(), loadMedicines()])
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to load dashboard data.'
      setError(message)
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }, [loadAppointments, loadMedicines, loadPrescriptions])

  useEffect(() => {
    void refreshAll()
  }, [refreshAll])

  useEffect(() => {
    if (!toast) {
      return
    }
    const t = window.setTimeout(() => setToast(''), 4500)
    return () => window.clearTimeout(t)
  }, [toast])

  const patchStatus = async (id: number, status: 'APPROVED' | 'COMPLETED') => {
    try {
      setUpdatingId(id)
      setError('')
      const response = await fetch(`${API_BASE}/appointments/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) {
        throw new Error(await readErrorMessage(response))
      }
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a)),
      )
      if (status === 'COMPLETED') {
        await loadPrescriptions()
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to update status.'
      setError(message)
    } finally {
      setUpdatingId(null)
    }
  }

  const createAppointmentPatientName = useMemo(() => {
    if (createForAppointmentId == null) {
      return ''
    }
    return (
      appointments.find((a) => a.id === createForAppointmentId)?.patientName ??
      ''
    )
  }, [appointments, createForAppointmentId])

  const pendingCount = appointments.filter(
    (a) => a.status.toUpperCase() === 'PENDING',
  ).length
  const approvedCount = appointments.filter(
    (a) => a.status.toUpperCase() === 'APPROVED',
  ).length

  return (
    <section className="dashboard-page doctor-dashboard">
      <DashboardHeader
        title="Doctor Dashboard"
        subtitle="Review visits, update status, and issue prescriptions"
      />

      <div className="dashboard-stats">
        <div className="stat-card">
          <p className="stat-card__label">Total visits</p>
          <p className="stat-card__value">{appointments.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-card__label">Pending</p>
          <p className="stat-card__value">{pendingCount}</p>
        </div>
        <div className="stat-card stat-card--accent">
          <p className="stat-card__label">Approved</p>
          <p className="stat-card__value">{approvedCount}</p>
        </div>
        <div className="stat-card">
          <p className="stat-card__label">Prescriptions</p>
          <p className="stat-card__value">{prescriptions.length}</p>
        </div>
      </div>

      <div className="management-card">
        <div className="management-header">
          <p className="login-eyebrow">Doctor Dashboard</p>
          <h3>My appointments</h3>
          <p className="management-subtitle">
            Review visits for your patients and move each appointment through
            PENDING → APPROVED → COMPLETED. After completion you can issue a
            prescription.
          </p>
        </div>

        {toast ? <p className="success-text prescription-toast">{toast}</p> : null}
        {error && <p className="error-text">{error}</p>}

        {loading ? (
          <LoadingSpinner label="Loading appointments…" />
        ) : appointments.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No appointments yet"
            description="Patient visits will appear here once scheduled and assigned to you."
          />
        ) : (
          <div className="item-list">
            {appointments.map((appointment) => {
              const status = appointment.status.toUpperCase()
              const busy = updatingId === appointment.id
              const rx = prescriptionByAppointmentId.get(appointment.id)

              return (
                <article
                  key={appointment.id}
                  className="item-card appointment-card doctor-appointment-card"
                >
                  <div className="appointment-card-body">
                    <div className="appointment-card-row">
                      <h4>{appointment.patientName}</h4>
                      <StatusBadge status={appointment.status} />
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
                      {status === 'COMPLETED' && (
                        <>
                          {rx ? (
                            <button
                              type="button"
                              className="logout-button doctor-rx-button"
                              onClick={() => setViewPrescription(rx)}
                            >
                              View Prescription
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="primary-button doctor-rx-button"
                              onClick={() =>
                                setCreateForAppointmentId(appointment.id)
                              }
                            >
                              Create Prescription
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>

      {createForAppointmentId != null ? (
        <PrescriptionCreateModal
          appointmentId={createForAppointmentId}
          patientName={createAppointmentPatientName}
          medicines={medicines}
          onClose={() => setCreateForAppointmentId(null)}
          onSuccess={async () => {
            setToast('Prescription saved successfully.')
            await Promise.all([loadPrescriptions(), loadMedicines(), loadAppointments()])
          }}
        />
      ) : null}

      {viewPrescription ? (
        <PrescriptionViewModal
          prescription={viewPrescription}
          onClose={() => setViewPrescription(null)}
        />
      ) : null}
    </section>
  )
}
