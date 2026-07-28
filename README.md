# 다가감 (Dagagam)

한국으로 이주한 다문화 가정의 초등학생 자녀가 **한국 학교 생활과 문화에 적응**하도록 돕는 AI 서비스 프로토타입.

아이는 AI 친구 두 명과 **음성으로 대화**하며 학교에서 쓰는 말을 연습하고,
부모님은 아이의 성장을 **모국어로** 확인하고, 선생님은 수업자료와 알림장을
**쉬운 한국어 · 모국어로** 전달한다.

**▶ 바로 체험하기 : https://rudqlszang.github.io/dagagam/**
(로그인 없이 링크만 열면 됩니다)

```bash
npm install
npm run dev      # http://localhost:5173
npm run deploy   # GitHub Pages 재배포
```

> 음성 인식은 **크롬(Chrome) 또는 엣지(Edge)** 에서 동작합니다.
> 다른 브라우저에서는 안내 문구가 뜨고, "글자로 말하기"로 대화를 이어갈 수 있습니다.

---

## 접속 구조 — 로그인이 없다

첫 화면에서 **아이 / 부모님 / 선생님** 중 하나를 고르면 바로 들어간다.
회원가입도, 로그인도 없다. 대신 **연결 코드**(기본값 `DAGA-2914`) 하나로
세 화면이 같은 데이터를 본다.

**아무것도 저장하지 않는다.** 새로고침하거나 다른 사람이 링크를 열면
언제나 같은 초기 화면에서 시작한다 (체험용 프로토타입이라 의도한 동작).

```
        아이 화면 ──── 대화를 마치면 ────┐
                                        ▼
                            zustand (메모리 전용)
                                        ▲
        교사 화면 ──── 알림장을 보내면 ──┘ ────▶ 부모 화면에 즉시 도착
```

세 역할은 하단 **"역할 전환"** 버튼으로 언제든 오갈 수 있다.
연동을 확인해 보려면:

1. **아이**로 들어가 미션 하나를 끝낸다 → 요약 카드가 뜬다
2. 하단 **역할 전환 → 부모님** → 대시보드의 발화 그래프 · 새 단어 · 대화 기록에 반영됨
3. **역할 전환 → 선생님** → 알림장을 작성해 발송
4. 다시 **부모님 → 알림장** 탭에 방금 보낸 알림장이 도착해 있다

---

## 화면 구성

### 1. 아이 화면 (메인)

| 경로 | 화면 | 내용 |
| --- | --- | --- |
| `/child/consent` | 보호자 동의 | 음성 사용 · 기록 열람 동의, 닉네임 설정 |
| `/child` | 홈 | 대화 미션 6종, 최근 대화 이어하기 |
| `/child/talk/:missionId` | **음성 대화** | 핵심 기능 |
| `/child/summary` | 대화 요약 | 발화 횟수 · 새 단어 · 참여도 · 친밀도 |
| `/child/me` | 마이페이지 | 뱃지 모음, 캐릭터 친밀도 게이지 |

**음성 대화 화면**이 이 서비스의 핵심이다. 채팅 UI가 아니라, 셋이 둘러앉아
이야기하는 장면으로 구성했다.

- 사용자 아바타 1개 + AI 친구 아바타 2개(민준 · 서연)를 삼각 구도로 배치
- **말하는 중** 표현은 입모양 애니메이션 대신 **아바타 확대 + 테두리 펄스 글로우**
- 하단에는 큼직한 마이크 버튼 하나 — **꾹 누르고 말하는** 방식
- 아이가 말하면 → 실시간 자막 → 한 친구가 반응 → 잠깐 텀을 두고 다른 친구가
  맞장구/추가 질문 (실제 3자 대화 템포)
- 어려운 말이 나오면 **"쉬운 설명 카드"** 가 화면 위로 떠오른다
- 실시간 자막은 설정에서 켜고 끌 수 있다
- 마이크가 안 될 때를 위한 **"글자로 말하기"** 폴백 버튼

### 2. 부모 화면

| 경로 | 내용 |
| --- | --- |
| `/parent` | 자녀 선택, 주간 참여도 막대그래프, 성장 레이더/발음 추이, 또래 관계 신호, 새 단어, 어려워한 표현, **모국어 요약 토글** |
| `/parent/notices` | 교사가 보낸 알림장 (모국어 / 쉬운 한국어 / 원문 3가지 보기) |
| `/parent/transcripts` | 지난 대화 다시 보기 — 프라이버시 안내 후 전체 자막 열람 |

### 3. 교사 화면

| 경로 | 내용 |
| --- | --- |
| `/teacher` | 다문화 학생 리스트, 한국어 레벨 · 적응도 · 집중 지도 포인트 |
| `/teacher/materials` | 수업자료 붙여넣기 → "모국어로 번역" / "쉬운 한국어로 다시 쓰기" |
| `/teacher/notices` | 알림장 작성 → 학생별 자동 번역 발송 → 발송 히스토리 |

