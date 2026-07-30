import { ContentError } from './types'
import type { CEFRLevel, CoursePack, Syllabus, SyllabusTopic, TopicCoverage } from './types'

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
