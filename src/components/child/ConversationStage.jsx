import Avatar from '../common/Avatar'

/**
 * 셋이 둘러앉아 대화하는 무대
 *  ┌──────────────────┐
 *  │  짝꿍     함께    │   ← 아이가 고른 AI 친구 둘 (store/useStore의 useCast)
 *  │        나         │   ← 사용자
 *  └──────────────────┘
 *
 * "말하는 중"은 입모양 대신 아바타 확대 + 테두리 펄스 글로우로 표현한다.
 */

function SpeakingAvatar({
  src,
  name,
  size,
  speaking,
  listening,
  theme,
  bubble,
  bubblePosition = 'top',
  muted,
}) {
  const active = speaking || listening
  return (
    <div className="relative flex flex-col items-center">
      {/* 말풍선 */}
      {bubble && (
        <div
          className={`anim-pop absolute z-20 w-[168px] ${
            bubblePosition === 'top' ? 'bottom-[calc(100%+10px)]' : 'top-[calc(100%+34px)]'
          }`}
        >
          <div
            className={`rounded-2xl px-3 py-2 text-center text-[12.5px] font-semibold leading-snug text-ink shadow-sm ring-1 ring-black/5 ${theme?.bubble ?? 'bg-white'}`}
          >
            {bubble}
          </div>
        </div>
      )}

      <div className="relative" style={{ width: size, height: size }}>
        {/* 펄스 글로우 링 */}
        {active && (
          <>
            <span
              className={`anim-glow-ring absolute inset-0 rounded-full ${theme?.glow ?? 'bg-brand/45'}`}
            />
            <span
              className={`anim-glow-ring absolute inset-0 rounded-full ${theme?.glow ?? 'bg-brand/45'}`}
              style={{ animationDelay: '0.55s' }}
            />
          </>
        )}

        <div
          className={`relative transition-all duration-300 ${
            speaking ? 'anim-speaking' : listening ? 'scale-105' : muted ? 'scale-95 opacity-55' : 'anim-float'
          }`}
        >
          <Avatar
            src={src}
            name={name}
            size={size}
            className={`ring-4 transition-colors ${
              active ? (theme?.ring ?? 'ring-brand') : 'ring-white'
            } shadow-lg shadow-ink/10`}
          />
        </div>
      </div>

      {/* 이름표 */}
      <span
        className={`mt-2 rounded-full px-2.5 py-0.5 text-[11.5px] font-bold transition-colors ${
          active ? (theme?.chip ?? 'bg-brand-soft text-brand-deep') : 'bg-white/70 text-ink-soft'
        }`}
      >
        {name}
      </span>
    </div>
  )
}

export default function ConversationStage({
  characters, // [{ id, name, avatarUrl, theme }]
  speakingId, // 지금 말하고 있는 캐릭터 id ('user' 포함)
  listening, // 사용자가 마이크를 누르고 있는지
  user, // { name, avatarUrl }
  bubbles, // { [id]: string } — 자막이 켜져 있을 때만 채워진다
  thinking,
}) {
  const [left, right] = characters

  return (
    <div className="relative mx-auto w-full max-w-[360px] px-4">
      {/* 배경 원 — 둘러앉은 테이블 느낌 */}
      <div className="pointer-events-none absolute left-1/2 top-[38%] h-[210px] w-[210px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-brand/15" />

      <div className="relative flex items-start justify-between px-1 pt-14">
        <SpeakingAvatar
          src={left.avatarUrl}
          name={left.name}
          size={86}
          theme={left.theme}
          speaking={speakingId === left.id}
          muted={Boolean(speakingId) && speakingId !== left.id}
          bubble={bubbles?.[left.id]}
        />
        <SpeakingAvatar
          src={right.avatarUrl}
          name={right.name}
          size={86}
          theme={right.theme}
          speaking={speakingId === right.id}
          muted={Boolean(speakingId) && speakingId !== right.id}
          bubble={bubbles?.[right.id]}
        />
      </div>

      {/* 가운데 상태 표시 */}
      <div className="relative -mt-2 flex h-8 items-center justify-center">
        {thinking && (
          <div className="anim-fade-in flex items-center gap-1 rounded-full bg-white/80 px-3 py-1.5 shadow-sm">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="anim-bar h-1.5 w-1.5 rounded-full bg-ink-faint"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="relative mt-1 flex justify-center">
        <SpeakingAvatar
          src={user.avatarUrl}
          name={user.name}
          size={78}
          theme={{
            ring: 'ring-sun',
            glow: 'bg-sun/45',
            chip: 'bg-sun-soft text-sun-deep',
            bubble: 'bg-sun-soft',
          }}
          speaking={speakingId === 'user'}
          listening={listening}
          muted={Boolean(speakingId) && speakingId !== 'user'}
          bubble={bubbles?.user}
          bubblePosition="top"
        />
      </div>
    </div>
  )
}
