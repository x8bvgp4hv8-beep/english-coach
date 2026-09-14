/**
 * «Найди пару» — шесть слов и шесть переводов, соединить.
 *
 * Зачем формат, а не ещё один набор карточек. Слово в карточке проверяется одним
 * способом: показали — вспомнил или нет. Duolingo даёт те же слова пятью способами, и
 * разнообразие там не в контенте, а в форме вопроса. У нас та же дырка записана в
 * роадмапе отложенным пунктом: урок B1 — это один диалог и тринадцать упражнений про те
 * же четыре фразы. Формат закрывает её, не переписывая тридцать семь тысяч упражнений.
 *
 * Почему пары работают, а не просто развлекают: соединяя шесть пар, человек читает все
 * двенадцать строк и вынужден сравнивать близкие значения между собой. Это узнавание с
 * выбором из шести — шаг между «показали перевод» и «вспомни сам».
 *
 * Материал — те же лексические единицы, что в режиме слов (`vocabulary.ts`): обрывок
 * реплики в паре бессмыслен, потому что его не с чем соединять.
 */
import { prioritise } from './practice'
import { VocabularyEngine } from './vocabulary'
import type { LanguageCode } from './language'
import type { CEFRLevel, CoursePack, Exercise, UserState } from './types'

export const PAIRS_LESSON_ID = 'pairs'

/** Сколько пар в одном наборе: шесть держатся на экране телефона без прокрутки. */
export const PAIRS_IN_ROUND = 6
/** Сколько наборов подряд. Три — примерно две минуты, как остальные режимы. */
const DEFAULT_ROUNDS = 3

export interface PairItem {
  /** Упражнение, против которого пишется попытка: прогресс общий со всей практикой. */
  exerciseID: string
  /** Слово на изучаемом языке. */
  term: string
  /** Его перевод. */
  meaning: string
}

export interface PairsOptions {
  courses: CoursePack[]
  level: CEFRLevel
  language: LanguageCode
  state: UserState
  rounds?: number
  now?: Date
  random?: () => number
}

/** Перестановка Фишера — Йетса на переданном источнике случайности. */
function shuffled<T>(items: T[], random: () => number): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export const PairsEngine = {
  /** Единицы, из которых можно собрать пары. Тот же отбор, что в режиме слов. */
  pool(courses: CoursePack[], level: CEFRLevel, language: LanguageCode): Exercise[] {
    return VocabularyEngine.pool(courses, level, language)
  },

  count(courses: CoursePack[], level: CEFRLevel, language: LanguageCode): number {
    return this.pool(courses, level, language).length
  },

  /**
   * Наборы по шесть пар.
   *
   * Внутри набора не бывает двух одинаковых переводов и двух одинаковых слов — иначе
   * набор нерешаем: человек соединяет верно, а приложение считает это ошибкой. Это не
   * теория: в курсе есть «la próxima — в следующий раз» и «la próxima vez — в следующий
   * раз», и в одном наборе они встретились бы неизбежно.
   */
  build({ courses, level, language, state, rounds = DEFAULT_ROUNDS, now = new Date(), random = Math.random }: PairsOptions): PairItem[][] {
    const pool = prioritise(this.pool(courses, level, language), state, now, random)

    const items: PairItem[] = []
    const seenTerms = new Set<string>()
    const seenMeanings = new Set<string>()
    for (const exercise of pool) {
      const term = (exercise.prompt ?? '').trim()
      const meaning = (exercise.translation ?? '').trim()
      if (!term || !meaning) continue
      const termKey = term.toLowerCase()
      const meaningKey = meaning.toLowerCase()
      if (seenTerms.has(termKey) || seenMeanings.has(meaningKey)) continue
      seenTerms.add(termKey)
      seenMeanings.add(meaningKey)
      items.push({ exerciseID: exercise.id, term, meaning })
      if (items.length >= rounds * PAIRS_IN_ROUND) break
    }

    // Неполный набор не даётся: пять пар на экране, рассчитанном на шесть, читаются как
    // поломка. Лучше меньше наборов, чем один неровный.
    const sets: PairItem[][] = []
    for (let start = 0; start + PAIRS_IN_ROUND <= items.length; start += PAIRS_IN_ROUND) {
      sets.push(items.slice(start, start + PAIRS_IN_ROUND))
    }
    return sets
  },

  /** Правая колонка: те же переводы в другом порядке. */
  meanings(round: PairItem[], random: () => number = Math.random): string[] {
    return shuffled(round.map((pair) => pair.meaning), random)
  },
}
