/**
 * Картинки к словам и формат «Выбери картинку».
 *
 * Зачем вообще картинка. Слово, выученное через русский перевод, всегда идёт через
 * русский: «apple → яблоко → 🍎». Картинка убирает середину, и слово встаёт прямо на
 * предмет — так учатся дети и так устроены все курсы, которые работают без учителя.
 * Кристиан 14.09.2026: «много заданий с визуалами, с карточками».
 *
 * Набор — OpenMoji (CC BY-SA 4.0), 222 файла на 248 слов, лежат в сборке и работают
 * офлайн. Карта строится скриптом `build-pictures.mjs`, и правило там жёсткое: неверная
 * картинка хуже отсутствующей, потому что учит не тому слову и человек этого не замечает.
 * Отсюда и охват: 248 слов из 1484 существительных списка, остальным картинки нет.
 */
import { prioritise } from './practice'
import { VocabularyEngine } from './vocabulary'
import type { LanguageCode } from './language'
import type { CEFRLevel, CoursePack, Exercise, UserState } from './types'

export const PICTURE_LESSON_ID = 'pictures'

/** Картинок на экране. Четыре — сетка два на два, каждая крупная. */
export const PICTURE_OPTIONS = 4
const DEFAULT_SIZE = 10

export interface PicturePack {
  language: LanguageCode
  /** Слово в нижнем регистре → код картинки. */
  byWord: Map<string, string>
}

export interface PictureQuestion {
  exerciseID: string
  /** Слово, которое надо узнать. */
  word: string
  /** Перевод — показывается после ответа. */
  translation?: string
  /** Верный код картинки. */
  hex: string
  /** Четыре кода в перемешанном порядке, среди них верный. */
  options: string[]
}

export interface PictureOptions {
  courses: CoursePack[]
  level: CEFRLevel
  language: LanguageCode
  pictures: PicturePack | null
  state: UserState
  size?: number
  now?: Date
  random?: () => number
}

/** Разбор карты. Пустой файл — не ошибка: у языка может не быть картинок вовсе. */
export function decodePictures(raw: unknown, language: LanguageCode): PicturePack {
  const pack = raw as { items?: Array<{ w?: string; hex?: string }> }
  const byWord = new Map<string, string>()
  for (const item of pack?.items ?? []) {
    const word = (item.w ?? '').trim().toLowerCase()
    const hex = (item.hex ?? '').trim()
    if (word && hex) byWord.set(word, hex)
  }
  return { language, byWord }
}

/** Путь к файлу картинки. Относительный: приложение живёт в подпапке на Pages. */
export const pictureURL = (hex: string): string => `pictures/${hex}.svg`

/**
 * Картинка для слова, если она есть.
 *
 * Артикль и притяжательное в начале снимаются: на карточках курса слово почти всегда
 * стоит с ними («a doctor», «the bag», «my sister»), а картинка у «doctor» и «a doctor»
 * одна. Без этого правило находило 46 слов на A1 вместо 172 — и формат оказывался
 * пустым на всех уровнях сразу.
 *
 * Всё, что осталось многословным, картинкой не показать: «a hard day» нарисовать нельзя.
 */
export function pictureFor(text: string, pictures: PicturePack | null): string | null {
  if (!pictures) return null
  const word = text
    .trim()
    .toLowerCase()
    .replace(/^(a|an|the|my|your|his|her|our|their)\s+/, '')
    .replace(/[.!?,]+$/, '')
  if (/\s/.test(word)) return null
  return pictures.byWord.get(word) ?? null
}

export const PictureEngine = {
  /** Слова уровня, у которых есть картинка. */
  pool(courses: CoursePack[], level: CEFRLevel, language: LanguageCode, pictures: PicturePack | null): Exercise[] {
    if (!pictures || pictures.byWord.size === 0) return []
    return VocabularyEngine
      .pool(courses, level, language)
      .filter((exercise) => pictureFor(exercise.prompt ?? '', pictures) !== null)
  },

  count(courses: CoursePack[], level: CEFRLevel, language: LanguageCode, pictures: PicturePack | null): number {
    const pool = this.pool(courses, level, language, pictures)
    // Меньше четырёх картинок — нечем набрать варианты, и режим честнее считать пустым.
    return pool.length >= PICTURE_OPTIONS ? pool.length : 0
  },

  build({ courses, level, language, pictures, state, size = DEFAULT_SIZE, now = new Date(), random = Math.random }: PictureOptions): PictureQuestion[] {
    const pool = this.pool(courses, level, language, pictures)
    if (pool.length < PICTURE_OPTIONS) return []

    // Коды, а не слова: у «day» и «sun» картинка одна и та же, и без этого в вопросе
    // оказались бы две одинаковые картинки — выбрать верную стало бы невозможно.
    const codes = new Set<string>()
    for (const exercise of pool) {
      const hex = pictureFor(exercise.prompt ?? '', pictures)
      if (hex) codes.add(hex)
    }
    if (codes.size < PICTURE_OPTIONS) return []

    const questions: PictureQuestion[] = []
    const used = new Set<string>()
    for (const exercise of prioritise(pool, state, now, random)) {
      const word = (exercise.prompt ?? '').trim()
      const hex = pictureFor(word, pictures)
      if (!hex || used.has(hex)) continue

      const others = [...codes]
        .filter((code) => code !== hex)
        .sort(() => random() - 0.5)
        .slice(0, PICTURE_OPTIONS - 1)
      if (others.length < PICTURE_OPTIONS - 1) continue

      questions.push({
        exerciseID: exercise.id,
        word,
        translation: exercise.translation,
        hex,
        options: [hex, ...others].sort(() => random() - 0.5),
      })
      used.add(hex)
      if (questions.length >= size) break
    }
    return questions
  },
}
