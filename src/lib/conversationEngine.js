/**
 * ★★ 대화 엔진 — Claude API 교체 지점 ★★
 *
 * 화면(Conversation.jsx)은 오직 아래 세 함수만 호출한다.
 *    getOpening(missionId)
 *    getReplies({ missionId, beatIndex, userText, history })
 *    summarize(session)
 *
 * 지금은 mock/dialogueScripts.js 의 대화 트리 + 키워드 매칭으로 응답을 만든다.
 * 나중에 실제 LLM을 붙일 때는 getReplies() 안쪽만 아래처럼 바꾸면 된다.
 *
 *   const res = await fetch('/api/chat', {
 *     method: 'POST',
 *     body: JSON.stringify({ missionId, userText, history }),
 *   })
 *   const { lines } = await res.json()
 *   return { lines, nextBeatIndex: beatIndex + 1, phase: 'beat' }
 *
 * 반환 형식(lines)만 지키면 화면 코드는 그대로 동작한다.
 *   lines: [{ by: 'minjun'|'seoyeon', text: string, word?: string, pause?: number }]
 */

import { getScript } from '../mock/dialogueScripts'
import { getMission } from '../mock/missions'
import { getWord, scanText } from '../mock/vocabulary'

/** 응답이 즉시 오면 오히려 어색해서, 사람처럼 잠깐 뜸을 들인다 */
const THINKING_MS = [520, 900]

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

function thinkingDelay() {
  const [min, max] = THINKING_MS
  return min + Math.random() * (max - min)
}

function normalize(text) {
  return (text ?? '').toLowerCase().replace(/[.,!?~]/g, '')
}

/** 키워드 매칭 — 공백 유무 양쪽으로 확인한다 */
function matches(userText, keywords) {
  const raw = normalize(userText)
  const tight = raw.replace(/\s+/g, '')
  return keywords.some((k) => {
    const key = normalize(k)
    return raw.includes(key) || tight.includes(key.replace(/\s+/g, ''))
  })
}

export function createSession(missionId) {
  const mission = getMission(missionId)
  return {
    id: `s-${Date.now()}`,
    missionId: mission.id,
    missionTitle: mission.title,
    startedAt: new Date().toISOString(),
    beatIndex: 0,
    lines: [], // { by: 'user'|'minjun'|'seoyeon', text, confidence? }
    learnedWords: [], // 세션 중 노출된 단어 키
    confidences: [],
  }
}

/** 대화 시작 시 AI가 먼저 건네는 말 */
export async function getOpening(missionId) {
  const script = getScript(missionId)
  await wait(400)
  return { lines: script.opening, phase: 'opening' }
}

/**
 * 아이 발화에 대한 AI 응답을 만든다.
 * @returns {{ lines: Array, nextBeatIndex: number, phase: 'beat'|'closing' }}
 */
export async function getReplies({ missionId, beatIndex, userText }) {
  const script = getScript(missionId)
  await wait(thinkingDelay())

  const beat = script.beats[beatIndex]

  // 준비된 단계를 모두 지났으면 마무리 인사로 넘어간다
  if (!beat) {
    return { lines: script.closing, nextBeatIndex: beatIndex, phase: 'closing' }
  }

  const spoken = (userText ?? '').trim()

  // 아이가 아무 말도 못 했을 때 — 단계를 넘기지 않고 부드럽게 다시 유도한다
  if (!spoken) {
    return {
      lines: beat.nudge ?? beat.fallback,
      nextBeatIndex: beatIndex,
      phase: 'beat',
    }
  }

  const hit = (beat.match ?? []).find((rule) => matches(spoken, rule.any))
  const lines = hit ? hit.replies : beat.fallback

  const nextBeatIndex = beatIndex + 1
  const phase = nextBeatIndex >= script.beats.length ? 'last-beat' : 'beat'

  return { lines, nextBeatIndex, phase }
}

/** 마무리 인사 */
export function getClosing(missionId) {
  return getScript(missionId).closing
}

/**
 * 대사 한 줄에서 띄워야 할 "쉬운 설명 카드"를 뽑는다.
 * - AI 대사: line.word 태그 우선
 * - 아이 발화: 사전 스캔
 */
export function extractWordCard(line) {
  if (line.word) return getWord(line.word)
  if (line.by === 'user') {
    const found = scanText(line.text)
    return found[0] ?? null
  }
  return null
}

/** 대화 종료 요약 카드 데이터 */
export function summarize(session) {
  const userLines = session.lines.filter((l) => l.by === 'user' && l.text?.trim())
  const utterances = userLines.length

  const totalChars = userLines.reduce(
    (sum, l) => sum + l.text.replace(/\s/g, '').length,
    0,
  )
  const avgLength = utterances ? Math.round(totalChars / utterances) : 0

  const confs = session.confidences?.length
    ? session.confidences
    : userLines.map((l) => l.confidence).filter((c) => typeof c === 'number')
  const avgConfidence = confs.length
    ? confs.reduce((a, b) => a + b, 0) / confs.length
    : 0

  // 참여도: 발화 횟수(60%) + 문장 길이(25%) + 인식 신뢰도(15%)
  const turnScore = Math.min(1, utterances / 6) * 60
  const lengthScore = Math.min(1, avgLength / 12) * 25
  const confScore = avgConfidence * 15
  const engagement = Math.round(turnScore + lengthScore + confScore)

  const words = [...new Set(session.learnedWords)].map(getWord).filter(Boolean)

  const durationSec = Math.max(
    30,
    Math.round((Date.now() - new Date(session.startedAt).getTime()) / 1000),
  )

  return {
    utterances,
    avgLength,
    engagement,
    pronunciation: Math.round(avgConfidence * 100) || null,
    words,
    durationSec,
    grade:
      engagement >= 80
        ? { label: '최고예요!', emoji: '🏆', tone: 'sun' }
        : engagement >= 55
          ? { label: '잘했어요!', emoji: '🌟', tone: 'brand' }
          : { label: '좋은 시작이에요', emoji: '🌱', tone: 'mint' },
  }
}
