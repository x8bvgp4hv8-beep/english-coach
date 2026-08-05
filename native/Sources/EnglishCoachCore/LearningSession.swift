import Foundation

public struct LearningSession: Sendable {
    public private(set) var state: UserState
    public private(set) var activeLesson: Lesson?
    public private(set) var exerciseIndex = 0
    public private(set) var feedback: AnswerResult?
    public private(set) var retryUsed = false
    private var recordsCompletion = true
    private var lastAnswer: String?
    /// Enough to redo the last attempt as if it had been right, for the escape hatch.
    private var lastReview: (exerciseID: String, before: ReviewItem?, at: Date)?
    /// Exercises the learner had already met when this set was opened. Taken once at
    /// `start` rather than read live, so a card does not change shape under the learner's
    /// hands the moment they answer it, or on the way back through `goBack`.
    private var seenBefore: Set<String> = []

    /// Which language is being learnt: the checker judges Spanish by Spanish rules.
    public let language: LanguageCode

    public init(state: UserState, language: LanguageCode = .default) {
        self.state = state; self.language = language
    }

    public var currentExercise: Exercise? {
        guard let lesson = activeLesson, lesson.exercises.indices.contains(exerciseIndex) else { return nil }
        return lesson.exercises[exerciseIndex]
    }

    public var isComplete: Bool {
        guard let lesson = activeLesson else { return false }
        return exerciseIndex >= lesson.exercises.count
    }

    /// `recordsCompletion: false` for generated sets (practice, daily review): finishing
    /// them must not put a synthetic lesson id into the learner's completed lessons.
    public mutating func start(_ lesson: Lesson, recordsCompletion: Bool = true) {
        activeLesson = lesson; self.recordsCompletion = recordsCompletion
        exerciseIndex = 0; feedback = nil; retryUsed = false
        seenBefore = Set(state.attempts.map(\.exerciseID))
    }

    /// A card met for the first time is something to read; the same card met again is a
    /// word to recall.
    ///
    /// Without this every flashcard was passive for ever: it showed both sides at once and
    /// the "Запомнил" button recorded a correct answer whether or not anything had been
    /// remembered, so a word nobody knew was scheduled as one that had been recalled.
    /// Recall makes the second meeting a question, so "не вспомнил" is finally something
    /// the app can hear.
    public var currentIsRecall: Bool {
        guard let exercise = currentExercise else { return false }
        return exercise.type == .flashcard && seenBefore.contains(exercise.id)
    }

    @discardableResult
    public mutating func submitText(_ answer: String, now: Date = .now) -> AnswerResult {
        guard let exercise = currentExercise else { return AnswerResult(isCorrect: false, verdict: .wrong, canonical: "") }
        let canonical = exercise.canonicalAnswer ?? ""
        let learnerApproved = state.acceptedAnswers?[exercise.id] ?? []
        let result = AnswerChecker.check(answer, canonical: canonical, accepted: (exercise.acceptedAnswers ?? []) + learnerApproved, language: language)
        lastAnswer = answer
        record(exercise: exercise, result: result, now: now)
        return result
    }

    @discardableResult
    public mutating func submitChoice(_ choice: String, now: Date = .now) -> AnswerResult {
        guard let exercise = currentExercise else { return AnswerResult(isCorrect: false, verdict: .wrong, canonical: "") }
        let canonical = exercise.correctOption ?? ""
        let result = AnswerChecker.check(choice, canonical: canonical, accepted: [], language: language)
        lastAnswer = choice
        record(exercise: exercise, result: result, now: now)
        return result
    }

    /// Listening: the sentence being checked is the one that was played, and that is not
    /// always the exercise's own answer — a gap fill is played as the whole sentence. So
    /// the expected text comes from the caller rather than from the exercise.
    @discardableResult
    public mutating func submitHeard(_ answer: String, phrase: String, now: Date = .now) -> AnswerResult {
        guard let exercise = currentExercise else { return AnswerResult(isCorrect: false, verdict: .wrong, canonical: phrase) }
        let result = AnswerChecker.check(answer, canonical: phrase, accepted: [], language: language)
        record(exercise: exercise, result: result, now: now)
        return result
    }

    public mutating func completePassiveExercise(now: Date = .now) {
        guard let exercise = currentExercise else { return }
        record(exercise: exercise, result: AnswerResult(isCorrect: true, verdict: .correct, canonical: exercise.prompt ?? exercise.title ?? ""), now: now)
        advance()
    }

