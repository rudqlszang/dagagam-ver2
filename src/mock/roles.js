export const ROLES = [
  {
    id: 'child',
    emoji: '🧒',
    label: '아이',
    desc: '친구들과 한국어로 이야기해요',
    home: '/child',
    soft: 'bg-brand-soft',
    solid: 'bg-brand',
    text: 'text-brand-deep',
    ring: 'ring-brand/40',
    features: ['음성으로 친구와 대화', '쉬운 말 설명 카드', '미션 뱃지 모으기'],
  },
  {
    id: 'parent',
    emoji: '👨‍👩‍👧',
    label: '부모님',
    desc: '아이의 성장을 모국어로 확인해요',
    home: '/parent',
    soft: 'bg-coral-soft',
    solid: 'bg-coral',
    text: 'text-coral-deep',
    ring: 'ring-coral/40',
    features: ['주간 참여도 · 발음 지표', '번역된 알림장', '대화 기록 보기'],
  },
  {
    id: 'teacher',
    emoji: '🧑‍🏫',
    label: '선생님',
    desc: '수업자료와 알림장을 쉽게 전해요',
    home: '/teacher',
    soft: 'bg-mint-soft',
    solid: 'bg-mint',
    text: 'text-mint-deep',
    ring: 'ring-mint/40',
    features: ['학생별 적응도', '쉬운 한국어 변환', '알림장 자동 번역 발송'],
  },
]

export function getRole(id) {
  return ROLES.find((r) => r.id === id) ?? ROLES[0]
}
