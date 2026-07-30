import Foundation
import Observation
import EnglishCoachCore

@MainActor
@Observable
final class AppModel {
    enum Screen { case map, catalog, settings }

    private(set) var courses: [CoursePack]
    private(set) var placementBank: [PlacementQuestion]
    private(set) var state: UserState
    private(set) var session: LearningSession
    var screen: Screen = .map
    var startupError: String?
    var transientError: String?
    private let store: any ProgressStoring

    // Placement test runtime state
    private(set) var placementActive = false
    private(set) var placementIndex = 0
    private var placementCorrect: Set<String> = []
    private var placementAnswered: Set<String> = []
    private(set) var placementLastCorrect: Bool?

    init(courses: [CoursePack], placementBank: [PlacementQuestion] = [], state: UserState, store: any ProgressStoring) {
        self.courses = courses; self.placementBank = placementBank; self.state = state; self.store = store
        self.session = LearningSession(state: state)
    }

    static func live() -> AppModel {
        let store = ProgressStore.live
        do {
            let bank = (try? ContentRepository.loadPlacement())?.questions ?? []
            return AppModel(courses: try ContentRepository.loadBundled(), placementBank: bank, state: try store.load(), store: store)
        } catch {
            let model = AppModel(courses: [], state: .fresh, store: store)
            model.startupError = "Не удалось загрузить учебные материалы: \(error.localizedDescription)"
            return model
        }
    }

    var isOnboarding: Bool { state.profile == nil }
    var selectedLevel: CEFRLevel { state.profile?.selectedLevel ?? .a1 }
    var selectedCourse: CoursePack? { courses.first { $0.level == selectedLevel } }
    var currentLessons: [Lesson] { selectedCourse?.chapters.flatMap(\.lessons) ?? [] }
    var recommendedLesson: Lesson? { CourseRouting.nextLesson(in: currentLessons, completed: state.completedLessonIDs) ?? currentLessons.first }
    var dueCount: Int { state.reviews.filter { $0.due <= .now }.count }
    var currentExercise: Exercise? { session.currentExercise }
    var activeLesson: Lesson? { session.activeLesson }
    var feedback: AnswerResult? { session.feedback }
    var lessonIsComplete: Bool { session.isComplete }
    var totalPoints: Int { state.points }

    func completeOnboarding(level: CEFRLevel, dailyGoal: Int, reminderHour: Int) {
        state.profile = UserProfile(selectedLevel: level, dailyGoalMinutes: dailyGoal, reminderHour: reminderHour, reminderMinute: 0, remindersEnabled: false)
        syncAndSave()
    }

    func selectLevel(_ level: CEFRLevel) {
        guard var profile = state.profile else { return }
        profile.selectedLevel = level; state.profile = profile; screen = .map
        syncAndSave()
    }

    func updateGoal(_ minutes: Int) {
        guard var profile = state.profile else { return }
        profile.dailyGoalMinutes = minutes; state.profile = profile; syncAndSave()
    }

    func updateReminder(enabled: Bool, hour: Int) {
        guard var profile = state.profile else { return }
        profile.remindersEnabled = enabled; profile.reminderHour = hour; state.profile = profile
        syncAndSave()
    }

    func startLesson(_ lesson: Lesson, recordsCompletion: Bool = true) {
        session = LearningSession(state: state)
        session.start(lesson, recordsCompletion: recordsCompletion)
        lessonStartedAt = .now
    }

    /// Endless practice: the course runs out in an evening, the habit needs longer.
    var practiceIsAvailable: Bool { !PracticeEngine.pool(courses: courses, level: selectedLevel).isEmpty }
    var practiceCounts: [String: Int] { PracticeEngine.counts(courses: courses, level: selectedLevel) }

    func startPractice(kindID: String = "mixed") {
        let kind = PracticeEngine.kinds.first { $0.id == kindID } ?? PracticeEngine.kinds[0]
        let exercises = PracticeEngine.build(courses: courses, level: selectedLevel, state: state, types: kind.types)
        guard !exercises.isEmpty else { return }
        startLesson(PracticeEngine.lesson(exercises, title: kind.title), recordsCompletion: false)
    }
    func closeLesson() { state = session.state; bankPracticeTime(); session = LearningSession(state: state); save() }

