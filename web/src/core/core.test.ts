import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { check, diffSummary, normalize } from './answer'
import { decodeCourse, decodePlacement } from './content'
import { SyllabusEngine, TopicProgressEngine, decodeSyllabus, unseenVocabulary } from './syllabus'
import { CourseRouting, LevelOrder, PaceLog, PlacementScorer, PracticeLog, ProgressionEngine, ReviewEngine } from './engines'
import { ListeningEngine, listeningPhrase } from './listening'
import { PRACTICE_MODES, modeStates } from './modes'
import { PRACTICE_KINDS, PracticeEngine, prioritise, taughtCourses } from './practice'
import { LearningSession } from './session'
import { HearingEngine, HEARING_OPTIONS } from './hearing'
import { PAIRS_IN_ROUND, PairsEngine } from './pairs'
import { PICTURE_OPTIONS, PictureEngine, decodePictures, pictureFor, pictureURL } from './pictures'
import { ShadowingEngine, shadowingPhrase } from './shadowing'
import { hasSpanishVerb } from './spanish'
import { StudyEngine, decodeTheory } from './theory'
import { VocabularyEngine, vocabularyUnit } from './vocabulary'
import { VerbFormsEngine, formIsCorrect, verbFormsFromCard, verbFormsFromTheory } from './verbforms'
import { CheckupEngine, courseFingerprints, decodeCheckup } from './checkup'
import { STREAK_TO_KNOW, WordlistEngine, decodeWordlist } from './wordlist'
import { deserialize, serialize } from './storage'
import { LANGUAGE_CODES } from './language'
import { ATTEMPT_LOG_LIMIT, EXERCISE_TYPES, LEVELS, freshState, seenExerciseIDs, trimAttempts } from './types'
import type { LanguageCode } from './language'
import type { CEFRLevel, CoursePack, Exercise, Lesson, PlacementBank } from './types'

/**
 * A port of native/Sources/EnglishCoachCoreTests/main.swift.
 * Same content, same assertions: if the two ever disagree, one of them is a bug.
 */

const contentDir = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'public', 'content')
const readJSON = (path: string) => JSON.parse(readFileSync(join(contentDir, path), 'utf8'))

/** One language's shipped content, decoded exactly the way the app decodes it. */
function readLanguage(language: LanguageCode) {
  const index = readJSON(`${language}/index.json`) as {
    courses: string[]; theory?: string[]; checkup?: string[]; wordlist?: string[]
  }
  const syllabus = decodeSyllabus(readJSON(`${language}/syllabus.json`))
  const known = new Set(syllabus.topics.map((topic) => topic.id))
  const courses = index.courses.map((file) => decodeCourse(readJSON(`${language}/courses/${file}`))) as CoursePack[]
  return {
    courses,
    placement: decodePlacement(readJSON(`${language}/placement.json`)),
    syllabus,
    theory: (index.theory ?? []).map((file) => decodeTheory(readJSON(`${language}/theory/${file}`), known)),
    // Курсы передаются не для красоты: задание среза, которое уже есть в курсе, ломает
    // весь смысл замера. Раньше здесь стоял `undefined`, и храповик молчал — то есть
    // повтор поймал бы только человек глазами.
    checkups: (index.checkup ?? []).map((file) =>
      decodeCheckup(readJSON(`${language}/checkup/${file}`), courses, known)),
    wordlists: (index.wordlist ?? []).map((file) => decodeWordlist(readJSON(`${language}/wordlist/${file}`))),
  }
}

