import Foundation

/// Endless practice built from the corpus that already ships, kept in step with
/// `web/src/core/practice.ts`.
///
/// A level is five lessons, about fifty minutes: the course runs out long before a
/// daily habit forms, and "прошёл всё, что дальше" is where people stop. Practice has
/// no end and no completion: it keeps handing over what is due, what was failed, and
/// what has never been seen, in that order.
/// One entry of the "виды заданий" menu on the main screen.
public struct PracticeKind: Identifiable, Equatable, Sendable {
    public let id: String
    public let title: String
    public let subtitle: String
    public let types: [ExerciseType]
}

public enum PracticeEngine {
    public static let lessonID = "practice"
    public static let defaultSize = 10

    /// The kinds of practice offered on the main screen, in the order they are shown.
    public static let kinds: [PracticeKind] = [
        PracticeKind(id: "mixed", title: "Всё вперемешку", subtitle: "Сначала сложное, потом новое",
                     types: [.flashcard, .translate, .wordOrder, .multipleChoice]),
        PracticeKind(id: "flashcard", title: "Карточки", subtitle: "Новое показывается, знакомое спрашивается", types: [.flashcard]),
        PracticeKind(id: "translate", title: "Перевод", subtitle: "С русского, письменно", types: [.translate]),
        PracticeKind(id: "word_order", title: "Собрать предложение", subtitle: "Слова даны, нужен порядок", types: [.wordOrder]),
        PracticeKind(id: "multiple_choice", title: "Тесты", subtitle: "Выбрать правильный вариант", types: [.multipleChoice])
    ]

    /// Everything the learner may be asked, up to and including the current level.
    /// Rule cards are excluded: reading a rule is not practice.
    public static func pool(courses: [CoursePack], level: CEFRLevel, types: [ExerciseType]? = nil, topics: [String]? = nil) -> [Exercise] {
        let ceiling = LevelOrder.all.firstIndex(of: level) ?? 0
        return courses
            .filter { (LevelOrder.all.firstIndex(of: $0.level) ?? 0) <= ceiling }
            .sorted { (LevelOrder.all.firstIndex(of: $0.level) ?? 0) < (LevelOrder.all.firstIndex(of: $1.level) ?? 0) }
            .flatMap(\.chapters).flatMap(\.lessons).flatMap(\.exercises)
            .filter { $0.type != .info }
            .filter { types == nil || types!.contains($0.type) }
            .filter { exercise in
                guard let topics else { return true }
                return (exercise.topics ?? []).contains { topics.contains($0) }
            }
    }

    /// How much material each kind of practice has at this level, for the menu.
    public static func counts(courses: [CoursePack], level: CEFRLevel) -> [String: Int] {
        Dictionary(uniqueKeysWithValues: kinds.map { ($0.id, pool(courses: courses, level: level, types: $0.types).count) })
    }

    /// Everything the learner could be given next, in the order it should be offered:
    /// due repetitions, then old mistakes, then unseen material, then the rest.
    /// Shared with shadowing, which needs the same order over a narrower pool.
    public static func prioritise(
        _ pool: [Exercise],
        state: UserState,
        now: Date = .now,
        shuffle: ([Exercise]) -> [Exercise] = { $0.shuffled() }
    ) -> [Exercise] {
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

        var ordered: [Exercise] = []
        var taken = Set<String>()
        for bucket in buckets {
            for exercise in bucket where taken.insert(exercise.id).inserted {
                ordered.append(exercise)
            }
        }
        return ordered
    }

    public static func build(
        courses: [CoursePack],
        level: CEFRLevel,
        state: UserState,
        types: [ExerciseType]? = nil,
        topics: [String]? = nil,
        size: Int = defaultSize,
        now: Date = .now,
        shuffle: ([Exercise]) -> [Exercise] = { $0.shuffled() }
    ) -> [Exercise] {
        let pool = pool(courses: courses, level: level, types: types, topics: topics)
        guard !pool.isEmpty else { return [] }
        return Array(prioritise(pool, state: state, now: now, shuffle: shuffle).prefix(size))
    }

    /// Practice is never "completed", so the session must be started with
    /// `recordsCompletion: false`.
    public static func lesson(_ exercises: [Exercise], title: String = "Тренировка") -> Lesson {
        Lesson(
            id: lessonID,
            title: title,
            summary: "Повторение и новые упражнения вперемешку.",
            estimatedMinutes: max(2, Int((Double(exercises.count) * 0.6).rounded())),
            exercises: exercises
        )
    }
}
