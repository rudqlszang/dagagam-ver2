/**
 * AI 친구 캐릭터 정의 (ver2)
 *
 * ver1 대비 달라진 점
 *  - 캐릭터가 2명 → 6명으로 늘고, 아이가 직접 고른다.
 *  - 아이가 이름·성격·말투·목소리를 정해 "나만의 친구"를 만들 수 있다. (커스텀 캐릭터)
 *  - 캐릭터마다 voice 프로필이 있어 서로 다른 목소리로 말한다.
 *
 * 교체 포인트
 *  - avatarUrl : DiceBear API. 실패 시 <Avatar>가 이니셜 폴백으로 대체한다.
 *  - voiceDir  : 미리 녹음한 음성 파일이 놓일 public 폴더 경로.
 *                예) public/voice/minjun/group-project-01.mp3
 *                파일이 없으면 voicePlayer가 브라우저 음성 → 무음 자막 순으로 내려간다.
 *  - voice     : 브라우저 내장 음성을 고를 때 쓰는 힌트. (무료 · 키 불필요)
 *                gender로 후보를 좁히고 pitch/rate로 캐릭터 색을 낸다.
 */

const DICEBEAR = 'https://api.dicebear.com/9.x/adventurer/svg'

export function dicebearUrl(seed, opts = {}) {
  const params = new URLSearchParams({ seed, ...opts })
  return `${DICEBEAR}?${params.toString()}`
}

/**
 * 테마 색.
 * Tailwind가 클래스명을 정적으로 스캔해야 해서 문자열을 통째로 적어 둔다.
 * (`bg-${accent}-soft` 같은 동적 조합은 빌드에서 사라진다)
 */
export const THEMES = {
  brand: {
    ring: 'ring-brand',
    glow: 'bg-brand/45',
    chip: 'bg-brand-soft text-brand-deep',
    bubble: 'bg-brand-soft',
    dot: 'bg-brand',
    solid: 'bg-brand',
    soft: 'bg-brand-soft',
    text: 'text-brand-deep',
  },
  coral: {
    ring: 'ring-coral',
    glow: 'bg-coral/45',
    chip: 'bg-coral-soft text-coral-deep',
    bubble: 'bg-coral-soft',
    dot: 'bg-coral',
    solid: 'bg-coral',
    soft: 'bg-coral-soft',
    text: 'text-coral-deep',
  },
  mint: {
    ring: 'ring-mint',
    glow: 'bg-mint/45',
    chip: 'bg-mint-soft text-mint-deep',
    bubble: 'bg-mint-soft',
    dot: 'bg-mint',
    solid: 'bg-mint',
    soft: 'bg-mint-soft',
    text: 'text-mint-deep',
  },
  grape: {
    ring: 'ring-grape',
    glow: 'bg-grape/45',
    chip: 'bg-grape-soft text-grape-deep',
    bubble: 'bg-grape-soft',
    dot: 'bg-grape',
    solid: 'bg-grape',
    soft: 'bg-grape-soft',
    text: 'text-grape-deep',
  },
  sun: {
    ring: 'ring-sun',
    glow: 'bg-sun/45',
    chip: 'bg-sun-soft text-sun-deep',
    bubble: 'bg-sun-soft',
    dot: 'bg-sun',
    solid: 'bg-sun',
    soft: 'bg-sun-soft',
    text: 'text-sun-deep',
  },
  berry: {
    ring: 'ring-berry',
    glow: 'bg-berry/45',
    chip: 'bg-berry-soft text-berry-deep',
    bubble: 'bg-berry-soft',
    dot: 'bg-berry',
    solid: 'bg-berry',
    soft: 'bg-berry-soft',
    text: 'text-berry-deep',
  },
}

export const ACCENT_KEYS = Object.keys(THEMES)

/** 아바타 배경색 — accent와 눈으로 맞춘 값 */
const AVATAR_BG = {
  brand: 'b6e3f4',
  coral: 'ffd5dc',
  mint: 'c8f0e2',
  grape: 'ddd6fe',
  sun: 'ffe8b3',
  berry: 'fbd0e4',
}

function make(c) {
  return {
    ...c,
    theme: THEMES[c.accent],
    avatarUrl: dicebearUrl(c.seed, { backgroundColor: AVATAR_BG[c.accent] }),
    voiceDir: `/voice/${c.id}`,
    custom: false,
  }
}

/**
 * 기본 제공 친구 6명.
 *
 * persona는 사람이 읽는 설명이자, 실제 LLM을 붙였을 때 그대로 시스템 프롬프트에
 * 들어가는 문장이다. (lib/personaPrompt.js 참고)
 */
