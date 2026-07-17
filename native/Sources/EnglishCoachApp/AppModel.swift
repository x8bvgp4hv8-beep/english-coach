import Foundation
import Observation
import EnglishCoachCore

@MainActor
@Observable
final class AppModel {
    enum Screen { case map, catalog, settings }

    private(set) var courses: [CoursePack]
    private(set) var state: UserState
    private(set) var session: LearningSession
    var screen: Screen = .map
    var startupError: String?
    var transientError: String?
    private let store: any ProgressStoring

    init(courses: [CoursePack], state: UserState, store: any ProgressStoring) {
        self.courses = courses; self.state = state; self.store = store
        self.session = LearningSession(state: state)
    }

    static func live() -> AppModel {
        let store = ProgressStore.live
        do {
            return AppModel(courses: try ContentRepository.loadBundled(), state: try store.load(), store: store)
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
    var todayPoints: Int { state.points }

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

    func startLesson(_ lesson: Lesson) { session = LearningSession(state: state); session.start(lesson) }
    func closeLesson() { state = session.state; session = LearningSession(state: state); save() }

    func submitText(_ answer: String) { _ = session.submitText(answer); state = session.state; save() }
    func submitChoice(_ choice: String) { _ = session.submitChoice(choice); state = session.state; save() }
    func completePassive() { session.completePassiveExercise(); state = session.state; save() }
    func retry() { session.retry() }
    func advance() { session.advance(); state = session.state; save() }

    func startReview() {
        let dueIDs = Set(state.reviews.filter { $0.due <= .now }.map(\.exerciseID))
        let exercises = courses.flatMap(\.chapters).flatMap(\.lessons).flatMap(\.exercises).filter { dueIDs.contains($0.id) }
        guard !exercises.isEmpty else { return }
        startLesson(Lesson(id: "daily-review", title: "Повторение", summary: "Закрепи сложные фразы.", estimatedMinutes: max(2, exercises.count), exercises: exercises))
    }

    func nodeIsUnlocked(_ index: Int) -> Bool { CourseRouting.isUnlocked(index: index, lessons: currentLessons, completed: state.completedLessonIDs) }

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
