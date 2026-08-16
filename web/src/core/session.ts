import { check } from './answer'
import { ReviewEngine } from './engines'
import { DEFAULT_LANGUAGE } from './language'
import type { LanguageCode } from './language'
import { seenExerciseIDs, trimAttempts } from './types'
import type { AnswerResult, Exercise, Lesson, ReviewItem, UserState } from './types'

/**
 * Mirrors EnglishCoachCore/LearningSession.swift.
 * Swift uses a mutating struct; here it is a class that owns a copy of the state
 * and hands it back through `state`.
 */
export class LearningSession {
  state: UserState
  activeLesson: Lesson | null = null
  exerciseIndex = 0
  feedback: AnswerResult | null = null
  retryUsed = false
  private recordsCompletion = true
  private lastAnswer: string | null = null
  /** Enough to redo the last attempt as if it had been right, for the escape hatch. */
  private lastReview: { exerciseID: string; before: ReviewItem | null; at: Date } | null = null
  /**
   * Exercises the learner had already met when this set was opened. Taken once at
   * `start` rather than read live, so a card does not change shape under the learner's
   * hands the moment they answer it, or on the way back through `goBack`.
   */
  private seenBefore = new Set<string>()

  /** Which language is being learnt: the checker judges Spanish by Spanish rules. */
  constructor(state: UserState, readonly language: LanguageCode = DEFAULT_LANGUAGE) {
    this.state = state
  }

  get currentExercise(): Exercise | null {
    const lesson = this.activeLesson
    if (!lesson || this.exerciseIndex < 0 || this.exerciseIndex >= lesson.exercises.length) return null
    return lesson.exercises[this.exerciseIndex]
  }

  get isComplete(): boolean {
    return this.activeLesson !== null && this.exerciseIndex >= this.activeLesson.exercises.length
  }

  get canGoBack(): boolean {
    return this.exerciseIndex > 0
  }

  /**
   * A card met for the first time is something to read; the same card met again is a
   * word to recall.
   *
   * Without this every flashcard was passive for ever: it showed both sides at once and
   * the "Запомнил" button recorded a correct answer whether or not anything had been
   * remembered, so a word nobody knew was scheduled as one that had been recalled. Recall
   * makes the second meeting a question, so "не вспомнил" is finally something the app
   * can hear.
   */
  get currentIsRecall(): boolean {
    const exercise = this.currentExercise
    return exercise !== null && exercise.type === 'flashcard' && this.seenBefore.has(exercise.id)
  }

  /**
   * `recordsCompletion: false` for generated sets (practice, daily review): finishing
   * them must not put a synthetic lesson id into the learner's completed lessons.
   */
  start(lesson: Lesson, options: { recordsCompletion?: boolean } = {}): void {
    this.activeLesson = lesson
    this.recordsCompletion = options.recordsCompletion ?? true
    this.exerciseIndex = 0
    this.feedback = null
    this.retryUsed = false
    this.seenBefore = seenExerciseIDs(this.state)
  }

  submitText(answer: string, now: Date = new Date()): AnswerResult {
    const exercise = this.currentExercise
    if (!exercise) return { isCorrect: false, verdict: 'wrong', canonical: '' }
    const learnerApproved = this.state.acceptedAnswers?.[exercise.id] ?? []
    const result = check(answer, exercise.canonicalAnswer ?? '', [...(exercise.acceptedAnswers ?? []), ...learnerApproved], this.language)
    this.lastAnswer = answer
    this.record(exercise, result, now)
    return result
  }

  submitChoice(choice: string, now: Date = new Date()): AnswerResult {
    const exercise = this.currentExercise
    if (!exercise) return { isCorrect: false, verdict: 'wrong', canonical: '' }
    const result = check(choice, exercise.correctOption ?? '', [], this.language)
    this.lastAnswer = choice
    this.record(exercise, result, now)
    return result
  }

  /**
   * Listening: the sentence being checked is the one that was played, and that is not
   * always the exercise's own answer — a gap fill is played as the whole sentence. So
   * the expected text comes from the caller rather than from the exercise.
   */
  submitHeard(answer: string, phrase: string, now: Date = new Date()): AnswerResult {
    const exercise = this.currentExercise
    if (!exercise) return { isCorrect: false, verdict: 'wrong', canonical: phrase }
    const result = check(answer, phrase, [], this.language)
    this.record(exercise, result, now)
    return result
  }

  completePassiveExercise(now: Date = new Date()): void {
    const exercise = this.currentExercise
    if (!exercise) return
    this.record(exercise, { isCorrect: true, verdict: 'correct', canonical: exercise.prompt ?? exercise.title ?? '' }, now)
    this.advance()
  }

  /**
   * Shadowing has no answer to check: the learner hears the phrase, says it, hears
   * both takes and decides. Their verdict still counts, so a phrase that did not
   * come out of the mouth comes back like any other mistake.
   */
  selfAssess(correct: boolean, now: Date = new Date()): void {
    const exercise = this.currentExercise
    if (!exercise) return
    const canonical = exercise.canonicalAnswer ?? exercise.prompt ?? ''
    this.record(exercise, { isCorrect: correct, verdict: correct ? 'correct' : 'wrong', canonical }, now)
    this.advance()
  }