export const BUILTIN_CHARACTERS = [
  make({
    id: 'minjun',
    name: '민준',
    emoji: '⚽',
    seed: 'minjun',
    accent: 'brand',
    tagline: '축구랑 게임 좋아하는 활발한 친구',
    traits: ['활발함', '장난꾸러기', '리액션 큼'],
    likes: ['축구', '게임', '피자'],
    background: null,
    persona:
      '장난스럽고 말이 빠른 편. 먼저 말을 걸고 리액션이 크다. 짧은 문장으로 신나게 말한다.',
    voice: { gender: 'male', pitch: 1.35, rate: 1.06 },
  }),
  make({
    id: 'seoyeon',
    name: '서연',
    emoji: '🎨',
    seed: 'seoyeon',
    accent: 'coral',
    tagline: '그림 그리기 좋아하는 다정한 친구',
    traits: ['다정함', '차분함', '잘 챙겨줌'],
    likes: ['그림', '색연필', '고양이'],
    background: null,
    persona:
      '차분하게 되묻고 챙겨준다. 어려운 말이 나오면 꼭 쉬운 말로 바꿔서 한 번 더 설명해 준다.',
    voice: { gender: 'female', pitch: 1.5, rate: 0.97 },
  }),
  make({
    id: 'haneul',
    name: '하늘',
    emoji: '📚',
    seed: 'haneul-friend',
    accent: 'mint',
    tagline: '설명을 제일 잘해 주는 침착한 친구',
    traits: ['침착함', '설명 잘함', '기다려 줌'],
    likes: ['책', '수학 퀴즈', '식물 키우기'],
    background: null,
    persona:
      '천천히, 또박또박 말한다. 같은 질문을 몇 번을 해도 귀찮아하지 않고 다시 설명한다. 한 번에 한 가지씩만 알려 준다.',
    voice: { gender: 'female', pitch: 1.2, rate: 0.9 },
  }),
  make({
    id: 'jiho',
    name: '지호',
    emoji: '🚀',
    seed: 'jiho-friend',
    accent: 'grape',
    tagline: '뭐든지 궁금해하는 호기심 대장',
    traits: ['호기심 많음', '질문 많음', '엉뚱함'],
    likes: ['로봇', '우주', '실험'],
    background: null,
    persona:
      '질문을 많이 한다. "왜?", "그래서 어떻게 됐어?" 하고 계속 물어봐서 아이가 말을 더 하게 만든다.',
    voice: { gender: 'male', pitch: 1.45, rate: 1.02 },
  }),
  make({
    id: 'yuna',
    name: '유나',
    emoji: '🎵',
    seed: 'yuna-friend',
    accent: 'sun',
    tagline: '노래 좋아하는 밝은 친구',
    traits: ['밝음', '수다스러움', '칭찬을 잘함'],
    likes: ['K-pop', '춤', '떡볶이'],
    background: '엄마가 필리핀 사람이고, 나는 한국에서 태어났어.',
    persona:
      '항상 신나 있다. 아이가 한 말을 크게 칭찬해 주고, 노래나 좋아하는 것 이야기로 자연스럽게 이어 간다.',
    voice: { gender: 'female', pitch: 1.65, rate: 1.04 },
  }),
  make({
    id: 'tao',
    name: '타오',
    emoji: '🌱',
    seed: 'tao-friend',
    accent: 'berry',
    tagline: '나처럼 한국어를 배우는 중인 친구',
    traits: ['공감을 잘함', '천천히 말함', '같이 배움'],
    likes: ['자전거', '쌀국수', '만화'],
    background: '2년 전에 베트남에서 왔어. 나도 아직 한국어를 배우는 중이야.',
    persona:
      '아이와 같은 처지라서 "나도 그거 어려웠어" 하고 공감해 준다. 어려운 낱말은 자기도 헷갈렸다고 말하며 쉬운 말로 바꿔 준다. 문장을 짧게 끊어서 말한다.',
    voice: { gender: 'male', pitch: 1.25, rate: 0.92 },
  }),
]

/* ── 커스텀 캐릭터 ──────────────────────────────────────────────── */

/** "나만의 친구 만들기" 화면에서 고르는 선택지 */
export const TRAIT_OPTIONS = [
  '활발해',
  '차분해',
  '장난을 잘 쳐',
  '잘 들어 줘',
  '칭찬을 많이 해',
  '천천히 말해',
  '질문을 많이 해',
  '설명을 잘해',
]

export const LIKE_OPTIONS = [
  '축구',
  '게임',
  'K-pop',
  '그림',
  '책',
  '춤',
  '동물',
  '요리',
  '로봇',
  '자전거',
]

export const SPEAK_STYLES = [
  { id: 'friendly', label: '친구처럼 편하게', hint: '"야, 그거 진짜 재밌겠다!"' },
  { id: 'gentle', label: '부드럽고 다정하게', hint: '"괜찮아, 천천히 말해도 돼."' },
  { id: 'cheerful', label: '신나고 씩씩하게', hint: '"우와! 대단한데?!"' },
  { id: 'calm', label: '차분하고 또박또박', hint: '"이건 이런 뜻이야. 다시 볼까?"' },
]

