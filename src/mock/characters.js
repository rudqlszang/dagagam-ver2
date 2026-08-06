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

/**
 * 음높이는 남/여 구분만 한다.
 *
 * 아이 목소리처럼 들리게 하려고 pitch를 1.5~1.7까지 올렸었는데, 그러면
 * 아이 같아지는 게 아니라 그냥 부자연스러워진다. 브라우저 음성은 성인 화자를
 * 그대로 끌어올리는 것뿐이라 톤만 이상해진다. 자연스러움을 택했다.
 */
export const VOICE_PITCH = { female: 1.12, male: 0.95 }

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
    voice: { gender: 'male', pitch: VOICE_PITCH.male, rate: 1.06 },
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
    voice: { gender: 'female', pitch: VOICE_PITCH.female, rate: 0.97 },
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
    voice: { gender: 'female', pitch: VOICE_PITCH.female, rate: 0.9 },
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
    voice: { gender: 'male', pitch: VOICE_PITCH.male, rate: 1.02 },
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
    voice: { gender: 'female', pitch: VOICE_PITCH.female, rate: 1.04 },
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
    voice: { gender: 'male', pitch: VOICE_PITCH.male, rate: 0.92 },
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
  { id: 'girl', label: '여자 친구 목소리', gender: 'female', rate: 1 },
  { id: 'girl-slow', label: '여자 · 천천히', gender: 'female', rate: 0.88 },
  { id: 'boy', label: '남자 친구 목소리', gender: 'male', rate: 1 },
  { id: 'boy-slow', label: '남자 · 천천히', gender: 'male', rate: 0.88 },
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
    voice: { gender: preset.gender, pitch: VOICE_PITCH[preset.gender], rate: preset.rate },
    style: draft.style ?? 'friendly',
    voicePreset: preset.id,
    custom: true,
  }
}

/* ── 키워드로 친구 만들기 (아이 첫 진입 온보딩) ─────────────────── */

/**
 * 아이는 "어떤 친구였으면 좋겠어?"를 키워드로만 답한다.
 * 이름 · 얼굴 · 색 · 목소리는 그 키워드에서 자동으로 뽑아 준다.
 * (초등 저학년이 항목을 일일이 채우게 하면 중간에 이탈한다)
 */

export const HOBBY_KEYWORDS = [
  { label: '축구', emoji: '⚽' },
  { label: '게임', emoji: '🎮' },
  { label: 'K-pop', emoji: '🎵' },
  { label: '그림', emoji: '🎨' },
  { label: '책', emoji: '📚' },
  { label: '춤', emoji: '💃' },
  { label: '동물', emoji: '🐶' },
  { label: '요리', emoji: '🍳' },
  { label: '로봇', emoji: '🤖' },
  { label: '자전거', emoji: '🚲' },
  { label: '노래', emoji: '🎤' },
  { label: '만화', emoji: '📺' },
]

/**
 * 성격 키워드 — 말투(persona)와 말하기 속도(rate)를 결정한다.
 *
 * label은 아이가 고르는 칩에 쓰는 대화체("활발해"),
 * adj는 문장에 끼워 넣을 관형형("활발한 친구")이다. 둘을 섞어 쓰면
 * "활발해 친구" 같은 문장이 나온다.
 *
 * pitch는 여기서 다루지 않는다. 성격마다 음높이를 흔들면 목소리가 부자연스러워진다.
 * 음높이는 남/여만 구분한다. (VOICE_PITCH)
 */
export const TRAIT_KEYWORDS = [
  { label: '활발해', adj: '활발한', persona: '늘 신나 있고 먼저 말을 건다.', rate: 1.08 },
  { label: '차분해', adj: '차분한', persona: '조용조용 말하고 서두르지 않는다.', rate: 0.9 },
  { label: '장난꾸러기야', adj: '장난기 많은', persona: '농담을 자주 하고 리액션이 크다.', rate: 1.1 },
  { label: '잘 들어 줘', adj: '잘 들어 주는', persona: '끝까지 듣고 아이 말을 되짚어 준다.', rate: 0.95 },
  { label: '칭찬을 많이 해', adj: '칭찬을 많이 하는', persona: '아이가 한 말을 크게 칭찬해 준다.', rate: 1.02 },
  { label: '천천히 말해', adj: '천천히 말하는', persona: '한 문장씩 또박또박 천천히 말한다.', rate: 0.82 },
  { label: '질문을 많이 해', adj: '질문이 많은', persona: '“왜?”, “그래서 어떻게 됐어?” 하고 계속 물어본다.', rate: 1.05 },
  { label: '설명을 잘해', adj: '설명을 잘하는', persona: '어려운 말이 나오면 꼭 쉬운 말로 바꿔서 알려 준다.', rate: 0.92 },
]


