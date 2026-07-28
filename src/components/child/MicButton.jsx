import Icon from '../common/Icon'

/**
 * 누르고 말하기 버튼
 * status: 'idle' | 'listening' | 'busy'
 */
export default function MicButton({ status, disabled, onStart, onStop }) {
  const listening = status === 'listening'
  const busy = status === 'busy'
  const off = disabled || busy

  const handlers = off
    ? {}
    : {
        onPointerDown: (e) => {
          e.preventDefault()
          onStart()
        },
        onPointerUp: (e) => {
          e.preventDefault()
          onStop()
        },
        onPointerLeave: () => listening && onStop(),
        onPointerCancel: () => listening && onStop(),
      }

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex h-[92px] w-[92px] items-center justify-center">
        {listening && (
          <>
            <span className="anim-mic-ripple absolute inset-0 rounded-full bg-coral/40" />
            <span
              className="anim-mic-ripple absolute inset-0 rounded-full bg-coral/40"
              style={{ animationDelay: '0.45s' }}
            />
          </>
        )}

        <button
          {...handlers}
          disabled={off}
          aria-label={listening ? '말하는 중 — 손을 떼면 끝나요' : '누르고 말하기'}
          className={`relative flex h-[84px] w-[84px] touch-none select-none items-center justify-center rounded-full text-white transition-all duration-150 ${
            listening
              ? 'scale-110 bg-coral shadow-xl shadow-coral/40'
              : off
                ? 'bg-ink-faint/50 shadow-none'
                : 'bg-brand shadow-xl shadow-brand/35 active:scale-95'
          }`}
        >
          {listening ? (
            <span className="flex items-end gap-[3px]">
              {[0, 1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className="anim-bar w-[3.5px] rounded-full bg-white"
                  style={{ height: 26, animationDelay: `${i * 0.11}s` }}
                />
              ))}
            </span>
          ) : (
            <Icon name="mic" className="h-9 w-9" strokeWidth={1.9} />
          )}
        </button>
      </div>

      <p
        className={`mt-2 text-[12.5px] font-bold transition-colors ${
          listening ? 'text-coral-deep' : off ? 'text-ink-faint' : 'text-ink-soft'
        }`}
      >
        {listening
          ? '듣고 있어요… 손을 떼면 끝!'
          : busy
            ? '친구가 말하는 중이에요'
            : '꾹 누르고 말해 보세요'}
      </p>
    </div>
  )
}
