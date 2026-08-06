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
import { JOSA, withJosa } from '../../lib/korean'

/**
 * 키워드로 친구 만들기
 *
 * 아이가 처음 들어오면 만나는 화면이자, 나중에 친구를 한 명 더 만들 때도 쓰는 화면.
 * 발표자료의 "학생이 원하는 친구의 말투·성격·역할을 스스로 정함"을 아이가 실제로
 * 할 수 있는 형태로 옮겼다.
 *
 * ▸ 기본은 친구 한 명이다. 한 명만 있어도 대화가 된다.
 * ▸ 다 만든 화면에서 "한 명 더 만들기"로 그 자리에서 바로 늘릴 수 있다.
 * ▸ 무대에는 두 명까지 선다. 그 뒤로는 홈 → 친구 바꾸기에서 관리한다.
 *
 * 초등 저학년이 대상이라 항목을 채우게 하지 않고 **키워드만 고르게** 하고,
 * 이름·얼굴·색·목소리는 그 키워드에서 자동으로 뽑아 준다.
 * (mock/characters.js의 buildFriendFromKeywords)
 */

const MAX_PICK = 3
const MAX_FRIENDS = 2 // 무대에는 두 명까지 선다

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

/** 만든 친구를 보여 주는 카드 */
function FriendCard({ friend, onListen }) {
  return (
    <div
      className={`anim-slide-up flex items-center gap-3.5 rounded-3xl p-4 ring-1 ring-black/5 ${friend.theme.soft}`}
    >
      <Avatar
        src={friend.avatarUrl}
        name={friend.name}
        size={62}
        className="shrink-0 ring-4 ring-white"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[18px] font-black text-ink">
          {friend.emoji} {friend.name}
        </p>
        <p className="mt-0.5 text-[12px] leading-snug text-ink-soft">{friend.tagline}</p>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {friend.traits.map((t) => (
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
        onClick={onListen}
        aria-label={`${friend.name} 목소리 들어보기`}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-ink shadow-sm active:bg-paper"
      >
        <Icon name="volume" className="h-4.5 w-4.5" />
      </button>
    </div>
  )
}

/** 키워드 한 세트 → 친구 한 명 만드는 단계 */
function FriendStep({ index, avoidAccents, onDone, onCancel }) {
  const speed = useStore((s) => s.settings.voiceSpeed)
  const voiceOn = useStore((s) => s.settings.voice)

  const [picks, setPicks] = useState(emptyKeywordPicks)
  const [roll, setRoll] = useState(0)
  const [nameOverride, setNameOverride] = useState('')
  const previewRef = useRef(null)

  useEffect(() => () => previewRef.current?.cancel(), [])

  const started = picks.likes.length > 0 || picks.traits.length > 0
  const ready = picks.likes.length > 0 && picks.traits.length > 0

  const friend = useMemo(
    () => buildFriendFromKeywords(picks, { id: `preview-${index}`, roll, avoidAccents }),
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
                onClick={() => {
                  setNameOverride('')
                  setRoll((r) => r + 1)
                }}
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
        {onCancel && (
          <Button variant="soft" size="lg" onClick={onCancel}>
            그만두기
          </Button>
        )}
        <Button
          full
          size="lg"
          disabled={!ready}
          onClick={() => onDone({ ...friend, name: shownName })}
        >
          {ready
            ? `${withJosa(shownName, JOSA.TO)} 정했어`
            : picks.likes.length === 0
              ? '좋아하는 걸 골라 줘'
              : '성격도 골라 줘'}
        </Button>
      </div>
      <div className="h-4" />
    </>
  )
}

/**
 * @param {'first'|'add'} mode 'first'는 첫 진입 온보딩, 'add'는 나중에 한 명 더 만들기
 */
export default function FriendOnboarding({ mode = 'first' }) {
  const navigate = useNavigate()
  const nickname = useStore((s) => s.nickname)
  const completeOnboarding = useStore((s) => s.completeOnboarding)
  const addFriendFromKeywords = useStore((s) => s.addFriendFromKeywords)
  const speed = useStore((s) => s.settings.voiceSpeed)

  const adding = mode === 'add'

  const [phase, setPhase] = useState('make') // 'make' | 'done'
  const [made, setMade] = useState([])
  const previewRef = useRef(null)

  useEffect(() => {
    primeVoices()
    return () => {
      previewRef.current?.cancel()
      stopAll()
    }
  }, [])

  const canAddMore = !adding && made.length < MAX_FRIENDS

  const finish = () => {
    const stamp = Date.now().toString(36)
    const list = made.map((f, i) => ({ ...f, id: `my-${stamp}-${i + 1}` }))
    if (adding) {
      addFriendFromKeywords(list[0])
      navigate('/child/friends', { replace: true })
    } else {
      completeOnboarding(list)
      navigate('/child', { replace: true })
    }
  }

  const listen = (f) => {
    unlockAudio()
    previewRef.current?.cancel()
    previewRef.current = previewVoice(f, { speed, roster: made })
  }

  const heading =
    phase === 'done'
      ? made.length > 1
        ? '친구 두 명을 다 만났어!'
        : '친구를 만났어!'
      : adding
        ? '친구 한 명 더 만들기'
        : `${withJosa(nickname, JOSA.AND)} 이야기할 친구 만들기`

  const sub =
    phase === 'done'
      ? adding
        ? '이 친구를 추가할까요?'
        : '이제 이 친구랑 이야기할 수 있어요'
      : '어떤 친구였으면 좋겠는지 골라 주세요'

  return (
    <div className="flex h-full min-h-0 flex-col bg-cream">
      <header className="shrink-0 px-5 pb-3 pt-[max(1.5rem,calc(env(safe-area-inset-top)+1rem))]">
        <h1 className="text-[22px] font-black leading-tight text-ink">{heading}</h1>
        <p className="mt-1 text-[13px] text-ink-soft">{sub}</p>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-5 no-scrollbar">
        {phase === 'make' ? (
          <FriendStep
            key={made.length}
            index={made.length}
            avoidAccents={made.map((f) => f.accent)}
            onCancel={
              made.length > 0
                ? () => setPhase('done') // 추가하다 그만두면 지금까지 만든 친구로 진행
                : adding
                  ? () => navigate(-1)
                  : null
            }
            onDone={(friend) => {
              setMade((m) => [...m, friend])
              setPhase('done')
            }}
          />
        ) : (
          <>
            <div className="space-y-2.5">
              {made.map((f, i) => (
                <FriendCard key={`${f.name}-${i}`} friend={f} onListen={() => listen(f)} />
              ))}
            </div>

            {/* 그 자리에서 한 명 더 */}
            {canAddMore && (
              <button
                onClick={() => setPhase('make')}
                className="mt-2.5 flex w-full items-center gap-3 rounded-3xl border-2 border-dashed border-brand/40 bg-brand-soft/40 p-4 text-left active:scale-[0.99]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-deep shadow-sm">
                  <Icon name="plus" className="h-5 w-5" strokeWidth={2.6} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-extrabold text-ink">
                    한 명 더 만들기
                  </span>
                  <span className="block text-[11.5px] leading-snug text-ink-soft">
                    둘이 같이 나오면 서로 이야기를 주고받아요
                  </span>
                </span>
              </button>
            )}

            <p className="mt-4 rounded-2xl bg-white p-3.5 text-[12px] leading-relaxed text-ink-soft ring-1 ring-black/5">
              💡 친구는 나중에 <b className="text-ink">홈 → 친구 바꾸기</b>에서 더 만들거나
              바꿀 수 있어요.
            </p>

            <div className="mt-5 space-y-2">
              <Button full size="lg" onClick={finish}>
                {adding
                  ? `${withJosa(made[0]?.name ?? '친구', JOSA.OBJECT)} 추가하기`
                  : made.length > 1
                    ? '이 친구들과 이야기하기'
                    : `${withJosa(made[0]?.name ?? '친구', JOSA.WITH)} 이야기하기`}
              </Button>
              <button
                onClick={() => {
                  setMade([])
                  setPhase('make')
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
