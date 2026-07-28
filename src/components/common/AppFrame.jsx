/**
 * 모바일 앱 프레임
 * 데스크톱에서는 480px 폭의 기기 프레임처럼, 모바일에서는 전체 화면으로 보인다.
 */
export default function AppFrame({ children }) {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center sm:p-6">
      <div className="pointer-events-none fixed inset-0 hidden items-center justify-center sm:flex">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none text-center opacity-[0.07]">
          <div className="text-[22vw] font-black leading-none tracking-[-0.055em] text-brand-deep">
            다가감
          </div>
        </div>
      </div>

      <div
        className="relative flex h-dvh w-full max-w-[480px] flex-col overflow-hidden bg-cream sm:h-[min(880px,calc(100dvh-3rem))] sm:rounded-[2.5rem] sm:shadow-[0_30px_80px_-20px_rgba(43,58,74,0.45)] sm:ring-1 sm:ring-black/5"
      >
        {children}
      </div>
    </div>
  )
}
