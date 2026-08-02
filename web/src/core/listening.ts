import { PracticeEngine, prioritise } from './practice'
import { shadowingPhrase } from './shadowing'
import type { CEFRLevel, CoursePack, Exercise, Lesson, UserState } from './types'

/**
 * Listening: hear the sentence, write down what you heard, see what slipped past.
 * Kept in step with `EnglishCoachCore/Listening.swift`.
 *
 * Everything else in the app puts the English in front of the eyes first. That trains
 * reading, and reading is the skill that was never the problem: the wall is a native
 * speaker saying a sentence at speed. Here the text is hidden until the answer is in,
 * so the only way through is the ear.
 *
 * It is checked, not self-assessed. The same checker the written exercises use already
 * forgives contractions, British spelling and a slipped letter, and its word diff can
 * name the words that did not come through — which is exactly the feedback a listener
 * needs. Phrases are the ones that already ship: no new content, no network, no keys.
 */

export const LISTENING_LESSON_ID = 'listening'
const DEFAULT_SIZE = 8

/**
 * Two words heard is vocabulary; three carry a structure, and structure is what gets
 * lost at speed. Below that it is a spelling test with a speaker attached.
 */
const MIN_WORDS = 3

/**
 * Sentence-shaped: a capital at the front, a full stop at the back. The content also
 * teaches collocations as cards — "on the weekend", "be going to", "used to live" — and
 * those clear three words without being anything a learner can write down: torn out of a
 * sentence, "on the weekend" is a guess about what came before it, not a listening test.
 */
const SENTENCE = /^[A-Z].*[.!?]$/

export interface ListeningItem {
  /** The exercise the sentence came from: progress is recorded against it. */
  exerciseID: string
  /** The English sentence, played but not shown until the answer is in. */
  text: string
  /** Russian meaning, offered as a hint before the answer. */
  gloss?: string
}

export interface ListeningSet {
  items: ListeningItem[]
  /** The same sentences as exercises, so the session records against real ids. */
  exercises: Exercise[]
}

export interface ListeningOptions {
  courses: CoursePack[]
  level: CEFRLevel
  state: UserState
  size?: number
  now?: Date
  random?: () => number
}

/** The sentence to play for an exercise, or null when it has none worth listening to. */
export function listeningPhrase(exercise: Exercise): ListeningItem | null {
  const item = shadowingPhrase(exercise)
  if (!item) return null
  // "From my perspective…" is a sentence opener, not a sentence: nobody can write down
  // where it was going. Fine to say out loud, useless to transcribe.
  if (item.text.includes('…') || !SENTENCE.test(item.text)) return null
  return item.text.trim().split(/\s+/).length >= MIN_WORDS ? item : null
}

export const ListeningEngine = {
  /** Every sentence the learner could take by ear at this level and below. */
  pool(courses: CoursePack[], level: CEFRLevel): Exercise[] {
    return PracticeEngine.pool(courses, level).filter((exercise) => listeningPhrase(exercise) !== null)
  },

  count(courses: CoursePack[], level: CEFRLevel): number {
    return this.pool(courses, level).length
  },

  build({ courses, level, state, size = DEFAULT_SIZE, now = new Date(), random = Math.random }: ListeningOptions): ListeningSet {
    const exercises = prioritise(this.pool(courses, level), state, now, random).slice(0, size)
    return { exercises, items: exercises.map((exercise) => listeningPhrase(exercise)!) }
  },

  /** Writing down what you heard is slow, so a set is short; it is never "completed". */
  lesson(exercises: Exercise[]): Lesson {
    return {
      id: LISTENING_LESSON_ID,
      title: 'На слух',
      summary: 'Слушай и записывай.',
      estimatedMinutes: Math.max(2, exercises.length),
      exercises,
    }
  },
}
