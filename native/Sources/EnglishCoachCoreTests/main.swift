import Foundation
import EnglishCoachCore

nonisolated(unsafe) private var failures = 0
private func expect(_ condition: @autoclosure () -> Bool, _ name: String) {
    if condition() { print("✓ \(name)") }
    else { failures += 1; print("✗ \(name)") }
}

expect(ProductInfo.name == "English Coach", "product identity")

let valid = #"{"schemaVersion":1,"level":"A1","chapters":[{"id":"c","title":"Chapter","lessons":[{"id":"l","title":"Lesson","summary":"Summary","estimatedMinutes":5,"exercises":[{"id":"e1","type":"info","title":"One"},{"id":"e2","type":"translate","prompt":"Я Алекс.","canonicalAnswer":"I am Alex."}]}]}]}"#
do {
    let course = try ContentRepository.decode(Data(valid.utf8))
    expect(course.level == .a1 && course.chapters[0].lessons[0].exercises.count == 2, "decode valid content")
} catch { failures += 1; print("✗ decode valid content: \(error)") }

let duplicate = #"{"schemaVersion":1,"level":"A1","chapters":[{"id":"c","title":"C","lessons":[{"id":"l","title":"L","summary":"S","estimatedMinutes":5,"exercises":[{"id":"same","type":"info","title":"One"},{"id":"same","type":"info","title":"Two"}]}]}]}"#
do { _ = try ContentRepository.decode(Data(duplicate.utf8)); failures += 1; print("✗ reject duplicate IDs") }
catch ContentError.duplicateID("same") { print("✓ reject duplicate IDs") }
catch { failures += 1; print("✗ reject duplicate IDs: \(error)") }

expect(AnswerChecker.check("  I DON’T   know! ", canonical: "I don't know", accepted: []).isCorrect, "normalize answer")
expect(AnswerChecker.check("I have not seen it", canonical: "I haven't seen it", accepted: ["I have not seen it"]).isCorrect, "accept explicit alternative")
expect(!AnswerChecker.check("Never saw it", canonical: "I haven't seen it", accepted: []).isCorrect, "reject unknown alternative")
expect(AnswerChecker.check("What is your name ?", canonical: "What is your name?", accepted: []).isCorrect, "normalize spacing before punctuation")

let temp = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString).appendingPathComponent("state.json")
do {
    var state = UserState.fresh
    state.profile = UserProfile(selectedLevel: .b1, dailyGoalMinutes: 10, reminderHour: 19, reminderMinute: 0, remindersEnabled: true)
    state.completedLessonIDs = ["a1-intro", "b1-experiences"]
    let store = ProgressStore(url: temp); try store.save(state)
    let loaded = try store.load()
    expect(loaded == state, "persist state round trip")
} catch { failures += 1; print("✗ persist state round trip: \(error)") }

let lessons = [Lesson(id: "one", title: "One", summary: "", estimatedMinutes: 5, exercises: []), Lesson(id: "two", title: "Two", summary: "", estimatedMinutes: 5, exercises: [])]
expect(CourseRouting.nextLesson(in: lessons, completed: ["one"])?.id == "two", "recommend first incomplete lesson")
expect(!CourseRouting.isUnlocked(index: 1, lessons: lessons, completed: []), "lock sequential lesson")

let now = Date(timeIntervalSince1970: 1_000)
var item = ReviewEngine.newItem(exerciseID: "e", now: now)
item = ReviewEngine.recordSuccess(item, now: now); expect(item.intervalDays == 1, "first review interval")
item = ReviewEngine.recordSuccess(item, now: now); expect(item.intervalDays == 3, "second review interval")
item = ReviewEngine.recordSuccess(item, now: now); expect(item.intervalDays == 7, "third review interval")
item = ReviewEngine.recordFailure(item, now: now); expect(item.intervalDays == 1 && item.repetitions == 0, "review failure reset")

do {
    let courses = try ContentRepository.loadBundled()
    expect(Set(courses.map(\.level)) == Set(CEFRLevel.allCases), "bundled content covers A1-C1")
    for course in courses {
        let exercises = course.chapters.flatMap(\.lessons).flatMap(\.exercises)
        expect(Set(exercises.map(\.type)).isSuperset(of: Set(ExerciseType.allCases)), "\(course.level.rawValue) covers every exercise type")
        expect(exercises.count >= 10, "\(course.level.rawValue) has at least ten exercises")
    }
} catch { failures += 1; print("✗ bundled course validation: \(error)") }

do {
    let course = try ContentRepository.loadBundled().first { $0.level == .a1 }!
    let lesson = course.chapters[0].lessons[0]
    var session = LearningSession(state: .fresh)
    session.start(lesson)
    expect(session.currentExercise?.id == "a1-info-1", "lesson starts at first exercise")
    session.completePassiveExercise()
    session.completePassiveExercise()
    let wrong = session.submitText("wrong", now: now)
    expect(!wrong.isCorrect && session.state.reviews.contains { $0.exerciseID == "a1-translate-1" }, "wrong answer creates review")
    session.advance()
    while !session.isComplete { session.completeCurrentCorrectlyForTesting(now: now) }
    expect(session.state.completedLessonIDs.contains(lesson.id), "lesson completion is recorded")
    expect(session.state.points > 0, "correct work awards points")
} catch { failures += 1; print("✗ learning session: \(error)") }

do {
    for course in try ContentRepository.loadBundled() {
        let lesson = course.chapters[0].lessons[0]
        var session = LearningSession(state: .fresh)
        session.start(lesson)
        while !session.isComplete { session.completeCurrentCorrectlyForTesting(now: now) }
        expect(session.state.completedLessonIDs.contains(lesson.id), "\(course.level.rawValue) starter lesson completes offline")
    }
} catch { failures += 1; print("✗ all-level completion: \(error)") }

var reviewState = UserState.fresh
var reviewSession = LearningSession(state: reviewState)
do {
    let lesson = try ContentRepository.loadBundled().first!.chapters[0].lessons[0]
    let translation = lesson.exercises.first { $0.type == .translate }!
    reviewSession.start(Lesson(id: "review", title: "Review", summary: "", estimatedMinutes: 1, exercises: [translation]))
    _ = reviewSession.submitText("wrong", now: now)
    let firstDue = reviewSession.state.reviews.first!.due
    reviewSession.retry()
    _ = reviewSession.submitText(translation.canonicalAnswer!, now: now)
    expect(reviewSession.state.reviews.first!.due > firstDue, "successful review moves due date forward")
} catch { failures += 1; print("✗ review completion: \(error)") }

if failures > 0 { print("\n\(failures) test(s) failed"); exit(1) }
print("\nAll core tests passed")
