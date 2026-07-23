/** Mirrors EnglishCoachCore/Models.swift. The JSON on disk is shared with the macOS app. */

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
export const LEVELS: readonly CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'] as const

export type ExerciseType = 'info' | 'flashcard' | 'translate' | 'word_order' | 'multiple_choice'
export const EXERCISE_TYPES: readonly ExerciseType[] = ['info', 'flashcard', 'translate', 'word_order', 'multiple_choice'] as const

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
}

export interface Lesson {
  id: string
  title: string
  summary: string
  estimatedMinutes: number
  exercises: Exercise[]
}

export interface Chapter {
  id: string
  title: string
  subtitle?: string
  lessons: Lesson[]
}

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
