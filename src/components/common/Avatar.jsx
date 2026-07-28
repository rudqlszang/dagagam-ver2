import { useState } from 'react'

/**
 * DiceBear 아바타.
 * 네트워크 실패(오프라인 등) 시 이름 첫 글자를 쓴 이니셜 아바타로 폴백한다.
 */

const FALLBACK_COLORS = [
  'bg-brand text-white',
  'bg-coral text-white',
  'bg-mint text-white',
  'bg-grape text-white',
  'bg-sun text-ink',
]

function pickColor(name = '') {
  let hash = 0
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  return FALLBACK_COLORS[hash % FALLBACK_COLORS.length]
}

export default function Avatar({
  src,
  name = '?',
  size = 64,
  className = '',
  imgClassName = '',
}) {
  const [failed, setFailed] = useState(false)
  const style = { width: size, height: size }

  if (!src || failed) {
    return (
      <div
        style={{ ...style, fontSize: size * 0.42 }}
        className={`flex items-center justify-center rounded-full font-bold select-none ${pickColor(name)} ${className}`}
      >
        {name.slice(0, 1)}
      </div>
    )
  }

  return (
    <div
      style={style}
      className={`overflow-hidden rounded-full bg-white/70 ${className}`}
    >
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        loading="lazy"
        onError={() => setFailed(true)}
        className={`h-full w-full object-cover ${imgClassName}`}
      />
    </div>
  )
}
