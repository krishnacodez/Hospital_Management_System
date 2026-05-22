import { AppModal } from './AppModal'
import type { PrescriptionDto } from '../prescription/types'

function formatRxDate(iso: string | null | undefined): string {
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

type PrescriptionViewModalProps = {
  prescription: PrescriptionDto
  onClose: () => void
}

export function PrescriptionViewModal({
  prescription,
  onClose,
}: PrescriptionViewModalProps) {
  return (
    <AppModal
      wide
      title="Prescription"
      onClose={onClose}
      footer={
        <button type="button" className="primary-button" onClick={onClose}>
          Close
        </button>
      }
    >
      <p className="prescription-modal-eyebrow">Clinical record · MediSphere</p>
      <div className="prescription-view-grid">
        <div className="prescription-view-card">
          <span className="prescription-view-label">Doctor</span>
          <p className="prescription-view-value">{prescription.doctorName}</p>
        </div>
        <div className="prescription-view-card">
          <span className="prescription-view-label">Patient</span>
          <p className="prescription-view-value">{prescription.patientName}</p>
        </div>
        <div className="prescription-view-card">
          <span className="prescription-view-label">Issued</span>
          <p className="prescription-view-value">
            {formatRxDate(prescription.createdAt ?? null)}
          </p>
        </div>
      </div>
      <div className="prescription-view-block">
        <span className="prescription-view-label">Diagnosis</span>
        <p className="prescription-view-value">{prescription.diagnosis}</p>
      </div>
      {prescription.notes ? (
        <div className="prescription-view-block">
          <span className="prescription-view-label">Clinical notes</span>
          <p className="prescription-view-value">{prescription.notes}</p>
        </div>
      ) : null}
      <div className="prescription-view-block">
        <span className="prescription-view-label">
          Medicines ({prescription.medicines.length})
        </span>
        <ul className="prescription-medicine-list">
          {prescription.medicines.map((m, index) => (
            <li key={`${m.medicineName}-${index}`}>
              <strong>{m.medicineName}</strong>
              <div className="prescription-medicine-detail">
                Dosage: {m.dosage}
                <br />
                Quantity: {m.quantity}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </AppModal>
  )
}
