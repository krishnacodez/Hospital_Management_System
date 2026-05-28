const BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "https://hospital-management-system-3hsa.onrender.com"
).replace(/\/+$/, "");

export const API_BASE = BASE_URL

export type LoginRole = 'ADMIN' | 'DOCTOR' | 'PATIENT'

export type LoginResponseData = {
  role: LoginRole
  doctorId?: number | null
  patientId?: number | null
  name?: string | null
}

export type RegisterPatientRequest = {
  name: string
  email: string
  password: string
  age: number
  gender: string
  phone: string
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

export async function registerPatientRequest(
  payload: RegisterPatientRequest,
): Promise<void> {
  const response = await fetch(`${API_BASE}/auth/register/patient`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const body = (await response.json()) as ApiEnvelope<unknown> & {
    errors?: Record<string, string>
  }

  if (!response.ok || body.success === false) {
    if (body.errors) {
      const first = Object.values(body.errors)[0]
      throw new Error(first || body.message || 'Registration failed')
    }
    throw new Error(body.message || 'Registration failed')
  }
}
