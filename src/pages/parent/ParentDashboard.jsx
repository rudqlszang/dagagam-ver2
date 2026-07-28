import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Screen from '../../components/common/Screen'
import Avatar from '../../components/common/Avatar'
import { Card, Chip, SectionTitle, Sheet, StatTile } from '../../components/common/ui'
import {
  GrowthRadarChart,
  PronunciationLineChart,
  WeeklyBarChart,
} from '../../components/parent/Charts'
import { CHILDREN, getChild, getChildMetrics } from '../../mock/parentData'
import { PARENT_LANGS, buildSummary, getLang } from '../../mock/translations'
import { dicebearUrl } from '../../mock/characters'
import { getWord } from '../../mock/vocabulary'
import { useRecentWeek, useStore } from '../../store/useStore'
import Icon from '../../components/common/Icon'

const SIGNAL_TONE = {
  warn: 'bg-sun-soft ring-sun/30',
  good: 'bg-mint-soft ring-mint/30',
  info: 'bg-brand-soft ring-brand/30',
}

export default function ParentDashboard() {
  const navigate = useNavigate()
  const sessions = useStore((s) => s.sessions)
  const activeChildId = useStore((s) => s.activeChildId)
  const setActiveChild = useStore((s) => s.setActiveChild)
  const parentLang = useStore((s) => s.settings.parentLang)
  const updateSettings = useStore((s) => s.updateSettings)

  const [langOpen, setLangOpen] = useState(false)
  const [nativeMode, setNativeMode] = useState(true)
  const [growthTab, setGrowthTab] = useState('radar')

  const child = getChild(activeChildId)
  const metrics = getChildMetrics(child.id)
  const realWeek = useRecentWeek()

  /* 자녀를 "바꿨을 때만" 그 가정의 모국어로 맞춘다.
     (탭을 오갈 때 부모가 직접 고른 언어가 초기화되지 않도록) */
  const prevChildRef = useRef(child.id)
  useEffect(() => {
    if (prevChildRef.current === child.id) return
    prevChildRef.current = child.id
    updateSettings({ parentLang: child.lang })
    setNativeMode(true)
  }, [child.id, child.lang, updateSettings])

  const langMeta = getLang(parentLang)
  const viewLang = nativeMode ? parentLang : 'ko'
  const t = buildSummary(viewLang, child, metrics.stats)

  /* 실제 대화 기록을 mock 위에 얹어 "연동되는" 그래프를 만든다 (첫째 아이 기준) */
  const isLinkedChild = child.id === 'child-1'
  const weekly = useMemo(() => {
    if (!isLinkedChild) return metrics.weekly
    const realByDay = Object.fromEntries(realWeek.map((d) => [d.day, d.발화]))
    return metrics.weekly.map((d) => ({
      ...d,
      이번주: d.이번주 + (realByDay[d.day] ?? 0),
    }))
  }, [metrics.weekly, realWeek, isLinkedChild])

  const totalThisWeek = weekly.reduce((s, d) => s + d.이번주, 0)
  const totalLastWeek = weekly.reduce((s, d) => s + d.지난주, 0)
  const diff = totalLastWeek
    ? Math.round(((totalThisWeek - totalLastWeek) / totalLastWeek) * 100)
    : 0

  /* 오늘 배운 새 단어 = 자녀별 mock + (연결된 아이라면) 실제 세션에서 나온 단어 */
  const newWords = useMemo(() => {
    const fromSessions = !isLinkedChild
      ? []
      : [...new Set(sessions.slice(0, 3).flatMap((s) => s.newWords ?? []))]
          .map(getWord)
          .filter(Boolean)
          .map((w) => ({ word: w.word, meaning: w.easy, count: 1, fresh: true }))
    const seen = new Set(fromSessions.map((w) => w.word))
    return [...fromSessions, ...metrics.newWords.filter((w) => !seen.has(w.word))].slice(0, 6)
  }, [sessions, metrics.newWords, isLinkedChild])

  const latestPron =
    (isLinkedChild && sessions.find((s) => s.pronunciation)?.pronunciation) ||
    metrics.stats.pron

  /* "모국어로 보기" — 가정 언어가 한국어면 언어부터 고르게 한다 */
  const toggleNative = () => {
    if (parentLang === 'ko') setLangOpen(true)
    else setNativeMode((v) => !v)
  }

  return (
    <Screen
      tone="admin"
      title="아이 성장 리포트"
      subtitle={`${child.korName} · ${child.grade}`}
      right={
        <button
          onClick={() => setLangOpen(true)}
          className="flex h-9 items-center gap-1 rounded-full bg-paper px-2.5 text-[11.5px] font-bold text-ink-soft active:bg-black/5"
        >
          {langMeta.flag} {langMeta.label}
        </button>
      }
    >
      {/* 자녀 선택 */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {CHILDREN.map((c) => {
          const on = c.id === child.id
          return (
            <button
              key={c.id}
              onClick={() => setActiveChild(c.id)}
              className={`flex shrink-0 items-center gap-2 rounded-2xl py-2 pl-2 pr-3.5 transition-colors ${
                on ? 'bg-ink text-white shadow-sm' : 'bg-white text-ink-soft ring-1 ring-black/6'
              }`}
            >
              <Avatar src={dicebearUrl(c.seed)} name={c.name} size={30} />
              <span className="text-left">
                <span className="block text-[13px] font-bold leading-tight">{c.korName}</span>
                <span
                  className={`block text-[10px] leading-tight ${on ? 'text-white/70' : 'text-ink-faint'}`}
                >
                  {c.flag} {c.grade}
                </span>
              </span>
            </button>
          )
        })}
        <button className="flex shrink-0 items-center gap-1 rounded-2xl bg-white px-3.5 text-[12px] font-bold text-ink-faint ring-1 ring-black/6">
          + 자녀 추가
        </button>
      </div>

      {/* 모국어 요약 카드 */}
      <Card className="bg-gradient-to-br from-ink to-[#3d5165] text-white ring-0">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="text-[14px] font-bold">{t.summaryTitle}</span>
          <button
            onClick={toggleNative}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-bold transition-colors ${
              nativeMode ? 'bg-white text-ink' : 'bg-white/15 text-white/80'
            }`}
          >
            <Icon name="sparkle" className="h-3 w-3" />
            {nativeMode ? '한국어로 보기' : `${langMeta.label}로 보기`}
          </button>
        </div>

        <div className="mb-3 flex gap-2">
          <div className="flex-1 rounded-xl bg-white/10 px-2 py-2 text-center">
            <div className="text-[19px] font-extrabold leading-none tabular-nums">
              {totalThisWeek}
            </div>
            <div className="mt-1 text-[10px] leading-tight text-white/70">{t.utterance}</div>
          </div>
          <div className="flex-1 rounded-xl bg-white/10 px-2 py-2 text-center">
            <div className="text-[19px] font-extrabold leading-none tabular-nums">
              {newWords.length}
            </div>
            <div className="mt-1 text-[10px] leading-tight text-white/70">{t.newWord}</div>
          </div>
          <div className="flex-1 rounded-xl bg-white/10 px-2 py-2 text-center">
            <div className="text-[19px] font-extrabold leading-none tabular-nums">
              {latestPron}
            </div>
            <div className="mt-1 text-[10px] leading-tight text-white/70">{t.pron}</div>
          </div>
        </div>

        <p className="text-[12.5px] leading-relaxed text-white/85">{t.body}</p>

        <div className="mt-3 rounded-2xl bg-white/10 p-3">
          <p className="text-[11.5px] font-bold text-sun">💡 {t.tip}</p>
          <p className="mt-1 text-[12px] leading-relaxed text-white/80">{t.tipBody}</p>
        </div>
      </Card>

      {/* 주간 참여도 */}
      <div className="mt-5">
        <SectionTitle
          action={
            <Chip tone={diff >= 0 ? 'mint' : 'coral'}>
              지난주 대비 {diff >= 0 ? '+' : ''}
              {diff}%
            </Chip>
          }
        >
          이번 주 대화 참여도
        </SectionTitle>
        <Card>
          <WeeklyBarChart data={weekly} />
          <div className="mt-2 flex items-center justify-center gap-4 text-[11px] text-ink-soft">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#D6E3EC]" />
              지난주
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-brand" />
              이번주
            </span>
          </div>
        </Card>
      </div>

      {/* 성장 지표 */}
      <div className="mt-5">
        <SectionTitle
          action={
            <div className="flex rounded-full bg-paper p-0.5">
              {[
                { id: 'radar', label: '종합' },
                { id: 'line', label: '발음 추이' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setGrowthTab(tab.id)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors ${
                    growthTab === tab.id ? 'bg-white text-ink shadow-sm' : 'text-ink-faint'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          }
        >
          발음 · 어휘 성장
        </SectionTitle>
        <Card>
          {growthTab === 'radar' ? (
            <>
              <GrowthRadarChart data={metrics.radar} />
              <div className="mt-1 flex items-center justify-center gap-4 text-[11px] text-ink-soft">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#C7D5E0]" />
                  지난달
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-brand" />
                  이번달
                </span>
              </div>
            </>
          ) : (
            <>
              <PronunciationLineChart data={metrics.pronTrend} />
              <p className="mt-2 rounded-xl bg-paper px-3 py-2 text-[11px] leading-relaxed text-ink-soft">
                발음 점수는 아이가 말할 때 음성 인식이 얼마나 또렷하게 알아들었는지를
                100점으로 환산한 값이에요.
              </p>
            </>
          )}
        </Card>
      </div>

      {/* 또래 관계 신호 */}
      <div className="mt-5">
        <SectionTitle>또래 관계 신호</SectionTitle>
        <div className="space-y-2">
          {metrics.signals.map((s) => (
            <div key={s.id} className={`rounded-3xl p-4 ring-1 ${SIGNAL_TONE[s.tone]}`}>
              <div className="flex items-start gap-2.5">
                <span className="text-lg leading-none">{s.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-bold text-ink">{s.title}</p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">{s.body}</p>
                  <button className="mt-2 rounded-full bg-white/70 px-3 py-1 text-[11px] font-bold text-ink-soft">
                    {s.action} →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 오늘 배운 새 단어 */}
      <div className="mt-5">
        <SectionTitle>오늘 배운 새 단어</SectionTitle>
        <Card className="divide-y divide-black/5 p-0">
          {newWords.map((w) => (
            <div key={w.word} className="flex items-center gap-3 p-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-grape-soft text-[13px] font-bold text-grape-deep">
                {w.word.slice(0, 1)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-[13.5px] font-bold text-ink">
                  {w.word}
                  {w.fresh && (
                    <span className="rounded bg-coral-soft px-1.5 py-0.5 text-[9.5px] font-bold text-coral-deep">
                      NEW
                    </span>
                  )}
                </p>
                <p className="truncate text-[11.5px] text-ink-soft">{w.meaning}</p>
              </div>
              <span className="shrink-0 text-[11px] font-semibold text-ink-faint">
                {w.count}회
              </span>
            </div>
          ))}
        </Card>
      </div>

      {/* 어려워한 표현 */}
      <div className="mt-5">
        <SectionTitle>아이가 어려워한 표현</SectionTitle>
        <div className="space-y-2">
          {metrics.hardExpressions.map((e) => (
            <Card key={e.expr}>
              <div className="flex items-start gap-2.5">
                <span
                  className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                    e.level === 'high' ? 'bg-coral' : 'bg-sun'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-bold text-ink">{e.expr}</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">{e.reason}</p>
                  <p className="mt-2 rounded-xl bg-mint-soft px-3 py-2 text-[11.5px] leading-relaxed text-mint-deep">
                    💡 {e.tip}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 대화 기록 바로가기 */}
      <button
        onClick={() => navigate('/parent/transcripts')}
        className="mt-5 flex w-full items-center gap-3 rounded-3xl bg-white p-4 text-left shadow-sm ring-1 ring-black/5 active:bg-paper"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-soft text-lg">
          💬
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-bold text-ink">지난 대화 다시 보기</span>
          <span className="block text-[11.5px] text-ink-soft">
            아이가 나눈 대화를 자막으로 확인해요
          </span>
        </span>
        <span className="text-ink-faint">›</span>
      </button>

      <StatRow linked={isLinkedChild} metrics={metrics} />

      <Sheet open={langOpen} onClose={() => setLangOpen(false)} title="요약 언어 선택">
        <p className="-mt-1 mb-3 text-[12.5px] leading-relaxed text-ink-soft">
          선택한 언어로 아이의 성장 요약을 보여 드려요. (프로토타입에서는 요약 카드에만
          적용됩니다)
        </p>
        <div className="space-y-1.5">
          {PARENT_LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                updateSettings({ parentLang: l.code })
                setNativeMode(l.code !== 'ko')
                setLangOpen(false)
              }}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-colors ${
                l.code === parentLang ? 'bg-brand-soft' : 'bg-paper active:bg-black/5'
              }`}
            >
              <span className="text-lg">{l.flag}</span>
              <span className="flex-1 text-[14px] font-semibold text-ink">{l.label}</span>
              {l.code === parentLang && (
                <Icon name="check" className="h-4 w-4 text-brand-deep" />
              )}
            </button>
          ))}
        </div>
      </Sheet>
    </Screen>
  )
}

function StatRow({ linked, metrics }) {
  const sessions = useStore((s) => s.sessions)

  const count = linked ? sessions.length : 6
  const total = linked
    ? sessions.reduce((sum, s) => sum + (s.utterances ?? 0), 0)
    : metrics.stats.utterances
  const words = linked
    ? new Set(sessions.flatMap((s) => s.newWords ?? [])).size
    : metrics.stats.newWordCount

  return (
    <div className="mb-2 mt-5 flex gap-2">
      <StatTile emoji="💬" label="총 대화" value={count} unit="회" tone="brand" />
      <StatTile emoji="🎙️" label="누적 발화" value={total} unit="번" tone="coral" />
      <StatTile emoji="📚" label="배운 단어" value={words} unit="개" tone="grape" />
    </div>
  )
}
