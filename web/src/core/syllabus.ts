import { LEVELS, ContentError } from './types'
import type { CEFRLevel, CoursePack, Exercise, Syllabus, SyllabusTopic, TopicCoverage, TopicProgress, UserState } from './types'

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
  /** Rule cards and dialogues are excluded: exposure is not practice. */
  counts(courses: CoursePack[]): Record<string, number> {
    const counts: Record<string, number> = {}
    const exercises = courses.flatMap((c) => c.chapters).flatMap((c) => c.lessons).flatMap((l) => l.exercises)
    for (const exercise of exercises) {
      // Reading a rule or listening to a dialogue is exposure, not practice.
      if (exercise.type === 'info' || exercise.type === 'dialogue') continue
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
  /**
   * Every topic up to and including the level, with the learner's record on it.
   *
   * `taught` is the part of the course practice may draw from, which is not the whole
   * level until the whole level has been walked. The learner's record is read from all of
   * `courses` — an answer given is an answer given — but `exercises` counts only what can
   * be drilled right now, so the screen never offers a topic that would open an empty set.
   */
  all(syllabus: Syllabus, courses: CoursePack[], state: UserState, level: CEFRLevel, taught: CoursePack[] = courses): TopicProgress[] {
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

    const available = SyllabusEngine.counts(taught)

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
  weak(syllabus: Syllabus, courses: CoursePack[], state: UserState, level: CEFRLevel, taught: CoursePack[] = courses): TopicProgress[] {
    return this.all(syllabus, courses, state, level, taught)
      // A topic with nothing to drill yet is a fact, not an offer: it would open an empty set.
      .filter((item) => item.exercises > 0 && item.attempts >= ENOUGH_ATTEMPTS && item.accuracy < WEAK_ACCURACY)
      .sort((a, b) => a.accuracy - b.accuracy || b.attempts - a.attempts)
  },

  /** Topics never practised, so the screen can offer them instead of staying empty. */
  untouched(syllabus: Syllabus, courses: CoursePack[], state: UserState, level: CEFRLevel, taught: CoursePack[] = courses): TopicProgress[] {
    return this.all(syllabus, courses, state, level, taught).filter((item) => item.attempts === 0 && item.exercises > 0)
  },
}

/**
 * Порядок ввода лексики: не просить произвести то, чего не показывали.
 *
 * The first Spanish lesson used to open by asking the learner to write "Soy de Lituania"
 * — to a true beginner that is not an exercise, it is a wall. Across the two courses 149
 * of the 200 translation exercises did the same thing to some degree, and nothing in the
 * build noticed.
 *
 * So it is measured. A word counts as introduced once the learner has been shown it: a
 * rule card, a flashcard, the words handed out in a sentence-building tray, the options
 * of a multiple choice, or the answer to an earlier translation. Anything a translation
 * exercise demands beyond that is debt, and the debt has a ceiling that only goes down.
 */
const WORD = /[\p{L}'’-]+/gu

function vocabulary(text: string | undefined): Set<string> {
  const found = new Set<string>()
  for (const raw of (text ?? '').match(WORD) ?? []) {
    const word = raw.toLowerCase().replace(/^['’-]+|['’-]+$/g, '')
    if (word.length > 1) found.add(word)
  }
  return found
}

/** What an exercise puts in front of the learner, in the language being learnt. */
function shown(exercise: Exercise): Set<string> {
  const parts: Array<string | undefined> = []
  switch (exercise.type) {
    case 'info': parts.push(exercise.title, exercise.explanation); break
    case 'flashcard': parts.push(exercise.prompt, exercise.example); break
    case 'word_order': parts.push((exercise.tokens ?? []).join(' '), exercise.canonicalAnswer); break
    case 'multiple_choice': parts.push(exercise.prompt, (exercise.options ?? []).join(' ')); break
    // Checking a translation reveals its answer, so from then on it is taught too.
    case 'translate': parts.push(exercise.canonicalAnswer, exercise.hint); break
    // A dialogue is where a unit's language is first heard whole: everything in it counts.
    case 'dialogue': parts.push(...(exercise.lines ?? []).map((line) => line.text)); break
  }
  const found = new Set<string>()
  for (const part of parts) for (const word of vocabulary(part)) found.add(word)
  return found
}

export interface UnseenWords {
  exerciseID: string
  words: string[]
}

/** Translation exercises that ask for words the course has not shown yet, in order. */
export function unseenVocabulary(courses: CoursePack[]): UnseenWords[] {
  const known = new Set<string>()
  const debt: UnseenWords[] = []
  const ordered = [...courses].sort((a, b) => LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level))
  for (const course of ordered) {
    for (const chapter of course.chapters) {
      for (const lesson of chapter.lessons) {
        for (const exercise of lesson.exercises) {
          if (exercise.type === 'translate' && exercise.canonicalAnswer) {
            const missing = [...vocabulary(exercise.canonicalAnswer)].filter((word) => !known.has(word))
            if (missing.length > 0) debt.push({ exerciseID: exercise.id, words: missing.sort() })
          }
          for (const word of shown(exercise)) known.add(word)
        }
      }
    }
  }
  return debt
}
