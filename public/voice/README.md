# 캐릭터 음성 파일 위치

여기는 **성우가 녹음한 음성 파일**을 놓는 자리다. 비워 둬도 된다.

앱의 기본 목소리는 브라우저 내장 음성(무료)이며, 녹음 파일이 있으면 그쪽이
우선한다. 재생 순서는 `src/lib/voicePlayer.js` 위쪽 주석에 정리해 두었다.

```
① 여기 있는 녹음 파일
② /api/tts  (서버에 TTS 키를 넣었을 때만)
③ 브라우저 내장 한국어 음성   ← 기본
④ 무음 + 자막
```

## 녹음 파일을 쓰려면

**`manifest.json` 이 있어야 한다.** 없으면 앱은 녹음이 없다고 보고 파일 요청을
아예 보내지 않는다. (없는 파일을 매번 찾느라 대화가 밀리는 걸 막기 위해서다)

```
public/voice/manifest.json
public/voice/<캐릭터 id>/<미션 id>-<대사 순번>.mp3
```

```json
{
  "files": [
    "minjun/group-project-01.mp3",
    "seoyeon/group-project-02.mp3"
  ]
}
```

| 조각 | 값 |
| --- | --- |
| 캐릭터 id | `minjun`, `seoyeon`, `haneul`, `jiho`, `yuna`, `tao` (직접 만든 친구는 `my-…`) |
| 미션 id | `group-project`, `kpop`, `first-day`, `pe-team`, `birthday`, `convenience-store` |
| 대사 순번 | 한 턴 안에서의 순서. `01`부터 두 자리 |

## 특정 대사에 다른 파일을 쓰고 싶다면

`src/mock/dialogueScripts.js`의 해당 라인에 `audio`를 직접 지정하면
경로 규칙보다 우선한다.

```js
{ by: 'minjun', text: '어! 너도 우리 조야?', audio: '/voice/special/hello.mp3' }
```

## 참고

- 캐릭터가 6명 + 직접 만든 친구까지 늘어서, 모든 조합을 녹음하는 건 현실적이지
  않다. 녹음은 "핵심 미션 몇 개"에만 얹고 나머지는 브라우저 음성에 맡기는 것을
  전제로 설계했다.
- 브라우저 음성이 얼마나 자연스러운지는 앱의 **설정 → 목소리 상태**에서 확인할 수
  있다. 엣지(Edge)에서 열면 대부분 신경망 음성이 잡힌다.
