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
    return <p className="status-text">Loading patients...</p>
  }

  if (patients.length === 0) {
    return <p className="status-text">No patients found yet.</p>
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

