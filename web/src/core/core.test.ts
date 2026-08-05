import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { check, diffSummary, normalize } from './answer'
import { decodeCourse, decodePlacement } from './content'
import { SyllabusEngine, TopicProgressEngine, decodeSyllabus, unseenVocabulary } from './syllabus'
import { CourseRouting, LevelOrder, PlacementScorer, PracticeLog, ProgressionEngine, ReviewEngine } from './engines'
import { ListeningEngine, listeningPhrase } from './listening'
import { PracticeEngine, taughtCourses } from './practice'
import { LearningSession } from './session'
import { ShadowingEngine, shadowingPhrase } from './shadowing'
import { deserialize, serialize } from './storage'
import { LANGUAGE_CODES } from './language'
import { EXERCISE_TYPES, LEVELS, freshState } from './types'
import type { LanguageCode } from './language'
import type { CoursePack, Exercise, Lesson, PlacementBank } from './types'

/**
 * A port of native/Sources/EnglishCoachCoreTests/main.swift.
 * Same content, same assertions: if the two ever disagree, one of them is a bug.
 */

const contentDir = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'public', 'content')
const readJSON = (path: string) => JSON.parse(readFileSync(join(contentDir, path), 'utf8'))

/** One language's shipped content, decoded exactly the way the app decodes it. */
function readLanguage(language: LanguageCode) {
  const index = readJSON(`${language}/index.json`) as { courses: string[] }
  return {
    courses: index.courses.map((file) => decodeCourse(readJSON(`${language}/courses/${file}`))) as CoursePack[],
    placement: decodePlacement(readJSON(`${language}/placement.json`)),
    syllabus: decodeSyllabus(readJSON(`${language}/syllabus.json`)),
  }
}

// The engine tests below run on English, because they name English lessons and topics.
// Everything a second language must also satisfy lives in "each shipped language".
const courses: CoursePack[] = readLanguage('en').courses
const placement: PlacementBank = readLanguage('en').placement
const bank = placement.questions
const now = new Date(1_000_000)

const allExercises = (course: CoursePack): Exercise[] =>
  course.chapters.flatMap((chapter) => chapter.lessons).flatMap((lesson) => lesson.exercises)

describe('content decoding', () => {
  it('decodes a valid pack', () => {
    const valid = {
      schemaVersion: 1,
      level: 'A1',
      chapters: [
        {
          id: 'c',
          title: 'Chapter',
          lessons: [
            {
              id: 'l',
              title: 'Lesson',
              summary: 'Summary',
              estimatedMinutes: 5,
              exercises: [
                { id: 'e1', type: 'info', title: 'One' },
                { id: 'e2', type: 'translate', prompt: 'Я Алекс.', canonicalAnswer: 'I am Alex.' },
              ],
            },
          ],
        },
      ],
    }
    const course = decodeCourse(valid)
    expect(course.level).toBe('A1')
    expect(course.chapters[0].lessons[0].exercises).toHaveLength(2)
  })

  it('rejects duplicate IDs', () => {
    const duplicate = {
      schemaVersion: 1,
      level: 'A1',
      chapters: [
        {
          id: 'c',
          title: 'C',
          lessons: [
            {
              id: 'l',
              title: 'L',
              summary: 'S',
              estimatedMinutes: 5,
              exercises: [
                { id: 'same', type: 'info', title: 'One' },
                { id: 'same', type: 'info', title: 'Two' },
              ],
            },
          ],
        },
      ],
    }
    expect(() => decodeCourse(duplicate)).toThrowError(/duplicateID: same/)
  })

  it('rejects an unsupported schema version', () => {
    expect(() => decodeCourse({ schemaVersion: 2, level: 'A1', chapters: [] })).toThrowError(/unsupportedSchema/)
  })
})

