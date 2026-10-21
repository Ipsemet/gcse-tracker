/** Shared presentational primitives. */
import type { ReactNode, CSSProperties } from 'react'
import type { Rag } from '@/types/progress'

export const Card = ({ children, className = '', style }: { children: ReactNode; className?: string; style?: CSSProperties }) => (
  <div className={`card ${className}`} style={style}>{children}</div>
)

export const Pill = ({ children, tone = 'default', title }: {
  children: ReactNode
  tone?: 'default' | 'green' | 'amber' | 'red' | 'accent'
  title?: string
}) => <span className={`pill${tone === 'default' ? '' : ` pill-${tone}`}`} title={title}>{children}</span>

export const Bar = ({ value, tone, height = 7 }: { value: number; tone?: Rag | 'accent'; height?: number }) => (
  <div className="bar" style={{ height }}>
    <div
      className={`bar-fill${tone && tone !== 'accent' ? ` ${tone}` : ''}`}
      style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }}
    />
  </div>
)

export const Stat = ({ value, label, tone, sub }: {
  value: ReactNode
  label: string
  tone?: Rag | 'accent'
  sub?: ReactNode
}) => (
  <div className="card card-tight">
    <div className="stat-label">{label}</div>
    <div
      className="stat-value"
      style={{ color: tone ? `var(--${tone === 'accent' ? 'accent-bright' : tone})` : undefined }}
    >
      {value}
    </div>
    {sub ? <div className="tiny dim" style={{ marginTop: 2 }}>{sub}</div> : null}
  </div>
)

export const Empty = ({ icon = '🗒️', title, children }: { icon?: string; title: string; children?: ReactNode }) => (
  <div className="empty">
    <span className="empty-icon">{icon}</span>
    <div style={{ fontWeight: 650, color: 'var(--text-muted)', marginBottom: 4 }}>{title}</div>
    {children ? <div className="small">{children}</div> : null}
  </div>
)

export const Notice = ({ variant = 'info', icon, children }: {
  variant?: 'info' | 'warn' | 'danger'
  icon?: string
  children: ReactNode
}) => (
  <div className={`notice notice-${variant}`}>
    <span className="notice-icon">{icon ?? (variant === 'warn' ? '⚠️' : variant === 'danger' ? '🚫' : 'ℹ️')}</span>
    <div>{children}</div>
  </div>
)

export const Loading = ({ label = 'Loading…' }: { label?: string }) => (
  <div className="loading"><div className="spinner" /><div className="small">{label}</div></div>
)

export const RagDot = ({ rag, size = 9, title }: { rag: Rag | 'untouched'; size?: number; title?: string }) => (
  <span
    title={title}
    style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0, display: 'inline-block',
      background: rag === 'untouched' ? 'var(--surface-3)' : `var(--${rag})`,
      boxShadow: rag === 'untouched' ? 'none' : `0 0 8px var(--${rag})`,
      opacity: rag === 'untouched' ? 0.75 : 1,
    }}
  />
)

/** Circular progress ring, used for subject and level progress. */
export const Ring = ({ value, size = 54, stroke = 5, colour = 'var(--accent)', children }: {
  value: number
  size?: number
  stroke?: number
  colour?: string
  children?: ReactNode
}) => {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(1, value))
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={colour} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
          style={{ transition: 'stroke-dashoffset 0.55s cubic-bezier(0.22, 1, 0.36, 1)' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
        fontSize: size < 50 ? '0.7rem' : '0.8rem', fontWeight: 700, letterSpacing: '-0.02em',
      }}>
        {children}
      </div>
    </div>
  )
}

/** Confidence not yet set reads as "—", so an unrated point never looks like a zero. */
export const ConfidencePicker = ({ value, onChange }: {
  value: number | null
  onChange: (n: number) => void
}) => (
  <div className="row" style={{ gap: 6 }}>
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        onClick={() => onChange(n)}
        title={['No idea', 'Shaky', 'Getting there', 'Solid', 'Could teach it'][n - 1]}
        className="btn btn-sm"
        style={{
          minWidth: 36, padding: '5px 0',
          background: value !== null && n <= value ? 'var(--accent-dim)' : 'var(--surface-2)',
          borderColor: value !== null && n <= value ? 'var(--accent)' : 'var(--border-bright)',
          color: value !== null && n <= value ? 'var(--accent-bright)' : 'var(--text-dim)',
        }}
      >
        {n}
      </button>
    ))}
  </div>
)

export const SubjectBadge = ({ icon, colour, size = 34 }: { icon: string; colour: string; size?: number }) => (
  <div style={{
    width: size, height: size, borderRadius: size / 3.4, flexShrink: 0,
    display: 'grid', placeItems: 'center', fontSize: size * 0.46,
    background: `${colour}22`, border: `1px solid ${colour}55`,
  }}>
    {icon}
  </div>
)

/** Shown against any subject whose spec has not been checked against the board PDF. */
export const ConfidenceFlag = ({ confidence, note }: {
  confidence: 'confirmed' | 'provisional' | 'unconfirmed'
  note?: string | null
}) => {
  if (confidence === 'confirmed') return null
  return (
    <Pill tone={confidence === 'unconfirmed' ? 'red' : 'amber'} title={note ?? undefined}>
      {confidence === 'unconfirmed' ? 'Board unconfirmed' : 'Spec unverified'}
    </Pill>
  )
}
