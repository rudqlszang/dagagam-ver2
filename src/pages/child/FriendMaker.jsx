import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Screen from '../../components/common/Screen'
import Avatar from '../../components/common/Avatar'
import Icon from '../../components/common/Icon'
import { Button, Card } from '../../components/common/ui'
import { useStore } from '../../store/useStore'
import {
  ACCENT_KEYS,
  LIKE_OPTIONS,
  SPEAK_STYLES,
  THEMES,
  TRAIT_OPTIONS,
  VOICE_PRESETS,
  buildCustomCharacter,
  emptyCustomDraft,
} from '../../mock/characters'
import { previewVoice, primeVoices, stopAll, unlockAudio } from '../../lib/voiceEngine'

/**
 * 나만의 친구 만들기
 *
 * 발표자료의 "학생이 원하는 친구의 말투·성격·역할을 스스로 정한다"를 그대로
 * 화면으로 옮긴 곳이다. 여기서 고른 값은 캐릭터의 persona 문장으로 합쳐지고,
 * 실제 Claude를 붙이면 그 문장이 그대로 시스템 프롬프트로 들어간다.
 */

const EMOJIS = ['✨', '🐣', '🦊', '🐼', '🐨', '🦄', '🌈', '⭐', '🍀', '🐰', '🐯', '🐧']

const ACCENT_SWATCH = {
  brand: 'bg-brand',
  coral: 'bg-coral',
  mint: 'bg-mint',
  grape: 'bg-grape',
  sun: 'bg-sun',
  berry: 'bg-berry',
}

function Section({ step, title, hint, children }) {
  return (
    <section className="mt-5">
      <div className="mb-2 flex items-baseline gap-2 px-1">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-white">
          {step}
        </span>
        <h2 className="text-[15px] font-bold text-ink">{title}</h2>
      </div>
      {hint && <p className="mb-2 px-1 text-[12px] leading-relaxed text-ink-soft">{hint}</p>}
      {children}
    </section>
  )
}

