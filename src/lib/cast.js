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

export function buildCast(primaryId, partnerId) {
  const primary = getCharacter(primaryId)
  let partner = getCharacter(partnerId)
  if (partner.id === primary.id) {
    // 짝꿍이 같은 캐릭터로 잡히면 기본 친구 중 다른 사람을 세운다
    partner = getCharacter(primary.id === 'seoyeon' ? 'minjun' : 'seoyeon')
  }

  return {
    primary,
    partner,
    list: [primary, partner],
    bySlot: { minjun: primary, seoyeon: partner },
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

/** 대사 텍스트 안의 옛 이름을 캐스팅된 이름으로 동시에 치환한다 */
export function retextLine(text, cast) {
  if (!text) return text
  const map = {
    [SLOT_NAME.minjun]: cast.bySlot.minjun.name,
    [SLOT_NAME.seoyeon]: cast.bySlot.seoyeon.name,
  }
  const swapped = text.replace(/민준|서연/g, (m) => map[m] ?? m)
  return fixParticles(swapped, [map['민준'], map['서연']])
}

/** 스크립트 한 줄을 캐스팅에 맞게 변환 */
export function castLine(line, cast) {
  if (!line) return line
  const slot = cast.bySlot[line.by]
  if (!slot) return line // 'user' 같은 값은 그대로
  return { ...line, by: slot.id, text: retextLine(line.text, cast) }
}

export function castLines(lines, cast) {
  return (lines ?? []).map((l) => castLine(l, cast))
}
