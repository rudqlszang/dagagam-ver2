import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Icon from './Icon'
import { Sheet } from './ui'
import { useStore } from '../../store/useStore'
import { ROLES } from '../../mock/roles'

const TABS = {
  child: [
    { to: '/child', label: '홈', icon: 'home', end: true },
    { to: '/child/me', label: '나의 기록', icon: 'badge' },
  ],
  parent: [
    { to: '/parent', label: '대시보드', icon: 'chart', end: true },
    { to: '/parent/notices', label: '알림장', icon: 'mail' },
    { to: '/parent/transcripts', label: '대화기록', icon: 'history' },
  ],
  teacher: [
    { to: '/teacher', label: '학급', icon: 'users', end: true },
    { to: '/teacher/materials', label: '수업자료', icon: 'doc' },
    { to: '/teacher/notices', label: '알림장', icon: 'send' },
  ],
}

export default function BottomNav({ role }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const setRole = useStore((s) => s.setRole)
  const unread = useStore((s) => s.notices.filter((n) => !n.read).length)

  const tabs = TABS[role] ?? []
  const isChild = role === 'child'

  const switchTo = (next) => {
    setRole(next.id)
    setOpen(false)
    navigate(next.home)
  }

  return (
    <>
      <nav
        className={`relative z-30 shrink-0 border-t px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 ${
          isChild ? 'border-black/5 bg-cream/95' : 'border-black/6 bg-white/95'
        } backdrop-blur-md`}
      >
        <div className="flex items-stretch">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `relative flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[10.5px] font-semibold transition-colors ${
                  isActive ? 'text-brand-deep' : 'text-ink-faint'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="relative">
                    <Icon
                      name={tab.icon}
                      className={isChild ? 'h-6 w-6' : 'h-5 w-5'}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    {tab.icon === 'mail' && role === 'parent' && unread > 0 && (
                      <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral px-1 text-[9px] font-bold text-white">
                        {unread}
                      </span>
                    )}
                  </span>
                  {tab.label}
                </>
              )}
            </NavLink>
          ))}

          {/* 역할 전환 스위처 */}
          <button
            onClick={() => setOpen(true)}
            className="flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[10.5px] font-semibold text-ink-faint"
          >
            <Icon name="swap" className={isChild ? 'h-6 w-6' : 'h-5 w-5'} />
            역할 전환
          </button>
        </div>
      </nav>

      <Sheet open={open} onClose={() => setOpen(false)} title="누구로 볼까요?">
        <p className="-mt-1 mb-4 text-[13px] leading-relaxed text-ink-soft">
          로그인 없이 언제든 바꿀 수 있어요. 세 화면은 같은 데이터를 함께 봅니다.
        </p>
        <div className="space-y-2">
          {ROLES.map((r) => (
            <button
              key={r.id}
              onClick={() => switchTo(r)}
              className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left ring-1 transition-colors ${
                r.id === role
                  ? `${r.soft} ring-transparent`
                  : 'bg-white ring-black/6 active:bg-paper'
              }`}
            >
              <span className={`flex h-11 w-11 items-center justify-center rounded-2xl text-xl ${r.soft}`}>
                {r.emoji}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-bold text-ink">{r.label}</span>
                <span className="block truncate text-[12px] text-ink-soft">{r.desc}</span>
              </span>
              {r.id === role && <Icon name="check" className="h-5 w-5 text-brand-deep" />}
            </button>
          ))}
        </div>
      </Sheet>
    </>
  )
}
