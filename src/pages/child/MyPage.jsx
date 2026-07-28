import { useNavigate } from 'react-router-dom'
import Screen from '../../components/common/Screen'
import Avatar from '../../components/common/Avatar'
import { Button, Card, ProgressBar, StatTile } from '../../components/common/ui'
import { CHARACTER_LIST, userAvatarUrl } from '../../mock/characters'
import { getWord } from '../../mock/vocabulary'
import { useBadges, useStore } from '../../store/useStore'

const ACCENT_BG = {
  brand: 'bg-brand-soft',
  coral: 'bg-coral-soft',
  mint: 'bg-mint-soft',
  sun: 'bg-sun-soft',
  grape: 'bg-grape-soft',
}

function affinityLabel(v) {
  if (v >= 80) return { text: '단짝 친구', emoji: '💛' }
  if (v >= 55) return { text: '친한 친구', emoji: '😊' }
  if (v >= 30) return { text: '친해지는 중', emoji: '🙂' }
  return { text: '이제 막 알게 된 사이', emoji: '👋' }
}

export default function MyPage() {
  const navigate = useNavigate()
  const nickname = useStore((s) => s.nickname)
  const affinity = useStore((s) => s.affinity)
  const { badges, earnedCount, stats } = useBadges()

  const words = stats.words.map(getWord).filter(Boolean)

  return (
    <Screen title="나의 기록" subtitle={`${nickname}의 성장 일기`}>
      {/* 프로필 */}
      <Card className="flex items-center gap-3.5">
        <Avatar src={userAvatarUrl(nickname)} name={nickname} size={62} />
        <div className="min-w-0 flex-1">
          <p className="text-[18px] font-black text-ink">{nickname}</p>
          <p className="mt-0.5 text-[12px] text-ink-soft">
            뱃지 {earnedCount}개 · 대화 {stats.sessionCount}번
          </p>
        </div>
        <span className="rounded-2xl bg-sun-soft px-3 py-2 text-center">
          <span className="block text-[18px] font-black leading-none text-sun-deep">
            {earnedCount}
          </span>
          <span className="mt-0.5 block text-[9.5px] font-bold text-sun-deep">뱃지</span>
        </span>
      </Card>

      <div className="mt-3 flex gap-2">
        <StatTile emoji="🎙️" label="총 말한 횟수" value={stats.utteranceCount} unit="번" tone="brand" />
        <StatTile emoji="📚" label="배운 단어" value={stats.wordCount} unit="개" tone="grape" />
        <StatTile emoji="💬" label="대화한 날" value={stats.sessionCount} unit="번" tone="mint" />
      </div>

      {/* 친밀도 */}
      <h2 className="mb-2.5 mt-6 px-1 text-[15px] font-bold text-ink">친구와의 친밀도</h2>
      <div className="space-y-2.5">
        {CHARACTER_LIST.map((c) => {
          const v = affinity[c.id]
          const label = affinityLabel(v)
          return (
            <Card key={c.id} className="flex items-center gap-3">
              <Avatar src={c.avatarUrl} name={c.name} size={48} />
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex items-baseline justify-between gap-2">
                  <span className="text-[14.5px] font-extrabold text-ink">{c.name}</span>
                  <span className="shrink-0 text-[11.5px] font-bold text-ink-soft">
                    {label.emoji} {label.text}
                  </span>
                </div>
                <ProgressBar value={v} tone={c.id === 'minjun' ? 'brand' : 'coral'} />
                <p className="mt-1.5 truncate text-[11.5px] text-ink-faint">{c.tagline}</p>
              </div>
            </Card>
          )
        })}
      </div>

      {/* 뱃지 */}
      <h2 className="mb-2.5 mt-6 px-1 text-[15px] font-bold text-ink">모은 뱃지</h2>
      <div className="grid grid-cols-3 gap-2.5">
        {badges.map((b) => (
          <div
            key={b.id}
            className={`flex flex-col items-center rounded-2xl p-3 text-center transition-all ${
              b.earned
                ? `${ACCENT_BG[b.accent]} shadow-sm`
                : 'bg-white/60 ring-1 ring-black/5'
            }`}
          >
            <span
              className={`text-[26px] leading-none ${b.earned ? '' : 'opacity-25 grayscale'}`}
            >
              {b.emoji}
            </span>
            <span
              className={`mt-1.5 text-[10.5px] font-bold leading-tight ${
                b.earned ? 'text-ink' : 'text-ink-faint'
              }`}
            >
              {b.label}
            </span>
            {!b.earned && (
              <span className="mt-0.5 text-[9px] leading-tight text-ink-faint">{b.hint}</span>
            )}
          </div>
        ))}
      </div>

      {/* 배운 단어 모음 */}
      <h2 className="mb-2.5 mt-6 px-1 text-[15px] font-bold text-ink">
        내가 배운 말 {words.length > 0 && `(${words.length})`}
      </h2>
      {words.length === 0 ? (
        <Card className="text-center text-[13px] text-ink-soft">
          아직 배운 말이 없어요. 친구들과 이야기해 볼까요?
        </Card>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {words.map((w) => (
            <span
              key={w.word}
              className="rounded-full bg-white px-3 py-1.5 text-[12.5px] font-semibold text-ink shadow-sm ring-1 ring-black/5"
            >
              {w.emoji} {w.word}
            </span>
          ))}
        </div>
      )}

      <Button full size="lg" className="mt-6" onClick={() => navigate('/child')}>
        새로운 미션 하러 가기
      </Button>
      <div className="h-4" />
    </Screen>
  )
}
