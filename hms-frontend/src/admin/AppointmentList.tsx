import type { AppointmentRow } from './types'

type AppointmentListProps = {
  appointments: AppointmentRow[]
  isLoading: boolean
  deletingAppointmentId: number | null
  onDelete: (id: number) => void
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

export function AppointmentList({
  appointments,
  isLoading,
  deletingAppointmentId,
  onDelete,
}: AppointmentListProps) {
  if (isLoading) {
    return <p className="status-text">Loading appointments...</p>
  }

  if (appointments.length === 0) {
    return <p className="status-text">No appointments scheduled yet.</p>
  }

  return (
    <div className="item-list">
      {appointments.map((appointment) => (
        <article key={appointment.id} className="item-card appointment-card">
          <div className="appointment-card-body">
            <div className="appointment-card-row">
              <h4>{appointment.patientName}</h4>
              <span className={statusBadgeClass(appointment.status)}>
                {appointment.status}
              </span>
            </div>
            <p className="appointment-doctor">{appointment.doctorName}</p>
            <p className="appointment-meta">
              {formatAppointmentTime(appointment.appointmentTime)}
            </p>
            <p className="appointment-reason">{appointment.reason}</p>
          </div>
          <button
            type="button"
            className="delete-button"
            onClick={() => onDelete(appointment.id)}
            disabled={deletingAppointmentId === appointment.id}
          >
            {deletingAppointmentId === appointment.id ? 'Deleting...' : 'Delete'}
          </button>
        </article>
      ))}
    </div>
  )
}
