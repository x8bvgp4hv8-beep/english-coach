import Foundation

/// Shadowing: hear the phrase, say it out loud, record yourself, hear both back.
/// Kept in step with `web/src/core/shadowing.ts`.
///
/// Everything else in the app is read with the eyes and answered with the fingers,
/// which never gets the mouth moving. There is no speech grading here and no need
/// for one: the learner hears their own take next to the model phrase and judges it.
/// The verdict is theirs, but it still feeds points and spaced repetition, so a
/// phrase that did not come out comes back.
///
/// The phrases are the ones that already ship — no new content, no network, no keys.
public struct ShadowingItem: Identifiable, Equatable, Sendable {
    /// The exercise the phrase came from: progress is recorded against it.
    public let exerciseID: String
    /// The English sentence to say out loud.
    public let text: String
    /// Russian meaning, when the source exercise carries one.
    public let gloss: String?

    public var id: String { exerciseID }

    public init(exerciseID: String, text: String, gloss: String?) {
        self.exerciseID = exerciseID; self.text = text; self.gloss = gloss
    }
}

public struct ShadowingSet: Equatable, Sendable {
    public let items: [ShadowingItem]
    /// The same phrases as exercises, so the session records against real ids.
    public let exercises: [Exercise]
}

public enum ShadowingEngine {
    public static let lessonID = "shadowing"
    public static let defaultSize = 8

    /// The English sentence hidden in an exercise, or nil when it has none to say.
    public static func phrase(for exercise: Exercise) -> ShadowingItem? {
        func make(_ text: String?, gloss: String? = nil) -> ShadowingItem? {
            guard let spoken = sayable(text ?? "") else { return nil }
            let meaning = (gloss ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
            return ShadowingItem(exerciseID: exercise.id, text: spoken, gloss: meaning.isEmpty ? nil : meaning)
        }
        switch exercise.type {
        case .flashcard: return make(exercise.prompt, gloss: exercise.translation)
        case .translate, .wordOrder: return make(exercise.canonicalAnswer, gloss: exercise.prompt)
        case .multipleChoice: return make(filledGap(exercise))
        case .info: return nil // a rule card has nothing to say out loud
        }
    }

    private static let cyrillic = "[\u{0400}-\u{04FF}]"

    /// The line has to survive being read out loud. Content sometimes glosses a word in
    /// Russian inside the sentence ("That is my bag (там, далеко)."): that is for the eye.
    /// Anything still Russian after the glosses are dropped is not a phrase to shadow.
    private static func sayable(_ text: String) -> String? {
        let spoken = text
            .replacingOccurrences(of: "\\s*\\([^)]*\(cyrillic)[^)]*\\)", with: "", options: .regularExpression)
            .replacingOccurrences(of: "\\s+", with: " ", options: .regularExpression)
            .trimmingCharacters(in: .whitespacesAndNewlines)
        guard !spoken.isEmpty, spoken.range(of: cyrillic, options: .regularExpression) == nil else { return nil }
        return spoken
    }

    /// "We ___ this film before." + "have seen" → a whole sentence worth saying.
    private static func filledGap(_ exercise: Exercise) -> String? {
        let prompt = exercise.prompt ?? ""
        let option = exercise.correctOption ?? ""
        guard !option.isEmpty, let gap = prompt.range(of: "_{2,}", options: .regularExpression) else { return nil }
        let sentence = prompt.replacingCharacters(in: gap, with: option)
        // A second gap would leave the sentence unsayable, so it is left out entirely.
        return sentence.range(of: "_{2,}", options: .regularExpression) == nil ? sentence : nil
    }

    /// Every phrase the learner could shadow at this level and below.
    public static func pool(courses: [CoursePack], level: CEFRLevel) -> [Exercise] {
        PracticeEngine.pool(courses: courses, level: level).filter { phrase(for: $0) != nil }
    }

    public static func count(courses: [CoursePack], level: CEFRLevel) -> Int {
        pool(courses: courses, level: level).count
    }

    public static func build(
        courses: [CoursePack],
        level: CEFRLevel,
        state: UserState,
        size: Int = defaultSize,
        now: Date = .now,
        shuffle: ([Exercise]) -> [Exercise] = { $0.shuffled() }
    ) -> ShadowingSet {
        let ordered = PracticeEngine.prioritise(pool(courses: courses, level: level), state: state, now: now, shuffle: shuffle)
        let exercises = Array(ordered.prefix(size))
        return ShadowingSet(items: exercises.compactMap { phrase(for: $0) }, exercises: exercises)
    }

    /// Speaking is slower than typing, so a set is short; it is never "completed".
    public static func lesson(_ exercises: [Exercise]) -> Lesson {
        Lesson(
            id: lessonID,
            title: "Вслух за диктором",
            summary: "Слушай, повторяй, сравнивай.",
            estimatedMinutes: max(2, exercises.count),
            exercises: exercises
        )
    }
}
