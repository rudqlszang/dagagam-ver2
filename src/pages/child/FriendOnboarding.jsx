import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Avatar from '../../components/common/Avatar'
import Icon from '../../components/common/Icon'
import { Button } from '../../components/common/ui'
import { useStore } from '../../store/useStore'
import {
  HOBBY_KEYWORDS,
  TRAIT_KEYWORDS,
  buildFriendFromKeywords,
  emptyKeywordPicks,
} from '../../mock/characters'
import { previewVoice, primeVoices, stopAll, unlockAudio } from '../../lib/voiceEngine'
import { withJosa } from '../../lib/korean'

/**
 * 아이가 처음 들어오면 만나는 화면 — 키워드로 친구 두 명 만들기
 *
 * 발표자료의 "학생이 원하는 친구의 말투·성격·역할을 스스로 정함"을 아이가
 * 실제로 할 수 있는 형태로 옮긴 것. 초등 저학년이 대상이라 항목을 채우게 하지
 * 않고 **키워드만 고르게** 하고, 이름·얼굴·색·목소리는 그 키워드에서 자동으로
 * 뽑아 준다. (mock/characters.js의 buildFriendFromKeywords)
 *
 * 흐름:  친구 1 만들기 → 친구 2 만들기 → 다 만났어! → 홈
 */

const MAX_PICK = 3

function Progress({ step }) {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-all ${
            i === step ? 'w-6 bg-ink' : i < step ? 'w-3 bg-ink/40' : 'w-3 bg-ink-faint/30'
          }`}
        />
      ))}
    </div>
  )
}

function Chip({ active, disabled, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-2xl px-3.5 py-2.5 text-[14px] font-bold transition-all active:scale-95 ${
        active
          ? 'bg-ink text-white shadow-sm'
          : disabled
            ? 'bg-white text-ink-faint ring-1 ring-black/5'
            : 'bg-white text-ink ring-1 ring-black/8 active:bg-paper'
      }`}
    >
      {children}
    </button>
  )
}

