/**
 * 대화 엔진 (ver2)
 *
 * 화면(Conversation.jsx)은 아래 함수들만 호출한다.
 *    createSession(missionId, cast)
 *    getOpening(missionId, { cast })
 *    getReplies({ missionId, beatIndex, userText, cast, ... })
 *    summarize(session)
 *
 * 응답을 만드는 경로는 두 가지다.
 *
 *  A. 로컬 스크립트 (기본 · 무료 · 오프라인 가능)
 *     mock/dialogueScripts.js 의 대화 트리 + 키워드 매칭.
 *     API 키가 하나도 없어도 데모가 처음부터 끝까지 돌아간다.
 *
 *  B. 실제 Claude (선택)
 *     서버에 ANTHROPIC_API_KEY 가 있으면 /api/chat 이 켜지고,
 *     캐릭터 페르소나 + 미션 + 아이 발화를 넘겨 진짜 대답을 받는다.
 *     실패하거나 느리면 즉시 A로 내려간다. (아이를 기다리게 두지 않는다)
 *
 * 어느 쪽이든 반환 형식은 같다.
 *   lines: [{ by: <캐릭터 id>, text: string, word?: string, pause?: number }]
 */

import { getScript } from '../mock/dialogueScripts'
import { getMission } from '../mock/missions'
import { getWord, scanText } from '../mock/vocabulary'
import { castLines } from './cast'
import { chatStatus, ensureProbe, requestReplies } from './chatClient'

/** 응답이 즉시 오면 오히려 어색해서, 사람처럼 잠깐 뜸을 들인다 */
const THINKING_MS = [520, 900]

/** Claude가 이 시간 안에 답하지 않으면 스크립트로 넘어간다 */
const REMOTE_TIMEOUT_MS = 7000

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

export function createSession(missionId, cast) {
  const mission = getMission(missionId)
  return {
    id: `s-${Date.now()}`,
    missionId: mission.id,
    missionTitle: mission.title,
    startedAt: new Date().toISOString(),
    beatIndex: 0,
    castIds: cast ? cast.list.map((c) => c.id) : [],
    lines: [], // { by: 'user' | <캐릭터 id>, text, confidence? }
    learnedWords: [], // 세션 중 노출된 단어 키
    confidences: [],
    source: 'script', // 'script' | 'ai' — 이번 세션이 실제로 뭘 썼는지
  }
}

/** 대화 시작 시 AI가 먼저 건네는 말 */
export async function getOpening(missionId, { cast } = {}) {
  const script = getScript(missionId)
  ensureProbe() // Claude 사용 가능 여부를 백그라운드에서 확인해 둔다
  await wait(400)
  return { lines: castLines(script.opening, cast), phase: 'opening' }
}

/* ── 로컬 스크립트 응답 ─────────────────────────────────────────── */

function scriptReplies({ missionId, beatIndex, userText, cast }) {
  const script = getScript(missionId)
  const beat = script.beats[beatIndex]

  // 준비된 단계를 모두 지났으면 마무리 인사로 넘어간다
  if (!beat) {
    return {
      lines: castLines(script.closing, cast),
      nextBeatIndex: beatIndex,
      phase: 'closing',
    }
  }

  const spoken = (userText ?? '').trim()

  // 아이가 아무 말도 못 했을 때 — 단계를 넘기지 않고 부드럽게 다시 유도한다
  if (!spoken) {
    return {
      lines: castLines(beat.nudge ?? beat.fallback, cast),
      nextBeatIndex: beatIndex,
      phase: 'beat',
    }
  }

  const hit = (beat.match ?? []).find((rule) => matches(spoken, rule.any))
  const lines = castLines(hit ? hit.replies : beat.fallback, cast)

  const nextBeatIndex = beatIndex + 1
  const phase = nextBeatIndex >= script.beats.length ? 'last-beat' : 'beat'

  return { lines, nextBeatIndex, phase }
}

/* ── Claude 응답 ────────────────────────────────────────────────── */

/** 서버가 준 primary/partner 표기를 실제 캐릭터 id로 바꾼다 (혼자면 전부 짝꿍) */
function attachCast(lines, cast) {
  return lines.map((l) => ({
    by: l.by === 'partner' && cast.partner ? cast.partner.id : cast.primary.id,
    text: l.text,
    word: l.word,
  }))
}

async function remoteReplies({ missionId, beatIndex, userText, cast, session, nickname }) {
  if (chatStatus().state !== 'on') return null

  const mission = getMission(missionId)
  const history = (session?.lines ?? []).map((l) => ({
    role: l.by === 'user' ? 'child' : 'friend',
    name: l.by === 'user' ? nickname : l.by,
    text: l.text,
  }))

  const replies = await Promise.race([
    requestReplies({
      mission,
      cast,
      nickname,
      history,
      userText,
      turn: beatIndex,
    }),
    wait(REMOTE_TIMEOUT_MS).then(() => null),
  ])

  if (!replies?.length) return null
  return attachCast(replies, cast)
}

/* ── 공개 API ───────────────────────────────────────────────────── */

/**
 * 아이 발화에 대한 AI 응답을 만든다.
 * @returns {{ lines: Array, nextBeatIndex: number, phase: string, source: string }}
 */
export async function getReplies({
  missionId,
  beatIndex,
  userText,
  cast,
  session,
  nickname,
}) {
  const script = getScript(missionId)
  const spoken = (userText ?? '').trim()

  // 마지막 단계까지 갔으면 마무리는 항상 스크립트로 (요약 화면 흐름을 지킨다)
  const finished = beatIndex >= script.beats.length
  if (finished) {
    await wait(thinkingDelay())
    return { ...scriptReplies({ missionId, beatIndex, userText, cast }), source: 'script' }
  }

  // 아이가 말을 못 했을 땐 굳이 API를 쓰지 않는다 — 준비된 유도 문장이 더 낫다
  if (spoken) {
    const remote = await remoteReplies({
      missionId,
      beatIndex,
      userText: spoken,
      cast,
      session,
      nickname,
    })
    if (remote) {
      const nextBeatIndex = beatIndex + 1
      return {
        lines: remote,
        nextBeatIndex,
        phase: nextBeatIndex >= script.beats.length ? 'last-beat' : 'beat',
        source: 'ai',
      }
    }
  }

  await wait(thinkingDelay())
  return { ...scriptReplies({ missionId, beatIndex, userText, cast }), source: 'script' }
}

/** 마무리 인사 */
export function getClosing(missionId, cast) {
  return castLines(getScript(missionId).closing, cast)
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
