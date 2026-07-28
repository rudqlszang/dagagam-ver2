import { useState } from 'react'
import Screen from '../../components/common/Screen'
import Avatar from '../../components/common/Avatar'
import { Button, Card, Chip, EmptyState, Sheet } from '../../components/common/ui'
import { getCharacter, userAvatarUrl } from '../../mock/characters'
import { getMission } from '../../mock/missions'
import { useStore } from '../../store/useStore'

function fmtDuration(sec = 0) {
  const m = Math.floor(sec / 60)
  return m > 0 ? `${m}분 ${sec % 60}초` : `${sec}초`
}

export default function ParentTranscripts() {
  const sessions = useStore((s) => s.sessions)
  const nickname = useStore((s) => s.nickname)

  const [openId, setOpenId] = useState(null)
  const [fullAllowed, setFullAllowed] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)

  const active = sessions.find((s) => s.id === openId)

  return (
    <Screen tone="admin" title="지난 대화 다시 보기" subtitle="자막 텍스트로 남은 기록">
      {/* 프라이버시 안내 */}
      <div className="mb-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/5">
        <div className="flex items-start gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sun-soft text-base">
            🔒
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-bold text-ink">아이의 프라이버시를 지켜 주세요</p>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
              대화 전체를 보기 전에 한 번 더 생각해 주세요. 아이도 부모님이 볼 수 있다는
              것을 알고 있어요. 요약만으로 충분한 경우가 많고, 전체를 읽는 것이
              아이에게는 부담이 될 수 있습니다.
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              {fullAllowed ? (
                <>
                  <Chip tone="mint">전체 보기 켜짐</Chip>
                  <button
                    onClick={() => setFullAllowed(false)}
                    className="text-[11.5px] font-bold text-ink-faint underline"
                  >
                    다시 요약만 보기
                  </button>
                </>
              ) : (
                <Button size="sm" variant="soft" onClick={() => setPrivacyOpen(true)}>
                  대화 기록 전체 보기
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {sessions.length === 0 ? (
        <EmptyState
          emoji="💬"
          title="아직 저장된 대화가 없어요"
          desc="아이가 대화를 마치면 여기에 기록이 남아요"
        />
      ) : (
        <div className="space-y-2.5">
          {sessions.map((s) => {
            const mission = getMission(s.missionId)
            return (
              <button
                key={s.id}
                onClick={() => setOpenId(s.id)}
                className="w-full text-left"
              >
                <Card className="transition-colors active:bg-paper">
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-xl">
                      {mission.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14.5px] font-bold text-ink">
                        {s.missionTitle}
                      </p>
                      <p className="mt-0.5 text-[11.5px] text-ink-faint">
                        {s.date} · {fmtDuration(s.durationSec)} · 발화 {s.utterances}번
                      </p>
                      {s.newWords?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {s.newWords.slice(0, 4).map((w) => (
                            <Chip key={w} tone="grape">
                              {w}
                            </Chip>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-ink-faint">›</span>
                  </div>
                </Card>
              </button>
            )
          })}
        </div>
      )}
      <div className="h-2" />

      {/* 전체 보기 동의 */}
      <Sheet open={privacyOpen} onClose={() => setPrivacyOpen(false)} title="전체 대화를 보시겠어요?">
        <div className="space-y-2.5 rounded-2xl bg-paper p-4 text-[12.5px] leading-relaxed text-ink-soft">
          <p>• 아이가 말한 문장이 그대로 보입니다.</p>
          <p>• 아이에게 "부모님이 볼 수 있어"라고 미리 알려 주세요.</p>
          <p>• 대화 내용으로 아이를 다그치기보다, 궁금한 점을 물어봐 주세요.</p>
        </div>
        <Button
          full
          size="lg"
          className="mt-4"
          onClick={() => {
            setFullAllowed(true)
            setPrivacyOpen(false)
          }}
        >
          이해했어요, 전체 보기
        </Button>
        <Button full size="lg" variant="soft" className="mt-2" onClick={() => setPrivacyOpen(false)}>
          요약만 볼게요
        </Button>
      </Sheet>

      {/* 대화 상세 */}
      <Sheet open={Boolean(active)} onClose={() => setOpenId(null)} title={active?.missionTitle}>
        {active && (
          <>
            <div className="-mt-2 mb-3 flex flex-wrap gap-1.5">
              <Chip>{active.date}</Chip>
              <Chip>발화 {active.utterances}번</Chip>
              <Chip>{fmtDuration(active.durationSec)}</Chip>
              {active.engagement != null && <Chip tone="coral">참여도 {active.engagement}</Chip>}
            </div>

            {!fullAllowed ? (
              <div className="rounded-2xl bg-paper p-4">
                <p className="text-[13px] font-bold text-ink">요약</p>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">
                  아이가 {active.utterances}번 이야기했고, 새로운 말{' '}
                  {active.newWords?.length ?? 0}개를 만났어요.
                </p>
                {active.newWords?.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {active.newWords.map((w) => (
                      <Chip key={w} tone="grape">
                        {w}
                      </Chip>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => setPrivacyOpen(true)}
                  className="mt-3 text-[12px] font-bold text-brand-deep underline"
                >
                  전체 대화 보기
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {active.lines?.map((line, i) => {
                  const mine = line.by === 'user'
                  const char = mine ? null : getCharacter(line.by)
                  return (
                    <div
                      key={i}
                      className={`flex items-end gap-2 ${mine ? 'flex-row-reverse' : ''}`}
                    >
                      <Avatar
                        src={mine ? userAvatarUrl(nickname) : char.avatarUrl}
                        name={mine ? nickname : char.name}
                        size={28}
                        className="shrink-0"
                      />
                      <div
                        className={`max-w-[75%] rounded-2xl px-3 py-2 ${
                          mine ? 'bg-sun-soft' : 'bg-paper'
                        }`}
                      >
                        <p className="text-[10.5px] font-bold text-ink-faint">
                          {mine ? nickname : char.name}
                        </p>
                        <p className="mt-0.5 text-[13px] leading-snug text-ink">{line.text}</p>
                        {mine && line.confidence != null && (
                          <p className="mt-1 text-[10px] text-ink-faint">
                            또렷함 {Math.round(line.confidence * 100)}점
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
                {(!active.lines || active.lines.length === 0) && (
                  <p className="rounded-2xl bg-paper p-4 text-center text-[12.5px] text-ink-soft">
                    저장된 자막이 없어요.
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </Sheet>
    </Screen>
  )
}
