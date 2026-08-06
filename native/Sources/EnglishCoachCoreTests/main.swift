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

// The v2 rules: a unit says what it is for, a lesson climbs, a checkpoint is an exam.
// Mirrors web/src/core/core.test.ts.
func unitPack(_ lessons: String, canDo: String = #"["заказать кофе"]"#) -> Data {
    let head = #"{"schemaVersion":2,"level":"A1","chapters":[{"id":"u","title":"U","canDo":"#
    let middle = #","lessons":"#
    let json: String = head + canDo + middle + lessons + "}]}"
    return Data(json.utf8)
}
let talkJSON = #"{"id":"d","type":"dialogue","lines":[{"speaker":"A","text":"Hola.","translation":"Привет."},{"speaker":"B","text":"Hola.","translation":"Привет."}]}"#
let wordJSON = #"{"id":"f","type":"flashcard","prompt":"Hola.","translation":"Привет."}"#
let produceJSON = #"{"id":"t","type":"translate","prompt":"Привет.","canonicalAnswer":"Hola."}"#
func lessonJSON(_ exercises: [String], kind: String? = nil) -> String {
    let extra = kind.map { #","kind":"\#($0)""# } ?? ""
    return #"[{"id":"l","title":"L","summary":"S","estimatedMinutes":5\#(extra),"exercises":[\#(exercises.joined(separator: ","))]}]"#
}

do {
    let course = try ContentRepository.decode(unitPack(lessonJSON([talkJSON, wordJSON, produceJSON])))
    expect(course.chapters[0].canDo == ["заказать кофе"], "a unit that climbs the ladder is accepted")
} catch { failures += 1; print("✗ a unit that climbs the ladder is accepted: \(error)") }

func rejects(_ data: Data, _ name: String) {
    do { _ = try ContentRepository.decode(data); failures += 1; print("✗ \(name)") }
    catch { print("✓ \(name)") }
}

rejects(unitPack(lessonJSON([talkJSON, wordJSON, produceJSON]), canDo: "[]"),
        "a unit that cannot say what it is for is refused")
// Production before the words that make it possible: the old order, now rejected.
rejects(unitPack(lessonJSON([talkJSON, produceJSON, wordJSON])),
        "a lesson that goes back down a step is refused")
rejects(unitPack(lessonJSON([#"{"id":"t","type":"translate","prompt":"Привет.","canonicalAnswer":"Hola.","hint":"на H"}"#], kind: "checkpoint")),
        "a checkpoint with a hint is refused")
rejects(unitPack(lessonJSON([wordJSON, produceJSON], kind: "checkpoint")),
        "a checkpoint with anything but production is refused")
rejects(unitPack(lessonJSON([#"{"id":"d","type":"dialogue","lines":[{"speaker":"A","text":"Hola.","translation":"Привет."}]}"#, produceJSON])),
        "a dialogue that is not an exchange is refused")

do {
    let head = #"{"schemaVersion":1,"level":"A1","chapters":[{"id":"c","title":"C","lessons":"#
    let json: String = head + lessonJSON([produceJSON, wordJSON]) + "}]}"
    let course = try ContentRepository.decode(Data(json.utf8))
    expect(course.chapters[0].canDo == nil, "v1 packs keep working exactly as before")
} catch { failures += 1; print("✗ v1 packs keep working exactly as before: \(error)") }

expect(AnswerChecker.check("  I DON’T   know! ", canonical: "I don't know", accepted: []).isCorrect, "normalize answer")
expect(AnswerChecker.check("I have not seen it", canonical: "I haven't seen it", accepted: ["I have not seen it"]).isCorrect, "accept explicit alternative")
expect(!AnswerChecker.check("Never saw it", canonical: "I haven't seen it", accepted: []).isCorrect, "reject unknown alternative")
expect(AnswerChecker.check("What is your name ?", canonical: "What is your name?", accepted: []).isCorrect, "normalize spacing before punctuation")

// Contractions, spelling variants and typos. Mirrors web/src/core/core.test.ts.
expect(AnswerChecker.check("I'm a teacher", canonical: "I am a teacher").verdict == .correct, "contraction equals its expansion")
expect(AnswerChecker.check("He has got a car", canonical: "He's got a car").verdict == .correct, "ambiguous 's reads as has")
expect(AnswerChecker.check("We cannot come", canonical: "We can't come").verdict == .correct, "cannot equals can't")
expect(AnswerChecker.check("My favourite colour is grey", canonical: "My favorite color is gray").verdict == .correct, "British spelling accepted")
let typoResult = AnswerChecker.check("I go to the cinemaa every week", canonical: "I go to the cinema every week")
expect(typoResult.verdict == .typo && typoResult.isCorrect && typoResult.typo == "cinema", "one mistyped long word is a typo")
expect(AnswerChecker.check("I bought a resturant meal", canonical: "I bought a restaurant meal").verdict == .typo, "two-letter slip in a long word is a typo")
expect(AnswerChecker.check("He go to school", canonical: "He goes to school").verdict == .wrong, "tense is not a typo")
expect(AnswerChecker.check("She have a car", canonical: "She has a car").verdict == .wrong, "agreement is not a typo")
expect(AnswerChecker.check("I saw a cat", canonical: "I saw the cat").verdict == .wrong, "article is not a typo")
expect(AnswerChecker.check("I am at the cinema", canonical: "I am in the cinema").verdict == .wrong, "preposition is not a typo")
expect(AnswerChecker.check("It is a cat", canonical: "It is a cut").verdict == .wrong, "short word gets no tolerance")
expect(AnswerChecker.check("I have two cat", canonical: "I have two cats").verdict == .wrong, "plural is not a typo")
expect(AnswerChecker.check("I work yesterday", canonical: "I worked yesterday").verdict == .wrong, "past tense ending is not a typo")
expect(AnswerChecker.check("I visited three city", canonical: "I visited three cities").verdict == .wrong, "irregular plural is not a typo")
expect(AnswerChecker.diffSummary(AnswerChecker.check("complete nonsense here", canonical: "I usually drink coffee in the morning").diff) == nil, "no word list for a completely unrelated answer")
let close = AnswerChecker.diffSummary(AnswerChecker.check("I usually drink coffee morning", canonical: "I usually drink coffee in the morning").diff)
expect(close?.missing == ["in", "the"], "near miss names the missing words")
let reordered = AnswerChecker.diffSummary(AnswerChecker.check("Monday I work on", canonical: "I work on Monday.").diff)
expect(reordered?.orderOnly == true, "same words in another order is an order mistake")
let casing = AnswerChecker.diffSummary(AnswerChecker.check("I work", canonical: "I work on Monday").diff)
expect(casing?.missing == ["on", "Monday"], "missing words keep their writing")
let diff = AnswerChecker.check("I go cinema", canonical: "I go to the cinema").diff
expect(diff.filter { $0.kind == .missing }.map(\.text) == ["to", "the"], "diff names the missing words")
expect(AnswerChecker.check("I go to the big cinema", canonical: "I go to the cinema").diff.filter { $0.kind == .extra }.map(\.text) == ["big"], "diff names the extra word")

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
        // Dialogues belong to the v2 unit packs; every level must still carry the five
        // kinds a learner is actually asked to work through.
        let required: Set<ExerciseType> = [.info, .flashcard, .translate, .wordOrder, .multipleChoice]
        expect(Set(exercises.map(\.type)).isSuperset(of: required), "\(course.level.rawValue) covers every exercise type")
        expect(exercises.count >= 10, "\(course.level.rawValue) has at least ten exercises")
    }
} catch { failures += 1; print("✗ bundled course validation: \(error)") }

do {
    // Not by id: the opening chapter changes whenever the course does, and this test is
    // about the session, not about which lesson happens to come first.
    let course = try ContentRepository.loadBundled().first { $0.level == .a1 }!
    let lesson = course.chapters.flatMap(\.lessons).first { $0.exercises.contains { $0.type == .translate } }!
    let firstTranslate = lesson.exercises.first { $0.type == .translate }!
    var session = LearningSession(state: .fresh)
    session.start(lesson)
    expect(session.currentExercise?.id == lesson.exercises[0].id, "lesson starts at first exercise")
    while let current = session.currentExercise, current.id != firstTranslate.id {
        session.completePassiveExercise()
    }
    let wrong = session.submitText("wrong", now: now)
    expect(!wrong.isCorrect && session.state.reviews.contains { $0.exerciseID == firstTranslate.id }, "wrong answer creates review")
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

// Cards: read once, asked for ever after. Mirrors web/src/core/core.test.ts.
do {
    let course = try ContentRepository.loadBundled().first!
    let card = course.chapters.flatMap(\.lessons).flatMap(\.exercises).first { $0.type == .flashcard }!
    let lesson = Lesson(id: "cards", title: "Cards", summary: "", estimatedMinutes: 1, exercises: [card])

    // Reading the card once schedules it, like any other answer.
    var first = LearningSession(state: .fresh)
    first.start(lesson, recordsCompletion: false)
    expect(!first.currentIsRecall, "a card never met is shown, not asked")
    first.completePassiveExercise(now: now)
    expect(first.state.reviews.first { $0.exerciseID == card.id }?.repetitions == 1, "a card read once is scheduled once")

    // "Не вспомнил" collapses the interval instead of letting the word keep climbing —
    // which is the whole point: a passive card claimed a success nobody had earned.
    var second = LearningSession(state: first.state)
    second.start(lesson, recordsCompletion: false)
    expect(second.currentIsRecall, "the same card met again is a question")
    second.selfAssess(false, now: now)
    let missed = second.state.reviews.first { $0.exerciseID == card.id }
    expect(missed?.repetitions == 0 && missed?.intervalDays == 1, "a word that did not come to mind drops back to a day")
    expect(second.state.attempts.last?.correct == false, "an honest miss is recorded as a miss")

    // "Вспомнил" counts exactly like any other correct answer and stretches it again.
    let pointsBefore = second.state.points
    var third = LearningSession(state: second.state)
    third.start(lesson, recordsCompletion: false)
    third.selfAssess(true, now: now)
    expect(third.state.reviews.first { $0.exerciseID == card.id }?.repetitions == 1, "a recalled word starts climbing again")
    expect(third.state.points > pointsBefore, "recall earns points like any answer")

    // The shape of a card is fixed when the set opens, not read live mid-exercise.
    var stable = LearningSession(state: .fresh)
    stable.start(Lesson(id: "cards", title: "Cards", summary: "", estimatedMinutes: 1, exercises: [card, card]), recordsCompletion: false)
    stable.completePassiveExercise(now: now)
    stable.goBack()
    expect(!stable.currentIsRecall, "a card does not become a question halfway through the set")
} catch { failures += 1; print("✗ card recall: \(error)") }

do {
    let lesson = try ContentRepository.loadBundled().first!.chapters[0].lessons[0]
    let translation = lesson.exercises.first { $0.type == .translate }!
    let set = Lesson(id: "review", title: "Review", summary: "", estimatedMinutes: 1, exercises: [translation])

    // A correct answer is scheduled too. Before this only mistakes were, so anything
    // answered right the first time was never checked again.
    var first = LearningSession(state: .fresh)
    first.start(set, recordsCompletion: false)
    _ = first.submitText(translation.canonicalAnswer!, now: now)
    expect(first.state.reviews.count == 1 && first.state.reviews[0].intervalDays == 1, "a correct answer is scheduled too")

    // 1 -> 3 -> 7 days as it keeps coming back right.
    var second = LearningSession(state: first.state)
    second.start(set, recordsCompletion: false)
    _ = second.submitText(translation.canonicalAnswer!, now: now)
    expect(second.state.reviews[0].intervalDays == 3, "the interval stretches while the answer stays right")

    // And a miss collapses it back to a day, whatever it had grown to.
    var third = LearningSession(state: second.state)
    third.start(set, recordsCompletion: false)
    _ = third.submitText("wrong", now: now)
    expect(third.state.reviews[0].intervalDays == 1 && third.state.reviews[0].repetitions == 0, "a miss collapses the interval")

    // One sitting is capped, longest waiting first.
    let day: TimeInterval = 86_400
    var many = (0..<30).map { index -> ReviewItem in
        var item = ReviewEngine.newItem(exerciseID: "e\(index)", now: now)
        item.due = now.addingTimeInterval(-Double(index) * day)
        return item
    }
    var later = ReviewEngine.newItem(exerciseID: "later", now: now)
    later.due = now.addingTimeInterval(day)
    many.append(later)
    let due = ReviewEngine.due(in: many, now: now)
    expect(due.count == ReviewEngine.sessionSize, "one sitting of repetitions is capped")
    expect(due.first?.exerciseID == "e29", "the longest waiting comes first")
    expect(!due.contains { $0.exerciseID == "later" }, "what is not due yet is left alone")
} catch { failures += 1; print("✗ review scheduling: \(error)") }

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
            case .dialogue:
                let lines = exercise.lines ?? []
                expect(lines.count >= 2, "\(exercise.id): a dialogue is an exchange, not one line")
                expect(lines.allSatisfy { !$0.text.isEmpty && !$0.translation.isEmpty && !$0.speaker.isEmpty },
                       "\(exercise.id): every line has a speaker, a text and a translation")
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

// Endless practice. Mirrors web/src/core/core.test.ts.
do {
    let courses = try ContentRepository.loadBundled()
    let identity: ([Exercise]) -> [Exercise] = { $0 }
    let set = PracticeEngine.build(courses: courses, level: .b1, state: .fresh, size: 25, shuffle: identity)
    expect(set.count == 25, "practice fills the requested size")
    expect(!set.contains { $0.type == .info }, "practice never offers rule cards")
    expect(Set(set.map(\.id)).count == set.count, "practice does not repeat an exercise")

    let a1a2 = ProgressionEngine.exerciseIDs(for: .a1, in: courses).union(ProgressionEngine.exerciseIDs(for: .a2, in: courses))
    let lower = PracticeEngine.build(courses: courses, level: .a2, state: .fresh, size: 40, shuffle: identity)
    expect(lower.allSatisfy { a1a2.contains($0.id) }, "practice stays at the current level and below")

    let pool = PracticeEngine.pool(courses: courses, level: .a1)
    var state = UserState.fresh
    var dueItem = ReviewEngine.newItem(exerciseID: pool[5].id, now: now)
    dueItem.due = now.addingTimeInterval(-86_400)
    state.reviews = [dueItem]
    state.attempts = [
        AttemptRecord(id: UUID(), exerciseID: pool[9].id, correct: false, date: now),
        AttemptRecord(id: UUID(), exerciseID: pool[0].id, correct: true, date: now)
    ]
    let ordered = PracticeEngine.build(courses: courses, level: .a1, state: state, size: 5, now: now, shuffle: identity)
    expect(ordered.first?.id == pool[5].id, "due repetitions come first")
    expect(ordered.count > 1 && ordered[1].id == pool[9].id, "old mistakes come second")

    let cards = PracticeEngine.build(courses: courses, level: .b1, state: .fresh, types: [.flashcard], size: 12, shuffle: identity)
    expect(!cards.isEmpty && cards.allSatisfy { $0.type == .flashcard }, "a kind of practice offers only that kind")
    let counts = PracticeEngine.counts(courses: courses, level: .a1)
    expect(counts["mixed"] == PracticeEngine.pool(courses: courses, level: .a1).count, "mixed counts the whole pool")
    expect((counts["translate"] ?? 0) > 0 && (counts["translate"] ?? 0) < (counts["mixed"] ?? 0), "each kind counts its own share")

    // Practice only draws from lessons the learner has finished.
    let a1Lessons = courses.first { $0.level == .a1 }!.chapters.flatMap(\.lessons)
    // Day one: nothing has been taught, so there is nothing to practise. Before this the
    // first tap handed out the future tense from the last chapter of the level.
    expect(PracticeEngine.taught(courses: courses, level: .a1, completed: []).isEmpty, "an untouched level has nothing to practise")

    let done: Set<String> = [a1Lessons[0].id, a1Lessons[1].id]
    let reachable = Set((a1Lessons[0].exercises + a1Lessons[1].exercises).map(\.id))
    let taught = PracticeEngine.taught(courses: courses, level: .a1, completed: done)
    let fromDone = PracticeEngine.build(courses: taught, level: .a1, state: .fresh, size: 40, shuffle: identity)
    expect(!fromDone.isEmpty && fromDone.allSatisfy { reachable.contains($0.id) }, "practice draws only from finished lessons")
    // Shadowing rides on the same pool, so it inherits the same limit.
    let spoken = ShadowingEngine.build(courses: taught, level: .a1, state: .fresh, size: 20, shuffle: identity)
    expect(spoken.exercises.allSatisfy { reachable.contains($0.id) }, "speaking practice inherits the same limit")

    // Placement can drop someone straight into B1: A1 and A2 are the claim that put them
    // there, and locking them behind lessons nobody will replay would empty practice.
    let placed = PracticeEngine.taught(courses: courses, level: .b1, completed: [])
    expect(placed.map(\.level) == [.a1, .a2], "levels below the current one stay open in full")
    expect(!PracticeEngine.pool(courses: placed, level: .b1).isEmpty, "a placed learner still has something to practise")

    var practiceSession = LearningSession(state: .fresh)
    practiceSession.start(PracticeEngine.lesson(Array(set.prefix(3))), recordsCompletion: false)
    while !practiceSession.isComplete { practiceSession.completeCurrentCorrectlyForTesting(now: now) }
    expect(practiceSession.state.completedLessonIDs.isEmpty, "practice is never recorded as a completed lesson")
    expect(practiceSession.state.points > 0, "practice still awards points")
} catch { failures += 1; print("✗ practice engine: \(error)") }

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

// Syllabus: what each level owes, and how far the content is from it.
// Mirrors web/src/core/core.test.ts.
do {
    let syllabus = try ContentRepository.loadSyllabus()
    let courses = try ContentRepository.loadBundled()
    expect(syllabus.topics.count > 20, "syllabus covers a real programme")
    expect(Set(syllabus.topics.map(\.level)) == Set(CEFRLevel.allCases), "syllabus covers A1-C1")

    // A typo in a pack would silently create a topic nobody teaches and nobody counts.
    expect(SyllabusEngine.unknownTopics(of: syllabus, in: courses).isEmpty, "content only tags topics the syllabus defines")
    let untagged = courses.flatMap(\.chapters).flatMap(\.lessons).flatMap(\.exercises).filter { ($0.topics ?? []).isEmpty }
    expect(untagged.isEmpty, "every exercise carries a topic" + (untagged.isEmpty ? "" : ": \(untagged.prefix(3).map(\.id))"))

    // The ratchet: the content is knowingly short of the syllabus, so the test does not
    // demand a full course — it demands that the shortfall never grows.
    let gaps = SyllabusEngine.gaps(of: syllabus, in: courses)
    expect(gaps.count <= syllabus.coverageDebtCeiling,
           "coverage debt did not grow (\(gaps.count) of ceiling \(syllabus.coverageDebtCeiling))")

    // Practice can be narrowed to one topic, and attempts turn into a picture of it.
    let byTopic = PracticeEngine.build(courses: courses, level: .b1, state: .fresh, topics: ["b1-past-perfect"], size: 6)
    expect(!byTopic.isEmpty && byTopic.allSatisfy { ($0.topics ?? []).contains("b1-past-perfect") },
           "practice can be narrowed to one topic")

    let pastPerfect = PracticeEngine.pool(courses: courses, level: .b1, topics: ["b1-past-perfect"])
    var record = UserState.fresh
    record.attempts = pastPerfect.prefix(4).enumerated().map { index, exercise in
        AttemptRecord(id: UUID(), exerciseID: exercise.id, correct: index == 0, date: now)
    }
    let weak = TopicProgressEngine.weak(syllabus: syllabus, courses: courses, state: record, level: .b1)
    expect(weak.first?.topic.id == "b1-past-perfect", "the worst topic comes first")
    expect(weak.first?.attempts == 4 && abs((weak.first?.accuracy ?? 0) - 0.25) < 0.001, "accuracy is counted per topic")
    let everything = TopicProgressEngine.all(syllabus: syllabus, courses: courses, state: record, level: .b1)
    expect(everything.allSatisfy { $0.exercises > 0 }, "no topic is offered without exercises behind it")

    let counts = SyllabusEngine.counts(in: courses)
    let taggedInfo = courses.flatMap(\.chapters).flatMap(\.lessons).flatMap(\.exercises)
        .filter { $0.type == .info && !($0.topics ?? []).isEmpty }
    expect(!taggedInfo.isEmpty, "rule cards carry their topic, so a rule can be found")
    expect(counts.values.reduce(0, +) > 0, "practice exercises are counted")
} catch { failures += 1; print("✗ syllabus: \(error)") }

// Shadowing: the phrases the learner says out loud. Mirrors web/src/core/core.test.ts.
func singleExercise(_ json: String) -> Exercise? {
    let course = #"{"schemaVersion":1,"level":"A1","chapters":[{"id":"c","title":"C","lessons":[{"id":"l","title":"L","summary":"S","estimatedMinutes":1,"exercises":[\#(json)]}]}]}"#
    return (try? ContentRepository.decode(Data(course.utf8)))?.chapters[0].lessons.first?.exercises.first
}
func hasCyrillic(_ text: String) -> Bool { text.range(of: "[\u{0400}-\u{04FF}]", options: .regularExpression) != nil }

do {
    let courses = try ContentRepository.loadBundled()
    for level in CEFRLevel.allCases {
        let pool = ShadowingEngine.pool(courses: courses, level: level)
        expect(!pool.isEmpty, "\(level.rawValue) has phrases to shadow")
        for exercise in pool {
            guard let item = ShadowingEngine.phrase(for: exercise) else { failures += 1; print("✗ \(exercise.id): has a phrase"); continue }
            // The learner reads this line out loud: a Russian prompt or a bare gap is unsayable.
            expect(!item.text.isEmpty && !hasCyrillic(item.text), "\(exercise.id): the spoken line is English")
            expect(item.text.range(of: "_{2,}", options: .regularExpression) == nil, "\(exercise.id): no gap left in the sentence")
        }
    }

    let flashcard = courses[0].chapters.flatMap(\.lessons).flatMap(\.exercises).first { $0.type == .flashcard }!
    let card = ShadowingEngine.phrase(for: flashcard)
    expect(card?.text == flashcard.prompt && card?.gloss == flashcard.translation, "flashcard says its English side")
    let translate = courses[0].chapters.flatMap(\.lessons).flatMap(\.exercises).first { $0.type == .translate }!
    let translated = ShadowingEngine.phrase(for: translate)
    expect(translated?.text == translate.canonicalAnswer && translated?.gloss == translate.prompt, "translate says the answer, not the Russian prompt")
} catch { failures += 1; print("✗ shadowing pool: \(error)") }

let gapFill = singleExercise(#"{"id":"g","type":"multiple_choice","prompt":"We ___ this film before.","options":["saw","have seen"],"correctOption":"have seen"}"#)
expect(gapFill.flatMap { ShadowingEngine.phrase(for: $0)?.text } == "We have seen this film before.", "a gap-fill becomes a whole sentence")
let twoGaps = singleExercise(#"{"id":"g2","type":"multiple_choice","prompt":"We ___ it ___ .","options":["have"],"correctOption":"have"}"#)
expect(twoGaps.flatMap { ShadowingEngine.phrase(for: $0) } == nil, "a second gap cannot be filled, so the phrase is skipped")
let noGap = singleExercise(#"{"id":"g3","type":"multiple_choice","prompt":"Which is correct?","options":["this"],"correctOption":"this"}"#)
expect(noGap.flatMap { ShadowingEngine.phrase(for: $0) } == nil, "a question with no gap is not a phrase")
let rule = singleExercise(#"{"id":"i","type":"info","title":"Rule","explanation":"Правило"}"#)
expect(rule.flatMap { ShadowingEngine.phrase(for: $0) } == nil, "a rule card has nothing to say out loud")
// Real content: "That is my bag (там, далеко)." — the hint is for the eye, not the mouth.
let glossed = singleExercise(#"{"id":"h","type":"flashcard","prompt":"That is my bag (там, далеко).","translation":"Вон та сумка моя."}"#)
expect(glossed.flatMap { ShadowingEngine.phrase(for: $0)?.text } == "That is my bag.", "an inline Russian gloss is dropped")
let allRussian = singleExercise(#"{"id":"h2","type":"flashcard","prompt":"Совсем русская строка","translation":"x"}"#)
expect(allRussian.flatMap { ShadowingEngine.phrase(for: $0) } == nil, "a Russian line is never handed over to be said")

do {
    let courses = try ContentRepository.loadBundled()
    let identity: ([Exercise]) -> [Exercise] = { $0 }
    let pool = ShadowingEngine.pool(courses: courses, level: .a1)
    var state = UserState.fresh
    var dueItem = ReviewEngine.newItem(exerciseID: pool[4].id, now: now)
    dueItem.due = now.addingTimeInterval(-86_400)
    state.reviews = [dueItem]
    state.attempts = [AttemptRecord(id: UUID(), exerciseID: pool[7].id, correct: false, date: now)]

    let set = ShadowingEngine.build(courses: courses, level: .a1, state: state, size: 5, now: now, shuffle: identity)
    expect(set.exercises.first?.id == pool[4].id, "shadowing puts due repetitions first")
    expect(set.exercises.count > 1 && set.exercises[1].id == pool[7].id, "shadowing puts old mistakes second")
    // Items and exercises stay aligned: the screen reads one, the session records the other.
    expect(set.items.map(\.exerciseID) == set.exercises.map(\.id), "phrases line up with the exercises they came from")

    var speaking = LearningSession(state: .fresh)
    speaking.start(ShadowingEngine.lesson(set.exercises), recordsCompletion: false)
    speaking.selfAssess(true, now: now)
    expect(speaking.state.points == 10 && speaking.state.attempts.last?.correct == true, "a phrase that came out is recorded as correct")
    speaking.selfAssess(false, now: now)
    let missedPhrase = speaking.state.reviews.first { $0.exerciseID == set.exercises[1].id }
    // Like any miss, it drops to a one-day interval — and `prioritise` also puts it in
    // the "old mistakes" bucket, so it is back in the very next set regardless.
    expect(missedPhrase?.intervalDays == 1 && missedPhrase?.repetitions == 0, "a phrase that did not come out comes back")
    expect(speaking.state.completedLessonIDs.isEmpty, "shadowing is never recorded as a completed lesson")
} catch { failures += 1; print("✗ shadowing session: \(error)") }

// Listening: the sentences taken by ear. Mirrors web/src/core/core.test.ts.
do {
    let courses = try ContentRepository.loadBundled()
    for level in CEFRLevel.allCases {
        let pool = ListeningEngine.pool(courses: courses, level: level)
        // Eight per set: a level with fewer than that would run out mid-drill.
        expect(pool.count >= ListeningEngine.defaultSize, "\(level.rawValue) has enough to listen to")
        for exercise in pool {
            guard let item = ListeningEngine.phrase(for: exercise) else { failures += 1; print("✗ \(exercise.id): has a sentence"); continue }
            // The learner writes this down, so it has to be a whole sentence: an opener
            // leading nowhere and a collocation card are both unwritable.
            expect(!item.text.contains("…"), "\(exercise.id): not a sentence opener")
            expect(item.text.range(of: "^[A-Z].*[.!?]$", options: .regularExpression) != nil, "\(exercise.id): reads as a sentence")
            expect(item.text.split(whereSeparator: \.isWhitespace).count >= 3, "\(exercise.id): long enough to carry structure")
        }
    }
} catch { failures += 1; print("✗ listening pool: \(error)") }

// Fine to repeat aloud, impossible to write down: there is no rest of the sentence.
let opener = singleExercise(#"{"id":"o","type":"flashcard","prompt":"From my perspective…","translation":"С моей точки зрения…"}"#)
expect(opener.flatMap { ShadowingEngine.phrase(for: $0) } != nil, "an opener can still be said out loud")
expect(opener.flatMap { ListeningEngine.phrase(for: $0) } == nil, "an opener is never given to be written down")
let short = singleExercise(#"{"id":"s","type":"flashcard","prompt":"Thank you.","translation":"Спасибо."}"#)
expect(short.flatMap { ShadowingEngine.phrase(for: $0) } != nil, "two words are still worth saying")
expect(short.flatMap { ListeningEngine.phrase(for: $0) } == nil, "two words is vocabulary, not listening")
// Real content: collocations ship as cards. Three words, and still nothing to write down —
// "on the weekend" is a guess about the sentence it was cut out of.
let chunk = singleExercise(#"{"id":"col","type":"flashcard","prompt":"on the weekend","translation":"на выходных"}"#)
expect(chunk.flatMap { ShadowingEngine.phrase(for: $0) } != nil, "a collocation is still worth saying")
expect(chunk.flatMap { ListeningEngine.phrase(for: $0) } == nil, "a collocation card is not a sentence")

// A gap fill is played whole, so its own canonical answer is not what the learner heard
// and must not be what the answer is compared with.
if let gap = singleExercise(#"{"id":"g","type":"multiple_choice","prompt":"We ___ this film before.","options":["saw","have seen"],"correctOption":"have seen","canonicalAnswer":"have seen"}"#),
   let heard = ListeningEngine.phrase(for: gap) {
    expect(heard.text == "We have seen this film before.", "the whole sentence is what gets played")
    var ear = LearningSession(state: .fresh)
    ear.start(ListeningEngine.lesson([gap]), recordsCompletion: false)
    let result = ear.submitHeard("we have seen this film before", phrase: heard.text, now: now)
    expect(result.isCorrect && ear.state.points == 10, "the answer is checked against the sentence that was played")
} else {
    failures += 1
    print("✗ listening: a gap-fill sentence is long enough to listen to")
}

do {
    let courses = try ContentRepository.loadBundled()
    let identity: ([Exercise]) -> [Exercise] = { $0 }
    let set = ListeningEngine.build(courses: courses, level: .b1, state: .fresh, size: 2, now: now, shuffle: identity)
    expect(set.items.map(\.exerciseID) == set.exercises.map(\.id), "sentences line up with the exercises they came from")

    var ear = LearningSession(state: .fresh)
    ear.start(ListeningEngine.lesson(set.exercises), recordsCompletion: false)
    let result = ear.submitHeard("She has finished work.", phrase: "She has already finished work.", now: now)
    expect(!result.isCorrect, "a missing word is a miss")
    expect(AnswerChecker.diffSummary(result.diff)?.missing == ["already"], "the word the ear let through is named")
    let missed = ear.state.reviews.first { $0.exerciseID == set.exercises[0].id }
    expect(missed != nil, "a sentence that did not come through comes back")

    // "Не разобрал" is an honest miss, not a free pass.
    var giveUp = LearningSession(state: .fresh)
    giveUp.start(ListeningEngine.lesson(set.exercises), recordsCompletion: false)
    let revealed = giveUp.submitHeard("", phrase: set.items[0].text, now: now)
    expect(!revealed.isCorrect && revealed.canonical == set.items[0].text, "giving up still hands back the sentence")
    expect(giveUp.state.points == 0, "giving up earns nothing")
} catch { failures += 1; print("✗ listening session: \(error)") }

// MARK: - Languages
//
// Whatever is true of the app has to be true of every language it ships, not only of the
// one it was written for. A new language passes here or it does not ship.

expect(AnswerChecker.check("Soy de Lituania.", canonical: "Soy de Lituania.", language: .es).verdict == .correct, "es: exact answer")
let esAccents = AnswerChecker.check("Como te llamas?", canonical: "¿Cómo te llamas?", language: .es)
expect(esAccents.verdict == .typo && esAccents.isCorrect && esAccents.typo == "¿Cómo te llamas?", "es: a missing accent costs the spelling, not the answer")
expect(AnswerChecker.check("Yo hablo español", canonical: "Yo hablas español", language: .es).verdict == .wrong, "es: person is not a typo")
expect(AnswerChecker.check("Ella trabaja aquí", canonical: "Ella trabajo aquí", language: .es).verdict == .wrong, "es: conjugation is not a typo")
expect(AnswerChecker.check("la casa blanco", canonical: "la casa blanca", language: .es).verdict == .wrong, "es: gender is not a typo")
expect(AnswerChecker.check("Vivo en el restaurnte", canonical: "Vivo en el restaurante", language: .es).verdict == .typo, "es: a real slip in a long word still is one")
expect(AnswerChecker.check("Tengo un coche nuevo", canonical: "Tengo un carro nuevo", language: .es).verdict == .correct, "es: Spain and Latin America are both right")
expect(AnswerChecker.check("He comido", canonical: "He comido", language: .es).verdict == .correct, "es: English rules do not leak")

let shipped = ContentRepository.availableLanguages()
expect(Set(shipped) == Set(LanguageCode.allCases), "every declared language ships content")

for language in shipped {
    let name = language.rawValue
    do {
        let packs = try ContentRepository.loadBundled(language)
        let syllabus = try ContentRepository.loadSyllabus(language)
        let bank = try ContentRepository.loadPlacement(language)
        expect(Set(packs.map(\.level)) == Set(CEFRLevel.allCases), "\(name): courses cover A1-C1")
        expect(Set(bank.questions.map(\.level)) == Set(CEFRLevel.allCases), "\(name): placement covers A1-C1")
        expect(syllabus.topics.count > 20, "\(name): syllabus covers a real programme")
        expect(Set(syllabus.topics.map(\.level)) == Set(CEFRLevel.allCases), "\(name): syllabus covers A1-C1")
        expect(SyllabusEngine.unknownTopics(of: syllabus, in: packs).isEmpty, "\(name): content only tags topics the syllabus defines")

        let exercises = packs.flatMap(\.chapters).flatMap(\.lessons).flatMap(\.exercises)
        expect(exercises.allSatisfy { !($0.topics ?? []).isEmpty }, "\(name): every exercise carries a topic")
        expect(exercises.allSatisfy { exercise in
            guard exercise.type == .wordOrder, let tokens = exercise.tokens else { return true }
            let tray = AnswerChecker.normalize(tokens.joined(separator: " "), language: language).split(separator: " ").sorted()
            let answer = AnswerChecker.normalize(exercise.canonicalAnswer ?? "", language: language).split(separator: " ").sorted()
            return tray == answer
        }, "\(name): every word tray can build its answer")

        let gaps = SyllabusEngine.gaps(of: syllabus, in: packs)
        expect(gaps.count <= syllabus.coverageDebtCeiling,
               "\(name): coverage debt did not grow (\(gaps.count) of ceiling \(syllabus.coverageDebtCeiling))")

        // Готовность к заданию, а не только наличие темы: перевод не должен требовать
        // слов, которых курс ещё не показывал. Для A1 это не долг, а условие — человек
        // приходит с нуля, и первое же «напиши Soy de Lituania» его останавливает.
        let beginnerDebt = VocabularyOrder.unseen(in: packs.filter { $0.level == .a1 })
        expect(beginnerDebt.isEmpty,
               "\(name): A1 не просит произвести неизученное (\(beginnerDebt.count) мест)")
        let vocabularyDebt = VocabularyOrder.unseen(in: packs)
        let vocabularyCeiling = syllabus.vocabularyDebtCeiling ?? 0
        expect(vocabularyDebt.count <= vocabularyCeiling,
               "\(name): vocabulary debt did not grow (\(vocabularyDebt.count) of ceiling \(vocabularyCeiling))")

        // A lesson has to be completable start to finish in this language's own rules.
        let lesson = packs.sorted { $0.level.rawValue < $1.level.rawValue }[0].chapters[0].lessons[0]
        var session = LearningSession(state: .fresh, language: language)
        session.start(lesson)
        while !session.isComplete {
            guard let exercise = session.currentExercise else { break }
            if exercise.type == .multipleChoice { session.submitChoice(exercise.correctOption ?? "") }
            else if let answer = exercise.canonicalAnswer { session.submitText(answer) }
            else { session.completePassiveExercise() }
            if !session.isComplete, session.feedback != nil { session.advance() }
        }
        expect(session.state.points > 0 && session.state.completedLessonIDs.contains(lesson.id), "\(name): a lesson can be finished")
    } catch { failures += 1; print("✗ \(name) content: \(error)") }
}


if failures > 0 { print("\n\(failures) test(s) failed"); exit(1) }
print("\nAll core tests passed")
