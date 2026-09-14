/**
 * «Что ты слышишь» — фраза звучит, на экране четыре варианта.
 *
 * Между «Вслух за диктором» (слушай и повтори) и «Аудированием» (слушай и запиши) была
 * пропасть: первое не требует понимания вовсе, второе требует сразу всего — расслышать,
 * понять и написать без ошибок. Человек, который не справляется с аудированием, просто
 * перестаёт его открывать, и слух остаётся нетренированным.
 *
 * Этот формат — ступенька между ними: понимать на слух надо, писать не надо. Это ровно
 * тот шаг лестницы, который в остальных режимах называется «узнавание».
 *
 * Материал уже есть целиком: фразы отобраны тем же правилом, что в аудировании
 * (`listening.ts`), и озвучены заранее — 37 248 записей на два голоса. Никакого нового
 * контента формату не нужно.
 */
import { ListeningEngine, listeningPhrase } from './listening'
import { prioritise } from './practice'
import { DEFAULT_LANGUAGE } from './language'
import type { LanguageCode } from './language'
import type { CEFRLevel, CoursePack, Exercise, UserState } from './types'

export const HEARING_LESSON_ID = 'hearing'

/** Вариантов на экране. Четыре — предел, при котором все читаются без прокрутки. */
export const HEARING_OPTIONS = 4
const DEFAULT_SIZE = 8

export interface HearingQuestion {
  exerciseID: string
  /** Фраза, которая звучит. На экране её нет до ответа. */
  text: string
  /** Четыре варианта в перемешанном порядке, среди них `text`. */
  options: string[]
  /** Перевод — показывается после ответа, как смысл услышанного. */
  gloss?: string
}

export interface HearingOptions {
  courses: CoursePack[]
  level: CEFRLevel
  language?: LanguageCode
  state: UserState
  size?: number
  now?: Date
  random?: () => number
}

const words = (text: string): string[] =>
  text.toLowerCase().replace(/[.,!?¿¡;:"'…]/g, '').split(/\s+/).filter(Boolean)

/**
 * Насколько вариант близок к ответу: чем ближе, тем труднее на слух.
 *
 * Случайные три фразы уровня превратили бы задание в угадайку по длине: «Hello!» против
 * «I have been waiting for you since the morning» различает даже тот, кто не слышал ни
 * слова. Поэтому в приманки идут фразы, похожие по длине и с общими словами, — тогда
 * выбор действительно решается слухом.
 */
function closeness(answer: string, candidate: string): number {
  const a = words(answer)
  const b = words(candidate)
  const shared = b.filter((word) => a.includes(word)).length
  const lengthPenalty = Math.abs(a.length - b.length)
  return shared * 2 - lengthPenalty
}

export const HearingEngine = {
  /** Фразы, которые можно дать на слух. Тот же отбор, что в аудировании. */
  pool(courses: CoursePack[], level: CEFRLevel, language: LanguageCode = DEFAULT_LANGUAGE): Exercise[] {
    return ListeningEngine.pool(courses, level, language)
  },

  count(courses: CoursePack[], level: CEFRLevel, language: LanguageCode = DEFAULT_LANGUAGE): number {
    const pool = this.pool(courses, level, language)
    // Меньше четырёх фраз — нечем набрать варианты, и режим честнее считать пустым.
    return pool.length >= HEARING_OPTIONS ? pool.length : 0
  },

  build({ courses, level, language = DEFAULT_LANGUAGE, state, size = DEFAULT_SIZE, now = new Date(), random = Math.random }: HearingOptions): HearingQuestion[] {
    const pool = this.pool(courses, level, language)
    if (pool.length < HEARING_OPTIONS) return []

    // Множество, а не список: одна и та же фраза встречается в курсе под разными
    // упражнениями, и без этого в варианты попадали две одинаковые строки — задание
    // выглядело сломанным ещё до того, как его слышали.
    const texts = new Set<string>()
    for (const exercise of pool) {
      const item = listeningPhrase(exercise, language)
      if (item) texts.add(item.text)
    }

    const questions: HearingQuestion[] = []
    const used = new Set<string>()
    for (const exercise of prioritise(pool, state, now, random)) {
      const item = listeningPhrase(exercise, language)
      if (!item || used.has(item.text)) continue

      const distractors = [...texts]
        .filter((text) => text !== item.text)
        .sort((a, b) => closeness(item.text, b) - closeness(item.text, a))
        // Из десятка самых похожих берутся три случайных: иначе одна и та же фраза
        // приманивала бы в каждом наборе, и набор запоминался бы целиком.
        .slice(0, 10)
        .sort(() => random() - 0.5)
        .slice(0, HEARING_OPTIONS - 1)
      if (distractors.length < HEARING_OPTIONS - 1) continue

      const options = [item.text, ...distractors].sort(() => random() - 0.5)
      questions.push({ exerciseID: exercise.id, text: item.text, options, gloss: item.gloss })
      used.add(item.text)
      if (questions.length >= size) break
    }
    return questions
  },
}