  /**
   * "Я был прав": the learner's phrasing is remembered for this exercise, the attempt is
   * flipped, and the exercise is rescheduled as if the answer had been right. Without the
   * last part the escape hatch would still punish a correct answer.
   */
  markLastAnswerCorrect(): void {
    const exercise = this.currentExercise
    const answer = this.lastAnswer
    if (!exercise || !answer || this.feedback?.isCorrect !== false) return

    const approved = this.state.acceptedAnswers ?? {}
    const forExercise = approved[exercise.id] ?? []
    this.state.acceptedAnswers = { ...approved, [exercise.id]: [...forExercise, answer] }

    const attempts = [...this.state.attempts]
    for (let i = attempts.length - 1; i >= 0; i -= 1) {
      if (attempts[i].exerciseID === exercise.id) {
        attempts[i] = { ...attempts[i], correct: true }
        break
      }
    }
    this.state.attempts = attempts
    this.state.points += 10

    // Not "remove the penalty" but "reschedule as if the answer had been right": the
    // exercise was still answered, and it is still due one day from now like any other.
    if (this.lastReview && this.lastReview.exerciseID === exercise.id) {
      const { before, at } = this.lastReview
      const corrected = ReviewEngine.recordSuccess(before ?? ReviewEngine.newItem(exercise.id, at), at)
      const index = this.state.reviews.findIndex((item) => item.exerciseID === exercise.id)
      if (index >= 0) {
        const reviews = [...this.state.reviews]
        reviews[index] = corrected
        this.state.reviews = reviews
      }
      this.lastReview = null
    }
    this.feedback = { isCorrect: true, verdict: 'correct', canonical: exercise.canonicalAnswer ?? '' }
  }

  advance(): void {
    this.feedback = null
    this.retryUsed = false
    this.exerciseIndex += 1
    const lesson = this.activeLesson
    if (
      lesson && this.recordsCompletion &&
      this.exerciseIndex >= lesson.exercises.length &&
      !this.state.completedLessonIDs.includes(lesson.id)
    ) {
      this.state.completedLessonIDs = [...this.state.completedLessonIDs, lesson.id]
    }
  }

  retry(): void {
    this.retryUsed = true
    this.feedback = null
  }

  goBack(): void {
    if (this.exerciseIndex <= 0) return
    this.feedback = null
    this.retryUsed = false
    this.exerciseIndex -= 1
  }

  /**
   * Test helper: answers the current exercise correctly, whatever its type.
   *
   * `dialogue` belongs with the other passive steps and was missing here, while the
   * Swift twin has had it all along — its switch over an enum has to be exhaustive, and
   * TypeScript's does not. Nothing caught it because every caller loops until the lesson
   * is complete, and English had no dialogues to loop on: the first English unit built
   * the proper way hung the whole suite instead of failing it.
   */
  completeCurrentCorrectly(now: Date = new Date()): void {
    const exercise = this.currentExercise
    if (!exercise) return
    switch (exercise.type) {
      case 'info':
      case 'flashcard':
      case 'dialogue':
        this.completePassiveExercise(now)
        break
      case 'multiple_choice':
        this.submitChoice(exercise.correctOption ?? '', now)
        this.advance()
        break
      case 'translate':
      case 'word_order':
        this.submitText(exercise.canonicalAnswer ?? '', now)
        this.advance()
        break
    }
  }

  /**
   * Every answer schedules the exercise; only the interval differs.
   *
   * A review item used to be created on failure alone, so anything answered correctly
   * the first time was never scheduled again — which is the opposite of what spaced
   * repetition is for. The engine had always been able to do it: `recordSuccess` walks
   * 1 → 3 → 7 days and then multiplies by ease, and nothing ever called it on a first
   * correct answer. What the app had was a queue of mistakes wearing an SRS coat.
   */
  private record(exercise: Exercise, result: AnswerResult, now: Date): void {
    this.feedback = result
    this.state.attempts = trimAttempts([
      ...this.state.attempts,
      { id: crypto.randomUUID(), exerciseID: exercise.id, correct: result.isCorrect, date: now },
    ])
    if (result.isCorrect) this.state.points += 10

    // Reading a rule again and listening to the same dialogue again are exposure, not
    // practice — the syllabus counter already refuses to count them. Scheduling them
    // meant a session capped at twenty spending a seventh of itself on "Дальше".
    if (exercise.type === 'info' || exercise.type === 'dialogue') return

    const index = this.state.reviews.findIndex((item) => item.exerciseID === exercise.id)
    const known = index >= 0 ? this.state.reviews[index] : null
    const base = known ?? ReviewEngine.newItem(exercise.id, now)
    const updated = result.isCorrect ? ReviewEngine.recordSuccess(base, now) : ReviewEngine.recordFailure(base, now)
    this.lastReview = { exerciseID: exercise.id, before: known, at: now }

    if (known) {
      const reviews = [...this.state.reviews]
      reviews[index] = updated
      this.state.reviews = reviews
    } else {
      this.state.reviews = [...this.state.reviews, updated]
    }
  }
}
