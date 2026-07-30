import { PracticeEngine, prioritise } from './practice'
import type { CEFRLevel, CoursePack, Exercise, Lesson, UserState } from './types'

/**
 * Shadowing: hear the phrase, say it out loud, record yourself, hear both back.
 * Kept in step with `EnglishCoachCore/Shadowing.swift`.
 *
 * Everything else in the app is read with the eyes and answered with the fingers,
 * which never gets the mouth moving. There is no speech grading here and no need
 * for one: the learner hears their own take next to the model phrase and judges it.
 * The verdict is theirs, but it still feeds points and spaced repetition, so a
 * phrase that did not come out comes back.
 *
 * The phrases are the ones that already ship — no new content, no network, no keys.
 */

export const SHADOWING_LESSON_ID = 'shadowing'
const DEFAULT_SIZE = 8

export interface ShadowingItem {
  /** The exercise the phrase came from: progress is recorded against it. */
  exerciseID: string
  /** The English sentence to say out loud. */
  text: string
  /** Russian meaning, when the source exercise carries one. */
  gloss?: string
}

export interface ShadowingSet {
  items: ShadowingItem[]
  /** The same phrases as exercises, so the session records against real ids. */
  exercises: Exercise[]
}

export interface ShadowingOptions {
  courses: CoursePack[]
  level: CEFRLevel
  state: UserState
  size?: number
  now?: Date
  random?: () => number
}

const CYRILLIC = /[Ѐ-ӿ]/

/**
 * The line has to survive being read out loud. Content sometimes glosses a word in
 * Russian inside the sentence ("That is my bag (там, далеко)."): that is for the eye.
 * Anything still Russian after the glosses are dropped is not a phrase to shadow.
 */
function sayable(text: string): string | null {
  const spoken = text.replace(/\s*\([^)]*[Ѐ-ӿ][^)]*\)/g, '').replace(/\s+/g, ' ').trim()
  return spoken && !CYRILLIC.test(spoken) ? spoken : null
}

/** "We ___ this film before." + "have seen" → a whole sentence worth saying. */
function filledGap(exercise: Exercise): string | undefined {
  const prompt = exercise.prompt ?? ''
  const option = exercise.correctOption ?? ''
  if (!option || !/_{2,}/.test(prompt)) return undefined
  const sentence = prompt.replace(/_{2,}/, option)
  // A second gap would leave the sentence unsayable, so it is left out entirely.
  return /_{2,}/.test(sentence) ? undefined : sentence
}

/** The English sentence hidden in an exercise, or null when it has none to say. */
export function shadowingPhrase(exercise: Exercise): ShadowingItem | null {
  const make = (text: string | undefined, gloss?: string): ShadowingItem | null => {
    const spoken = sayable(text ?? '')
    if (!spoken) return null
    const meaning = (gloss ?? '').trim()
    return { exerciseID: exercise.id, text: spoken, gloss: meaning || undefined }
  }
  switch (exercise.type) {
    case 'flashcard':
      return make(exercise.prompt, exercise.translation)
    case 'translate':
    case 'word_order':
      return make(exercise.canonicalAnswer, exercise.prompt)
    case 'multiple_choice':
      return make(filledGap(exercise))
    default:
      return null // a rule card has nothing to say out loud
  }
}

export const ShadowingEngine = {
  /** Every phrase the learner could shadow at this level and below. */
  pool(courses: CoursePack[], level: CEFRLevel): Exercise[] {
    return PracticeEngine.pool(courses, level).filter((exercise) => shadowingPhrase(exercise) !== null)
  },

  count(courses: CoursePack[], level: CEFRLevel): number {
    return this.pool(courses, level).length
  },

  build({ courses, level, state, size = DEFAULT_SIZE, now = new Date(), random = Math.random }: ShadowingOptions): ShadowingSet {
    const exercises = prioritise(this.pool(courses, level), state, now, random).slice(0, size)
    return { exercises, items: exercises.map((exercise) => shadowingPhrase(exercise)!) }
  },

  /** Speaking is slower than typing, so a set is short; it is never "completed". */
  lesson(exercises: Exercise[]): Lesson {
    return {
      id: SHADOWING_LESSON_ID,
      title: 'Вслух за диктором',
      summary: 'Слушай, повторяй, сравнивай.',
      estimatedMinutes: Math.max(2, exercises.length),
      exercises,
    }
  },
}
