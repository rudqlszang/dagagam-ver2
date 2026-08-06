import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROLES } from '../mock/roles'
import { useStore } from '../store/useStore'
import { Button, Sheet } from '../components/common/ui'
import Icon from '../components/common/Icon'

export default function RoleSelect() {
  const navigate = useNavigate()
  const setRole = useStore((s) => s.setRole)
  const familyCode = useStore((s) => s.familyCode)
  const setFamilyCode = useStore((s) => s.setFamilyCode)

  const [codeOpen, setCodeOpen] = useState(false)
  const [draft, setDraft] = useState(familyCode)

  const enter = (role) => {
    setRole(role.id)
    navigate(role.home)
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-cream">
      {/* 배경 장식 */}
      <div className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-brand/15 blur-2xl" />
      <div className="pointer-events-none absolute -right-20 top-32 h-52 w-52 rounded-full bg-sun/20 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-16 left-10 h-52 w-52 rounded-full bg-coral/15 blur-2xl" />

      <div className="relative min-h-0 flex-1 overflow-y-auto no-scrollbar">
        <div className="flex min-h-full flex-col px-6 pb-8 pt-[max(3rem,calc(env(safe-area-inset-top)+2rem))]">
        <div className="anim-slide-up">
          <div className="flex items-center gap-2">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand text-2xl shadow-lg shadow-brand/30">
              🤝
            </span>
            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-ink-soft shadow-sm">
              로그인 없이 바로 시작
            </span>
          </div>

          <h1 className="logo-type mt-6 text-[54px] leading-[0.95]">다가감</h1>
          <div className="mt-2 flex items-center gap-2">
            <span className="h-[3px] w-9 rounded-full bg-gradient-to-r from-brand to-grape" />
            <span className="text-[12px] font-bold tracking-[0.18em] text-ink-faint">
              DAGAGAM
            </span>
          </div>

          <p className="mt-4 text-[15.5px] leading-relaxed text-ink-soft">
            한국에 온 우리 아이가
            <br />
            <span className="font-extrabold text-ink">학교 생활에 편하게 다가가도록</span>
          </p>
        </div>

        <p className="mt-8 mb-3 px-1 text-[13px] font-bold text-ink-soft">
          누구로 접속하시겠어요?
        </p>

        <div className="space-y-3">
          {ROLES.map((role, i) => (
            <button
              key={role.id}
              onClick={() => enter(role)}
              style={{ animationDelay: `${80 + i * 70}ms` }}
              className={`anim-slide-up group flex w-full items-center gap-4 rounded-[1.75rem] bg-white p-4 text-left shadow-sm ring-1 ring-black/5 transition-transform active:scale-[0.98]`}
            >
              <span
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl text-[30px] ${role.soft}`}
              >
                {role.emoji}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="text-[18px] font-extrabold text-ink">{role.label}</span>
                  <span className={`text-[11px] font-bold ${role.text}`}>
                    {role.id === 'child' ? 'MAIN' : ''}
                  </span>
                </span>
                <span className="mt-0.5 block text-[13px] text-ink-soft">{role.desc}</span>
                <span className="mt-2 flex flex-wrap gap-1">
                  {role.features.slice(0, 2).map((f) => (
                    <span
                      key={f}
                      className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${role.soft} ${role.text}`}
                    >
                      {f}
                    </span>
                  ))}
                </span>
              </span>
              <Icon
                name="play"
                fill="currentColor"
                className={`h-4 w-4 shrink-0 ${role.text} opacity-40`}
              />
            </button>
          ))}
        </div>

        {/* 연결 코드 — 커플 사이트처럼 코드 하나로 세 화면이 이어진다 */}
        <div className="mt-auto pt-8">
          <div className="rounded-2xl bg-white/70 p-3.5 ring-1 ring-black/5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-grape-soft text-base">
                🔗
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-bold text-ink">우리집 연결 코드</p>
                <p className="truncate text-[11px] text-ink-soft">
                  아이 · 부모님 · 선생님이 같은 기록을 봐요
                </p>
              </div>

              <button
                onClick={() => {
                  setDraft(familyCode)
                  setCodeOpen(true)
                }}
                className="shrink-0 rounded-lg bg-paper px-2.5 py-1.5 font-mono text-[12px] font-bold text-ink active:bg-black/10"
              >
                {familyCode}
              </button>
            </div>
          </div>
          <p className="mt-3 text-center text-[11px] leading-relaxed text-ink-faint">
            체험용 프로토타입 · 대화 기록은 서버로 보내지 않아요
            <br />
            내가 고른 친구와 설정만 이 기기에 남습니다
          </p>
        </div>
        </div>
      </div>

      <Sheet open={codeOpen} onClose={() => setCodeOpen(false)} title="연결 코드 바꾸기">
        <p className="-mt-1 mb-4 text-[13px] leading-relaxed text-ink-soft">
          같은 코드를 쓰면 아이의 대화 기록이 부모님·선생님 화면에 그대로 이어져요.
          코드를 바꾸지 않아도 바로 사용할 수 있어요.
        </p>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value.toUpperCase())}
          placeholder="DAGA-2914"
          maxLength={12}
          className="w-full rounded-2xl bg-paper px-4 py-3.5 text-center font-mono text-[18px] font-bold tracking-widest text-ink outline-none ring-1 ring-black/5 focus:ring-2 focus:ring-brand"
        />
        <Button
          full
          size="lg"
          className="mt-4"
          onClick={() => {
            setFamilyCode(draft)
            setCodeOpen(false)
          }}
        >
          저장하기
        </Button>
      </Sheet>
    </div>
  )
}
