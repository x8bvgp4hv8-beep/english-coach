/** Mirrors EnglishCoachCore/Models.swift. The JSON on disk is shared with the macOS app. */

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
export const LEVELS: readonly CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'] as const

export type ExerciseType = 'info' | 'flashcard' | 'translate' | 'word_order' | 'multiple_choice' | 'dialogue'
export const EXERCISE_TYPES: readonly ExerciseType[] = ['info', 'flashcard', 'translate', 'word_order', 'multiple_choice', 'dialogue'] as const

/**
 * The five steps of a lesson, always in this order.
 *
 * Every serious course teaches by climbing: hear the language whole, meet the words,
 * get the rule that explains what was just heard, recognise it with the answer in
 * front of you, and only then produce it from nothing. Duolingo calls it scaffolding
 * — "tap the ending" before "type the ending".
 *
 * Ours was not climbing at all. The order inside a lesson was whatever order the JSON
 * happened to be written in: the second Spanish lesson asked for a free translation
 * fifth, between two flashcards. So the step is derived from the exercise type and the
 * decoder refuses a v2 pack whose lesson goes back down a step.
 */
export type LessonStep = 'listen' | 'words' | 'rule' | 'recognise' | 'produce'
export const LESSON_STEPS: readonly LessonStep[] = ['listen', 'words', 'rule', 'recognise', 'produce'] as const

const STEP_OF: Record<ExerciseType, LessonStep> = {
  dialogue: 'listen',
  flashcard: 'words',
  info: 'rule',
  multiple_choice: 'recognise',
  word_order: 'recognise',
  translate: 'produce',
}

export function stepOf(type: ExerciseType): LessonStep {
  return STEP_OF[type]
}

/** What the learner sees above each step, so the shape of a lesson is never a surprise. */
export const STEP_TITLE: Record<LessonStep, string> = {
  listen: 'ПОСЛУШАЙ',
  words: 'НОВОЕ СЛОВО',
  rule: 'КОРОТКОЕ ПРАВИЛО',
  recognise: 'УЗНАЙ',
  produce: 'СКАЖИ САМ',
}

/** One turn of a dialogue: who says it, what they say, what it means. */
export interface DialogueLine {
  speaker: string
  text: string
  translation: string
}

export interface Exercise {
  id: string
  type: ExerciseType
  title?: string
  prompt?: string
  canonicalAnswer?: string
  acceptedAnswers?: string[]
  hint?: string
  explanation?: string
  options?: string[]
  correctOption?: string
  tokens?: string[]
  translation?: string
  example?: string
  difficulty?: number
  /** Grammar topics from the syllabus that this exercise drills. */
  topics?: string[]
  /** The exchange to listen through, for a `dialogue`. Nothing to answer. */
  lines?: DialogueLine[]
}

export interface SyllabusTopic {
  id: string
  level: CEFRLevel
  title: string
  summary: string
  /** How many exercises the topic needs before it counts as taught, not mentioned. */
  minExercises: number
}

export interface Syllabus {
  schemaVersion: number
  source: string
  /** Topics currently below target. A ratchet: content lowers it, a new gap fails the build. */
  coverageDebtCeiling: number
  /**
   * Translation exercises that still ask for words the course has not shown yet.
   * The same ratchet, for the other half of "готов ли учащийся к этому заданию".
   */
  vocabularyDebtCeiling?: number
  topics: SyllabusTopic[]
}

export interface TopicCoverage {
  topic: SyllabusTopic
  exercises: number
  isCovered: boolean
}

/** The learner's record on one grammar topic, for the weak spots screen. */
export interface TopicProgress {
  topic: SyllabusTopic
  attempts: number
  correct: number
  /** 0 when the topic has never been attempted, so callers must check `attempts`. */
  accuracy: number
  /** How many exercises exist for it, so a topic with none is never offered. */
  exercises: number
}

export interface Lesson {
  id: string
  title: string
  summary: string
  estimatedMinutes: number
  exercises: Exercise[]
  /**
   * A checkpoint closes a unit: the same situation end to end, no hints, production only.
   * Passing it is what turns "прошёл уроки" into "умею".
   */
  kind?: 'lesson' | 'checkpoint'
}

export interface Chapter {
  id: string
  title: string
  subtitle?: string
  lessons: Lesson[]
  /**
   * What the learner will be able to do when the unit is done, in their own language:
   * «заказать кофе», «спросить, где что находится».
   *
   * A course named after grammar is a table of contents, not a path. Every course that
   * works — Duolingo, Babbel, Busuu — states the unit as an ability and lets the grammar
   * live inside it. This is that statement, and the progress screen is built from it.
   */
  canDo?: string[]
}

/** v1 packs are grammar chapters; v2 packs are can-do units with the five-step ladder. */
export const SCHEMA_VERSIONS: readonly number[] = [1, 2] as const

export interface CoursePack {
  schemaVersion: number
  level: CEFRLevel
  chapters: Chapter[]
}

export interface PlacementQuestion {
  id: string
  level: CEFRLevel
  prompt: string
  options: string[]
  correctOption: string
}

export interface PlacementBank {
  schemaVersion: number
  questions: PlacementQuestion[]
}

export interface UserProfile {
  selectedLevel: CEFRLevel
  dailyGoalMinutes: number
  reminderHour: number
  reminderMinute: number
  remindersEnabled: boolean
}

export interface AttemptRecord {
  id: string
  exerciseID: string
  correct: boolean
  date: Date
}

export interface ReviewItem {
  id: string
  exerciseID: string
  due: Date
  intervalDays: number
  ease: number
  repetitions: number
}

export interface UserState {
  profile: UserProfile | null
  completedLessonIDs: string[]
  attempts: AttemptRecord[]
  reviews: ReviewItem[]
  points: number
  /** Levels where the learner dismissed the "move up" suggestion. */
  levelUpDismissed?: string[]
  /** Seconds spent in lessons per local day ("2026-07-23" → 420). */
  practiceSeconds?: Record<string, number>
  /**
   * Phrasings the learner marked as correct after the checker disagreed, per exercise.
   * The escape hatch: whatever the checker misses, it only ever costs one tap, once.
   */
  acceptedAnswers?: Record<string, string[]>
}

export function freshState(): UserState {
  return { profile: null, completedLessonIDs: [], attempts: [], reviews: [], points: 0 }
}

export type Verdict = 'correct' | 'typo' | 'wrong'

export interface WordDiff {
  kind: 'same' | 'missing' | 'extra'
  text: string
}

export interface AnswerResult {
  /** True for both a clean answer and a one-letter typo. */
  isCorrect: boolean
  verdict: Verdict
  canonical: string
  /** The correctly spelled word, when the verdict is a typo. */
  typo?: string
  /** Word level difference against the expected answer, when it is wrong. */
  diff?: WordDiff[]
}

export type ContentErrorKind = 'unsupportedSchema' | 'emptyCourse' | 'duplicateID' | 'invalidExercise'

export class ContentError extends Error {
  constructor(readonly kind: ContentErrorKind, readonly detail: string = '') {
    super(`${kind}${detail ? `: ${detail}` : ''}`)
    this.name = 'ContentError'
  }
}
