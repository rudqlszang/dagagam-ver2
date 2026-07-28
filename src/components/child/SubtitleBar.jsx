import { getCharacter } from '../../mock/characters'

/**
 * 실시간 자막
 *  - 내가 말하는 중: 인식되는 글자가 실시간으로 흐른다
 *  - 친구가 말하는 중: 대사가 표시된다
 *  설정에서 끄면 이 영역 대신 "자막 켜기" 안내만 남는다.
 */
export default function SubtitleBar({
  enabled,
  interim,
  subtitle,
  nickname,
  onEnable,
}) {
  if (!enabled) {
    return (
      <div className="flex min-h-[58px] items-center justify-center px-4">
        <button
          onClick={onEnable}
          className="rounded-full bg-white/70 px-3.5 py-1.5 text-[11.5px] font-semibold text-ink-soft shadow-sm active:bg-white"
        >
          자막 켜기
        </button>
      </div>
    )
  }

  const active = interim || subtitle
  if (!active) {
    return <div className="min-h-[58px]" />
  }

  const who = interim
    ? { name: nickname, chip: 'bg-sun-soft text-sun-deep' }
    : subtitle.by === 'user'
      ? { name: nickname, chip: 'bg-sun-soft text-sun-deep' }
      : {
          name: getCharacter(subtitle.by).name,
          chip: getCharacter(subtitle.by).theme.chip,
        }

  return (
    <div className="flex min-h-[58px] items-start justify-center px-4">
      <div
        key={interim ? 'interim' : `${subtitle.by}-${subtitle.text}`}
        className="anim-fade-in flex w-full max-w-[380px] items-start gap-2 rounded-2xl bg-ink/85 px-3.5 py-2.5 backdrop-blur"
      >
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-bold ${who.chip}`}
        >
          {who.name}
        </span>
        <p className="min-w-0 flex-1 text-[13.5px] font-medium leading-snug text-white">
          {interim || subtitle.text}
          {interim && <span className="ml-0.5 animate-pulse">▍</span>}
        </p>
      </div>
    </div>
  )
}
