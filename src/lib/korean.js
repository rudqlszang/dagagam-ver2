/**
 * 한국어 조사 도우미
 *
 * ver2부터 친구 이름이 키워드에서 자동으로 만들어진다. 그래서 "나래", "바다"처럼
 * 받침 없는 이름이 수시로 나오는데, 화면 문구에 조사를 하드코딩해 두면
 * "나래이랑 바다이가 기다리고 있어요" 같은 문장이 아이에게 그대로 보인다.
 *
 * 아이가 한국어를 배우는 앱에서 앱 자신이 틀린 한국어를 보여 주면 안 된다.
 */

/** 마지막 글자에 받침이 있는가 (한글이 아니면 없는 것으로 본다) */
export function hasBatchim(word) {
  const ch = (word ?? '').trim().slice(-1)
  if (!ch) return false
  const code = ch.charCodeAt(0) - 0xac00
  if (code < 0 || code > 11171) return false
  return code % 28 !== 0
}

/**
 * 받침 유무에 맞는 조사를 고른다.
 * @param {string} word 앞 단어
 * @param {string} pair '받침있음/받침없음' 형식. 예) '이/가', '은/는', '이랑/랑'
 */
export function josa(word, pair) {
  const [withBatchim, withoutBatchim] = pair.split('/')
  return hasBatchim(word) ? withBatchim : withoutBatchim
}

/** 단어에 알맞은 조사를 붙여서 돌려준다. 예) withJosa('나래', '이랑/랑') → '나래랑' */
export function withJosa(word, pair) {
  return `${word}${josa(word, pair)}`
}

/**
 * 자주 쓰는 조사 쌍.
 *
 * '받침있음/받침없음' 순서를 손으로 적다 보면 와/과처럼 헷갈리는 쌍에서
 * 순서를 뒤집기 쉽다. ("새록와 이야기하기" 같은 문장이 그렇게 나왔다)
 * 호출부에서는 이 상수만 쓴다.
 */
export const JOSA = {
  SUBJECT: '이/가', // 새록이 / 나래가
  TOPIC: '은/는', // 새록은 / 나래는
  OBJECT: '을/를', // 새록을 / 나래를
  WITH: '과/와', // 새록과 / 나래와
  AND: '이랑/랑', // 새록이랑 / 나래랑
  TO: '으로/로', // 새록으로 / 나래로
}
