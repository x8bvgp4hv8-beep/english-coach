import { PracticeEngine } from './practice'
import { ContentError, LEVELS } from './types'
import type { CEFRLevel, CoursePack, Exercise, Lesson, Syllabus, UserState } from './types'
import { TopicProgressEngine } from './syllabus'

/**
 * Разбор темы: то самое «объясни теорию», которого в приложении не было.
 *
 * Теория в курсе существует, но в масштабе одной карточки: внутри урока лежит ровно
 * одно упражнение типа `info` на одиннадцать минут занятия, абзац в три строки —
 * «Have you ever worked открывает тему, а дальше разговор уходит в прошедшее». Для
 * знакомства этого хватает, для понимания времени — нет: там нет ни таблицы форм, ни границ
 * употребления, ни того, чем это время отличается от соседнего, ни ошибки, которую
 * русскоязычный делает в этом месте всегда.
 *
 * Разбор — это отдельный слой поверх курса. Уроки он не меняет и не заменяет: курс
 * учит фразами, разбор объясняет правило, по которому эти фразы собраны. Одна тема
 * силлабуса — один разбор, и связь именно по `topicID`, потому что прогресс, слабые
 * места и подбор упражнений уже считаются по темам силлабуса. Значит прочитанный
 * разбор сразу знает, какую практику за собой вести.
 */

/** Таблица форм: без неё правило про времена не объяснить. */
export interface TheoryTable {
  caption?: string
  head: string[]
  rows: string[][]
}

/** Случай употребления: зачем так говорят, и как это звучит. */
export interface TheoryCase {
  use: string
  example: string
  translation: string
}

/**
 * Ошибка, которую делают именно на этом месте.
 *
 * Самая полезная часть разбора и единственная, которой нет ни в одном упражнении
 * курса: упражнение показывает верный вариант, а ошибку человек носит свою. Пишется
 * не «бывает неверно», а конкретная неверная фраза рядом с верной и причина.
 */
export interface TheoryMistake {
  wrong: string
  right: string
  why: string
}

export interface TheorySection {
  heading: string
  body?: string
  table?: TheoryTable
  cases?: TheoryCase[]
  mistakes?: TheoryMistake[]
}

export interface TheoryTopic {
  /** Тема силлабуса, которую объясняет разбор. По ней же подбирается практика. */
  topicID: string
  title: string
  /** Одно предложение: зачем эта тема вообще нужна. Показывается в списке. */
  idea: string
  /** Сколько времени занимает чтение — из него считается план занятия. */
  minutes: number
  sections: TheorySection[]
}

export interface TheoryPack {
  schemaVersion: number
  level: CEFRLevel
  topics: TheoryTopic[]
}

/**
 * Разбор без темы силлабуса — это текст, за которым нельзя дать практику.
 *
 * Проверка обязательна по той же причине, по которой в силлабусе стоит `unknownTopics`:
 * опечатка в `topicID` не сломала бы ничего заметного, просто занятие тихо собиралось
 * бы из пустого набора упражнений и выглядело как «теория и всё».
 */
export function decodeTheory(raw: unknown, knownTopicIDs?: Set<string>): TheoryPack {
  const pack = raw as TheoryPack
  if (pack?.schemaVersion !== 1) throw new ContentError('unsupportedSchema', String(pack?.schemaVersion))
  if (!LEVELS.includes(pack.level)) throw new ContentError('invalidExercise', String(pack?.level))
  if (!pack.topics?.length) throw new ContentError('emptyCourse')

  const seen = new Set<string>()
  for (const topic of pack.topics) {
    if (seen.has(topic.topicID)) throw new ContentError('duplicateID', topic.topicID)
    seen.add(topic.topicID)
    if (knownTopicIDs && !knownTopicIDs.has(topic.topicID)) {
      throw new ContentError('invalidExercise', topic.topicID)
    }
    if (!topic.sections?.length) throw new ContentError('invalidExercise', topic.topicID)
    if (!(topic.minutes > 0)) throw new ContentError('invalidExercise', topic.topicID)
    for (const section of topic.sections) {
      const hasContent = Boolean(section.body) || Boolean(section.table)
        || (section.cases?.length ?? 0) > 0 || (section.mistakes?.length ?? 0) > 0
      if (!section.heading || !hasContent) throw new ContentError('invalidExercise', topic.topicID)
    }
    for (const table of topic.sections.map((s) => s.table).filter((t): t is TheoryTable => Boolean(t))) {
      if (!table.head.length || table.rows.some((row) => row.length !== table.head.length)) {
        throw new ContentError('invalidExercise', topic.topicID)
      }
    }
  }
  return pack
}

