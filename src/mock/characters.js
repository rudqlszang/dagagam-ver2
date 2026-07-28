/**
 * AI 친구 캐릭터 정의
 *
 * 교체 포인트
 *  - avatarUrl : DiceBear API. 실패 시 <Avatar>가 이니셜 폴백으로 대체한다.
 *  - voiceDir  : 미리 녹음한 음성 파일이 놓일 public 폴더 경로.
 *                예) public/voice/minjun/group-project-01.mp3
 *                파일이 없으면 voicePlayer가 자동으로 "무음 + 자막" 모드로 동작.
 */

const DICEBEAR = 'https://api.dicebear.com/9.x/adventurer/svg'

export function dicebearUrl(seed, opts = {}) {
  const params = new URLSearchParams({ seed, ...opts })
  return `${DICEBEAR}?${params.toString()}`
}

export const CHARACTERS = {
  minjun: {
    id: 'minjun',
    name: '민준',
    seed: 'minjun',
    avatarUrl: dicebearUrl('minjun', { backgroundColor: 'b6e3f4' }),
    voiceDir: '/voice/minjun',
    // 아바타 링/말풍선에 쓰이는 테마색
    theme: {
      ring: 'ring-brand',
      glow: 'bg-brand/45',
      chip: 'bg-brand-soft text-brand-deep',
      bubble: 'bg-brand-soft',
      dot: 'bg-brand',
    },
    // 녹음 파일이 없을 때 쓰는 브라우저 기본 음성 설정 (아이 목소리처럼 높게)
    tts: { pitch: 1.45, rate: 1.06 },
    tagline: '축구랑 게임 좋아하는 활발한 친구',
    persona: '장난스럽고 말이 빠른 편. 먼저 말을 걸고 리액션이 크다.',
  },
  seoyeon: {
    id: 'seoyeon',
    name: '서연',
    seed: 'seoyeon',
    avatarUrl: dicebearUrl('seoyeon', { backgroundColor: 'ffd5dc' }),
    voiceDir: '/voice/seoyeon',
    theme: {
      ring: 'ring-coral',
      glow: 'bg-coral/45',
      chip: 'bg-coral-soft text-coral-deep',
      bubble: 'bg-coral-soft',
      dot: 'bg-coral',
    },
    tts: { pitch: 1.75, rate: 0.97 },
    tagline: '그림 그리기 좋아하는 다정한 친구',
    persona: '차분하게 되묻고 챙겨준다. 어려운 말은 쉽게 바꿔서 설명해 준다.',
  },
}

export const CHARACTER_LIST = Object.values(CHARACTERS)

export function getCharacter(id) {
  return CHARACTERS[id] ?? CHARACTERS.minjun
}

/** 사용자(아이) 아바타 — 닉네임을 seed로 써서 항상 같은 얼굴이 나오게 한다. */
export function userAvatarUrl(nickname) {
  return dicebearUrl(nickname || 'friend', { backgroundColor: 'ffdfbf' })
}
