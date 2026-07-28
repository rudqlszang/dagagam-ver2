/**
 * 다가감 전역 스토어 (메모리 전용 — 저장하지 않는다)
 *
 * ▸ 로그인이 없다. 누구나 링크로 들어와 역할만 고르면 바로 쓴다.
 * ▸ 아무것도 저장하지 않는다. 새로고침하거나 다른 사람이 열면
 *   항상 같은 초기 화면에서 시작한다. (체험용 프로토타입)
 * ▸ 대신 한 번의 방문 안에서는 "연결 코드"로 묶인 것처럼
 *   아이 · 부모 · 교사 세 화면이 같은 데이터를 함께 본다.
 *
 * ▸ 연동되는 것들
 *   아이가 대화를 끝내면  → sessions 에 쌓이고
 *                        → 부모 대시보드의 발화 수 · 새 단어 · 대화 기록에 즉시 반영
 *                        → 교사 화면의 학생 적응도에도 반영
 *   교사가 알림장을 보내면 → 부모 화면 알림장 목록에 즉시 도착
 */

import { create } from 'zustand'
import { SEED_NOTICES, SEED_TRANSCRIPTS } from '../mock/parentData'
import { SEED_SEND_HISTORY } from '../mock/teacherData'
import { MISSION_BADGES, MILESTONE_BADGES } from '../mock/badges'

const DEFAULT_CODE = 'DAGA-2914'

const initialState = {
  /* 연결 */
  familyCode: DEFAULT_CODE,
  role: null, // 'child' | 'parent' | 'teacher'

  /* 아이 */
  consented: false,
  nickname: '리엔',
  activeChildId: 'child-1',
  affinity: { minjun: 32, seoyeon: 27 },

  /* 설정 */
  settings: {
    subtitles: true, // 실시간 자막 on/off
    voice: true, // 친구 목소리 (녹음 파일 없으면 브라우저 기본 음성)
    parentLang: 'vi', // 부모 요약 언어 — 기본은 가정의 모국어
    autoWordCard: true, // 쉬운 설명 카드 자동 표시
  },

  /* 공유 데이터 */
  sessions: SEED_TRANSCRIPTS, // 아이 → 부모 (대화 기록)
  notices: SEED_NOTICES, // 교사 → 부모 (알림장)
  sendHistory: SEED_SEND_HISTORY, // 교사 발송 히스토리
}

export const useStore = create((set) => ({
  ...initialState,

  /* ── 연결 / 역할 ─────────────────────────────── */
  setRole: (role) => set({ role }),
  setFamilyCode: (familyCode) =>
    set({ familyCode: familyCode.trim().toUpperCase() || DEFAULT_CODE }),

  /* ── 아이 ───────────────────────────────────── */
  setConsent: (consented) => set({ consented }),
  setNickname: (nickname) => set({ nickname: nickname.trim() || '친구' }),
  setActiveChild: (activeChildId) => set({ activeChildId }),

  updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

  /**
   * 대화 종료 시 호출. 세션을 기록하고 친밀도를 올린다.
   * 기록된 세션은 부모 · 교사 화면에서 그대로 읽힌다.
   */
  saveSession: (session, summary) => {
    const record = {
      id: session.id,
      missionId: session.missionId,
      missionTitle: session.missionTitle,
      date: new Date().toISOString().slice(0, 10),
      durationSec: summary.durationSec,
      utterances: summary.utterances,
      engagement: summary.engagement,
      pronunciation: summary.pronunciation,
      newWords: summary.words.map((w) => w.word),
      lines: session.lines,
    }

    set((s) => {
      const talkedTo = new Set(
        session.lines.filter((l) => l.by !== 'user').map((l) => l.by),
      )
      const bump = Math.min(12, 4 + Math.round(summary.utterances * 1.2))
      const affinity = { ...s.affinity }
      talkedTo.forEach((id) => {
        if (affinity[id] != null) {
          affinity[id] = Math.min(100, affinity[id] + bump)
        }
      })
      return { sessions: [record, ...s.sessions], affinity }
    })

    return record
  },

  /* ── 교사 → 부모 ────────────────────────────── */
  sendNotice: ({ title, original, easyKorean, recipients, langs }) => {
    const now = new Date()
    const notice = {
      id: `no-${now.getTime()}`,
      date: now.toISOString().slice(0, 10),
      from: '3학년 2반 김하늘 선생님',
      title: title || '제목 없는 알림장',
      original,
      translated: `[자동 번역 · ${langs.join(', ')}]\n\n${original}\n\n※ 프로토타입에서는 원문을 그대로 보여 줍니다. 실서비스에서는 학생별 모국어로 번역되어 전달됩니다.`,
      easyKorean,
      read: false,
    }
    const history = {
      id: `sh-${now.getTime()}`,
      sentAt: now.toISOString().slice(0, 16).replace('T', ' '),
      title: notice.title,
      recipients,
      langs,
      readCount: 0,
    }
    set((s) => ({
      notices: [notice, ...s.notices],
      sendHistory: [history, ...s.sendHistory],
    }))
    return notice
  },

  markNoticeRead: (id) =>
    set((s) => ({
      notices: s.notices.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),

  /* ── 유틸 ───────────────────────────────────── */
  resetAll: () => set({ ...initialState }),
}))

/* ── 파생 셀렉터 (컴포넌트에서 계산 대신 가져다 쓴다) ───────── */

export function useStats() {
  const sessions = useStore((s) => s.sessions)
  const affinity = useStore((s) => s.affinity)

  const utteranceCount = sessions.reduce((sum, s) => sum + (s.utterances ?? 0), 0)
  const wordSet = new Set(sessions.flatMap((s) => s.newWords ?? []))
  const maxAffinity = Math.max(...Object.values(affinity))

  return {
    sessionCount: sessions.length,
    utteranceCount,
    wordCount: wordSet.size,
    words: [...wordSet],
    maxAffinity,
    completedMissions: [...new Set(sessions.map((s) => s.missionId))],
  }
}

export function useBadges() {
  const stats = useStats()

  const mission = MISSION_BADGES.map((b) => ({
    ...b,
    kind: 'mission',
    earned: stats.completedMissions.includes(b.id),
    hint: '미션 완료하기',
  }))

  const milestone = MILESTONE_BADGES.map((b) => ({
    ...b,
    kind: 'milestone',
    earned: b.test(stats),
  }))

  const all = [...milestone, ...mission]
  return { badges: all, earnedCount: all.filter((b) => b.earned).length, stats }
}

/** 최근 7일 발화 수 — 실제 세션 기록을 요일별로 집계 */
export function useRecentWeek() {
  const sessions = useStore((s) => s.sessions)
  const DAYS = ['일', '월', '화', '수', '목', '금', '토']
  const today = new Date()

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (6 - i))
    const key = d.toISOString().slice(0, 10)
    const count = sessions
      .filter((s) => s.date === key)
      .reduce((sum, s) => sum + (s.utterances ?? 0), 0)
    return { day: DAYS[d.getDay()], date: key, 발화: count }
  })
}
