/**
 * 캐스팅 — 대화 스크립트를 "아이가 고른 친구"로 갈아 끼운다
 *
 * ver1의 대화 스크립트(mock/dialogueScripts.js)는 화자를 'minjun' / 'seoyeon'
 * 두 값으로 하드코딩해 뒀다. ver2는 친구가 6명 + 직접 만든 친구까지 있으므로,
 * 그 두 값을 "1번 자리 / 2번 자리"라는 배역(슬롯)으로 보고 런타임에 매핑한다.
 *
 *   스크립트의 'minjun'  → 아이가 고른 친구        (cast.primary)
 *   스크립트의 'seoyeon' → 함께 나오는 짝꿍 친구    (cast.partner)
 *
 * 대사 안에 들어 있는 이름("나는 서연이야")도 같이 바꿔 준다.
 * 680줄짜리 스크립트를 건드리지 않고 캐릭터만 늘릴 수 있게 하기 위한 장치다.
 */

import { getCharacter } from '../mock/characters'
import { hasBatchim } from './korean'

/** 스크립트가 쓰는 배역 슬롯 (순서 = 무대에 서는 순서) */
export const SLOTS = ['minjun', 'seoyeon']

/** 슬롯 이름 → 스크립트 안에 등장하는 한글 이름 */
const SLOT_NAME = { minjun: '민준', seoyeon: '서연' }

/**
 * 무대에 세울 친구를 정한다. 친구는 한 명일 수도, 두 명일 수도 있다.
 *
 * 아이는 친구 한 명으로 시작하고 원할 때 한 명을 더 만든다. 그래서 partnerId가
 * 비어 있는 상태(혼자)가 정상이며, 그때는 한 명이 두 배역을 모두 맡는다.
 */
export function buildCast(primaryId, partnerId) {
  const primary = getCharacter(primaryId)

  // 지운 친구를 가리키고 있으면 getCharacter가 엉뚱한 사람을 돌려주므로 확인한다
  const resolved = partnerId ? getCharacter(partnerId) : null
  const partner =
    resolved && resolved.id === partnerId && resolved.id !== primary.id ? resolved : null
  const solo = partner === null

  return {
    primary,
    partner,
    solo,
    list: solo ? [primary] : [primary, partner],
    bySlot: { minjun: primary, seoyeon: partner ?? primary },
  }
}

/**
 * "서연이야" → "유나야" 처럼, 이름을 바꾼 뒤 남는 매개 '이'를 정리한다.
 * 받침 없는 이름 뒤에서는 '이'를 붙이지 않는 게 자연스럽다.
 */
const PARTICLE_AFTER = '야가는를도랑한테라에\\s,.!?'

function fixParticles(text, names) {
  let out = text
  for (const name of names) {
    if (hasBatchim(name)) continue
    out = out.replace(new RegExp(`${name}이(?=[${PARTICLE_AFTER}])`, 'g'), name)
  }
  return out
}

/**
 * 혼자일 때, 대사가 "다른 배역"을 3인칭으로 부르는 자리에 쓸 말.
 *
 * 스크립트에는 상대를 이름으로 부르는 대사가 있다.
 *   { by: 'minjun', text: '오 진짜? 서연이가 우리 초대한대!' }
 * 한 명이 두 배역을 다 맡는 상태에서 이름을 그대로 넣으면
 * "나래가 우리 초대한대!" 처럼 자기가 자기를 3인칭으로 부르게 된다.
 */
const OTHER_LABEL = '우리 반 친구'

/**
 * 대사 텍스트 안의 옛 이름을 캐스팅된 이름으로 동시에 치환한다.
 * @param {string} speakerSlot 이 대사를 말하는 배역 ('minjun' | 'seoyeon')
 */
export function retextLine(text, cast, speakerSlot) {
  if (!text) return text

  const map = {
    [SLOT_NAME.minjun]: cast.bySlot.minjun.name,
    [SLOT_NAME.seoyeon]: cast.bySlot.seoyeon.name,
  }

  // 혼자일 때, 말하는 사람이 아닌 쪽 이름은 3인칭 호칭으로 바꾼다
  if (cast.solo && speakerSlot) {
    const other = speakerSlot === 'minjun' ? 'seoyeon' : 'minjun'
    map[SLOT_NAME[other]] = OTHER_LABEL
  }

  const swapped = text.replace(/민준|서연/g, (m) => map[m] ?? m)
  return fixParticles(swapped, Object.values(map))
}

/** 스크립트 한 줄을 캐스팅에 맞게 변환 */
export function castLine(line, cast) {
  if (!line) return line
  const slot = cast.bySlot[line.by]
  if (!slot) return line // 'user' 같은 값은 그대로
  return { ...line, by: slot.id, text: retextLine(line.text, cast, line.by) }
}

export function castLines(lines, cast) {
  return (lines ?? []).map((l) => castLine(l, cast))
}
