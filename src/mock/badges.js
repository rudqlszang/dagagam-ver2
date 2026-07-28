/**
 * 마이페이지 뱃지 정의
 * - mission 뱃지: 해당 미션을 한 번이라도 끝내면 획득
 * - milestone 뱃지: 누적 지표 조건으로 획득
 */

export const MISSION_BADGES = [
  { id: 'group-project', emoji: '🧩', label: '조별과제 마스터', accent: 'brand' },
  { id: 'kpop', emoji: '🎤', label: '케이팝 수다왕', accent: 'grape' },
  { id: 'first-day', emoji: '🎒', label: '첫인사 성공', accent: 'sun' },
  { id: 'pe-team', emoji: '⚽', label: '같이 하자!', accent: 'mint' },
  { id: 'birthday', emoji: '🎂', label: '초대장 받기', accent: 'coral' },
  { id: 'convenience-store', emoji: '🏪', label: '혼자서 계산', accent: 'brand' },
]

export const MILESTONE_BADGES = [
  {
    id: 'first-talk',
    emoji: '🌱',
    label: '첫 대화',
    accent: 'mint',
    hint: '대화 1번 완료',
    test: (s) => s.sessionCount >= 1,
  },
  {
    id: 'talk-5',
    emoji: '🔥',
    label: '대화 5번',
    accent: 'coral',
    hint: '대화 5번 완료',
    test: (s) => s.sessionCount >= 5,
  },
  {
    id: 'words-10',
    emoji: '📚',
    label: '새 단어 10개',
    accent: 'grape',
    hint: '새 단어 10개 배우기',
    test: (s) => s.wordCount >= 10,
  },
  {
    id: 'utter-50',
    emoji: '🎙️',
    label: '50번 말하기',
    accent: 'sun',
    hint: '누적 발화 50번',
    test: (s) => s.utteranceCount >= 50,
  },
  {
    id: 'bestie',
    emoji: '💛',
    label: '단짝 친구',
    accent: 'brand',
    hint: '친밀도 80 넘기기',
    test: (s) => s.maxAffinity >= 80,
  },
]
