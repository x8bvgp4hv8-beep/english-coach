import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { check, normalize } from './answer'
import { decodeCourse, decodePlacement } from './content'
import { CourseRouting, LevelOrder, PlacementScorer, PracticeLog, ProgressionEngine, ReviewEngine } from './engines'
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
