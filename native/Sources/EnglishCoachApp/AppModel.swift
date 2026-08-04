import Foundation
import Observation
import EnglishCoachCore

@MainActor
@Observable
final class AppModel {
    enum Screen { case map, catalog, settings, topics, language }

    private(set) var courses: [CoursePack]
    private(set) var placementBank: [PlacementQuestion]
    private(set) var syllabus: Syllabus?
    private(set) var state: UserState
    private(set) var session: LearningSession
    var screen: Screen = .map
    var startupError: String?
    var transientError: String?
    private var store: any ProgressStoring

    /// `nil` until the learner has picked a language; that is what opens the picker.
    /// Everything below it — courses, placement bank, syllabus, progress, voice — belongs
    /// to one language and is swapped wholesale when it changes.
    private(set) var language: LanguageCode?
    private static let languageKey = "learning.language"

    // Placement test runtime state
    private(set) var placementActive = false
    private(set) var placementIndex = 0
    private var placementCorrect: Set<String> = []
    private var placementAnswered: Set<String> = []
    private(set) var placementLastCorrect: Bool?

    init(courses: [CoursePack], placementBank: [PlacementQuestion] = [], syllabus: Syllabus? = nil, state: UserState,
         store: any ProgressStoring, language: LanguageCode? = nil) {
        self.courses = courses; self.placementBank = placementBank; self.syllabus = syllabus
        self.state = state; self.store = store; self.language = language
        self.session = LearningSession(state: state, language: language ?? .default)
    }

    static func live() -> AppModel {
        let stored = UserDefaults.standard.string(forKey: languageKey) ?? ""
        let model = AppModel(courses: [], state: .fresh, store: ProgressStore.live())
        if let language = LanguageCode(rawValue: stored) {
            model.open(language)
        } else if FileManager.default.fileExists(atPath: ProgressStore.live(.default).url.path) {
            // Someone who was already learning English before there was anything to
            // choose between must not be met by a picker: to them it reads as "мой
            // прогресс пропал". The picker is for a first run and for switching.
            UserDefaults.standard.set(LanguageCode.default.rawValue, forKey: languageKey)
            model.open(.default)
        }
        // Before the first body runs, so the window never paints in the wrong theme.
        model.loadTheme()
        return model
    }

    /// Which languages actually shipped content, so the picker never offers an empty course.
    var availableLanguages: [LearningLanguage] {
        let shipped = Set(ContentRepository.availableLanguages())
        let usable = Languages.all.filter { shipped.contains($0.code) }
        return usable.isEmpty ? Languages.all : usable
    }

    var languageChosen: Bool { language != nil }
    var currentLanguage: LearningLanguage { Languages.of(language ?? .default) }

    /// Picking a language on the first screen, or switching to the other one later.
    func selectLanguage(_ code: LanguageCode) {
        guard code != language else { screen = .map; return }
        UserDefaults.standard.set(code.rawValue, forKey: Self.languageKey)
        // A switch must not leave a half-finished lesson from the other language on screen.
        shadowingActive = false; shadowingItems = []
        listeningActive = false; listeningItems = []
        cancelPlacement()
        screen = .map
        open(code)
        CoachTheme.use(themeID, language: code)
    }

    private func open(_ code: LanguageCode) {
        language = code
        startupError = nil
        SpeechService.language = Languages.of(code)
        let store = ProgressStore.live(code)
        self.store = store
        do {
            courses = try ContentRepository.loadBundled(code)
            placementBank = (try? ContentRepository.loadPlacement(code))?.questions ?? []
            syllabus = try? ContentRepository.loadSyllabus(code)
            state = (try? store.load()) ?? .fresh
        } catch {
            courses = []; placementBank = []; syllabus = nil; state = .fresh
            startupError = "Не удалось загрузить учебные материалы: \(error.localizedDescription)"
        }
        session = LearningSession(state: state, language: code)
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
        session = LearningSession(state: state, language: language ?? .default)
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
    func closeLesson() { state = session.state; bankPracticeTime(); session = LearningSession(state: state, language: language ?? .default); save() }

    // MARK: - Theme
    //
    // Kept in UserDefaults, not in UserState: a theme is chrome, not progress, so it must
    // not travel in a progress backup or drift from the web client's own preference.

    private static let themeKey = "appearance.theme"
    private(set) var themeID: ThemeID = .minimal

    func loadTheme() {
        let stored = UserDefaults.standard.string(forKey: Self.themeKey) ?? ""
        themeID = ThemeID(rawValue: stored) ?? .minimal
        CoachTheme.use(themeID, language: language ?? .default)
    }

    func selectTheme(_ id: ThemeID) {
        themeID = id
        CoachTheme.use(id, language: language ?? .default)
        UserDefaults.standard.set(id.rawValue, forKey: Self.themeKey)
    }

    // MARK: - Grammar topics

    /// Every topic of this level and below, with the learner's record on it.
    var topicProgress: [TopicProgress] {
        guard let syllabus else { return [] }
        return TopicProgressEngine.all(syllabus: syllabus, courses: courses, state: state, level: selectedLevel)
    }

    /// Worst first, and only once there are enough attempts to mean anything.
    var weakTopics: [TopicProgress] {
        guard let syllabus else { return [] }
        return TopicProgressEngine.weak(syllabus: syllabus, courses: courses, state: state, level: selectedLevel)
    }

    func startTopicPractice(_ topicID: String) {
        let exercises = PracticeEngine.build(courses: courses, level: selectedLevel, state: state, topics: [topicID])
        guard !exercises.isEmpty else { return }
        let title = syllabus?.topics.first { $0.id == topicID }?.title ?? "Тренировка"
        startLesson(PracticeEngine.lesson(exercises, title: title), recordsCompletion: false)
    }

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

    // MARK: - Listening (same session, its own screen, the text kept hidden)

    private(set) var listeningActive = false
    private(set) var listeningItems: [ListeningItem] = []

    var listeningCount: Int { ListeningEngine.count(courses: courses, level: selectedLevel) }
    var listeningIsComplete: Bool { listeningActive && session.isComplete }

    /// The sentence for the exercise the session is on, found by id rather than position.
    var currentListeningItem: ListeningItem? {
        guard let id = session.currentExercise?.id else { return nil }
        return listeningItems.first { $0.exerciseID == id }
    }

    func startListening() {
        let set = ListeningEngine.build(courses: courses, level: selectedLevel, state: state)
        guard !set.exercises.isEmpty else { return }
        listeningItems = set.items
        listeningActive = true
        startLesson(ListeningEngine.lesson(set.exercises), recordsCompletion: false)
    }

    /// Checked against the sentence that was played, which the exercise itself may not hold.
    func submitHeard(_ answer: String) {
        guard let item = currentListeningItem else { return }
        session.submitHeard(answer, phrase: item.text)
        state = session.state
        save()
    }

    /// "Не разобрал": an honest miss, so the sentence comes back on another day.
    func revealHeard() { submitHeard("") }

    func closeListening() {
        listeningActive = false
        listeningItems = []
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

    private func syncAndSave() { session = LearningSession(state: state, language: language ?? .default); save() }
    private func save() {
        do { try store.save(state); transientError = nil }
        catch { transientError = "Не удалось сохранить прогресс. Не закрывай приложение и попробуй ещё раз." }
    }
}
