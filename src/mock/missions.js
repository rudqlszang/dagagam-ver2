/**
 * 대화 주제 목록
 *
 * ver2부터 주제는 장소(mock/places.js) 아래에 속한다. 이 파일은 그 목록을
 * 한 줄로 펴서 "id로 주제 하나 찾기"만 담당한다. 요약·부모·교사 화면처럼
 * 장소를 몰라도 되는 곳에서 쓴다.
 *
 * id는 dialogueScripts.js의 키와 1:1로 대응된다.
 */

import { ALL_TOPICS, PLACES } from './places'

/** 아직 장소에 배치하지 않은 주제 — 학교 밖이라 세 장소에 안 맞는다 */
const OFF_CAMPUS = [
  {
    id: 'convenience-store',
    emoji: '🏪',
    title: '편의점 계산하기',
    desc: '물건 사고 계산해 보기',
    level: '쉬움',
    minutes: 3,
    tags: ['생활 한국어', '숫자'],
    placeId: null,
  },
]

/** 장소별 accent를 주제에도 물려준다 (카드 색 맞추기용) */
const PLACE_ACCENT = Object.fromEntries(PLACES.map((p) => [p.id, p.accent]))

export const MISSIONS = [...ALL_TOPICS, ...OFF_CAMPUS].map((t) => ({
  ...t,
  accent: PLACE_ACCENT[t.placeId] ?? 'brand',
}))

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