describe('answer checking', () => {
  it('normalizes case, apostrophes and spacing', () => {
    expect(check("  I DON’T   know! ", "I don't know").isCorrect).toBe(true)
  })

  it('accepts an explicit alternative', () => {
    expect(check('I have not seen it', "I haven't seen it", ['I have not seen it']).isCorrect).toBe(true)
  })

  it('rejects an unknown alternative', () => {
    expect(check('Never saw it', "I haven't seen it").isCorrect).toBe(false)
  })

  it('forgives punctuation the learner did not type', () => {
    expect(check('What is your name ?', 'What is your name?').isCorrect).toBe(true)
    expect(check('However , this approach has drawbacks .', 'However, this approach has drawbacks.').isCorrect).toBe(true)
    expect(check('i work on monday', 'I work on Monday.').isCorrect).toBe(true)
  })

  it('treats a contraction and its expansion as the same answer', () => {
    expect(check("I'm a teacher", 'I am a teacher').verdict).toBe('correct')
    expect(check('I am a teacher', "I'm a teacher").verdict).toBe('correct')
    expect(check("She doesn't work here", 'She does not work here').verdict).toBe('correct')
    expect(check('He has got a car', "He's got a car").verdict).toBe('correct')
    expect(check('We cannot come', "We can't come").verdict).toBe('correct')
  })

  it('accepts British and American spelling of the same word', () => {
    expect(check('My favourite colour is grey', 'My favorite color is gray').verdict).toBe('correct')
    expect(check('I realized it', 'I realised it').verdict).toBe('correct')
  })

  it('counts a mistyped long word as a typo, not as a wrong answer', () => {
    const result = check('I go to the cinemaa every week', 'I go to the cinema every week')
    expect(result.verdict).toBe('typo')
    expect(result.isCorrect).toBe(true)
    expect(result.typo).toBe('cinema')
    expect(check('I bought a resturant meal', 'I bought a restaurant meal').verdict).toBe('typo')
  })

  it('never hides a grammar mistake behind typo tolerance', () => {
    // Tense, agreement, articles, prepositions and short words carry meaning.
    expect(check('He go to school', 'He goes to school').verdict).toBe('wrong')
    expect(check('She have a car', 'She has a car').verdict).toBe('wrong')
    expect(check('I am at the cinema', 'I am in the cinema').verdict).toBe('wrong')
    expect(check('I saw a cat', 'I saw the cat').verdict).toBe('wrong')
    expect(check('It is a cat', 'It is a cut').verdict).toBe('wrong')
    expect(check('I have two cat', 'I have two cats').verdict).toBe('wrong')
  })

  it('treats every inflection as grammar, not as a slip', () => {
    expect(check('I work yesterday', 'I worked yesterday').verdict).toBe('wrong')
    expect(check('I visited three city', 'I visited three cities').verdict).toBe('wrong')
    expect(check('She is walk home', 'She is walking home').verdict).toBe('wrong')
  })

  it('judges Spanish by Spanish rules', () => {
    expect(check('Soy de Lituania.', 'Soy de Lituania.', [], 'es').verdict).toBe('correct')
    expect(check('¿Cómo te llamas?', '¿Cómo te llamas?', [], 'es').verdict).toBe('correct')
    // A phone keyboard makes accents expensive, so a missing one costs the spelling,
    // not the answer — and the right form is shown.
    const accents = check('Como te llamas?', '¿Cómo te llamas?', [], 'es')
    expect(accents.verdict).toBe('typo')
    expect(accents.isCorrect).toBe(true)
    expect(accents.typo).toBe('¿Cómo te llamas?')
    // Endings carry person, number and gender: never a slip of the finger.
    expect(check('Yo hablo español', 'Yo hablas español', [], 'es').verdict).toBe('wrong')
    expect(check('Ella trabaja aquí', 'Ella trabajo aquí', [], 'es').verdict).toBe('wrong')
    expect(check('la casa blanco', 'la casa blanca', [], 'es').verdict).toBe('wrong')
    expect(check('Es mi amigo', 'Es mi amiga', [], 'es').verdict).toBe('wrong')
    // A real slip inside a long word still is one.
    expect(check('Vivo en el restaurnte', 'Vivo en el restaurante', [], 'es').verdict).toBe('typo')
    // Spain and Latin America say it differently and neither is a mistake.
    expect(check('Tengo un coche nuevo', 'Tengo un carro nuevo', [], 'es').verdict).toBe('correct')
    expect(check('Quiero un zumo', 'Quiero un jugo', [], 'es').verdict).toBe('correct')
    // English rules must not leak: `he` is a Spanish auxiliary, not a pronoun.
    expect(check('He comido', 'He comido', [], 'es').verdict).toBe('correct')
  })

  it('does not accept a different exercise as an answer', () => {
    // Property check over real content: loosening the matcher must not make
    // unrelated sentences interchangeable.
    const translations = courses
      .flatMap((course) => allExercises(course))
      .filter((e) => e.type === 'translate' && e.canonicalAnswer)
    let falsePositives = 0
    for (let i = 0; i < translations.length; i += 1) {
      const mine = translations[i].canonicalAnswer!
      for (const other of [translations[(i + 1) % translations.length], translations[(i + 7) % translations.length]]) {
        if (other.id === translations[i].id) continue
        if (check(other.canonicalAnswer!, mine).isCorrect) falsePositives += 1
      }
    }
    expect(falsePositives).toBe(0)
  })

  it('still accepts every canonical answer in the shipped content', () => {
    for (const course of courses) {
      for (const exercise of allExercises(course)) {
        if (exercise.type !== 'translate' && exercise.type !== 'word_order') continue
        const answer = exercise.canonicalAnswer!
        expect(check(answer, answer, exercise.acceptedAnswers ?? []).verdict, exercise.id).toBe('correct')
        for (const alternative of exercise.acceptedAnswers ?? []) {
          expect(check(alternative, answer, exercise.acceptedAnswers ?? []).verdict, `${exercise.id}: ${alternative}`).toBe('correct')
        }
      }
    }
  })

  it('stays quiet when the answer is nowhere near the target', () => {
    // Listing every word of the sentence is noise, not feedback.
    expect(diffSummary(check('complete nonsense here', 'I usually drink coffee in the morning').diff)).toBeNull()
    const close = diffSummary(check('I usually drink coffee morning', 'I usually drink coffee in the morning').diff)
    expect(close?.missing).toEqual(['in', 'the'])
  })

  it('says the order is wrong instead of listing the same words twice', () => {
    const summary = diffSummary(check('Monday I work on', 'I work on Monday.').diff)
    expect(summary?.orderOnly).toBe(true)
  })

  it('shows words the way they are written, not lower-cased', () => {
    const summary = diffSummary(check('I work', 'I work on Monday').diff)
    expect(summary?.missing).toEqual(['on', 'Monday'])
  })

  it('explains what is wrong instead of only printing the answer', () => {
    const result = check('I go cinema', 'I go to the cinema')
    expect(result.verdict).toBe('wrong')
    expect(result.diff?.filter((part) => part.kind === 'missing').map((part) => part.text)).toEqual(['to', 'the'])

    const extra = check('I go to the big cinema', 'I go to the cinema')
    expect(extra.diff?.filter((part) => part.kind === 'extra').map((part) => part.text)).toEqual(['big'])
  })
})

describe('routing and review scheduling', () => {
  const lessons: Lesson[] = [
    { id: 'one', title: 'One', summary: '', estimatedMinutes: 5, exercises: [] },
    { id: 'two', title: 'Two', summary: '', estimatedMinutes: 5, exercises: [] },
  ]

  it('recommends the first incomplete lesson', () => {
    expect(CourseRouting.nextLesson(lessons, new Set(['one']))?.id).toBe('two')
  })

  it('locks a lesson until the previous one is done', () => {
    expect(CourseRouting.isUnlocked(1, lessons, new Set())).toBe(false)
    expect(CourseRouting.isUnlocked(1, lessons, new Set(['one']))).toBe(true)
  })

  it('walks the 1 / 3 / 7 day ladder and resets on failure', () => {
    let item = ReviewEngine.newItem('e', now)
    item = ReviewEngine.recordSuccess(item, now)
    expect(item.intervalDays).toBe(1)
    item = ReviewEngine.recordSuccess(item, now)
    expect(item.intervalDays).toBe(3)
    item = ReviewEngine.recordSuccess(item, now)
    expect(item.intervalDays).toBe(7)
    item = ReviewEngine.recordFailure(item, now)
    expect(item.intervalDays).toBe(1)
    expect(item.repetitions).toBe(0)
  })
})

