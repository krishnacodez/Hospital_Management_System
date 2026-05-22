export type Patient = {
  id: number
  name: string
  email: string
}

export type Doctor = {
  id: number
  name: string
  specialization: string | null
  /** When false, doctor is hidden from booking. Omitted/true = available. */
  available?: boolean | null
}

export type AppointmentRow = {
  id: number
  patientName: string
  doctorName: string
  reason: string
  status: string
  appointmentTime: string
}
