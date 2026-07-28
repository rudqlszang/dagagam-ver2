/**
 * 공통 UI 조각 모음
 * 아이 화면은 크고 둥글게, 부모/교사 화면은 같은 팔레트를 톤다운해 재사용한다.
 */

const VARIANTS = {
  primary: 'bg-brand text-white shadow-lg shadow-brand/30 active:bg-brand-deep',
  coral: 'bg-coral text-white shadow-lg shadow-coral/30 active:bg-coral-deep',
  sun: 'bg-sun text-ink shadow-lg shadow-sun/30 active:bg-sun-deep',
  mint: 'bg-mint text-white shadow-lg shadow-mint/30 active:bg-mint-deep',
  soft: 'bg-white text-ink border border-black/6 shadow-sm active:bg-paper',
  ghost: 'bg-transparent text-ink-soft active:bg-black/5',
  danger: 'bg-coral-soft text-coral-deep active:bg-coral/20',
}

const SIZES = {
  lg: 'h-14 px-6 text-[17px] rounded-2xl font-bold',
  md: 'h-12 px-5 text-[15px] rounded-xl font-bold',
  sm: 'h-9 px-3.5 text-[13px] rounded-lg font-semibold',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  full,
  children,
  ...rest
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 transition-transform duration-100 active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100 ${VARIANTS[variant]} ${SIZES[size]} ${full ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

export function Card({ className = '', children, ...rest }) {
  return (
    <div
      className={`rounded-3xl bg-white p-4 shadow-sm shadow-black/5 ring-1 ring-black/5 ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}

export function SectionTitle({ children, action }) {
  return (
    <div className="mb-2.5 flex items-end justify-between px-1">
      <h2 className="text-[15px] font-bold text-ink">{children}</h2>
      {action}
    </div>
  )
}

export function Chip({ children, className = '', tone = 'paper' }) {
  const tones = {
    paper: 'bg-paper text-ink-soft',
    brand: 'bg-brand-soft text-brand-deep',
    coral: 'bg-coral-soft text-coral-deep',
    mint: 'bg-mint-soft text-mint-deep',
    sun: 'bg-sun-soft text-sun-deep',
    grape: 'bg-grape-soft text-grape-deep',
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

export function Toggle({ checked, onChange, label, desc }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 py-2.5 text-left"
    >
      <span className="min-w-0">
        <span className="block text-[14px] font-semibold text-ink">{label}</span>
        {desc && <span className="mt-0.5 block text-[12px] text-ink-soft">{desc}</span>}
      </span>
      <span
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${checked ? 'bg-brand' : 'bg-ink-faint/40'}`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-6' : 'left-1'}`}
        />
      </span>
    </button>
  )
}

export function ProgressBar({ value, tone = 'brand', className = '' }) {
  const tones = {
    brand: 'bg-brand',
    coral: 'bg-coral',
    mint: 'bg-mint',
    sun: 'bg-sun',
    grape: 'bg-grape',
  }
  return (
    <div className={`h-2.5 w-full overflow-hidden rounded-full bg-black/6 ${className}`}>
      <div
        className={`h-full rounded-full transition-[width] duration-700 ease-out ${tones[tone]}`}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  )
}

export function StatTile({ label, value, unit, tone = 'brand', emoji }) {
  const tones = {
    brand: 'bg-brand-soft text-brand-deep',
    coral: 'bg-coral-soft text-coral-deep',
    mint: 'bg-mint-soft text-mint-deep',
    sun: 'bg-sun-soft text-sun-deep',
    grape: 'bg-grape-soft text-grape-deep',
  }
  return (
    <div className={`flex-1 rounded-2xl px-3 py-3 text-center ${tones[tone]}`}>
      {emoji && <div className="text-lg leading-none">{emoji}</div>}
      <div className="mt-1 text-[22px] font-extrabold leading-none tabular-nums">
        {value}
        {unit && <span className="ml-0.5 text-[12px] font-bold">{unit}</span>}
      </div>
      <div className="mt-1 text-[11px] font-semibold opacity-80">{label}</div>
    </div>
  )
}

export function EmptyState({ emoji = '🌤️', title, desc, action }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <div className="text-4xl">{emoji}</div>
      <p className="mt-3 text-[15px] font-bold text-ink">{title}</p>
      {desc && <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">{desc}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/** 하단에서 올라오는 시트 */
export function Sheet({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <button
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-ink/35 anim-fade-in"
      />
      <div className="anim-slide-up relative max-h-[82%] overflow-y-auto rounded-t-[2rem] bg-white p-5 pb-8 no-scrollbar">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-ink-faint/40" />
        {title && <h3 className="mb-3 text-[17px] font-bold text-ink">{title}</h3>}
        {children}
      </div>
    </div>
  )
}
