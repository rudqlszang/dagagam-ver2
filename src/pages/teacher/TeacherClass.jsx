import { useState } from 'react'
import Screen from '../../components/common/Screen'
import Avatar from '../../components/common/Avatar'
import { Card, Chip, ProgressBar, Sheet, StatTile } from '../../components/common/ui'
import { dicebearUrl } from '../../mock/characters'
import { STUDENTS, TEACHER } from '../../mock/teacherData'
import { getMission } from '../../mock/missions'
import { useStore } from '../../store/useStore'

const TREND = {
  up: { icon: '▲', cls: 'text-mint-deep', label: '상승' },
  flat: { icon: '■', cls: 'text-ink-faint', label: '유지' },
  down: { icon: '▼', cls: 'text-coral-deep', label: '하락' },
}

const LEVEL_TONE = ['paper', 'coral', 'sun', 'brand', 'mint']

function adaptTone(v) {
  if (v >= 70) return 'mint'
  if (v >= 45) return 'sun'
  return 'coral'
}

export default function TeacherClass() {
  const sessions = useStore((s) => s.sessions)
  const [openId, setOpenId] = useState(null)

  const active = STUDENTS.find((s) => s.id === openId)
  /* 아이 화면과 연동: 이리엔(st-1)은 이 기기의 실제 대화 기록을 그대로 본다 */
  const linkedSessions = active?.id === 'st-1' ? sessions : []

  const avgAdapt = Math.round(
    STUDENTS.reduce((s, x) => s + x.adaptation, 0) / STUDENTS.length,
  )
  const needCare = STUDENTS.filter((s) => s.adaptation < 50).length

  return (
    <Screen
      tone="admin"
      title="우리 반 학생"
      subtitle={`${TEACHER.school} ${TEACHER.classRoom} · ${TEACHER.name} 선생님`}
    >
      <div className="mb-4 flex gap-2">
        <StatTile emoji="🧑‍🎓" label="다문화 학생" value={STUDENTS.length} unit="명" tone="brand" />
        <StatTile emoji="📈" label="평균 적응도" value={avgAdapt} unit="%" tone="mint" />
        <StatTile emoji="💛" label="관심 필요" value={needCare} unit="명" tone="coral" />
      </div>

      <div className="space-y-2.5">
        {STUDENTS.map((s) => {
          const trend = TREND[s.trend]
          return (
            <button key={s.id} onClick={() => setOpenId(s.id)} className="w-full text-left">
              <Card className="transition-colors active:bg-paper">
                <div className="flex items-start gap-3">
                  <Avatar src={dicebearUrl(s.seed)} name={s.name} size={46} className="shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-[15px] font-bold text-ink">{s.name}</p>
                      <span className="text-[13px]">{s.flag}</span>
                      <Chip tone={LEVEL_TONE[s.level - 1] ?? 'paper'}>
                        Lv.{s.level} {s.levelLabel}
                      </Chip>
                    </div>
                    <p className="mt-0.5 text-[11.5px] text-ink-faint">
                      {s.country} · {s.langLabel} · 주간 발화 {s.utterancesWeek}회
                    </p>

                    <div className="mt-2.5 flex items-center gap-2">
                      <ProgressBar value={s.adaptation} tone={adaptTone(s.adaptation)} />
                      <span className="shrink-0 text-[11.5px] font-bold text-ink">
                        {s.adaptation}%
                      </span>
                      <span className={`shrink-0 text-[11px] font-bold ${trend.cls}`}>
                        {trend.icon}
                      </span>
                    </div>

                    <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-ink-soft">
                      {s.note}
                    </p>
                  </div>
                </div>
              </Card>
            </button>
          )
        })}
      </div>

      <p className="mt-4 rounded-2xl bg-white p-3.5 text-[11.5px] leading-relaxed text-ink-soft ring-1 ring-black/5">
        ℹ️ 적응도는 아이 화면의 대화 참여도 · 발화량 · 새 단어 습득을 종합한 지표예요.
        학생 개별 대화 내용은 공개되지 않고, 요약 지표만 선생님께 전달됩니다.
      </p>
      <div className="h-2" />

      <Sheet open={Boolean(active)} onClose={() => setOpenId(null)} title={active?.name}>
        {active && (
          <>
            <div className="-mt-2 mb-4 flex items-center gap-3">
              <Avatar src={dicebearUrl(active.seed)} name={active.name} size={54} />
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] text-ink-soft">
                  {active.flag} {active.country} · {active.langLabel}
                </p>
                <div className="mt-1 flex gap-1.5">
                  <Chip tone={LEVEL_TONE[active.level - 1] ?? 'paper'}>
                    한국어 Lv.{active.level} {active.levelLabel}
                  </Chip>
                  <Chip tone={adaptTone(active.adaptation)}>적응도 {active.adaptation}%</Chip>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-paper p-4">
              <p className="text-[13px] font-bold text-ink">이번 주 요약</p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">{active.note}</p>
              <div className="mt-3 flex gap-2">
                <StatTile label="주간 발화" value={active.utterancesWeek} unit="회" tone="brand" />
                <StatTile label="적응도" value={active.adaptation} unit="%" tone="mint" />
                <StatTile label="추세" value={TREND[active.trend].label} tone="sun" />
              </div>
            </div>

            <div className="mt-3 rounded-2xl bg-sun-soft p-4">
              <p className="text-[12.5px] font-bold text-sun-deep">🎯 집중 지도가 필요한 부분</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {active.focus.map((f) => (
                  <span
                    key={f}
                    className="rounded-full bg-white/70 px-2.5 py-1 text-[11.5px] font-semibold text-ink"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {linkedSessions.length > 0 && (
              <div className="mt-3">
                <p className="mb-2 text-[13px] font-bold text-ink">최근 연습한 대화 미션</p>
                <div className="space-y-1.5">
                  {linkedSessions.slice(0, 4).map((s) => {
                    const m = getMission(s.missionId)
                    return (
                      <div
                        key={s.id}
                        className="flex items-center gap-2.5 rounded-2xl bg-paper px-3 py-2.5"
                      >
                        <span className="text-lg">{m.emoji}</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[12.5px] font-bold text-ink">
                            {s.missionTitle}
                          </p>
                          <p className="text-[10.5px] text-ink-faint">
                            {s.date} · 발화 {s.utterances}번
                          </p>
                        </div>
                        {s.newWords?.length > 0 && (
                          <Chip tone="grape">새 단어 {s.newWords.length}</Chip>
                        )}
                      </div>
                    )
                  })}
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-ink-faint">
                  이 학생은 이 기기의 아이 화면과 연결되어 있어요. 아이가 대화를 마치면
                  여기에 바로 반영됩니다.
                </p>
              </div>
            )}
          </>
        )}
      </Sheet>
    </Screen>
  )
}