describe('bundled content', () => {
  it('covers A1-C1', () => {
    expect(new Set(courses.map((c) => c.level))).toEqual(new Set(LEVELS))
  })

  it.each(LEVELS)('%s covers every exercise type and has depth', (level) => {
    const course = courses.find((c) => c.level === level)!
    const exercises = allExercises(course)
    const types = new Set(exercises.map((e) => e.type))
    for (const type of EXERCISE_TYPES) expect(types).toContain(type)
    expect(exercises.length).toBeGreaterThanOrEqual(10)
    expect(course.chapters.flatMap((c) => c.lessons).length).toBeGreaterThanOrEqual(3)
  })

  it('every exercise is solvable in the app', () => {
    const sortedWords = (text: string) => normalize(text).split(' ').filter(Boolean).sort()
    for (const course of courses) {
      for (const exercise of allExercises(course)) {
        if (exercise.type === 'word_order') {
          expect(sortedWords((exercise.tokens ?? []).join(' ')), `${exercise.id}: tokens reconstruct answer`)
            .toEqual(sortedWords(exercise.canonicalAnswer ?? ''))
        } else if (exercise.type === 'multiple_choice') {
          expect(exercise.options ?? [], `${exercise.id}: correctOption is valid`).toContain(exercise.correctOption)
        } else if (exercise.type === 'translate') {
          expect(exercise.canonicalAnswer ?? '', `${exercise.id}: translate has an answer`).not.toBe('')
        }
      }
    }
  })
})

describe('learning session', () => {
  it('runs a lesson from first exercise to completion', () => {
    // Not by id: the opening chapter changes whenever the course does, and this test is
    // about the session, not about which lesson happens to come first.
    const course = courses.find((c) => c.level === 'A1')!
    const lesson = course.chapters.flatMap((c) => c.lessons)
      .find((item) => item.exercises.some((e) => e.type === 'translate'))!
    const firstTranslate = lesson.exercises.find((e) => e.type === 'translate')!
    const session = new LearningSession(freshState())
    session.start(lesson)
    expect(session.currentExercise?.id).toBe(lesson.exercises[0].id)

    while (session.currentExercise && session.currentExercise.id !== firstTranslate.id) {
      session.completePassiveExercise(now)
    }
    const wrong = session.submitText('wrong', now)
    expect(wrong.isCorrect).toBe(false)
    expect(session.state.reviews.some((r) => r.exerciseID === firstTranslate.id)).toBe(true)

    session.advance()
    while (!session.isComplete) session.completeCurrentCorrectly(now)
    expect(session.state.completedLessonIDs).toContain(lesson.id)
    expect(session.state.points).toBeGreaterThan(0)
  })

  it.each(LEVELS)('%s starter lesson completes offline', (level) => {
    const lesson = courses.find((c) => c.level === level)!.chapters[0].lessons[0]
    const session = new LearningSession(freshState())
    session.start(lesson)
    while (!session.isComplete) session.completeCurrentCorrectly(now)
    expect(session.state.completedLessonIDs).toContain(lesson.id)
  })

  it('lets the learner overrule the checker exactly once', () => {
    const lesson = courses[0].chapters[0].lessons[0]
    const translation = lesson.exercises.find((e) => e.type === 'translate')!
    const session = new LearningSession(freshState())
    session.start({ id: 'x', title: 'X', summary: '', estimatedMinutes: 1, exercises: [translation] })

    const rejected = session.submitText('my own perfectly fine phrasing', now)
    expect(rejected.isCorrect).toBe(false)
    expect(session.state.reviews).toHaveLength(1)

    session.markLastAnswerCorrect()
    expect(session.feedback?.isCorrect).toBe(true)
    expect(session.state.points).toBe(10)
    // Rescheduled as if the answer had been right, not just visually reverted: still on
    // the calendar, but on the calendar of something known.
    expect(session.state.reviews).toHaveLength(1)
    expect(session.state.reviews[0].repetitions).toBe(1)
    expect(session.state.reviews[0].due.getTime()).toBe(now.getTime() + 86_400_000)
    expect(session.state.attempts.at(-1)?.correct).toBe(true)

    // And the phrasing is accepted from now on, in this and in any later session.
    const later = new LearningSession(session.state)
    later.start({ id: 'y', title: 'Y', summary: '', estimatedMinutes: 1, exercises: [translation] })
    expect(later.submitText('my own perfectly fine phrasing', now).isCorrect).toBe(true)
  })

  it('reads a card the first time and asks for it every time after', () => {
    const card = allExercises(courses[0]).find((e) => e.type === 'flashcard')!
    const lesson = { id: 'cards', title: 'Cards', summary: '', estimatedMinutes: 1, exercises: [card] }

    const first = new LearningSession(freshState())
    first.start(lesson, { recordsCompletion: false })
    expect(first.currentIsRecall, 'a card never met is shown, not asked').toBe(false)
    first.completePassiveExercise(now)

    const again = new LearningSession(first.state)
    again.start(lesson, { recordsCompletion: false })
    expect(again.currentIsRecall, 'the same card met again is a question').toBe(true)
  })

  it('sends a forgotten card back instead of counting it as known', () => {
    const card = allExercises(courses[0]).find((e) => e.type === 'flashcard')!
    const lesson = { id: 'cards', title: 'Cards', summary: '', estimatedMinutes: 1, exercises: [card] }

    // Reading the card once schedules it, like any other answer.
    const first = new LearningSession(freshState())
    first.start(lesson, { recordsCompletion: false })
    first.completePassiveExercise(now)
    expect(first.state.reviews.find((r) => r.exerciseID === card.id)!.repetitions).toBe(1)

    // "Не вспомнил" collapses the interval instead of letting the word keep climbing —
    // which is the whole point: a passive card claimed a success nobody had earned.
    const second = new LearningSession(first.state)
    second.start(lesson, { recordsCompletion: false })
    second.selfAssess(false, now)
    const missed = second.state.reviews.find((r) => r.exerciseID === card.id)!
    expect(missed.repetitions).toBe(0)
    expect(missed.intervalDays).toBe(1)
    expect(second.state.attempts.at(-1)?.correct).toBe(false)

    // "Вспомнил" counts exactly like any other correct answer and stretches it again.
    const pointsBefore = second.state.points
    const third = new LearningSession(second.state)
    third.start(lesson, { recordsCompletion: false })
    third.selfAssess(true, now)
    expect(third.state.reviews.find((r) => r.exerciseID === card.id)!.repetitions).toBe(1)
    expect(third.state.points).toBeGreaterThan(pointsBefore)
  })

  it('does not turn a card into a question halfway through the set', () => {
    const card = allExercises(courses[0]).find((e) => e.type === 'flashcard')!
    const session = new LearningSession(freshState())
    session.start({ id: 'cards', title: 'Cards', summary: '', estimatedMinutes: 1, exercises: [card, card] })
    session.completePassiveExercise(now)
    session.goBack()
    // The attempt exists now, but the snapshot was taken when the set opened.
    expect(session.currentIsRecall).toBe(false)
  })

  it('schedules every answer, and stretches the interval as it keeps being right', () => {
    const lesson = courses[0].chapters[0].lessons[0]
    const translation = lesson.exercises.find((e) => e.type === 'translate')!
    const set = { id: 'review', title: 'Review', summary: '', estimatedMinutes: 1, exercises: [translation] }

    // A correct answer is scheduled too. Before this only mistakes were, so anything
    // answered right the first time was never checked again.
    const first = new LearningSession(freshState())
    first.start(set, { recordsCompletion: false })
    first.submitText(translation.canonicalAnswer!, now)
    expect(first.state.reviews).toHaveLength(1)
    expect(first.state.reviews[0].intervalDays).toBe(1)

    // 1 → 3 → 7 days as it keeps coming back right.
    const second = new LearningSession(first.state)
    second.start(set, { recordsCompletion: false })
    second.submitText(translation.canonicalAnswer!, now)
    expect(second.state.reviews[0].intervalDays).toBe(3)

    // And a miss collapses it back to a day, whatever it had grown to.
    const third = new LearningSession(second.state)
    third.start(set, { recordsCompletion: false })
    third.submitText('wrong', now)
    expect(third.state.reviews[0].intervalDays).toBe(1)
    expect(third.state.reviews[0].repetitions).toBe(0)
  })

  it('caps one sitting of repetitions and takes the longest waiting first', () => {
    const day = 86_400_000
    const reviews = Array.from({ length: 30 }, (_, i) => ({
      ...ReviewEngine.newItem(`e${i}`, now),
      due: new Date(now.getTime() - i * day),
    }))
    const notYet = { ...ReviewEngine.newItem('later', now), due: new Date(now.getTime() + day) }

    const due = ReviewEngine.due([...reviews, notYet], now)
    expect(due).toHaveLength(ReviewEngine.sessionSize)
    expect(due[0].exerciseID).toBe('e29')
    expect(due.some((item) => item.exerciseID === 'later')).toBe(false)
  })
})

