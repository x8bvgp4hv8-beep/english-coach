import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { check, diffSummary, normalize } from './answer'
import { decodeCourse, decodePlacement } from './content'
import { CourseRouting, LevelOrder, PlacementScorer, PracticeLog, ProgressionEngine, ReviewEngine } from './engines'
import { PracticeEngine } from './practice'
import { LearningSession } from './session'
import { deserialize, serialize } from './storage'
import { EXERCISE_TYPES, LEVELS, freshState } from './types'
import type { CoursePack, Exercise, Lesson, PlacementBank } from './types'

/**
 * A port of native/Sources/EnglishCoachCoreTests/main.swift.
 * Same content, same assertions: if the two ever disagree, one of them is a bug.
 */

const contentDir = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'public', 'content')
const readJSON = (path: string) => JSON.parse(readFileSync(join(contentDir, path), 'utf8'))

const index = readJSON('index.json') as { courses: string[] }
const courses: CoursePack[] = index.courses.map((file) => decodeCourse(readJSON(`courses/${file}`)))
const placement: PlacementBank = decodePlacement(readJSON('placement.json'))
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
    const course = courses.find((c) => c.level === 'A1')!
    const lesson = course.chapters[0].lessons[0]
    const session = new LearningSession(freshState())
    session.start(lesson)
    expect(session.currentExercise?.id).toBe('a1-info-1')

    session.completePassiveExercise(now)
    session.completePassiveExercise(now)
    const wrong = session.submitText('wrong', now)
    expect(wrong.isCorrect).toBe(false)
    expect(session.state.reviews.some((r) => r.exerciseID === 'a1-translate-1')).toBe(true)

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
    // The penalty this answer caused is undone, not just visually reverted.
    expect(session.state.reviews).toHaveLength(0)
    expect(session.state.attempts.at(-1)?.correct).toBe(true)

    // And the phrasing is accepted from now on, in this and in any later session.
    const later = new LearningSession(session.state)
    later.start({ id: 'y', title: 'Y', summary: '', estimatedMinutes: 1, exercises: [translation] })
    expect(later.submitText('my own perfectly fine phrasing', now).isCorrect).toBe(true)
  })

  it('moves the due date forward after a successful review', () => {
    const lesson = courses[0].chapters[0].lessons[0]
    const translation = lesson.exercises.find((e) => e.type === 'translate')!
    const session = new LearningSession(freshState())
    session.start({ id: 'review', title: 'Review', summary: '', estimatedMinutes: 1, exercises: [translation] })
    session.submitText('wrong', now)
    const firstDue = session.state.reviews[0].due
    session.retry()
    session.submitText(translation.canonicalAnswer!, now)
    expect(session.state.reviews[0].due.getTime()).toBeGreaterThan(firstDue.getTime())
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

  it('does not mark a synthetic lesson as a completed lesson', () => {
    const set = PracticeEngine.build({ courses, level: 'A1', state: freshState(), size: 3, random: seeded() })
    const session = new LearningSession(freshState())
    session.start(PracticeEngine.lesson(set), { recordsCompletion: false })
    while (!session.isComplete) session.completeCurrentCorrectly(now)
    expect(session.state.completedLessonIDs).toHaveLength(0)
    expect(session.state.points).toBeGreaterThan(0)
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
