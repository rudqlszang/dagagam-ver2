/**
 * 장소 배경 그림
 *
 * 외부 이미지를 받아 오지 않고 SVG로 직접 그린다.
 *  - 용량 0 · 네트워크 요청 0 · 어떤 화면 크기에서도 안 깨진다
 *  - 오프라인에서도 보인다 (아이 기기가 학교 와이파이에 못 붙어도)
 *
 * 두 가지로 쓴다.
 *  variant="thumb" 장소 고르기 화면의 카드 그림
 *  variant="scene" 대화 화면의 배경 — 아바타가 주인공이라 흐리게 깐다
 */

const PALETTE = {
  cream: '#fff9f2',
  ink: '#2b3a4a',
  inkFaint: '#a3b1bf',
  brand: '#3fb6f0',
  brandSoft: '#e2f3fd',
  brandDeep: '#1c8fc7',
  sun: '#ffc94a',
  sunSoft: '#fff4d8',
  sunDeep: '#e0a413',
  mint: '#5fd3b2',
  mintSoft: '#ddf6ee',
  mintDeep: '#2ba888',
  coral: '#ff8a7a',
  coralSoft: '#ffe9e5',
  grapeSoft: '#ece5ff',
  wood: '#e8c9a0',
  woodDeep: '#c9a273',
}

/* ── 교실 ───────────────────────────────────────────────────────── */
function Classroom() {
  return (
    <>
      <rect width="360" height="240" fill={PALETTE.brandSoft} />
      {/* 바닥 */}
      <rect y="168" width="360" height="72" fill={PALETTE.wood} />
      <rect y="168" width="360" height="5" fill={PALETTE.woodDeep} opacity="0.5" />

      {/* 칠판 */}
      <rect x="60" y="42" width="170" height="86" rx="6" fill="#2f6b53" />
      <rect x="66" y="48" width="158" height="74" rx="4" fill="#3b7d61" />
      <rect x="60" y="128" width="170" height="8" rx="3" fill={PALETTE.woodDeep} />
      {/* 칠판 글씨 느낌 */}
      <rect x="80" y="66" width="70" height="5" rx="2.5" fill="#ffffff" opacity="0.65" />
      <rect x="80" y="80" width="104" height="5" rx="2.5" fill="#ffffff" opacity="0.45" />
      <rect x="80" y="94" width="52" height="5" rx="2.5" fill="#ffffff" opacity="0.45" />

      {/* 창문 */}
      <rect x="258" y="46" width="70" height="66" rx="6" fill="#cfeeff" />
      <rect x="258" y="46" width="70" height="66" rx="6" fill="none" stroke="#ffffff" strokeWidth="5" />
      <line x1="293" y1="46" x2="293" y2="112" stroke="#ffffff" strokeWidth="4" />
      <circle cx="312" cy="64" r="9" fill={PALETTE.sun} opacity="0.9" />

      {/* 시계 */}
      <circle cx="244" cy="30" r="11" fill="#ffffff" stroke={PALETTE.inkFaint} strokeWidth="2" />
      <line x1="244" y1="30" x2="244" y2="24" stroke={PALETTE.ink} strokeWidth="2" strokeLinecap="round" />
      <line x1="244" y1="30" x2="248" y2="32" stroke={PALETTE.ink} strokeWidth="2" strokeLinecap="round" />

      {/* 책상 두 줄 */}
      {[
        [24, 150],
        [104, 150],
        [232, 150],
        [304, 150],
      ].map(([x, y], i) => (
        <g key={i}>
          <rect x={x} y={y} width="52" height="9" rx="4" fill={PALETTE.wood} />
          <rect x={x + 5} y={y + 9} width="6" height="26" rx="3" fill={PALETTE.woodDeep} />
          <rect x={x + 41} y={y + 9} width="6" height="26" rx="3" fill={PALETTE.woodDeep} />
        </g>
      ))}
    </>
  )
}

