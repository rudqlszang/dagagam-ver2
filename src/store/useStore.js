/**
 * 다가감 전역 스토어 (ver2)
 *
 * ▸ 로그인이 없다. 누구나 링크로 들어와 역할만 고르면 바로 쓴다.
 * ▸ 대화·알림장 같은 "이번 방문의 데이터"는 여전히 메모리에만 둔다.
 *   새로고침하면 초기 화면에서 다시 시작한다. (체험용 프로토타입)
 * ▸ 단, ver2에서 아이가 직접 만든 것 — 닉네임, 고른 친구, 만든 친구, 설정 —
 *   은 localStorage에 저장한다. 애써 만든 친구가 새로고침에 사라지면 안 되니까.
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
import {
  BUILTIN_CHARACTERS,
  defaultPartnerFor,
  getCharacter,
  registerCustomCharacters,
} from '../mock/characters'
import { buildCast } from '../lib/cast'

const DEFAULT_CODE = 'DAGA-2914'
const STORAGE_KEY = 'dagagam.v2'

/* ── 저장 / 복원 ────────────────────────────────────────────────── */

const DEFAULT_PROFILE = {
  nickname: '리엔',
  friendId: 'minjun',
  partnerId: 'seoyeon',
  customFriends: [],
  settings: {
    subtitles: true, // 실시간 자막 on/off
    voice: true, // 친구 목소리 켜기
    voiceSpeed: 1, // 말하기 속도 0.8 ~ 1.2
    parentLang: 'vi', // 부모 요약 언어 — 기본은 가정의 모국어
    autoWordCard: true, // 쉬운 설명 카드 자동 표시
  },
}

function loadProfile() {
  if (typeof localStorage === 'undefined') return DEFAULT_PROFILE
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_PROFILE
    const saved = JSON.parse(raw)
    return {
      ...DEFAULT_PROFILE,
      ...saved,
      customFriends: Array.isArray(saved.customFriends) ? saved.customFriends : [],
      settings: { ...DEFAULT_PROFILE.settings, ...(saved.settings ?? {}) },
    }
  } catch {
    return DEFAULT_PROFILE
  }
}

const profile = loadProfile()
// React 밖(voicePlayer 등)에서도 커스텀 캐릭터를 찾을 수 있게 등록해 둔다
registerCustomCharacters(profile.customFriends)

function persist(state) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        nickname: state.nickname,
        friendId: state.friendId,
        partnerId: state.partnerId,
        customFriends: state.customFriends,
        settings: state.settings,
      }),
    )
  } catch {
    /* 사파리 프라이빗 모드 등 — 저장 실패는 무시하고 계속 쓴다 */
  }
}

/* ── 초기 상태 ──────────────────────────────────────────────────── */

const seedAffinity = () => {
  const base = { minjun: 32, seoyeon: 27 }
  for (const c of BUILTIN_CHARACTERS) if (base[c.id] == null) base[c.id] = 0
  for (const c of profile.customFriends) base[c.id] = 0
  return base
}

const initialState = {
  /* 연결 */
  familyCode: DEFAULT_CODE,
  role: null, // 'child' | 'parent' | 'teacher'

  /* 아이 */
  consented: false,
  nickname: profile.nickname,
  activeChildId: 'child-1',

  /* 친구 */
  friendId: profile.friendId, // 아이가 고른 짝꿍
  partnerId: profile.partnerId, // 함께 나오는 친구
  customFriends: profile.customFriends, // 직접 만든 친구들
  affinity: seedAffinity(),

  /* 설정 */
  settings: profile.settings,

  /* 공유 데이터 */
  sessions: SEED_TRANSCRIPTS, // 아이 → 부모 (대화 기록)
  notices: SEED_NOTICES, // 교사 → 부모 (알림장)
  sendHistory: SEED_SEND_HISTORY, // 교사 발송 히스토리
}

