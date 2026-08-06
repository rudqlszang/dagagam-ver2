/**
 * 장소와 주제
 *
 * ver1은 미션 6개가 한 줄로 나열돼 있어서, 아이가 "지금 어디서 무슨 일이 있는지"를
 * 그림으로 떠올리기 어려웠다. ver2는 학교 안의 **장소 세 곳**을 먼저 고르고,
 * 그 장소에서 실제로 일어나는 **주제**를 고르는 구조로 바꿨다.
 *
 *   교실 → 조별과제 / 쉬는시간 잡담 / 전학 첫날 / 생일파티 초대
 *   급식실 → 오늘 급식 뭐야 / 같이 앉아도 돼
 *   체육관 → 팀 정하기 / 같이 하자고 말하기
 *
 * topic.id는 mock/dialogueScripts.js의 키와 1:1로 대응한다.
 * (API가 꺼져 있을 때 그 스크립트로 대화가 진행된다)
 */

export const PLACES = [
  {
    id: 'classroom',
    name: '교실',
    emoji: '🏫',
    accent: 'brand',
    desc: '수업하고 쉬는 우리 반',
    topics: [
      {
        id: 'group-project',
        emoji: '🧩',
        title: '조별과제',
        desc: '역할을 나눠 보자',
        level: '보통',
        minutes: 5,
        tags: ['협동', '의견 말하기'],
      },
      {
        id: 'kpop',
        emoji: '🎤',
        title: '쉬는시간 잡담',
        desc: '좋아하는 노래로 수다 떨기',
        level: '쉬움',
        minutes: 4,
        tags: ['취향 말하기', '공감'],
      },
      {
        id: 'first-day',
        emoji: '🎒',
        title: '전학 첫날',
        desc: '처음 만난 친구에게 인사하기',
        level: '쉬움',
        minutes: 4,
        tags: ['자기소개', '인사'],
      },
      {
        id: 'birthday',
        emoji: '🎂',
        title: '생일파티 초대',
        desc: '초대하고, 초대받아 보기',
        level: '보통',
        minutes: 5,
        tags: ['초대', '약속 잡기'],
      },
    ],
  },
  {
    id: 'cafeteria',
    name: '급식실',
    emoji: '🍚',
    accent: 'sun',
    desc: '점심 먹으러 가는 곳',
    topics: [
      {
        id: 'lunch-menu',
        emoji: '🍛',
        title: '오늘 급식 뭐야?',
        desc: '먹어 본 것과 처음 보는 음식',
        level: '쉬움',
        minutes: 4,
        tags: ['음식 이름', '좋아하는 것 말하기'],
      },
      {
        id: 'lunch-seat',
        emoji: '🪑',
        title: '같이 앉아도 돼?',
        desc: '자리 물어보고 함께 먹기',
        level: '쉬움',
        minutes: 4,
        tags: ['부탁하기', '먼저 말 걸기'],
      },
    ],
  },
  {
    id: 'gym',
    name: '체육관',
    emoji: '🏀',
    accent: 'mint',
    desc: '뛰고 노는 곳',
    topics: [
      {
        id: 'pe-team',
        emoji: '⚽',
        title: '팀 정하기',
        desc: '같이 하고 싶다고 말해 보자',
        level: '보통',
        minutes: 5,
        tags: ['부탁하기', '거절하기'],
      },
      {
        id: 'gym-join',
        emoji: '🙋',
        title: '나도 같이 하자',
        desc: '놀고 있는 무리에 끼어들기',
        level: '보통',
        minutes: 4,
        tags: ['용기 내기', '규칙 물어보기'],
      },
    ],
  },
]

/** 아직 장소에 배치하지 않은 주제 — 학교 밖이라 세 장소 어디에도 맞지 않는다 */
export const UNPLACED_TOPICS = ['convenience-store']

export function getPlace(id) {
  return PLACES.find((p) => p.id === id) ?? PLACES[0]
}

/** 주제 id로 주제와 그 주제가 속한 장소를 함께 찾는다 */
export function findTopic(topicId) {
  for (const place of PLACES) {
    const topic = place.topics.find((t) => t.id === topicId)
    if (topic) return { place, topic }
  }
  return { place: PLACES[0], topic: PLACES[0].topics[0] }
}

export const ALL_TOPICS = PLACES.flatMap((p) =>
  p.topics.map((t) => ({ ...t, placeId: p.id })),
)
