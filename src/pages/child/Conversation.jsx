import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CHARACTER_LIST, userAvatarUrl } from '../../mock/characters'
import { getMission } from '../../mock/missions'
import { useStore } from '../../store/useStore'
import {
  createSession,
  extractWordCard,
  getOpening,
  getReplies,
  summarize,
} from '../../lib/conversationEngine'
import { playSequence } from '../../lib/voicePlayer'
import { createRecognizer, isSpeechSupported, queryMicPermission } from '../../lib/speech'
import ConversationStage from '../../components/child/ConversationStage'
import MicButton from '../../components/child/MicButton'
import SubtitleBar from '../../components/child/SubtitleBar'
import WordHelpCard from '../../components/child/WordHelpCard'
import Icon from '../../components/common/Icon'
import { Button, Sheet } from '../../components/common/ui'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export default function Conversation() {
  const { missionId } = useParams()
  const navigate = useNavigate()
  const mission = getMission(missionId)

  const nickname = useStore((s) => s.nickname)
  const subtitlesOn = useStore((s) => s.settings.subtitles)
  const updateSettings = useStore((s) => s.updateSettings)
  const saveSession = useStore((s) => s.saveSession)

  /* status: 'speaking' | 'idle' | 'listening' | 'thinking' | 'done' */
  const [status, setStatusState] = useState('speaking')
  const statusRef = useRef('speaking')
  const [speakingId, setSpeakingId] = useState(null)
  const [bubbles, setBubbles] = useState({})
  const [subtitle, setSubtitle] = useState(null)
  const [interim, setInterim] = useState('')
  const [wordCard, setWordCard] = useState(null)
  const [toast, setToast] = useState(null)
  const [micIssue, setMicIssue] = useState(null)
  const [textOpen, setTextOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [confirmExit, setConfirmExit] = useState(false)

  const sessionRef = useRef(null)
  const beatRef = useRef(0)
  const stopPlaybackRef = useRef(null)
  const recognizerRef = useRef(null)
  const finalRef = useRef(null)
  const wordTimerRef = useRef(null)
  const toastTimerRef = useRef(null)
  const aliveRef = useRef(true)

  if (sessionRef.current === null) {
    sessionRef.current = createSession(missionId)
  }

  /* 콜백 안에서 최신 상태를 읽어야 해서 ref와 함께 관리한다 */
  const setStatus = useCallback((next) => {
    statusRef.current = next
    setStatusState(next)
  }, [])

  /* ── 어려운 말 카드 ─────────────────────────────── */
  const showWordCard = useCallback((card) => {
    if (!card) return
    if (!useStore.getState().settings.autoWordCard) return
    clearTimeout(wordTimerRef.current)
    setWordCard(card)
    wordTimerRef.current = setTimeout(() => setWordCard(null), 4600)
  }, [])

  const flashToast = useCallback((msg) => {
    if (!msg) return
    clearTimeout(toastTimerRef.current)
    setToast(msg)
    toastTimerRef.current = setTimeout(() => setToast(null), 2600)
  }, [])

  /* ── AI 대사 재생 ───────────────────────────────── */
  const playLines = useCallback(
    (lines, onDone) => {
      setStatus('speaking')
      stopPlaybackRef.current?.()
      stopPlaybackRef.current = playSequence(lines, {
        missionId,
        useSynth: useStore.getState().settings.voice,
        onLine: (line) => {
          const subsOn = useStore.getState().settings.subtitles
          setSpeakingId(line.by)
          setSubtitle({ by: line.by, text: line.text })
          setBubbles(subsOn ? { [line.by]: line.text } : {})
          sessionRef.current.lines.push({ by: line.by, text: line.text })
          if (line.word) sessionRef.current.learnedWords.push(line.word)
          showWordCard(extractWordCard(line))
        },
        onDone: () => {
          if (!aliveRef.current) return
          setSpeakingId(null)
          setBubbles({})
          onDone?.()
        },
      })
    },
    [missionId, showWordCard, setStatus],
  )

  /* ── 아이 발화 처리 ─────────────────────────────── */
  const handleUserUtterance = useCallback(
    async (text, confidence = 0.8) => {
      const clean = (text ?? '').trim()
      setInterim('')
      setStatus('thinking')

      if (clean) {
        const line = { by: 'user', text: clean, confidence }
        sessionRef.current.lines.push(line)
        if (confidence > 0) sessionRef.current.confidences.push(confidence)

        const subsOn = useStore.getState().settings.subtitles
        setSpeakingId('user')
        setSubtitle({ by: 'user', text: clean })
        setBubbles(subsOn ? { user: clean } : {})

        const card = extractWordCard(line)
        if (card) {
          sessionRef.current.learnedWords.push(card.word)
          showWordCard(card)
        }

        await sleep(950)
        if (!aliveRef.current) return
        setSpeakingId(null)
        setBubbles({})
      }

      const res = await getReplies({
        missionId,
        beatIndex: beatRef.current,
        userText: clean,
      })
      if (!aliveRef.current) return

      beatRef.current = res.nextBeatIndex
      playLines(res.lines, () => {
        if (res.phase === 'closing') setStatus('done')
        else setStatus('idle')
      })
    },
    [missionId, playLines, showWordCard, setStatus],
  )

  /* ── 마이크 ─────────────────────────────────────── */
  const startListening = useCallback(() => {
    if (statusRef.current !== 'idle') return
    if (!isSpeechSupported()) {
      setMicIssue({
        type: 'unsupported',
        message: '이 브라우저는 음성 인식을 지원하지 않아요.',
      })
      return
    }
    finalRef.current = null
    setSubtitle(null)
    setInterim('')

    const rec = createRecognizer({
      onStart: () => setStatus('listening'),
      onInterim: (t) => setInterim(t),
      onFinal: (t, c) => {
        finalRef.current = { text: t, confidence: c }
      },
      onError: (code, message) => {
        if (code === 'denied') setMicIssue({ type: 'denied', message })
        else if (code === 'unsupported') setMicIssue({ type: 'unsupported', message })
        else flashToast(message)
      },
      onEnd: () => {
        if (!aliveRef.current) return
        setInterim('')
        const got = finalRef.current
        finalRef.current = null
        if (statusRef.current !== 'listening') return
        // 말이 인식되지 않았어도 친구들이 부드럽게 다시 물어봐 준다
        handleUserUtterance(got?.text ?? '', got?.confidence ?? 0)
      },
    })

    recognizerRef.current = rec
    rec.start()
  }, [flashToast, handleUserUtterance, setStatus])

  const stopListening = useCallback(() => {
    recognizerRef.current?.stop()
  }, [])

  /* ── 대화 시작 (오프닝) ─────────────────────────── */
  useEffect(() => {
    aliveRef.current = true
    let cancelled = false

    sessionRef.current = createSession(missionId)
    beatRef.current = 0
    setStatus('speaking')

    getOpening(missionId).then(({ lines }) => {
      if (cancelled) return
      playLines(lines, () => setStatus('idle'))
    })

    return () => {
      cancelled = true
      aliveRef.current = false
      stopPlaybackRef.current?.()
      recognizerRef.current?.abort()
      clearTimeout(wordTimerRef.current)
      clearTimeout(toastTimerRef.current)
    }
  }, [missionId, playLines, setStatus])

  /* 마이크 권한이 이미 거부돼 있으면 미리 안내한다 */
  useEffect(() => {
    if (!isSpeechSupported()) return
    queryMicPermission().then((state) => {
      if (state === 'denied') {
        setMicIssue({ type: 'denied', message: '마이크 사용이 막혀 있어요.' })
      }
    })
  }, [])

  /* ── 종료 ───────────────────────────────────────── */
  const finish = () => {
    aliveRef.current = false
    stopPlaybackRef.current?.()
    recognizerRef.current?.abort()
    const summary = summarize(sessionRef.current)
    const record = saveSession(sessionRef.current, summary)
    navigate('/child/summary', {
      replace: true,
      state: { recordId: record.id, summary },
    })
  }

  const sendText = () => {
    const t = draft.trim()
    if (!t) return
    setDraft('')
    setTextOpen(false)
    handleUserUtterance(t, 0.95)
  }

  const micStatus =
    status === 'listening' ? 'listening' : status === 'idle' ? 'idle' : 'busy'
  const ended = status === 'done'

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-gradient-to-b from-brand-soft via-cream to-cream">
      {/* 배경 장식 */}
      <div className="pointer-events-none absolute -left-14 top-24 h-44 w-44 rounded-full bg-coral/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-8 h-48 w-48 rounded-full bg-sun/15 blur-3xl" />

      {/* 헤더 */}
      <header className="relative z-30 flex shrink-0 items-center gap-2 px-4 pb-2 pt-[max(0.9rem,env(safe-area-inset-top))]">
        <button
          onClick={() => setConfirmExit(true)}
          aria-label="대화 끝내기"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-ink-soft shadow-sm active:bg-white"
        >
          <Icon name="close" className="h-4.5 w-4.5" strokeWidth={2.4} />
        </button>

        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-[14px] font-extrabold text-ink">
            {mission.emoji} {mission.title}
          </p>
          <p className="text-[11px] text-ink-soft">
            {status === 'listening'
              ? '듣고 있어요'
              : status === 'thinking'
                ? '친구가 생각 중…'
                : status === 'speaking'
                  ? '친구가 말하는 중'
                  : ended
                    ? '대화가 끝났어요'
                    : '이제 네 차례야'}
          </p>
        </div>

        <button
          onClick={() => updateSettings({ subtitles: !subtitlesOn })}
          aria-label="자막 켜고 끄기"
          className={`flex h-9 items-center gap-1 rounded-full px-2.5 text-[11px] font-bold shadow-sm transition-colors ${
            subtitlesOn ? 'bg-ink text-white' : 'bg-white/80 text-ink-soft'
          }`}
        >
          자막
        </button>
      </header>

      <WordHelpCard card={wordCard} onClose={() => setWordCard(null)} />

      {/* 무대 */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-center">
        <ConversationStage
          characters={CHARACTER_LIST}
          user={{ name: nickname, avatarUrl: userAvatarUrl(nickname) }}
          speakingId={speakingId}
          listening={status === 'listening'}
          thinking={status === 'thinking'}
          bubbles={bubbles}
        />
      </div>

      {/* 자막 */}
      <div className="relative z-10 shrink-0">
        <SubtitleBar
          enabled={subtitlesOn}
          interim={interim}
          subtitle={subtitle}
          nickname={nickname}
          onEnable={() => updateSettings({ subtitles: true })}
        />
      </div>

      {/* 하단 컨트롤 */}
      <div className="relative z-10 shrink-0 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2">
        {ended ? (
          <div className="anim-slide-up space-y-2.5">
            <Button full size="lg" variant="sun" onClick={finish}>
              🎁 오늘 대화 정리 보기
            </Button>
            <button
              onClick={() => setStatus('idle')}
              className="w-full py-1 text-[12.5px] font-semibold text-ink-soft"
            >
              조금 더 이야기할래요
            </button>
          </div>
        ) : (
          <div className="flex items-end justify-between">
            <button
              onClick={() => setTextOpen(true)}
              className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl bg-white text-ink-soft shadow-sm active:bg-paper"
              aria-label="텍스트로 입력하기"
            >
              <Icon name="keyboard" className="h-5 w-5" />
              <span className="mt-0.5 text-[8.5px] font-bold">글자</span>
            </button>

            <MicButton
              status={micStatus}
              onStart={startListening}
              onStop={stopListening}
            />

            <button
              onClick={() => setConfirmExit(true)}
              className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl bg-white text-ink-soft shadow-sm active:bg-paper"
              aria-label="대화 끝내기"
            >
              <span className="text-base leading-none">🏁</span>
              <span className="mt-0.5 text-[8.5px] font-bold">끝내기</span>
            </button>
          </div>
        )}
      </div>

      {/* 토스트 */}
      {toast && (
        <div className="anim-fade-in pointer-events-none absolute bottom-40 left-1/2 z-40 -translate-x-1/2 rounded-full bg-ink/90 px-4 py-2 text-[12.5px] font-semibold text-white shadow-lg">
          {toast}
        </div>
      )}

      {/* 텍스트 입력 폴백 */}
      <Sheet open={textOpen} onClose={() => setTextOpen(false)} title="글자로 말하기">
        <p className="-mt-1 mb-3 text-[12.5px] leading-relaxed text-ink-soft">
          마이크가 잘 안 들릴 때는 여기에 써도 괜찮아요.
        </p>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          autoFocus
          placeholder="하고 싶은 말을 써 보세요"
          className="w-full resize-none rounded-2xl bg-paper p-3.5 text-[15px] text-ink outline-none ring-1 ring-black/5 focus:ring-2 focus:ring-brand"
        />
        <Button full size="lg" className="mt-3" disabled={!draft.trim()} onClick={sendText}>
          말하기
        </Button>
      </Sheet>

      {/* 대화 종료 확인 */}
      <Sheet open={confirmExit} onClose={() => setConfirmExit(false)} title="대화를 끝낼까요?">
        <p className="-mt-1 mb-4 text-[13px] leading-relaxed text-ink-soft">
          지금까지 나눈 이야기를 정리해서 보여 드릴게요.
        </p>
        <div className="space-y-2">
          <Button full size="lg" onClick={finish}>
            정리 보고 끝내기
          </Button>
          <Button full size="lg" variant="soft" onClick={() => setConfirmExit(false)}>
            더 이야기하기
          </Button>
        </div>
      </Sheet>

      {/* 마이크 권한 안내 오버레이 */}
      {micIssue && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end bg-ink/45 backdrop-blur-sm">
          <div className="anim-slide-up rounded-t-[2rem] bg-white p-6 pb-8">
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-ink-faint/40" />
            <div className="flex items-center gap-2.5">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-coral-soft text-xl">
                🎙️
              </span>
              <h3 className="text-[17px] font-extrabold text-ink">
                {micIssue.type === 'unsupported'
                  ? '이 브라우저에서는 마이크를 쓸 수 없어요'
                  : '마이크를 켜 주세요'}
              </h3>
            </div>

            <div className="mt-4 space-y-2 rounded-2xl bg-paper p-4 text-[12.5px] leading-relaxed text-ink-soft">
              {micIssue.type === 'unsupported' ? (
                <>
                  <p>
                    음성 인식은 <b className="text-ink">크롬(Chrome)</b> 또는{' '}
                    <b className="text-ink">엣지(Edge)</b> 브라우저에서 동작해요.
                  </p>
                  <p>지금은 아래 "글자로 말하기"로 대화를 이어갈 수 있어요.</p>
                </>
              ) : (
                <>
                  <p>
                    1. 주소창 왼쪽의 <b className="text-ink">자물쇠 🔒</b> 아이콘을 눌러요
                  </p>
                  <p>
                    2. <b className="text-ink">마이크</b>를 <b className="text-ink">허용</b>으로
                    바꿔 주세요
                  </p>
                  <p>3. 화면을 새로고침하면 바로 이야기할 수 있어요</p>
                </>
              )}
            </div>

            <div className="mt-4 space-y-2">
              <Button
                full
                size="lg"
                onClick={() => {
                  setMicIssue(null)
                  setTextOpen(true)
                }}
              >
                ⌨️ 글자로 말하기
              </Button>
              <Button full size="lg" variant="soft" onClick={() => setMicIssue(null)}>
                닫기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
