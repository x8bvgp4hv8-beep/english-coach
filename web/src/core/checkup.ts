import { check } from './answer'
import { ContentError, LEVELS } from './types'
import type { CEFRLevel, CoursePack, UserState } from './types'

/**
 * Контрольный срез: проверка вне курса.
 *
 * Проценты, которые приложение показывает, считаются по тем же упражнениям, которые оно
 * само и выдаёт. Человек двадцать раз увидел `My bike was stolen`, ответил верно — и
 * экран говорит «85% по пассиву». Это замкнутый круг: цифра измеряет привыкание к
 * формулировкам курса, а не язык.
 *
 * Срез разрывает круг: те же умения спрашиваются на предложениях, которых в курсе нет.
 * Отсюда все решения ниже — банк лежит отдельным файлом, декодер отказывается принять
 * задание, совпавшее с упражнением, результат хранится своим списком и на экране идёт
 * отдельной строкой, не смешиваясь с процентами по курсу.
 *
 * Проходить срез должен человек, а не инструмент: сравнивать два замера имеет смысл
 * только если оба сделаны одинаково и честно.
 */

export interface CheckupItem {
  id: string
  /** Темы силлабуса, которые задание проверяет. */
  topics: string[]
  /** Задание по-русски. */
  prompt: string
  canonicalAnswer: string
  acceptedAnswers?: string[]
}

export interface CheckupBank {
  schemaVersion: number
  level: CEFRLevel
  items: CheckupItem[]
}

/** Один пройденный срез: дата, уровень и сколько из скольких. */
export interface CheckupResult {
  /** ISO-дата дня, когда срез пройден. */
  date: string
  level: CEFRLevel
  correct: number
  total: number
}

/** Нормализация для сравнения с курсом: только буквы, цифры и пробелы. */
function fingerprint(text: string): string {
  return text.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim()
}

/** Всё, что курс когда-либо показывал: по этому набору проверяется независимость среза. */
export function courseFingerprints(courses: CoursePack[]): Set<string> {
  const seen = new Set<string>()
  const add = (text: string | undefined) => { if (text) seen.add(fingerprint(text)) }
  for (const course of courses) {
    for (const chapter of course.chapters) {
      for (const lesson of chapter.lessons) {
        for (const exercise of lesson.exercises) {
          add(exercise.canonicalAnswer)
          add(exercise.prompt)
          add(exercise.example)
          add(exercise.correctOption)
          for (const option of exercise.options ?? []) add(option)
          for (const line of exercise.lines ?? []) add(line.text)
        }
      }
    }
  }
  return seen
}

/**
 * Разбор банка. `courses` передаются не для красоты: задание, которое встречается в
 * курсе, ломает весь смысл среза, и поймать это должен декодер, а не человек глазами.
 */
export function decodeCheckup(raw: unknown, courses?: CoursePack[], knownTopicIDs?: Set<string>): CheckupBank {
  const bank = raw as CheckupBank
  if (bank?.schemaVersion !== 1) throw new ContentError('unsupportedSchema', String(bank?.schemaVersion))
  if (!LEVELS.includes(bank.level)) throw new ContentError('invalidExercise', String(bank?.level))
  if (!bank.items?.length) throw new ContentError('emptyCourse')

  const inCourse = courses ? courseFingerprints(courses) : null
  const ids = new Set<string>()
  for (const item of bank.items) {
    if (ids.has(item.id)) throw new ContentError('duplicateID', item.id)
    ids.add(item.id)
    if (!item.prompt || !item.canonicalAnswer) throw new ContentError('invalidExercise', item.id)
    if (!item.topics?.length) throw new ContentError('invalidExercise', item.id)
    if (knownTopicIDs && item.topics.some((topic) => !knownTopicIDs.has(topic))) {
      throw new ContentError('invalidExercise', item.id)
    }
    if (inCourse) {
      const answers = [item.canonicalAnswer, ...(item.acceptedAnswers ?? [])]
      if (answers.some((answer) => inCourse.has(fingerprint(answer)))) {
        throw new ContentError('invalidExercise', item.id)
      }
    }
  }
  return bank
}

export const CheckupEngine = {
  bank(banks: CheckupBank[], level: CEFRLevel): CheckupBank | null {
    return banks.find((item) => item.level === level) ?? null
  },

  /**
   * Проверка ответа — тем же чекером, что и в уроках.
   *
   * Одинаково с курсом: иначе срез мерил бы ещё и придирчивость проверки. Опечатка
   * засчитывается, как и в упражнениях: это замер языка, а не набора текста.
   */
  judge(item: CheckupItem, answer: string): boolean {
    const result = check(answer, item.canonicalAnswer, item.acceptedAnswers ?? [])
    return result.isCorrect
  },

  /** Результаты по уровню, от старых к новым — так их и рисует график. */
  history(state: UserState, level: CEFRLevel): CheckupResult[] {
    return (state.checkups ?? [])
      .filter((result) => result.level === level)
      .sort((a, b) => a.date.localeCompare(b.date))
  },

  latest(state: UserState, level: CEFRLevel): CheckupResult | null {
    const all = this.history(state, level)
    return all.length > 0 ? all[all.length - 1] : null
  },

  /**
   * Насколько сдвинулся результат против предыдущего раза, в процентных пунктах.
   * `null`, когда сравнивать ещё не с чем — один замер движения не показывает.
   */
  change(state: UserState, level: CEFRLevel): number | null {
    const all = this.history(state, level)
    if (all.length < 2) return null
    const share = (result: CheckupResult) => (result.correct / result.total) * 100
    return Math.round(share(all[all.length - 1]) - share(all[all.length - 2]))
  },

  recording(result: CheckupResult, state: UserState): CheckupResult[] {
    return [...(state.checkups ?? []), result]
  },
}