/** 키워드 한 세트 → 친구 한 명 만드는 단계 */
function FriendStep({ index, avoidAccents, onDone, onBack }) {
  const speed = useStore((s) => s.settings.voiceSpeed)
  const voiceOn = useStore((s) => s.settings.voice)

  const [picks, setPicks] = useState(emptyKeywordPicks)
  const [roll, setRoll] = useState(0)
  const [nameOverride, setNameOverride] = useState('')
  const previewRef = useRef(null)

  // 단계가 바뀌면 처음부터 다시
  useEffect(() => {
    setPicks(emptyKeywordPicks())
    setRoll(0)
    setNameOverride('')
  }, [index])

  useEffect(() => () => previewRef.current?.cancel(), [])

  const started = picks.likes.length > 0 || picks.traits.length > 0
  const ready = picks.likes.length > 0 && picks.traits.length > 0

  const friend = useMemo(
    () =>
      buildFriendFromKeywords(picks, {
        id: `preview-${index}`,
        roll,
        avoidAccents,
      }),
    [picks, roll, avoidAccents, index],
  )

  const shownName = nameOverride.trim() || friend.name

  const toggle = (key, value) =>
    setPicks((p) => {
      const cur = p[key]
      if (cur.includes(value)) return { ...p, [key]: cur.filter((v) => v !== value) }
      if (cur.length >= MAX_PICK) return p
      return { ...p, [key]: [...cur, value] }
    })

  const listen = () => {
    unlockAudio()
    previewRef.current?.cancel()
    previewRef.current = previewVoice({ ...friend, name: shownName }, { speed })
  }

  const reroll = () => {
    setNameOverride('')
    setRoll((r) => r + 1)
  }

  return (
    <>
      {/* 미리보기 카드 — 키워드를 고를 때마다 실시간으로 바뀐다 */}
      <div
        className={`relative overflow-hidden rounded-3xl p-4 transition-colors ${
          started ? friend.theme.soft : 'bg-white'
        } ring-1 ring-black/5`}
      >
        {started ? (
          <div className="anim-fade-in flex items-center gap-3.5">
            <Avatar
              src={friend.avatarUrl}
              name={shownName}
              size={66}
              className="shrink-0 ring-4 ring-white"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[18px] leading-none">{friend.emoji}</span>
                <input
                  value={shownName}
                  onChange={(e) => setNameOverride(e.target.value.slice(0, 8))}
                  aria-label="친구 이름"
                  className="min-w-0 flex-1 bg-transparent text-[19px] font-black text-ink outline-none"
                />
              </div>
              <p className="mt-1 line-clamp-2 text-[11.5px] leading-[15px] text-ink-soft">
                {friend.tagline}
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-1.5">
              <button
                onClick={listen}
                disabled={!voiceOn}
                aria-label="목소리 들어보기"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-ink shadow-sm active:bg-paper disabled:opacity-40"
              >
                <Icon name="volume" className="h-4 w-4" />
              </button>
              <button
                onClick={reroll}
                aria-label="다시 뽑기"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[15px] shadow-sm active:bg-paper"
              >
                🎲
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3.5 opacity-60">
            <div className="flex h-[66px] w-[66px] shrink-0 items-center justify-center rounded-full bg-paper text-2xl">
              ?
            </div>
            <p className="text-[13px] leading-relaxed text-ink-soft">
              아래에서 키워드를 고르면
              <br />
              여기에 친구가 나타나요
            </p>
          </div>
        )}
      </div>

      {/* 취미 */}
      <h2 className="mb-1 mt-6 px-1 text-[16px] font-extrabold text-ink">
        뭘 좋아하는 친구면 좋겠어?
      </h2>
      <p className="mb-3 px-1 text-[12px] text-ink-soft">최대 {MAX_PICK}개까지 고를 수 있어요</p>
      <div className="flex flex-wrap gap-2">
        {HOBBY_KEYWORDS.map((h) => (
          <Chip
            key={h.label}
            active={picks.likes.includes(h.label)}
            disabled={!picks.likes.includes(h.label) && picks.likes.length >= MAX_PICK}
            onClick={() => toggle('likes', h.label)}
          >
            {h.emoji} {h.label}
          </Chip>
        ))}
      </div>

      {/* 성격 */}
      <h2 className="mb-1 mt-6 px-1 text-[16px] font-extrabold text-ink">
        어떤 성격이면 좋겠어?
      </h2>
      <p className="mb-3 px-1 text-[12px] text-ink-soft">
        고른 성격에 따라 목소리와 말투가 달라져요
      </p>
      <div className="flex flex-wrap gap-2">
        {TRAIT_KEYWORDS.map((t) => (
          <Chip
            key={t.label}
            active={picks.traits.includes(t.label)}
            disabled={!picks.traits.includes(t.label) && picks.traits.length >= MAX_PICK}
            onClick={() => toggle('traits', t.label)}
          >
            {t.label}
          </Chip>
        ))}
      </div>

      {/* 자유 입력 */}
      <h2 className="mb-1 mt-6 px-1 text-[16px] font-extrabold text-ink">
        더 알려 주고 싶은 게 있어?
      </h2>
      <p className="mb-3 px-1 text-[12px] text-ink-soft">안 써도 괜찮아요</p>
      <input
        value={picks.extra}
        onChange={(e) => setPicks((p) => ({ ...p, extra: e.target.value.slice(0, 40) }))}
        placeholder="예) 공룡, 우리 동네 놀이터"
        className="w-full rounded-2xl bg-white px-4 py-3.5 text-[15px] text-ink outline-none ring-1 ring-black/8 focus:ring-2 focus:ring-brand"
      />

      <div className="mt-6 flex gap-2">
        {onBack && (
          <Button variant="soft" size="lg" onClick={onBack}>
            이전
          </Button>
        )}
        <Button
          full
          size="lg"
          disabled={!ready}
          onClick={() => onDone({ ...friend, name: shownName })}
        >
          {ready
            ? `${withJosa(shownName, '으로/로')} 정했어`
            : picks.likes.length === 0
              ? '좋아하는 걸 골라 줘'
              : '성격도 골라 줘'}
        </Button>
      </div>
      <div className="h-4" />
    </>
  )
}