describe('placement', () => {
  it('is well formed', () => {
    expect(bank.length).toBeGreaterThanOrEqual(10)
    expect(new Set(bank.map((q) => q.level))).toEqual(new Set(LEVELS))
    expect(bank.every((q) => q.options.includes(q.correctOption))).toBe(true)
  })

  it('places the learner where they start to struggle', () => {
    const allIDs = new Set(bank.map((q) => q.id))
    expect(PlacementScorer.recommend(bank, allIDs)).toBe('C1')
    expect(PlacementScorer.recommend(bank, new Set())).toBe('A1')
    const throughA2 = new Set(bank.filter((q) => q.level === 'A1' || q.level === 'A2').map((q) => q.id))
    expect(PlacementScorer.recommend(bank, throughA2)).toBe('B1')
  })

  it('stops as soon as the level is decided', () => {
    const a1 = new Set(bank.filter((q) => q.level === 'A1').map((q) => q.id))
    const throughA2 = new Set(bank.filter((q) => q.level === 'A1' || q.level === 'A2').map((q) => q.id))
    const allIDs = new Set(bank.map((q) => q.id))
    const partialA2 = new Set([...a1, ...bank.filter((q) => q.level === 'A2').slice(0, 2).map((q) => q.id)])

    expect(PlacementScorer.isDecided(bank, new Set(), new Set())).toBe(false)
    expect(PlacementScorer.isDecided(bank, a1, new Set())).toBe(true)
    expect(PlacementScorer.isDecided(bank, a1, a1)).toBe(false)
    expect(PlacementScorer.isDecided(bank, throughA2, a1)).toBe(true)
    expect(PlacementScorer.isDecided(bank, allIDs, allIDs)).toBe(true)
    expect(PlacementScorer.isDecided(bank, partialA2, a1)).toBe(false)
  })
})

