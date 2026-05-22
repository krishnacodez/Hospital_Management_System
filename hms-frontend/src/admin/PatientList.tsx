import { EmptyState } from '../components/EmptyState'
import { LoadingSpinner } from '../components/LoadingSpinner'
import type { Patient } from './types'

type PatientListProps = {
  patients: Patient[]
  isLoading: boolean
  deletingPatientId: number | null
  onDelete: (id: number) => void
}

export function PatientList({
  patients,
  isLoading,
  deletingPatientId,
  onDelete,
}: PatientListProps) {
  if (isLoading) {
    return <LoadingSpinner label="Loading patients…" />
  }

  if (patients.length === 0) {
    return (
      <EmptyState
        icon="👥"
        title="No patients yet"
        description="Add your first patient using the form above."
      />
    )
  }

  return (
    <div className="item-list">
      {patients.map((patient) => (
        <article key={patient.id} className="item-card">
          <div>
            <h4>{patient.name}</h4>
            <p>{patient.email}</p>
          </div>
          <button
            type="button"
            className="delete-button"
            onClick={() => onDelete(patient.id)}
            disabled={deletingPatientId === patient.id}
          >
            {deletingPatientId === patient.id ? 'Deleting...' : 'Delete'}
          </button>
        </article>
      ))}
    </div>
  )
}

