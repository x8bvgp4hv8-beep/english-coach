/**
 * «Собери, что слышишь»: фраза звучит, внизу слова, из которых её надо собрать.
 *
 * Зачем именно этот формат. В Duolingo это основное упражнение на слух, и не случайно:
 * оно стоит ровно между «выбери вариант» (узнал строку целиком) и «запиши, что услышал»
 * (услышал, понял и написал без описок). Слова даны — значит не надо ни печатать, ни
 * помнить написание; но порядок надо услышать, а не угадать.
 *
 * Всё нужное уже лежит в приложении: озвучены 37 248 фраз, а банк слов (`WordOrderTray`)
 * работает в упражнениях `word_order` с самого начала. Формат — это их сложение, а не
 * новый контент.
 *
 * Приманки обязательны. Без лишних слов банк собирается единственным способом даже с
 * закрытыми ушами: просто расставь всё, что дали. Лишние слова берутся из других фраз
 * того же уровня — из воздуха брать нечего, да и не нужно.
 */
import { ListeningEngine, listeningPhrase } from './listening'
import { prioritise } from './practice'
import { DEFAULT_LANGUAGE } from './language'
import type { LanguageCode } from './language'
import type { CEFRLevel, CoursePack, Exercise, UserState } from './types'

export const ASSEMBLY_LESSON_ID = 'assembly'

/** Сколько лишних слов кладётся в банк. Два-три: меньше — не мешает, больше — каша. */
export const ASSEMBLY_DECOYS = 3
/** Короче трёх слов собирать нечего, длиннее девяти — банк не влезает в экран. */
const MIN_WORDS = 3
const MAX_WORDS = 9
const DEFAULT_SIZE = 6

export interface AssemblyQuestion {
  exerciseID: string
  /** Фраза, которая звучит. На экране её нет — её и надо собрать. */
  text: string
  /** Слова фразы плюс приманки, в перемешанном порядке. */
  bank: string[]
  /** Перевод — показывается после ответа. */
  gloss?: string
}

export interface AssemblyOptions {
  courses: CoursePack[]
  level: CEFRLevel
  language?: LanguageCode
  state: UserState
  size?: number
  now?: Date
  random?: () => number
}

/** Слова фразы без знаков препинания: собирать их человек будет по одному. */
export function assemblyWords(text: string): string[] {
  return text
    .replace(/[¿¡]/g, '')
    .split(/\s+/)
    .map((word) => word.replace(/[.,!?;:"]+$/g, '').replace(/^["']+/, ''))
    .filter(Boolean)
}

/** Сошёлся ли собранный порядок с фразой. Сравнение по словам, знаки не считаются. */
export function assemblyIsCorrect(picked: string[], text: string): boolean {
  const expected = assemblyWords(text).map((word) => word.toLowerCase())
  if (picked.length !== expected.length) return false
  return picked.every((word, index) => word.toLowerCase() === expected[index])
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/**
 * Вопросы из заданных фраз: слова фразы плюс приманки из соседних.
 *
 * Приманка не должна повторять слово фразы — иначе собранный порядок окажется верным с
 * двумя разными наборами, и приложение назовёт ошибкой то, что ошибкой не является.
 */
export function assemblyQuestions(
  sources: Exercise[],
  language: LanguageCode = DEFAULT_LANGUAGE,
  random: () => number = Math.random,
  limit = DEFAULT_SIZE,
): AssemblyQuestion[] {
  const phrases: Array<{ exercise: Exercise; text: string; gloss?: string }> = []
  for (const exercise of sources) {
    const item = listeningPhrase(exercise, language)
    if (!item) continue
    const words = assemblyWords(item.text)
    if (words.length < MIN_WORDS || words.length > MAX_WORDS) continue
    phrases.push({ exercise, text: item.text, gloss: item.gloss })
  }
  if (phrases.length === 0) return []

  // Словарь приманок — из всех фраз набора: чужое слово той же темы звучит правдоподобно.
  const allWords = new Set<string>()
  for (const phrase of phrases) for (const word of assemblyWords(phrase.text)) allWords.add(word)

  const questions: AssemblyQuestion[] = []
  const used = new Set<string>()
  for (const phrase of phrases) {
    if (used.has(phrase.text)) continue
    const words = assemblyWords(phrase.text)
    const own = new Set(words.map((word) => word.toLowerCase()))
    const decoys = shuffle([...allWords].filter((word) => !own.has(word.toLowerCase())), random)
      .slice(0, ASSEMBLY_DECOYS)

    questions.push({
      exerciseID: phrase.exercise.id,
      text: phrase.text,
      bank: shuffle([...words, ...decoys], random),
      gloss: phrase.gloss,
    })
    used.add(phrase.text)
    if (questions.length >= limit) break
  }
  return questions
}

export const AssemblyEngine = {
  /** Фразы, которые можно собрать: те же, что в аудировании, но не длиннее девяти слов. */
  pool(courses: CoursePack[], level: CEFRLevel, language: LanguageCode = DEFAULT_LANGUAGE): Exercise[] {
    return ListeningEngine.pool(courses, level, language).filter((exercise) => {
      const item = listeningPhrase(exercise, language)
      if (!item) return false
      const words = assemblyWords(item.text).length
      return words >= MIN_WORDS && words <= MAX_WORDS
    })
  },

  count(courses: CoursePack[], level: CEFRLevel, language: LanguageCode = DEFAULT_LANGUAGE): number {
    return this.pool(courses, level, language).length
  },

  build({ courses, level, language = DEFAULT_LANGUAGE, state, size = DEFAULT_SIZE, now = new Date(), random = Math.random }: AssemblyOptions): AssemblyQuestion[] {
    const pool = this.pool(courses, level, language)
    if (pool.length === 0) return []
    return assemblyQuestions(prioritise(pool, state, now, random), language, random, size)
  },
}