export const useStore = create((set, get) => ({
  ...initialState,

  /* ── 연결 / 역할 ─────────────────────────────── */
  setRole: (role) => set({ role }),
  setFamilyCode: (familyCode) =>
    set({ familyCode: familyCode.trim().toUpperCase() || DEFAULT_CODE }),

  /* ── 아이 ───────────────────────────────────── */
  setConsent: (consented) => set({ consented }),
  setNickname: (nickname) => {
    set({ nickname: nickname.trim() || '친구' })
    persist(get())
  },
  setActiveChild: (activeChildId) => set({ activeChildId }),

  updateSettings: (patch) => {
    set((s) => ({ settings: { ...s.settings, ...patch } }))
    persist(get())
  },

  /* ── 친구 고르기 / 만들기 ───────────────────── */

  /** 짝꿍을 바꾼다. 짝꿍과 겹치면 함께 나오는 친구도 자동으로 옮긴다. */
  selectFriend: (friendId) => {
    set((s) => {
      const partnerId =
        s.partnerId === friendId ? defaultPartnerFor(friendId) : s.partnerId
      const affinity = { ...s.affinity }
      if (affinity[friendId] == null) affinity[friendId] = 0
      if (affinity[partnerId] == null) affinity[partnerId] = 0
      return { friendId, partnerId, affinity }
    })
    persist(get())
  },

  setPartner: (partnerId) => {
    set((s) => {
      if (partnerId === s.friendId) return {}
      const affinity = { ...s.affinity }
      if (affinity[partnerId] == null) affinity[partnerId] = 0
      return { partnerId, affinity }
    })
    persist(get())
  },

  /** 직접 만든 친구를 추가하고 바로 짝꿍으로 세운다 */
  addCustomFriend: (character) => {
    set((s) => {
      const customFriends = [...s.customFriends, character]
      registerCustomCharacters(customFriends)
      return {
        customFriends,
        friendId: character.id,
        partnerId:
          s.partnerId === character.id ? defaultPartnerFor(character.id) : s.partnerId,
        affinity: { ...s.affinity, [character.id]: 0 },
      }
    })
    persist(get())
    return character
  },

  removeCustomFriend: (id) => {
    set((s) => {
      const customFriends = s.customFriends.filter((c) => c.id !== id)
      registerCustomCharacters(customFriends)
      return {
        customFriends,
        friendId: s.friendId === id ? 'minjun' : s.friendId,
        partnerId: s.partnerId === id ? 'seoyeon' : s.partnerId,
      }
    })
    persist(get())
  },

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
      castIds: session.castIds ?? [],
      source: session.source ?? 'script',
    }

    set((s) => {
      const talkedTo = new Set(
        session.lines.filter((l) => l.by !== 'user').map((l) => l.by),
      )
      const bump = Math.min(12, 4 + Math.round(summary.utterances * 1.2))
      const affinity = { ...s.affinity }
      talkedTo.forEach((id) => {
        affinity[id] = Math.min(100, (affinity[id] ?? 0) + bump)
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

/** 지금 무대에 서는 두 친구 */
export function useCast() {
  const friendId = useStore((s) => s.friendId)
  const partnerId = useStore((s) => s.partnerId)
  const customFriends = useStore((s) => s.customFriends)
  // customFriends가 바뀌면 레지스트리도 최신인지 확인 (새로고침 직후 대비)
  registerCustomCharacters(customFriends)
  return buildCast(friendId, partnerId)
}

/** 고를 수 있는 친구 전체 = 기본 6명 + 직접 만든 친구 */
export function useFriendRoster() {
  const customFriends = useStore((s) => s.customFriends)
  registerCustomCharacters(customFriends)
  return [...BUILTIN_CHARACTERS, ...customFriends]
}

export function useFriend() {
  const friendId = useStore((s) => s.friendId)
  const customFriends = useStore((s) => s.customFriends)
  registerCustomCharacters(customFriends)
  return getCharacter(friendId)
}

export function useStats() {
  const sessions = useStore((s) => s.sessions)
  const affinity = useStore((s) => s.affinity)

  const utteranceCount = sessions.reduce((sum, s) => sum + (s.utterances ?? 0), 0)
  const wordSet = new Set(sessions.flatMap((s) => s.newWords ?? []))
  const values = Object.values(affinity)
  const maxAffinity = values.length ? Math.max(...values) : 0

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
