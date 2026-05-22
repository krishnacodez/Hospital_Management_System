import { API_BASE } from '../auth/authApi'
import type {
  CreatePrescriptionRequest,
  MedicineOption,
  PrescriptionDto,
} from './types'

type ApiEnvelope<T> = {
  success?: boolean
  message?: string
  data?: T
}

function messageFromUnknownBody(body: unknown, fallback: string): string {
  if (body && typeof body === 'object') {
    const m = (body as { message?: string }).message
    if (typeof m === 'string' && m.trim() !== '') {
      return m
    }
  }
  return fallback
}

async function parseApiList<T>(response: Response): Promise<T[]> {
  const body = (await response.json()) as ApiEnvelope<T[]>
  if (!response.ok || body.success === false) {
    throw new Error(
      body.message || `Request failed (${response.status})`,
    )
  }
  const data = body.data
  return Array.isArray(data) ? data : []
}

export async function fetchMedicines(): Promise<MedicineOption[]> {
  const response = await fetch(`${API_BASE}/medicines`)
  return parseApiList<MedicineOption>(response)
}

export async function fetchPrescriptionsForDoctor(
  doctorId: number,
): Promise<PrescriptionDto[]> {
  const response = await fetch(`${API_BASE}/prescriptions/doctor/${doctorId}`)
  return parseApiList<PrescriptionDto>(response)
}

export async function fetchPrescriptionsForPatient(
  patientId: number,
): Promise<PrescriptionDto[]> {
  const response = await fetch(`${API_BASE}/prescriptions/patient/${patientId}`)
  if (response.status === 404) {
    return []
  }
  return parseApiList<PrescriptionDto>(response)
}

export async function createPrescription(
  payload: CreatePrescriptionRequest,
): Promise<PrescriptionDto> {
  const response = await fetch(`${API_BASE}/prescriptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const body = (await response.json()) as ApiEnvelope<PrescriptionDto>
  if (!response.ok) {
    throw new Error(
      messageFromUnknownBody(body, `Request failed (${response.status})`),
    )
  }
  if (body.success === false || body.data == null) {
    throw new Error(body.message || 'Failed to create prescription')
  }
  return body.data
}
