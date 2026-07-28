/**
 * 부모 화면 "모국어로 요약 보기" mock
 *
 * 실제로는 지표 데이터를 Claude API에 넘겨 해당 언어로 요약시킨다.
 * 여기서는 언어별 문장 템플릿에 아이의 실제 지표를 끼워 넣어 만든다.
 * → 자녀를 바꾸면 숫자와 문장이 함께 바뀐다.
 */

export const PARENT_LANGS = [
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'tl', label: 'Tagalog', flag: '🇵🇭' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
]

export function getLang(code) {
  return PARENT_LANGS.find((l) => l.code === code) ?? PARENT_LANGS[0]
}

const TEMPLATES = {
  ko: {
    summaryTitle: '이번 주 아이 요약',
    utterance: '이번 주 발화',
    newWord: '새로 배운 말',
    pron: '발음 점수',
    tip: '집에서 도와주기',
    body: (c, s) =>
      `${c.koSubject} 이번 주에 ${s.utterances}번 말했어요. 지난주보다 ${s.deltaPct}% 늘었습니다. ` +
      `새로운 말 ${s.newWordCount}개를 배웠고, 발음 점수는 ${s.pron}점으로 ${s.pronDelta}점 올랐어요. ` +
      `다만 ${s.quietDaysKo}에는 대화가 평소보다 적었습니다. 학교에서 무슨 일이 있었는지 물어봐 주세요.`,
    tipBody: (c, s) =>
      `"${s.focusKo}" 표현을 아이가 어려워해요. 집에서 "${s.focusEx}"처럼 함께 말해 보세요.`,
  },

  vi: {
    summaryTitle: 'Tóm tắt tuần này của con',
    utterance: 'Số lần nói',
    newWord: 'Từ mới đã học',
    pron: 'Điểm phát âm',
    tip: 'Giúp con ở nhà',
    body: (c, s) =>
      `Tuần này ${c.latinName} đã nói ${s.utterances} lần, tăng ${s.deltaPct}% so với tuần trước. ` +
      `Con đã học được ${s.newWordCount} từ mới và điểm phát âm đạt ${s.pron}, tăng ${s.pronDelta} điểm. ` +
      `Tuy nhiên vào ${s.quietDaysEn} con nói ít hơn bình thường. Hãy hỏi xem ở trường có chuyện gì không.`,
    tipBody: (c, s) =>
      `Con còn khó với mẫu câu "${s.focusKo}". Hãy cùng con luyện nói ở nhà, ví dụ "${s.focusEx}".`,
  },

  zh: {
    summaryTitle: '本周孩子总结',
    utterance: '本周发言',
    newWord: '新学词语',
    pron: '发音得分',
    tip: '在家如何帮助',
    body: (c, s) =>
      `本周${c.latinName}共发言${s.utterances}次，比上周增加${s.deltaPct}%。` +
      `学会了${s.newWordCount}个新词，发音得分为${s.pron}分，提高了${s.pronDelta}分。` +
      `但${s.quietDaysEn}的对话比平时少。请关心一下孩子在学校是否发生了什么事。`,
    tipBody: (c, s) => `孩子对"${s.focusKo}"这个句型还不熟悉。可以在家一起练习，例如"${s.focusEx}"。`,
  },

  tl: {
    summaryTitle: 'Buod ng linggong ito',
    utterance: 'Beses na nagsalita',
    newWord: 'Bagong salita',
    pron: 'Iskor sa pagbigkas',
    tip: 'Paano tumulong sa bahay',
    body: (c, s) =>
      `Nagsalita si ${c.latinName} ng ${s.utterances} beses ngayong linggo, ${s.deltaPct}% na mas mataas kaysa noong nakaraan. ` +
      `Natuto siya ng ${s.newWordCount} bagong salita at umabot sa ${s.pron} puntos ang pagbigkas (+${s.pronDelta}). ` +
      `Ngunit mas kaunti ang usapan tuwing ${s.quietDaysEn}.`,
    tipBody: (c, s) =>
      `Mahirap pa sa bata ang "${s.focusKo}". Subukang sanayin ito sa bahay, halimbawa "${s.focusEx}".`,
  },

  ru: {
    summaryTitle: 'Итоги недели',
    utterance: 'Высказываний',
    newWord: 'Новых слов',
    pron: 'Баллы за произношение',
    tip: 'Как помочь дома',
    body: (c, s) =>
      `На этой неделе ${c.latinName} говорил(а) ${s.utterances} раз — на ${s.deltaPct}% больше, чем на прошлой. ` +
      `Выучено ${s.newWordCount} новых слов, балл за произношение — ${s.pron} (+${s.pronDelta}). ` +
      `Однако в ${s.quietDaysEn} разговоров было заметно меньше. Спросите, что произошло в школе.`,
    tipBody: (c, s) =>
      `Ребёнку трудно даётся конструкция «${s.focusKo}». Потренируйтесь дома вместе: «${s.focusEx}».`,
  },
}

/**
 * 선택한 언어로 아이 요약 카드 문구를 만든다.
 * @param code  언어 코드
 * @param child CHILDREN 항목
 * @param stats getChildMetrics(id).stats
 */
export function buildSummary(code, child, stats) {
  const t = TEMPLATES[code] ?? TEMPLATES.ko
  return {
    summaryTitle: t.summaryTitle,
    utterance: t.utterance,
    newWord: t.newWord,
    pron: t.pron,
    tip: t.tip,
    body: t.body(child, stats),
    tipBody: t.tipBody(child, stats),
  }
}
