import { useState, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { MediSphereLogo } from './MediSphereLogo'

type Role = 'ADMIN' | 'DOCTOR' | 'PATIENT'

type NavItem = {
  to: string
  label: string
  icon: ReactNode
  roles: Role[] | 'public'
}

function IconLogin() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
    </svg>
  )
}

function IconAdmin() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z" />
    </svg>
  )
}

function IconDoctor() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}

function IconPatient() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
    </svg>
  )
}

const NAV_ITEMS: NavItem[] = [
  { to: '/login', label: 'Sign in', icon: <IconLogin />, roles: 'public' },
  {
    to: '/admin',
    label: 'Admin',
    icon: <IconAdmin />,
    roles: ['ADMIN'],
  },
  {
    to: '/doctor',
    label: 'Doctor',
    icon: <IconDoctor />,
    roles: ['DOCTOR'],
  },
  {
    to: '/patient',
    label: 'Patient',
    icon: <IconPatient />,
    roles: ['PATIENT'],
  },
]

function resolveRole(): Role | null {
  const r = localStorage.getItem('role')
  if (r === 'ADMIN' || r === 'DOCTOR' || r === 'PATIENT') {
    return r
  }
  return null
}

export function Sidebar() {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const role = resolveRole()
  const isLogin = location.pathname === '/login' || location.pathname === '/'

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.roles === 'public') {
      return !role
    }
    return role !== null && item.roles.includes(role)
  })

  const displayName = localStorage.getItem('name')
  const roleLabel = role
    ? role.charAt(0) + role.slice(1).toLowerCase()
    : null

  return (
    <>
      <button
        type="button"
        className="sidebar-mobile-toggle"
        aria-label="Open menu"
        onClick={() => setMobileOpen(true)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>

      {mobileOpen ? (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}${mobileOpen ? ' sidebar--mobile-open' : ''}${isLogin ? ' sidebar--login' : ''}`}
      >
        <div className="sidebar__brand">
          <MediSphereLogo size={collapsed ? 'sm' : 'md'} showText={!collapsed} />
          {!isLogin ? (
            <button
              type="button"
              className="sidebar__collapse-btn"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              onClick={() => setCollapsed((c) => !c)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d={collapsed ? 'M9 18l6-6-6-6' : 'M15 18l-6-6 6-6'} />
              </svg>
            </button>
          ) : null}
        </div>

        {!collapsed && !isLogin ? (
          <p className="sidebar__tagline">AI-powered healthcare</p>
        ) : null}

        {role && displayName && !collapsed ? (
          <div className="sidebar__user">
            <span className="sidebar__user-avatar" aria-hidden>
              {displayName.charAt(0).toUpperCase()}
            </span>
            <div className="sidebar__user-info">
              <span className="sidebar__user-name">{displayName}</span>
              {roleLabel ? (
                <span className="sidebar__user-role">{roleLabel}</span>
              ) : null}
            </div>
          </div>
        ) : null}

        <nav className="sidebar__nav">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
              }
              title={collapsed ? item.label : undefined}
              onClick={() => setMobileOpen(false)}
            >
              <span className="sidebar__link-icon">{item.icon}</span>
              {!collapsed ? (
                <span className="sidebar__link-label">{item.label}</span>
              ) : null}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          {!collapsed ? (
            <p className="sidebar__footer-text">© MediSphere</p>
          ) : null}
        </div>
      </aside>
    </>
  )
}
