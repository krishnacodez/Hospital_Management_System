import { EmptyState } from '../components/EmptyState'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { StatusBadge } from '../components/StatusBadge'
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

export function AppointmentList({
  appointments,
  isLoading,
  deletingAppointmentId,
  onDelete,
}: AppointmentListProps) {
  if (isLoading) {
    return <LoadingSpinner label="Loading appointments…" />
  }

  if (appointments.length === 0) {
    return (
      <EmptyState
        icon="📅"
        title="No appointments scheduled"
        description="Create an appointment by linking a patient and doctor."
      />
    )
  }

  return (
    <div className="item-list">
      {appointments.map((appointment) => (
        <article key={appointment.id} className="item-card appointment-card">
          <div className="appointment-card-body">
            <div className="appointment-card-row">
              <h4>{appointment.patientName}</h4>
              <StatusBadge status={appointment.status} />
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
