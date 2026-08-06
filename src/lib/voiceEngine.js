/**
 * 브라우저 내장 음성(SpeechSynthesis) 엔진 — 무료 · API 키 불필요
 *
 * ver1은 "아무 ko-KR 음성 + pitch 1.45"였다. 그래서 기계음처럼 들렸다.
 * ver2는 같은 무료 API로 최대한 자연스럽게 들리도록 네 가지를 한다.
 *
 *  1) 음성 고르기   — 브라우저가 가진 한국어 음성을 점수화해서 "신경망(Natural/
 *                    Neural/Online) 음성"을 우선 고른다. Edge의 SunHi·InJoon,
 *                    Chrome의 Google 한국의, macOS의 Yuna 같은 것들이다.
 *                    캐릭터마다 다른 음성을 배정해 목소리가 겹치지 않게 한다.
 *  2) 문장 쪼개기   — 긴 문장을 통째로 넘기면 억양이 뭉개지고, 크롬은 ~15초에서
 *                    말을 끊어 먹는다. 문장 단위로 잘라 차례로 읽고 사이에 숨을 준다.
 *  3) 억양 주기     — 물음표면 끝을 올리고, 느낌표면 조금 빠르고 높게, 말줄임표면
 *                    느리게. 같은 대사를 반복해도 미세하게 달라지도록 흔들어 준다.
 *  4) 버그 우회     — onend가 안 오는 브라우저, 탭 전환 시 멈추는 크롬,
 *                    사용자 제스처 전에는 소리가 안 나는 iOS를 각각 막아 준다.
 *
 * 유료 TTS API를 쓰고 싶다면 lib/ttsClient.js 를 보면 된다. (키가 없으면 자동 무시)
 */

/* ── 지원 여부 ──────────────────────────────────────────────────── */

export function isSynthSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

const synth = () => window.speechSynthesis

/* ── 음성 목록 ──────────────────────────────────────────────────── */

let voiceCache = null
let voicesPromise = null

function readVoices() {
  try {
    return synth().getVoices() ?? []
  } catch {
    return []
  }
}

/**
 * 브라우저의 음성 목록을 가져온다.
 * 크롬은 비동기로 채우기 때문에 voiceschanged 이벤트와 폴링을 함께 쓴다.
 */
export function primeVoices({ timeout = 2500 } = {}) {
  if (!isSynthSupported()) return Promise.resolve([])
  if (voiceCache?.length) return Promise.resolve(voiceCache)
  if (voicesPromise) return voicesPromise

  voicesPromise = new Promise((resolve) => {
    const settle = (list) => {
      voiceCache = list
      assignmentCache = null
      resolve(list)
    }

    const now = readVoices()
    if (now.length) return settle(now)

    let done = false
    const finish = () => {
      if (done) return
      const list = readVoices()
      if (!list.length) return
      done = true
      clearInterval(poll)
      clearTimeout(guard)
      synth().removeEventListener?.('voiceschanged', finish)
      settle(list)
    }

    synth().addEventListener?.('voiceschanged', finish)
    const poll = setInterval(finish, 150)
    const guard = setTimeout(() => {
      if (done) return
      done = true
      clearInterval(poll)
      synth().removeEventListener?.('voiceschanged', finish)
      settle(readVoices())
    }, timeout)
  })

  return voicesPromise
}

// 사용자가 언어팩을 새로 깔면 목록이 바뀐다 — 캐시를 비운다
if (isSynthSupported()) {
  synth().addEventListener?.('voiceschanged', () => {
    voiceCache = null
    voicesPromise = null
    assignmentCache = null
  })
}

const isKorean = (v) => (v.lang ?? '').toLowerCase().startsWith('ko')

/* ── 음성 점수 ──────────────────────────────────────────────────── */

/**
 * 이름만 보고 품질을 추정한다.
 * 브라우저가 품질 정보를 주지 않아서, 실제 음성 이름 패턴으로 판단한다.
 *   "Microsoft SunHi Online (Natural) - Korean (Korea)"  → 신경망
 *   "Google 한국의"                                        → 준수함
 *   "Microsoft Heami - Korean (Korea)"                    → 예전 음성
 */
