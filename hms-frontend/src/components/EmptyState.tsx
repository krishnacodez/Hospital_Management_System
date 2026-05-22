type EmptyStateProps = {
  icon?: string
  title: string
  description?: string
}

export function EmptyState({ icon = '📋', title, description }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon" aria-hidden>
        {icon}
      </span>
      <p className="empty-state__title">{title}</p>
      {description ? (
        <p className="empty-state__desc">{description}</p>
      ) : null}
    </div>
  )
}
