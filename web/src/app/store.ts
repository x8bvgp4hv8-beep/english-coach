import {
  CourseRouting,
  LearningSession,
  LevelOrder,
  PlacementScorer,
  PRACTICE_KINDS,
  PracticeEngine,
  PracticeLog,
  ProgressionEngine,
  freshState,
  loadContent,
  localProgressStore,
} from '../core'
import type {
  AnswerResult, CEFRLevel, CoursePack, Exercise, Lesson, PlacementQuestion, UserState,
} from '../core'

export type Screen = 'map' | 'settings'

/**
 * The web counterpart of AppModel.swift: one object owning content, profile and the
 * running lesson, with a subscribe hook so React can render it.
 */
export class AppStore {
  courses: CoursePack[] = []
  placementBank: PlacementQuestion[] = []
  state: UserState = freshState()
  session = new LearningSession(freshState())
  screen: Screen = 'map'
  startupError: string | null = null
  loading = true

  placementActive = false
  placementIndex = 0
  private placementCorrect = new Set<string>()
  private placementAnswered = new Set<string>()
  private lessonStartedAt: Date | null = null
  private listeners = new Set<() => void>()

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private changed(): void {
    this.snapshot = {}
    this.listeners.forEach((listener) => listener())
  }

  /** useSyncExternalStore compares by identity, so hand it a fresh object per change. */
  snapshot: object = {}
  getSnapshot = (): object => this.snapshot

  async load(): Promise<void> {
    try {
      const { courses, placement } = await loadContent()
      this.courses = courses
      this.placementBank = placement.questions
      this.state = localProgressStore.load()
      this.session = new LearningSession(this.state)
    } catch (error) {
      this.startupError = error instanceof Error ? error.message : 'Не удалось загрузить учебные материалы'
    } finally {
      this.loading = false
      this.changed()
    }
  }

  // MARK: - Derived

  get isOnboarding(): boolean { return this.state.profile === null }
  get selectedLevel(): CEFRLevel { return this.state.profile?.selectedLevel ?? 'A1' }
  get selectedCourse(): CoursePack | undefined { return this.courses.find((c) => c.level === this.selectedLevel) }
  get currentLessons(): Lesson[] { return this.selectedCourse?.chapters.flatMap((c) => c.lessons) ?? [] }
  get completed(): Set<string> { return new Set(this.state.completedLessonIDs) }
  get recommendedLesson(): Lesson | null {
    return CourseRouting.nextLesson(this.currentLessons, this.completed) ?? this.currentLessons[0] ?? null
  }
  get dueCount(): number { return this.state.reviews.filter((item) => item.due.getTime() <= Date.now()).length }
  get activeLesson(): Lesson | null { return this.session.activeLesson }
  get currentExercise(): Exercise | null { return this.session.currentExercise }
  get feedback(): AnswerResult | null { return this.session.feedback }
  get totalPoints(): number { return this.state.points }
  get currentLevelProgress(): number {
    return ProgressionEngine.levelProgress(this.selectedLevel, this.courses, this.completed)
  }
  get dailyGoalMinutes(): number { return this.state.profile?.dailyGoalMinutes ?? 10 }
  get todayPracticeMinutes(): number { return PracticeLog.minutes(this.state.practiceSeconds, new Date()) }
  get dailyGoalProgress(): number { return Math.min(1, this.todayPracticeMinutes / Math.max(1, this.dailyGoalMinutes)) }
  get dailyGoalReached(): boolean { return this.todayPracticeMinutes >= this.dailyGoalMinutes }
  get practiceIsAvailable(): boolean { return PracticeEngine.pool(this.courses, this.selectedLevel).length > 0 }

  get suggestedNextLevel(): CEFRLevel | null {
    const dismissed = new Set(this.state.levelUpDismissed ?? [])
    if (!ProgressionEngine.shouldSuggestAdvance(this.selectedLevel, this.courses, this.completed, this.state.attempts, dismissed)) {
      return null
    }
    return LevelOrder.next(this.selectedLevel)
  }

  streak(): number {
    const days = new Set(this.state.attempts.map((a) => PracticeLog.dayKey(a.date)))
    const cursor = new Date()
    if (!days.has(PracticeLog.dayKey(cursor))) cursor.setDate(cursor.getDate() - 1)
    let count = 0
    while (days.has(PracticeLog.dayKey(cursor))) {
      count += 1
      cursor.setDate(cursor.getDate() - 1)
    }
    return count
  }

  chapterTitle(lesson: Lesson): string | undefined {
    return this.selectedCourse?.chapters.find((c) => c.lessons.some((l) => l.id === lesson.id))?.title
  }

  lessonIsUnlocked(lesson: Lesson): boolean {
    const index = this.currentLessons.findIndex((l) => l.id === lesson.id)
    return CourseRouting.isUnlocked(index, this.currentLessons, this.completed)
  }

  // MARK: - Profile

  completeOnboarding(level: CEFRLevel, dailyGoal: number): void {
    this.state.profile = {
      selectedLevel: level, dailyGoalMinutes: dailyGoal, reminderHour: 19, reminderMinute: 0, remindersEnabled: false,
    }
    this.persist()
  }

  selectLevel(level: CEFRLevel): void {
    if (!this.state.profile) return
    this.state.profile = { ...this.state.profile, selectedLevel: level }
    this.screen = 'map'
    this.persist()
  }

  updateGoal(minutes: number): void {
    if (!this.state.profile) return
    this.state.profile = { ...this.state.profile, dailyGoalMinutes: minutes }
    this.persist()
  }