function scoreVoice(v) {
  const name = (v.name ?? '').toLowerCase()
  let score = 0

  if (/natural|neural/.test(name)) score += 60
  if (/premium|enhanced|siri/.test(name)) score += 45
  if (/online/.test(name)) score += 30
  if (/google/.test(name)) score += 26
  if (v.localService === false) score += 14
  if (/compact|eloquence|espeak/.test(name)) score -= 40
  if (v.default) score += 3

  return score
}

const FEMALE_HINTS = [
  'sunhi',
  'sun-hi',
  'heami',
  'hea-mi',
  'jimin',
  'ji-min',
  'seohyeon',
  'seo-hyeon',
  'yujin',
  'yu-jin',
  'yuna',
  'sora',
  'nari',
  'female',
  '여성',
  '한국의', // "Google 한국의" — 여성 음성
]

const MALE_HINTS = [
  'injoon',
  'in-joon',
  'bongjin',
  'bong-jin',
  'gookmin',
  'gook-min',
  'hyunsu',
  'hyun-su',
  'jinho',
  'jin-ho',
  'minsu',
  'male',
  '남성',
]

function genderOf(v) {
  const name = (v.name ?? '').toLowerCase()
  if (MALE_HINTS.some((h) => name.includes(h))) return 'male'
  if (FEMALE_HINTS.some((h) => name.includes(h))) return 'female'
  return 'unknown'
}

/** 점수 높은 순으로 정렬된 한국어 음성 목록 */
function rankedVoices() {
  const list = (voiceCache ?? readVoices()).filter(isKorean)
  return [...list].sort((a, b) => scoreVoice(b) - scoreVoice(a))
}

/* ── 캐릭터별 음성 배정 ─────────────────────────────────────────── */

let assignmentCache = null

/**
 * 캐릭터 id → 음성.
 * 성별 힌트가 맞는 음성을 먼저 주고, 이미 쓴 음성은 피해서 목소리가 겹치지 않게 한다.
 * 음성이 하나뿐인 브라우저에서는 어쩔 수 없이 공유하되, pitch로 구분한다.
 */
function buildAssignment(characters) {
  const ranked = rankedVoices()
  const map = {}
  if (!ranked.length) return map

  const used = new Set()
  const pick = (wanted) => {
    const free = ranked.filter((v) => !used.has(v.name))
    const pool = free.length ? free : ranked
    return pool.find((v) => genderOf(v) === wanted) ?? pool[0]
  }

  // 배정 순서를 id로 고정 → 캐릭터가 추가돼도 기존 배정이 흔들리지 않는다
  const ordered = [...characters].sort((a, b) => a.id.localeCompare(b.id))
  for (const c of ordered) {
    const v = pick(c.voice?.gender ?? 'unknown')
    if (!v) break
    map[c.id] = v
    used.add(v.name)
  }
  return map
}

/**
 * 캐릭터에 배정된 음성을 돌려준다.
 * @param {object} character characters.js의 캐릭터 객체
 * @param {Array} roster 배정 대상 전체 목록 (없으면 이 캐릭터만)
 */
export function voiceFor(character, roster) {
  const list = roster?.length ? roster : [character]
  const key = `${list.map((c) => c.id).join('|')}::${(voiceCache ?? readVoices()).length}`
  if (!assignmentCache || assignmentCache.key !== key) {
    assignmentCache = { key, map: buildAssignment(list) }
  }
  return assignmentCache.map[character.id] ?? rankedVoices()[0] ?? null
}

/* ── 품질 리포트 (설정 화면에서 보여 준다) ──────────────────────── */

export function getVoiceReport() {
  if (!isSynthSupported()) {
    return { supported: false, tier: 'none', count: 0, best: null }
  }
  const ranked = rankedVoices()
  if (!ranked.length) {
    return { supported: true, tier: 'none', count: 0, best: null }
  }
  const best = ranked[0]
  const score = scoreVoice(best)
  const tier = score >= 55 ? 'natural' : score >= 20 ? 'good' : 'basic'
  return {
    supported: true,
    tier,
    count: ranked.length,
    best: { name: best.name, score },
  }
}