describe('endless practice', () => {
  // Deterministic shuffling so the assertions are about the ordering rules, not luck.
  const seeded = () => {
    let seed = 42
    return () => {
      seed = (seed * 1103515245 + 12345) % 2147483648
      return seed / 2147483648
    }
  }

  it('never offers rule cards and never runs out', () => {
    const state = freshState()
    const set = PracticeEngine.build({ courses, level: 'B1', state, size: 25, random: seeded() })
    expect(set).toHaveLength(25)
    expect(set.some((e) => e.type === 'info')).toBe(false)
    expect(new Set(set.map((e) => e.id)).size).toBe(25)
  })

  it('draws only from the current level and below', () => {
    const set = PracticeEngine.build({ courses, level: 'A2', state: freshState(), size: 40, random: seeded() })
    const a1a2 = new Set([...ProgressionEngine.exerciseIDs('A1', courses), ...ProgressionEngine.exerciseIDs('A2', courses)])
    expect(set.every((e) => a1a2.has(e.id))).toBe(true)
  })

  it('puts due repetitions first, then old mistakes', () => {
    const state = freshState()
    const pool = PracticeEngine.pool(courses, 'A1')
    const dueExercise = pool[5]
    const failedExercise = pool[9]
    state.reviews = [{ ...ReviewEngine.newItem(dueExercise.id, now), due: new Date(now.getTime() - 86_400_000) }]
    state.attempts = [
      { id: '1', exerciseID: failedExercise.id, correct: false, date: now },
      { id: '2', exerciseID: pool[0].id, correct: true, date: now },
    ]

    const set = PracticeEngine.build({ courses, level: 'A1', state, size: 5, now, random: seeded() })
    expect(set[0].id).toBe(dueExercise.id)
    expect(set[1].id).toBe(failedExercise.id)
    // An exercise already answered correctly is not repeated while unseen ones remain.
    expect(set.slice(2).some((e) => e.id === pool[0].id)).toBe(false)
  })

  it('offers a single kind when the menu asks for one', () => {
    const cards = PracticeEngine.build({ courses, level: 'B1', state: freshState(), types: ['flashcard'], size: 12, random: seeded() })
    expect(cards.length).toBeGreaterThan(0)
    expect(cards.every((e) => e.type === 'flashcard')).toBe(true)

    const counts = PracticeEngine.counts(courses, 'A1')
    expect(counts.mixed).toBe(PracticeEngine.pool(courses, 'A1').length)
    expect(counts.translate).toBeGreaterThan(0)
    expect(counts.translate).toBeLessThan(counts.mixed)
  })

  it('only draws from lessons the learner has finished', () => {
    const a1 = courses.find((c) => c.level === 'A1')!
    const lessons = a1.chapters.flatMap((chapter) => chapter.lessons)

    // Day one: nothing has been taught, so there is nothing to practise. Before this the
    // first tap handed out the future tense from the last chapter of the level.
    expect(taughtCourses(courses, 'A1', new Set())).toHaveLength(0)
    expect(PracticeEngine.pool(taughtCourses(courses, 'A1', new Set()), 'A1')).toHaveLength(0)

    // After two lessons, practice is those two lessons and nothing else.
    const done = new Set([lessons[0].id, lessons[1].id])
    const reachable = new Set([...lessons[0].exercises, ...lessons[1].exercises].map((e) => e.id))
    const set = PracticeEngine.build({
      courses: taughtCourses(courses, 'A1', done), level: 'A1', state: freshState(), size: 40, random: seeded(),
    })
    expect(set.length).toBeGreaterThan(0)
    expect(set.every((e) => reachable.has(e.id))).toBe(true)

    // Shadowing and listening ride on the same pool, so they inherit the same limit.
    const spoken = ShadowingEngine.build({ courses: taughtCourses(courses, 'A1', done), level: 'A1', state: freshState(), size: 20, random: seeded() })
    expect(spoken.exercises.every((e) => reachable.has(e.id))).toBe(true)
  })

  it('keeps the levels below the current one open in full', () => {
    // Placement can drop someone straight into B1: A1 and A2 are the claim that put them
    // there, and locking them behind lessons nobody will replay would empty practice.
    const trimmed = taughtCourses(courses, 'B1', new Set())
    expect(trimmed.map((c) => c.level)).toEqual(['A1', 'A2'])
    const pool = PracticeEngine.pool(trimmed, 'B1')
    const below = new Set([...ProgressionEngine.exerciseIDs('A1', courses), ...ProgressionEngine.exerciseIDs('A2', courses)])
    expect(pool.length).toBeGreaterThan(0)
    expect(pool.every((e) => below.has(e.id))).toBe(true)
  })

  it('does not mark a synthetic lesson as a completed lesson', () => {
    const set = PracticeEngine.build({ courses, level: 'A1', state: freshState(), size: 3, random: seeded() })
    const session = new LearningSession(freshState())
    session.start(PracticeEngine.lesson(set), { recordsCompletion: false })
    while (!session.isComplete) session.completeCurrentCorrectly(now)
    expect(session.state.completedLessonIDs).toHaveLength(0)
    expect(session.state.points).toBeGreaterThan(0)
  })
})

