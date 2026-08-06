import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ACCENT_STYLES, MISSIONS } from '../../mock/missions'
import { userAvatarUrl } from '../../mock/characters'
import { useCast, useStore } from '../../store/useStore'
import Avatar from '../../components/common/Avatar'
import Icon from '../../components/common/Icon'
import { SectionTitle, Sheet, Toggle } from '../../components/common/ui'
import { isSpeechSupported } from '../../lib/speech'
import {
  VOICE_TIER_LABEL,
  getVoiceReport,
  previewVoice,
  primeVoices,
  stopAll,
  unlockAudio,
} from '../../lib/voiceEngine'

const SPEED_LABEL = (v) => (v <= 0.85 ? '천천히' : v >= 1.12 ? '빠르게' : '보통')

export default function ChildHome() {
  const navigate = useNavigate()
  const nickname = useStore((s) => s.nickname)
  const sessions = useStore((s) => s.sessions)
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)
  const cast = useCast()

  const [settingsOpen, setSettingsOpen] = useState(false)
  const [report, setReport] = useState(() => getVoiceReport())
  const previewRef = useRef(null)

  const last = sessions[0]
  const doneIds = new Set(sessions.map((s) => s.missionId))
  const speechOk = isSpeechSupported()
  const tier = VOICE_TIER_LABEL[report.tier]

  useEffect(() => {
    primeVoices().then(() => setReport(getVoiceReport()))
    return () => {
      previewRef.current?.cancel()
      stopAll()
    }
  }, [])

  /** 미션 시작 — 이 탭이 모바일 오디오를 여는 "사용자 제스처"가 된다 */
  const startMission = (id) => {
    unlockAudio()
    navigate(`/child/talk/${id}`)
  }

  const testVoice = () => {
    unlockAudio()
    previewRef.current?.cancel()
    previewRef.current = previewVoice(cast.primary, {
      speed: settings.voiceSpeed,
      roster: cast.list,
    })
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-cream no-scrollbar">
      {/* 인사 헤더 */}
      <div className="relative overflow-hidden px-5 pb-5 pt-[max(1.5rem,calc(env(safe-area-inset-top)+1rem))]">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-sun/25 blur-2xl" />
        <div className="relative flex items-center gap-3">
          <Avatar src={userAvatarUrl(nickname)} name={nickname} size={52} />
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold text-ink-soft">안녕, 반가워!</p>
            <p className="truncate text-[20px] font-black leading-tight text-ink">
              {nickname}
            </p>
          </div>
          <button
            onClick={() => setSettingsOpen(true)}
            aria-label="설정"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink-soft shadow-sm active:bg-paper"
          >
            <Icon name="settings" className="h-[18px] w-[18px]" />
          </button>
        </div>

        {/* 오늘의 친구들 — 누르면 친구를 바꿀 수 있다 */}
        <button
          onClick={() => navigate('/child/friends')}
          className="relative mt-4 flex w-full items-center gap-2 rounded-2xl bg-white/80 px-3 py-2.5 text-left ring-1 ring-black/5 active:bg-white"
        >
          <div className="flex -space-x-2">
            {cast.list.map((c) => (
              <Avatar
                key={c.id}
                src={c.avatarUrl}
                name={c.name}
                size={32}
                className="ring-2 ring-white"
              />
            ))}
          </div>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[12.5px] font-semibold text-ink">
              {cast.primary.name}이랑 {cast.partner.name}이가 기다리고 있어요
            </span>
            <span className="block text-[11px] text-ink-soft">눌러서 친구 바꾸기</span>
          </span>
          <span className="flex h-2 w-2 shrink-0 rounded-full bg-mint" />
        </button>
      </div>

      {/* 브라우저 미지원 안내 */}
      {!speechOk && (
        <div className="mx-4 mb-3 rounded-2xl bg-sun-soft p-3.5 text-[12.5px] leading-relaxed text-sun-deep ring-1 ring-sun/30">
          <b className="font-bold">이 브라우저는 음성 인식을 지원하지 않아요.</b>
          <br />
          크롬(Chrome)이나 엣지(Edge)에서 열면 마이크로 이야기할 수 있어요. 지금은
          "글자로 말하기"로도 대화할 수 있습니다.
        </div>
      )}

      {/* 이어하기 */}
      {last && (
        <div className="px-4 pb-1">
          <button
            onClick={() => startMission(last.missionId)}
            className="flex w-full items-center gap-3 rounded-3xl bg-gradient-to-r from-brand to-brand-deep p-4 text-left text-white shadow-lg shadow-brand/25 active:scale-[0.99]"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-xl">
              ▶️
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-bold text-white/80">
                최근 대화 이어하기
              </span>
              <span className="block truncate text-[16px] font-extrabold">
                {last.missionTitle}
              </span>
            </span>
            <Icon name="play" fill="currentColor" className="h-4 w-4 opacity-70" />
          </button>
        </div>
      )}

      {/* 미션 목록 */}
      <div className="px-4 py-4">
        <SectionTitle
          action={
            <span className="text-[11.5px] font-semibold text-ink-faint">
              {doneIds.size}/{MISSIONS.length} 완료
            </span>
          }
        >
          오늘의 대화 미션
        </SectionTitle>

        <div className="space-y-2.5">
          {MISSIONS.map((m, i) => {
            const style = ACCENT_STYLES[m.accent]
            const done = doneIds.has(m.id)
            return (
              <button
                key={m.id}
                onClick={() => startMission(m.id)}
                style={{ animationDelay: `${i * 45}ms` }}
                className="anim-slide-up flex w-full items-center gap-3.5 rounded-3xl bg-white p-3.5 text-left shadow-sm ring-1 ring-black/5 transition-transform active:scale-[0.98]"
              >
                <span
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-[26px] ${style.bg}`}
                >
                  {m.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-[16px] font-extrabold text-ink">
                      {m.title}
                    </span>
                    {done && (
                      <span className="shrink-0 rounded-full bg-mint-soft px-1.5 py-0.5 text-[10px] font-bold text-mint-deep">
                        완료
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block truncate text-[12.5px] text-ink-soft">
                    {m.desc}
                  </span>
                  <span className="mt-1.5 flex gap-1">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${style.bg} ${style.fg}`}>
                      {m.level}
                    </span>
                    <span className="rounded-full bg-paper px-2 py-0.5 text-[10px] font-bold text-ink-soft">
                      약 {m.minutes}분
                    </span>
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <Sheet open={settingsOpen} onClose={() => setSettingsOpen(false)} title="설정">
        <div className="divide-y divide-black/5">
          <Toggle
            checked={settings.voice}
            onChange={(v) => updateSettings({ voice: v })}
            label="친구 목소리 듣기"
            desc={`${cast.primary.name}이와 ${cast.partner.name}이가 소리 내어 말해요`}
          />

          {/* 말하기 속도 */}
          <div className="py-3">
            <div className="flex items-baseline justify-between">
              <span className="text-[14px] font-semibold text-ink">말하기 속도</span>
              <span className="text-[12px] font-bold text-ink-soft">
                {SPEED_LABEL(settings.voiceSpeed)} · {settings.voiceSpeed.toFixed(2)}배
              </span>
            </div>
            <input
              type="range"
              min="0.75"
              max="1.2"
              step="0.05"
              value={settings.voiceSpeed}
              disabled={!settings.voice}
              onChange={(e) => updateSettings({ voiceSpeed: Number(e.target.value) })}
              className="mt-2.5 w-full accent-brand disabled:opacity-40"
            />
            <div className="mt-1 flex justify-between text-[11px] text-ink-faint">
              <span>🐢 천천히</span>
              <span>🐇 빠르게</span>
            </div>
            <button
              onClick={testVoice}
              disabled={!settings.voice}
              className="mt-2.5 flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-paper text-[13px] font-bold text-ink active:bg-black/5 disabled:opacity-40"
            >
              <Icon name="volume" className="h-4 w-4" />
              지금 목소리 들어보기
            </button>
          </div>

          <Toggle
            checked={settings.subtitles}
            onChange={(v) => updateSettings({ subtitles: v })}
            label="실시간 자막 보기"
            desc="내가 한 말과 친구가 한 말을 글자로 보여 줘요"
          />
          <Toggle
            checked={settings.autoWordCard}
            onChange={(v) => updateSettings({ autoWordCard: v })}
            label="어려운 말 설명 카드"
            desc="모르는 말이 나오면 쉬운 뜻을 살짝 알려 줘요"
          />
        </div>

        {/* 목소리 품질 안내 */}
        <div className="mt-4 rounded-2xl bg-paper p-3.5 text-[11.5px] leading-relaxed text-ink-soft">
          <b className="text-ink">
            {tier.emoji} {tier.text}
          </b>
          <br />
          {tier.desc}
          {report.best && (
            <>
              <br />
              <span className="text-ink-faint">지금 쓰는 음성: {report.best.name}</span>
            </>
          )}
        </div>
      </Sheet>
    </div>
  )
}
