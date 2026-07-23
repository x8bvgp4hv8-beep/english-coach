import { LEVELS } from './types'
import type { AttemptRecord, CEFRLevel, CoursePack, Lesson, PlacementQuestion, ReviewItem } from './types'

/** Mirrors EnglishCoachCore/Engines.swift. Pure functions, no storage, no UI. */

function addDays(date: Date, days: number): Date {
  const result = new Date(date.getTime())
  result.setDate(result.getDate() + days)
  return result
}

// MARK: - Routing

export const CourseRouting = {
  nextLesson(lessons: Lesson[], completed: Set<string>): Lesson | null {
    return lessons.find((lesson) => !completed.has(lesson.id)) ?? null
  },

  isUnlocked(index: number, lessons: Lesson[], completed: Set<string>): boolean {
    if (index < 0 || index >= lessons.length) return false
    return index === 0 || completed.has(lessons[index - 1].id)
  },
}

export const LevelOrder = {
  all: LEVELS,
  next(after: CEFRLevel): CEFRLevel | null {
    const index = LEVELS.indexOf(after)
    return index >= 0 && index + 1 < LEVELS.length ? LEVELS[index + 1] : null
  },
}

// MARK: - Placement

export const PlacementScorer = {
  /** Places the learner at the first level they cannot comfortably pass. */
  recommend(bank: PlacementQuestion[], correctIDs: Set<string>, passThreshold = 0.6): CEFRLevel {
    for (const level of LEVELS) {
      const questions = bank.filter((q) => q.level === level)
      if (questions.length === 0) continue
      const correct = questions.filter((q) => correctIDs.has(q.id)).length
      if (correct / questions.length < passThreshold) return level
    }
    return LEVELS[LEVELS.length - 1]
  },

  /** True once the answers so far fix the recommendation, so the test can stop early. */
  isDecided(bank: PlacementQuestion[], answeredIDs: Set<string>, correctIDs: Set<string>, passThreshold = 0.6): boolean {
    for (const level of LEVELS) {
      const questions = bank.filter((q) => q.level === level)
      if (questions.length === 0) continue
      if (!questions.every((q) => answeredIDs.has(q.id))) return false
      const correct = questions.filter((q) => correctIDs.has(q.id)).length
      if (correct / questions.length < passThreshold) return true
    }
    return true
  },
}

// MARK: - Level progress

export const ProgressionEngine = {
  lessons(level: CEFRLevel, courses: CoursePack[]): Lesson[] {
    const course = courses.find((c) => c.level === level)
    return course ? course.chapters.flatMap((chapter) => chapter.lessons) : []
  },

  levelProgress(level: CEFRLevel, courses: CoursePack[], completed: Set<string>): number {
    const all = this.lessons(level, courses)
    if (all.length === 0) return 0
    return all.filter((lesson) => completed.has(lesson.id)).length / all.length
  },

  isLevelComplete(level: CEFRLevel, courses: CoursePack[], completed: Set<string>): boolean {
    const all = this.lessons(level, courses)
    return all.length > 0 && all.every((lesson) => completed.has(lesson.id))
  },

  exerciseIDs(level: CEFRLevel, courses: CoursePack[]): Set<string> {
    return new Set(this.lessons(level, courses).flatMap((lesson) => lesson.exercises).map((e) => e.id))
  },

  /** Accuracy over the most recent attempts on this level's exercises. */
  accuracy(level: CEFRLevel, courses: CoursePack[], attempts: AttemptRecord[], lastN = 40): number {
    const ids = this.exerciseIDs(level, courses)
    const relevant = attempts.filter((a) => ids.has(a.exerciseID)).slice(-lastN)
    if (relevant.length === 0) return 0
    return relevant.filter((a) => a.correct).length / relevant.length
  },

  shouldSuggestAdvance(
    level: CEFRLevel,
    courses: CoursePack[],
    completed: Set<string>,
    attempts: AttemptRecord[],
    dismissed: Set<string>,
    accuracyThreshold = 0.8,
  ): boolean {
    if (LevelOrder.next(level) === null) return false
    if (dismissed.has(level)) return false
    if (!this.isLevelComplete(level, courses, completed)) return false
    return this.accuracy(level, courses, attempts) >= accuracyThreshold
  },
}

// MARK: - Daily practice time

export const PracticeLog = {
  /** A single very long stretch is almost always a forgotten tab, not study time. */
  sessionCapSeconds: 30 * 60,

  dayKey(date: Date): string {
    const year = date.getFullYear()
    const month = `${date.getMonth() + 1}`.padStart(2, '0')
    const day = `${date.getDate()}`.padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  adding(seconds: number, log: Record<string, number> | undefined, date: Date): Record<string, number> {
    const updated = { ...(log ?? {}) }
    const clamped = Math.max(0, Math.min(Math.trunc(seconds), this.sessionCapSeconds))
    if (clamped <= 0) return updated
    const key = this.dayKey(date)
    updated[key] = (updated[key] ?? 0) + clamped
    return updated
  },

  minutes(log: Record<string, number> | undefined, date: Date): number {
    return Math.floor((log?.[this.dayKey(date)] ?? 0) / 60)
  },
}

// MARK: - Spaced repetition

export const ReviewEngine = {
  newItem(exerciseID: string, now: Date): ReviewItem {
    return { id: exerciseID, exerciseID, due: new Date(now.getTime()), intervalDays: 0, ease: 2.3, repetitions: 0 }
  },

  recordSuccess(source: ReviewItem, now: Date): ReviewItem {
    const item = { ...source }
    item.repetitions += 1
    if (item.repetitions === 1) item.intervalDays = 1
    else if (item.repetitions === 2) item.intervalDays = 3
    else if (item.repetitions === 3) item.intervalDays = 7
    else item.intervalDays = Math.min(180, Math.round(Math.max(1, item.intervalDays) * item.ease))
    item.ease = Math.min(3, item.ease + 0.05)
    item.due = addDays(now, item.intervalDays)
    return item
  },

  recordFailure(source: ReviewItem, now: Date): ReviewItem {
    const item = { ...source }
    item.repetitions = 0
    item.intervalDays = 1
    item.ease = Math.max(1.6, item.ease - 0.2)
    item.due = addDays(now, 1)
    return item
  },
}
