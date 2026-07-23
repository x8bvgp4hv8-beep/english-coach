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

// Punctuation is ignored so word-order tokens and forgiving punctuation still match.
expect(AnswerChecker.check("However , this approach has drawbacks .", canonical: "However, this approach has drawbacks.", accepted: []).isCorrect, "word-order joins with spaces still match canonical punctuation")
expect(AnswerChecker.check("i work on monday", canonical: "I work on Monday.", accepted: []).isCorrect, "trailing period is forgiven")

// Every bundled exercise must be solvable in-app: word_order tokens must reconstruct the
// canonical answer, and each multiple_choice correctOption must be accepted.
func sortedWords(_ text: String) -> [String] { AnswerChecker.normalize(text).split(separator: " ").map(String.init).sorted() }
do {
    for course in try ContentRepository.loadBundled() {
        for exercise in course.chapters.flatMap(\.lessons).flatMap(\.exercises) {
            switch exercise.type {
            case .wordOrder:
                // Tokens are intentionally shuffled; the learner reorders them. Solvable means the
                // multiset of words (punctuation ignored, as in the app) matches the canonical answer.
                let ok = sortedWords((exercise.tokens ?? []).joined(separator: " ")) == sortedWords(exercise.canonicalAnswer ?? "")
                expect(ok, "\(exercise.id): word_order tokens reconstruct answer")
            case .multipleChoice:
                let ok = (exercise.options ?? []).contains(exercise.correctOption ?? "___missing")
                expect(ok, "\(exercise.id): multiple_choice correctOption is valid")
            case .translate:
                expect(!(exercise.canonicalAnswer ?? "").isEmpty, "\(exercise.id): translate has an answer")
            case .info, .flashcard:
                break
            }
        }
    }
} catch { failures += 1; print("✗ content solvability: \(error)") }

// Course depth: each level should now have several lessons for real progression.
do {
    for course in try ContentRepository.loadBundled() {
        let lessons = course.chapters.flatMap(\.lessons)
        expect(lessons.count >= 3, "\(course.level.rawValue) has at least three lessons")
    }
} catch { failures += 1; print("✗ course depth: \(error)") }

// Placement bank loads and every question is well-formed with all five levels covered.
do {
    let bank = try ContentRepository.loadPlacement()
    expect(bank.questions.count >= 10, "placement bank has enough questions")
    expect(Set(bank.questions.map(\.level)) == Set(CEFRLevel.allCases), "placement covers A1-C1")
    let allValid = bank.questions.allSatisfy { $0.options.contains($0.correctOption) }
    expect(allValid, "every placement question has a valid correct option")
} catch { failures += 1; print("✗ placement bank: \(error)") }

// PlacementScorer places the learner where they start to struggle.
do {
    let bank = try ContentRepository.loadPlacement().questions
    let allIDs = Set(bank.map(\.id))
    expect(PlacementScorer.recommend(bank: bank, correctIDs: allIDs) == .c1, "all correct -> top level")
    expect(PlacementScorer.recommend(bank: bank, correctIDs: []) == .a1, "none correct -> A1")
    let throughA2 = Set(bank.filter { $0.level == .a1 || $0.level == .a2 }.map(\.id))
    expect(PlacementScorer.recommend(bank: bank, correctIDs: throughA2) == .b1, "passes A1-A2 -> starts at B1")

    // Early stop: once a level is failed the rest of the bank cannot change the answer.
    let a1IDs = Set(bank.filter { $0.level == .a1 }.map(\.id))
    expect(!PlacementScorer.isDecided(bank: bank, answeredIDs: [], correctIDs: []), "nothing answered -> not decided")
    expect(PlacementScorer.isDecided(bank: bank, answeredIDs: a1IDs, correctIDs: []), "failed A1 -> decided after five questions")
    expect(!PlacementScorer.isDecided(bank: bank, answeredIDs: a1IDs, correctIDs: a1IDs), "passed A1 -> keep going")
    let throughA2Answered = Set(bank.filter { $0.level == .a1 || $0.level == .a2 }.map(\.id))
    expect(PlacementScorer.isDecided(bank: bank, answeredIDs: throughA2Answered, correctIDs: a1IDs), "failed A2 -> decided")
    expect(PlacementScorer.isDecided(bank: bank, answeredIDs: allIDs, correctIDs: allIDs), "whole bank answered -> decided")
    // A half-answered level is never decided, even when every answer so far is wrong.
    let partialA2 = a1IDs.union(bank.filter { $0.level == .a2 }.prefix(2).map(\.id))
    expect(!PlacementScorer.isDecided(bank: bank, answeredIDs: partialA2, correctIDs: a1IDs), "mid-level -> wait for the whole block")
} catch { failures += 1; print("✗ placement scoring: \(error)") }

// PracticeLog: daily goal bookkeeping.
do {
    let day = Date(timeIntervalSince1970: 1_753_000_000)
    let nextDay = day.addingTimeInterval(26 * 3600)
    var log = PracticeLog.adding(seconds: 240, to: nil, on: day)
    log = PracticeLog.adding(seconds: 200, to: log, on: day)
    expect(PracticeLog.minutes(in: log, on: day) == 7, "practice minutes accumulate within a day")
    expect(PracticeLog.minutes(in: log, on: nextDay) == 0, "practice minutes do not leak into the next day")
    let capped = PracticeLog.adding(seconds: 10 * 3600, to: nil, on: day)
    expect(PracticeLog.minutes(in: capped, on: day) == 30, "an idle window is capped at 30 minutes")
    expect(PracticeLog.adding(seconds: -5, to: nil, on: day).isEmpty, "negative time is ignored")
}

// ProgressionEngine: level completion, accuracy and advancement suggestion.
do {
    let courses = try ContentRepository.loadBundled()
    let a1Lessons = ProgressionEngine.lessons(for: .a1, in: courses)
    expect(!a1Lessons.isEmpty, "A1 has lessons")
    let done = Set(a1Lessons.map(\.id))
    expect(ProgressionEngine.isLevelComplete(level: .a1, courses: courses, completed: done), "all A1 lessons done -> level complete")
    expect(!ProgressionEngine.isLevelComplete(level: .a1, courses: courses, completed: []), "no lessons done -> not complete")
    // High accuracy over A1 exercises should trigger an advancement suggestion.
    let a1IDs = ProgressionEngine.exerciseIDs(for: .a1, in: courses)
    let goodAttempts = a1IDs.map { AttemptRecord(id: UUID(), exerciseID: $0, correct: true, date: now) }
    expect(ProgressionEngine.shouldSuggestAdvance(level: .a1, courses: courses, completed: done, attempts: goodAttempts, dismissed: []), "mastered level suggests advance")
    expect(!ProgressionEngine.shouldSuggestAdvance(level: .a1, courses: courses, completed: done, attempts: goodAttempts, dismissed: ["A1"]), "dismissed level does not re-suggest")
    expect(LevelOrder.next(after: .a1) == .a2, "next level after A1 is A2")
    expect(LevelOrder.next(after: .c1) == nil, "no level after C1")
} catch { failures += 1; print("✗ progression engine: \(error)") }

if failures > 0 { print("\n\(failures) test(s) failed"); exit(1) }
print("\nAll core tests passed")
