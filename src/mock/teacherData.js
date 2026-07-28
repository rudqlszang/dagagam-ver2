/**
 * 교사 화면 mock 데이터
 */

export const TEACHER = {
  name: '김하늘',
  classRoom: '3학년 2반',
  school: '햇살초등학교',
}

/** 담당 다문화 학생 */
export const STUDENTS = [
  {
    id: 'st-1',
    name: '이리엔',
    seed: 'lien',
    country: '베트남',
    flag: '🇻🇳',
    lang: 'vi',
    langLabel: '베트남어',
    level: 3,
    levelLabel: '중급',
    adaptation: 72,
    trend: 'up',
    utterancesWeek: 157,
    note: '조별활동에서 먼저 의견을 내기 시작했어요.',
    focus: ['허락 구하는 표현', '거절하는 표현'],
  },
  {
    id: 'st-2',
    name: '박민아',
    seed: 'mina',
    country: '필리핀',
    flag: '🇵🇭',
    lang: 'tl',
    langLabel: '타갈로그어',
    level: 2,
    levelLabel: '초급',
    adaptation: 48,
    trend: 'up',
    utterancesWeek: 92,
    note: '아직 짧은 문장 위주지만 듣기 이해가 빠르게 늘고 있어요.',
    focus: ['자기소개', '숫자 읽기'],
  },
  {
    id: 'st-3',
    name: '왕쯔한',
    seed: 'zihan',
    country: '중국',
    flag: '🇨🇳',
    lang: 'zh',
    langLabel: '중국어',
    level: 4,
    levelLabel: '중상급',
    adaptation: 85,
    trend: 'flat',
    utterancesWeek: 203,
    note: '한국어는 편해졌지만 교과 어휘에서 막히는 경우가 있어요.',
    focus: ['교과 어휘', '설명하는 글'],
  },
  {
    id: 'st-4',
    name: '바트투르',
    seed: 'battur',
    country: '몽골',
    flag: '🇲🇳',
    lang: 'mn',
    langLabel: '몽골어',
    level: 1,
    levelLabel: '입문',
    adaptation: 31,
    trend: 'down',
    utterancesWeek: 38,
    note: '이번 주 참여가 줄었어요. 짝 활동을 늘려 보면 좋겠어요.',
    focus: ['인사말', '기본 요청'],
  },
]

export const LANGUAGES = [
  { code: 'vi', label: '베트남어', flag: '🇻🇳' },
  { code: 'zh', label: '중국어', flag: '🇨🇳' },
  { code: 'tl', label: '타갈로그어', flag: '🇵🇭' },
  { code: 'mn', label: '몽골어', flag: '🇲🇳' },
  { code: 'ru', label: '러시아어', flag: '🇷🇺' },
  { code: 'th', label: '태국어', flag: '🇹🇭' },
  { code: 'km', label: '캄보디아어', flag: '🇰🇭' },
  { code: 'ne', label: '네팔어', flag: '🇳🇵' },
]

/** 수업자료 변환 예시 (붙여넣기 버튼용) */
export const SAMPLE_MATERIAL = `4학년 1학기 사회 3단원 「지역의 공공기관」

공공기관이란 개인의 이익이 아닌 주민 전체의 이익과 편의를 위해 국가나 지방 자치 단체가 세우거나 관리하는 기관을 말한다. 대표적인 공공기관으로는 시청, 도서관, 보건소, 소방서, 경찰서 등이 있다.

다음 시간까지 우리 지역의 공공기관 한 곳을 조사하여 학습지에 정리해 오도록 한다.`

/**
 * 변환 mock
 * 실제로는 Claude API에 원문 + 목표 언어/난이도를 보내 변환한다.
 */
export function mockTranslate(text, langCode) {
  const lang = LANGUAGES.find((l) => l.code === langCode) ?? LANGUAGES[0]
  const preview = text.trim().split('\n').filter(Boolean).slice(0, 3)
  return [
    `[${lang.label} 번역본 · 자동 생성]`,
    '',
    ...preview.map((line, i) => `${i + 1}. (${lang.label}) ${line.slice(0, 40)}${line.length > 40 ? '…' : ''} 에 해당하는 번역문이 여기에 표시됩니다.`),
    '',
    '※ 프로토타입에서는 실제 번역 대신 예시 문구를 보여 줍니다.',
    '   실서비스에서는 Claude API가 문맥과 학년 수준을 고려해 번역합니다.',
  ].join('\n')
}

export function mockSimplify(text) {
  const sentences = text
    .replace(/\n+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean)
    .slice(0, 6)

  return [
    '[쉬운 한국어로 다시 쓰기 · 자동 생성]',
    '',
    ...sentences.map((s) => `• ${s.trim().replace(/\s+/g, ' ').slice(0, 60)}${s.length > 60 ? '…' : ''}`),
    '',
    '📌 어려운 말 바꾸기',
    '  공공기관 → 모두를 위해 나라가 만든 곳',
    '  지방 자치 단체 → 우리 지역을 관리하는 곳',
    '  편의 → 편하게 지내는 것',
    '  조사하다 → 찾아보다',
    '',
    '※ 프로토타입 예시입니다. 실서비스에서는 학생의 한국어 레벨에 맞춰 다시 씁니다.',
  ].join('\n')
}

/** 알림장 발송 히스토리 초기 시드 */
export const SEED_SEND_HISTORY = [
  {
    id: 'sh-1',
    sentAt: '2026-07-27 16:20',
    title: '여름방학 안내 및 준비물',
    recipients: ['이리엔', '박민아', '왕쯔한', '바트투르'],
    langs: ['베트남어', '타갈로그어', '중국어', '몽골어'],
    readCount: 3,
  },
  {
    id: 'sh-2',
    sentAt: '2026-07-22 15:05',
    title: '현장체험학습 신청서 제출',
    recipients: ['이리엔', '박민아', '왕쯔한', '바트투르'],
    langs: ['베트남어', '타갈로그어', '중국어', '몽골어'],
    readCount: 4,
  },
]
