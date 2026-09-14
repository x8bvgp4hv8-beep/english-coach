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
    .replace(/^(a|an|the|my|your|his|her|our|their|el|la|los|las|un|una|unos|unas)\s+/, '')
    .replace(/[.!?,]+$/, '')
  // Многословный ключ разрешён: в испанском «correo electrónico» — один предмет, а не
  // группа. Ничего лишнего это не пускает — в карте есть только размеченное.
  return pictures.byWord.get(word) ?? null
}

/**
 * Вопросы по заданным карточкам: приманки берутся из всей карты, а не из набора.
 *
 * Так устроен и Duolingo, и иначе формат почти не показывается: в уроке пять карточек,
 * картинка есть у одной-двух, и требование «четыре разные картинки в одном уроке»
 * пропускало 2 урока из 508. Слово для вопроса — из набора, картинки-приманки — откуда
 * угодно, лишь бы не совпадали с верной.
 */
export function pictureQuestions(
  sources: Exercise[],
  pictures: PicturePack | null,
  random: () => number = Math.random,
  limit = 4,
): PictureQuestion[] {
  if (!pictures || pictures.byWord.size < PICTURE_OPTIONS) return []
  const all = [...new Set(pictures.byWord.values())]

  const questions: PictureQuestion[] = []
  const used = new Set<string>()
  for (const exercise of sources) {
    const word = (exercise.prompt ?? '').trim()
    const hex = pictureFor(word, pictures)
    if (!hex || used.has(hex)) continue
    const others = all
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
    if (questions.length >= limit) break
  }
  return questions
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
    // Порядок — общий для всей практики (сначала то, что пора повторить), сборка вопроса
    // — общая с шагом внутри урока.
    return pictureQuestions(prioritise(pool, state, now, random), pictures, random, size)
  },
}