export default function FriendOnboarding() {
  const navigate = useNavigate()
  const nickname = useStore((s) => s.nickname)
  const completeOnboarding = useStore((s) => s.completeOnboarding)
  const speed = useStore((s) => s.settings.voiceSpeed)

  const [step, setStep] = useState(0) // 0,1 = 친구 만들기 / 2 = 완료
  const [made, setMade] = useState([])
  const previewRef = useRef(null)

  useEffect(() => {
    primeVoices()
    return () => {
      previewRef.current?.cancel()
      stopAll()
    }
  }, [])

  const finish = () => {
    const stamp = Date.now().toString(36)
    const pair = made.map((f, i) => ({ ...f, id: `my-${stamp}-${i + 1}` }))
    completeOnboarding(pair[0], pair[1])
    navigate('/child', { replace: true })
  }

  const listen = (f) => {
    unlockAudio()
    previewRef.current?.cancel()
    previewRef.current = previewVoice(f, { speed, roster: made })
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-cream">
      <header className="shrink-0 px-5 pb-3 pt-[max(1.5rem,calc(env(safe-area-inset-top)+1rem))]">
        <Progress step={step} />
        <h1 className="mt-3 text-[22px] font-black leading-tight text-ink">
          {step === 2
            ? '친구 두 명을 다 만났어!'
            : `${withJosa(nickname, '이랑/랑')} 이야기할 친구 만들기`}
        </h1>
        <p className="mt-1 text-[13px] text-ink-soft">
          {step === 2
            ? '이제 이 친구들이랑 이야기할 수 있어요'
            : `${step + 1}번째 친구 · 어떤 친구였으면 좋겠는지 골라 주세요`}
        </p>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-5 no-scrollbar">
        {step < 2 ? (
          <FriendStep
            key={step}
            index={step}
            avoidAccents={made.map((f) => f.accent)}
            onBack={step === 1 ? () => { setMade((m) => m.slice(0, 1)); setStep(0) } : null}
            onDone={(friend) => {
              setMade((m) => [...m.slice(0, step), friend])
              setStep(step + 1)
            }}
          />
        ) : (
          <>
            <div className="space-y-2.5">
              {made.map((f) => (
                <div
                  key={f.id}
                  className={`anim-slide-up flex items-center gap-3.5 rounded-3xl p-4 ring-1 ring-black/5 ${f.theme.soft}`}
                >
                  <Avatar
                    src={f.avatarUrl}
                    name={f.name}
                    size={62}
                    className="shrink-0 ring-4 ring-white"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[18px] font-black text-ink">
                      {f.emoji} {f.name}
                    </p>
                    <p className="mt-0.5 text-[12px] leading-snug text-ink-soft">{f.tagline}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {f.traits.map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-white/70 px-2 py-0.5 text-[10.5px] font-semibold text-ink-soft"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => listen(f)}
                    aria-label={`${f.name} 목소리 들어보기`}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-ink shadow-sm active:bg-paper"
                  >
                    <Icon name="volume" className="h-4.5 w-4.5" />
                  </button>
                </div>
              ))}
            </div>

            <p className="mt-4 rounded-2xl bg-white p-3.5 text-[12px] leading-relaxed text-ink-soft ring-1 ring-black/5">
              💡 나중에 <b className="text-ink">홈 → 친구 바꾸기</b>에서 다시 만들거나 다른
              친구로 바꿀 수 있어요.
            </p>

            <div className="mt-5 space-y-2">
              <Button full size="lg" onClick={finish}>
                이 친구들과 이야기하기
              </Button>
              <button
                onClick={() => {
                  setMade([])
                  setStep(0)
                }}
                className="w-full py-1.5 text-[13px] font-semibold text-ink-soft"
              >
                처음부터 다시 만들기
              </button>
            </div>
            <div className="h-6" />
          </>
        )}
      </main>
    </div>
  )
}