    /// Shadowing has no answer to check: the learner hears the phrase, says it, hears
    /// both takes and decides. Their verdict still counts, so a phrase that did not
    /// come out of the mouth comes back like any other mistake.
    public mutating func selfAssess(_ correct: Bool, now: Date = .now) {
        guard let exercise = currentExercise else { return }
        let canonical = exercise.canonicalAnswer ?? exercise.prompt ?? ""
        record(exercise: exercise, result: AnswerResult(isCorrect: correct, verdict: correct ? .correct : .wrong, canonical: canonical), now: now)
        advance()
    }

    /// "Я был прав": remembers the learner's phrasing for this exercise, flips the attempt
    /// and reschedules the exercise as if the answer had been right. Without the last part
    /// the escape hatch would still punish a correct answer.
    public mutating func markLastAnswerCorrect() {
        guard let exercise = currentExercise, let answer = lastAnswer, feedback?.isCorrect == false else { return }
        var approved = state.acceptedAnswers ?? [:]
        approved[exercise.id, default: []].append(answer)
        state.acceptedAnswers = approved

        if let index = state.attempts.lastIndex(where: { $0.exerciseID == exercise.id }) {
            let attempt = state.attempts[index]
            state.attempts[index] = AttemptRecord(id: attempt.id, exerciseID: attempt.exerciseID, correct: true, date: attempt.date)
        }
        state.points += 10

        // Not "remove the penalty" but "reschedule as if the answer had been right": the
        // exercise was still answered, and it is still due one day from now like any other.
        if let last = lastReview, last.exerciseID == exercise.id,
           let index = state.reviews.firstIndex(where: { $0.exerciseID == exercise.id }) {
            let base = last.before ?? ReviewEngine.newItem(exerciseID: exercise.id, now: last.at)
            state.reviews[index] = ReviewEngine.recordSuccess(base, now: last.at)
            lastReview = nil
        }
        feedback = AnswerResult(isCorrect: true, verdict: .correct, canonical: exercise.canonicalAnswer ?? "")
    }

    public mutating func advance() {
        feedback = nil; retryUsed = false; exerciseIndex += 1
        if let lesson = activeLesson, recordsCompletion, exerciseIndex >= lesson.exercises.count {
            state.completedLessonIDs.insert(lesson.id)
        }
    }

    public mutating func retry() {
        retryUsed = true; feedback = nil
    }

    public var canGoBack: Bool { exerciseIndex > 0 }

    public mutating func goBack() {
        guard exerciseIndex > 0 else { return }
        feedback = nil; retryUsed = false; exerciseIndex -= 1
    }

    public mutating func completeCurrentCorrectlyForTesting(now: Date) {
        guard let exercise = currentExercise else { return }
        switch exercise.type {
        case .info, .flashcard:
            completePassiveExercise(now: now)
        case .multipleChoice:
            _ = submitChoice(exercise.correctOption ?? "", now: now); advance()
        case .translate, .wordOrder:
            _ = submitText(exercise.canonicalAnswer ?? "", now: now); advance()
        }
    }

    /// Every answer schedules the exercise; only the interval differs.
    ///
    /// A review item used to be created on failure alone, so anything answered correctly
    /// the first time was never scheduled again — which is the opposite of what spaced
    /// repetition is for. The engine had always been able to do it: `recordSuccess` walks
    /// 1 → 3 → 7 days and then multiplies by ease, and nothing ever called it on a first
    /// correct answer. What the app had was a queue of mistakes wearing an SRS coat.
    private mutating func record(exercise: Exercise, result: AnswerResult, now: Date) {
        feedback = result
        state.attempts.append(AttemptRecord(id: UUID(), exerciseID: exercise.id, correct: result.isCorrect, date: now))
        if result.isCorrect { state.points += 10 }

        let index = state.reviews.firstIndex { $0.exerciseID == exercise.id }
        let known = index.map { state.reviews[$0] }
        let base = known ?? ReviewEngine.newItem(exerciseID: exercise.id, now: now)
        let updated = result.isCorrect
            ? ReviewEngine.recordSuccess(base, now: now)
            : ReviewEngine.recordFailure(base, now: now)
        lastReview = (exercise.id, known, now)

        if let index { state.reviews[index] = updated } else { state.reviews.append(updated) }
    }
}
