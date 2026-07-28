import { useState } from 'react'
import Screen from '../../components/common/Screen'
import { Card, Chip, EmptyState, Sheet } from '../../components/common/ui'
import { useStore } from '../../store/useStore'

const VIEWS = [
  { id: 'translated', label: '모국어' },
  { id: 'easyKorean', label: '쉬운 한국어' },
  { id: 'original', label: '원문' },
]

export default function ParentNotices() {
  const notices = useStore((s) => s.notices)
  const markRead = useStore((s) => s.markNoticeRead)

  const [openId, setOpenId] = useState(null)
  const [view, setView] = useState('translated')

  const active = notices.find((n) => n.id === openId)
  const unread = notices.filter((n) => !n.read).length

  const open = (n) => {
    setOpenId(n.id)
    setView('translated')
    if (!n.read) markRead(n.id)
  }

  return (
    <Screen
      tone="admin"
      title="알림장"
      subtitle="선생님이 보낸 안내를 번역해서 보여 드려요"
      right={unread > 0 ? <Chip tone="coral">새 알림 {unread}</Chip> : null}
    >
      {notices.length === 0 ? (
        <EmptyState emoji="📭" title="받은 알림장이 없어요" desc="선생님이 보내면 여기에 도착해요" />
      ) : (
        <div className="space-y-2.5">
          {notices.map((n) => (
            <button key={n.id} onClick={() => open(n)} className="w-full text-left">
              <Card className={`transition-colors active:bg-paper ${!n.read ? 'ring-brand/30' : ''}`}>
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-lg ${
                      n.read ? 'bg-paper' : 'bg-brand-soft'
                    }`}
                  >
                    {n.read ? '📄' : '📬'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-[14.5px] font-bold text-ink">{n.title}</p>
                      {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-coral" />}
                    </div>
                    <p className="mt-0.5 text-[11.5px] text-ink-faint">
                      {n.date} · {n.from}
                    </p>
                    <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-ink-soft">
                      {n.easyKorean}
                    </p>
                    <div className="mt-2 flex gap-1.5">
                      <Chip tone="brand">모국어 번역</Chip>
                      <Chip tone="mint">쉬운 한국어</Chip>
                    </div>
                  </div>
                </div>
              </Card>
            </button>
          ))}
        </div>
      )}

      <p className="mt-4 rounded-2xl bg-white p-3.5 text-[11.5px] leading-relaxed text-ink-soft ring-1 ring-black/5">
        ℹ️ 프로토타입에서는 실제 번역 대신 준비된 예시 문구를 보여 드립니다. 실서비스에서는
        선생님이 한국어로 쓰면 가정마다 설정된 언어로 자동 번역되어 전달됩니다.
      </p>
      <div className="h-2" />

      <Sheet open={Boolean(active)} onClose={() => setOpenId(null)} title={active?.title}>
        {active && (
          <>
            <p className="-mt-2 mb-3 text-[11.5px] text-ink-faint">
              {active.date} · {active.from}
            </p>

            <div className="mb-3 flex rounded-full bg-paper p-1">
              {VIEWS.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setView(v.id)}
                  className={`flex-1 rounded-full py-2 text-[12px] font-bold transition-colors ${
                    view === v.id ? 'bg-white text-ink shadow-sm' : 'text-ink-faint'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>

            <div className="rounded-2xl bg-paper p-4">
              <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink">
                {active[view]}
              </p>
            </div>

            {view === 'easyKorean' && (
              <p className="mt-3 rounded-2xl bg-mint-soft p-3 text-[11.5px] leading-relaxed text-mint-deep">
                💡 아이와 함께 읽어 보세요. 짧은 문장으로 다시 쓴 버전이에요.
              </p>
            )}
          </>
        )}
      </Sheet>
    </Screen>
  )
}
