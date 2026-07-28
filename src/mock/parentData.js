/**
 * 부모 대시보드 mock 데이터
 * 실제 서비스에서는 아이 세션 로그를 집계해서 만들 값들.
 *
 * 자녀별로 지표가 완전히 분리돼 있다. 대시보드에서 자녀를 바꾸면
 * 그래프 · 새 단어 · 어려워한 표현 · 또래 신호 · 요약문이 모두 함께 바뀐다.
 */

export const CHILDREN = [
  {
    id: 'child-1',
    name: '리엔',
    korName: '이리엔',
    latinName: 'Liên',
    koSubject: '리엔이는',
    grade: '초등 3학년',
    country: '베트남',
    flag: '🇻🇳',
    lang: 'vi',
    seed: 'lien',
    joinedDays: 46,
  },
  {
    id: 'child-2',
    name: '민아',
    korName: '박민아',
    latinName: 'Mina',
    koSubject: '민아는',
    grade: '초등 1학년',
    country: '필리핀',
    flag: '🇵🇭',
    lang: 'tl',
    seed: 'mina',
    joinedDays: 12,
  },
]

export function getChild(id) {
  return CHILDREN.find((c) => c.id === id) ?? CHILDREN[0]
}

/* ── 자녀별 지표 ─────────────────────────────────────────────── */

