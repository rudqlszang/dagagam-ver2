import { useNavigate, useParams } from 'react-router-dom'
import Screen from '../../components/common/Screen'
import PlaceBackground from '../../components/child/PlaceBackground'
import { PLACES, getPlace } from '../../mock/places'
import { useStore } from '../../store/useStore'
import { unlockAudio } from '../../lib/voiceEngine'

/**
 * 장소 고르기 → 주제 고르기
 *
 * ver1은 미션 6개가 한 줄로 나열돼 있었다. 아이 입장에서는 "조별과제 시뮬레이션"이
 * 무슨 상황인지 글자만 보고 떠올려야 했다. 지금은 학교 안 장소를 먼저 고르게 해서
 * 그림으로 상황이 먼저 들어오게 했다.
 *
 * 같은 컴포넌트가 두 화면을 담당한다.
 *   /child/places            장소 세 곳
 *   /child/places/:placeId   그 장소의 주제들
 */
export default function PlacePicker() {
  const { placeId } = useParams()
  const navigate = useNavigate()
  const sessions = useStore((s) => s.sessions)
  const doneIds = new Set(sessions.map((s) => s.missionId))

  /* ── 주제 고르기 ── */
  if (placeId) {
    const place = getPlace(placeId)

    return (
      <Screen title={`${place.emoji} ${place.name}`} subtitle="무슨 이야기를 해 볼까?" back="/child/places">
        <div className="relative mb-4 h-[132px] overflow-hidden rounded-3xl ring-1 ring-black/5">
          <PlaceBackground place={place.id} className="h-full w-full" />
        </div>

        <div className="space-y-2.5">
          {place.topics.map((t, i) => {
            const done = doneIds.has(t.id)
            return (
              <button
                key={t.id}
                onClick={() => {
                  unlockAudio()
                  navigate(`/child/talk/${t.id}`)
                }}
                style={{ animationDelay: `${i * 45}ms` }}
                className="anim-slide-up flex w-full items-center gap-3.5 rounded-3xl bg-white p-3.5 text-left shadow-sm ring-1 ring-black/5 transition-transform active:scale-[0.98]"
              >
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-paper text-[26px]">
                  {t.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-[16px] font-extrabold text-ink">{t.title}</span>
                    {done && (
                      <span className="shrink-0 rounded-full bg-mint-soft px-1.5 py-0.5 text-[10px] font-bold text-mint-deep">
                        완료
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block truncate text-[12.5px] text-ink-soft">{t.desc}</span>
                  <span className="mt-1.5 flex flex-wrap gap-1">
                    {t.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-paper px-2 py-0.5 text-[10px] font-bold text-ink-soft"
                      >
                        {tag}
                      </span>
                    ))}
                    <span className="rounded-full bg-paper px-2 py-0.5 text-[10px] font-bold text-ink-soft">
                      약 {t.minutes}분
                    </span>
                  </span>
                </span>
              </button>
            )
          })}
        </div>
        <div className="h-4" />
      </Screen>
    )
  }

  /* ── 장소 고르기 ── */
  return (
    <Screen title="어디에서 이야기할까?" subtitle="가고 싶은 곳을 골라 보세요" back="/child">
      <div className="space-y-3">
        {PLACES.map((p, i) => {
          const doneCount = p.topics.filter((t) => doneIds.has(t.id)).length
          return (
            <button
              key={p.id}
              onClick={() => navigate(`/child/places/${p.id}`)}
              style={{ animationDelay: `${i * 60}ms` }}
              className="anim-slide-up relative block w-full overflow-hidden rounded-3xl text-left shadow-sm ring-1 ring-black/5 transition-transform active:scale-[0.98]"
            >
              <PlaceBackground place={p.id} className="h-[136px] w-full" />
              <div className="flex items-center gap-3 bg-white px-4 py-3">
                <span className="text-[26px] leading-none">{p.emoji}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[17px] font-black text-ink">{p.name}</span>
                  <span className="block truncate text-[12px] text-ink-soft">{p.desc}</span>
                </span>
                <span className="shrink-0 rounded-full bg-paper px-2.5 py-1 text-[11px] font-bold text-ink-soft">
                  {doneCount}/{p.topics.length}
                </span>
              </div>
            </button>
          )
        })}
      </div>
      <div className="h-4" />
    </Screen>
  )
}
