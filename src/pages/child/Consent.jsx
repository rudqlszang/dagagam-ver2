import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { Button } from '../../components/common/ui'
import Icon from '../../components/common/Icon'
import Avatar from '../../components/common/Avatar'
import { userAvatarUrl } from '../../mock/characters'
import { chatStatus, ensureProbe } from '../../lib/chatClient'

const AGREEMENTS = [
  {
    id: 'voice',
    required: true,
    emoji: '🎙️',
    title: '음성 사용에 동의합니다',
    desc: '아이가 말한 내용은 글자로 바뀌어 대화에 쓰여요. 음성 파일은 저장하지 않습니다.',
  },
  {
    id: 'record',
    required: true,
    emoji: '📝',
    title: '대화 기록을 보호자가 볼 수 있어요',
    desc: '아이에게도 "부모님이 볼 수 있어"라고 미리 알려 주세요. 아이의 프라이버시를 위해 요약을 먼저 보여 드립니다.',
  },
  {
    id: 'marketing',
    required: false,
    emoji: '💌',
    title: '학습 리포트 알림 받기 (선택)',
    desc: '주간 성장 리포트가 준비되면 알려 드려요.',
  },
]

export default function Consent() {
  const navigate = useNavigate()
  const setConsent = useStore((s) => s.setConsent)
  const nickname = useStore((s) => s.nickname)
  const setNickname = useStore((s) => s.setNickname)

  const consented = useStore((s) => s.consented)
  const onboarded = useStore((s) => s.onboarded)

  const [checked, setChecked] = useState({})
  const [name, setName] = useState(nickname)
  const [submitted, setSubmitted] = useState(false)

  /**
   * 대화가 어디서 만들어지는지에 따라 안내 문구가 달라져야 한다.
   * 기본(무료) 모드는 기기 안에서 끝나지만, 서버에 AI 키가 있으면 아이가 한 말이
   * 실제로 AI 서버로 전달된다. 보호자 동의 화면에서 이걸 숨기면 안 된다.
   */
  const [aiMode, setAiMode] = useState(chatStatus().state === 'on')
  useEffect(() => {
    ensureProbe().then(() => setAiMode(chatStatus().state === 'on'))
  }, [])

  const allRequired = AGREEMENTS.filter((a) => a.required).every((a) => checked[a.id])
  const allChecked = AGREEMENTS.every((a) => checked[a.id])
  const ready = allRequired && Boolean(name.trim())

  const toggle = (id) => setChecked((c) => ({ ...c, [id]: !c[id] }))
  const toggleAll = () =>
    setChecked(
      allChecked ? {} : Object.fromEntries(AGREEMENTS.map((a) => [a.id, true])),
    )

  const start = () => {
    if (!ready) return
    setNickname(name)
    setConsent(true)
    setSubmitted(true)
  }

  /*
   * 동의가 스토어에 실제로 반영된 뒤에 넘어간다 (가드에 되튕기지 않도록).
   * 친구를 아직 안 만들었으면 홈이 아니라 친구 만들기부터 시작한다.
   */
  useEffect(() => {
    if (submitted && consented) {
      navigate(onboarded ? '/child' : '/child/start', { replace: true })
    }
  }, [submitted, consented, onboarded, navigate])

  return (
    <div className="flex h-full min-h-0 flex-col bg-cream">
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-4 pt-[max(2.5rem,calc(env(safe-area-inset-top)+1.5rem))]">
        <button
          onClick={() => navigate('/')}
          className="-ml-2 mb-4 flex h-9 w-9 items-center justify-center rounded-full text-ink-soft active:bg-black/5"
          aria-label="뒤로"
        >
          <Icon name="close" className="h-5 w-5" />
        </button>

        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-sun-soft px-3 py-1 text-[11px] font-bold text-sun-deep">
          <Icon name="lock" className="h-3.5 w-3.5" />
          보호자 동의가 필요해요
        </span>

        <h1 className="mt-4 text-[26px] font-black leading-snug text-ink">
          아이가 안전하게
          <br />
          이야기할 수 있도록
        </h1>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
          다가감은 아이의 말을 듣고 친구처럼 대답해요.
          시작 전에 보호자님께 꼭 알려 드릴 내용이 있어요.
        </p>

        {/* 닉네임 */}
        <div className="mt-6 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/5">
          <p className="mb-3 text-[13px] font-bold text-ink">아이를 뭐라고 부를까요?</p>
          <div className="flex items-center gap-3">
            <Avatar src={userAvatarUrl(name)} name={name || '?'} size={52} />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={10}
              placeholder="이름 또는 별명"
              className="min-w-0 flex-1 rounded-xl bg-paper px-3.5 py-3 text-[15px] font-semibold text-ink outline-none ring-1 ring-black/5 focus:ring-2 focus:ring-brand"
            />
          </div>
        </div>

        {/* 동의 항목 */}
        <div className="mt-4 space-y-2">
          <button
            onClick={toggleAll}
            className="flex w-full items-center gap-3 rounded-2xl bg-brand-soft px-4 py-3 text-left active:bg-brand/20"
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors ${
                allChecked ? 'bg-brand text-white' : 'bg-white text-transparent ring-1 ring-black/10'
              }`}
            >
              <Icon name="check" className="h-3.5 w-3.5" strokeWidth={3} />
            </span>
            <span className="text-[14px] font-bold text-brand-deep">전체 동의하기</span>
          </button>

          {AGREEMENTS.map((a) => (
            <button
              key={a.id}
              onClick={() => toggle(a.id)}
              className="flex w-full items-start gap-3 rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-black/5 active:bg-paper"
            >
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors ${
                  checked[a.id] ? 'bg-brand text-white' : 'bg-paper text-transparent ring-1 ring-black/10'
                }`}
              >
                <Icon name="check" className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="text-base">{a.emoji}</span>
                  <span className="text-[14px] font-bold text-ink">{a.title}</span>
                  {a.required && (
                    <span className="rounded bg-coral-soft px-1.5 py-0.5 text-[10px] font-bold text-coral-deep">
                      필수
                    </span>
                  )}
                </span>
                <span className="mt-1.5 block text-[12.5px] leading-relaxed text-ink-soft">
                  {a.desc}
                </span>
              </span>
            </button>
          ))}
        </div>

        <p className="mt-4 rounded-2xl bg-white/60 p-3.5 text-[11.5px] leading-relaxed text-ink-soft ring-1 ring-black/5">
          {aiMode ? (
            <>
              🔒 아이가 한 말은 친구의 대답을 만들기 위해 <b className="text-ink">AI 서버로
              전달</b>됩니다. 음성 파일은 보내지 않고, 글자로 바뀐 내용만 전달돼요.
              대화 기록은 이 기기에만 남고 새로고침하면 사라집니다.
            </>
          ) : (
            <>
              🔒 지금은 대화가 이 기기 안에서만 만들어져요. 아이가 한 말은 밖으로
              나가지 않습니다. 창을 새로고침하면 대화 기록은 사라지고, 아이가 고른
              친구와 설정만 이 기기에 남습니다.
            </>
          )}
        </p>
      </div>

      {/* 항상 보이는 하단 버튼 */}
      <div className="shrink-0 border-t border-black/5 bg-cream/95 px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        {!ready && (
          <p className="mb-2 text-center text-[11.5px] font-semibold text-ink-faint">
            {!name.trim()
              ? '아이를 부를 이름을 적어 주세요'
              : '필수 항목 2개에 동의해 주세요'}
          </p>
        )}
        <Button full size="lg" disabled={!ready} onClick={start}>
          동의하고 시작하기
        </Button>
      </div>
    </div>
  )
}
