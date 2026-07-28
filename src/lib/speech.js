/**
 * Web Speech API (SpeechRecognition) 얇은 래퍼
 *
 * - 크롬/엣지 기준 동작. 미지원 브라우저는 isSpeechSupported()로 걸러 안내 문구를 띄운다.
 * - 마이크 권한 거부는 onError('denied')로 통일해서 올려 준다.
 * - confidence 값을 그대로 넘겨 준다 → 부모 화면의 "발음 점수" mock 재료로 쓰인다.
 */

function getCtor() {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

export function isSpeechSupported() {
  return Boolean(getCtor())
}

/** 브라우저가 지원하면 현재 마이크 권한 상태를 반환. 알 수 없으면 'unknown' */
export async function queryMicPermission() {
  try {
    if (!navigator.permissions?.query) return 'unknown'
    const status = await navigator.permissions.query({ name: 'microphone' })
    return status.state // 'granted' | 'denied' | 'prompt'
  } catch {
    return 'unknown'
  }
}

/** 명시적으로 마이크 권한을 요청한다. 성공하면 트랙을 바로 닫는다. */
export async function requestMicPermission() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    stream.getTracks().forEach((t) => t.stop())
    return { ok: true }
  } catch (err) {
    const denied =
      err?.name === 'NotAllowedError' || err?.name === 'SecurityError'
    return {
      ok: false,
      reason: denied ? 'denied' : 'unavailable',
      message: denied
        ? '마이크 사용이 거부되었어요.'
        : '마이크를 찾을 수 없어요.',
    }
  }
}

const ERROR_MESSAGES = {
  'not-allowed': '마이크 사용이 막혀 있어요.',
  'service-not-allowed': '마이크 사용이 막혀 있어요.',
  'no-speech': '소리가 잘 안 들렸어요. 다시 한번 말해 볼까요?',
  'audio-capture': '마이크를 찾을 수 없어요.',
  network: '인터넷 연결을 확인해 주세요.',
  aborted: null, // 사용자가 직접 멈춘 경우 — 에러로 취급하지 않음
}

/**
 * 인식기 생성
 * @returns {{start:Function, stop:Function, abort:Function, supported:boolean}}
 */
export function createRecognizer({
  lang = 'ko-KR',
  onInterim,
  onFinal,
  onError,
  onStart,
  onEnd,
} = {}) {
  const Ctor = getCtor()
  if (!Ctor) {
    return {
      supported: false,
      start: () => onError?.('unsupported', '이 브라우저는 음성 인식을 지원하지 않아요.'),
      stop: () => {},
      abort: () => {},
    }
  }

  const rec = new Ctor()
  rec.lang = lang
  rec.continuous = false
  rec.interimResults = true
  rec.maxAlternatives = 1

  let finished = false

  rec.onstart = () => {
    finished = false
    onStart?.()
  }

  rec.onresult = (event) => {
    let interim = ''
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const result = event.results[i]
      const alt = result[0]
      if (result.isFinal) {
        finished = true
        onFinal?.(alt.transcript.trim(), alt.confidence ?? 0.75)
      } else {
        interim += alt.transcript
      }
    }
    if (interim) onInterim?.(interim.trim())
  }

  rec.onerror = (event) => {
    const key = event.error
    if (key === 'aborted') return
    const denied = key === 'not-allowed' || key === 'service-not-allowed'
    onError?.(
      denied ? 'denied' : key,
      ERROR_MESSAGES[key] ?? '음성 인식에 문제가 생겼어요.',
    )
  }

  rec.onend = () => {
    onEnd?.(finished)
  }

  return {
    supported: true,
    start: () => {
      try {
        rec.start()
      } catch {
        /* 이미 실행 중이면 무시 */
      }
    },
    stop: () => {
      try {
        rec.stop()
      } catch {
        /* noop */
      }
    },
    abort: () => {
      try {
        rec.abort()
      } catch {
        /* noop */
      }
    },
  }
}
