import { useState } from 'react'
import Screen from '../../components/common/Screen'
import { Button, Card, Chip, SectionTitle } from '../../components/common/ui'
import {
  LANGUAGES,
  SAMPLE_MATERIAL,
  mockSimplify,
  mockTranslate,
} from '../../mock/teacherData'

export default function TeacherMaterials() {
  const [text, setText] = useState('')
  const [lang, setLang] = useState('vi')
  const [result, setResult] = useState(null) // { kind, body }
  const [busy, setBusy] = useState(false)

  const run = (kind) => {
    if (!text.trim()) return
    setBusy(true)
    setResult(null)
    // 실제로는 Claude API 호출. 프로토타입에서는 잠깐의 처리 연출만 준다.
    setTimeout(() => {
      setResult({
        kind,
        body: kind === 'translate' ? mockTranslate(text, lang) : mockSimplify(text),
      })
      setBusy(false)
    }, 700)
  }

  const copy = () => {
    if (result?.body) navigator.clipboard?.writeText(result.body)
  }

  return (
    <Screen tone="admin" title="수업자료 변환" subtitle="학생이 이해할 수 있는 형태로 바꿔 드려요">
      <SectionTitle
        action={
          <button
            onClick={() => setText(SAMPLE_MATERIAL)}
            className="text-[11.5px] font-bold text-brand-deep"
          >
            예시 넣기
          </button>
        }
      >
        원문 붙여넣기
      </SectionTitle>

      <Card className="p-0">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={9}
          placeholder="수업자료나 학습지 내용을 붙여넣어 주세요."
          className="w-full resize-none rounded-3xl bg-transparent p-4 text-[13.5px] leading-relaxed text-ink outline-none placeholder:text-ink-faint"
        />
        <div className="flex items-center justify-between border-t border-black/5 px-4 py-2.5">
          <span className="text-[11px] text-ink-faint">{text.length}자</span>
          {text && (
            <button
              onClick={() => {
                setText('')
                setResult(null)
              }}
              className="text-[11.5px] font-bold text-ink-faint"
            >
              지우기
            </button>
          )}
        </div>
      </Card>

      {/* 언어 선택 */}
      <SectionTitle>번역할 언어</SectionTitle>
      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            onClick={() => setLang(l.code)}
            className={`shrink-0 rounded-full px-3 py-2 text-[12px] font-bold transition-colors ${
              lang === l.code
                ? 'bg-ink text-white'
                : 'bg-white text-ink-soft ring-1 ring-black/6'
            }`}
          >
            {l.flag} {l.label}
          </button>
        ))}
      </div>

      {/* 변환 버튼 */}
      <div className="flex gap-2">
        <Button
          variant="primary"
          size="lg"
          className="flex-1"
          disabled={!text.trim() || busy}
          onClick={() => run('translate')}
        >
          🌏 모국어로 번역
        </Button>
        <Button
          variant="mint"
          size="lg"
          className="flex-1"
          disabled={!text.trim() || busy}
          onClick={() => run('simplify')}
        >
          ✏️ 쉬운 한국어
        </Button>
      </div>

      {busy && (
        <Card className="mt-4">
          <div className="anim-shimmer h-3 w-2/3 rounded-full bg-gradient-to-r from-paper via-black/10 to-paper" />
          <div className="anim-shimmer mt-2.5 h-3 w-full rounded-full bg-gradient-to-r from-paper via-black/10 to-paper" />
          <div className="anim-shimmer mt-2.5 h-3 w-4/5 rounded-full bg-gradient-to-r from-paper via-black/10 to-paper" />
          <p className="mt-3 text-center text-[11.5px] text-ink-faint">변환하는 중…</p>
        </Card>
      )}

      {result && !busy && (
        <div className="anim-slide-up mt-4">
          <SectionTitle
            action={
              <button onClick={copy} className="text-[11.5px] font-bold text-brand-deep">
                복사하기
              </button>
            }
          >
            변환 결과
          </SectionTitle>
          <Card>
            <div className="mb-2.5 flex gap-1.5">
              <Chip tone={result.kind === 'translate' ? 'brand' : 'mint'}>
                {result.kind === 'translate' ? '모국어 번역' : '쉬운 한국어'}
              </Chip>
              {result.kind === 'translate' && (
                <Chip>{LANGUAGES.find((l) => l.code === lang)?.label}</Chip>
              )}
            </div>
            <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-ink">
              {result.body}
            </p>
          </Card>

          <Card className="mt-2.5 bg-brand-soft ring-0">
            <p className="text-[12px] font-bold text-brand-deep">📌 다음 단계 제안</p>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
              변환한 자료를 알림장으로 보내면 학생별 모국어로 자동 번역되어 가정에
              전달됩니다.
            </p>
          </Card>
        </div>
      )}

      <div className="h-4" />
    </Screen>
  )
}