/** Сколько минут стоит одно упражнение — та же оценка, по которой считается тренировка. */
const MINUTES_PER_EXERCISE = 0.6
/** Меньше трёх упражнений на шаг — это не практика, а формальность. */
const MIN_STEP = 3

export type StudyStepKind = 'theory' | 'recognise' | 'produce'

export interface StudyStep {
  kind: StudyStepKind
  /** Что человек увидит над шагом. */
  title: string
  minutes: number
  /** Упражнения шага; у разбора их нет. */
  exercises: Exercise[]
}

/** Почему занятие именно про эту тему — говорится вслух на экране. */
export type StudyReason = 'weak' | 'unread' | 'next'

export interface StudyPlan {
  topic: TheoryTopic
  reason: StudyReason
  steps: StudyStep[]
  /** Практика занятия одним списком, в порядке шагов — для сессии. */
  exercises: Exercise[]
  minutes: number
}

export interface StudyOptions {
  theory: TheoryPack
  courses: CoursePack[]
  syllabus: Syllabus | null
  state: UserState
  level: CEFRLevel
  /** Сколько человек готов заниматься. */
  minutes: number
  /** Тема, выбранная руками; иначе выбирается сама. */
  topicID?: string
  now?: Date
  random?: () => number
}

export const StudyEngine = {
  /** Разборы, привязанные к темам этого уровня. */
  topics(theory: TheoryPack): TheoryTopic[] {
    return theory.topics
  },

  find(theory: TheoryPack, topicID: string): TheoryTopic | null {
    return theory.topics.find((topic) => topic.topicID === topicID) ?? null
  },

  isRead(state: UserState, topicID: string): boolean {
    return (state.theoryRead ?? []).includes(topicID)
  },

  /**
   * Тема занятия, когда человек не выбрал её сам.
   *
   * Сначала то, где он ошибается: слабая тема — это уже доказанный пробел, и объяснять
   * надо в первую очередь его. Потом непрочитанное, в порядке силлабуса. И только потом
   * тема, разбор которой прочитан, но проценты по ней ещё не набраны.
   */
  chooseTopic(
    { theory, syllabus, courses, state, level }:
    Pick<StudyOptions, 'theory' | 'syllabus' | 'courses' | 'state' | 'level'>,
  ): { topic: TheoryTopic; reason: StudyReason } | null {
    if (theory.topics.length === 0) return null

    if (syllabus) {
      const weak = TopicProgressEngine.weak(syllabus, courses, state, level)
      for (const item of weak) {
        const topic = this.find(theory, item.topic.id)
        if (topic) return { topic, reason: 'weak' }
      }
    }

    const unread = theory.topics.find((topic) => !this.isRead(state, topic.topicID))
    if (unread) return { topic: unread, reason: 'unread' }

    return { topic: theory.topics[0], reason: 'next' }
  },

  /** Почему стоит разобрать именно эту тему — тот же вопрос, но про заданную тему. */
  reasonFor(
    topic: TheoryTopic,
    { syllabus, courses, state, level }: Pick<StudyOptions, 'syllabus' | 'courses' | 'state' | 'level'>,
  ): StudyReason {
    if (syllabus) {
      const weak = TopicProgressEngine.weak(syllabus, courses, state, level)
      if (weak.some((item) => item.topic.id === topic.topicID)) return 'weak'
    }
    return this.isRead(state, topic.topicID) ? 'next' : 'unread'
  },

  /**
   * Занятие на заданное время: разбор темы, затем узнавание, затем производство.
   *
   * Порядок — это лестница урока, которая в курсе уже есть, только здесь она строится
   * вокруг одного правила, а не вокруг одного диалога: прочитал правило → нашёл его в
   * готовых вариантах → сказал сам с нуля. Практика берётся по теме разбора, поэтому
   * всё занятие держится на одном и том же, а не разбегается по уровню.
   *
   * Упражнения подбираются из ВСЕГО курса уровня, а не из пройденных уроков, и это
   * осознанное отступление от правила `taughtCourses`. Правило запрещает просить
   * производить то, чего не объясняли, — а здесь объяснение только что прочитано, и
   * запрещать практику по нему значило бы обещать «теория и практика на неё» и выдавать
   * одну теорию.
   */
  plan({
    theory, courses, syllabus, state, level, minutes,
    topicID, now = new Date(), random = Math.random,
  }: StudyOptions): StudyPlan | null {
    const chosen = topicID
      ? (() => {
          const topic = this.find(theory, topicID)
          // Причина считается и для темы, выбранной руками. Иначе карточка на «Сегодня»
          // называет тему слабой, а открытый по ней разбор — просто разбором: экран
          // спорит сам с собой, хотя тема та же.
          return topic ? { topic, reason: this.reasonFor(topic, { syllabus, courses, state, level }) } : null
        })()
      : this.chooseTopic({ theory, syllabus, courses, state, level })
    if (!chosen) return null

    const { topic, reason } = chosen
    const forPractice = Math.max(0, minutes - topic.minutes)
    const steps: StudyStep[] = [
      { kind: 'theory', title: 'Разбор', minutes: topic.minutes, exercises: [] },
    ]

    // Узнавание короче производства: выбрать из готовых вариантов легче, чем сказать
    // самому, и время занятия должно уходить в то, что даётся тяжелее.
    //
    // У шага есть основной тип и добивка. Шаг называется «Узнай правило», и узнавание
    // правила — это тест с вариантами; карточка лексики по той же теме тоже верна, но
    // первой в таком шаге она читается как подмена. Поэтому сначала набираются тесты, и
    // только если их не хватило, шаг дополняется карточками.
    const split: Array<{
      kind: StudyStepKind; title: string; share: number
      types: Exercise['type'][]; fill?: Exercise['type'][]
    }> = [
      { kind: 'recognise', title: 'Узнай правило', share: 0.4, types: ['multiple_choice'], fill: ['flashcard'] },
      { kind: 'produce', title: 'Скажи сам', share: 0.6, types: ['translate', 'word_order'] },
    ]

    const used = new Set<string>()
    for (const part of split) {
      const size = Math.max(MIN_STEP, Math.round((forPractice * part.share) / MINUTES_PER_EXERCISE))
      const draw = (types: Exercise['type'][], limit: number): Exercise[] => PracticeEngine
        .build({
          courses, level, state, types, topics: [topic.topicID],
          size: limit + used.size, now, random,
        })
        .filter((exercise) => !used.has(exercise.id))
        .slice(0, limit)

      const exercises = draw(part.types, size)
      for (const exercise of exercises) used.add(exercise.id)
      if (part.fill && exercises.length < size) {
        const extra = draw(part.fill, size - exercises.length)
        for (const exercise of extra) used.add(exercise.id)
        exercises.push(...extra)
      }
      if (exercises.length === 0) continue
      steps.push({
        kind: part.kind,
        title: part.title,
        minutes: Math.round(exercises.length * MINUTES_PER_EXERCISE),
        exercises,
      })
    }

    const exercises = steps.flatMap((step) => step.exercises)
    return {
      topic,
      reason,
      steps,
      exercises,
      minutes: steps.reduce((sum, step) => sum + step.minutes, 0),
    }
  },

  /**
   * Практика занятия как урок для сессии.
   *
   * Занятие не отмечается пройденным: тема не заканчивается на одном подходе, а
   * прогресс по ней и так считается по попыткам.
   */
  lesson(plan: StudyPlan): Lesson {
    return {
      id: STUDY_LESSON_ID,
      title: plan.topic.title,
      summary: plan.topic.idea,
      estimatedMinutes: Math.max(2, plan.minutes - plan.topic.minutes),
      exercises: plan.exercises,
    }
  },
}

export const STUDY_LESSON_ID = 'study'