export const VOICE_PRESETS = [
  { id: 'kid-high', label: '높고 밝은 목소리', gender: 'female', pitch: 1.7, rate: 1.04 },
  { id: 'kid-soft', label: '부드러운 목소리', gender: 'female', pitch: 1.4, rate: 0.95 },
  { id: 'kid-boy', label: '씩씩한 목소리', gender: 'male', pitch: 1.4, rate: 1.05 },
  { id: 'kid-calm', label: '천천히 말하는 목소리', gender: 'male', pitch: 1.15, rate: 0.88 },
]

const STYLE_PERSONA = {
  friendly: '친구한테 말하듯 편하게 반말로 말한다.',
  gentle: '부드럽고 다정하게, 아이를 안심시키며 말한다.',
  cheerful: '신나고 씩씩하게, 감탄사를 많이 쓰며 말한다.',
  calm: '차분하게 또박또박, 한 번에 한 가지씩 알려 주며 말한다.',
}

/**
 * 아이가 입력한 값으로 캐릭터 객체를 만든다.
 * @param {object} draft { name, emoji, accent, traits[], likes[], style, voicePreset, background }
 */
export function buildCustomCharacter(draft, id) {
  const accent = ACCENT_KEYS.includes(draft.accent) ? draft.accent : 'grape'
  const preset =
    VOICE_PRESETS.find((v) => v.id === draft.voicePreset) ?? VOICE_PRESETS[0]
  const name = (draft.name ?? '').trim() || '내 친구'
  const traits = draft.traits?.length ? draft.traits : ['잘 들어 줘']
  const likes = draft.likes?.length ? draft.likes : ['이야기하기']

  const personaParts = [
    STYLE_PERSONA[draft.style] ?? STYLE_PERSONA.friendly,
    `성격은 ${traits.join(', ')}.`,
    `${likes.join(', ')}을(를) 좋아한다.`,
  ]
  if (draft.background?.trim()) personaParts.push(draft.background.trim())

  return {
    id,
    name,
    emoji: draft.emoji || '✨',
    seed: `${id}-${name}`,
    accent,
    theme: THEMES[accent],
    avatarUrl: dicebearUrl(`${id}-${name}`, { backgroundColor: AVATAR_BG[accent] }),
    voiceDir: `/voice/${id}`,
    tagline: `${traits[0]} ${likes[0]} 좋아하는 친구`,
    traits,
    likes,
    background: draft.background?.trim() || null,
    persona: personaParts.join(' '),
    voice: { gender: preset.gender, pitch: preset.pitch, rate: preset.rate },
    style: draft.style ?? 'friendly',
    voicePreset: preset.id,
    custom: true,
  }
}

export function emptyCustomDraft() {
  return {
    name: '',
    emoji: '✨',
    accent: 'grape',
    traits: [],
    likes: [],
    style: 'friendly',
    voicePreset: 'kid-high',
    background: '',
  }
}

/* ── 조회 ───────────────────────────────────────────────────────── */

/**
 * 커스텀 캐릭터 레지스트리.
 *
 * voicePlayer / conversationEngine 처럼 React 밖에서 도는 코드도 캐릭터를
 * 찾아야 해서, 스토어가 바뀔 때마다 여기에 최신 목록을 밀어 넣는다.
 * (store/useStore.js 하단의 subscribe 참고)
 */
let customRegistry = []

export function registerCustomCharacters(list) {
  customRegistry = Array.isArray(list) ? list : []
}

export function allCharacters() {
  return [...BUILTIN_CHARACTERS, ...customRegistry]
}

export function getCharacter(id) {
  return (
    BUILTIN_CHARACTERS.find((c) => c.id === id) ??
    customRegistry.find((c) => c.id === id) ??
    BUILTIN_CHARACTERS[0]
  )
}

/** 기본 짝꿍 — 고른 친구와 색이 겹치지 않는 친구를 붙여 준다 */
export function defaultPartnerFor(id) {
  const me = getCharacter(id)
  const other = BUILTIN_CHARACTERS.find(
    (c) => c.id !== me.id && c.accent !== me.accent,
  )
  return (other ?? BUILTIN_CHARACTERS.find((c) => c.id !== me.id)).id
}

/** 사용자(아이) 아바타 — 닉네임을 seed로 써서 항상 같은 얼굴이 나오게 한다. */
export function userAvatarUrl(nickname) {
  return dicebearUrl(nickname || 'friend', { backgroundColor: 'ffdfbf' })
}

/** ver1 호환 — 아직 두 명을 통째로 쓰는 화면이 있어 남겨 둔다 */
export const CHARACTERS = Object.fromEntries(
  BUILTIN_CHARACTERS.map((c) => [c.id, c]),
)
export const CHARACTER_LIST = BUILTIN_CHARACTERS
