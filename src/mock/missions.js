/**
 * 오늘의 대화 미션 목록
 * dialogueScripts.js 의 키와 id가 1:1로 대응된다.
 */

export const MISSIONS = [
  {
    id: 'group-project',
    emoji: '🧩',
    title: '조별과제 시뮬레이션',
    desc: '친구들과 역할을 나눠 보자',
    level: '보통',
    minutes: 5,
    accent: 'brand',
    tags: ['협동', '의견 말하기'],
  },
  {
    id: 'kpop',
    emoji: '🎤',
    title: 'K-pop 이야기',
    desc: '좋아하는 노래로 수다 떨기',
    level: '쉬움',
    minutes: 4,
    accent: 'grape',
    tags: ['취향 말하기', '공감'],
  },
  {
    id: 'first-day',
    emoji: '🎒',
    title: '전학 첫날',
    desc: '처음 만난 친구에게 인사하기',
    level: '쉬움',
    minutes: 4,
    accent: 'sun',
    tags: ['자기소개', '인사'],
  },
  {
    id: 'pe-team',
    emoji: '⚽',
    title: '체육시간 팀 정하기',
    desc: '같이 하고 싶다고 말해 보자',
    level: '보통',
    minutes: 5,
    accent: 'mint',
    tags: ['부탁하기', '거절하기'],
  },
  {
    id: 'birthday',
    emoji: '🎂',
    title: '생일파티 초대',
    desc: '초대하고, 초대받아 보기',
    level: '보통',
    minutes: 5,
    accent: 'coral',
    tags: ['초대', '약속 잡기'],
  },
  {
    id: 'convenience-store',
    emoji: '🏪',
    title: '편의점 계산하기',
    desc: '물건 사고 계산해 보기',
    level: '쉬움',
    minutes: 3,
    accent: 'brand',
    tags: ['생활 한국어', '숫자'],
  },
]

export function getMission(id) {
  return MISSIONS.find((m) => m.id === id) ?? MISSIONS[0]
}

/** 아이 화면 카드 배경/글자색 매핑 (Tailwind 클래스를 정적으로 유지하기 위해 테이블로 관리) */
export const ACCENT_STYLES = {
  brand: {
    bg: 'bg-brand-soft',
    fg: 'text-brand-deep',
    solid: 'bg-brand',
    ring: 'ring-brand/30',
  },
  sun: {
    bg: 'bg-sun-soft',
    fg: 'text-sun-deep',
    solid: 'bg-sun',
    ring: 'ring-sun/30',
  },
  coral: {
    bg: 'bg-coral-soft',
    fg: 'text-coral-deep',
    solid: 'bg-coral',
    ring: 'ring-coral/30',
  },
  mint: {
    bg: 'bg-mint-soft',
    fg: 'text-mint-deep',
    solid: 'bg-mint',
    ring: 'ring-mint/30',
  },
  grape: {
    bg: 'bg-grape-soft',
    fg: 'text-grape-deep',
    solid: 'bg-grape',
    ring: 'ring-grape/30',
  },
  berry: {
    bg: 'bg-berry-soft',
    fg: 'text-berry-deep',
    solid: 'bg-berry',
    ring: 'ring-berry/30',
  },
}
