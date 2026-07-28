import { useState } from 'react'
import Screen from '../../components/common/Screen'
import Avatar from '../../components/common/Avatar'
import { Button, Card, Chip, SectionTitle, Sheet } from '../../components/common/ui'
import Icon from '../../components/common/Icon'
import { dicebearUrl } from '../../mock/characters'
import { STUDENTS, mockSimplify } from '../../mock/teacherData'
import { useStore } from '../../store/useStore'

export default function TeacherNotices() {
  const sendHistory = useStore((s) => s.sendHistory)
  const sendNotice = useStore((s) => s.sendNotice)

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [selected, setSelected] = useState(() => STUDENTS.map((s) => s.id))
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(null)

  const toggle = (id) =>
    setSelected((sel) => (sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]))

  const targets = STUDENTS.filter((s) => selected.includes(s.id))
  const canSend = title.trim() && body.trim() && targets.length > 0

  const send = () => {
    if (!canSend) return
    setSending(true)
    setTimeout(() => {
      const notice = sendNotice({
        title: title.trim(),
        original: body.trim(),
        easyKorean: mockSimplify(body.trim()),
        recipients: targets.map((s) => s.name),
        langs: [...new Set(targets.map((s) => s.langLabel))],
      })
      setSending(false)
      setDone({ notice, count: targets.length })
      setTitle('')
      setBody('')
    }, 900)
  }

  return (
    <Screen tone="admin" title="알림장 발송" subtitle="한 번 쓰면 가정마다 모국어로 전달돼요">
      <SectionTitle>알림장 작성</SectionTitle>
      <Card className="p-0">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목 (예: 현장체험학습 안내)"
          className="w-full rounded-t-3xl bg-transparent px-4 pb-2 pt-4 text-[14.5px] font-bold text-ink outline-none placeholder:font-medium placeholder:text-ink-faint"
        />
        <div className="mx-4 h-px bg-black/5" />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={7}
          placeholder="알림장 내용을 한국어로 편하게 작성하세요. 학생별 모국어로 자동 번역되어 전달됩니다."
          className="w-full resize-none rounded-b-3xl bg-transparent p-4 text-[13.5px] leading-relaxed text-ink outline-none placeholder:text-ink-faint"
        />
      </Card>

      {/* 받는 사람 */}
      <SectionTitle
        action={
          <button
            onClick={() =>
              setSelected(selected.length === STUDENTS.length ? [] : STUDENTS.map((s) => s.id))
            }
            className="text-[11.5px] font-bold text-brand-deep"
          >
            {selected.length === STUDENTS.length ? '전체 해제' : '전체 선택'}
          </button>
        }
      >
        받는 학생 {targets.length}/{STUDENTS.length}
      </SectionTitle>

      <div className="space-y-1.5">
        {STUDENTS.map((s) => {
          const on = selected.includes(s.id)
          return (
            <button
              key={s.id}
              onClick={() => toggle(s.id)}
              className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-colors ${
                on ? 'bg-white shadow-sm ring-1 ring-brand/30' : 'bg-white/60 ring-1 ring-black/5'
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-colors ${
                  on ? 'bg-brand text-white' : 'bg-paper text-transparent ring-1 ring-black/10'
                }`}
              >
                <Icon name="check" className="h-3 w-3" strokeWidth={3.2} />
              </span>
              <Avatar src={dicebearUrl(s.seed)} name={s.name} size={34} className="shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block text-[13.5px] font-bold text-ink">{s.name}</span>
                <span className="block text-[11px] text-ink-faint">
                  {s.flag} {s.langLabel}로 번역되어 발송
                </span>
              </span>
            </button>
          )
        })}
      </div>

      <Button full size="lg" className="mt-4" disabled={!canSend || sending} onClick={send}>
        {sending ? '번역해서 보내는 중…' : `📨 ${targets.length}명에게 보내기`}
      </Button>

      {/* 발송 히스토리 */}
      <div className="mt-6">
        <SectionTitle>발송 히스토리</SectionTitle>
        <div className="space-y-2">
          {sendHistory.map((h) => (
            <Card key={h.id}>
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mint-soft text-base">
                  ✅
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-bold text-ink">{h.title}</p>
                  <p className="mt-0.5 text-[11px] text-ink-faint">
                    {h.sentAt} · {h.recipients.length}명 발송
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {h.langs.map((l) => (
                      <Chip key={l} tone="brand">
                        {l}
                      </Chip>
                    ))}
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-paper px-2 py-1 text-[10.5px] font-bold text-ink-soft">
                  읽음 {h.readCount}/{h.recipients.length}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
      <div className="h-2" />

      {/* 발송 완료 */}
      <Sheet open={Boolean(done)} onClose={() => setDone(null)} title="발송했어요">
        {done && (
          <>
            <div className="rounded-2xl bg-mint-soft p-4 text-center">
              <div className="text-4xl">📬</div>
              <p className="mt-2 text-[15px] font-bold text-ink">
                {done.count}명의 가정에 전달했어요
              </p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">
                각 가정에 설정된 모국어와 쉬운 한국어 버전이 함께 전달됩니다.
              </p>
            </div>
            <p className="mt-3 rounded-2xl bg-paper p-3.5 text-[11.5px] leading-relaxed text-ink-soft">
              👨‍👩‍👧 부모님 화면 → 알림장 탭에서 방금 보낸 내용을 바로 확인할 수 있어요.
              하단 "역할 전환"으로 부모님 화면을 열어 보세요.
            </p>
            <Button full size="lg" className="mt-4" onClick={() => setDone(null)}>
              확인
            </Button>
          </>
        )}
      </Sheet>
    </Screen>
  )
}
