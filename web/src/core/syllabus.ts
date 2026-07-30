import { LEVELS, ContentError } from './types'
import type { CEFRLevel, CoursePack, Syllabus, SyllabusTopic, TopicCoverage, TopicProgress, UserState } from './types'

/**
 * What each level is supposed to teach, and how far the shipped content is from it.
 * Mirrors `EnglishCoachCore/Syllabus.swift`.
 *
 * Without this the courses were a pile of lessons with no way to tell what was missing:
 * Present Continuous was absent from all 249 exercises and nothing said so. The manifest
 * is the promise, `coverage` is the audit, and the debt ceiling stops it from growing.
 */

export function decodeSyllabus(raw: unknown): Syllabus {
  const syllabus = raw as Syllabus
  if (syllabus?.schemaVersion !== 1) throw new ContentError('unsupportedSchema', String(syllabus?.schemaVersion))
  if (!syllabus.topics?.length) throw new ContentError('emptyCourse')
  const ids = new Set<string>()
  for (const topic of syllabus.topics) {
    if (ids.has(topic.id)) throw new ContentError('duplicateID', topic.id)
    ids.add(topic.id)
    if (!(topic.minExercises > 0)) throw new ContentError('invalidExercise', topic.id)
  }
  return syllabus
}

export const SyllabusEngine = {
  /** Rule cards are excluded: reading a rule is not practising it. */
  counts(courses: CoursePack[]): Record<string, number> {
    const counts: Record<string, number> = {}
    const exercises = courses.flatMap((c) => c.chapters).flatMap((c) => c.lessons).flatMap((l) => l.exercises)
    for (const exercise of exercises) {
      if (exercise.type === 'info') continue
      for (const topic of exercise.topics ?? []) counts[topic] = (counts[topic] ?? 0) + 1
    }
    return counts
  },

  coverage(syllabus: Syllabus, courses: CoursePack[]): TopicCoverage[] {
    const counts = this.counts(courses)
    return syllabus.topics.map((topic) => {
      const exercises = counts[topic.id] ?? 0
      return { topic, exercises, isCovered: exercises >= topic.minExercises }
    })
  },

  gaps(syllabus: Syllabus, courses: CoursePack[]): TopicCoverage[] {
    return this.coverage(syllabus, courses).filter((item) => !item.isCovered)
  },

  /** Topic ids used by content that the manifest does not define — a typo in a pack. */
  unknownTopics(syllabus: Syllabus, courses: CoursePack[]): string[] {
    const known = new Set(syllabus.topics.map((t) => t.id))
    return Object.keys(this.counts(courses)).filter((id) => !known.has(id))
  },

  /** The topics a level is responsible for, in manifest order, for a progress screen. */
  topics(level: CEFRLevel, syllabus: Syllabus): SyllabusTopic[] {
    return syllabus.topics.filter((topic) => topic.level === level)
  },
}

/** How few attempts still count as "no opinion yet" about a topic. */
export const ENOUGH_ATTEMPTS = 3
/** Below this share of correct answers a topic is worth putting back in front of you. */
export const WEAK_ACCURACY = 0.75

/**
 * What the learner is actually good at, per grammar topic.
 *
 * The app already records every attempt against an exercise id, and every exercise now
 * carries its topics, so the weak spots were sitting in the data with nothing reading
 * them. This is the reader: it turns "wrong on b1-ch4-l1-ex4" into "Present Perfect
 * against Past Simple, 4 of 9 right".
 */
export const TopicProgressEngine = {
  /** Every topic up to and including the level, with the learner's record on it. */
  all(syllabus: Syllabus, courses: CoursePack[], state: UserState, level: CEFRLevel): TopicProgress[] {
    const ceiling = LEVELS.indexOf(level)
    const inScope = syllabus.topics.filter((topic) => LEVELS.indexOf(topic.level) <= ceiling)

    const topicsOf = new Map<string, string[]>()
    const exercises = courses.flatMap((c) => c.chapters).flatMap((c) => c.lessons).flatMap((l) => l.exercises)
    for (const exercise of exercises) {
      if (exercise.type !== 'info') topicsOf.set(exercise.id, exercise.topics ?? [])
    }

    const attempts = new Map<string, { attempts: number; correct: number }>()
    for (const attempt of state.attempts) {
      for (const topic of topicsOf.get(attempt.exerciseID) ?? []) {
        const tally = attempts.get(topic) ?? { attempts: 0, correct: 0 }
        tally.attempts += 1
        if (attempt.correct) tally.correct += 1
        attempts.set(topic, tally)
      }
    }

    const available: Record<string, number> = {}
    for (const [, topics] of topicsOf) for (const topic of topics) available[topic] = (available[topic] ?? 0) + 1

    return inScope.map((topic) => {
      const tally = attempts.get(topic.id) ?? { attempts: 0, correct: 0 }
      return {
        topic,
        attempts: tally.attempts,
        correct: tally.correct,
        accuracy: tally.attempts > 0 ? tally.correct / tally.attempts : 0,
        exercises: available[topic.id] ?? 0,
      }
    })
  },

  /**
   * Worst first. A topic needs a few attempts before it can be called weak — one slip
   * on a first sight of Past Perfect says nothing.
   */
  weak(syllabus: Syllabus, courses: CoursePack[], state: UserState, level: CEFRLevel): TopicProgress[] {
    return this.all(syllabus, courses, state, level)
      .filter((item) => item.attempts >= ENOUGH_ATTEMPTS && item.accuracy < WEAK_ACCURACY)
      .sort((a, b) => a.accuracy - b.accuracy || b.attempts - a.attempts)
  },

  /** Topics never practised, so the screen can offer them instead of staying empty. */
  untouched(syllabus: Syllabus, courses: CoursePack[], state: UserState, level: CEFRLevel): TopicProgress[] {
    return this.all(syllabus, courses, state, level).filter((item) => item.attempts === 0 && item.exercises > 0)
  },
}