/* ── 급식실 ─────────────────────────────────────────────────────── */
function Cafeteria() {
  return (
    <>
      <rect width="360" height="240" fill={PALETTE.sunSoft} />
      <rect y="172" width="360" height="68" fill="#f0e2cd" />
      <rect y="172" width="360" height="5" fill="#dcc7a8" opacity="0.7" />

      {/* 배식대 */}
      <rect x="36" y="96" width="150" height="56" rx="8" fill="#ffffff" />
      <rect x="36" y="96" width="150" height="14" rx="7" fill={PALETTE.mint} />
      {/* 배식 통 */}
      {[52, 88, 124, 156].map((x, i) => (
        <g key={i}>
          <rect x={x} y="118" width="26" height="18" rx="4" fill="#e9eef3" />
          <rect x={x + 3} y="121" width="20" height="7" rx="3" fill={i % 2 ? PALETTE.coral : PALETTE.sun} />
        </g>
      ))}

      {/* 메뉴판 */}
      <rect x="212" y="44" width="106" height="72" rx="8" fill="#ffffff" stroke={PALETTE.sunDeep} strokeWidth="3" />
      <rect x="226" y="58" width="52" height="6" rx="3" fill={PALETTE.sunDeep} opacity="0.8" />
      <rect x="226" y="74" width="78" height="5" rx="2.5" fill={PALETTE.inkFaint} opacity="0.7" />
      <rect x="226" y="87" width="66" height="5" rx="2.5" fill={PALETTE.inkFaint} opacity="0.7" />
      <rect x="226" y="100" width="72" height="5" rx="2.5" fill={PALETTE.inkFaint} opacity="0.7" />

      {/* 식판 */}
      <g>
        <rect x="228" y="176" width="96" height="46" rx="8" fill="#ffffff" />
        <rect x="236" y="184" width="36" height="30" rx="5" fill="#f4f7fa" />
        <circle cx="292" cy="192" r="9" fill={PALETTE.coralSoft} />
        <circle cx="292" cy="212" r="7" fill={PALETTE.mintSoft} />
        <rect x="276" y="200" width="32" height="6" rx="3" fill="#f4f7fa" />
      </g>

      {/* 긴 식탁 */}
      <rect x="18" y="188" width="180" height="10" rx="5" fill="#ffffff" />
      <rect x="34" y="198" width="7" height="26" rx="3" fill="#e3e9ef" />
      <rect x="174" y="198" width="7" height="26" rx="3" fill="#e3e9ef" />
    </>
  )
}

/* ── 체육관 ─────────────────────────────────────────────────────── */
function Gym() {
  return (
    <>
      <rect width="360" height="240" fill={PALETTE.mintSoft} />
      {/* 마루 바닥 */}
      <rect y="150" width="360" height="90" fill="#f3dcb8" />
      <rect y="150" width="360" height="5" fill="#dfc094" opacity="0.7" />
      {/* 코트 라인 */}
      <path
        d="M40 232 L108 168 H252 L320 232"
        fill="none"
        stroke="#ffffff"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <circle cx="180" cy="200" r="30" fill="none" stroke="#ffffff" strokeWidth="4" />

      {/* 농구 골대 */}
      <rect x="160" y="26" width="52" height="38" rx="4" fill="#ffffff" stroke={PALETTE.inkFaint} strokeWidth="3" />
      <rect x="176" y="46" width="20" height="14" rx="2" fill="none" stroke={PALETTE.inkFaint} strokeWidth="3" />
      <rect x="172" y="64" width="28" height="5" rx="2.5" fill={PALETTE.coral} />
      <path d="M174 69 L178 82 M186 69 L186 84 M198 69 L194 82" stroke="#ffffff" strokeWidth="2.5" fill="none" />
      <rect x="184" y="0" width="5" height="28" fill={PALETTE.inkFaint} />

      {/* 벽 늑목 */}
      <g opacity="0.8">
        <rect x="14" y="52" width="8" height="94" rx="4" fill="#e8c9a0" />
        <rect x="72" y="52" width="8" height="94" rx="4" fill="#e8c9a0" />
        {[62, 80, 98, 116, 134].map((y) => (
          <rect key={y} x="14" y={y} width="66" height="6" rx="3" fill={PALETTE.woodDeep} />
        ))}
      </g>

      {/* 공 */}
      <circle cx="300" cy="204" r="20" fill={PALETTE.sun} />
      <path
        d="M280 204 H320 M300 184 V224 M286 190 Q300 204 286 218 M314 190 Q300 204 314 218"
        stroke={PALETTE.sunDeep}
        strokeWidth="2.5"
        fill="none"
      />
    </>
  )
}

const SCENES = { classroom: Classroom, cafeteria: Cafeteria, gym: Gym }

export default function PlaceBackground({ place, variant = 'thumb', className = '' }) {
  const Scene = SCENES[place] ?? Classroom
  const scene = variant === 'scene'

  return (
    <svg
      viewBox="0 0 360 240"
      preserveAspectRatio="xMidYMid slice"
      className={`${className} ${scene ? 'opacity-55' : ''}`}
      aria-hidden="true"
    >
      <Scene />
      {scene && (
        // 아바타와 자막이 주인공이라 위아래를 부드럽게 덮는다
        <>
          <defs>
            <linearGradient id="dg-place-fade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PALETTE.cream} stopOpacity="0.55" />
              <stop offset="45%" stopColor={PALETTE.cream} stopOpacity="0.15" />
              <stop offset="100%" stopColor={PALETTE.cream} stopOpacity="0.9" />
            </linearGradient>
          </defs>
          <rect width="360" height="240" fill="url(#dg-place-fade)" />
        </>
      )}
    </svg>
  )
}
