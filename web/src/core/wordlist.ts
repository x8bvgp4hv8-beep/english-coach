import { ContentError } from './types'
import type { CoursePack, UserState } from './types'

/**
 * Список 3000 частых слов — отдельная группа изучения со своим счётом.
 *
 * Просьба Кристиана от 13.09.2026: «внести эти 3000 слов и одновременно отслеживать,
 * сколько из них уже знаешь». Ссылка, которую он дал (scribd, документ канала Volka
 * English), текст не отдаёт — страницы там картинками за пейволом, — поэтому состав
 * взят из открытого Oxford 3000, а порядок — из частотности корпуса субтитров.
 *
 * Порядок именно по речи, а не по вебу: на частотности Google Web в первую сотню
 * попадали `dvd`, `cd`, `click`, `index` и `website` — веб-лексика, бесполезная для
 * человека, который учит язык, чтобы говорить. По субтитрам первые слова — you, i,
 * the, to, a, it; `email` уезжает на 2513-е место, и это правдоподобно.
 *
 * Ключевое отличие от курса: здесь нет упражнений, здесь есть только «знаю / не знаю».
 * Список — не урок, а карта охвата, и нужен он ровно для одного вопроса: сколько из
 * частотного ядра уже закрыто.
 */

export interface WordlistItem {
  /** Слово. */
  w: string
  /** Часть речи, сокращённо: «сущ.», «глаг.», «прил.». */
  p: string
  /** Перевод: одно основное значение, у многозначных — два-три через точку с запятой. */
  t: string
  /** Место в частотном списке, от 1. Он же порядок изучения. */
  r: number
}

export interface WordlistPack {
  schemaVersion: number
  language: string
  title: string
  /** Откуда список: состав и порядок берутся из разных источников, и это надо помнить. */
  source: string
  items: WordlistItem[]
}

/**
 * Что человек сделал со словом.
 *
 * `known` — сказал «знаю» при просеивании либо довёл до конца в изучении.
 * `streak` — сколько раз подряд вспомнил слово в режиме изучения; на `STREAK_TO_KNOW`
 * слово переезжает в `known`.
 */
export interface WordlistProgress {
  known: string[]
  streak: Record<string, number>
}

/** Сколько раз подряд надо вспомнить слово, чтобы оно считалось выученным. */
export const STREAK_TO_KNOW = 3

/**
 * Какой интервал повторения в курсе считается подтверждением слова.
 *
 * Нужно потому, что одной самооценки мало: «знаю» на просеивании — это заявление, а
 * не факт. Если слово встречалось в упражнении и это упражнение ушло на неделю вперёд
 * по интервальному повторению, значит человек его действительно вспомнил, и не раз.
 */
const CONFIRMED_INTERVAL_DAYS = 7

export function decodeWordlist(raw: unknown): WordlistPack {
  const pack = raw as WordlistPack
  if (pack?.schemaVersion !== 1) throw new ContentError('unsupportedSchema', String(pack?.schemaVersion))
  if (!pack.items?.length) throw new ContentError('emptyCourse')

  const seen = new Set<string>()
  let expected = 1
  for (const item of pack.items) {
    if (!item.w || !item.t || !item.p) throw new ContentError('invalidExercise', item.w ?? '(без слова)')
    if (seen.has(item.w)) throw new ContentError('duplicateID', item.w)
    seen.add(item.w)
    // Ранг — это порядок изучения, и дырка в нём означала бы, что «первая тысяча»
    // считается по неполному списку.
    if (item.r !== expected) throw new ContentError('invalidExercise', `${item.w}: ранг ${item.r}, ожидался ${expected}`)
    expected += 1
  }
  return pack
}

const EMPTY: WordlistProgress = { known: [], streak: {} }

