import { EmptyState } from '../components/EmptyState'
import { LoadingSpinner } from '../components/LoadingSpinner'
import type { Doctor } from './types'

type DoctorListProps = {
  doctors: Doctor[]
  isLoading: boolean
  deletingDoctorId: number | null
  onDelete: (id: number) => void
}

export function DoctorList({
  doctors,
  isLoading,
  deletingDoctorId,
  onDelete,
}: DoctorListProps) {
  if (isLoading) {
    return <LoadingSpinner label="Loading doctors…" />
  }

  if (doctors.length === 0) {
    return (
      <EmptyState
        icon="🩺"
        title="No doctors yet"
        description="Register doctors to enable appointments and prescriptions."
      />
    )
  }

  return (
    <div className="item-list">
      {doctors.map((doctor) => (
        <article key={doctor.id} className="item-card">
          <div>
            <h4>{doctor.name}</h4>
            <p>{doctor.specialization || '—'}</p>
          </div>
          <button
            type="button"
            className="delete-button"
            onClick={() => onDelete(doctor.id)}
            disabled={deletingDoctorId === doctor.id}
          >
            {deletingDoctorId === doctor.id ? 'Deleting...' : 'Delete'}
          </button>
        </article>
      ))}
    </div>
  )
}

