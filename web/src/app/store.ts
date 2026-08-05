import { applyLanguage, loadLanguage, saveLanguage } from './language-choice'
import {
  CourseRouting,
  DEFAULT_LANGUAGE,
  LearningSession,
  LevelOrder,
  ListeningEngine,
  PlacementScorer,
  PRACTICE_KINDS,
  PracticeEngine,
  PracticeLog,
  ProgressionEngine,
  ShadowingEngine,
  TopicProgressEngine,
  freshState,
  languageOf,
  loadContent,
  localProgressStore,
  taughtCourses,
} from '../core'
import type {
  AnswerResult, CEFRLevel, CoursePack, Exercise, LanguageCode, LearningLanguage, Lesson, ListeningItem,
  PlacementQuestion, ShadowingItem, Syllabus, TopicProgress, UserState,
} from '../core'

export type Screen = 'map' | 'settings' | 'topics' | 'language'

/**
 * The web counterpart of AppModel.swift: one object owning content, profile and the
 * running lesson, with a subscribe hook so React can render it.
 *
 * The language sits above all of it. Switching it swaps the courses, the placement bank,
 * the syllabus, the saved progress and the voice — nothing is shared between them but
 * the interface itself.
 */
export class AppStore {
  /** `null` until the learner has picked a language; that is what opens the picker. */
  language: LanguageCode | null = null
  courses: CoursePack[] = []
  placementBank: PlacementQuestion[] = []
  syllabus: Syllabus | null = null
  state: UserState = freshState()
  session = new LearningSession(freshState())
  screen: Screen = 'map'
  startupError: string | null = null
  loading = true

  /** Speaking practice runs on the same session, but on its own screen. */
  shadowingActive = false
  shadowingItems: ShadowingItem[] = []

  /** Listening does the same: same session, its own screen, the text kept hidden. */
  listeningActive = false
  listeningItems: ListeningItem[] = []

  placementActive = false
  placementIndex = 0
  private placementCorrect = new Set<string>()
  private placementAnswered = new Set<string>()
  private lessonStartedAt: Date | null = null
  private listeners = new Set<() => void>()

  // MARK: - New version waiting
  //
  // The update installs itself, but it swaps the running code only while nothing is in
  // progress: a reload in the middle of an exercise would look like the app crashed.
  // In practice that means "on the next launch", which is what an update should feel like.

  updateReady = false
  private applyUpdate: (() => Promise<void>) | null = null

  /** True while the learner is inside something that must not be interrupted. */
  get isBusy(): boolean {
    return this.activeLesson !== null || this.placementActive || this.shadowingActive || this.listeningActive
  }

  onUpdateReady(apply: () => Promise<void>): void {
    this.applyUpdate = apply
    this.updateReady = true
    this.changed()
  }

  /** Called from the view whenever the screen is calm enough to swap versions. */
  applyUpdateIfIdle(): void {
    if (this.isBusy) return
    this.applyUpdateNow()
  }

  /** The same thing on request, from the banner or from settings. */
  applyUpdateNow(): void {
    if (!this.updateReady || !this.applyUpdate) return
    const apply = this.applyUpdate
    this.applyUpdate = null
    void apply()
  }

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

  /** Startup: nothing is fetched until it is known which language to fetch. */
  async load(): Promise<void> {
    const chosen = loadLanguage()
    if (!chosen) {
      this.loading = false
      this.changed()
      return
    }
    applyLanguage(chosen)
    await this.open(chosen)
  }

  /** Picking a language on the first screen, or switching to the other one later. */
  async selectLanguage(language: LanguageCode): Promise<void> {
    if (language === this.language) { this.screen = 'map'; this.changed(); return }
    saveLanguage(language)
    applyLanguage(language)
    this.loading = true
    this.screen = 'map'
    this.closeAllModes()
    this.changed()
    await this.open(language)
  }

  private async open(language: LanguageCode): Promise<void> {
    this.language = language
    this.startupError = null
    try {
      const { courses, placement, syllabus } = await loadContent(language)
      this.courses = courses
      this.placementBank = placement.questions
      this.syllabus = syllabus
      this.state = localProgressStore(language).load()
      this.session = new LearningSession(this.state, language)
    } catch (error) {
      this.startupError = error instanceof Error ? error.message : 'Не удалось загрузить учебные материалы'
    } finally {
      this.loading = false
      this.changed()
    }
  }

  /** A language switch must not leave a half-finished lesson from the other one on screen. */
  private closeAllModes(): void {
    this.shadowingActive = false
    this.shadowingItems = []
    this.listeningActive = false
    this.listeningItems = []
    this.placementActive = false
    this.session = new LearningSession(freshState(), this.language ?? DEFAULT_LANGUAGE)
  }

  // MARK: - Derived

  get languageChosen(): boolean { return this.language !== null }
  get currentLanguage(): LearningLanguage { return languageOf(this.language ?? DEFAULT_LANGUAGE) }
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

  /**
   * What practice may draw from: the part of the course the learner has actually been
   * taught. Everything that generates its own set — practice, shadowing, listening,
   * topic drills — is built on this rather than on the whole level.
   */
  get practiceCourses(): CoursePack[] { return taughtCourses(this.courses, this.selectedLevel, this.completed) }
  get practiceIsAvailable(): boolean { return PracticeEngine.pool(this.practiceCourses, this.selectedLevel).length > 0 }

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

  /**
   * The web counterpart of AppModel.updateReminder. The chosen hour used to live in the
   * settings screen's own state, so it was sent to the server and then forgotten: after
   * a reload the app showed 19:00 while the server had 8:00, and the next tap overwrote
   * the real choice with the one being displayed.
   */
  updateReminder(hour: number, enabled: boolean): void {
    if (!this.state.profile) return
    this.state.profile = { ...this.state.profile, reminderHour: hour, remindersEnabled: enabled }
    this.persist()
  }