/** Слова из английской части упражнения — по ним слово связывается с курсом. */
function wordsOf(text: string | undefined): string[] {
  return (text ?? '').toLowerCase().match(/[a-z']+/g) ?? []
}

export const WordlistEngine = {
  progress(state: UserState): WordlistProgress {
    return state.wordlist ?? EMPTY
  },

  /**
   * Слова, подтверждённые курсом: встречались в упражнении, которое ушло по интервалу
   * не меньше недели вперёд. Это та половина счёта, которая не зависит от самооценки.
   */
  confirmedByCourse(courses: CoursePack[], state: UserState): Set<string> {
    const solid = new Set(
      state.reviews
        .filter((item) => item.intervalDays >= CONFIRMED_INTERVAL_DAYS)
        .map((item) => item.exerciseID),
    )
    if (solid.size === 0) return new Set()

    const words = new Set<string>()
    for (const course of courses) {
      for (const chapter of course.chapters) {
        for (const lesson of chapter.lessons) {
          for (const exercise of lesson.exercises) {
            if (!solid.has(exercise.id)) continue
            for (const text of [exercise.prompt, exercise.canonicalAnswer, exercise.example, exercise.correctOption]) {
              for (const word of wordsOf(text)) words.add(word)
            }
          }
        }
      }
    }
    return words
  },

  /** Известно ли слово: сказал сам, довёл в изучении или подтвердил курсом. */
  isKnown(word: string, state: UserState, confirmed?: Set<string>): boolean {
    const progress = this.progress(state)
    if (progress.known.includes(word)) return true
    if ((progress.streak[word] ?? 0) >= STREAK_TO_KNOW) return true
    return confirmed ? confirmed.has(word) : false
  },

  /** Сколько слов списка закрыто и сколько всего. */
  count(pack: WordlistPack, state: UserState, confirmed?: Set<string>): { known: number; total: number } {
    const progress = this.progress(state)
    const manual = new Set(progress.known)
    let known = 0
    for (const item of pack.items) {
      if (manual.has(item.w) || (progress.streak[item.w] ?? 0) >= STREAK_TO_KNOW || confirmed?.has(item.w)) known += 1
    }
    return { known, total: pack.items.length }
  },

  /**
   * Разбивка по тысячам. Кристиан спрашивал «сколько из этих 3000 уже знаешь», и на
   * трёх тысячах общая цифра почти не двигается — а «первая тысяча закрыта» видно.
   */
  thousands(pack: WordlistPack, state: UserState, confirmed?: Set<string>): Array<{ from: number; to: number; known: number; total: number }> {
    const progress = this.progress(state)
    const manual = new Set(progress.known)
    const chunks: Array<{ from: number; to: number; known: number; total: number }> = []
    for (let start = 0; start < pack.items.length; start += 1000) {
      const slice = pack.items.slice(start, start + 1000)
      const known = slice.filter((item) =>
        manual.has(item.w) || (progress.streak[item.w] ?? 0) >= STREAK_TO_KNOW || confirmed?.has(item.w),
      ).length
      chunks.push({ from: start + 1, to: start + slice.length, known, total: slice.length })
    }
    return chunks
  },

  /**
   * Пачка для просеивания: слова, про которые человек ещё ничего не сказал, по частоте.
   *
   * Просеивание существует потому, что прощёлкивать 3000 карточек, половину из которых
   * человек знает, никто не станет. Сначала он быстро отделяет знакомое, и учить
   * остаётся только остальное.
   */
  toSieve(pack: WordlistPack, state: UserState, size = 30, confirmed?: Set<string>): WordlistItem[] {
    const progress = this.progress(state)
    const manual = new Set(progress.known)
    return pack.items
      .filter((item) =>
        !manual.has(item.w) && progress.streak[item.w] === undefined && !confirmed?.has(item.w))
      .slice(0, size)
  },

  /** Сколько слов ещё не просеяно — по этому числу экран решает, что предлагать. */
  unsortedCount(pack: WordlistPack, state: UserState, confirmed?: Set<string>): number {
    const progress = this.progress(state)
    const manual = new Set(progress.known)
    return pack.items.filter((item) =>
      !manual.has(item.w) && progress.streak[item.w] === undefined && !confirmed?.has(item.w)).length
  },

  /**
   * Пачка для изучения: то, что человек отметил как незнакомое, по частоте.
   * Слово с большей серией идёт позже — сначала то, что помнится хуже.
   */
  toStudy(pack: WordlistPack, state: UserState, size = 12): WordlistItem[] {
    const progress = this.progress(state)
    return pack.items
      .filter((item) => {
        const streak = progress.streak[item.w]
        return streak !== undefined && streak < STREAK_TO_KNOW && !progress.known.includes(item.w)
      })
      .sort((a, b) => (progress.streak[a.w] ?? 0) - (progress.streak[b.w] ?? 0) || a.r - b.r)
      .slice(0, size)
  },

  learningCount(pack: WordlistPack, state: UserState): number {
    return this.toStudy(pack, state, pack.items.length).length
  },

  /** «Знаю» на просеивании: слово закрыто сразу, без изучения. */
  markKnown(word: string, state: UserState): WordlistProgress {
    const progress = this.progress(state)
    if (progress.known.includes(word)) return progress
    const streak = { ...progress.streak }
    delete streak[word]
    return { known: [...progress.known, word], streak }
  },

  /** «Не знаю»: слово попадает в изучение с нулевой серией. */
  markUnknown(word: string, state: UserState): WordlistProgress {
    const progress = this.progress(state)
    return {
      known: progress.known.filter((item) => item !== word),
      streak: { ...progress.streak, [word]: 0 },
    }
  },

  /**
   * Ответ в изучении. Вспомнил — серия растёт и на третий раз слово уходит в известные;
   * не вспомнил — серия обнуляется, слово вернётся.
   */
  recordRecall(word: string, recalled: boolean, state: UserState): WordlistProgress {
    const progress = this.progress(state)
    const current = progress.streak[word] ?? 0
    if (!recalled) return { ...progress, streak: { ...progress.streak, [word]: 0 } }
    const next = current + 1
    if (next >= STREAK_TO_KNOW) {
      const streak = { ...progress.streak }
      delete streak[word]
      return { known: [...progress.known, word], streak }
    }
    return { ...progress, streak: { ...progress.streak, [word]: next } }
  },
}
