type LoadingSpinnerProps = {
  label?: string
  size?: 'sm' | 'md'
}

export function LoadingSpinner({
  label = 'Loading…',
  size = 'md',
}: LoadingSpinnerProps) {
  return (
    <div
      className={`loading-state loading-state--${size}`}
      role="status"
      aria-live="polite"
    >
      <span className="loading-spinner" aria-hidden />
      <span className="loading-state__label">{label}</span>
    </div>
  )
}
