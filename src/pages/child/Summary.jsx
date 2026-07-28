import { useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { getWord } from '../../mock/vocabulary'
import { getMission } from '../../mock/missions'
import { CHARACTER_LIST } from '../../mock/characters'
import { Button, ProgressBar, StatTile } from '../../components/common/ui'
import Avatar from '../../components/common/Avatar'

function fmtDuration(sec = 0) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return m > 0 ? `${m}분 ${s}초` : `${s}초`
}

export default function Summary() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const sessions = useStore((s) => s.sessions)
  const affinity = useStore((s) => s.affinity)

  const record = state?.recordId
    ? sessions.find((s) => s.id === state.recordId)
    : sessions[0]

  if (!record) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-cream px-8 text-center">
        <span className="text-4xl">🌱</span>
        <p className="text-[15px] font-bold text-ink">아직 정리할 대화가 없어요</p>
        <Button onClick={() => navigate('/child')}>홈으로 가기</Button>
      </div>
    )
  }

  const mission = getMission(record.missionId)
  const summary = state?.summary
  const engagement = summary?.engagement ?? record.engagement ?? 0
  const words =
    summary?.words ?? (record.newWords ?? []).map(getWord).filter(Boolean)
  const grade =
    summary?.grade ??
    (engagement >= 80
      ? { label: '최고예요!', emoji: '🏆' }
      : engagement >= 55
        ? { label: '잘했어요!', emoji: '🌟' }
        : { label: '좋은 시작이에요', emoji: '🌱' })

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-cream no-scrollbar">
      <div className="relative overflow-hidden px-6 pb-6 pt-[max(2.5rem,calc(env(safe-area-inset-top)+1.5rem))] text-center">
        <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-sun/25 blur-2xl" />
        <div className="pointer-events-none absolute -right-10 top-10 h-40 w-40 rounded-full bg-brand/20 blur-2xl" />

        <div className="anim-pop relative text-[56px] leading-none">{grade.emoji}</div>
        <h1 className="anim-slide-up relative mt-3 text-[26px] font-black text-ink">
          {grade.label}
        </h1>
        <p className="anim-slide-up relative mt-1.5 text-[13.5px] text-ink-soft">
          {mission.emoji} {record.missionTitle} · {fmtDuration(record.durationSec)}
        </p>
      </div>

      <div className="space-y-4 px-4 pb-8">
        {/* 지표 */}
        <div className="flex gap-2">
          <StatTile emoji="🎙️" label="말한 횟수" value={record.utterances} unit="번" tone="brand" />
          <StatTile emoji="📚" label="새 단어" value={words.length} unit="개" tone="grape" />
          <StatTile emoji="🔥" label="참여도" value={engagement} unit="점" tone="coral" />
        </div>

        {/* 참여도 게이지 */}
        <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/5">
          <div className="mb-2 flex items-end justify-between">
            <span className="text-[13px] font-bold text-ink">오늘의 참여도</span>
            <span className="text-[12px] font-semibold text-ink-soft">
              {engagement >= 80 ? '아주 활발했어요' : engagement >= 55 ? '잘 참여했어요' : '조금씩 늘려 봐요'}
            </span>
          </div>
          <ProgressBar value={engagement} tone="coral" />
          {record.pronunciation ? (
            <p className="mt-3 rounded-2xl bg-paper px-3 py-2 text-[11.5px] text-ink-soft">
              🔊 목소리 또렷함 <b className="text-ink">{record.pronunciation}점</b> · 인식이
              잘 될수록 점수가 올라가요
            </p>
          ) : null}
        </div>

        {/* 새로 배운 단어 */}
        <div>
          <h2 className="mb-2 px-1 text-[15px] font-bold text-ink">오늘 배운 말</h2>
          {words.length === 0 ? (
            <div className="rounded-3xl bg-white p-5 text-center text-[13px] text-ink-soft shadow-sm ring-1 ring-black/5">
              오늘은 새 단어가 없었어요. 다음엔 더 긴 이야기를 해 볼까요?
            </div>
          ) : (
            <div className="space-y-2">
              {words.map((w, i) => (
                <div
                  key={w.word}
                  style={{ animationDelay: `${i * 60}ms` }}
                  className="anim-slide-up flex items-start gap-3 rounded-3xl bg-white p-3.5 shadow-sm ring-1 ring-black/5"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-grape-soft text-xl">
                    {w.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-extrabold text-ink">{w.word}</p>
                    <p className="text-[12.5px] font-semibold text-ink-soft">{w.easy}</p>
                    <p className="mt-0.5 text-[11.5px] text-ink-faint">{w.example}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 친밀도 */}
        <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/5">
          <h2 className="mb-3 text-[15px] font-bold text-ink">친구와 더 친해졌어요</h2>
          <div className="space-y-3">
            {CHARACTER_LIST.map((c) => (
              <div key={c.id} className="flex items-center gap-3">
                <Avatar src={c.avatarUrl} name={c.name} size={38} />
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-[12.5px] font-bold text-ink">{c.name}</span>
                    <span className="text-[11.5px] font-bold text-ink-soft">
                      {affinity[c.id]}%
                    </span>
                  </div>
                  <ProgressBar
                    value={affinity[c.id]}
                    tone={c.id === 'minjun' ? 'brand' : 'coral'}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="rounded-2xl bg-white/60 p-3.5 text-[11.5px] leading-relaxed text-ink-soft ring-1 ring-black/5">
          👨‍👩‍👧 이 기록은 부모님 화면에도 함께 전달됐어요. 무슨 이야기를 했는지
          부모님이 볼 수 있다는 걸 알고 있어요.
        </p>

        <div className="space-y-2 pt-1">
          <Button full size="lg" onClick={() => navigate('/child')}>
            홈으로 가기
          </Button>
          <Button
            full
            size="lg"
            variant="soft"
            onClick={() => navigate(`/child/talk/${record.missionId}`, { replace: true })}
          >
            한 번 더 이야기하기
          </Button>
        </div>
      </div>
    </div>
  )
}
