import type { AppointmentRow } from './types'
import { API_BASE } from '../auth/authApi'

type PaginatedAppointments = {
  content: AppointmentRow[]
  totalPages: number
}

type ApiEnvelope<T> = {
  success?: boolean
  data?: T
}

export async function fetchAllAppointments(): Promise<AppointmentRow[]> {
  const pageSize = 50
  let page = 0
  const all: AppointmentRow[] = []

  for (;;) {
    const response = await fetch(
      `${API_BASE}/appointments?page=${page}&size=${pageSize}`,
    )
    if (!response.ok) {
      throw new Error('Failed to load appointments.')
    }

    const body = (await response.json()) as ApiEnvelope<PaginatedAppointments>
    const chunk = body.data?.content ?? []
    all.push(...chunk)

    const totalPages = body.data?.totalPages ?? 1
    page += 1
    if (page >= totalPages) {
      break
    }
  }

  return all
}
