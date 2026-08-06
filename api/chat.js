/**
 * /api/chat — AI 친구의 다음 대사 생성 (선택 기능)
 *
 * ▸ ANTHROPIC_API_KEY 가 없으면 GET은 { available:false }, POST는 501을 돌려준다.
 *   → 앱은 즉시 로컬 스크립트로 내려가고, 아무 비용 없이 데모가 끝까지 돌아간다.
 * ▸ 키가 있으면 아이가 고른 캐릭터의 페르소나로 실제 대사를 만들어 준다.
 *
 * 키는 서버에만 둔다. 브라우저 번들에는 절대 들어가지 않는다.
 *
 * 환경변수
 *   ANTHROPIC_API_KEY  (필수 — 없으면 기능 자체가 꺼진다)
 *   ANTHROPIC_MODEL    (선택 — 기본 claude-opus-5)
 */

import Anthropic from '@anthropic-ai/sdk'

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-5'

/** 응답 형식을 스키마로 못 박아 둔다 — 파싱 실패로 대화가 끊기지 않게 */
const REPLY_SCHEMA = {
  type: 'object',
  properties: {
    lines: {
      type: 'array',
      description: '친구들이 이어서 하는 말. 1~2줄.',
      items: {
        type: 'object',
        properties: {
          by: {
            type: 'string',
            enum: ['primary', 'partner'],
            description: '말하는 친구',
          },
          text: {
            type: 'string',
            description: '한국어 대사 한 줄. 초등 저학년이 알아들을 수 있게 짧게.',
          },
          word: {
            type: 'string',
            description:
              '이 대사에 나온 어려운 낱말이 있으면 그 낱말 하나. 없으면 빈 문자열.',
          },
        },
        required: ['by', 'text', 'word'],
        additionalProperties: false,
      },
    },
  },
  required: ['lines'],
  additionalProperties: false,
}

function describeFriend(label, c) {
  const bits = [
    `- ${label}: ${c.name}`,
    `  성격/말투: ${c.persona}`,
    c.traits?.length ? `  특징: ${c.traits.join(', ')}` : null,
    c.likes?.length ? `  좋아하는 것: ${c.likes.join(', ')}` : null,
    c.background ? `  배경: ${c.background}` : null,
  ]
  return bits.filter(Boolean).join('\n')
}

function buildSystem({ mission, characters, child, classNote }) {
  return `너는 한국 초등학교 교실을 배경으로 하는 대화 연습 앱의 "AI 친구" 두 명을 동시에 연기한다.
대화 상대는 한국어를 배우는 중인 이주배경 초등학생이다.

[함께 있는 친구들]
${describeFriend('primary', characters.primary)}
${describeFriend('partner', characters.partner)}

[아이]
- 이름: ${child?.nickname ?? '친구'}
- 한국어가 아직 서툴다. 틀리게 말해도 된다.

[지금 상황]
- 미션: ${mission.title} — ${mission.desc}
- 연습하려는 것: ${(mission.tags ?? []).join(', ') || '자유 대화'}
${classNote ? `- 선생님이 알려 준 학급 정보: ${classNote}` : ''}

[말하는 방법]
- 반드시 한국어로만 말한다.
- 초등학교 저학년이 알아듣는 쉬운 말만 쓴다. 한 문장은 15자 안팎으로 짧게.
- 한 번에 1~2줄만 말한다. 두 친구가 다 말할 필요는 없다.
- 마지막 줄은 반드시 아이에게 묻는 질문으로 끝낸다. 아이가 말할 차례를 만들어 줘야 한다.
- 아이가 문법을 틀려도 절대 고쳐 주거나 지적하지 않는다. 대신 맞는 표현으로 자연스럽게 되받아 말해 준다.
- 아이가 말을 못 하거나 짧게 답해도 다그치지 않는다. 더 쉬운 질문으로 바꿔서 다시 묻는다.
- 어른처럼 설명하지 않는다. 또래 친구처럼 반말로 편하게 말한다.
- 어려운 낱말을 쓰게 되면 그 낱말을 word에 적는다. 없으면 word는 빈 문자열로 둔다.

[아이를 지키기 위한 규칙]
- 폭력, 성적인 내용, 술·담배·약물, 자해, 정치·종교 논쟁, 외모 비하, 특정 국가나 출신에 대한 편견은 어떤 형태로도 말하지 않는다.
- 아이의 이름·학교·주소·전화번호 같은 개인정보를 묻지 않는다.
- 아이가 힘든 일(따돌림, 무서운 일 등)을 이야기하면 판단하지 말고 먼저 마음을 알아주고, 믿을 수 있는 어른이나 선생님에게 이야기해 보자고 부드럽게 권한다.
- 무섭거나 슬픈 이야기로 대화를 끌고 가지 않는다.`
}

function buildMessages({ history, userText }) {
  const lines = (history ?? []).map((h) =>
    h.role === 'child' ? `아이: ${h.text}` : `친구(${h.name}): ${h.text}`,
  )
  lines.push(`아이: ${userText}`)

  return [
    {
      role: 'user',
      content: `지금까지의 대화야.\n\n${lines.join('\n')}\n\n이제 친구들이 할 말을 만들어 줘.`,
    },
  ]
}

export default async function handler(req, res) {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (req.method === 'GET') {
    res.setHeader('content-type', 'application/json')
    res.status(200).json({ available: Boolean(apiKey), model: apiKey ? MODEL : null })
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' })
    return
  }

  if (!apiKey) {
    // 무료 기본 모드 — 앱은 이 응답을 보고 로컬 스크립트로 진행한다
    res.status(501).json({ error: 'not_configured' })
    return
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body ?? {})
    const { mission, characters, child, classNote, history, userText } = body

    if (!mission?.title || !characters?.primary || !userText) {
      res.status(400).json({ error: 'bad_request' })
      return
    }

    const client = new Anthropic({ apiKey })

    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: buildSystem({ mission, characters, child, classNote }),
      messages: buildMessages({ history, userText }),
      output_config: {
        effort: 'low', // 짧은 또래 대화 — 깊게 생각할수록 오히려 늦고 장황해진다
        format: { type: 'json_schema', schema: REPLY_SCHEMA },
      },
    })

    // 안전 분류기가 거절하면 content가 비어 있을 수 있다 → 앱이 스크립트로 내려가게 둔다
    if (message.stop_reason === 'refusal') {
      res.status(200).json({ lines: [] })
      return
    }

    const text = message.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('')

    let parsed
    try {
      parsed = JSON.parse(text)
    } catch {
      res.status(200).json({ lines: [] })
      return
    }

    const lines = (parsed?.lines ?? [])
      .filter((l) => l?.text?.trim())
      .slice(0, 2)
      .map((l) => ({
        by: l.by === 'partner' ? 'partner' : 'primary',
        text: l.text.trim(),
        ...(l.word?.trim() ? { word: l.word.trim() } : {}),
      }))

    res.setHeader('content-type', 'application/json')
    res.status(200).json({ lines })
  } catch (err) {
    // 어떤 이유로 실패하든 앱은 스크립트로 이어간다
    console.error('[api/chat]', err?.status ?? '', err?.message ?? err)
    res.status(200).json({ lines: [] })
  }
}