    // MARK: - Shadowing (speaking practice runs on the same session, on its own screen)

    private(set) var shadowingActive = false
    private(set) var shadowingItems: [ShadowingItem] = []

    var shadowingCount: Int { ShadowingEngine.count(courses: courses, level: selectedLevel) }
    var shadowingIsComplete: Bool { shadowingActive && session.isComplete }

    /// The phrase for the exercise the session is on, found by id rather than position.
    var currentShadowingItem: ShadowingItem? {
        guard let id = session.currentExercise?.id else { return nil }
        return shadowingItems.first { $0.exerciseID == id }
    }

    func startShadowing() {
        let set = ShadowingEngine.build(courses: courses, level: selectedLevel, state: state)
        guard !set.exercises.isEmpty else { return }
        shadowingItems = set.items
        shadowingActive = true
        startLesson(ShadowingEngine.lesson(set.exercises), recordsCompletion: false)
    }

    /// The learner's own verdict: it still feeds points and spaced repetition.
    func shadowingSelfAssess(_ correct: Bool) {
        session.selfAssess(correct)
        state = session.state
        if session.isComplete { bankPracticeTime() }
        save()
    }

    func closeShadowing() {
        shadowingActive = false
        shadowingItems = []
        closeLesson()
    }

    func submitText(_ answer: String) { _ = session.submitText(answer); state = session.state; save() }
    func submitChoice(_ choice: String) { _ = session.submitChoice(choice); state = session.state; save() }
    func completePassive() { session.completePassiveExercise(); state = session.state; save() }
    func retry() { session.retry() }
    func markLastAnswerCorrect() { session.markLastAnswerCorrect(); state = session.state; save() }
    func advance() {
        session.advance(); state = session.state
        // Bank the time as soon as the lesson ends, not only when the window is closed.
        if session.isComplete { bankPracticeTime() }
        save()
    }

    func startReview() {
        let dueIDs = Set(state.reviews.filter { $0.due <= .now }.map(\.exerciseID))
        let exercises = courses.flatMap(\.chapters).flatMap(\.lessons).flatMap(\.exercises).filter { dueIDs.contains($0.id) }
        guard !exercises.isEmpty else { return }
        startLesson(Lesson(id: "daily-review", title: "Повторение", summary: "Закрепи сложные фразы.", estimatedMinutes: max(2, exercises.count), exercises: exercises), recordsCompletion: false)
    }

    func goBack() { session.goBack() }
    var canGoBack: Bool { session.canGoBack }

    func nodeIsUnlocked(_ index: Int) -> Bool { CourseRouting.isUnlocked(index: index, lessons: currentLessons, completed: state.completedLessonIDs) }

    // MARK: - Placement test

    var hasPlacementTest: Bool { !placementBank.isEmpty }

    var placementQuestions: [PlacementQuestion] {
        placementBank.sorted {
            let l = LevelOrder.all.firstIndex(of: $0.level) ?? 0
            let r = LevelOrder.all.firstIndex(of: $1.level) ?? 0
            return l == r ? $0.id < $1.id : l < r
        }
    }
    var currentPlacementQuestion: PlacementQuestion? {
        let qs = placementQuestions
        return qs.indices.contains(placementIndex) ? qs[placementIndex] : nil
    }
    /// The test stops as soon as the answers pin down a level — no need to walk the whole bank.
    var placementFinished: Bool {
        guard placementActive else { return false }
        if placementIndex >= placementQuestions.count { return true }
        return PlacementScorer.isDecided(bank: placementBank, answeredIDs: placementAnswered, correctIDs: placementCorrect)
    }
    var placementTotal: Int { placementQuestions.count }
    var placementCurrentNumber: Int { min(placementIndex + 1, placementTotal) }

