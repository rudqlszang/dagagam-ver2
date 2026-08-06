/**
 * /api/tts — 문장 하나를 음성 파일(mp3)로 (선택 기능)
 *
 * ▸ 아무 키도 없으면 GET은 { available:false }, POST는 501.
 *   → 앱은 브라우저 내장 음성으로 말한다. 무료 · 이게 기본이다.
 * ▸ 키를 넣으면 그 순간부터 성우급 음성으로 바뀐다. 코드 수정은 필요 없다.
 *
 * 지원 제공자 (있는 것 중 위에서부터 사용)
 *   GOOGLE_TTS_API_KEY  Google Cloud Text-to-Speech — 한국어 품질이 가장 안정적
 *   OPENAI_API_KEY      OpenAI TTS
 *   ELEVENLABS_API_KEY  ElevenLabs (ELEVENLABS_VOICE_ID_F / _M 로 목소리 지정)
 *
 * 모두 유료 API다. 무료로만 굴리려면 아무것도 설정하지 않으면 된다.
 */

const GOOGLE_VOICE = {
  female: process.env.GOOGLE_TTS_VOICE_F || 'ko-KR-Neural2-A',
  male: process.env.GOOGLE_TTS_VOICE_M || 'ko-KR-Neural2-C',
}

const OPENAI_VOICE = {
  female: process.env.OPENAI_TTS_VOICE_F || 'shimmer',
  male: process.env.OPENAI_TTS_VOICE_M || 'echo',
}

const ELEVEN_VOICE = {
  female: process.env.ELEVENLABS_VOICE_ID_F || '',
  male: process.env.ELEVENLABS_VOICE_ID_M || '',
}

function activeProvider() {
  if (process.env.GOOGLE_TTS_API_KEY) return 'google'
  if (process.env.OPENAI_API_KEY) return 'openai'
  if (process.env.ELEVENLABS_API_KEY) return 'elevenlabs'
  return null
}

/* ── 제공자별 합성 ─────────────────────────────────────────────── */

async function google(text, { gender, pitch, rate }) {
  const res = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_TTS_API_KEY}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: 'ko-KR', name: GOOGLE_VOICE[gender] ?? GOOGLE_VOICE.female },
        audioConfig: {
          audioEncoding: 'MP3',
          // 브라우저 음성용 pitch(0.6~2.0)를 구글 스케일(-20~20 반음)로 옮긴다
          pitch: Math.max(-20, Math.min(20, (pitch - 1) * 8)),
          speakingRate: Math.max(0.25, Math.min(4, rate)),
        },
      }),
    },
  )
  if (!res.ok) throw new Error(`google ${res.status}`)
  const body = await res.json()
  if (!body.audioContent) throw new Error('google empty')
  return Buffer.from(body.audioContent, 'base64')
}

async function openai(text, { gender, rate }) {
  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts',
      voice: OPENAI_VOICE[gender] ?? OPENAI_VOICE.female,
      input: text,
      speed: Math.max(0.25, Math.min(4, rate)),
      instructions: '한국 초등학생 또래 친구처럼 밝고 또박또박 말해 주세요.',
    }),
  })
  if (!res.ok) throw new Error(`openai ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

async function elevenlabs(text, { gender }) {
  const voiceId = ELEVEN_VOICE[gender] || ELEVEN_VOICE.female || ELEVEN_VOICE.male
  if (!voiceId) throw new Error('elevenlabs voice id missing')

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': process.env.ELEVENLABS_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2',
      voice_settings: { stability: 0.4, similarity_boost: 0.75 },
    }),
  })
  if (!res.ok) throw new Error(`elevenlabs ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

const SYNTHESIZERS = { google, openai, elevenlabs }

/* ── 핸들러 ─────────────────────────────────────────────────────── */

export default async function handler(req, res) {
  const provider = activeProvider()

  if (req.method === 'GET') {
    res.setHeader('content-type', 'application/json')
    res.status(200).json({ available: Boolean(provider), provider })
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' })
    return
  }

  if (!provider) {
    // 무료 기본 모드 — 앱은 브라우저 내장 음성으로 말한다
    res.status(501).json({ error: 'not_configured' })
    return
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body ?? {})
    const text = (body.text ?? '').toString().slice(0, 400).trim()
    if (!text) {
      res.status(400).json({ error: 'empty_text' })
      return
    }

    const audio = await SYNTHESIZERS[provider](text, {
      gender: body.gender === 'male' ? 'male' : 'female',
      pitch: Number(body.pitch) || 1,
      rate: Number(body.rate) || 1,
    })

    res.setHeader('content-type', 'audio/mpeg')
    res.setHeader('cache-control', 'public, max-age=86400')
    res.status(200).send(audio)
  } catch (err) {
    console.error('[api/tts]', err?.message ?? err)
    // 실패해도 앱은 브라우저 음성으로 말한다
    res.status(502).json({ error: 'synthesis_failed' })
  }
}
