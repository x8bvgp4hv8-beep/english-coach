import { PracticeEngine } from './practice'
import type { TheoryPack } from './theory'
import type { CEFRLevel, CoursePack, Exercise } from './types'

/**
 * Тренажёр форм неправильного глагола.
 *
 * Блок «Неправильные глаголы» в курсе есть — шесть уроков и 91 упражнение, — но
 * тренировки форм в нём нет: там переводят предложения и выбирают вариант. Этот материал
 * учат не так. Чтобы вспомнить `broken`, приходилось переводить целое предложение, и
 * заодно проверялось всё остальное; ошибка в форме и ошибка в порядке слов выглядели
 * одинаково.
 *
 * Здесь спрашивается ровно то, что надо знать наизусть: вторая форма и третья. Пачкой, с
 * возвратом того, что не вышло, — так это и запоминается.
 *
 * Глаголы берутся из контента, а не из списка в компоненте: иначе тренажёр начал бы
 * расходиться с курсом на первой же правке содержания. Источников два — карточки вида
 * «break — broke — broken» и таблица форм внутри разбора темы. Второй нужен потому, что в
 * карточках лежат не все частотные глаголы: `be`, `go`, `do` разобраны в теории, а
 * карточками не выданы.
 */

export interface VerbForms {
  /** Первая форма — то, что показывают учащемуся. */
  infinitive: string
  /** Вторая форма. Варианты через «/»: у `be` это «was / were». */
  past: string
  /** Третья форма. Тоже бывает с вариантами: «got / gotten». */
  participle: string
  /** Значение по-русски, чтобы глагол не был просто набором букв. */
  meaning: string
  /**
   * Откуда глагол взят. У карточки это её `id` — по нему пишется попытка; у строки
   * таблицы разбора настоящего упражнения нет, и тогда `null`.
   */
  exerciseID: string | null
}

/** «break — broke — broken» + «ломать» — карточка, из которой получается глагол. */
export function verbFormsFromCard(exercise: Exercise): VerbForms | null {
  if (exercise.type !== 'flashcard') return null
  const parts = (exercise.prompt ?? '').split(' — ').map((part) => part.trim())
  if (parts.length !== 3 || parts.some((part) => !part)) return null
  const [infinitive, past, participle] = parts
  return {
    infinitive,
    past,
    participle,
    meaning: (exercise.translation ?? '').trim(),
    exerciseID: exercise.id,
  }
}

/**
 * Глаголы из таблицы разбора, у которой в заголовке стоят три формы.
 *
 * Таблица опознаётся по заголовкам, а не по месту в файле: разбор — это текст, разделы в
 * нём переставляют, и привязка к индексу сломалась бы молча.
 */
export function verbFormsFromTheory(theory: TheoryPack, topicID = 'b1-irregular-verbs'): VerbForms[] {
  const topic = theory.topics.find((item) => item.topicID === topicID)
  if (!topic) return []
  const forms: VerbForms[] = []
  for (const section of topic.sections) {
    const table = section.table
    if (!table) continue
    const head = table.head.map((cell) => cell.toLowerCase())
    const first = head.indexOf('первая')
    const second = head.indexOf('вторая')
    const third = head.indexOf('третья')
    const meaning = head.indexOf('значение')
    if (first < 0 || second < 0 || third < 0) continue
    for (const row of table.rows) {
      const infinitive = (row[first] ?? '').trim()
      const past = (row[second] ?? '').trim()
      const participle = (row[third] ?? '').trim()
      if (!infinitive || !past || !participle) continue
      forms.push({
        infinitive,
        past,
        participle,
        meaning: meaning >= 0 ? (row[meaning] ?? '').trim() : '',
        exerciseID: null,
      })
    }
  }
  return forms
}

/**
 * Ответ засчитан, если он совпал с одной из допустимых форм.
 *
 * Варианты через «/» — не придирка, а язык: у `be` вторая форма «was / were», у `get`
 * третья и `got`, и `gotten`. Требовать обе половины значило бы считать верный ответ
 * ошибкой. Регистр и лишние пробелы не учитываются: тренируется форма, а не набор текста.
 */
export function formIsCorrect(answer: string, expected: string): boolean {
  const normalise = (text: string) => text.toLowerCase().replace(/\s+/g, ' ').trim()
  const given = normalise(answer)
  if (!given) return false
  const variants = expected.split('/').map(normalise).filter(Boolean)
  return variants.includes(given) || normalise(expected) === given
}

/** Сколько глаголов в одном заходе: пачка, которую видно до конца. */
const DEFAULT_SIZE = 15

export interface VerbFormsOptions {
  courses: CoursePack[]
  level: CEFRLevel
  theory: TheoryPack | null
  size?: number
  random?: () => number
}

export const VerbFormsEngine = {
  /**
   * Все глаголы, которых можно спросить. Карточки идут первыми, потому что у них есть
   * `id` и попытка по ним запишется; дубли по первой форме отбрасываются.
   */
  pool(courses: CoursePack[], level: CEFRLevel, theory: TheoryPack | null): VerbForms[] {
    const fromCards = PracticeEngine
      .pool(courses, level, ['flashcard'])
      .map(verbFormsFromCard)
      .filter((forms): forms is VerbForms => forms !== null)
    const fromTheory = theory ? verbFormsFromTheory(theory) : []

    const seen = new Set<string>()
    const unique: VerbForms[] = []
    for (const forms of [...fromCards, ...fromTheory]) {
      const key = forms.infinitive.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      unique.push(forms)
    }
    return unique
  },

  count(courses: CoursePack[], level: CEFRLevel, theory: TheoryPack | null): number {
    return this.pool(courses, level, theory).length
  },

  /** Пачка на один заход, в случайном порядке. */
  build({ courses, level, theory, size = DEFAULT_SIZE, random = Math.random }: VerbFormsOptions): VerbForms[] {
    const pool = this.pool(courses, level, theory)
    const shuffled = [...pool]
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled.slice(0, size)
  },
}
