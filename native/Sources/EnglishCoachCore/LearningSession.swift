import Foundation

public struct LearningSession: Sendable {
    public private(set) var state: UserState
    public private(set) var activeLesson: Lesson?
    public private(set) var exerciseIndex = 0
    public private(set) var feedback: AnswerResult?
    public private(set) var retryUsed = false

    public init(state: UserState) { self.state = state }

    public var currentExercise: Exercise? {
        guard let lesson = activeLesson, lesson.exercises.indices.contains(exerciseIndex) else { return nil }
        return lesson.exercises[exerciseIndex]
    }

    public var isComplete: Bool {
        guard let lesson = activeLesson else { return false }
        return exerciseIndex >= lesson.exercises.count
    }

    public mutating func start(_ lesson: Lesson) {
        activeLesson = lesson; exerciseIndex = 0; feedback = nil; retryUsed = false
    }

    @discardableResult
    public mutating func submitText(_ answer: String, now: Date = .now) -> AnswerResult {
        guard let exercise = currentExercise else { return AnswerResult(isCorrect: false, canonical: "") }
        let canonical = exercise.canonicalAnswer ?? ""
        let result = AnswerChecker.check(answer, canonical: canonical, accepted: exercise.acceptedAnswers ?? [])
        record(exercise: exercise, result: result, now: now)
        return result
    }

    @discardableResult
    public mutating func submitChoice(_ choice: String, now: Date = .now) -> AnswerResult {
        guard let exercise = currentExercise else { return AnswerResult(isCorrect: false, canonical: "") }
        let canonical = exercise.correctOption ?? ""
        let result = AnswerChecker.check(choice, canonical: canonical, accepted: [])
        record(exercise: exercise, result: result, now: now)
        return result
    }

    public mutating func completePassiveExercise(now: Date = .now) {
        guard let exercise = currentExercise else { return }
        record(exercise: exercise, result: AnswerResult(isCorrect: true, canonical: exercise.prompt ?? exercise.title ?? ""), now: now)
        advance()
    }

    public mutating func advance() {
        feedback = nil; retryUsed = false; exerciseIndex += 1
        if let lesson = activeLesson, exerciseIndex >= lesson.exercises.count {
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
        state.attempts.append(AttemptRecord(id: UUID(), exerciseID: exercise.id, correct: result.isCorrect, date: now))
        if result.isCorrect {
            state.points += 10
            if let index = state.reviews.firstIndex(where: { $0.exerciseID == exercise.id }) {
                state.reviews[index] = ReviewEngine.recordSuccess(state.reviews[index], now: now)
            }
        } else if let index = state.reviews.firstIndex(where: { $0.exerciseID == exercise.id }) {
            state.reviews[index] = ReviewEngine.recordFailure(state.reviews[index], now: now)
        } else {
            state.reviews.append(ReviewEngine.newItem(exerciseID: exercise.id, now: now))
        }
    }
}
