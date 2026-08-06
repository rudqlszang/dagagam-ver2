/**
 * AI 캐릭터 음성 재생기 (ver2)
 *
 * 재생 우선순위 — 위에서부터 되는 것을 쓴다
 *  1. 성우가 미리 녹음한 파일        public/voice/<캐릭터>/<미션>-<번호>.mp3
 *  2. 서버 TTS API (선택)            /api/tts — 서버에 키가 있을 때만 켜진다
 *  3. 브라우저 내장 음성 (무료 기본)  lib/voiceEngine.js — 신경망 음성 우선
 *  4. 무음 + 자막 타이밍             위가 전부 안 될 때
 *
 * 기본값은 3번이다. API 키가 하나도 없어도 앱은 끝까지 소리 내어 말한다.
 *
 * 1번을 켜려면 public/voice/manifest.json 에 파일 목록을 넣으면 된다.
 * (manifest가 없으면 요청을 아예 보내지 않아서 대화가 밀리지 않는다)
 */

import { getCharacter } from '../mock/characters'
import { ensureProbe, synthesize, ttsStatus } from './ttsClient'
import {
  estimateDuration,
  isSynthSupported,
  speak,
  splitSentences,
  stopAll,
} from './voiceEngine'

export { estimateDuration, isSynthSupported }

const BASE = import.meta.env.BASE_URL ?? '/'
const asset = (p) => `${BASE}${p.replace(/^\//, '')}`

const pad = (n) => String(n + 1).padStart(2, '0')

/* ── 1단계: 녹음 파일 목록 ─────────────────────────────────────── */

/** null = 아직 모름, false = 녹음 없음, Set = 있는 파일 목록 */
let manifest = null
let manifestPromise = null

function ensureManifest() {
  if (manifest !== null) return Promise.resolve(manifest)
  if (manifestPromise) return manifestPromise

  manifestPromise = fetch(asset('voice/manifest.json'))
    .then((res) => (res.ok ? res.json() : null))
    .then((body) => {
      const files = Array.isArray(body?.files) ? body.files : null
      manifest = files?.length ? new Set(files) : false
      return manifest
    })
    .catch(() => {
      manifest = false
      return manifest
    })

  return manifestPromise
}

// 앱이 뜨자마자 한 번만 확인해 둔다 (없으면 이후 요청 0건)
ensureManifest()

export function resolveVoiceUrl(line, missionId, index) {
  if (line.audio) return asset(line.audio)
  const char = getCharacter(line.by)
  const rel = `${char.id}/${missionId}-${pad(index)}.mp3`
  if (manifest instanceof Set && manifest.has(rel)) return asset(`voice/${rel}`)
  return null
}

/* ── 오디오 파일 재생 (1·2단계 공용) ───────────────────────────── */

function playAudio(url, { revoke = false } = {}) {
  let cancelled = false
  let audio = null

  const promise = new Promise((resolve) => {
    audio = new Audio(url)
    audio.preload = 'auto'

    const cleanup = () => {
      if (revoke) URL.revokeObjectURL(url)
    }
    const finish = (ok) => {
      if (cancelled) return
      cleanup()
      resolve(ok)
    }

    audio.onended = () => finish(true)
    audio.onerror = () => finish(false)

    audio.play().catch(() => finish(false))
  })

  return {
    promise,
    cancel() {
      cancelled = true
      if (audio) {
        audio.pause()
        audio = null
      }
      if (revoke) URL.revokeObjectURL(url)
    },
  }
}

/* ── 2단계: 서버 TTS ───────────────────────────────────────────── */

/** 문장별로 mp3를 받아 이어서 재생한다. 하나라도 실패하면 false. */
function playViaServer(text, character) {
  const sentences = splitSentences(text)
  if (!sentences.length) return { promise: Promise.resolve(false), cancel() {} }

  let cancelled = false
  let current = null
  const controller = new AbortController()

  const promise = (async () => {
    for (const sentence of sentences) {
      if (cancelled) return true
      const url = await synthesize(sentence, character, { signal: controller.signal })
      if (!url || cancelled) return cancelled
      current = playAudio(url)
      const ok = await current.promise
      if (!ok) return false
    }
    return true
  })()

  return {
    promise,
    cancel() {
      cancelled = true
      controller.abort()
      current?.cancel()
    },
  }
}

/* ── 한 줄 재생 ─────────────────────────────────────────────────── */

/**
 * @param {object} line  { by, text, ... }
 * @param {object} opts  { missionId, index, useSynth, roster, speed }
 * @returns {{ promise: Promise<'played'|'spoken'|'silent'|'cancelled'>, cancel: Function }}
 */
export function playLine(
  line,
  { missionId, index = 0, useSynth = true, roster, speed = 1 } = {},
) {
  const character = getCharacter(line.by)
  let cancelled = false
  let inner = null
  let timer = null

  const promise = (async () => {
    // 4단계: 무음 + 자막 타이밍
    const silent = () =>
      new Promise((resolve) => {
        timer = setTimeout(() => resolve(cancelled ? 'cancelled' : 'silent'), estimateDuration(line.text))
      })

    if (!useSynth) return silent()

    // 1단계: 녹음 파일
    await ensureManifest()
    if (cancelled) return 'cancelled'
    const fileUrl = resolveVoiceUrl(line, missionId, index)
    if (fileUrl) {
      inner = playAudio(fileUrl)
      if (await inner.promise) return 'played'
      if (cancelled) return 'cancelled'
    }

    // 2단계: 서버 TTS (키가 있을 때만 켜져 있다)
    ensureProbe()
    if (ttsStatus().state === 'on') {
      inner = playViaServer(line.text, character)
      if (await inner.promise) return 'played'
      if (cancelled) return 'cancelled'
    }

    // 3단계: 브라우저 내장 음성 — 기본 경로
    if (isSynthSupported()) {
      inner = speak(line.text, { character, roster, speed })
      if (await inner.promise) return 'spoken'
      if (cancelled) return 'cancelled'
    }

    return silent()
  })()

  return {
    promise,
    cancel() {
      cancelled = true
      clearTimeout(timer)
      inner?.cancel()
    },
  }
}

/* ── 여러 줄 순차 재생 ──────────────────────────────────────────── */

/**
 * onLine 콜백으로 자막을 갱신하면서 대사를 차례로 읽는다.
 * @returns {Function} 중단 함수
 */
export function playSequence(
  lines,
  { missionId, onLine, onDone, gap = 380, useSynth = true, roster, speed = 1 } = {},
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
      current = playLine(line, { missionId, index: i, useSynth, roster, speed })
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
    clearTimeout(gapTimer)
    stopAll()
  }
}