export const VOICE_TIER_LABEL = {
  natural: { emoji: '🌟', text: '자연스러운 음성', desc: '이 브라우저에는 사람에 가까운 한국어 음성이 있어요.' },
  good: { emoji: '🙂', text: '괜찮은 음성', desc: '들을 만한 한국어 음성으로 말해요.' },
  basic: { emoji: '🤖', text: '기본 음성', desc: '엣지(Edge) 브라우저에서 열면 훨씬 자연스러운 목소리로 들려요.' },
  none: { emoji: '🔇', text: '음성 없음', desc: '한국어 음성이 없어 자막으로만 보여 줘요.' },
}

/* ── 텍스트 다듬기 ──────────────────────────────────────────────── */

const EMOJI = /\p{Extended_Pictographic}/gu

/** TTS가 어색하게 읽는 기호를 정리한다 */
export function cleanForSpeech(text) {
  return (text ?? '')
    .replace(EMOJI, ' ')
    .replace(/[~〜]/g, '')
    .replace(/[…]|\.{3,}/g, ', ')
    .replace(/["“”'‘’]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * 문장 단위로 자른다.
 * - 한 덩이가 너무 길면(>80자) 쉼표에서 한 번 더 자른다.
 * - 크롬의 긴 발화 끊김 버그도 이걸로 같이 피해 간다.
 */
export function splitSentences(text, max = 80) {
  const base = cleanForSpeech(text)
  if (!base) return []

  const rough = base.match(/[^.!?]+[.!?]*/g) ?? [base]
  const out = []

  for (const raw of rough) {
    const s = raw.trim()
    if (!s) continue
    if (s.length <= max) {
      out.push(s)
      continue
    }
    let buf = ''
    for (const piece of s.split(/(?<=,)\s*/)) {
      if ((buf + piece).length > max && buf) {
        out.push(buf.trim())
        buf = piece
      } else {
        buf += piece
      }
    }
    if (buf.trim()) out.push(buf.trim())
  }
  return out
}

/** 자막이 자연스럽게 읽히는 속도로 무음 길이를 추정한다 */
export function estimateDuration(text) {
  const chars = cleanForSpeech(text).replace(/\s/g, '').length
  return Math.min(6200, Math.max(1300, 620 + chars * 105))
}

/* ── 억양 ───────────────────────────────────────────────────────── */

/**
 * 문장 부호에 따라 pitch/rate를 조금씩 바꾼다.
 * 같은 값을 반복하면 로봇처럼 들려서 아주 작은 흔들림(jitter)도 준다.
 */
function prosodyFor(sentence, base, index) {
  let { pitch, rate } = base
  const end = sentence.slice(-1)

  // 억양은 살리되 폭을 좁게 둔다 — 크게 흔들면 사람이 아니라 기계처럼 들린다
  if (end === '?') {
    pitch += 0.06
    rate -= 0.02
  } else if (end === '!') {
    pitch += 0.03
    rate += 0.05
  } else if (sentence.endsWith(', ') || sentence.endsWith(',')) {
    rate -= 0.04
  }

  // index 기반이라 같은 대사는 항상 같게 재생된다 (랜덤 아님)
  const jitter = ((index * 37) % 7) / 500 - 0.006
  pitch += jitter
  rate += jitter

  return {
    pitch: Math.min(1.4, Math.max(0.7, pitch)),
    rate: Math.min(1.6, Math.max(0.55, rate)),
  }
}

/** 문장이 끝난 뒤 쉬는 시간 */
function gapAfter(sentence) {
  const end = sentence.slice(-1)
  if (end === '?' || end === '!') return 220
  if (end === '.') return 170
  if (end === ',') return 90
  return 130
}

/* ── iOS/Safari 오디오 잠금 해제 ────────────────────────────────── */

let unlocked = false

/**
 * 모바일 브라우저는 "사용자가 화면을 터치한 뒤"에만 소리를 낼 수 있다.
 * 버튼 클릭 같은 첫 제스처에서 한 번 불러 주면 이후 재생이 막히지 않는다.
 */
export function unlockAudio() {
  if (unlocked || !isSynthSupported()) return
  unlocked = true
  try {
    const u = new SpeechSynthesisUtterance(' ')
    u.volume = 0
    u.lang = 'ko-KR'
    synth().speak(u)
    synth().cancel()
  } catch {
    /* noop */
  }
  primeVoices()
}

/* ── 크롬 끊김 방지 ─────────────────────────────────────────────── */

let keepAlive = null

function startKeepAlive() {
  if (keepAlive) return
  keepAlive = setInterval(() => {
    try {
      if (synth().speaking && !synth().paused) {
        synth().pause()
        synth().resume()
      }
    } catch {
      /* noop */
    }
  }, 9000)
}

function stopKeepAlive() {
  if (!keepAlive) return
  clearInterval(keepAlive)
  keepAlive = null
}

/* ── 재생 ───────────────────────────────────────────────────────── */

/** 한 문장 읽기 */
function speakSentence(sentence, { voice, pitch, rate, volume = 1 }) {
  let settled = false
  let guard = null
  let resolveFn

  const promise = new Promise((resolve) => {
    resolveFn = resolve
    const done = (ok) => {
      if (settled) return
      settled = true
      clearTimeout(guard)
      resolve(ok)
    }

    let u
    try {
      u = new SpeechSynthesisUtterance(sentence)
    } catch {
      return done(false)
    }

    u.lang = voice?.lang || 'ko-KR'
    if (voice) u.voice = voice
    u.pitch = pitch
    u.rate = rate
    u.volume = volume

    u.onend = () => done(true)
    u.onerror = (e) => done(e?.error === 'interrupted' || e?.error === 'canceled')

    // onend가 오지 않는 브라우저가 있어 안전망을 둔다
    guard = setTimeout(
      () => done(true),
      estimateDuration(sentence) / Math.max(0.6, rate) + 2500,
    )

    try {
      synth().speak(u)
      startKeepAlive()
    } catch {
      done(false)
    }
  })

  return {
    promise,
    cancel() {
      if (settled) return
      settled = true
      clearTimeout(guard)
      resolveFn?.(false)
    },
  }
}

/**
 * 한 대사를 문장 단위로 끊어 읽는다.
 *
 * @param {string} text 대사
 * @param {object} opts { character, roster, speed, onSentence }
 * @returns {{ promise: Promise<boolean>, cancel: Function }} 한 문장이라도 읽었으면 true
 */
export function speak(text, { character, roster, speed = 1, onSentence } = {}) {
  const sentences = splitSentences(text)
  if (!isSynthSupported() || !sentences.length) {
    return { promise: Promise.resolve(false), cancel() {} }
  }

  const voice = voiceFor(character, roster)
  const base = {
    // 음높이는 남/여 구분용이라 1 근처를 유지한다 (억지로 올리면 부자연스러워진다)
    pitch: character?.voice?.pitch ?? 1,
    rate: (character?.voice?.rate ?? 1) * speed,
  }

  let cancelled = false
  let current = null
  let gapTimer = null

  const promise = (async () => {
    let spokeAny = false
    try {
      synth().cancel() // 앞 대사가 남아 있으면 정리
    } catch {
      /* noop */
    }

    for (let i = 0; i < sentences.length; i += 1) {
      if (cancelled) break
      const sentence = sentences[i]
      onSentence?.(sentence, i)

      current = speakSentence(sentence, { voice, ...prosodyFor(sentence, base, i) })
      const ok = await current.promise
      spokeAny = spokeAny || ok

      // 첫 문장부터 실패하면 이 브라우저에서는 음성이 안 나는 것 — 바로 포기한다
      if (!ok && i === 0) break
      if (cancelled || i === sentences.length - 1) break

      await new Promise((r) => {
        gapTimer = setTimeout(r, gapAfter(sentence))
      })
    }

    stopKeepAlive()
    return spokeAny
  })()

  return {
    promise,
    cancel() {
      cancelled = true
      current?.cancel()
      clearTimeout(gapTimer)
      stopKeepAlive()
      try {
        synth().cancel()
      } catch {
        /* noop */
      }
    },
  }
}

/** 설정 화면의 "들어보기" — 캐릭터 목소리를 한 문장 미리 들려준다 */
export function previewVoice(character, { speed = 1, roster } = {}) {
  unlockAudio()
  const line = character?.custom
    ? `안녕! 나는 ${character.name}이야. 우리 같이 이야기하자!`
    : `안녕, 반가워! 나는 ${character?.name ?? '친구'}야. 오늘 뭐 했어?`
  return speak(line, { character, roster, speed })
}

/** 지금 말하고 있는 것을 전부 멈춘다 */
export function stopAll() {
  stopKeepAlive()
  try {
    if (isSynthSupported()) synth().cancel()
  } catch {
    /* noop */
  }
}
