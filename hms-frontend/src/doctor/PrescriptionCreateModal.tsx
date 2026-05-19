import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { AppModal } from '../components/AppModal'
import { createPrescription } from '../prescription/prescriptionApi'
import type {
  CreatePrescriptionRequest,
  MedicineOption,
} from '../prescription/types'

type Row = {
  id: string
  medicineId: string
  dosage: string
  quantity: string
}

function newRow(): Row {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    medicineId: '',
    dosage: '',
    quantity: '',
  }
}

type PrescriptionCreateModalProps = {
  appointmentId: number
  patientName: string
  medicines: MedicineOption[]
  onClose: () => void
  onSuccess: () => void
}

export function PrescriptionCreateModal({
  appointmentId,
  patientName,
  medicines,
  onClose,
  onSuccess,
}: PrescriptionCreateModalProps) {
  const [diagnosis, setDiagnosis] = useState('')
  const [notes, setNotes] = useState('')
  const [rows, setRows] = useState<Row[]>([newRow()])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const medicineById = useMemo(() => {
    const m = new Map<number, MedicineOption>()
    for (const med of medicines) {
      m.set(med.id, med)
    }
    return m
  }, [medicines])

  const addRow = () => {
    setRows((prev) => [...prev, newRow()])
  }

  const removeRow = (rowId: string) => {
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== rowId)))
  }

  const updateRow = (rowId: string, patch: Partial<Omit<Row, 'id'>>) => {
    setRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, ...patch } : r)),
    )
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    const diag = diagnosis.trim()
    if (!diag) {
      setError('Diagnosis is required.')
      return
    }

    const items: CreatePrescriptionRequest['medicines'] = []
    for (const row of rows) {
      const mid = Number(row.medicineId)
      const qty = Number.parseInt(row.quantity, 10)
      const dosage = row.dosage.trim()
      if (!Number.isFinite(mid) || mid <= 0) {
        setError('Each row must have a medicine selected.')
        return
      }
      if (!dosage) {
        setError('Dosage is required for each medicine.')
        return
      }
      if (!Number.isFinite(qty) || qty < 1) {
        setError('Quantity must be a positive whole number for each medicine.')
        return
      }
      const stock = medicineById.get(mid)?.stock ?? 0
      if (qty > stock) {
        const name = medicineById.get(mid)?.name ?? 'Medicine'
        setError(`Quantity for ${name} cannot exceed stock (${stock}).`)
        return
      }
      items.push({ medicineId: mid, dosage, quantity: qty })
    }

    if (items.length === 0) {
      setError('Add at least one medicine.')
      return
    }

    try {
      setSubmitting(true)
      await createPrescription({
        appointmentId,
        diagnosis: diag,
        notes: notes.trim(),
        medicines: items,
      })
      onSuccess()
      onClose()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not save prescription.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppModal
      wide
      title="Create prescription"
      onClose={onClose}
      footer={
        <div className="app-modal-footer-actions">
          <button type="button" className="logout-button" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            form="prescription-create-form"
            className="primary-button"
            disabled={submitting}
          >
            {submitting ? 'Saving…' : 'Save prescription'}
          </button>
        </div>
      }
    >
      <form id="prescription-create-form" onSubmit={handleSubmit}>
        <p className="prescription-modal-patient">
          Patient: <strong>{patientName}</strong>
        </p>
        {error ? <p className="error-text">{error}</p> : null}
        <label className="prescription-field-label" htmlFor="rx-diagnosis">
          Diagnosis
        </label>
        <textarea
          id="rx-diagnosis"
          className="prescription-textarea"
          rows={3}
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          placeholder="Clinical diagnosis"
          required
        />
        <label className="prescription-field-label" htmlFor="rx-notes">
          Doctor notes
        </label>
        <textarea
          id="rx-notes"
          className="prescription-textarea"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Care instructions (optional)"
        />

        <div className="prescription-meds-header">
          <span className="prescription-field-label">Medicines</span>
          <button type="button" className="link-button" onClick={addRow}>
            + Add medicine
          </button>
        </div>

        <div className="prescription-med-rows">
          {rows.map((row) => {
            const med = row.medicineId
              ? medicineById.get(Number(row.medicineId))
              : undefined
            return (
              <div key={row.id} className="prescription-med-row">
                <div className="prescription-med-row-grid">
                  <select
                    aria-label="Medicine"
                    value={row.medicineId}
                    onChange={(e) =>
                      updateRow(row.id, { medicineId: e.target.value })
                    }
                    required
                  >
                    <option value="">Select medicine</option>
                    {medicines.map((m) => (
                      <option key={m.id} value={String(m.id)}>
                        {m.name} (Stock: {m.stock})
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Dosage e.g. 500mg twice daily"
                    value={row.dosage}
                    onChange={(e) =>
                      updateRow(row.id, { dosage: e.target.value })
                    }
                    required
                  />
                  <input
                    type="number"
                    min={1}
                    placeholder="Qty"
                    value={row.quantity}
                    onChange={(e) =>
                      updateRow(row.id, { quantity: e.target.value })
                    }
                    required
                  />
                  <button
                    type="button"
                    className="delete-button prescription-row-remove"
                    disabled={rows.length <= 1}
                    onClick={() => removeRow(row.id)}
                    aria-label="Remove medicine row"
                  >
                    Remove
                  </button>
                </div>
                {med ? (
                  <p
                    className={
                      Number(row.quantity) > med.stock
                        ? 'prescription-stock-warn'
                        : 'prescription-stock-ok'
                    }
                  >
                    Stock: {med.stock}
                    {Number(row.quantity) > med.stock
                      ? ' — quantity exceeds stock'
                      : null}
                  </p>
                ) : null}
              </div>
            )
          })}
        </div>
      </form>
    </AppModal>
  )
}
