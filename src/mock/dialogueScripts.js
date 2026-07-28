/**
 * 미션별 mock 대화 스크립트
 *
 * ─ 구조 ───────────────────────────────────────────────────────────
 *  opening : 대화가 시작되면 AI 두 명이 먼저 주고받는 말
 *  beats[] : 아이가 한 번 말할 때마다 한 칸씩 진행되는 대화 단계
 *      match[]  : 키워드가 걸리면 그 replies 재생 (위에서부터 먼저 걸리는 것)
 *      fallback : 아무 키워드도 안 걸렸을 때
 *      nudge    : 아이가 아무 말도 못 했을 때(빈 발화) 부드럽게 다시 유도
 *  closing : beats를 다 지나면 나오는 마무리 인사
 *
 * ─ Line 모양 ──────────────────────────────────────────────────────
 *  { by: 'minjun' | 'seoyeon', text: '...', word?: '조별과제', pause?: 600 }
 *    word  : vocabulary.js 키. 있으면 발화 중에 "쉬운 설명 카드"가 뜬다.
 *    pause : 앞 발화가 끝나고 이 발화가 시작되기까지의 텀(ms). 없으면 기본값.
 *
 * ─ 교체 안내 ──────────────────────────────────────────────────────
 *  나중에 Claude API를 붙일 때는 이 파일을 지울 필요 없이
 *  lib/conversationEngine.js 의 getReplies() 내부만 바꾸면 된다.
 *  (이 스크립트는 오프라인/폴백 응답으로 계속 남겨 두면 좋다)
 */

