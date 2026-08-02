import { check } from './answer'
import { ReviewEngine } from './engines'
import type { AnswerResult, Exercise, Lesson, UserState } from './types'

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
  /** Set when the current attempt created a fresh review item, so it can be undone. */
  private lastCreatedReviewID: string | null = null

  constructor(state: UserState) {
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
   * `recordsCompletion: false` for generated sets (practice, daily review): finishing
   * them must not put a synthetic lesson id into the learner's completed lessons.
   */
  start(lesson: Lesson, options: { recordsCompletion?: boolean } = {}): void {
    this.activeLesson = lesson
    this.recordsCompletion = options.recordsCompletion ?? true
    this.exerciseIndex = 0
    this.feedback = null
    this.retryUsed = false
  }

  submitText(answer: string, now: Date = new Date()): AnswerResult {
    const exercise = this.currentExercise
    if (!exercise) return { isCorrect: false, verdict: 'wrong', canonical: '' }
    const learnerApproved = this.state.acceptedAnswers?.[exercise.id] ?? []
    const result = check(answer, exercise.canonicalAnswer ?? '', [...(exercise.acceptedAnswers ?? []), ...learnerApproved])
    this.lastAnswer = answer
    this.record(exercise, result, now)
    return result
  }

  submitChoice(choice: string, now: Date = new Date()): AnswerResult {
    const exercise = this.currentExercise
    if (!exercise) return { isCorrect: false, verdict: 'wrong', canonical: '' }
    const result = check(choice, exercise.correctOption ?? '', [])
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
    const result = check(answer, phrase)
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
   * "Я был прав": the learner's phrasing is remembered for this exercise, the attempt
   * is flipped, and the spaced repetition penalty this answer just caused is undone.
   * Without the last part the escape hatch would still punish a correct answer.
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

    if (this.lastCreatedReviewID) {
      this.state.reviews = this.state.reviews.filter((item) => item.id !== this.lastCreatedReviewID)
      this.lastCreatedReviewID = null
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

  /** Test helper: answers the current exercise correctly, whatever its type. */
  completeCurrentCorrectly(now: Date = new Date()): void {
    const exercise = this.currentExercise
    if (!exercise) return
    switch (exercise.type) {
      case 'info':
      case 'flashcard':
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

  private record(exercise: Exercise, result: AnswerResult, now: Date): void {
    this.feedback = result
    this.lastCreatedReviewID = null
    this.state.attempts = [
      ...this.state.attempts,
      { id: crypto.randomUUID(), exerciseID: exercise.id, correct: result.isCorrect, date: now },
    ]
    const index = this.state.reviews.findIndex((item) => item.exerciseID === exercise.id)
    if (result.isCorrect) {
      this.state.points += 10
      if (index >= 0) {
        const reviews = [...this.state.reviews]
        reviews[index] = ReviewEngine.recordSuccess(reviews[index], now)
        this.state.reviews = reviews
      }
    } else if (index >= 0) {
      const reviews = [...this.state.reviews]
      reviews[index] = ReviewEngine.recordFailure(reviews[index], now)
      this.state.reviews = reviews
    } else {
      const item = ReviewEngine.newItem(exercise.id, now)
      this.state.reviews = [...this.state.reviews, item]
      this.lastCreatedReviewID = item.id
    }
  }
}
