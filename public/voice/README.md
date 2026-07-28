# 캐릭터 음성 파일 위치

여기에 mp3(또는 wav) 파일을 넣으면 **코드 수정 없이** 바로 재생된다.
파일이 없으면 앱은 자동으로 "무음 + 자막만 표시" 모드로 동작한다.

## 경로 규칙

```
public/voice/<캐릭터 id>/<미션 id>-<대사 순번>.mp3
```

| 조각 | 값 |
| --- | --- |
| 캐릭터 id | `minjun`, `seoyeon` |
| 미션 id | `group-project`, `kpop`, `first-day`, `pe-team`, `birthday`, `convenience-store` |
| 대사 순번 | 한 턴 안에서의 순서. `01`부터 두 자리 |

예시:

```
public/voice/minjun/group-project-01.mp3
public/voice/seoyeon/group-project-02.mp3
public/voice/seoyeon/first-day-01.mp3
```

## 특정 대사에 다른 파일을 쓰고 싶다면

`src/mock/dialogueScripts.js`의 해당 라인에 `audio`를 직접 지정하면
경로 규칙보다 우선한다.

```js
{ by: 'minjun', text: '어! 너도 우리 조야?', audio: '/voice/special/hello.mp3' }
```

## 참고

- 재생 로직은 `src/lib/voicePlayer.js`에 있다.
- 파일 로딩이 400ms 안에 시작되지 않으면 무음 모드로 넘어가고, 한 번 없다고
  확인된 경로는 다시 요청하지 않는다(자막이 밀리지 않도록).
