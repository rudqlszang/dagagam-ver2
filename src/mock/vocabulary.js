/**
 * "쉬운 설명 카드"용 단어 사전
 *
 * 두 방향으로 쓰인다.
 *  1) AI 대사에 word 태그가 붙어 있으면 → 그 단어 카드를 띄운다.
 *  2) 아이가 말한 문장을 scanText()로 훑어 → 사전에 있는 어려운 말이 섞여 있으면 카드를 띄운다.
 */

export const VOCABULARY = {
  조별과제: {
    emoji: '🧩',
    easy: '친구들이랑 같이 하는 숙제',
    example: '"우리 조별과제 뭐로 할까?"',
  },
  역할: {
    emoji: '🎭',
    easy: '내가 맡아서 하는 일',
    example: '"내 역할은 그림 그리기야."',
  },
  발표: {
    emoji: '🗣️',
    easy: '앞에 나가서 말하는 것',
    example: '"내일 발표가 있어."',
  },
  자료조사: {
    emoji: '🔍',
    easy: '필요한 내용을 찾아보는 일',
    example: '"자료조사는 내가 할게."',
  },
  준비물: {
    emoji: '🎒',
    easy: '학교에 가져가야 하는 물건',
    example: '"내일 준비물은 색연필이야."',
  },
  알림장: {
    emoji: '📒',
    easy: '학교에서 집으로 보내는 안내 쪽지',
    example: '"알림장 확인했어?"',
  },
  급식: {
    emoji: '🍚',
    easy: '학교에서 주는 점심밥',
    example: '"오늘 급식 맛있었어."',
  },
  짝꿍: {
    emoji: '👯',
    easy: '옆자리에 같이 앉는 친구',
    example: '"내 짝꿍은 서연이야."',
  },
  전학: {
    emoji: '🚌',
    easy: '다니던 학교를 옮기는 것',
    example: '"나 이번에 전학 왔어."',
  },
  응원: {
    emoji: '📣',
    easy: '잘하라고 힘을 주는 것',
    example: '"내가 응원할게!"',
  },
  초대: {
    emoji: '💌',
    easy: '"우리 집에 놀러 와"라고 부르는 것',
    example: '"생일파티에 초대할게."',
  },
  계산: {
    emoji: '🧾',
    easy: '물건값을 내는 것',
    example: '"계산 도와주세요."',
  },
  봉투: {
    emoji: '🛍️',
    easy: '물건을 담는 비닐 주머니',
    example: '"봉투 필요하세요?"',
  },
  유통기한: {
    emoji: '📅',
    easy: '이 날짜까지 먹어도 괜찮다는 표시',
    example: '"유통기한 지났나 봐."',
  },
  담임선생님: {
    emoji: '🧑‍🏫',
    easy: '우리 반을 맡아 주시는 선생님',
    example: '"담임선생님께 여쭤보자."',
  },
  의견: {
    emoji: '💭',
    easy: '내 생각',
    example: '"네 의견도 말해 줘."',
  },
  차례: {
    emoji: '🔢',
    easy: '순서대로 하는 것',
    example: '"이제 네 차례야."',
  },
  안무: {
    emoji: '💃',
    easy: '노래에 맞춰 추는 춤 동작',
    example: '"이 안무 어려워."',
  },
  단짝: {
    emoji: '🤝',
    easy: '제일 친한 친구',
    example: '"우리 단짝 하자!"',
  },
  체육복: {
    emoji: '👕',
    easy: '체육시간에 갈아입는 옷',
    example: '"체육복 안 가져왔어."',
  },
  포장: {
    emoji: '🎁',
    easy: '선물을 예쁘게 싸는 것',
    example: '"포장해 주세요."',
  },
  덤: {
    emoji: '➕',
    easy: '살 때 하나 더 주는 것',
    example: '"이거 하나 덤이에요."',
  },
}

export const VOCAB_KEYS = Object.keys(VOCABULARY)

export function getWord(key) {
  if (!key) return null
  const entry = VOCABULARY[key]
  return entry ? { word: key, ...entry } : null
}

/**
 * 아이가 말한 문장에서 사전에 등록된 어려운 말을 찾아낸다.
 * 실제 서비스에서는 형태소 분석/난이도 모델로 교체할 자리.
 */
export function scanText(text) {
  if (!text) return []
  const plain = text.replace(/\s+/g, '')
  return VOCAB_KEYS.filter((k) => plain.includes(k.replace(/\s+/g, ''))).map(getWord)
}