---

## 폴더 구조

```
src/
├─ App.jsx                    라우팅 + 모바일 프레임 + 하단 역할 스위처
├─ store/useStore.js          zustand 메모리 스토어 (세 역할이 공유, 저장 안 함)
│
├─ mock/                      ★ 교체 대상 데이터는 전부 여기에 모여 있다
│   ├─ characters.js          민준 · 서연 (DiceBear seed, 음성 파일 경로)
│   ├─ missions.js            대화 미션 6종
│   ├─ dialogueScripts.js     미션별 대화 트리 + 키워드 매칭 규칙
│   ├─ vocabulary.js          "쉬운 설명 카드" 단어 사전
│   ├─ badges.js              뱃지 정의
│   ├─ roles.js               역할 3종
│   ├─ parentData.js          부모 대시보드 지표 · 알림장 시드
│   ├─ teacherData.js         학생 리스트 · 수업자료 변환 mock
│   └─ translations.js        모국어 요약 문구
│
├─ lib/
│   ├─ speech.js              SpeechRecognition 래퍼 (지원 여부 · 권한 거부 처리)
│   ├─ voicePlayer.js         녹음 음성 재생기 (파일 없으면 무음 + 자막)
│   └─ conversationEngine.js  ★★ Claude API 교체 지점
│
├─ components/  common / child / parent / teacher
└─ pages/       RoleSelect · child/ · parent/ · teacher/
```

---

## 나중에 실제 서비스로 바꿀 때

### 1) AI 대화를 Claude API로 교체

`src/lib/conversationEngine.js`의 **`getReplies()` 내부만** 바꾸면 된다.
화면 코드(`Conversation.jsx`)는 손댈 필요가 없다.

```js
export async function getReplies({ missionId, beatIndex, userText, history }) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ missionId, userText, history }),
  })
  const { lines } = await res.json()
  return { lines, nextBeatIndex: beatIndex + 1, phase: 'beat' }
}
```

반환 형식만 지키면 된다:

```js
lines: [{ by: 'minjun' | 'seoyeon', text: string, word?: string, pause?: number }]
```

`mock/dialogueScripts.js`는 지우지 말고 **오프라인 폴백**으로 남겨 두면 좋다.

### 2) 성우 녹음 음성 추가

음성은 3단계로 내려간다 (`src/lib/voicePlayer.js`).

1. **성우 녹음 파일** `public/voice/...` — 있으면 최우선
2. **브라우저 기본 음성**(SpeechSynthesis) — 파일이 아직 없을 때의 임시 목소리.
   민준·서연이 서로 다른 pitch/rate를 쓴다 (`mock/characters.js`의 `tts`)
3. **무음 + 자막 타이밍** — 설정에서 "친구 목소리 듣기"를 끄거나 TTS를 못 쓸 때

`public/voice/` 에 파일을 넣기만 하면 코드 수정 없이 1단계로 자동 승격된다.

```
public/voice/minjun/group-project-01.mp3
public/voice/seoyeon/first-day-03.mp3
        └ 캐릭터    └ 미션 id  └ 대사 순번(01부터)
```

파일이 없으면 `voicePlayer.js`가 자동으로 **무음 + 자막 타이밍** 모드로 동작한다.
개별 대사에 다른 경로를 쓰고 싶으면 스크립트 라인에 `audio: '/voice/...'` 를 넣으면 된다.

### 3) 번역 · 발음 평가

- 번역: `mock/teacherData.js`의 `mockTranslate()` / `mockSimplify()` 를 실제 API 호출로 교체
- 발음 점수: 현재는 SpeechRecognition의 `confidence` 값을 100점 환산해 쓰고 있다.
  실제 발음 평가 모델로 바꾸려면 `lib/conversationEngine.js`의 `summarize()`를 수정

---

## 안전 · 프라이버시 설계

- 아이 화면 최초 진입 시 **보호자 동의 화면** (필수 2 · 선택 1)
- 부모의 **대화 전체 보기**는 프라이버시 안내를 읽고 명시적으로 동의해야 열린다
- 아이에게도 "부모님이 볼 수 있다"는 사실을 요약 화면에서 알려 준다
- 교사에게는 **개별 대화 내용이 아니라 요약 지표만** 전달된다
- 마이크 권한 거부 / 미지원 브라우저 각각에 대한 안내 화면 제공
- 서버로 아무것도 보내지 않고, 브라우저에도 아무것도 저장하지 않는다.
  창을 닫거나 새로고침하면 모든 기록이 사라진다.

## 기술 스택

React 19 · Vite 8 · Tailwind CSS 4 · react-router-dom 7 · zustand 5 · recharts 3
· Web Speech API · DiceBear (네트워크 실패 시 이니셜 아바타로 폴백)