    /// Climbing progress: how far up the levels the test has walked, since the
    /// number of remaining questions is not known in advance.
    var placementProgress: Double {
        guard let question = currentPlacementQuestion else { return 1 }
        let levels = Double(LevelOrder.all.count)
        let levelIndex = Double(LevelOrder.all.firstIndex(of: question.level) ?? 0)
        let inLevel = placementQuestions.filter { $0.level == question.level }
        let answeredInLevel = Double(inLevel.filter { placementAnswered.contains($0.id) }.count)
        let fraction = inLevel.isEmpty ? 0 : answeredInLevel / Double(inLevel.count)
        return (levelIndex + fraction) / levels
    }

    var placementRecommendedLevel: CEFRLevel { PlacementScorer.recommend(bank: placementBank, correctIDs: placementCorrect) }

    func startPlacement() { placementActive = true; placementIndex = 0; placementCorrect = []; placementAnswered = []; placementLastCorrect = nil }
    func cancelPlacement() { placementActive = false; placementIndex = 0; placementCorrect = []; placementAnswered = []; placementLastCorrect = nil }

    @discardableResult
    func answerPlacement(_ option: String) -> Bool {
        guard let question = currentPlacementQuestion else { return false }
        let correct = option == question.correctOption
        placementAnswered.insert(question.id)
        if correct { placementCorrect.insert(question.id) }
        placementLastCorrect = correct
        return correct
    }
    func advancePlacement() { placementLastCorrect = nil; placementIndex += 1 }

    // MARK: - Level progress & advancement

    func levelProgress(_ level: CEFRLevel) -> Double {
        ProgressionEngine.levelProgress(level: level, courses: courses, completed: state.completedLessonIDs)
    }
    var currentLevelProgress: Double { levelProgress(selectedLevel) }
    func levelIsComplete(_ level: CEFRLevel) -> Bool {
        ProgressionEngine.isLevelComplete(level: level, courses: courses, completed: state.completedLessonIDs)
    }

    private var dismissedLevels: Set<String> { Set(state.levelUpDismissed ?? []) }

    /// The next level to suggest, or nil if the learner is not ready / already dismissed / at the top.
    var suggestedNextLevel: CEFRLevel? {
        guard ProgressionEngine.shouldSuggestAdvance(level: selectedLevel, courses: courses, completed: state.completedLessonIDs, attempts: state.attempts, dismissed: dismissedLevels) else { return nil }
        return LevelOrder.next(after: selectedLevel)
    }
    func advanceToSuggestedLevel() {
        guard let next = suggestedNextLevel else { return }
        selectLevel(next)
    }
    func dismissLevelUp() {
        var list = state.levelUpDismissed ?? []
        if !list.contains(selectedLevel.rawValue) { list.append(selectedLevel.rawValue) }
        state.levelUpDismissed = list
        save()
    }

    // MARK: - Daily goal

    /// Set when a lesson opens; the elapsed time is banked when it ends or is closed.
    private var lessonStartedAt: Date?

    var dailyGoalMinutes: Int { state.profile?.dailyGoalMinutes ?? 10 }
    var todayPracticeMinutes: Int { PracticeLog.minutes(in: state.practiceSeconds, on: .now) }
    var dailyGoalProgress: Double { min(1, Double(todayPracticeMinutes) / Double(max(1, dailyGoalMinutes))) }
    var dailyGoalReached: Bool { todayPracticeMinutes >= dailyGoalMinutes }

    private func bankPracticeTime(now: Date = .now) {
        guard let started = lessonStartedAt else { return }
        lessonStartedAt = nil
        state.practiceSeconds = PracticeLog.adding(seconds: Int(now.timeIntervalSince(started)), to: state.practiceSeconds, on: now)
    }

    func streak(calendar: Calendar = .current) -> Int {
        let days = Set(state.attempts.map { calendar.startOfDay(for: $0.date) })
        var day = calendar.startOfDay(for: .now)
        if !days.contains(day), let yesterday = calendar.date(byAdding: .day, value: -1, to: day), days.contains(yesterday) { day = yesterday }
        var count = 0
        while days.contains(day) { count += 1; day = calendar.date(byAdding: .day, value: -1, to: day)! }
        return count
    }

    private func syncAndSave() { session = LearningSession(state: state); save() }
    private func save() {
        do { try store.save(state); transientError = nil }
        catch { transientError = "Не удалось сохранить прогресс. Не закрывай приложение и попробуй ещё раз." }
    }
}
