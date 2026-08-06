import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Screen from '../../components/common/Screen'
import Avatar from '../../components/common/Avatar'
import Icon from '../../components/common/Icon'
import { Button, Card, Chip, Sheet } from '../../components/common/ui'
import { useCast, useFriendRoster, useStore } from '../../store/useStore'
import {
  VOICE_TIER_LABEL,
  getVoiceReport,
  previewVoice,
  primeVoices,
  stopAll,
  unlockAudio,
} from '../../lib/voiceEngine'
import { withJosa } from '../../lib/korean'

/**
 * 친구 고르기 화면
 *
 * 아이가 "같이 이야기할 친구"를 직접 고른다. ver1에서는 민준·서연 둘이
 * 고정이었지만, ver2는 6명 중에서 고르거나 직접 만든 친구를 세울 수 있다.
 * 무대에는 항상 두 명(짝꿍 + 함께 나오는 친구)이 선다.
 */
export default function FriendPicker() {
  const navigate = useNavigate()
  const roster = useFriendRoster()
  const cast = useCast()

  const friendId = useStore((s) => s.friendId)
  const partnerId = useStore((s) => s.partnerId)
  const selectFriend = useStore((s) => s.selectFriend)
  const setPartner = useStore((s) => s.setPartner)
  const removeCustomFriend = useStore((s) => s.removeCustomFriend)
  const restartOnboarding = useStore((s) => s.restartOnboarding)
  const speed = useStore((s) => s.settings.voiceSpeed)
  const voiceOn = useStore((s) => s.settings.voice)

  const [report, setReport] = useState(() => getVoiceReport())
  const [playingId, setPlayingId] = useState(null)
  const [partnerOpen, setPartnerOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const previewRef = useRef(null)

  useEffect(() => {
    primeVoices().then(() => setReport(getVoiceReport()))
    return () => {
      previewRef.current?.cancel()
      stopAll()
    }
  }, [])

  const preview = (character) => {
    unlockAudio()
    previewRef.current?.cancel()
    setPlayingId(character.id)
    const handle = previewVoice(character, { speed, roster: cast.list })
    previewRef.current = handle
    handle.promise.then(() => setPlayingId((cur) => (cur === character.id ? null : cur)))
  }

  const tier = VOICE_TIER_LABEL[report.tier]

  return (
    <Screen title="친구 고르기" subtitle="같이 이야기할 친구를 골라 보세요" back="/child">
      {/* 지금 고른 친구 */}
      <Card className={`flex items-center gap-4 ${cast.primary.theme.soft}`}>
        <Avatar
          src={cast.primary.avatarUrl}
          name={cast.primary.name}
          size={72}
          className={`ring-4 ring-white`}
        />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold text-ink-soft">내 짝꿍</p>
          <p className="truncate text-[20px] font-black leading-tight text-ink">
            {cast.primary.emoji} {cast.primary.name}
          </p>
          <p className="mt-0.5 truncate text-[12px] text-ink-soft">
            {cast.primary.tagline}
          </p>
        </div>
        <button
          onClick={() => preview(cast.primary)}
          disabled={!voiceOn}
          aria-label="목소리 들어보기"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-ink shadow-sm active:bg-paper disabled:opacity-40"
        >
          <Icon
            name="volume"
            className={`h-5 w-5 ${playingId === cast.primary.id ? 'text-brand-deep' : ''}`}
          />
        </button>
      </Card>

      {cast.primary.background && (
        <p className="mt-2 rounded-2xl bg-white px-3.5 py-3 text-[12.5px] leading-relaxed text-ink-soft ring-1 ring-black/5">
          💬 “{cast.primary.background}”
        </p>
      )}

      {/* 목소리 상태 */}
      <button
        onClick={() => navigate('/child')}
        className="mt-2 flex w-full items-start gap-2 rounded-2xl bg-paper px-3.5 py-3 text-left"
      >
        <span className="text-base leading-none">{tier.emoji}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[12.5px] font-bold text-ink">
            목소리 상태 · {tier.text}
          </span>
          <span className="mt-0.5 block text-[11.5px] leading-relaxed text-ink-soft">
            {tier.desc}
          </span>
        </span>
      </button>

      {/* 친구 목록 */}
      <h2 className="mb-2.5 mt-6 px-1 text-[15px] font-bold text-ink">
        친구들 ({roster.length})
      </h2>
      <div className="grid grid-cols-2 gap-2.5">
        {roster.map((c) => {
          const picked = c.id === friendId
          return (
            <div
              key={c.id}
              className={`relative overflow-hidden rounded-3xl p-3 text-left transition-all ${
                picked
                  ? `${c.theme.soft} shadow-sm ring-2 ${c.theme.ring}`
                  : 'bg-white ring-1 ring-black/5'
              }`}
            >
              <button
                onClick={() => selectFriend(c.id)}
                className="block w-full text-left active:scale-[0.98]"
              >
                <div className="flex items-start justify-between">
                  <Avatar src={c.avatarUrl} name={c.name} size={54} className="ring-2 ring-white" />
                  {picked && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${c.theme.chip}`}>
                      짝꿍
                    </span>
                  )}
                </div>
                <p className="mt-2 truncate text-[15px] font-extrabold text-ink">
                  {c.emoji} {c.name}
                </p>
                <p className="mt-0.5 line-clamp-2 h-[30px] text-[11.5px] leading-[15px] text-ink-soft">
                  {c.tagline}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {c.traits.slice(0, 2).map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-semibold text-ink-soft"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </button>

              <div className="mt-2 flex gap-1.5">
                <button
                  onClick={() => preview(c)}
                  disabled={!voiceOn}
                  className="flex h-8 flex-1 items-center justify-center gap-1 rounded-xl bg-white/80 text-[11px] font-bold text-ink-soft ring-1 ring-black/5 active:bg-white disabled:opacity-40"
                >
                  <Icon
                    name="volume"
                    className={`h-3.5 w-3.5 ${playingId === c.id ? 'text-brand-deep' : ''}`}
                  />
                  들어보기
                </button>
                {c.custom && (
                  <button
                    onClick={() => setConfirmDelete(c)}
                    aria-label={`${c.name} 지우기`}
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/80 text-ink-faint ring-1 ring-black/5 active:bg-white"
                  >
                    <Icon name="trash" className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          )
        })}

        {/* 직접 만들기 */}
        <button
          onClick={() => navigate('/child/friends/new')}
          className="flex min-h-[168px] flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-brand/35 bg-brand-soft/40 p-3 text-center active:scale-[0.98]"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand-deep shadow-sm">
            <Icon name="wand" className="h-6 w-6" />
          </span>
          <span className="text-[14px] font-extrabold text-ink">나만의 친구 만들기</span>
          <span className="px-1 text-[11px] leading-[15px] text-ink-soft">
            이름·성격·목소리를 내가 정해요
          </span>
        </button>
      </div>

      {/* 키워드로 두 명 다시 만들기 */}
      <button
        onClick={() => {
          restartOnboarding()
          navigate('/child/start')
        }}
        className="mt-2.5 flex w-full items-center gap-3 rounded-3xl bg-white p-3.5 text-left shadow-sm ring-1 ring-black/5 active:bg-paper"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sun-soft text-lg">
          🎲
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14.5px] font-extrabold text-ink">
            키워드로 두 명 다시 만들기
          </span>
          <span className="block text-[11.5px] text-ink-soft">
            처음처럼 좋아하는 것·성격을 골라서 새로 만들어요
          </span>
        </span>
        <Icon name="play" className="h-4 w-4 shrink-0 text-ink-faint" />
      </button>

      {/* 함께 나올 친구 */}
      <h2 className="mb-1 mt-6 px-1 text-[15px] font-bold text-ink">함께 나올 친구</h2>
      <p className="mb-2.5 px-1 text-[12px] leading-relaxed text-ink-soft">
        대화에는 두 명이 나와요. 옆에 같이 앉을 친구예요.
      </p>
      <button
        onClick={() => setPartnerOpen(true)}
        className="flex w-full items-center gap-3 rounded-3xl bg-white p-3.5 text-left shadow-sm ring-1 ring-black/5 active:bg-paper"
      >
        <Avatar src={cast.partner.avatarUrl} name={cast.partner.name} size={44} />
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-extrabold text-ink">
            {cast.partner.emoji} {cast.partner.name}
          </span>
          <span className="block truncate text-[11.5px] text-ink-soft">
            {cast.partner.tagline}
          </span>
        </span>
        <Chip tone="paper">바꾸기</Chip>
      </button>

      <Button full size="lg" className="mt-6" onClick={() => navigate('/child')}>
        이 친구들과 이야기하기
      </Button>
      <div className="h-4" />

      {/* 짝꿍 고르기 시트 */}
      <Sheet open={partnerOpen} onClose={() => setPartnerOpen(false)} title="함께 나올 친구">
        <div className="space-y-2">
          {roster
            .filter((c) => c.id !== friendId)
            .map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setPartner(c.id)
                  setPartnerOpen(false)
                }}
                className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left ring-1 transition-colors ${
                  c.id === partnerId
                    ? `${c.theme.soft} ring-transparent`
                    : 'bg-white ring-black/6 active:bg-paper'
                }`}
              >
                <Avatar src={c.avatarUrl} name={c.name} size={42} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-bold text-ink">
                    {c.emoji} {c.name}
                  </span>
                  <span className="block truncate text-[12px] text-ink-soft">{c.tagline}</span>
                </span>
                {c.id === partnerId && <Icon name="check" className="h-5 w-5 text-brand-deep" />}
              </button>
            ))}
        </div>
      </Sheet>

      {/* 삭제 확인 */}
      <Sheet
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        title={
          confirmDelete ? `${withJosa(confirmDelete.name, '을/를')} 지울까요?` : ''
        }
      >
        <p className="-mt-1 mb-4 text-[13px] leading-relaxed text-ink-soft">
          지우면 다시 만들어야 해요.
        </p>
        <div className="space-y-2">
          <Button
            full
            size="lg"
            variant="danger"
            onClick={() => {
              removeCustomFriend(confirmDelete.id)
              setConfirmDelete(null)
            }}
          >
            지우기
          </Button>
          <Button full size="lg" variant="soft" onClick={() => setConfirmDelete(null)}>
            그냥 둘래요
          </Button>
        </div>
      </Sheet>
    </Screen>
  )
}
