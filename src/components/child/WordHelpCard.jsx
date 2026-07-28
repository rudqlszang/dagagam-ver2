/**
 * 어려운 말이 나오면 살짝 떠오르는 "쉬운 설명 카드"
 */
export default function WordHelpCard({ card, onClose }) {
  if (!card) return null

  return (
    <div className="pointer-events-none absolute inset-x-0 top-3 z-40 flex justify-center px-4">
      <button
        onClick={onClose}
        className="anim-pop pointer-events-auto w-full max-w-[340px] rounded-3xl bg-white/95 p-3.5 text-left shadow-xl shadow-ink/10 ring-1 ring-grape/25 backdrop-blur"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-grape-soft text-xl">
            {card.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="rounded-full bg-grape-soft px-2 py-0.5 text-[10px] font-bold text-grape-deep">
                쉬운 말
              </span>
              <span className="truncate text-[15px] font-extrabold text-ink">
                {card.word}
              </span>
            </div>
            <p className="mt-1 text-[13px] font-semibold leading-snug text-ink">
              {card.easy}
            </p>
            <p className="mt-0.5 text-[11.5px] text-ink-soft">{card.example}</p>
          </div>
        </div>
      </button>
    </div>
  )
}