function PickChip({ active, onClick, children, tone = 'brand' }) {
  const theme = THEMES[tone]
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors ${
        active
          ? `${theme.solid} text-white shadow-sm`
          : 'bg-white text-ink-soft ring-1 ring-black/6 active:bg-paper'
      }`}
    >
      {children}
    </button>
  )
}

export default function FriendMaker() {
  const navigate = useNavigate()
  const addCustomFriend = useStore((s) => s.addCustomFriend)
  const speed = useStore((s) => s.settings.voiceSpeed)
  const voiceOn = useStore((s) => s.settings.voice)

  const [draft, setDraft] = useState(emptyCustomDraft)
  const previewRef = useRef(null)

  useEffect(() => {
    primeVoices()
    return () => {
      previewRef.current?.cancel()
      stopAll()
    }
  }, [])

  const patch = (p) => setDraft((d) => ({ ...d, ...p }))

  const toggle = (key, value, max) =>
    setDraft((d) => {
      const cur = d[key]
      if (cur.includes(value)) return { ...d, [key]: cur.filter((v) => v !== value) }
      if (max && cur.length >= max) return d
      return { ...d, [key]: [...cur, value] }
    })

  // 미리보기용 임시 캐릭터 — 저장 전에도 얼굴과 목소리를 확인할 수 있다
  const preview = useMemo(() => buildCustomCharacter(draft, 'preview'), [draft])

  const listen = () => {
    unlockAudio()
    previewRef.current?.cancel()
    previewRef.current = previewVoice(preview, { speed })
  }

  const save = () => {
    const id = `my-${Date.now().toString(36)}`
    addCustomFriend(buildCustomCharacter(draft, id))
    navigate('/child/friends', { replace: true })
  }

  const ready = draft.name.trim().length > 0

  return (
    <Screen title="나만의 친구 만들기" subtitle="내가 원하는 친구를 직접 정해요" back="/child/friends">
      {/* 미리보기 */}
      <Card className={`flex items-center gap-4 ${preview.theme.soft}`}>
        <Avatar
          src={preview.avatarUrl}
          name={preview.name}
          size={68}
          className="ring-4 ring-white"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[19px] font-black leading-tight text-ink">
            {preview.emoji} {draft.name.trim() || '이름을 정해 주세요'}
          </p>
          <p className="mt-0.5 line-clamp-2 text-[12px] leading-[16px] text-ink-soft">
            {preview.persona}
          </p>
        </div>
        <button
          onClick={listen}
          disabled={!voiceOn}
          aria-label="목소리 들어보기"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-ink shadow-sm active:bg-paper disabled:opacity-40"
        >
          <Icon name="volume" className="h-5 w-5" />
        </button>
      </Card>

      {/* 1. 이름 */}
      <Section step={1} title="이름이 뭐야?">
        <input
          value={draft.name}
          onChange={(e) => patch({ name: e.target.value.slice(0, 8) })}
          placeholder="예) 하루"
          maxLength={8}
          className="w-full rounded-2xl bg-white px-4 py-3.5 text-[16px] font-semibold text-ink outline-none ring-1 ring-black/6 focus:ring-2 focus:ring-brand"
        />
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => patch({ emoji: e })}
              className={`flex h-10 w-10 items-center justify-center rounded-2xl text-xl transition-transform active:scale-95 ${
                draft.emoji === e ? 'bg-ink/90 shadow-sm' : 'bg-white ring-1 ring-black/6'
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </Section>

      {/* 2. 색 */}
      <Section step={2} title="무슨 색이 어울려?">
        <div className="flex gap-2.5">
          {ACCENT_KEYS.map((a) => (
            <button
              key={a}
              type="button"
              aria-label={`${a} 색`}
              onClick={() => patch({ accent: a })}
              className={`h-11 flex-1 rounded-2xl transition-transform active:scale-95 ${ACCENT_SWATCH[a]} ${
                draft.accent === a ? 'ring-2 ring-ink/70 ring-offset-2' : ''
              }`}
            />
          ))}
        </div>
      </Section>

      {/* 3. 성격 */}
      <Section step={3} title="어떤 성격이야?" hint="최대 3개까지 고를 수 있어요.">
        <div className="flex flex-wrap gap-1.5">
          {TRAIT_OPTIONS.map((t) => (
            <PickChip
              key={t}
              tone={draft.accent}
              active={draft.traits.includes(t)}
              onClick={() => toggle('traits', t, 3)}
            >
              {t}
            </PickChip>
          ))}
        </div>
      </Section>

      {/* 4. 좋아하는 것 */}
      <Section step={4} title="뭘 좋아해?" hint="최대 3개까지 고를 수 있어요.">
        <div className="flex flex-wrap gap-1.5">
          {LIKE_OPTIONS.map((t) => (
            <PickChip
              key={t}
              tone={draft.accent}
              active={draft.likes.includes(t)}
              onClick={() => toggle('likes', t, 3)}
            >
              {t}
            </PickChip>
          ))}
        </div>
      </Section>

      {/* 5. 말투 */}
      <Section step={5} title="어떻게 말했으면 좋겠어?">
        <div className="space-y-2">
          {SPEAK_STYLES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => patch({ style: s.id })}
              className={`flex w-full items-center gap-3 rounded-2xl p-3.5 text-left ring-1 transition-colors ${
                draft.style === s.id
                  ? `${THEMES[draft.accent].soft} ring-transparent`
                  : 'bg-white ring-black/6 active:bg-paper'
              }`}
            >
              <span className="min-w-0 flex-1">
                <span className="block text-[14.5px] font-bold text-ink">{s.label}</span>
                <span className="mt-0.5 block truncate text-[12px] text-ink-soft">{s.hint}</span>
              </span>
              {draft.style === s.id && <Icon name="check" className="h-5 w-5 text-ink" />}
            </button>
          ))}
        </div>
      </Section>

      {/* 6. 목소리 */}
      <Section step={6} title="목소리는 어떤 게 좋아?" hint="고르고 나서 오른쪽 위 🔊로 들어볼 수 있어요.">
        <div className="grid grid-cols-2 gap-2">
          {VOICE_PRESETS.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => patch({ voicePreset: v.id })}
              className={`rounded-2xl p-3 text-left ring-1 transition-colors ${
                draft.voicePreset === v.id
                  ? `${THEMES[draft.accent].soft} ring-transparent`
                  : 'bg-white ring-black/6 active:bg-paper'
              }`}
            >
              <span className="block text-[13.5px] font-bold leading-tight text-ink">
                {v.label}
              </span>
              <span className="mt-1 block text-[11px] text-ink-soft">
                {v.gender === 'male' ? '남자 친구 목소리' : '여자 친구 목소리'}
              </span>
            </button>
          ))}
        </div>
      </Section>

      {/* 7. 배경 (선택) */}
      <Section
        step={7}
        title="친구한테 알려 주고 싶은 게 있어?"
        hint="안 써도 괜찮아요. 쓰면 친구가 그걸 기억하고 말해 줘요."
      >
        <textarea
          value={draft.background}
          onChange={(e) => patch({ background: e.target.value.slice(0, 120) })}
          rows={3}
          placeholder="예) 나는 베트남에서 왔어. 한국어 받침이 제일 어려워."
          className="w-full resize-none rounded-2xl bg-white p-3.5 text-[14px] leading-relaxed text-ink outline-none ring-1 ring-black/6 focus:ring-2 focus:ring-brand"
        />
        <p className="mt-1 px-1 text-right text-[11px] text-ink-faint">
          {draft.background.length}/120
        </p>
      </Section>

      <Button full size="lg" className="mt-6" disabled={!ready} onClick={save}>
        {ready ? `${draft.name.trim()} 만들기` : '이름을 먼저 정해 주세요'}
      </Button>
      <div className="h-4" />
    </Screen>
  )
}
