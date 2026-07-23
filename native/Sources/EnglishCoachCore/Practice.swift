import Foundation

/// Endless practice built from the corpus that already ships, kept in step with
/// `web/src/core/practice.ts`.
///
/// A level is five lessons, about fifty minutes: the course runs out long before a
/// daily habit forms, and "прошёл всё, что дальше" is where people stop. Practice has
/// no end and no completion: it keeps handing over what is due, what was failed, and
/// what has never been seen, in that order.
public enum PracticeEngine {
    public static let lessonID = "practice"
    public static let defaultSize = 10

    /// Everything the learner may be asked, up to and including the current level.
    /// Rule cards are excluded: reading a rule is not practice.
    public static func pool(courses: [CoursePack], level: CEFRLevel) -> [Exercise] {
        let ceiling = LevelOrder.all.firstIndex(of: level) ?? 0
        return courses
            .filter { (LevelOrder.all.firstIndex(of: $0.level) ?? 0) <= ceiling }
            .sorted { (LevelOrder.all.firstIndex(of: $0.level) ?? 0) < (LevelOrder.all.firstIndex(of: $1.level) ?? 0) }
            .flatMap(\.chapters).flatMap(\.lessons).flatMap(\.exercises)
            .filter { $0.type != .info }
    }

    public static func build(
        courses: [CoursePack],
        level: CEFRLevel,
        state: UserState,
        size: Int = defaultSize,
        now: Date = .now,
        shuffle: ([Exercise]) -> [Exercise] = { $0.shuffled() }
    ) -> [Exercise] {
        let pool = pool(courses: courses, level: level)
        guard !pool.isEmpty else { return [] }
        let byID = Dictionary(pool.map { ($0.id, $0) }, uniquingKeysWith: { first, _ in first })

        let due = state.reviews
            .filter { $0.due <= now && byID[$0.exerciseID] != nil }
            .sorted { $0.due < $1.due }
            .compactMap { byID[$0.exerciseID] }

        let attempted = Set(state.attempts.map(\.exerciseID))
        let failed = Set(state.attempts.filter { !$0.correct }.map(\.exerciseID))

        let buckets: [[Exercise]] = [
            due,
            shuffle(pool.filter { failed.contains($0.id) }),
            shuffle(pool.filter { !attempted.contains($0.id) }),
            shuffle(pool.filter { attempted.contains($0.id) && !failed.contains($0.id) })
        ]

        var selected: [Exercise] = []
        var taken = Set<String>()
        for bucket in buckets {
            for exercise in bucket {
                if selected.count >= size { return selected }
                guard taken.insert(exercise.id).inserted else { continue }
                selected.append(exercise)
            }
        }
        return selected
    }

    /// Practice is never "completed", so the session must be started with
    /// `recordsCompletion: false`.
    public static func lesson(_ exercises: [Exercise]) -> Lesson {
        Lesson(
            id: lessonID,
            title: "Тренировка",
            summary: "Повторение и новые упражнения вперемешку.",
            estimatedMinutes: max(2, Int((Double(exercises.count) * 0.6).rounded())),
            exercises: exercises
        )
    }
}
