import Foundation

public struct LearningSession: Sendable {
    public private(set) var state: UserState
    public private(set) var activeLesson: Lesson?
    public private(set) var exerciseIndex = 0
    public private(set) var feedback: AnswerResult?
    public private(set) var retryUsed = false
    private var recordsCompletion = true
    private var lastAnswer: String?
    /// Set when the current attempt created a fresh review item, so it can be undone.
    private var lastCreatedReviewID: String?

    public init(state: UserState) { self.state = state }

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
    }

    @discardableResult
    public mutating func submitText(_ answer: String, now: Date = .now) -> AnswerResult {
        guard let exercise = currentExercise else { return AnswerResult(isCorrect: false, verdict: .wrong, canonical: "") }
        let canonical = exercise.canonicalAnswer ?? ""
        let learnerApproved = state.acceptedAnswers?[exercise.id] ?? []
        let result = AnswerChecker.check(answer, canonical: canonical, accepted: (exercise.acceptedAnswers ?? []) + learnerApproved)
        lastAnswer = answer
        record(exercise: exercise, result: result, now: now)
        return result
    }

    @discardableResult
    public mutating func submitChoice(_ choice: String, now: Date = .now) -> AnswerResult {
        guard let exercise = currentExercise else { return AnswerResult(isCorrect: false, verdict: .wrong, canonical: "") }
        let canonical = exercise.correctOption ?? ""
        let result = AnswerChecker.check(choice, canonical: canonical, accepted: [])
        lastAnswer = choice
        record(exercise: exercise, result: result, now: now)
        return result
    }

    public mutating func completePassiveExercise(now: Date = .now) {
        guard let exercise = currentExercise else { return }
        record(exercise: exercise, result: AnswerResult(isCorrect: true, verdict: .correct, canonical: exercise.prompt ?? exercise.title ?? ""), now: now)
        advance()
    }

    /// "Я был прав": remembers the learner's phrasing for this exercise, flips the attempt
    /// and undoes the spaced repetition penalty this answer just caused. Without the last
    /// part the escape hatch would still punish a correct answer.
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

        if let created = lastCreatedReviewID {
            state.reviews.removeAll { $0.id == created }
            lastCreatedReviewID = nil
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

    private mutating func record(exercise: Exercise, result: AnswerResult, now: Date) {
        feedback = result
        lastCreatedReviewID = nil
        state.attempts.append(AttemptRecord(id: UUID(), exerciseID: exercise.id, correct: result.isCorrect, date: now))
        if result.isCorrect {
            state.points += 10
            if let index = state.reviews.firstIndex(where: { $0.exerciseID == exercise.id }) {
                state.reviews[index] = ReviewEngine.recordSuccess(state.reviews[index], now: now)
            }
        } else if let index = state.reviews.firstIndex(where: { $0.exerciseID == exercise.id }) {
            state.reviews[index] = ReviewEngine.recordFailure(state.reviews[index], now: now)
        } else {
            let item = ReviewEngine.newItem(exerciseID: exercise.id, now: now)
            state.reviews.append(item)
            lastCreatedReviewID = item.id
        }
    }
}
