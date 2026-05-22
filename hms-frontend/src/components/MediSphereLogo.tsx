type MediSphereLogoProps = {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

const sizeMap = {
  sm: { img: 32, text: '0.95rem' },
  md: { img: 40, text: '1.15rem' },
  lg: { img: 56, text: '1.5rem' },
}

export function MediSphereLogo({
  size = 'md',
  showText = true,
  className = '',
}: MediSphereLogoProps) {
  const dims = sizeMap[size]

  return (
    <div className={`medisphere-logo ${className}`.trim()}>
      <img
        src="/medisphere-logo.svg"
        alt="MediSphere"
        width={dims.img}
        height={dims.img}
        className="medisphere-logo__img"
      />
      {showText ? (
        <span
          className="medisphere-logo__text"
          style={{ fontSize: dims.text }}
        >
          MediSphere
        </span>
      ) : null}
    </div>
  )
}