  setScreen(screen: Screen): void { this.screen = screen; this.changed() }

  replaceState(state: UserState): void {
    this.state = state
    this.session = new LearningSession(state)
    this.persist()
  }

  // MARK: - Lessons

  startLesson(lesson: Lesson, recordsCompletion = true): void {
    this.session = new LearningSession(this.state)
    this.session.start(lesson, { recordsCompletion })
    this.lessonStartedAt = new Date()
    this.changed()
  }

  startReview(): void {
    const dueIDs = new Set(this.state.reviews.filter((r) => r.due.getTime() <= Date.now()).map((r) => r.exerciseID))
    const exercises = this.courses
      .flatMap((c) => c.chapters).flatMap((c) => c.lessons).flatMap((l) => l.exercises)
      .filter((e) => dueIDs.has(e.id))
    if (exercises.length === 0) return
    this.startLesson({
      id: 'daily-review',
      title: 'Повторение',
      summary: 'Закрепи сложные фразы.',
      estimatedMinutes: Math.max(2, exercises.length),
      exercises,
    }, false)
  }

  get practiceCounts(): Record<string, number> {
    return PracticeEngine.counts(this.courses, this.selectedLevel)
  }

  startPractice(kindID = 'mixed'): void {
    const kind = PRACTICE_KINDS.find((item) => item.id === kindID) ?? PRACTICE_KINDS[0]
    const exercises = PracticeEngine.build({
      courses: this.courses, level: this.selectedLevel, state: this.state, types: kind.types,
    })
    if (exercises.length === 0) return
    this.startLesson(PracticeEngine.lesson(exercises, kind.title), false)
  }

  closeLesson(): void {
    this.state = this.session.state
    this.bankPracticeTime()
    this.session = new LearningSession(this.state)
    this.persist()
  }

  submitText(answer: string): void { this.session.submitText(answer); this.afterAttempt() }
  submitChoice(choice: string): void { this.session.submitChoice(choice); this.afterAttempt() }
  completePassive(): void { this.session.completePassiveExercise(); this.afterAttempt() }
  markLastAnswerCorrect(): void { this.session.markLastAnswerCorrect(); this.afterAttempt() }
  retry(): void { this.session.retry(); this.changed() }

  advance(): void {
    this.session.advance()
    this.state = this.session.state
    if (this.session.isComplete) this.bankPracticeTime()
    this.persist()
  }

  private afterAttempt(): void {
    this.state = this.session.state
    this.persist()
  }

  // MARK: - Level up

  advanceToSuggestedLevel(): void {
    const next = this.suggestedNextLevel
    if (next) this.selectLevel(next)
  }

  dismissLevelUp(): void {
    const list = this.state.levelUpDismissed ?? []
    if (!list.includes(this.selectedLevel)) this.state.levelUpDismissed = [...list, this.selectedLevel]
    this.persist()
  }

  // MARK: - Placement

  get hasPlacementTest(): boolean { return this.placementBank.length > 0 }

  get placementQuestions(): PlacementQuestion[] {
    return [...this.placementBank].sort((a, b) => {
      const byLevel = LevelOrder.all.indexOf(a.level) - LevelOrder.all.indexOf(b.level)
      return byLevel !== 0 ? byLevel : a.id.localeCompare(b.id)
    })
  }

  get currentPlacementQuestion(): PlacementQuestion | null {
    return this.placementQuestions[this.placementIndex] ?? null
  }

  get placementFinished(): boolean {
    if (!this.placementActive) return false
    if (this.placementIndex >= this.placementQuestions.length) return true
    return PlacementScorer.isDecided(this.placementBank, this.placementAnswered, this.placementCorrect)
  }

  /** Climbing progress: the number of remaining questions is not known in advance. */
  get placementProgress(): number {
    const question = this.currentPlacementQuestion
    if (!question) return 1
    const levelIndex = LevelOrder.all.indexOf(question.level)
    const inLevel = this.placementQuestions.filter((q) => q.level === question.level)
    const answered = inLevel.filter((q) => this.placementAnswered.has(q.id)).length
    return (levelIndex + (inLevel.length ? answered / inLevel.length : 0)) / LevelOrder.all.length
  }

  get placementRecommendedLevel(): CEFRLevel {
    return PlacementScorer.recommend(this.placementBank, this.placementCorrect)
  }

  startPlacement(): void {
    this.placementActive = true
    this.placementIndex = 0
    this.placementCorrect = new Set()
    this.placementAnswered = new Set()
    this.changed()
  }

  cancelPlacement(): void {
    this.placementActive = false
    this.placementIndex = 0
    this.placementCorrect = new Set()
    this.placementAnswered = new Set()
    this.changed()
  }

  answerPlacement(option: string): void {
    const question = this.currentPlacementQuestion
    if (!question) return
    this.placementAnswered.add(question.id)
    if (option === question.correctOption) this.placementCorrect.add(question.id)
    this.placementIndex += 1
    this.changed()
  }

  // MARK: - Time and persistence

  private bankPracticeTime(now: Date = new Date()): void {
    if (!this.lessonStartedAt) return
    const seconds = (now.getTime() - this.lessonStartedAt.getTime()) / 1000
    this.lessonStartedAt = null
    this.state.practiceSeconds = PracticeLog.adding(seconds, this.state.practiceSeconds, now)
  }

  private persist(): void {
    try {
      localProgressStore.save(this.state)
    } catch {
      // A full or blocked storage must not break the lesson in progress.
    }
    this.changed()
  }
}

export const store = new AppStore()