describe('syllabus', () => {
  const syllabus = readLanguage('en').syllabus

  it('is well formed and covers every level', () => {
    expect(syllabus.topics.length).toBeGreaterThan(20)
    expect(new Set(syllabus.topics.map((t) => t.level))).toEqual(new Set(LEVELS))
  })

  it('is the only vocabulary content may tag itself with', () => {
    // A typo in a pack would silently create a topic nobody teaches and nobody counts.
    expect(SyllabusEngine.unknownTopics(syllabus, courses)).toEqual([])
    for (const course of courses) {
      for (const exercise of allExercises(course)) {
        expect(exercise.topics ?? [], `${exercise.id}: has at least one topic`).not.toHaveLength(0)
      }
    }
  })

  /**
   * The ratchet. The content is knowingly short of the syllabus today, so the test does
   * not demand a full course; it demands that the shortfall never grows. Filling a topic
   * lowers the ceiling in syllabus.json, and it can never go back up by accident.
   */
  it('does not let the coverage debt grow', () => {
    const gaps = SyllabusEngine.gaps(syllabus, courses)
    const report = gaps.map((g) => `${g.topic.level} ${g.topic.id} ${g.exercises}/${g.topic.minExercises}`).join('\n')
    expect(gaps.length, `тем без покрытия стало больше:\n${report}`).toBeLessThanOrEqual(syllabus.coverageDebtCeiling)
  })

  it('trains one topic on request', () => {
    const set = PracticeEngine.build({
      courses, level: 'B1', state: freshState(), topics: ['b1-past-perfect'], size: 6,
    })
    expect(set.length).toBeGreaterThan(0)
    expect(set.every((e) => (e.topics ?? []).includes('b1-past-perfect'))).toBe(true)
  })

  it('turns attempts into a picture of what is weak', () => {
    const pool = PracticeEngine.pool(courses, 'B1', undefined, ['b1-past-perfect'])
    const state = freshState()
    // Four goes at Past Perfect, one right; a single slip on Present Perfect.
    state.attempts = [
      ...pool.slice(0, 4).map((e, i) => ({ id: `p${i}`, exerciseID: e.id, correct: i === 0, date: now })),
      { id: 'x', exerciseID: PracticeEngine.pool(courses, 'B1', undefined, ['b1-present-perfect'])[0].id, correct: false, date: now },
    ]

    const weak = TopicProgressEngine.weak(syllabus, courses, state, 'B1')
    expect(weak[0].topic.id).toBe('b1-past-perfect')
    expect(weak[0].attempts).toBe(4)
    expect(weak[0].accuracy).toBeCloseTo(0.25)
    // One attempt is not an opinion, so Present Perfect is not called weak yet.
    expect(weak.some((w) => w.topic.id === 'b1-present-perfect')).toBe(false)

    const all = TopicProgressEngine.all(syllabus, courses, state, 'B1')
    expect(all.every((item) => LEVELS.indexOf(item.topic.level) <= LEVELS.indexOf('B1'))).toBe(true)
    expect(all.every((item) => item.exercises > 0)).toBe(true)
    expect(TopicProgressEngine.untouched(syllabus, courses, state, 'B1').length).toBeLessThan(all.length)
  })

  it('counts practice, not rule cards', () => {
    const counts = SyllabusEngine.counts(courses)
    const info = allExercises(courses[0]).find((e) => e.type === 'info')!
    expect(info.topics?.length).toBeGreaterThan(0)
    // The card carries the topic so a rule can be found, but it is not practice.
    const onlyInfoTopic = (info.topics ?? [])[0]
    const practice = allExercises(courses[0]).filter((e) => e.type !== 'info' && (e.topics ?? []).includes(onlyInfoTopic))
    expect(counts[onlyInfoTopic]).toBe(practice.length)
  })
})

describe('shadowing', () => {
  const seeded = () => {
    let seed = 7
    return () => {
      seed = (seed * 1103515245 + 12345) % 2147483648
      return seed / 2147483648
    }
  }
  const cyrillic = /[Ѐ-ӿ]/

  it('offers only sayable English, from every level', () => {
    for (const level of LEVELS) {
      const pool = ShadowingEngine.pool(courses, level)
      expect(pool.length, `${level} has phrases to shadow`).toBeGreaterThan(0)
      for (const exercise of pool) {
        const item = shadowingPhrase(exercise)!
        expect(item.text, `${exercise.id}: says something`).not.toBe('')
        // The learner reads this line out loud: a Russian prompt or a bare gap would be unsayable.
        expect(cyrillic.test(item.text), `${exercise.id}: the spoken line is English`).toBe(false)
        expect(item.text, `${exercise.id}: no gap left in the sentence`).not.toMatch(/_{2,}/)
      }
    }
  })

  it('keeps the Russian meaning as the gloss, never as the line to say', () => {
    const flashcard = allExercises(courses[0]).find((e) => e.type === 'flashcard')!
    expect(shadowingPhrase(flashcard)).toEqual({
      exerciseID: flashcard.id, text: flashcard.prompt, gloss: flashcard.translation,
    })

    const translate = allExercises(courses[0]).find((e) => e.type === 'translate')!
    const item = shadowingPhrase(translate)!
    expect(item.text).toBe(translate.canonicalAnswer)
    expect(item.gloss).toBe(translate.prompt)
  })

  it('turns a gap-fill into a whole sentence and skips what cannot be said', () => {
    expect(shadowingPhrase({ id: 'g', type: 'multiple_choice', prompt: 'We ___ this film before.', correctOption: 'have seen' })?.text)
      .toBe('We have seen this film before.')
    // Two gaps cannot be filled from one option, so the phrase is left out.
    expect(shadowingPhrase({ id: 'g2', type: 'multiple_choice', prompt: 'We ___ it ___ .', correctOption: 'have' })).toBeNull()
    expect(shadowingPhrase({ id: 'g3', type: 'multiple_choice', prompt: 'Which is correct?', correctOption: 'this' })).toBeNull()
    expect(shadowingPhrase({ id: 'i', type: 'info', explanation: 'Правило' })).toBeNull()
  })

  it('drops a Russian gloss that sits inside the sentence', () => {
    // Real content: "That is ___ bag (там, далеко)." — the hint is for the eye, not the mouth.
    expect(shadowingPhrase({ id: 'h', type: 'flashcard', prompt: 'That is my bag (там, далеко).', translation: 'Вон та сумка моя.' })?.text)
      .toBe('That is my bag.')
    expect(shadowingPhrase({ id: 'h2', type: 'flashcard', prompt: 'Совсем русская строка', translation: 'x' })).toBeNull()
  })

  it('puts due repetitions first, then old mistakes', () => {
    const state = freshState()
    const pool = ShadowingEngine.pool(courses, 'A1')
    state.reviews = [{ ...ReviewEngine.newItem(pool[4].id, now), due: new Date(now.getTime() - 86_400_000) }]
    state.attempts = [{ id: '1', exerciseID: pool[7].id, correct: false, date: now }]

    const set = ShadowingEngine.build({ courses, level: 'A1', state, size: 5, now, random: seeded() })
    expect(set.exercises[0].id).toBe(pool[4].id)
    expect(set.exercises[1].id).toBe(pool[7].id)
    // Items and exercises stay aligned: the screen reads one, the session records the other.
    expect(set.items.map((item) => item.exerciseID)).toEqual(set.exercises.map((e) => e.id))
  })

  it('records the learner\'s own verdict as an attempt and a repetition', () => {
    const set = ShadowingEngine.build({ courses, level: 'A1', state: freshState(), size: 2, now, random: seeded() })
    const session = new LearningSession(freshState())
    session.start(ShadowingEngine.lesson(set.exercises), { recordsCompletion: false })

    session.selfAssess(true, now)
    expect(session.state.points).toBe(10)
    expect(session.state.attempts.at(-1)?.correct).toBe(true)

    session.selfAssess(false, now)
    const failed = session.state.reviews.find((r) => r.exerciseID === set.exercises[1].id)
    expect(failed, 'a phrase that did not come out comes back').toBeTruthy()
    // Like any miss, it drops to a one-day interval — and `prioritise` also puts it in
    // the "old mistakes" bucket, so it is back in the very next set regardless.
    expect(failed!.intervalDays).toBe(1)
    expect(failed!.repetitions).toBe(0)

    expect(session.isComplete).toBe(true)
    expect(session.state.completedLessonIDs).toHaveLength(0)
  })
})

