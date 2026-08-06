import { LEVELS } from './types'
import type { CEFRLevel, CoursePack, Exercise, ExerciseType, Lesson, UserState } from './types'

/**
 * Endless practice built from the corpus that already ships.
 *
 * A level is five lessons, about fifty minutes: the course runs out long before a
 * daily habit forms, and "прошёл всё, что дальше" is where people stop. Practice
 * has no end and no completion: it keeps handing over the exercises that are due,
 * the ones that were failed, and the ones never seen, in that order.
 */

export const PRACTICE_LESSON_ID = 'practice'
const DEFAULT_SIZE = 10

/**
 * The course as far as this learner has actually walked it.
 *
 * Practice used to draw from the whole level, so a Spanish account opened five minutes
 * ago was offered the future tense from lesson 11 and word order from lesson 7 before
 * lesson 1 had been opened. The lessons themselves unlock in order; practice quietly
 * ignored that.
 *
 * Levels below the current one stay open in full — choosing B1 is a claim about A1 and
 * A2, and the placement test makes that claim on the learner's behalf. The current level
 * is earned lesson by lesson.
 *
 * Trimming the courses rather than the pool keeps every engine unchanged: practice,
 * shadowing and listening all build on `PracticeEngine.pool`, so they inherit the same
 * limit by being handed the same trimmed packs.
 */
export function taughtCourses(courses: CoursePack[], level: CEFRLevel, completed: Set<string>): CoursePack[] {
  const ceiling = LEVELS.indexOf(level)
  return courses.flatMap((course) => {
    const index = LEVELS.indexOf(course.level)
    if (index > ceiling) return []
    if (index < ceiling) return [course]
    const chapters = course.chapters
      .map((chapter) => ({ ...chapter, lessons: chapter.lessons.filter((lesson) => completed.has(lesson.id)) }))
      .filter((chapter) => chapter.lessons.length > 0)
    return chapters.length > 0 ? [{ ...course, chapters }] : []
  })
}

function shuffled<T>(items: T[], random: () => number): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export interface PracticeOptions {
  courses: CoursePack[]
  level: CEFRLevel
  state: UserState
  /** Restrict the set to one kind of exercise, for the "виды заданий" menu. */
  types?: ExerciseType[]
  /** Restrict the set to grammar topics, for "потренировать Present Perfect". */
  topics?: string[]
  size?: number
  now?: Date
  random?: () => number
}

/**
 * Everything the learner could be given next, in the order it should be offered:
 * due repetitions, then old mistakes, then unseen material, then the rest.
 * Shared with shadowing, which needs the same order over a narrower pool.
 */
export function prioritise(pool: Exercise[], state: UserState, now: Date, random: () => number): Exercise[] {
  const byID = new Map(pool.map((exercise) => [exercise.id, exercise]))

  const due = state.reviews
    .filter((item) => item.due.getTime() <= now.getTime() && byID.has(item.exerciseID))
    .sort((a, b) => a.due.getTime() - b.due.getTime())
    .map((item) => byID.get(item.exerciseID)!)

  const attemptedIDs = new Set(state.attempts.map((a) => a.exerciseID))
  const failedIDs = new Set(state.attempts.filter((a) => !a.correct).map((a) => a.exerciseID))

  const failed = pool.filter((exercise) => failedIDs.has(exercise.id))
  const unseen = pool.filter((exercise) => !attemptedIDs.has(exercise.id))
  const rest = pool.filter((exercise) => attemptedIDs.has(exercise.id) && !failedIDs.has(exercise.id))

  const ordered: Exercise[] = []
  const taken = new Set<string>()
  for (const bucket of [due, shuffled(failed, random), shuffled(unseen, random), shuffled(rest, random)]) {
    for (const exercise of bucket) {
      if (taken.has(exercise.id)) continue
      taken.add(exercise.id)
      ordered.push(exercise)
    }
  }
  return ordered
}

/** The kinds of practice offered on the main screen, in the order they are shown. */
export const PRACTICE_KINDS: Array<{ id: string; title: string; subtitle: string; types: ExerciseType[] }> = [
  { id: 'mixed', title: 'Всё вперемешку', subtitle: 'Сначала сложное, потом новое', types: ['flashcard', 'translate', 'word_order', 'multiple_choice'] },
  { id: 'flashcard', title: 'Карточки', subtitle: 'Новое показывается, знакомое спрашивается', types: ['flashcard'] },
  { id: 'translate', title: 'Перевод', subtitle: 'С русского, письменно', types: ['translate'] },
  { id: 'word_order', title: 'Собрать предложение', subtitle: 'Слова даны, нужен порядок', types: ['word_order'] },
  { id: 'multiple_choice', title: 'Тесты', subtitle: 'Выбрать правильный вариант', types: ['multiple_choice'] },
]

export const PracticeEngine = {
  /**
   * Everything the learner may be asked, up to and including the current level.
   * Rule cards and dialogues are excluded: reading and listening are not practice.
   */
  pool(courses: CoursePack[], level: CEFRLevel, types?: ExerciseType[], topics?: string[]): Exercise[] {
    const ceiling = LEVELS.indexOf(level)
    return courses
      .filter((course) => LEVELS.indexOf(course.level) <= ceiling)
      .sort((a, b) => LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level))
      .flatMap((course) => course.chapters)
      .flatMap((chapter) => chapter.lessons)
      .flatMap((lesson) => lesson.exercises)
      .filter((exercise) => exercise.type !== 'info' && exercise.type !== 'dialogue')
      .filter((exercise) => !types || types.includes(exercise.type))
      .filter((exercise) => !topics || (exercise.topics ?? []).some((topic) => topics.includes(topic)))
  },

  /** How much material each kind of practice has at this level, for the menu. */
  counts(courses: CoursePack[], level: CEFRLevel): Record<string, number> {
    return Object.fromEntries(PRACTICE_KINDS.map((kind) => [kind.id, this.pool(courses, level, kind.types).length]))
  },

  build({ courses, level, state, types, topics, size = DEFAULT_SIZE, now = new Date(), random = Math.random }: PracticeOptions): Exercise[] {
    const pool = this.pool(courses, level, types, topics)
    if (pool.length === 0) return []
    return prioritise(pool, state, now, random).slice(0, size)
  },

  /**
   * Practice is never "completed", so it is handed to the session as a lesson that
   * does not record completion.
   */
  lesson(exercises: Exercise[], title = 'Тренировка'): Lesson {
    return {
      id: PRACTICE_LESSON_ID,
      title,
      summary: 'Повторение и новые упражнения вперемешку.',
      estimatedMinutes: Math.max(2, Math.round(exercises.length * 0.6)),
      exercises,
    }
  },
}