export const DIALOGUE_SCRIPTS = {
  /* ─────────────────────────── 조별과제 ─────────────────────────── */
  'group-project': {
    opening: [
      { by: 'minjun', text: '어! 너도 우리 조야? 잘됐다!' },
      {
        by: 'seoyeon',
        text: '안녕! 우리 조별과제 주제가 "우리 동네 소개하기"래. 너는 뭐 하고 싶어?',
        word: '조별과제',
        pause: 900,
      },
    ],
    beats: [
      {
        id: 'role',
        match: [
          {
            any: ['그림', '그리', '색칠', '만들'],
            replies: [
              { by: 'seoyeon', text: '진짜? 나도 그림 그리는 거 제일 좋아해!' },
              {
                by: 'minjun',
                text: '그럼 그림은 둘이 맡고, 발표는 내가 할게. 언제 모여서 만들까?',
                word: '발표',
                pause: 850,
              },
            ],
          },
          {
            any: ['발표', '말하', '앞에', '설명'],
            replies: [
              { by: 'minjun', text: '오, 발표를 한다고? 너 진짜 용감하다!' },
              {
                by: 'seoyeon',
                text: '떨리면 내가 옆에 서 있어 줄게. 우리 언제 만나서 연습할까?',
                pause: 900,
              },
            ],
          },
          {
            any: ['찾', '조사', '컴퓨터', '검색', '자료'],
            replies: [
              { by: 'seoyeon', text: '자료조사! 그거 진짜 중요한 역할이야.', word: '자료조사' },
              {
                by: 'minjun',
                text: '좋아, 넌 자료 찾고 난 발표할게. 우리 언제 모일까?',
                pause: 850,
              },
            ],
          },
          {
            any: ['몰라', '모르', '글쎄', '아직', '고민'],
            replies: [
              { by: 'seoyeon', text: '괜찮아, 천천히 생각해도 돼.' },
              {
                by: 'minjun',
                text: '그림, 발표, 자료 찾기 중에 하나 골라 볼래? 난 다 좋아!',
                pause: 800,
              },
            ],
          },
        ],
        fallback: [
          { by: 'minjun', text: '오, 그렇구나!' },
          {
            by: 'seoyeon',
            text: '그럼 그림 그리기랑 발표하기 중에 뭐가 더 하고 싶어?',
            pause: 800,
          },
        ],
        nudge: [
          { by: 'seoyeon', text: '천천히 말해도 괜찮아. 우리 기다릴게.' },
          { by: 'minjun', text: '한 단어만 말해도 돼! 그림? 발표?', pause: 800 },
        ],
      },
      {
        id: 'when',
        match: [
          {
            any: ['내일', '오늘', '모레', '주말', '토요일', '일요일', '요일', '시'],
            replies: [
              { by: 'minjun', text: '오케이, 그때로 정하자! 나 달력에 적어 놨어.' },
              {
                by: 'seoyeon',
                text: '그럼 준비물은 뭐 가져올까? 색연필이랑 도화지 있으면 될까?',
                word: '준비물',
                pause: 900,
              },
            ],
          },
          {
            any: ['학교', '교실', '도서관', '우리집', '집'],
            replies: [
              { by: 'seoyeon', text: '거기 좋다! 조용하고 넓어서 딱이야.' },
              {
                by: 'minjun',
                text: '그럼 준비물은 각자 뭐 가져올까?',
                word: '준비물',
                pause: 850,
              },
            ],
          },
          {
            any: ['안 돼', '안돼', '바빠', '학원', '못'],
            replies: [
              { by: 'seoyeon', text: '아 학원 있구나. 말해 줘서 고마워!' },
              {
                by: 'minjun',
                text: '그럼 다른 날로 하자. 넌 언제가 제일 편해?',
                pause: 800,
              },
            ],
          },
        ],
        fallback: [
          { by: 'minjun', text: '음, 그럼 우리 금요일 어때?' },
          { by: 'seoyeon', text: '금요일 괜찮으면 준비물도 같이 정하자!', word: '준비물', pause: 850 },
        ],
        nudge: [
          { by: 'minjun', text: '언제가 좋아? 요일만 말해 줘도 돼!' },
          { by: 'seoyeon', text: '"금요일" 이렇게만 말해도 괜찮아.', pause: 800 },
        ],
      },
      {
        id: 'wrapup',
        match: [
          {
            any: ['가져', '색연필', '도화지', '풀', '가위', '준비'],
            replies: [
              { by: 'seoyeon', text: '완벽해! 그럼 난 사진 몇 장 뽑아 올게.' },
              {
                by: 'minjun',
                text: '우리 조 진짜 잘될 것 같은데? 너 의견 말해 줘서 고마워!',
                word: '의견',
                pause: 900,
              },
            ],
          },
        ],
        fallback: [
          { by: 'minjun', text: '좋아 좋아, 그렇게 하자!' },
          {
            by: 'seoyeon',
            text: '오늘 네가 의견 많이 말해 줘서 정하기 쉬웠어. 고마워!',
            word: '의견',
            pause: 900,
          },
        ],
        nudge: [{ by: 'seoyeon', text: '괜찮아, 오늘은 여기까지만 해도 충분해!' }],
      },
    ],
    closing: [
      { by: 'minjun', text: '오늘 얘기 잘 통했다! 우리 조 잘할 것 같아.' },
      { by: 'seoyeon', text: '너 한국말 진짜 늘었어. 내일 학교에서 또 보자!', pause: 900 },
    ],
  },

  /* ───────────────────────────── K-pop ───────────────────────────── */
  kpop: {
    opening: [
      { by: 'seoyeon', text: '야야, 이 노래 들어 봤어? 요즘 우리 반에서 제일 인기야!' },
      { by: 'minjun', text: '너는 무슨 노래 좋아해? 아니면 어떤 가수?', pause: 900 },
    ],
    beats: [
      {
        id: 'favorite',
        match: [
          {
            any: ['좋아', '좋아해', '제일', '최고', '팬'],
            replies: [
              { by: 'seoyeon', text: '헐 대박! 나도 그거 완전 좋아하는데!' },
              {
                by: 'minjun',
                text: '취향 비슷하다! 그 노래 어디가 제일 좋아? 가사? 아니면 춤?',
                pause: 900,
              },
            ],
          },
          {
            any: ['춤', '안무', '댄스'],
            replies: [
              { by: 'minjun', text: '안무 좋아하는구나! 나 그거 하나도 못 따라 해.', word: '안무' },
              {
                by: 'seoyeon',
                text: '쉬는 시간에 나한테 좀 가르쳐 줄래? 같이 연습하자!',
                pause: 850,
              },
            ],
          },
          {
            any: ['몰라', '모르', '없어', '잘 안'],
            replies: [
              { by: 'seoyeon', text: '괜찮아! 그럼 내가 하나 추천해 줄게.' },
              {
                by: 'minjun',
                text: '너희 나라에서 유행하는 노래도 궁금해! 뭐가 인기 많아?',
                pause: 900,
              },
            ],
          },
        ],
        fallback: [
          { by: 'seoyeon', text: '오 그거구나! 나 그거 이름만 들어 봤어.' },
          { by: 'minjun', text: '어떤 점이 제일 좋아? 노래? 춤?', pause: 800 },
        ],
        nudge: [
          { by: 'seoyeon', text: '가수 이름만 말해도 돼! 아니면 노래 제목도 좋아.' },
        ],
      },
      {
        id: 'share',
        match: [
          {
            any: ['가사', '노래', '목소리', '멜로디'],
            replies: [
              { by: 'seoyeon', text: '맞아, 가사가 진짜 좋지. 나도 그 부분 따라 불러.' },
              {
                by: 'minjun',
                text: '우리 다음에 같이 노래방 갈래? 셋이 가면 재밌을 텐데!',
                pause: 900,
              },
            ],
          },
          {
            any: ['같이', '가자', '갈래', '좋아'],
            replies: [
              { by: 'minjun', text: '오케이 콜! 약속했다?' },
              { by: 'seoyeon', text: '그날 뭐 부를지 지금 정해 놓자. 한 곡 골라 봐!', pause: 850 },
            ],
          },
        ],
        fallback: [
          { by: 'minjun', text: '오 그렇구나, 나도 한번 들어 봐야겠다!' },
          { by: 'seoyeon', text: '우리 다음에 같이 노래 들을래?', pause: 800 },
        ],
        nudge: [{ by: 'minjun', text: '음... 그럼 내가 먼저 말할게. 난 요즘 이 노래 매일 들어!' }],
      },
      {
        id: 'wrapup',
        match: [],
        fallback: [
          { by: 'seoyeon', text: '오늘 너랑 얘기하니까 진짜 재밌었어!' },
          { by: 'minjun', text: '내일 쉬는 시간에 그 노래 같이 듣자. 이어폰 가져올게!', pause: 900 },
        ],
        nudge: [{ by: 'seoyeon', text: '괜찮아! 내일 또 얘기하면 되지.' }],
      },
    ],
    closing: [
      { by: 'minjun', text: '너랑 좋아하는 게 비슷해서 신기해!' },
      { by: 'seoyeon', text: '다음에 또 노래 얘기하자. 안녕!', pause: 850 },
    ],
  },

  /* ─────────────────────────── 전학 첫날 ─────────────────────────── */
  'first-day': {
    opening: [
      { by: 'minjun', text: '어? 너 오늘 처음 온 친구지? 안녕!' },
      {
        by: 'seoyeon',
        text: '반가워! 나는 서연이야. 네 이름은 뭐야?',
        pause: 900,
      },
    ],
    beats: [
      {
        id: 'intro',
        match: [
          {
            any: ['이름', '나는', '내 이름', '저는', '이야', '예요', '입니다'],
            replies: [
              { by: 'seoyeon', text: '오, 예쁜 이름이다! 잘 기억해 둘게.' },
              {
                by: 'minjun',
                text: '난 민준이야. 너 어느 나라에서 왔어? 궁금해!',
                pause: 900,
              },
            ],
          },
          {
            any: ['긴장', '떨려', '무서', '어색'],
            replies: [
              { by: 'seoyeon', text: '괜찮아, 나도 전학 왔을 때 진짜 떨렸어.', word: '전학' },
              {
                by: 'minjun',
                text: '우리가 옆에 있을게! 이름부터 알려 줄래?',
                pause: 850,
              },
            ],
          },
        ],
        fallback: [
          { by: 'minjun', text: '오 반가워!' },
          { by: 'seoyeon', text: '네 이름 다시 한번만 알려 줄래? 잘 기억하고 싶어.', pause: 800 },
        ],
        nudge: [{ by: 'seoyeon', text: '천천히 말해도 돼. 이름만 말해 줘도 괜찮아!' }],
      },
      {
        id: 'about',
        match: [
          {
            any: ['베트남', '중국', '필리핀', '태국', '몽골', '러시아', '우즈', '캄보디아', '네팔', '나라'],
            replies: [
              { by: 'minjun', text: '우와! 거기 가 보고 싶었는데, 진짜 신기하다.' },
              {
                by: 'seoyeon',
                text: '나중에 그 나라 얘기 많이 들려줘! 넌 뭐 좋아해?',
                pause: 900,
              },
            ],
          },
          {
            any: ['좋아', '게임', '축구', '그림', '노래', '책', '요리'],
            replies: [
              { by: 'minjun', text: '헐 나도 그거 좋아하는데! 우리 통하는 게 있네?' },
              {
                by: 'seoyeon',
                text: '점심시간에 같이 놀자. 우리랑 같이 앉을래?',
                pause: 850,
              },
            ],
          },
        ],
        fallback: [
          { by: 'seoyeon', text: '아 그렇구나! 더 알고 싶다.' },
          { by: 'minjun', text: '너 뭐 좋아해? 나는 축구!', pause: 800 },
        ],
        nudge: [{ by: 'minjun', text: '내가 먼저 말할게! 난 축구 좋아해. 넌?' }],
      },
      {
        id: 'invite',
        match: [
          {
            any: ['좋아', '응', '그래', '같이', '앉을'],
            replies: [
              { by: 'seoyeon', text: '야호! 그럼 내 옆자리 비어 있어. 거기 앉아.' },
              {
                by: 'minjun',
                text: '이제 너 우리 짝꿍이다! 모르는 거 있으면 다 물어봐.',
                word: '짝꿍',
                pause: 900,
              },
            ],
          },
        ],
        fallback: [
          { by: 'seoyeon', text: '괜찮아, 편할 때 같이 앉으면 돼!' },
          {
            by: 'minjun',
            text: '우리 이제 친구니까 모르는 거 있으면 다 물어봐. 알겠지?',
            pause: 850,
          },
        ],
        nudge: [{ by: 'seoyeon', text: '부담 갖지 마! 천천히 친해지면 되지.' }],
      },
    ],
    closing: [
      { by: 'minjun', text: '오늘 첫날인데 말 진짜 잘하던데?' },
      { by: 'seoyeon', text: '내일도 학교에서 보자. 우리가 기다릴게!', pause: 900 },
    ],
  },

  /* ────────────────────── 체육시간 팀 정하기 ────────────────────── */
  'pe-team': {
    opening: [
      { by: 'minjun', text: '자, 이제 피구 팀 정한대! 두 팀으로 나눈다는데.' },
      {
        by: 'seoyeon',
        text: '우리 같은 팀 하고 싶다. 너는 어느 팀 하고 싶어?',
        pause: 900,
      },
    ],
    beats: [
      {
        id: 'ask',
        match: [
          {
            any: ['같이', '너랑', '우리', '같은 팀', '함께'],
            replies: [
              { by: 'seoyeon', text: '진짜? 나도 너랑 같은 팀 하고 싶었어!' },
              {
                by: 'minjun',
                text: '그럼 선생님한테 같이 말하자. 너 피구 해 본 적 있어?',
                pause: 900,
              },
            ],
          },
          {
            any: ['못해', '못 해', '잘 못', '처음', '몰라', '무서'],
            replies: [
              { by: 'minjun', text: '괜찮아! 나도 처음엔 공에 자꾸 맞았어.' },
              {
                by: 'seoyeon',
                text: '규칙 알려 줄게. 공에 맞으면 밖으로 나가는 거야. 해 볼래?',
                pause: 900,
              },
            ],
          },
          {
            any: ['싫', '안 하', '안하', '쉬고', '아파'],
            replies: [
              { by: 'seoyeon', text: '아, 하기 싫으면 안 해도 돼. 말해 줘서 고마워.' },
              {
                by: 'minjun',
                text: '그럼 옆에서 우리 응원해 줄래? 그것도 진짜 큰 힘이야!',
                word: '응원',
                pause: 900,
              },
            ],
          },
        ],
        fallback: [
          { by: 'minjun', text: '오 그래?' },
          { by: 'seoyeon', text: '나랑 같은 팀 할래? "같이 하자"라고 말해 봐!', pause: 800 },
        ],
        nudge: [{ by: 'seoyeon', text: '"같이 하자"라고 말해 볼래? 어렵지 않아!' }],
      },
      {
        id: 'rule',
        match: [
          {
            any: ['해 볼', '해볼', '할래', '응', '좋아', '그래'],
            replies: [
              { by: 'minjun', text: '좋아! 그럼 넌 내 뒤에 서. 내가 막아 줄게.' },
              {
                by: 'seoyeon',
                text: '아 참, 체육복 갈아입어야 해. 가져왔어?',
                word: '체육복',
                pause: 900,
              },
            ],
          },
          {
            any: ['규칙', '어떻게', '뭐야', '설명'],
            replies: [
              { by: 'seoyeon', text: '공에 맞으면 밖으로 나가고, 공 잡으면 다시 들어와!' },
              { by: 'minjun', text: '쉽지? 체육복은 가져왔어?', word: '체육복', pause: 850 },
            ],
          },
        ],
        fallback: [
          { by: 'minjun', text: '오케이, 해 보면 금방 익숙해질 거야.' },
          { by: 'seoyeon', text: '체육복은 가져왔어?', word: '체육복', pause: 850 },
        ],
        nudge: [{ by: 'minjun', text: '괜찮아, 그냥 나 따라 하면 돼!' }],
      },
      {
        id: 'wrapup',
        match: [],
        fallback: [
          { by: 'seoyeon', text: '좋아! 그럼 우리 팀 이제 완성이다.' },
          { by: 'minjun', text: '오늘 네가 먼저 말 걸어 줘서 좋았어. 가자!', pause: 900 },
        ],
        nudge: [{ by: 'seoyeon', text: '괜찮아, 같이 가자!' }],
      },
    ],
    closing: [
      { by: 'minjun', text: '오늘 진짜 잘했어! 다음 체육시간에도 같은 팀 하자.' },
      { by: 'seoyeon', text: '"같이 하자" 말하는 거, 이제 잘하네!', pause: 900 },
    ],
  },

  /* ───────────────────────── 생일파티 초대 ───────────────────────── */
  birthday: {
    opening: [
      { by: 'seoyeon', text: '있잖아, 나 이번 주 토요일이 생일이야!' },
      {
        by: 'minjun',
        text: '오 진짜? 서연이가 우리 초대한대! 너 올 수 있어?',
        word: '초대',
        pause: 900,
      },
    ],
    beats: [
      {
        id: 'accept',
        match: [
          {
            any: ['갈래', '갈게', '응', '좋아', '그래', '가고 싶'],
            replies: [
              { by: 'seoyeon', text: '와 진짜? 완전 좋아! 꼭 와야 해.' },
              {
                by: 'minjun',
                text: '선물 뭐 사 갈지 같이 고를래? 난 아직 못 정했어.',
                pause: 900,
              },
            ],
          },
          {
            any: ['물어', '엄마', '아빠', '부모', '집에'],
            replies: [
              { by: 'minjun', text: '맞아, 부모님께 여쭤보는 게 좋지.' },
              {
                by: 'seoyeon',
                text: '그럼 내가 우리 집 주소 적어 줄게. 몇 시가 좋아?',
                pause: 900,
              },
            ],
          },
          {
            any: ['못', '안 돼', '안돼', '바빠', '학원'],
            replies: [
              { by: 'seoyeon', text: '아쉽다... 그래도 말해 줘서 고마워!' },
              {
                by: 'minjun',
                text: '그럼 다음에 셋이 따로 만나자. 언제가 괜찮아?',
                pause: 900,
              },
            ],
          },
        ],
        fallback: [
          { by: 'seoyeon', text: '음, 그렇구나!' },
          { by: 'minjun', text: '토요일에 올 수 있어, 없어? 편하게 말해도 돼!', pause: 800 },
        ],
        nudge: [{ by: 'seoyeon', text: '"갈게" 아니면 "못 가"라고만 말해도 괜찮아!' }],
      },
      {
        id: 'gift',
        match: [
          {
            any: ['선물', '사', '뭐', '케이크', '편지', '그림'],
            replies: [
              { by: 'minjun', text: '오 그거 좋다! 서연이 진짜 좋아할 것 같은데?' },
              {
                by: 'seoyeon',
                text: '나 선물보다 편지가 더 좋아! 예쁘게 포장 안 해도 돼.',
                word: '포장',
                pause: 900,
              },
            ],
          },
          {
            any: ['시', '몇시', '언제', '두 시', '세 시'],
            replies: [
              { by: 'seoyeon', text: '오후 두 시에 시작해! 늦어도 괜찮으니까 꼭 와.' },
              { by: 'minjun', text: '나도 그때 갈게. 우리 같이 갈까?', pause: 850 },
            ],
          },
        ],
        fallback: [
          { by: 'minjun', text: '좋아! 그럼 그렇게 하자.' },
          { by: 'seoyeon', text: '아 참, 우리 집 두 시에 시작해. 기억해 줘!', pause: 850 },
        ],
        nudge: [{ by: 'minjun', text: '난 편지 쓸까 생각 중이야. 넌 어때?' }],
      },
      {
        id: 'wrapup',
        match: [],
        fallback: [
          { by: 'seoyeon', text: '토요일에 우리 집에서 보자! 진짜 기대된다.' },
          { by: 'minjun', text: '나도! 셋이 같이 노는 거 처음이잖아.', pause: 900 },
        ],
        nudge: [{ by: 'seoyeon', text: '괜찮아, 편하게 오기만 해!' }],
      },
    ],
    closing: [
      { by: 'seoyeon', text: '초대하는 말, 받는 말 오늘 많이 해 봤다!' },
      { by: 'minjun', text: '토요일에 보자. 안녕!', pause: 850 },
    ],
  },

  /* ──────────────────────── 편의점 계산하기 ──────────────────────── */
  'convenience-store': {
    opening: [
      { by: 'minjun', text: '학교 끝나고 편의점 왔다! 나 삼각김밥 살 건데.' },
      { by: 'seoyeon', text: '너는 뭐 살 거야? 골라 봐!', pause: 850 },
    ],
    beats: [
      {
        id: 'pick',
        match: [
          {
            any: ['우유', '주스', '물', '음료'],
            replies: [
              { by: 'seoyeon', text: '오 시원한 거 좋지! 저기 냉장고에 있어.' },
              {
                by: 'minjun',
                text: '유통기한 한번 봐 봐. 날짜 지난 건 안 사는 게 좋아.',
                word: '유통기한',
                pause: 900,
              },
            ],
          },
          {
            any: ['과자', '빵', '김밥', '라면', '아이스크림', '초콜릿', '사탕'],
            replies: [
              { by: 'minjun', text: '오 그거 맛있어! 나도 자주 사 먹어.' },
              {
                by: 'seoyeon',
                text: '그거 하나 더 주는 행사 중이야. 덤으로 하나 더 가져가!',
                word: '덤',
                pause: 900,
              },
            ],
          },
          {
            any: ['몰라', '모르', '없어', '고민'],
            replies: [
              { by: 'seoyeon', text: '천천히 골라도 돼! 아무도 안 재촉해.' },
              { by: 'minjun', text: '음료수 코너부터 볼까? 뭐 마시고 싶어?', pause: 850 },
            ],
          },
        ],
        fallback: [
          { by: 'minjun', text: '오 그거구나!' },
          { by: 'seoyeon', text: '그거 들고 계산대로 가자. 내가 옆에 있을게.', word: '계산', pause: 850 },
        ],
        nudge: [{ by: 'minjun', text: '먹고 싶은 거 하나만 말해 봐! 나는 삼각김밥!' }],
      },
      {
        id: 'pay',
        match: [
          {
            any: ['계산', '얼마', '카드', '현금', '돈', '주세요', '결제'],
            replies: [
              { by: 'seoyeon', text: '잘했어! "계산해 주세요"라고 하면 딱이야.', word: '계산' },
              {
                by: 'minjun',
                text: '아저씨가 "봉투 필요하세요?" 물어보실 거야. 뭐라고 대답할래?',
                word: '봉투',
                pause: 950,
              },
            ],
          },
          {
            any: ['봉투', '괜찮', '필요', '아니'],
            replies: [
              { by: 'minjun', text: '오 대답 완벽했어! 나도 그렇게 말해.' },
              { by: 'seoyeon', text: '이제 영수증 받고 나가면 끝! 잘했다.', pause: 850 },
            ],
          },
        ],
        fallback: [
          { by: 'seoyeon', text: '계산대에서는 "계산해 주세요"라고 하면 돼.', word: '계산' },
          { by: 'minjun', text: '한번 따라 해 볼래?', pause: 800 },
        ],
        nudge: [{ by: 'seoyeon', text: '"계산해 주세요" 이렇게 말해 보자!' }],
      },
      {
        id: 'wrapup',
        match: [],
        fallback: [
          { by: 'minjun', text: '오늘 혼자서도 잘 사겠는데?' },
          { by: 'seoyeon', text: '다음엔 네가 먼저 말해 봐. 우리가 뒤에 있을게!', pause: 900 },
        ],
        nudge: [{ by: 'minjun', text: '괜찮아, 다음에 또 연습하면 돼!' }],
      },
    ],
    closing: [
      { by: 'seoyeon', text: '편의점 말하기 성공! 완전 잘했어.' },
      { by: 'minjun', text: '다음엔 분식집 가자. 거기도 알려 줄게!', pause: 850 },
    ],
  },
}

export function getScript(missionId) {
  return DIALOGUE_SCRIPTS[missionId] ?? DIALOGUE_SCRIPTS['first-day']
}