const METRICS = {
  'child-1': {
    /** 요일별 발화 횟수 (이번 주 / 지난 주 비교) */
    weekly: [
      { day: '월', 이번주: 24, 지난주: 18 },
      { day: '화', 이번주: 31, 지난주: 27 },
      { day: '수', 이번주: 12, 지난주: 29 },
      { day: '목', 이번주: 8, 지난주: 33 },
      { day: '금', 이번주: 19, 지난주: 25 },
      { day: '토', 이번주: 35, 지난주: 21 },
      { day: '일', 이번주: 28, 지난주: 16 },
    ],
    radar: [
      { metric: '발음', 이번달: 78, 지난달: 62, full: 100 },
      { metric: '어휘력', 이번달: 71, 지난달: 55, full: 100 },
      { metric: '문장 길이', 이번달: 64, 지난달: 48, full: 100 },
      { metric: '대화 주도', 이번달: 58, 지난달: 41, full: 100 },
      { metric: '듣기 이해', 이번달: 83, 지난달: 70, full: 100 },
    ],
    pronTrend: [
      { week: '1주', 점수: 54 },
      { week: '2주', 점수: 58 },
      { week: '3주', 점수: 57 },
      { week: '4주', 점수: 63 },
      { week: '5주', 점수: 68 },
      { week: '6주', 점수: 66 },
      { week: '7주', 점수: 74 },
      { week: '8주', 점수: 78 },
    ],
    newWords: [
      { word: '조별과제', meaning: '친구들과 함께 하는 숙제', mission: '조별과제 시뮬레이션', count: 3 },
      { word: '준비물', meaning: '학교에 가져가야 하는 물건', mission: '조별과제 시뮬레이션', count: 2 },
      { word: '응원', meaning: '잘하라고 힘을 주는 것', mission: '체육시간 팀 정하기', count: 1 },
      { word: '짝꿍', meaning: '옆자리에 앉는 친구', mission: '전학 첫날', count: 2 },
    ],
    hardExpressions: [
      {
        expr: '~해도 될까요?',
        reason: '허락을 구하는 말이에요. 3번 시도했지만 다른 말로 바꿔 말했어요.',
        tip: '집에서 "물 마셔도 될까요?"처럼 함께 연습해 보세요.',
        level: 'high',
      },
      {
        expr: '유통기한',
        reason: '뜻을 몰라 다시 물어봤어요.',
        tip: '마트에서 실제 표시를 함께 찾아보면 기억에 오래 남아요.',
        level: 'mid',
      },
      {
        expr: '괜찮아요 (거절)',
        reason: '거절하는 상황에서 대답을 못 하고 넘어갔어요.',
        tip: '"괜찮아요"가 거절도 된다는 걸 알려 주세요.',
        level: 'mid',
      },
    ],
    signals: [
      {
        id: 'sig-1',
        tone: 'warn',
        icon: '🌤️',
        title: '이번 주 대화 참여가 조금 줄었어요',
        body: '수요일과 목요일 발화 횟수가 평소의 40% 수준이었어요. 학교에서 속상한 일이 있었는지 부드럽게 물어봐 주세요.',
        action: '오늘 저녁에 물어보기',
      },
      {
        id: 'sig-2',
        tone: 'good',
        icon: '🌱',
        title: '먼저 말을 거는 횟수가 늘었어요',
        body: '지난주보다 아이가 먼저 질문한 횟수가 2배 늘었어요. "같이 하자"는 표현을 스스로 5번 사용했어요.',
        action: '칭찬해 주기',
      },
      {
        id: 'sig-3',
        tone: 'info',
        icon: '💛',
        title: '민준이 캐릭터와 가장 편하게 대화해요',
        body: '활발한 성격의 친구와 대화할 때 발화 길이가 길어져요. 학교에서도 비슷한 친구와 잘 어울릴 가능성이 높아요.',
        action: '담임선생님께 공유',
      },
    ],
    stats: {
      utterances: 157,
      deltaPct: 12,
      newWordCount: 8,
      pron: 78,
      pronDelta: 6,
      quietDaysKo: '수요일과 목요일',
      quietDaysEn: 'Wednesday and Thursday',
      focusKo: '~해도 될까요?',
      focusEx: '물 마셔도 될까요?',
    },
  },

  'child-2': {
    weekly: [
      { day: '월', 이번주: 9, 지난주: 4 },
      { day: '화', 이번주: 14, 지난주: 7 },
      { day: '수', 이번주: 17, 지난주: 9 },
      { day: '목', 이번주: 21, 지난주: 11 },
      { day: '금', 이번주: 12, 지난주: 8 },
      { day: '토', 이번주: 11, 지난주: 6 },
      { day: '일', 이번주: 8, 지난주: 3 },
    ],
    radar: [
      { metric: '발음', 이번달: 61, 지난달: 44, full: 100 },
      { metric: '어휘력', 이번달: 48, 지난달: 30, full: 100 },
      { metric: '문장 길이', 이번달: 35, 지난달: 22, full: 100 },
      { metric: '대화 주도', 이번달: 41, 지난달: 25, full: 100 },
      { metric: '듣기 이해', 이번달: 69, 지난달: 47, full: 100 },
    ],
    pronTrend: [
      { week: '1주', 점수: 41 },
      { week: '2주', 점수: 44 },
      { week: '3주', 점수: 48 },
      { week: '4주', 점수: 47 },
      { week: '5주', 점수: 52 },
      { week: '6주', 점수: 56 },
      { week: '7주', 점수: 58 },
      { week: '8주', 점수: 61 },
    ],
    newWords: [
      { word: '급식', meaning: '학교에서 주는 점심밥', mission: '전학 첫날', count: 4 },
      { word: '짝꿍', meaning: '옆자리에 앉는 친구', mission: '전학 첫날', count: 2 },
      { word: '차례', meaning: '순서대로 하는 것', mission: '편의점 계산하기', count: 1 },
    ],
    hardExpressions: [
      {
        expr: '숫자 세기 (하나, 둘, 셋)',
        reason: '물건 개수를 셀 때 숫자를 자꾸 건너뛰었어요.',
        tip: '간식을 나누며 함께 세어 보면 금방 익숙해져요.',
        level: 'high',
      },
      {
        expr: '제 이름은 ~입니다',
        reason: '자기소개에서 문장을 끝맺지 못하고 이름만 말했어요.',
        tip: '거울 보고 함께 소개 연습을 해 보세요.',
        level: 'mid',
      },
    ],
    signals: [
      {
        id: 'sig-4',
        tone: 'good',
        icon: '🌟',
        title: '매일 조금씩 꾸준히 늘고 있어요',
        body: '아직 문장은 짧지만 일주일 내내 빠짐없이 대화했어요. 입문 단계에서 가장 중요한 습관이 잡히고 있습니다.',
        action: '칭찬해 주기',
      },
      {
        id: 'sig-5',
        tone: 'info',
        icon: '👂',
        title: '듣기가 말하기보다 훨씬 빨라요',
        body: '알아듣는 건 잘하는데 대답이 늦어요. 조급해하지 말고 기다려 주시면 곧 말이 트일 거예요.',
        action: '기다려 주기',
      },
      {
        id: 'sig-6',
        tone: 'warn',
        icon: '🤝',
        title: '아직 먼저 말을 걸지는 않아요',
        body: '질문에는 답하지만 먼저 대화를 시작한 적은 이번 주 1번이에요. 익숙해질 시간이 조금 더 필요합니다.',
        action: '담임선생님께 공유',
      },
    ],
    stats: {
      utterances: 92,
      deltaPct: 87,
      newWordCount: 3,
      pron: 61,
      pronDelta: 3,
      quietDaysKo: '일요일',
      quietDaysEn: 'Sunday',
      focusKo: '제 이름은 ~입니다',
      focusEx: '제 이름은 민아입니다',
    },
  },
}

export function getChildMetrics(id) {
  return METRICS[id] ?? METRICS['child-1']
}

/* ── 시드 데이터 ─────────────────────────────────────────────── */

