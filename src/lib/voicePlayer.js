/**
 * AI 캐릭터 음성 재생기
 *
 * 재생 우선순위 (위에서부터 시도)
 *  1. 성우가 미리 녹음한 파일          public/voice/<캐릭터>/<미션>-<번호>.mp3
 *  2. 브라우저 기본 음성(SpeechSynthesis)  — 파일이 아직 없을 때의 임시 목소리
 *  3. 무음 + 자막 타이밍                — 둘 다 못 쓸 때
 *
 * 나중에 mp3를 public/voice/ 에 넣기만 하면 1번으로 자동 승격된다.
 * 기본 음성이 싫으면 설정에서 "친구 목소리 듣기"를 끄면 3번으로 내려간다.
 *
 * 파일 경로 규칙
 *  public/voice/minjun/group-project-01.mp3
 *  public/voice/seoyeon/first-day-03.mp3
 */

import { getCharacter } from '../mock/characters'

/** 한 번 없다고 확인된 경로는 다시 요청하지 않는다 (자막 지연 방지) */
const missingCache = new Set()

const pad = (n) => String(n + 1).padStart(2, '0')

export function resolveVoiceUrl(line, missionId, index) {
  if (line.audio) return line.audio
  const char = getCharacter(line.by)
  return `${char.voiceDir}/${missionId}-${pad(index)}.mp3`
}

/** 자막이 자연스럽게 읽히는 속도로 무음 길이를 추정한다 */
export function estimateDuration(text) {
  const chars = (text ?? '').replace(/\s/g, '').length
  return Math.min(6200, Math.max(1300, 620 + chars * 105))
}

/* ── 브라우저 기본 음성 ─────────────────────────────────────────── */

export function isSynthSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

let cachedVoice
function pickKoreanVoice() {
  if (cachedVoice !== undefined) return cachedVoice
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return undefined // 아직 로딩 전 — 다음 호출에서 다시 시도
  cachedVoice =
    voices.find((v) => v.lang === 'ko-KR') ??
    voices.find((v) => v.lang?.toLowerCase().startsWith('ko')) ??
    null
  return cachedVoice
}

// 크롬은 목소리 목록을 비동기로 채운다
if (isSynthSupported()) {
  window.speechSynthesis.addEventListener?.('voiceschanged', () => {
    cachedVoice = undefined
  })
}

/**
 * 기본 음성으로 한 줄 읽기.
 * @returns {{ promise: Promise<boolean>, cancel: Function }} 성공하면 true
 */
function speakLine(line) {
  let done = false
  let guard = null
  let resolveFn

  const promise = new Promise((resolve) => {
    resolveFn = resolve
    const synth = window.speechSynthesis
    const utter = new SpeechSynthesisUtterance(line.text)
    const char = getCharacter(line.by)

    utter.lang = 'ko-KR'
    utter.pitch = char.tts?.pitch ?? 1.4
    utter.rate = char.tts?.rate ?? 1
    const voice = pickKoreanVoice()
    if (voice) utter.voice = voice

    const finish = (ok) => {
      if (done) return
      done = true
      clearTimeout(guard)
      resolve(ok)
    }

    utter.onend = () => finish(true)
    utter.onerror = () => finish(false)

    // onend가 오지 않는 브라우저가 있어 안전망을 둔다
    guard = setTimeout(() => finish(true), estimateDuration(line.text) + 3500)

    try {
      synth.cancel()
      synth.speak(utter)
    } catch {
      finish(false)
    }
  })

  return {
    promise,
    cancel() {
      if (done) return
      done = true
      clearTimeout(guard)
      try {
        window.speechSynthesis.cancel()
      } catch {
        /* noop */
      }
      resolveFn?.(false)
    },
  }
}

/* ── 한 줄 재생 ─────────────────────────────────────────────────── */

/**
 * @param {object} line  { by, text, ... }
 * @param {object} opts  { missionId, index, useSynth }
 * @returns {{ promise: Promise<'played'|'spoken'|'silent'|'cancelled'>, cancel: Function }}
 */
export function playLine(line, { missionId, index = 0, useSynth = true } = {}) {
  const url = resolveVoiceUrl(line, missionId, index)
  let cancelled = false
  let audio = null
  let timer = null
  let speaking = null

  const promise = new Promise((resolve) => {
    // 3단계: 무음 + 자막 타이밍
    const finishSilent = () => {
      if (cancelled) return
      timer = setTimeout(() => {
        if (!cancelled) resolve('silent')
      }, estimateDuration(line.text))
    }

    // 2단계: 브라우저 기본 음성
    const finishSynth = () => {
      if (cancelled) return
      if (!useSynth || !isSynthSupported()) return finishSilent()
      speaking = speakLine(line)
      speaking.promise.then((ok) => {
        if (cancelled) return
        if (ok) resolve('spoken')
        else finishSilent()
      })
    }

    if (missingCache.has(url)) {
      finishSynth()
      return
    }

    // 1단계: 녹음 파일
    audio = new Audio(url)
    audio.preload = 'auto'

    const fallback = () => {
      missingCache.add(url)
      audio = null
      finishSynth()
    }

    audio.onerror = fallback
    audio.onended = () => {
      if (!cancelled) resolve('played')
    }

    // 파일이 준비되면 재생, 400ms 안에 응답이 없으면 다음 단계로 넘어간다.
    const guard = setTimeout(() => {
      if (audio && audio.readyState === 0) fallback()
    }, 400)

    audio.oncanplaythrough = () => {
      clearTimeout(guard)
      if (cancelled) return
      audio.play().catch(fallback)
    }
  })

  return {
    promise,
    cancel() {
      cancelled = true
      if (timer) clearTimeout(timer)
      speaking?.cancel()
      if (audio) {
        audio.pause()
        audio = null
      }
    },
  }
}

/** 여러 줄을 순차 재생. onLine 콜백으로 자막을 갱신한다. */
export function playSequence(
  lines,
  { missionId, onLine, onDone, gap = 420, useSynth = true } = {},
) {
  let cancelled = false
  let current = null
  let gapTimer = null

  ;(async () => {
    for (let i = 0; i < lines.length; i += 1) {
      if (cancelled) return
      const line = lines[i]

      if (line.pause) {
        await new Promise((r) => {
          gapTimer = setTimeout(r, line.pause)
        })
        if (cancelled) return
      }

      onLine?.(line, i)
      current = playLine(line, { missionId, index: i, useSynth })
      await current.promise
      if (cancelled) return

      if (i < lines.length - 1) {
        await new Promise((r) => {
          gapTimer = setTimeout(r, gap)
        })
      }
    }
    if (!cancelled) onDone?.()
  })()

  return () => {
    cancelled = true
    current?.cancel()
    if (gapTimer) clearTimeout(gapTimer)
  }
}
