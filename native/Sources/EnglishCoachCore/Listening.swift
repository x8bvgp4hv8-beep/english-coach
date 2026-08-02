import Foundation

/// Listening: hear the sentence, write down what you heard, see what slipped past.
/// Kept in step with `web/src/core/listening.ts`.
///
/// Everything else in the app puts the English in front of the eyes first. That trains
/// reading, and reading is the skill that was never the problem: the wall is a native
/// speaker saying a sentence at speed. Here the text is hidden until the answer is in,
/// so the only way through is the ear.
///
/// It is checked, not self-assessed. The same checker the written exercises use already
/// forgives contractions, British spelling and a slipped letter, and its word diff can
/// name the words that did not come through — which is exactly the feedback a listener
/// needs. Sentences are the ones that already ship: no new content, no network, no keys.
public struct ListeningItem: Identifiable, Equatable, Sendable {
    /// The exercise the sentence came from: progress is recorded against it.
    public let exerciseID: String
    /// The English sentence, played but not shown until the answer is in.
    public let text: String
    /// Russian meaning, offered as a hint before the answer.
    public let gloss: String?

    public var id: String { exerciseID }

    public init(exerciseID: String, text: String, gloss: String?) {
        self.exerciseID = exerciseID; self.text = text; self.gloss = gloss
    }
}

public struct ListeningSet: Equatable, Sendable {
    public let items: [ListeningItem]
    /// The same sentences as exercises, so the session records against real ids.
    public let exercises: [Exercise]
}

public enum ListeningEngine {
    public static let lessonID = "listening"
    public static let defaultSize = 8

    /// Two words heard is vocabulary; three carry a structure, and structure is what gets
    /// lost at speed. Below that it is a spelling test with a speaker attached.
    private static let minimumWords = 3

    /// Sentence-shaped: a capital at the front, a full stop at the back. The content also
    /// teaches collocations as cards — "on the weekend", "be going to", "used to live" —
    /// and those clear three words without being anything a learner can write down: torn
    /// out of a sentence, "on the weekend" is a guess about what came before it.
    private static let sentence = "^[A-Z].*[.!?]$"

    /// The sentence to play for an exercise, or nil when it has none worth listening to.
    public static func phrase(for exercise: Exercise) -> ListeningItem? {
        guard let spoken = ShadowingEngine.phrase(for: exercise) else { return nil }
        // "From my perspective…" is a sentence opener, not a sentence: nobody can write
        // down where it was going. Fine to say out loud, useless to transcribe.
        guard !spoken.text.contains("…") else { return nil }
        guard spoken.text.range(of: sentence, options: .regularExpression) != nil else { return nil }
        let words = spoken.text.split(whereSeparator: { $0.isWhitespace })
        guard words.count >= minimumWords else { return nil }
        return ListeningItem(exerciseID: spoken.exerciseID, text: spoken.text, gloss: spoken.gloss)
    }

    /// Every sentence the learner could take by ear at this level and below.
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
    ) -> ListeningSet {
        let ordered = PracticeEngine.prioritise(pool(courses: courses, level: level), state: state, now: now, shuffle: shuffle)
        let exercises = Array(ordered.prefix(size))
        return ListeningSet(items: exercises.compactMap { phrase(for: $0) }, exercises: exercises)
    }

    /// Writing down what you heard is slow, so a set is short; it is never "completed".
    public static func lesson(_ exercises: [Exercise]) -> Lesson {
        Lesson(
            id: lessonID,
            title: "На слух",
            summary: "Слушай и записывай.",
            estimatedMinutes: max(2, exercises.count),
            exercises: exercises
        )
    }
}