// The engine tests below run on English, because they name English lessons and topics.
// Everything a second language must also satisfy lives in "each shipped language".
const courses: CoursePack[] = readLanguage('en').courses
const placement: PlacementBank = readLanguage('en').placement
const bank = placement.questions
const now = new Date(1_000_000)
const DRILLED_TYPES = EXERCISE_TYPES.filter((type) => type !== 'dialogue')

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
    expect(() => decodeCourse({ schemaVersion: 3, level: 'A1', chapters: [] })).toThrowError(/unsupportedSchema/)
  })

  // The v2 rules: a unit says what it is for, a lesson climbs, a checkpoint is an exam.
  describe('unit packs', () => {
    const pack = (chapters: unknown[]) => ({ schemaVersion: 2, level: 'A1', chapters })
    const unit = (lessons: unknown[], canDo: string[] = ['заказать кофе']) =>
      ({ id: 'u', title: 'U', canDo, lessons })
    const lesson = (exercises: unknown[], kind?: string) =>
      ({ id: 'l', title: 'L', summary: 'S', estimatedMinutes: 5, exercises, ...(kind ? { kind } : {}) })

    const talk = { id: 'd', type: 'dialogue', lines: [
      { speaker: 'A', text: 'Hola.', translation: 'Привет.' },
      { speaker: 'B', text: 'Hola.', translation: 'Привет.' },
    ] }
    const word = { id: 'f', type: 'flashcard', prompt: 'Hola.', translation: 'Привет.' }
    const produce = { id: 't', type: 'translate', prompt: 'Привет.', canonicalAnswer: 'Hola.' }

    it('accepts a unit that climbs the ladder', () => {
      const course = decodeCourse(pack([unit([lesson([talk, word, produce])])]))
      expect(course.chapters[0].canDo).toEqual(['заказать кофе'])
    })

    it('refuses a unit that cannot say what it is for', () => {
      expect(() => decodeCourse(pack([unit([lesson([talk, word, produce])], [])]))).toThrowError(/invalidExercise/)
    })

    it('refuses a lesson that goes back down a step', () => {
      // Production before the words that make it possible: the old order, now rejected.
      expect(() => decodeCourse(pack([unit([lesson([talk, produce, word])])]))).toThrowError(/invalidExercise/)
    })

    it('refuses a checkpoint with anything to lean on', () => {
      const hinted = { ...produce, hint: 'начинается на H' }
      expect(() => decodeCourse(pack([unit([lesson([hinted], 'checkpoint')])]))).toThrowError(/invalidExercise/)
      expect(() => decodeCourse(pack([unit([lesson([word, produce], 'checkpoint')])]))).toThrowError(/invalidExercise/)
      expect(decodeCourse(pack([unit([lesson([produce], 'checkpoint')])]))).toBeTruthy()
    })

    it('refuses a dialogue that is not an exchange', () => {
      const alone = { id: 'd', type: 'dialogue', lines: [{ speaker: 'A', text: 'Hola.', translation: 'Привет.' }] }
      expect(() => decodeCourse(pack([unit([lesson([alone, produce])])]))).toThrowError(/invalidExercise/)
    })

    it('keeps v1 packs working exactly as before', () => {
      const old = { schemaVersion: 1, level: 'A1', chapters: [{ id: 'c', title: 'C', lessons: [lesson([produce, word])] }] }
      expect(decodeCourse(old).chapters[0].canDo).toBeUndefined()
    })
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
    // Dialogues belong to the v2 unit packs; every level must still carry the five kinds
    // a learner is actually asked to work through.
    for (const type of DRILLED_TYPES) expect(types).toContain(type)
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

describe('what a review session is made of', () => {
  it('does not schedule rule cards and dialogues', () => {
    const course = courses.find((pack) => pack.level === 'A1')!
    const lesson = course.chapters.flatMap((chapter) => chapter.lessons)
      .find((item) => item.exercises.some((exercise) => exercise.type === 'info'))!
    const session = new LearningSession(freshState())
    session.start(lesson)
    while (!session.isComplete) session.completeCurrentCorrectly(now)

    const scheduled = new Set(session.state.reviews.map((item) => item.exerciseID))
    const passive = lesson.exercises.filter((e) => e.type === 'info' || e.type === 'dialogue')
    expect(passive.length, 'the lesson has something passive to skip').toBeGreaterThan(0)
    for (const exercise of passive) {
      expect(scheduled.has(exercise.id), `${exercise.id}: exposure is not scheduled`).toBe(false)
    }
    // Everything answerable in the same lesson still is.
    for (const exercise of lesson.exercises.filter((e) => e.type !== 'info' && e.type !== 'dialogue')) {
      expect(scheduled.has(exercise.id), `${exercise.id}: answers are scheduled`).toBe(true)
    }
    // And the attempt log still remembers the passive ones, so the streak counts them.
    const attempted = new Set(session.state.attempts.map((attempt) => attempt.exerciseID))
    for (const exercise of passive) expect(attempted.has(exercise.id)).toBe(true)
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

  it('ставит назначенные повторения первыми, а отвеченное — за новым', () => {
    const state = freshState()
    const pool = PracticeEngine.pool(courses, 'A1')
    const dueExercise = pool[5]
    const failedExercise = pool[9]
    state.reviews = [
      { ...ReviewEngine.newItem(dueExercise.id, now), due: new Date(now.getTime() - 86_400_000) },
      // Ошибка назначена на завтра — значит сегодня её очередь ещё не пришла.
      ReviewEngine.recordFailure(ReviewEngine.newItem(failedExercise.id, now), now),
    ]
    state.attempts = [
      { id: '1', exerciseID: failedExercise.id, correct: false, date: now },
      { id: '2', exerciseID: pool[0].id, correct: true, date: now },
    ]

    const set = PracticeEngine.build({ courses, level: 'A1', state, size: 5, now, random: seeded() })
    expect(set[0].id).toBe(dueExercise.id)
    // Ни свежая ошибка, ни верный ответ не лезут вперёд нового материала.
    expect(set.slice(1).some((e) => e.id === failedExercise.id)).toBe(false)
    expect(set.slice(1).some((e) => e.id === pool[0].id)).toBe(false)
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

  it('не просит произвести то, чему ещё не учили', () => {
    const a1 = courses.find((c) => c.level === 'A1')!
    const lessons = a1.chapters.flatMap((chapter) => chapter.lessons)

    // День первый: производить нечего. До этой обрезки первый же тап выдавал будущее
    // время из последней главы уровня.
    const day1 = taughtCourses(courses, 'A1', new Set())
    expect(PracticeEngine.pool(day1, 'A1', ['translate', 'word_order', 'multiple_choice'])).toHaveLength(0)

    // После двух уроков производить можно ровно эти два урока и ничего больше.
    const done = new Set([lessons[0].id, lessons[1].id])
    const reachable = new Set([...lessons[0].exercises, ...lessons[1].exercises].map((e) => e.id))
    const produced = PracticeEngine.build({
      courses: taughtCourses(courses, 'A1', done), level: 'A1', state: freshState(), size: 40,
      types: ['translate', 'word_order', 'multiple_choice'], random: seeded(),
    })
    expect(produced.length).toBeGreaterThan(0)
    expect(produced.every((e) => reachable.has(e.id))).toBe(true)
  })

  it('открывает карточки уровня, не дожидаясь уроков', () => {
    // Карточка знакомит со словом сама, и «хочу поучить слова» — это самостоятельное
    // занятие, а не награда за пройденный урок. Поэтому непройденные уроки текущего
    // уровня отдают карточки, и только их.
    const day1 = taughtCourses(courses, 'A1', new Set())
    const cards = PracticeEngine.pool(day1, 'A1')
    expect(cards.length).toBeGreaterThan(0)
    expect(cards.every((e) => e.type === 'flashcard')).toBe(true)
  })

  it('не выдаёт слова уровней ниже как новый материал', () => {
    // Корень жалобы «у меня B1, а приложение учит меня hello». Раньше уровни ниже
    // текущего отдавались целиком, и у свежего B1-профиля весь пул был A1 плюс A2:
    // первые карточки A1 — это буквально Hello, Hi, Bye.
    const trimmed = taughtCourses(courses, 'B1', new Set())
    expect(trimmed.map((c) => c.level)).toEqual(['B1'])

    const pool = PracticeEngine.pool(trimmed, 'B1')
    const below = new Set([...ProgressionEngine.exerciseIDs('A1', courses), ...ProgressionEngine.exerciseIDs('A2', courses)])
    expect(pool.length).toBeGreaterThan(0)
    expect(pool.some((e) => below.has(e.id))).toBe(false)

    // Пройденное на уровне ниже — другое дело: это человек учил здесь, и повторять
    // это честно.
    const a1 = courses.find((c) => c.level === 'A1')!
    const first = a1.chapters[0].lessons[0]
    const withHistory = taughtCourses(courses, 'B1', new Set([first.id]))
    expect(withHistory.map((c) => c.level)).toEqual(['A1', 'B1'])
    const ids = new Set(PracticeEngine.pool(withHistory, 'B1').map((e) => e.id))
    expect(first.exercises.filter((e) => e.type === 'translate').every((e) => ids.has(e.id))).toBe(true)
  })

  it('не подаёт свежую ошибку немедленно, а ждёт назначенного срока', () => {
    // Вторая половина жалобы: «хочу поучить фразы, а мне дают фразы из последнего
    // задания». Ведро «ошибки» стояло выше нового материала и отменяло расписание,
    // хотя recordFailure уже назначает повтор на завтра.
    const pool: Exercise[] = [
      { id: 'missed', type: 'translate', prompt: 'x', canonicalAnswer: 'x' },
      { id: 'fresh-1', type: 'translate', prompt: 'y', canonicalAnswer: 'y' },
      { id: 'fresh-2', type: 'translate', prompt: 'z', canonicalAnswer: 'z' },
    ]
    const state = freshState()
    state.attempts = [{ id: 'a', exerciseID: 'missed', correct: false, date: now }]
    state.reviews = [ReviewEngine.recordFailure(ReviewEngine.newItem('missed', now), now)]

    const order = prioritise(pool, state, now, seeded())
    expect(order[0].id).not.toBe('missed')
    expect(order[order.length - 1].id).toBe('missed')

    // Назавтра она приходит сама, первой.
    const tomorrow = new Date(now.getTime() + 25 * 60 * 60 * 1000)
    expect(prioritise(pool, state, tomorrow, seeded())[0].id).toBe('missed')
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
    // The card carries the topic so a rule can be found, but it is not practice — and
    // neither is a dialogue, which the counter has always excluded too. The test only
    // said "info" because English had no dialogues to disagree about.
    const onlyInfoTopic = (info.topics ?? [])[0]
    // По всем курсам, а не по первому: темы A1 живут и в A2 — там их продолжают
    // отрабатывать, — и счётчик обязан видеть обе половины.
    const practice = courses.flatMap(allExercises)
      .filter((e) => e.type !== 'info' && e.type !== 'dialogue' && (e.topics ?? []).includes(onlyInfoTopic))
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

  it('говорит вслух целое предложение, а не кусок из карточки', () => {
    // Карточки в курсе — это куски фраз: «night shifts», «of one problem». Вслух
    // идёт example, то предложение диалога, откуда кусок взят.
    const flashcard = allExercises(courses[0]).find((e) => e.type === 'flashcard' && e.example)!
    expect(shadowingPhrase(flashcard)).toEqual({ exerciseID: flashcard.id, text: flashcard.example })

    // Без примера остаётся сам кусок, и тогда перевод к нему подходит и показывается.
    expect(shadowingPhrase({ id: 'w', type: 'flashcard', prompt: 'the flu', translation: 'грипп' }))
      .toEqual({ exerciseID: 'w', text: 'the flu', gloss: 'грипп' })
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

  it('ставит назначенные повторения первыми', () => {
    const state = freshState()
    const pool = ShadowingEngine.pool(courses, 'A1')
    state.reviews = [{ ...ReviewEngine.newItem(pool[4].id, now), due: new Date(now.getTime() - 86_400_000) }]

    const set = ShadowingEngine.build({ courses, level: 'A1', state, size: 5, now, random: seeded() })
    expect(set.exercises[0].id).toBe(pool[4].id)
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
    // The shipped A2 is an hour long, so nothing is suggested — see the test below.
    const stocked = withStockedLevel(courses, 'A2')
    expect(ProgressionEngine.shouldSuggestAdvance('A1', stocked, done, goodAttempts, new Set())).toBe(true)
    expect(ProgressionEngine.shouldSuggestAdvance('A1', stocked, done, goodAttempts, new Set(['A1']))).toBe(false)
    expect(LevelOrder.next('A1')).toBe('A2')
    expect(LevelOrder.next('C1')).toBeNull()
  })

  /**
   * Позвать «переходи на A2», когда там час содержания, значит позвать человека в
   * пустую комнату: курс кончится в тот же вечер.
   *
   * Раньше проверка опиралась на то, что A2 в поставке и правда был часовым. Теперь он
   * дописан, и тонкий уровень приходится строить нарочно — так тест и должен был стоять
   * с самого начала: он про правило, а не про сегодняшний объём курса.
   */
  it('does not invite the learner into a level that is barely built', () => {
    const a1 = ProgressionEngine.lessons('A1', courses)
    const done = new Set(a1.map((lesson) => lesson.id))
    const goodAttempts = [...ProgressionEngine.exerciseIDs('A1', courses)].map((id) => ({
      id, exerciseID: id, correct: true, date: now,
    }))

    const thin = withThinLevel(courses, 'A2')
    expect(ProgressionEngine.hours('A2', thin)).toBeLessThan(ProgressionEngine.readyHours)
    expect(ProgressionEngine.isReady('A2', thin)).toBe(false)
    expect(ProgressionEngine.shouldSuggestAdvance('A1', thin, done, goodAttempts, new Set())).toBe(false)

    const stocked = withStockedLevel(courses, 'A2')
    expect(ProgressionEngine.isReady('A2', stocked)).toBe(true)
    expect(ProgressionEngine.shouldSuggestAdvance('A1', stocked, done, goodAttempts, new Set())).toBe(true)
  })
})

/** The same courses, with one level cut down to a single chapter of one lesson. */
function withThinLevel(packs: CoursePack[], level: CEFRLevel): CoursePack[] {
  return packs.map((pack) => pack.level !== level ? pack : {
    ...pack,
    chapters: pack.chapters.slice(0, 1).map((chapter) => ({
      ...chapter,
      lessons: chapter.lessons.slice(0, 1),
    })),
  })
}

/** The same courses, with one level padded past the "ready" bar. */
function withStockedLevel(packs: CoursePack[], level: CEFRLevel): CoursePack[] {
  return packs.map((pack) => pack.level !== level ? pack : {
    ...pack,
    chapters: pack.chapters.map((chapter) => ({
      ...chapter,
      lessons: chapter.lessons.map((lesson) => ({ ...lesson, estimatedMinutes: 120 })),
    })),
  })
}

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

/**
 * Объём курса посчитан из нормы Cambridge через оценку в одиннадцать минут на урок.
 * Эти тесты стерегут единственную проверку этой оценки — замер на живом прохождении.
 */
describe('lesson pace check', () => {
  const entries = (...seconds: number[]) =>
    seconds.reduce<{ estimateMinutes: number; seconds: number }[]>(
      (log, value) => PaceLog.recording({ estimateMinutes: 11, seconds: value }, log),
      undefined as unknown as { estimateMinutes: number; seconds: number }[],
    )

  it('stays silent below five samples', () => {
    expect(PaceLog.summary(entries(660, 700, 620, 680))).toBeNull()
    expect(PaceLog.summary(undefined)).toBeNull()
  })

  it('reports the median against the estimate', () => {
    const summary = PaceLog.summary(entries(660, 660, 660, 660, 660))
    expect(summary?.samples).toBe(5)
    expect(summary?.actualMinutes).toBe(11)
    expect(summary?.ratio).toBe(1)
  })

  it('shows the drift when lessons run longer than promised', () => {
    const summary = PaceLog.summary(entries(900, 880, 920, 900, 890))
    expect(summary?.ratio).toBeGreaterThan(1.3)
  })

  // Один урок в четыре захода и одна забытая вкладка сдвинули бы среднее и не сдвигают
  // медиану — ради этого она и выбрана.
  it('survives one outlier without moving the verdict', () => {
    const clean = PaceLog.summary(entries(660, 660, 660, 660, 660))
    const withOutlier = PaceLog.summary(entries(660, 660, 660, 660, 660, 1790))
    expect(withOutlier?.ratio).toBe(clean?.ratio)
  })

  it('drops flick-throughs and forgotten tabs before they reach the log', () => {
    expect(PaceLog.recording({ estimateMinutes: 11, seconds: 20 }, undefined)).toEqual([])
    expect(PaceLog.recording({ estimateMinutes: 11, seconds: 40 * 60 }, undefined)).toEqual([])
    expect(PaceLog.recording({ estimateMinutes: 0, seconds: 660 }, undefined)).toEqual([])
  })

  it('keeps the log bounded', () => {
    let log: { estimateMinutes: number; seconds: number }[] | undefined
    for (let index = 0; index < PaceLog.cap + 40; index += 1) {
      log = PaceLog.recording({ estimateMinutes: 11, seconds: 660 }, log)
    }
    expect(log?.length).toBe(PaceLog.cap)
  })
})

/**
 * A profile has to fit in localStorage. An origin gets about 4.8 MB, a finished A1
 * spends over a megabyte of it on review items, and the attempt log used to grow with
 * no ceiling at all — so this is about not losing three months of work in silence.
 */
describe('the attempt log stays inside the storage quota', () => {
  const attempt = (index: number) => ({ id: `a${index}`, exerciseID: `e${index}`, correct: true, date: now })

  it('keeps the newest answers and drops the oldest', () => {
    const log = Array.from({ length: ATTEMPT_LOG_LIMIT + 500 }, (_, index) => attempt(index))
    const trimmed = trimAttempts(log)
    expect(trimmed.length).toBe(ATTEMPT_LOG_LIMIT)
    expect(trimmed[trimmed.length - 1].exerciseID).toBe(`e${ATTEMPT_LOG_LIMIT + 499}`)
    expect(trimmed[0].exerciseID).toBe('e500')
  })

  it('leaves a short log alone', () => {
    const log = [attempt(1), attempt(2)]
    expect(trimAttempts(log)).toBe(log)
  })

  it('cuts an oversized profile down as it is loaded', () => {
    const state = freshState()
    state.attempts = Array.from({ length: ATTEMPT_LOG_LIMIT + 10 }, (_, index) => attempt(index))
    expect(deserialize(serialize(state)).attempts.length).toBe(ATTEMPT_LOG_LIMIT)
  })

  it('still remembers an exercise whose attempt has been trimmed away', () => {
    // The review item is the permanent record: one per exercise, never dropped.
    const state = freshState()
    state.reviews = [ReviewEngine.newItem('old-exercise', now)]
    expect(seenExerciseIDs(state).has('old-exercise')).toBe(true)
  })

  it('does not let a session grow the log past the ceiling', () => {
    const lesson = courses.find((course) => course.level === 'A1')!.chapters[0].lessons[0]
    const session = new LearningSession(freshState())
    session.state.attempts = Array.from({ length: ATTEMPT_LOG_LIMIT }, (_, index) => attempt(index))
    session.start(lesson)
    session.completeCurrentCorrectly(now)
    expect(session.state.attempts.length).toBe(ATTEMPT_LOG_LIMIT)
    expect(session.state.attempts[ATTEMPT_LOG_LIMIT - 1].exerciseID).toBe(lesson.exercises[0].id)
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
describe('список 3000 частых слов', () => {
  const pack = readLanguage('en').wordlists[0]

  it('это ровно 3000 слов, каждое с переводом и частью речи', () => {
    expect(pack.items).toHaveLength(3000)
    for (const item of pack.items) {
      expect(item.w, 'слово').toMatch(/^[a-z][a-z' -]*$/)
      expect(item.t, `${item.w}: перевод`).toMatch(/[а-яё]/i)
      expect(item.p, `${item.w}: часть речи`).toBeTruthy()
    }
    // Порядок — частотный, и дырка в нём означала бы, что «первая тысяча» посчитана
    // по неполному списку.
    expect(pack.items.map((item) => item.r)).toEqual(pack.items.map((_, i) => i + 1))
    expect(new Set(pack.items.map((item) => item.w)).size).toBe(3000)
  })

  it('декодер не принимает список с дыркой в порядке', () => {
    const broken = { ...pack, items: [pack.items[0], { ...pack.items[1], r: 99 }] }
    expect(() => decodeWordlist(broken)).toThrow()
  })

  it('просеивание отдаёт слова по частоте и не возвращает разобранные', () => {
    const state = freshState()
    const first = WordlistEngine.toSieve(pack, state, 5)
    expect(first.map((item) => item.r)).toEqual([1, 2, 3, 4, 5])

    state.wordlist = WordlistEngine.markKnown(first[0].w, state)
    state.wordlist = WordlistEngine.markUnknown(first[1].w, state)
    const second = WordlistEngine.toSieve(pack, state, 5)
    // Разобранные не возвращаются ни в каком виде: ни «знаю», ни «не знаю».
    expect(second.some((item) => item.w === first[0].w || item.w === first[1].w)).toBe(false)
    expect(second[0].r).toBe(3)
  })

  it('«знаю» считается сразу, а изучение — после трёх вспоминаний', () => {
    const state = freshState()
    const word = pack.items[0].w
    const learnt = pack.items[1].w

    state.wordlist = WordlistEngine.markKnown(word, state)
    expect(WordlistEngine.count(pack, state).known).toBe(1)

    state.wordlist = WordlistEngine.markUnknown(learnt, state)
    expect(WordlistEngine.count(pack, state).known, 'отмеченное незнакомым не считается').toBe(1)
    for (let i = 1; i < STREAK_TO_KNOW; i += 1) {
      state.wordlist = WordlistEngine.recordRecall(learnt, true, state)
      expect(WordlistEngine.count(pack, state).known, `после ${i} вспоминаний`).toBe(1)
    }
    state.wordlist = WordlistEngine.recordRecall(learnt, true, state)
    expect(WordlistEngine.count(pack, state).known, 'на третий раз слово закрыто').toBe(2)

    // Промах обнуляет серию, и слово возвращается в изучение.
    const third = pack.items[2].w
    state.wordlist = WordlistEngine.markUnknown(third, state)
    state.wordlist = WordlistEngine.recordRecall(third, true, state)
    state.wordlist = WordlistEngine.recordRecall(third, false, state)
    expect(WordlistEngine.progress(state).streak[third]).toBe(0)
    expect(WordlistEngine.toStudy(pack, state, 10).some((item) => item.w === third)).toBe(true)
  })

  it('счёт опирается не только на самооценку, но и на ответы в приложении', () => {
    // Слово, которое встречалось в упражнении, ушедшем на неделю вперёд по интервальному
    // повторению, считается известным без всякой отметки: человек его уже вспоминал.
    const exercise = PracticeEngine.pool(courses, 'A1', ['flashcard'])
      .find((item) => /^[a-z]+$/.test((item.prompt ?? '').trim().toLowerCase()))!
    const word = (exercise.prompt ?? '').trim().toLowerCase()
    const inList = pack.items.some((item) => item.w === word)

    const state = freshState()
    state.reviews = [{ id: exercise.id, exerciseID: exercise.id, due: now, intervalDays: 7, ease: 2.3, repetitions: 3 }]
    const confirmed = WordlistEngine.confirmedByCourse(courses, state)
    expect(confirmed.has(word), `${word} подтверждено курсом`).toBe(true)
    if (inList) expect(WordlistEngine.isKnown(word, state, confirmed)).toBe(true)

    // Недельный порог обязателен: свежая ошибка с интервалом в день ничего не доказывает.
    state.reviews = [{ id: exercise.id, exerciseID: exercise.id, due: now, intervalDays: 1, ease: 2.3, repetitions: 0 }]
    expect(WordlistEngine.confirmedByCourse(courses, state).has(word)).toBe(false)
  })

  it('разбивка по тысячам покрывает весь список', () => {
    const chunks = WordlistEngine.thousands(pack, freshState())
    expect(chunks).toHaveLength(3)
    expect(chunks.map((chunk) => [chunk.from, chunk.to])).toEqual([[1, 1000], [1001, 2000], [2001, 3000]])
    expect(chunks.reduce((sum, chunk) => sum + chunk.total, 0)).toBe(3000)
  })
})

describe('контрольный срез — замер вне курса', () => {
  const { checkups, syllabus } = readLanguage('en')

  it('ни одно задание среза не встречается в курсе', () => {
    // В этом весь смысл среза. Проценты приложения считаются по упражнениям, которые оно
    // само и выдавало: увидел «My bike was stolen» двадцать раз, ответил верно — «85% по
    // пассиву». Если задание среза окажется в курсе, замер снова станет замкнутым.
    expect(checkups.length).toBeGreaterThan(0)
    const inCourse = courseFingerprints(courses)
    for (const bank of checkups) {
      for (const item of bank.items) {
        for (const answer of [item.canonicalAnswer, ...(item.acceptedAnswers ?? [])]) {
          const fingerprint = answer.toLowerCase().replace(/['’]/g, '')
            .replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim()
          expect(inCourse.has(fingerprint), `${item.id}: «${answer}» есть в курсе`).toBe(false)
        }
      }
    }
  })

  it('декодер отказывается принять задание, совпавшее с курсом', () => {
    // Проверка обязана жить в коде, а не в внимательности автора банка.
    const known = new Set(syllabus.topics.map((topic) => topic.id))
    const fromCourse = PracticeEngine.pool(courses, 'B1', ['translate'])
      .find((exercise) => exercise.canonicalAnswer)!
    const bank = {
      schemaVersion: 1, level: 'B1',
      items: [{ id: 'x', topics: ['b1-present-perfect'], prompt: 'п', canonicalAnswer: fromCourse.canonicalAnswer }],
    }
    expect(() => decodeCheckup(bank, courses, known)).toThrow()
    // Без курса тот же банк разбирается: проверка именно на пересечение.
    expect(() => decodeCheckup(bank, undefined, known)).not.toThrow()
  })

  it('банк покрывает темы уровня и проверяет производство', () => {
    const bank = CheckupEngine.bank(checkups, 'B1')!
    expect(bank.items.length).toBeGreaterThanOrEqual(20)
    const topics = new Set(bank.items.flatMap((item) => item.topics))
    expect(topics.size, 'тем в срезе').toBeGreaterThanOrEqual(10)
    for (const item of bank.items) {
      expect(item.prompt, item.id).toBeTruthy()
      expect(item.canonicalAnswer, item.id).toBeTruthy()
    }
  })

  it('замер хранится отдельно от попыток и считает сдвиг', () => {
    const bank = CheckupEngine.bank(checkups, 'B1')!
    const state = freshState()
    // Один замер движения не показывает — сдвиг появляется со второго.
    state.checkups = [{ date: '2026-08-01', level: 'B1', correct: 10, total: 20 }]
    expect(CheckupEngine.change(state, 'B1')).toBeNull()
    state.checkups = [...state.checkups, { date: '2026-09-01', level: 'B1', correct: 14, total: 20 }]
    expect(CheckupEngine.change(state, 'B1')).toBe(20)
    expect(CheckupEngine.latest(state, 'B1')?.correct).toBe(14)
    // Замеры другого уровня в расчёт не идут.
    state.checkups = [...state.checkups, { date: '2026-09-02', level: 'A2', correct: 20, total: 20 }]
    expect(CheckupEngine.latest(state, 'B1')?.correct).toBe(14)
    // Попытки от среза не появляются: это замер, а не тренировка.
    expect(state.attempts).toHaveLength(0)

    // Проверка ответа — тем же чекером, что и в уроках: опечатка засчитывается.
    const item = bank.items[0]
    expect(CheckupEngine.judge(item, item.canonicalAnswer)).toBe(true)
    expect(CheckupEngine.judge(item, 'полная чушь')).toBe(false)
  })
})

describe('аудирование не даёт обрывков разговора', () => {
  it('отбраковывает реплики, вырванные из диалога', () => {
    // Настоящие фразы из курса: заглавная и точка на месте, а записать их без
    // предыдущей реплики нельзя.
    const fragments = [
      'By this policy.',
      'And fifteen years of company.',
      'Two years in a warehouse.',
      'Half on completion.',
      'Named, dated and linked.',
      'Two automatic ones.',
      'Starting Monday, yes.',
    ]
    for (const text of fragments) {
      const exercise: Exercise = { id: 'x', type: 'translate', prompt: 'п', canonicalAnswer: text }
      expect(listeningPhrase(exercise), text).toBeNull()
    }
  })

  it('оставляет предложения, включая короткие вопросы', () => {
    const sentences = [
      'I cut my finger this morning.',
      'Was the lock broken?',
      'Does it bother you at all?',
      'The train is delayed.',
      'Can it be rolled back?',
    ]
    for (const text of sentences) {
      const exercise: Exercise = { id: 'x', type: 'translate', prompt: 'п', canonicalAnswer: text }
      expect(listeningPhrase(exercise), text).not.toBeNull()
    }
  })

  it('материала остаётся больше половины прежнего', () => {
    // Строгость легко довести до пустого раздела, поэтому цена правила измерена:
    // `npm run measure:listening` показывает 55–63% по английским уровням.
    for (const level of ['A1', 'A2', 'B1'] as const) {
      const all = PracticeEngine.pool(courses, level)
      const sayable = all.filter((exercise) => {
        const item = shadowingPhrase(exercise)
        return item !== null && /^[A-Z].*[.!?]$/.test(item.text.trim())
          && !item.text.includes('…') && item.text.trim().split(/\s+/).length >= 3
      })
      const kept = all.filter((exercise) => listeningPhrase(exercise) !== null)
      expect(kept.length / sayable.length, `${level}: доля оставшегося`).toBeGreaterThan(0.5)
    }
  })

  it('другому языку достаётся только базовое правило', () => {
    // Списки собраны на английском; на испанском они отсеивали 99%, потому что там нет
    // ни одного английского вспомогательного глагола.
    const spanish: Exercise = { id: 'x', type: 'translate', prompt: 'п', canonicalAnswer: 'El café está abierto.' }
    expect(listeningPhrase(spanish, 'en')).toBeNull()
    expect(listeningPhrase(spanish, 'es')).not.toBeNull()
  })
})

describe('формы неправильных глаголов', () => {
  const theory = readLanguage('en').theory.find((pack) => pack.level === 'B1')!

  it('берёт глаголы из контента, а не из списка в коде', () => {
    // Список в компоненте разошёлся бы с курсом на первой правке содержания.
    const fromCards = PracticeEngine.pool(courses, 'B1', ['flashcard'])
      .map(verbFormsFromCard).filter(Boolean)
    expect(fromCards.length).toBeGreaterThan(20)
    // Вторая половина — таблица форм внутри разбора: be, go, do в карточках не выданы.
    const fromTheory = verbFormsFromTheory(theory)
    expect(fromTheory.map((verb) => verb.infinitive)).toContain('be')
    expect(fromTheory.find((verb) => verb.infinitive === 'go')?.participle).toBe('gone')

    const pool = VerbFormsEngine.pool(courses, 'B1', theory)
    expect(pool.length).toBeGreaterThanOrEqual(fromCards.length)
    // Один глагол — одна запись, даже если он есть и в карточке, и в таблице.
    expect(new Set(pool.map((verb) => verb.infinitive.toLowerCase())).size).toBe(pool.length)
    for (const verb of pool) {
      expect(verb.past, verb.infinitive).toBeTruthy()
      expect(verb.participle, verb.infinitive).toBeTruthy()
    }
  })

  it('принимает любой из вариантов формы', () => {
    // «was / were» и «got / gotten» — язык, а не придирка: требовать обе половины
    // значило бы считать верный ответ ошибкой.
    expect(formIsCorrect('was', 'was / were')).toBe(true)
    expect(formIsCorrect('were', 'was / were')).toBe(true)
    expect(formIsCorrect('  GONE ', 'gone')).toBe(true)
    expect(formIsCorrect('gotten', 'got / gotten')).toBe(true)
    expect(formIsCorrect('goed', 'went')).toBe(false)
    expect(formIsCorrect('', 'went')).toBe(false)
  })

  it('не принимает вторую форму там, где нужна третья', () => {
    // Ровно та ошибка, из-за которой тема и появилась: has went, I have ate.
    const pool = VerbFormsEngine.pool(courses, 'B1', theory)
    const go = pool.find((verb) => verb.infinitive === 'go')!
    expect(formIsCorrect('went', go.participle)).toBe(false)
    expect(formIsCorrect('gone', go.participle)).toBe(true)
  })

  it('пачка не больше запрошенного и без повторов', () => {
    const seeded = () => { let seed = 7; return () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648 } }
    const batch = VerbFormsEngine.build({ courses, level: 'B1', theory, size: 15, random: seeded() })
    expect(batch).toHaveLength(15)
    expect(new Set(batch.map((verb) => verb.infinitive)).size).toBe(15)
  })
})

describe('режим слов', () => {
  /**
   * Жалоба была «хочу поучить слова, а дают hello goodbye»: вторая её половина — что
   * «словом» в приложении оказывался кусок реплики. Замер по B1 на 11.09.2026: одиночных
   * слов 4%, коллокаций 61%, обрывков из четырёх и больше 27%, предложений 6%.
   */
  it('в набор не попадает то, что не является единицей', () => {
    const level = 'B1'
    const pool = VocabularyEngine.pool(courses, level, 'en')
    expect(pool.length).toBeGreaterThan(0)

    for (const exercise of pool) {
      const prompt = exercise.prompt ?? ''
      expect(prompt, 'многоточие — оборванная фраза').not.toContain('…')
      expect(prompt, 'запятая — две части предложения').not.toContain(',')
      if (!prompt.includes(' — ')) {
        const bare = prompt.replace(/^[¿¡]+/, '').replace(/[.!?]+$/, '').trim()
        expect(bare.split(/\s+/).length, `${prompt}: слов`).toBeLessThanOrEqual(3)
        expect(bare, `${prompt}: личная форма be/have`).not.toMatch(/\b(is|are|was|were|has|have|had|will|can)\b/i)
        expect(bare, `${prompt}: подлежащее`).not.toMatch(/^(I|You|He|She|We|They|It|There|Nobody)\b/i)
      }
    }
  })

  it('материала хватает на каждом наполненном уровне', () => {
    // Отбор строгий, и строгость легко довести до пустого режима: 4660 карточек B1 дают
    // 1214 единиц, и если правило станет жёстче, тест скажет об этом раньше учащегося.
    for (const level of ['A1', 'A2', 'B1'] as const) {
      expect(VocabularyEngine.count(courses, level, 'en'), `${level}: единиц`).toBeGreaterThan(400)
    }
  })

  it('формы неправильного глагола остаются единицей', () => {
    expect(vocabularyUnit({ id: 'f', type: 'flashcard', prompt: 'break — broke — broken', translation: 'ломать' }, 'en'))
      .toBe('forms')
    expect(vocabularyUnit({ id: 'w', type: 'flashcard', prompt: 'the flu', translation: 'грипп' }, 'en')).toBe('phrase')
    expect(vocabularyUnit({ id: 's', type: 'flashcard', prompt: 'obvious', translation: 'очевидно' }, 'en')).toBe('word')
  })

  it('отбраковывает именно то, на что жаловались', () => {
    // Каждая строка здесь — настоящая карточка из курса, не выдуманный пример.
    const rejected = [
      ['of one problem', 'одной задачи'],
      ['about half of it', 'примерно половину'],
      ['had left the tap running', 'забыл закрыть кран'],
      ['the clock stops', 'счётчик останавливается'],
      ['the letter says', 'в письме написано'],
      ['nobody rests', 'никто не отдыхает'],
      ['were left unpainted', 'оставили некрашеными'],
      ['How long have you been…?', 'Давно вы …?'],
      ['I noticed.', 'Я заметил.'],
      ['than lose it', 'чем потерять'],
    ]
    for (const [prompt, translation] of rejected) {
      expect(vocabularyUnit({ id: 'x', type: 'flashcard', prompt, translation }, 'en'), prompt).toBeNull()
    }
  })

  it('слова есть на уровне, где производить ещё нечего', () => {
    // Смысл режима: «поучить слова» не должно ждать пройденных уроков.
    const scope = taughtCourses(courses, 'B1', new Set())
    expect(PracticeEngine.pool(scope, 'B1', ['translate', 'word_order'])).toHaveLength(0)
    expect(VocabularyEngine.count(scope, 'B1', 'en')).toBeGreaterThan(400)
  })
})

describe('разбор темы и занятие на время', () => {
  const { theory: packs, syllabus, courses: allCourses } = readLanguage('en')
  const theory = packs.find((pack) => pack.level === 'B1')!
  // Deterministic shuffling so the assertions are about the rules, not luck.
  const seeded = () => {
    let seed = 42
    return () => {
      seed = (seed * 1103515245 + 12345) % 2147483648
      return seed / 2147483648
    }
  }

  it('отказывается принимать разбор, который ни к чему не привязан', () => {
    const known = new Set(syllabus.topics.map((topic) => topic.id))
    const valid = { schemaVersion: 1, level: 'B1', topics: [
      { topicID: 'b1-used-to', title: 'x', idea: 'y', minutes: 3, sections: [{ heading: 'h', body: 'b' }] },
    ] }
    expect(() => decodeTheory(valid, known)).not.toThrow()

    // Опечатка в теме — это разбор, за которым нельзя дать практику: занятие
    // собралось бы из пустого набора и выглядело как «теория и всё».
    expect(() => decodeTheory({ ...valid, topics: [{ ...valid.topics[0], topicID: 'b1-used-too' }] }, known)).toThrow()
    // Раздел без содержания и разбор без разделов — тоже отказ.
    expect(() => decodeTheory({ ...valid, topics: [{ ...valid.topics[0], sections: [{ heading: 'h' }] }] }, known)).toThrow()
    expect(() => decodeTheory({ ...valid, topics: [{ ...valid.topics[0], sections: [] }] }, known)).toThrow()
    // Строка таблицы не по числу столбцов молча съехала бы на экране.
    const crooked = { ...valid.topics[0], sections: [{ heading: 'h', table: { head: ['a', 'b'], rows: [['1']] } }] }
    expect(() => decodeTheory({ ...valid, topics: [crooked] }, known)).toThrow()
  })

  it('каждая грамматическая тема уровня разобрана, и разбор не пустой', () => {
    // Жалоба была «не обучает от и до с разбором теории»: в уроке на теорию отведён
    // один абзац. Здесь проверяется, что у темы есть и формы, и границы, и ошибки.
    //
    // Проверка идёт по каждому уровню, у которого есть разбор: пока она смотрела только
    // B1, наполненный A2 мог остаться без разборов и ничего бы не упало.
    expect(packs.length, 'уровней с разборами').toBeGreaterThanOrEqual(2)

    for (const pack of packs) {
      const prefix = `${pack.level.toLowerCase()}-tema`
      const grammar = syllabus.topics
        .filter((topic) => topic.level === pack.level && !topic.id.startsWith(prefix))
        .map((topic) => topic.id)
      const explained = new Set(pack.topics.map((topic) => topic.topicID))
      expect(grammar.filter((id) => !explained.has(id)), `${pack.level}: без разбора`).toEqual([])

      for (const topic of pack.topics) {
        expect(topic.sections.length, `${topic.topicID}: разделов`).toBeGreaterThanOrEqual(3)
        expect(topic.sections.some((section) => section.table), `${topic.topicID}: таблица форм`).toBe(true)
        const mistakes = topic.sections.flatMap((section) => section.mistakes ?? [])
        expect(mistakes.length, `${topic.topicID}: разобранных ошибок`).toBeGreaterThanOrEqual(3)
        // Ошибка без «почему» — это просто вторая фраза рядом с первой.
        expect(mistakes.every((item) => item.wrong && item.right && item.why)).toBe(true)
      }
    }
  })

  it('строит занятие: разбор, потом узнавание, потом производство', () => {
    const plan = StudyEngine.plan({
      theory, courses: allCourses, syllabus, state: freshState(), level: 'B1', minutes: 20, random: seeded(),
    })!
    expect(plan.steps.map((step) => step.kind)).toEqual(['theory', 'recognise', 'produce'])
    expect(plan.exercises.length).toBeGreaterThan(0)
    // Всё занятие держится на одной теме, иначе «разбор + практика на неё» — обман.
    expect(plan.exercises.every((exercise) => (exercise.topics ?? []).includes(plan.topic.topicID))).toBe(true)
    // Одно упражнение не может попасть в занятие дважды.
    expect(new Set(plan.exercises.map((e) => e.id)).size).toBe(plan.exercises.length)
    // Практика не требует пройденных уроков: объяснение только что прочитано.
    expect(plan.exercises.some((e) => e.type === 'translate' || e.type === 'word_order')).toBe(true)
  })

  it('масштабируется по тому, сколько человек готов заниматься', () => {
    const size = (minutes: number) => StudyEngine.plan({
      theory, courses: allCourses, syllabus, state: freshState(), level: 'B1', minutes, random: seeded(),
    })!.exercises.length
    expect(size(10)).toBeLessThan(size(20))
    expect(size(20)).toBeLessThan(size(45))
  })

  it('сначала объясняет то, где человек ошибается', () => {
    // Слабая тема — уже доказанный пробел, и разбирать надо в первую очередь его.
    const topicID = 'b1-first-conditional'
    const drilled = PracticeEngine.pool(allCourses, 'B1', undefined, [topicID]).slice(0, 8)
    const state = freshState()
    state.attempts = drilled.map((exercise, index) => ({
      id: `a${index}`, exerciseID: exercise.id, correct: false, date: now,
    }))

    const chosen = StudyEngine.chooseTopic({ theory, syllabus, courses: allCourses, state, level: 'B1' })!
    expect(chosen.topic.topicID).toBe(topicID)
    expect(chosen.reason).toBe('weak')

    // Без истории ошибок берётся первый непрочитанный разбор.
    const fresh = StudyEngine.chooseTopic({ theory, syllabus, courses: allCourses, state: freshState(), level: 'B1' })!
    expect(fresh.reason).toBe('unread')
    // И прочитанное больше не предлагается как непрочитанное.
    const read = { ...freshState(), theoryRead: theory.topics.map((topic) => topic.topicID) }
    expect(StudyEngine.chooseTopic({ theory, syllabus, courses: allCourses, state: read, level: 'B1' })!.reason).toBe('next')
  })
})

describe.each(LANGUAGE_CODES)('each shipped language: %s', (language) => {
  const { courses: packs, placement: bank, syllabus, theory } = readLanguage(language)

  it('срез спрашивает вне курса и по известным темам', () => {
    const { checkups } = readLanguage(language)
    const known = new Set(syllabus.topics.map((topic) => topic.id))
    for (const bank of checkups) {
      expect(bank.items.length, `${bank.level}: срез меньше десяти заданий`).toBeGreaterThanOrEqual(10)
      for (const item of bank.items) {
        expect(item.prompt && item.canonicalAnswer, `${item.id}: пустое задание`).toBeTruthy()
        for (const topic of item.topics) {
          expect([...known], `${item.id}: темы нет в силлабусе`).toContain(topic)
        }
      }
    }
  })

  it('разборы теории привязаны к силлабусу', () => {
    // `decodeTheory` бросает на чужом topicID, и это уже проверено самой загрузкой выше.
    // Здесь — что пакет не пустой и что тема действительно разобрана, а не заявлена.
    const known = new Set(syllabus.topics.map((topic) => topic.id))
    for (const pack of theory) {
      expect(pack.topics.length, `${pack.level}: пустой пакет разборов`).toBeGreaterThan(0)
      for (const topic of pack.topics) {
        expect([...known], `${pack.level} · ${topic.topicID}: темы нет в силлабусе`).toContain(topic.topicID)
        expect(topic.sections.length, `${topic.topicID}: разбор без разделов`).toBeGreaterThan(0)
        expect(topic.minutes, `${topic.topicID}: не указано время`).toBeGreaterThan(0)
      }
    }
  })

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
          // A one-word tray is one button that is always right: it asks nothing.
          expect((exercise.tokens ?? []).length, `${exercise.id}: трей из одного слова`).toBeGreaterThan(1)
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

  /**
   * Юнит — это тема «что ты умеешь», а не одно грамматическое правило: в нём и вопросы,
   * и глаголы, и числа. Пока темы проставлялись пакетным скриптом, весь блок «Работа»
   * был помечен «Глагол ser» — и «что проседает», и тренировка по теме, и экран тем
   * показывали выдумку. Одна тема на весь юнит больше не проходит.
   */
  it('tags units by what each exercise actually practises', () => {
    for (const pack of packs.filter((item) => item.schemaVersion >= 2)) {
      for (const chapter of pack.chapters) {
        const drilled = chapter.lessons.flatMap((lesson) => lesson.exercises)
          .filter((exercise) => exercise.type !== 'info' && exercise.type !== 'dialogue')
        const topics = new Set(drilled.flatMap((exercise) => exercise.topics ?? []))
        expect(topics.size, `${chapter.id}: ${drilled.length} упражнений на ${topics.size} тем`).toBeGreaterThanOrEqual(4)
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

describe('режимы тренировки', () => {
  const language: LanguageCode = 'en'
  const packs = readLanguage(language)
  const fresh = (level: CEFRLevel) => modeStates({
    courses: packs.courses,
    taught: taughtCourses(packs.courses, level, new Set()),
    level,
    language,
    theory: packs.theory.find((pack) => pack.level === level) ?? null,
  })

  it('закрытый режим говорит, чем он открывается, а не «пока нечего»', () => {
    // Это и есть жалоба: на свежем B1 «Перевод» и «Тесты» молчали при 3 216 переводах и
    // 2 790 тестах на уровне. Молчание читается как поломка, поэтому оно запрещено.
    for (const level of LEVELS) {
      for (const mode of fresh(level)) {
        if (mode.ready) continue
        expect(mode.note.trim(), `${level} · ${mode.title} закрыт без объяснения`).not.toBe('')
      }
    }
  })

  it('на свежем уровне открыто узнавание, а производство ещё нет', () => {
    const states = fresh('B1')
    const state = (id: string) => states.find((item) => item.id === id)!
    expect(state('flashcard').ready, 'карточки доступны и в непройденных уроках').toBe(true)
    expect(state('translate').ready, 'производство — только по пройденному').toBe(false)
    expect(state('multiple_choice').ready).toBe(false)
    // И выбрана та ветка, что называет условие открытия, а не «такого здесь нет».
    const definition = PRACTICE_MODES.find((mode) => mode.id === 'translate')!
    expect(state('translate').note).toBe(definition.unlock)
  })

  it('отличает «ещё не пройдено» от «на уровне такого нет»', () => {
    // На A1 неправильных глаголов нет вовсе — и это другая причина, чем непройденный урок.
    const verbs = PRACTICE_MODES.find((mode) => mode.id === 'verbforms')!
    const a1 = fresh('A1').find((item) => item.id === 'verbforms')!
    expect(a1.ready).toBe(false)
    expect(a1.note, 'на A1 неправильных глаголов нет вовсе').toBe(verbs.missing)

    // А на B2 они есть в разборе, значит причина другая — урок ещё не пройден.
    const b2 = fresh('B2').find((item) => item.id === 'verbforms')!
    expect(b2.note).toBe(verbs.unlock)
  })

  it('режим, которого ещё нет, так и говорит', () => {
    const dialogue = fresh('B1').find((item) => item.id === 'dialogue')!
    expect(dialogue.ready).toBe(false)
    expect(dialogue.note).toMatch(/ещё не сделано/i)
  })

  it('подпись режима влезает в одну строку', () => {
    // «Строчки слишком высокие, типа в два ряда» — жалоба 12.09. Замер на 390×844: при
    // 34 знаках подпись держится одной строкой и все строки списка равны 66 px, при 42
    // переносится и строка вырастает до 77 px.
    for (const mode of PRACTICE_MODES) {
      for (const [what, text] of Object.entries({ note: mode.note, unlock: mode.unlock, missing: mode.missing, soon: mode.soon ?? '' })) {
        expect(text.length, `${mode.id}.${what} длиннее 34 знаков: «${text}»`).toBeLessThanOrEqual(34)
      }
    }
  })

  it('список режимов совпадает с тем, что умеет приложение', () => {
    // Строки экрана и виды практики — один список: разойдутся, и экран начнёт врать.
    const ids = PRACTICE_MODES.map((mode) => mode.id)
    expect(new Set(ids).size, 'повторов в списке нет').toBe(ids.length)
    for (const kind of PRACTICE_KINDS) {
      expect(ids, `вид практики ${kind.id} обязан быть строкой на экране`).toContain(kind.id)
    }
  })
})

describe('испанский на равных', () => {
  const packs = readLanguage('es')
  const cards = (level: CEFRLevel) => packs.courses
    .find((pack) => pack.level === level)!
    .chapters.flatMap((chapter) => chapter.lessons)
    .flatMap((lesson) => lesson.exercises)
    .filter((exercise) => exercise.type === 'flashcard')

  it('в словаре нет предложений и вопросов', () => {
    // Отбор писался под английский, и на испанском давал 10% вместо 58%. Правила теперь
    // свои (`core/spanish.ts`), а этот тест закрепляет, чего в словаре быть не должно.
    for (const level of ['A1', 'A2'] as CEFRLevel[]) {
      const units = cards(level).filter((card) => vocabularyUnit(card, 'es') !== null)
      expect(units.length, `${level}: словарь не пустой`).toBeGreaterThan(300)
      for (const unit of units) {
        const prompt = (unit.prompt ?? '').trim()
        expect(prompt.startsWith('¿'), `${unit.id}: вопрос — не единица`).toBe(false)
        expect(prompt, `${unit.id}: без многоточия`).not.toContain('…')
        expect(prompt.split(/\s+/).length, `${unit.id}: не длиннее группы`).toBeLessThanOrEqual(4)
      }
    }
  })

  it('личная форма глагола не пускает предложение в словарь', () => {
    // `\bestá\b` не совпадало с «El bar está lleno» никогда: после «á» в JavaScript нет
    // границы слова, и предложения с «está», «será», «sé» молча проходили как единицы.
    const sentence = { id: 'x', type: 'flashcard' as const, prompt: 'El bar está lleno.', translation: 'В баре битком.' }
    expect(vocabularyUnit(sentence, 'es')).toBeNull()
    expect(hasSpanishVerb('El bar está lleno')).toBe(true)
    expect(hasSpanishVerb('No sé nada')).toBe(true)

    // А именная группа остаётся единицей.
    const group = { id: 'y', type: 'flashcard' as const, prompt: 'un litro de leche', translation: 'литр молока' }
    expect(vocabularyUnit(group, 'es')).toBe('phrase')
    expect(hasSpanishVerb('un litro de leche')).toBe(false)
  })

  it('в аудировании нет обрывков, но есть вопросы', () => {
    for (const level of ['A1', 'A2'] as CEFRLevel[]) {
      const pool = ListeningEngine.pool(packs.courses, level, 'es')
      expect(pool.length, `${level}: хватает на набор`).toBeGreaterThanOrEqual(8)
      let questions = 0
      for (const exercise of pool) {
        const item = listeningPhrase(exercise, 'es')!
        expect(item.text, `${exercise.id}: не оборванная фраза`).not.toContain('…')
        expect(item.text.split(/\s+/).length, `${exercise.id}: несёт структуру`).toBeGreaterThanOrEqual(3)
        // Обрывок реплики — это фраза без глагола: «Dos tostadas y dos cafés.»
        expect(hasSpanishVerb(item.text), `${exercise.id}: в фразе есть глагол`).toBe(true)
        if (item.text.startsWith('¿')) questions += 1
      }
      // Вопросы обязаны быть: прежнее правило `^[A-Z]` выбрасывало их все, а на слух
      // вопрос — самое частое, что приходится разбирать.
      expect(questions, `${level}: вопросы попадают в набор`).toBeGreaterThan(0)
    }
  })

  it('сочинительный союз в начале — обрывок, предложная группа — нет', () => {
    const fragment = { id: 'f', type: 'flashcard' as const, prompt: 'Y poco más.', translation: 'Вот, пожалуй, и всё.' }
    expect(listeningPhrase(fragment, 'es')).toBeNull()

    // А это полное предложение, хотя начинается с предлога.
    const whole = { id: 'w', type: 'flashcard' as const, prompt: 'Al final no fui a la fiesta.', translation: 'В итоге я не пошёл на праздник.' }
    expect(listeningPhrase(whole, 'es')).not.toBeNull()
  })
})

describe('новые форматы заданий', () => {
  const packs = readLanguage('en')
  const state = freshState()

  describe('найди пару', () => {
    const rounds = PairsEngine.build({
      courses: packs.courses, level: 'B1', language: 'en', state, rounds: 4, random: () => 0.42,
    })

    it('набор решаем: ни одинаковых слов, ни одинаковых переводов', () => {
      // Иначе человек соединяет верно, а приложение считает это промахом. В курсе есть
      // «la próxima» и «la próxima vez» с одним переводом — в одном наборе они бы
      // встретились неизбежно.
      expect(rounds.length).toBeGreaterThan(0)
      for (const round of rounds) {
        expect(round.length, 'набор всегда полный').toBe(PAIRS_IN_ROUND)
        expect(new Set(round.map((pair) => pair.term.toLowerCase())).size).toBe(PAIRS_IN_ROUND)
        expect(new Set(round.map((pair) => pair.meaning.toLowerCase())).size).toBe(PAIRS_IN_ROUND)
        for (const pair of round) {
          expect(pair.exerciseID, 'пара знает своё упражнение').toBeTruthy()
        }
      }
    })

    it('в парах только лексические единицы, а не обрывки реплик', () => {
      // Материал общий с режимом слов: обрывок в паре не с чем соединять.
      const pool = PairsEngine.pool(packs.courses, 'B1', 'en')
      expect(pool.length).toBe(VocabularyEngine.count(packs.courses, 'B1', 'en'))
      for (const round of rounds) {
        for (const pair of round) {
          expect(pair.term).not.toContain('…')
          expect(pair.term.split(/\s+/).length).toBeLessThanOrEqual(3)
        }
      }
    })

    it('правая колонка — те же переводы в другом порядке', () => {
      const round = rounds[0]
      const meanings = PairsEngine.meanings(round, () => 0.7)
      expect([...meanings].sort()).toEqual(round.map((pair) => pair.meaning).sort())
    })
  })

  describe('что ты слышишь', () => {
    const questions = HearingEngine.build({
      courses: packs.courses, level: 'B1', language: 'en', state, size: 6, random: () => 0.31,
    })

    it('четыре варианта, и верный среди них', () => {
      expect(questions.length).toBe(6)
      for (const question of questions) {
        expect(question.options.length).toBe(HEARING_OPTIONS)
        expect(question.options).toContain(question.text)
        expect(new Set(question.options).size, 'вариантов-двойников нет').toBe(HEARING_OPTIONS)
      }
    })

    it('приманки — настоящие фразы уровня, а не выдумка', () => {
      const said = new Set(
        HearingEngine.pool(packs.courses, 'B1', 'en')
          .map((exercise) => listeningPhrase(exercise, 'en')?.text)
          .filter(Boolean) as string[],
      )
      for (const question of questions) {
        for (const option of question.options) {
          expect(said.has(option), `«${option}» нет в курсе`).toBe(true)
        }
      }
    })

    it('вопросы не повторяются в одном заходе', () => {
      expect(new Set(questions.map((question) => question.text)).size).toBe(questions.length)
    })

    it('уровень без фраз режим не открывает', () => {
      // Четыре фразы — минимум, иначе нечем набрать варианты, и режим честнее считать пустым.
      const empty = HearingEngine.count([], 'B1', 'en')
      expect(empty).toBe(0)
    })
  })
})

describe('картинки к словам', () => {
  const pack = decodePictures(readJSON('en/pictures.json'), 'en')
  const packs = readLanguage('en')
  const publicDir = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'public')

  it('карта не пустая и слова в нижнем регистре', () => {
    expect(pack.byWord.size).toBeGreaterThan(200)
    for (const word of pack.byWord.keys()) {
      expect(word, `«${word}» должно быть в нижнем регистре`).toBe(word.toLowerCase())
    }
  })

  it('у каждой картинки из карты есть файл', () => {
    // Храповик: битая картинка в приложении выглядит как поломка, а поймать её глазами
    // нельзя — карта на 248 слов.
    const broken: string[] = []
    for (const [word, hex] of pack.byWord) {
      if (!existsSync(join(publicDir, pictureURL(hex)))) broken.push(`${word} → ${hex}`)
    }
    expect(broken, `нет файлов картинок:\n${broken.join('\n')}`).toEqual([])
  })

  it('картинка ищется по слову, а не по строке', () => {
    expect(pictureFor('dog', pack)).toBeTruthy()
    expect(pictureFor('Dog', pack), 'регистр не важен').toBe(pictureFor('dog', pack))
    expect(pictureFor('dog.', pack), 'точка снимается').toBe(pictureFor('dog', pack))
    expect(pictureFor('the dog', pack), 'артикль снимается: на карточках слово стоит с ним').toBe(pictureFor('dog', pack))
    expect(pictureFor('my dog', pack), 'притяжательное тоже').toBe(pictureFor('dog', pack))
    expect(pictureFor('a hard day', pack), 'а группу из двух слов нарисовать нельзя').toBeNull()
    expect(pictureFor('freedom', pack), 'чего нельзя нарисовать — того нет').toBeNull()
    expect(pictureFor('dog', null), 'без карты режим пуст, а не сломан').toBeNull()
  })

  it('в вопросе четыре разных картинки и верная среди них', () => {
    const questions = PictureEngine.build({
      courses: packs.courses, level: 'B1', language: 'en', pictures: pack,
      state: freshState(), size: 8, random: () => 0.37,
    })
    expect(questions.length).toBeGreaterThan(0)
    for (const question of questions) {
      expect(question.options.length).toBe(PICTURE_OPTIONS)
      expect(question.options).toContain(question.hex)
      // У «day» и «sun» картинка одна: две одинаковые плитки сделали бы вопрос нерешаемым.
      expect(new Set(question.options).size).toBe(PICTURE_OPTIONS)
      expect(pictureFor(question.word, pack)).toBe(question.hex)
    }
  })

  it('без карты режим просто пуст', () => {
    expect(PictureEngine.count(packs.courses, 'B1', 'en', null)).toBe(0)
    expect(PictureEngine.build({
      courses: packs.courses, level: 'B1', language: 'en', pictures: null, state: freshState(),
    })).toEqual([])
  })
})
