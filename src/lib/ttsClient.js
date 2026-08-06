/**
 * 선택형 TTS API 클라이언트 — 기본값은 "꺼짐"
 *
 * 이 앱은 API 키 없이 100% 무료로 동작하는 것이 기본이다.
 * 서버에 TTS 키(OPENAI_API_KEY / GOOGLE_TTS_API_KEY / ELEVENLABS_API_KEY)를
 * 넣어 둔 경우에만 이 경로가 켜지고, 더 자연스러운 성우급 음성을 쓴다.
 *
 * 동작
 *  1. 첫 재생 때 /api/tts 를 한 번만 조용히 물어본다. (백그라운드, 대기 없음)
 *  2. available:false 거나 응답이 없으면(=정적 호스팅) 다시는 묻지 않는다.
 *  3. 켜져 있으면 문장을 mp3로 받아 재생하고, 같은 문장은 캐시해서 재요청하지 않는다.
 *
 * 어느 단계에서 실패하든 voicePlayer가 브라우저 음성으로 내려가므로
 * 데모가 끊기는 일은 없다.
 */

const ENDPOINT = '/api/tts'
const CACHE_LIMIT = 40

/** 'unknown' | 'checking' | 'on' | 'off' */
let state = 'unknown'
let provider = null
let probe = null

const cache = new Map()

export function ttsStatus() {
  return { state, provider }
}

/** 백그라운드 확인 — 절대 기다리지 않는다 */
export function ensureProbe() {
  if (state !== 'unknown') return probe ?? Promise.resolve(state)
  state = 'checking'

  probe = fetch(ENDPOINT, { method: 'GET' })
    .then(async (res) => {
      if (!res.ok) throw new Error(String(res.status))
      const type = res.headers.get('content-type') ?? ''
      if (!type.includes('application/json')) throw new Error('not-json')
      const body = await res.json()
      if (body?.available) {
        state = 'on'
        provider = body.provider ?? 'server'
      } else {
        state = 'off'
      }
      return state
    })
    .catch(() => {
      // 정적 호스팅(GitHub Pages 등)에서는 여기로 온다 — 무료 경로 유지
      state = 'off'
      return state
    })

  return probe
}

function cacheKey(text, character) {
  return `${character?.id ?? 'x'}::${text}`
}

function remember(key, url) {
  cache.set(key, url)
  if (cache.size > CACHE_LIMIT) {
    const oldest = cache.keys().next().value
    const stale = cache.get(oldest)
    cache.delete(oldest)
    URL.revokeObjectURL(stale)
  }
}

/**
 * 문장을 음성 파일 URL로 바꾼다. 쓸 수 없으면 null.
 * @returns {Promise<string|null>} objectURL
 */
export async function synthesize(text, character, { signal } = {}) {
  if (state !== 'on') return null

  const key = cacheKey(text, character)
  const hit = cache.get(key)
  if (hit) return hit

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      signal,
      body: JSON.stringify({
        text,
        characterId: character?.id,
        gender: character?.voice?.gender ?? 'female',
        pitch: character?.voice?.pitch ?? 1,
        rate: character?.voice?.rate ?? 1,
      }),
    })
    if (!res.ok) {
      if (res.status === 501 || res.status === 404) state = 'off'
      return null
    }
    const blob = await res.blob()
    if (!blob.size) return null
    const url = URL.createObjectURL(blob)
    remember(key, url)
    return url
  } catch {
    return null
  }
}