describe('listening', () => {
  const seeded = () => {
    let seed = 11
    return () => {
      seed = (seed * 1103515245 + 12345) % 2147483648
      return seed / 2147483648
    }
  }

  it('offers whole sentences at every level, never a fragment', () => {
    for (const level of LEVELS) {
      const pool = ListeningEngine.pool(courses, level)
      // Eight per set: a level with fewer than that would run out mid-drill.
      expect(pool.length, `${level} has enough to listen to`).toBeGreaterThanOrEqual(8)
      for (const exercise of pool) {
        const item = listeningPhrase(exercise)!
        // The learner writes this down, so it has to be a whole sentence: an opener
        // leading nowhere and a collocation card are both unwritable.
        expect(item.text, `${exercise.id}: not a sentence opener`).not.toContain('…')
        expect(item.text, `${exercise.id}: reads as a sentence`).toMatch(/^[A-Z].*[.!?]$/)
        expect(item.text.split(/\s+/).length, `${exercise.id}: long enough to carry structure`).toBeGreaterThanOrEqual(3)
      }
    }
  })

  it('drops what shadowing would still say out loud', () => {
    // Fine to repeat aloud, impossible to write down: there is no rest of the sentence.
    const opener: Exercise = { id: 'o', type: 'flashcard', prompt: 'From my perspective…', translation: 'С моей точки зрения…' }
    expect(shadowingPhrase(opener)).not.toBeNull()
    expect(listeningPhrase(opener)).toBeNull()

    const short: Exercise = { id: 's', type: 'flashcard', prompt: 'Thank you.', translation: 'Спасибо.' }
    expect(shadowingPhrase(short)).not.toBeNull()
    expect(listeningPhrase(short), 'two words is vocabulary, not listening').toBeNull()

    // Real content: collocations ship as cards. Three words, and still nothing to write
    // down — "on the weekend" is a guess about the sentence it was cut out of.
    const chunk: Exercise = { id: 'c', type: 'flashcard', prompt: 'on the weekend', translation: 'на выходных' }
    expect(shadowingPhrase(chunk)).not.toBeNull()
    expect(listeningPhrase(chunk), 'a collocation card is not a sentence').toBeNull()
  })

  it('checks against the sentence that was played, not the exercise answer', () => {
    // A gap fill is played whole, so its own canonical answer ("have seen") is not what
    // the learner heard and must not be what the answer is compared with.
    const gap: Exercise = {
      id: 'g', type: 'multiple_choice', prompt: 'We ___ this film before.',
      correctOption: 'have seen', canonicalAnswer: 'have seen',
    }
    const item = listeningPhrase(gap)!
    expect(item.text).toBe('We have seen this film before.')

    const session = new LearningSession(freshState())
    session.start(ListeningEngine.lesson([gap]), { recordsCompletion: false })
    const result = session.submitHeard('we have seen this film before', item.text, now)
    expect(result.isCorrect).toBe(true)
    expect(session.state.points).toBe(10)
  })

  it('names the words the ear let through, and books a repetition', () => {
    const set = ListeningEngine.build({ courses, level: 'B1', state: freshState(), size: 2, now, random: seeded() })
    expect(set.items.map((item) => item.exerciseID)).toEqual(set.exercises.map((e) => e.id))

    const session = new LearningSession(freshState())
    session.start(ListeningEngine.lesson(set.exercises), { recordsCompletion: false })
    const result = session.submitHeard('She has finished work.', 'She has already finished work.', now)
    expect(result.isCorrect).toBe(false)
    expect(diffSummary(result.diff)?.missing).toEqual(['already'])

    const missed = session.state.reviews.find((r) => r.exerciseID === set.exercises[0].id)
    expect(missed, 'a sentence that did not come through comes back').toBeTruthy()
  })

  it('treats "не разобрал" as a miss rather than a free pass', () => {
    const set = ListeningEngine.build({ courses, level: 'A1', state: freshState(), size: 1, now, random: seeded() })
    const session = new LearningSession(freshState())
    session.start(ListeningEngine.lesson(set.exercises), { recordsCompletion: false })

    const result = session.submitHeard('', set.items[0].text, now)
    expect(result.isCorrect).toBe(false)
    // The sentence is still handed back, so the reveal has something to show.
    expect(result.canonical).toBe(set.items[0].text)
    expect(session.state.points).toBe(0)
  })
})

describe('progression', () => {
  it('detects completion, accuracy and the move-up moment', () => {
    const a1Lessons = ProgressionEngine.lessons('A1', courses)
    expect(a1Lessons.length).toBeGreaterThan(0)
    const done = new Set(a1Lessons.map((l) => l.id))
    expect(ProgressionEngine.isLevelComplete('A1', courses, done)).toBe(true)
    expect(ProgressionEngine.isLevelComplete('A1', courses, new Set())).toBe(false)

    const goodAttempts = [...ProgressionEngine.exerciseIDs('A1', courses)].map((id) => ({
      id, exerciseID: id, correct: true, date: now,
    }))
    expect(ProgressionEngine.shouldSuggestAdvance('A1', courses, done, goodAttempts, new Set())).toBe(true)
    expect(ProgressionEngine.shouldSuggestAdvance('A1', courses, done, goodAttempts, new Set(['A1']))).toBe(false)
    expect(LevelOrder.next('A1')).toBe('A2')
    expect(LevelOrder.next('C1')).toBeNull()
  })
})

