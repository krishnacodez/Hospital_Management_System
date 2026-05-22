export type MedicineOption = {
  id: number
  name: string
  manufacturer?: string
  price?: number
  stock: number
}

export type PrescriptionMedicineLine = {
  medicineName: string
  dosage: string
  quantity: number
}

export type PrescriptionDto = {
  id: number
  appointmentId?: number | null
  createdAt?: string | null
  patientName: string
  doctorName: string
  diagnosis: string
  notes?: string | null
  medicines: PrescriptionMedicineLine[]
}

export type PrescriptionMedicineItemRequest = {
  medicineId: number
  dosage: string
  quantity: number
}

export type CreatePrescriptionRequest = {
  appointmentId: number
  diagnosis: string
  notes: string
  medicines: PrescriptionMedicineItemRequest[]
}
