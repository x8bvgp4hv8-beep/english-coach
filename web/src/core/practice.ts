import { LEVELS, seenExerciseIDs } from './types'
import type { CEFRLevel, CoursePack, Exercise, ExerciseType, Lesson, UserState } from './types'

/**
 * Бесконечная тренировка из того контента, который уже лежит в сборке.
 *
 * У неё нет конца и нет «пройдено»: она выдаёт то, что назначено на повтор, потом
 * то, чего человек ещё не видел, потом остальное — в этом порядке. Из чего именно
 * она собирается, решает `taughtCourses`; в каком порядке — `prioritise`. Обе
 * функции ниже несут историю своих ошибок, потому что обе успели дать неверный
 * ответ на вопрос «что этому человеку сейчас показать».
 */

export const PRACTICE_LESSON_ID = 'practice'
const DEFAULT_SIZE = 10

/**
 * Материал, который этому учащемуся уже можно давать.
 *
 * Раньше здесь было ровно наоборот, и это был корень жалобы «B1, а меня учат hello».
 * Уровни ниже текущего отдавались ЦЕЛИКОМ как новый материал, а текущий обрезался до
 * пройденных уроков — то есть у свежего B1-профиля пул был весь A1 плюс весь A2 и ноль
 * из B1. Обоснование стояло в комментарии: «выбор B1 — это заявление про A1 и A2».
 * Вывод из этого заявления обратный: если A1 человек уже знает, его слова нельзя
 * выдавать как то, что он пришёл учить. Первые карточки A1 — буквально Hello, Hi, Bye.
 *
 * Что открыто теперь, и почему именно так:
 *
 * - Уровни НИЖЕ текущего — только те уроки, которые человек действительно прошёл.
 *   Пройденное он учил здесь, и повторять это честно; непройденное он, по заявлению
 *   placement-теста, знает и без нас.
 * - Текущий уровень, пройденные уроки — целиком.
 * - Текущий уровень, ещё не пройденные уроки — только карточки. Карточка сама
 *   знакомит со словом («новое показывается, знакомое спрашивается»), ей не нужен
 *   пройденный урок. А перевод и сборка предложения — производство: просить их по
 *   теме, которую не объясняли, значит ставить стену, и ровно от этого пул когда-то
 *   и обрезали.
 *
 * Обрезка идёт по упражнениям, а не по урокам, поэтому все потребители — практика,
 * речь вслух, аудирование, темы — наследуют правило, продолжая строиться на
 * `PracticeEngine.pool` и ничего про него не зная.
 */
export function taughtCourses(courses: CoursePack[], level: CEFRLevel, completed: Set<string>): CoursePack[] {
  const ceiling = LEVELS.indexOf(level)
  return courses.flatMap((course) => {
    const index = LEVELS.indexOf(course.level)
    if (index > ceiling) return []
    const isCurrent = index === ceiling
    const chapters = course.chapters
      .map((chapter) => ({
        ...chapter,
        lessons: chapter.lessons.flatMap((lesson) => {
          if (completed.has(lesson.id)) return [lesson]
          if (!isCurrent) return []
          const preview = lesson.exercises.filter((exercise) => exercise.type === 'flashcard')
          return preview.length > 0 ? [{ ...lesson, exercises: preview }] : []
        }),
      }))
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
 * Всё, что можно выдать следующим, в том порядке, в котором это стоит выдавать:
 * назначенные повторения, затем никогда не виденное, затем остальное.
 *
 * Отдельного ведра «ошибки» здесь больше нет, и это вторая половина жалобы на
 * нейрослоп — «хочу поучить фразы, а мне дают фразы из последнего задания».
 * Ведро набиралось из `state.attempts` за всю историю и стояло ВЫШЕ нового
 * материала, а самые свежие ошибки — это всегда последний урок. При этом ошибка
 * и так назначается на повтор: `recordFailure` ставит срок на завтра. То есть
 * ведро не добавляло ошибке ещё один шанс, а отменяло её расписание и подавало
 * её немедленно — и снова, и снова, пока не ответишь верно.
 *
 * Теперь ошибки возвращаются ровно тогда, когда назначены, через `due`. Только
 * что отвеченное не выпадает: срок у него в будущем, а новое идёт раньше
 * пройденного.
 */
export function prioritise(pool: Exercise[], state: UserState, now: Date, random: () => number): Exercise[] {
  const byID = new Map(pool.map((exercise) => [exercise.id, exercise]))

  const due = state.reviews
    .filter((item) => item.due.getTime() <= now.getTime() && byID.has(item.exerciseID))
    .sort((a, b) => a.due.getTime() - b.due.getTime())
    .map((item) => byID.get(item.exerciseID)!)

  // "Seen" must outlive the attempt window, or trimmed-away exercises would come back
  // dressed as new material.
  const attemptedIDs = seenExerciseIDs(state)
  const unseen = pool.filter((exercise) => !attemptedIDs.has(exercise.id))
  const rest = pool.filter((exercise) => attemptedIDs.has(exercise.id))

  const ordered: Exercise[] = []
  const taken = new Set<string>()
  for (const bucket of [due, shuffled(unseen, random), shuffled(rest, random)]) {
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
  // Не «Карточки», а «Фразы»: из 4660 карточек B1 одиночных слов 4%, остальное — куски
  // реплик. Слова живут в своём режиме (`vocabulary.ts`), который их отбирает.
  { id: 'flashcard', title: 'Фразы', subtitle: 'Куски реплик из диалогов: узнать и вспомнить', types: ['flashcard'] },
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