describe('daily practice log', () => {
  const day = new Date(1_753_000_000_000)
  const nextDay = new Date(day.getTime() + 26 * 3600 * 1000)

  it('accumulates within a day and does not leak into the next', () => {
    let log = PracticeLog.adding(240, undefined, day)
    log = PracticeLog.adding(200, log, day)
    expect(PracticeLog.minutes(log, day)).toBe(7)
    expect(PracticeLog.minutes(log, nextDay)).toBe(0)
  })

  it('caps a forgotten tab at 30 minutes and ignores negative time', () => {
    expect(PracticeLog.minutes(PracticeLog.adding(10 * 3600, undefined, day), day)).toBe(30)
    expect(PracticeLog.adding(-5, undefined, day)).toEqual({})
  })
})

describe('progress storage', () => {
  it('round trips through JSON with dates intact', () => {
    const state = freshState()
    state.profile = { selectedLevel: 'B1', dailyGoalMinutes: 10, reminderHour: 19, reminderMinute: 0, remindersEnabled: true }
    state.completedLessonIDs = ['a1-intro', 'b1-experiences']
    state.attempts = [{ id: 'x', exerciseID: 'e', correct: false, date: now }]
    state.reviews = [ReviewEngine.newItem('e', now)]
    state.points = 40

    const loaded = deserialize(serialize(state))
    expect(loaded).toEqual(state)
    expect(loaded.attempts[0].date).toBeInstanceOf(Date)
    expect(loaded.reviews[0].due.getTime()).toBe(now.getTime())
  })
})

/**
 * Whatever is true of the app has to be true of every language it ships, not only of
 * the one it was written for. A new language passes here or it does not ship.
 */
describe.each(LANGUAGE_CODES)('each shipped language: %s', (language) => {
  const { courses: packs, placement: bank, syllabus } = readLanguage(language)

  it('ships a course for every level', () => {
    expect(new Set(packs.map((pack) => pack.level))).toEqual(new Set(LEVELS))
    for (const pack of packs) {
      expect(pack.chapters.length, `${pack.level}: has chapters`).toBeGreaterThan(0)
      for (const exercise of allExercises(pack)) {
        expect(EXERCISE_TYPES).toContain(exercise.type)
        if (exercise.type === 'translate') expect(exercise.canonicalAnswer, exercise.id).toBeTruthy()
        if (exercise.type === 'multiple_choice') expect(exercise.options, exercise.id).toContain(exercise.correctOption)
        if (exercise.type === 'word_order') {
          // The tray must be able to build the answer, or the exercise cannot be solved.
          const tray = normalize((exercise.tokens ?? []).join(' '), language).split(' ').sort()
          expect(tray, exercise.id).toEqual(normalize(exercise.canonicalAnswer ?? '', language).split(' ').sort())
        }
      }
    }
  })

  it('tests every level in the placement bank', () => {
    expect(new Set(bank.questions.map((question) => question.level))).toEqual(new Set(LEVELS))
  })

  it('keeps content and syllabus in one vocabulary', () => {
    expect(syllabus.topics.length).toBeGreaterThan(20)
    expect(new Set(syllabus.topics.map((topic) => topic.level))).toEqual(new Set(LEVELS))
    expect(SyllabusEngine.unknownTopics(syllabus, packs)).toEqual([])
    for (const pack of packs) {
      for (const exercise of allExercises(pack)) {
        expect(exercise.topics ?? [], `${exercise.id}: has at least one topic`).not.toHaveLength(0)
      }
    }
  })

  it('does not let the coverage debt grow', () => {
    const gaps = SyllabusEngine.gaps(syllabus, packs)
    const report = gaps.map((gap) => `${gap.topic.level} ${gap.topic.id} ${gap.exercises}/${gap.topic.minExercises}`).join('\n')
    expect(gaps.length, `тем без покрытия стало больше:\n${report}`).toBeLessThanOrEqual(syllabus.coverageDebtCeiling)
  })

  /**
   * Готовность к заданию, а не только наличие темы: перевод не должен требовать слов,
   * которых курс ещё не показывал. Для A1 это не долг, а условие — человек приходит
   * с нуля, и первое же «напиши Soy de Lituania» его останавливает.
   */
  it('never asks a beginner to produce what it has not taught', () => {
    const a1 = packs.filter((pack) => pack.level === 'A1')
    const debt = unseenVocabulary(a1)
    const report = debt.map((item) => `${item.exerciseID}: ${item.words.join(', ')}`).join('\n')
    expect(debt.length, `A1 требует неизученных слов:\n${report}`).toBe(0)
  })

  it('does not let the vocabulary debt grow', () => {
    const debt = unseenVocabulary(packs)
    const ceiling = syllabus.vocabularyDebtCeiling ?? 0
    const report = debt.slice(0, 10).map((item) => `${item.exerciseID}: ${item.words.join(', ')}`).join('\n')
    expect(debt.length, `переводов с неизученными словами стало больше (${debt.length} > ${ceiling}):\n${report}`).toBeLessThanOrEqual(ceiling)
  })

  it('can run a lesson end to end in this language', () => {
    const lesson = packs[0].chapters[0].lessons[0]
    const session = new LearningSession(freshState(), language)
    session.start(lesson)
    while (!session.isComplete) {
      const exercise = session.currentExercise!
      if (exercise.type === 'multiple_choice') session.submitChoice(exercise.correctOption ?? '')
      else if (exercise.canonicalAnswer) session.submitText(exercise.canonicalAnswer)
      else session.completePassiveExercise()
      if (!session.isComplete && session.feedback) session.advance()
    }
    expect(session.state.points).toBeGreaterThan(0)
    expect(session.state.completedLessonIDs).toContain(lesson.id)
  })
})
