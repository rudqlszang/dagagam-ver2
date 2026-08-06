/**
 * 선택형 Claude API 클라이언트 — 기본값은 "꺼짐"
 *
 * 서버에 ANTHROPIC_API_KEY 가 있을 때만 /api/chat 이 켜지고, 그때부터 AI 친구가
 * 스크립트가 아니라 실제로 생각해서 대답한다.
 * 키가 없으면(=기본, 무료) 이 모듈은 조용히 비활성화되고 대화는
 * mock/dialogueScripts.js 로 끝까지 진행된다.
 *
 * ttsClient.js 와 같은 방식으로 "한 번만 물어보고, 안 되면 다시 묻지 않는다".
 */

const ENDPOINT = '/api/chat'

/** 'unknown' | 'checking' | 'on' | 'off' */
let state = 'unknown'
let model = null
let probe = null

export function chatStatus() {
  return { state, model }
}

export function ensureProbe() {
  if (state !== 'unknown') return probe ?? Promise.resolve(state)
  state = 'checking'

  probe = fetch(ENDPOINT, { method: 'GET' })
    .then(async (res) => {
      if (!res.ok) throw new Error(String(res.status))
      const type = res.headers.get('content-type') ?? ''
      if (!type.includes('application/json')) throw new Error('not-json')
      const body = await res.json()
      state = body?.available ? 'on' : 'off'
      model = body?.model ?? null
      return state
    })
    .catch(() => {
      state = 'off'
      return state
    })

  return probe
}

/**
 * AI 친구의 다음 대사를 받아온다.
 *
 * @returns {Promise<Array|null>} [{ by: 'primary'|'partner', text, word? }] 또는 null(실패)
 */
export async function requestReplies({
  mission,
  cast,
  nickname,
  history,
  userText,
  turn,
  classNote,
}) {
  if (state !== 'on') return null

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        mission: {
          id: mission.id,
          title: mission.title,
          desc: mission.desc,
          tags: mission.tags,
        },
        characters: {
          primary: describe(cast.primary),
          partner: describe(cast.partner),
        },
        child: { nickname },
        classNote: classNote || null,
        history: (history ?? []).slice(-12),
        userText,
        turn,
      }),
    })
    if (!res.ok) {
      if (res.status === 501 || res.status === 404) state = 'off'
      return null
    }
    const body = await res.json()
    const lines = Array.isArray(body?.lines) ? body.lines : null
    if (!lines?.length) return null

    return lines
      .filter((l) => typeof l?.text === 'string' && l.text.trim())
      .slice(0, 3)
      .map((l) => ({
        by: l.by === 'partner' ? 'partner' : 'primary',
        text: l.text.trim(),
        word: typeof l.word === 'string' ? l.word : undefined,
      }))
  } catch {
    return null
  }
}

function describe(c) {
  return {
    name: c.name,
    persona: c.persona,
    traits: c.traits,
    likes: c.likes,
    background: c.background,
  }
}
