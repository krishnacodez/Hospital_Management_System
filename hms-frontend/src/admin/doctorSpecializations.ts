export const DOCTOR_SPECIALIZATION_OPTIONS = [
  'Cardiologist',
  'Dermatologist',
  'Neurologist',
  'Orthopedic',
  'General Physician',
  'Pediatrician',
  'Pulmonologist',
  'Gastroenterologist',
  'Ophthalmologist',
] as const

export type DoctorSpecializationOption =
  (typeof DOCTOR_SPECIALIZATION_OPTIONS)[number]