/** 순우리말 이름 — 받침 유무가 섞여 있어야 조사 처리가 자연스럽다 */
const NAME_POOL = [
  '하루', '별이', '다온', '나래', '온유', '바다', '새록', '도담',
  '가온', '여울', '미르', '한별', '초록', '소리', '유리', '시아',
]

/** 문자열을 안정적인 숫자로 — 같은 키워드면 같은 결과가 나오게 */
function hash(str) {
  let h = 0
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h
}

const HOBBY_EMOJI = Object.fromEntries(HOBBY_KEYWORDS.map((h) => [h.label, h.emoji]))

/**
 * 키워드만으로 친구 하나를 만든다.
 *
 * @param {object} picks  { likes: string[], traits: string[], extra?: string, background?: string }
 * @param {object} opts   { id, roll = 0, avoidAccents = [] }
 *                        roll을 올리면 이름·얼굴·목소리가 바뀐다 ("다시 뽑기")
 */
export function buildFriendFromKeywords(picks, { id, roll = 0, avoidAccents = [] } = {}) {
  const likes = picks.likes?.length ? picks.likes : ['이야기하기']
  const traitDefs = (picks.traits?.length ? picks.traits : ['잘 들어 줘'])
    .map((t) => TRAIT_KEYWORDS.find((k) => k.label === t))
    .filter(Boolean)

  const key = hash([...likes, ...traitDefs.map((t) => t.label), String(roll)].join('|'))

  const name = NAME_POOL[key % NAME_POOL.length]
  const emoji = HOBBY_EMOJI[likes[0]] ?? '✨'

  // 두 친구가 같은 색이 되지 않도록 피한다
  const free = ACCENT_KEYS.filter((a) => !avoidAccents.includes(a))
  const accent = (free.length ? free : ACCENT_KEYS)[key % (free.length || ACCENT_KEYS.length)]

  // 목소리는 고른 성격들의 평균 — '천천히 말해'를 고르면 실제로 느려진다
  const gender = key % 2 === 0 ? 'female' : 'male'
  const rate =
    traitDefs.reduce((sum, t) => sum + t.rate, 0) / (traitDefs.length || 1)

  const personaParts = [
    `${likes.join(', ')}을(를) 좋아한다.`,
    ...traitDefs.map((t) => t.persona),
    '또래 친구처럼 반말로 짧게 말한다.',
  ]
  if (picks.extra?.trim()) personaParts.unshift(`${picks.extra.trim()}에 관심이 많다.`)
  if (picks.background?.trim()) personaParts.push(picks.background.trim())

  return {
    id,
    name,
    emoji,
    seed: `${id}-${name}-${roll}`,
    accent,
    theme: THEMES[accent],
    avatarUrl: dicebearUrl(`${id}-${name}-${roll}`, { backgroundColor: AVATAR_BG[accent] }),
    voiceDir: `/voice/${id}`,
    tagline: `${likes.slice(0, 2).join('·')} 좋아하는 ${traitDefs[0]?.adj ?? '다정한'} 친구`,
    traits: traitDefs.map((t) => t.label),
    likes,
    background: picks.background?.trim() || null,
    persona: personaParts.join(' '),
    voice: {
      gender,
      pitch: VOICE_PITCH[gender],
      rate: Math.round(rate * 100) / 100,
    },
    keywords: { likes, traits: traitDefs.map((t) => t.label), extra: picks.extra ?? '' },
    roll,
    custom: true,
  }
}

export function emptyKeywordPicks() {
  return { likes: [], traits: [], extra: '', background: '' }
}

export function emptyCustomDraft() {
  return {
    name: '',
    emoji: '✨',
    accent: 'grape',
    traits: [],
    likes: [],
    style: 'friendly',
    voicePreset: 'girl',
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
