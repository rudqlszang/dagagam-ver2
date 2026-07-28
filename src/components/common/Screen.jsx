import { useNavigate } from 'react-router-dom'

/**
 * 화면 공통 레이아웃 — 상단 헤더 + 스크롤 본문
 * tone: 'child'(밝고 따뜻) | 'admin'(부모·교사, 톤다운)
 */
export default function Screen({
  title,
  subtitle,
  back,
  right,
  tone = 'child',
  padded = true,
  children,
}) {
  const navigate = useNavigate()

  const headerBg =
    tone === 'child'
      ? 'bg-cream/85 border-black/5'
      : 'bg-white/90 border-black/6'

  return (
    <div className={`flex h-full min-h-0 flex-col ${tone === 'child' ? 'bg-cream' : 'bg-paper'}`}>
      {(title || back) && (
        <header
          className={`sticky top-0 z-20 flex shrink-0 items-center gap-2 border-b px-4 pb-3 pt-[max(0.9rem,env(safe-area-inset-top))] backdrop-blur-md ${headerBg}`}
        >
          {back && (
            <button
              onClick={() => (typeof back === 'string' ? navigate(back) : navigate(-1))}
              aria-label="뒤로"
              className="-ml-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-soft active:bg-black/5"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[17px] font-extrabold text-ink">{title}</h1>
            {subtitle && (
              <p className="truncate text-[12px] text-ink-soft">{subtitle}</p>
            )}
          </div>
          {right}
        </header>
      )}

      <main
        className={`min-h-0 flex-1 overflow-y-auto no-scrollbar ${padded ? 'px-4 py-4' : ''}`}
      >
        {children}
      </main>
    </div>
  )
}
