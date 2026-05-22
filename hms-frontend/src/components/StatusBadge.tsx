type StatusBadgeProps = {
  status: string
  className?: string
}

export function statusBadgeClass(status: string): string {
  const normalized = status.toUpperCase()
  if (normalized === 'PENDING') {
    return 'status-badge status-badge--pending'
  }
  if (normalized === 'APPROVED') {
    return 'status-badge status-badge--approved'
  }
  if (normalized === 'COMPLETED') {
    return 'status-badge status-badge--completed'
  }
  return 'status-badge'
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  return (
    <span className={`${statusBadgeClass(status)} ${className}`.trim()}>
      {status}
    </span>
  )
}