  setScreen(screen: Screen): void { this.screen = screen; this.changed() }

  /** The picker can be opened from the map or from settings; back goes where it came from. */
  private returnScreen: Screen = 'map'
  openLanguages(): void {
    if (this.screen !== 'language') this.returnScreen = this.screen
    this.screen = 'language'
    this.changed()
  }
  closeLanguages(): void { this.screen = this.returnScreen; this.changed() }

  replaceState(state: UserState): void {
    this.state = state
    this.session = new LearningSession(state, this.language ?? DEFAULT_LANGUAGE)
    this.persist()
  }

  // MARK: - Lessons

  startLesson(lesson: Lesson, recordsCompletion = true): void {
    this.session = new LearningSession(this.state, this.language ?? DEFAULT_LANGUAGE)
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
    return PracticeEngine.counts(this.practiceCourses, this.selectedLevel)
  }

  startPractice(kindID = 'mixed'): void {
    const kind = PRACTICE_KINDS.find((item) => item.id === kindID) ?? PRACTICE_KINDS[0]
    const exercises = PracticeEngine.build({
      courses: this.practiceCourses, level: this.selectedLevel, state: this.state, types: kind.types,
    })
    if (exercises.length === 0) return
    this.startLesson(PracticeEngine.lesson(exercises, kind.title), false)
  }

  // MARK: - Grammar topics

  /** Every topic of this level and below, with the learner's record on it. */
  get topicProgress(): TopicProgress[] {
    if (!this.syllabus) return []
    return TopicProgressEngine.all(this.syllabus, this.courses, this.state, this.selectedLevel, this.practiceCourses)
  }

  /** Worst first, and only once there are enough attempts to mean anything. */
  get weakTopics(): TopicProgress[] {
    if (!this.syllabus) return []
    return TopicProgressEngine.weak(this.syllabus, this.courses, this.state, this.selectedLevel, this.practiceCourses)
  }

  startTopicPractice(topicID: string): void {
    const exercises = PracticeEngine.build({
      courses: this.practiceCourses, level: this.selectedLevel, state: this.state, topics: [topicID],
    })
    if (exercises.length === 0) return
    const title = this.syllabus?.topics.find((t) => t.id === topicID)?.title ?? 'Тренировка'
    this.startLesson(PracticeEngine.lesson(exercises, title), false)
  }

  // MARK: - Shadowing

  get shadowingCount(): number { return ShadowingEngine.count(this.practiceCourses, this.selectedLevel) }

  /** The phrase for the exercise the session is on, found by id rather than position. */
  get currentShadowingItem(): ShadowingItem | null {
    const id = this.session.currentExercise?.id
    return this.shadowingItems.find((item) => item.exerciseID === id) ?? null
  }

  get shadowingIsComplete(): boolean { return this.shadowingActive && this.session.isComplete }

  startShadowing(): void {
    const set = ShadowingEngine.build({ courses: this.practiceCourses, level: this.selectedLevel, state: this.state })
    if (set.exercises.length === 0) return
    this.shadowingItems = set.items
    this.shadowingActive = true
    this.startLesson(ShadowingEngine.lesson(set.exercises), false)
  }

  /** The learner's own verdict: it still feeds points and spaced repetition. */
  shadowingSelfAssess(correct: boolean): void { this.selfAssess(correct) }

  closeShadowing(): void {
    this.shadowingActive = false
    this.shadowingItems = []
    this.closeLesson()
  }

  // MARK: - Listening

  get listeningCount(): number { return ListeningEngine.count(this.practiceCourses, this.selectedLevel) }

  /** The sentence for the exercise the session is on, found by id rather than position. */
  get currentListeningItem(): ListeningItem | null {
    const id = this.session.currentExercise?.id
    return this.listeningItems.find((item) => item.exerciseID === id) ?? null
  }

  get listeningIsComplete(): boolean { return this.listeningActive && this.session.isComplete }

  startListening(): void {
    const set = ListeningEngine.build({ courses: this.practiceCourses, level: this.selectedLevel, state: this.state })
    if (set.exercises.length === 0) return
    this.listeningItems = set.items
    this.listeningActive = true
    this.startLesson(ListeningEngine.lesson(set.exercises), false)
  }

  /** Checked against the sentence that was played, which the exercise itself may not hold. */
  submitHeard(answer: string): void {
    const item = this.currentListeningItem
    if (!item) return
    this.session.submitHeard(answer, item.text)
    this.afterAttempt()
  }

  /** "Не разобрал": an honest miss, so the sentence comes back on another day. */
  revealHeard(): void { this.submitHeard('') }

  closeListening(): void {
    this.listeningActive = false
    this.listeningItems = []
    this.closeLesson()
  }

  closeLesson(): void {
    this.state = this.session.state
    this.bankPracticeTime()
    this.session = new LearningSession(this.state, this.language ?? DEFAULT_LANGUAGE)
    this.persist()
  }

  /** True when the current card is a repeat and should be recalled rather than read. */
  get currentIsRecall(): boolean { return this.session.currentIsRecall }

  /**
   * Used where nobody can mark the answer but the learner: speaking aloud, and recalling
   * a word from a card. Counts exactly like a checked answer, mistakes included.
   */
  selfAssess(correct: boolean): void {
    this.session.selfAssess(correct)
    this.state = this.session.state
    if (this.session.isComplete) this.bankPracticeTime()
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
      localProgressStore(this.language ?? DEFAULT_LANGUAGE).save(this.state)
    } catch {
      // A full or blocked storage must not break the lesson in progress.
    }
    this.changed()
  }
}

export const store = new AppStore()