/** 지난 대화 다시 보기 (자막 텍스트 기반) — 초기 시드 데이터 */
export const SEED_TRANSCRIPTS = [
  {
    id: 'tr-1',
    missionId: 'group-project',
    missionTitle: '조별과제 시뮬레이션',
    date: '2026-07-27',
    durationSec: 284,
    utterances: 9,
    newWords: ['조별과제', '준비물', '의견'],
    lines: [
      { by: 'minjun', text: '어! 너도 우리 조야? 잘됐다!' },
      { by: 'seoyeon', text: '우리 조별과제 주제가 "우리 동네 소개하기"래. 너는 뭐 하고 싶어?' },
      { by: 'user', text: '나는 그림 그리고 싶어요', confidence: 0.82 },
      { by: 'seoyeon', text: '진짜? 나도 그림 그리는 거 제일 좋아해!' },
      { by: 'minjun', text: '그럼 그림은 둘이 맡고, 발표는 내가 할게.' },
      { by: 'user', text: '금요일에 만나요', confidence: 0.76 },
      { by: 'minjun', text: '오케이, 그때로 정하자!' },
    ],
  },
  {
    id: 'tr-2',
    missionId: 'first-day',
    missionTitle: '전학 첫날',
    date: '2026-07-25',
    durationSec: 196,
    utterances: 6,
    newWords: ['짝꿍', '전학'],
    lines: [
      { by: 'minjun', text: '어? 너 오늘 처음 온 친구지? 안녕!' },
      { by: 'user', text: '안녕하세요 저는 리엔이에요', confidence: 0.91 },
      { by: 'seoyeon', text: '오, 예쁜 이름이다! 잘 기억해 둘게.' },
      { by: 'user', text: '베트남에서 왔어요', confidence: 0.88 },
      { by: 'minjun', text: '우와! 거기 가 보고 싶었는데, 진짜 신기하다.' },
    ],
  },
]

/** 교사가 보낸 알림장 (부모 화면) — 초기 시드 */
export const SEED_NOTICES = [
  {
    id: 'no-1',
    date: '2026-07-27',
    from: '3학년 2반 김하늘 선생님',
    title: '여름방학 안내 및 준비물',
    original:
      '안녕하세요. 다음 주 금요일부터 여름방학이 시작됩니다. 방학 중 독서록 5권을 작성해 주시고, 개학일은 8월 18일입니다. 개학 첫날에는 방학 과제와 실내화를 꼭 가져와 주세요.',
    translated:
      '[베트남어 번역] Xin chào. Kỳ nghỉ hè bắt đầu từ thứ Sáu tuần sau. Vui lòng viết 5 bài nhật ký đọc sách trong kỳ nghỉ. Ngày tựu trường là 18 tháng 8. Vào ngày đầu tiên, hãy mang theo bài tập và dép đi trong nhà.',
    easyKorean:
      '다음 주 금요일부터 방학이에요. 방학 동안 책 5권을 읽고 독서록을 써 주세요. 8월 18일에 다시 학교에 옵니다. 그날 방학 숙제와 실내화를 가져오세요.',
    read: false,
  },
  {
    id: 'no-2',
    date: '2026-07-22',
    from: '3학년 2반 김하늘 선생님',
    title: '현장체험학습 신청서 제출',
    original:
      '8월 27일 국립과학관 현장체험학습을 실시합니다. 참가 신청서를 8월 5일까지 제출해 주시기 바랍니다. 참가비는 12,000원이며, 중식은 도시락을 지참합니다.',
    translated:
      '[베트남어 번역] Ngày 27 tháng 8 sẽ có buổi tham quan Bảo tàng Khoa học Quốc gia. Vui lòng nộp đơn đăng ký trước ngày 5 tháng 8. Phí tham gia là 12.000 won và học sinh cần mang theo hộp cơm trưa.',
    easyKorean:
      '8월 27일에 과학관에 갑니다. 8월 5일까지 신청서를 내 주세요. 돈은 12,000원이에요. 점심 도시락을 싸 오세요.',
    read: true,
  },
  {
    id: 'no-3',
    date: '2026-07-15',
    from: '3학년 2반 김하늘 선생님',
    title: '학부모 상담 주간 안내',
    original:
      '7월 넷째 주는 학부모 상담 주간입니다. 희망하시는 날짜와 시간을 알림장에 회신해 주시면 조율하여 안내드리겠습니다. 통역 지원이 필요하신 경우 미리 말씀해 주세요.',
    translated:
      '[베트남어 번역] Tuần thứ tư của tháng 7 là tuần tư vấn phụ huynh. Vui lòng trả lời ngày và giờ mong muốn. Nếu cần hỗ trợ phiên dịch, xin vui lòng cho chúng tôi biết trước.',
    easyKorean:
      '7월 넷째 주에 선생님과 이야기하는 시간이 있어요. 원하는 날짜와 시간을 알려 주세요. 통역이 필요하면 미리 말씀해 주세요.',
    read: true,
  },
]
