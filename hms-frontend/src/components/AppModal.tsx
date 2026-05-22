import type { ReactNode } from 'react'
import { useEffect } from 'react'

type AppModalProps = {
  title: string
  children: ReactNode
  footer?: ReactNode
  onClose: () => void
  /** Wider panel for forms */
  wide?: boolean
}

export function AppModal({
  title,
  children,
  footer,
  onClose,
  wide,
}: AppModalProps) {
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  return (
    <div
      className="app-modal-backdrop"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          onClose()
        }
      }}
      role="presentation"
    >
      <div
        className={`app-modal-panel${wide ? ' app-modal-panel--wide' : ''}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-modal-title"
      >
        <header className="app-modal-header">
          <h3 id="app-modal-title">{title}</h3>
          <button
            type="button"
            className="app-modal-close"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </header>
        <div className="app-modal-body">{children}</div>
        {footer ? <footer className="app-modal-footer">{footer}</footer> : null}
      </div>
    </div>
  )
}
