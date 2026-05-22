export const API_BASE = 'http://localhost:8080'

export type LoginRole = 'ADMIN' | 'DOCTOR' | 'PATIENT'

export type LoginResponseData = {
  role: LoginRole
  doctorId?: number | null
  patientId?: number | null
  name?: string | null
}

type ApiEnvelope<T> = {
  success: boolean
  message?: string
  data?: T | null
}

export async function loginRequest(
  email: string,
  password: string,
): Promise<LoginResponseData> {
  const response = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  const body = (await response.json()) as ApiEnvelope<LoginResponseData>

  if (!response.ok || body.success === false) {
    throw new Error(body.message || 'Invalid credentials')
  }

  if (!body.data || !body.data.role) {
    throw new Error('Invalid credentials')
  }

  return body.data
}

export function persistAuthSession(data: LoginResponseData) {
  localStorage.setItem('role', data.role)
  if (data.doctorId != null && data.doctorId !== undefined) {
    localStorage.setItem('doctorId', String(data.doctorId))
  } else {
    localStorage.removeItem('doctorId')
  }
  if (data.patientId != null && data.patientId !== undefined) {
    localStorage.setItem('patientId', String(data.patientId))
  } else {
    localStorage.removeItem('patientId')
  }
  if (data.name) {
    localStorage.setItem('name', data.name)
  } else {
    localStorage.removeItem('name')
  }
}
