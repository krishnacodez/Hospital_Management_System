/** Extract a user-facing message from HMS API error bodies. */
export function readApiErrorMessage(
  data: unknown,
  fallback: string,
): string {
  if (!data || typeof data !== 'object') {
    return fallback
  }

  const record = data as Record<string, unknown>

  if (typeof record.message === 'string' && record.message.trim() !== '') {
    return record.message
  }

  if (typeof record.email === 'string' && record.email.trim() !== '') {
    return record.email
  }

  if (typeof record.name === 'string' && record.name.trim() !== '') {
    return record.name
  }

  const errors = record.errors
  if (errors && typeof errors === 'object') {
    const first = Object.values(errors as Record<string, unknown>).find(
      (value) => typeof value === 'string' && value.trim() !== '',
    )
    if (typeof first === 'string') {
      return first
    }
  }

  return fallback
}
