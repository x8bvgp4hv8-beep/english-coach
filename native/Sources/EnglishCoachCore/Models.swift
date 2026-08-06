import Foundation

public enum ProductInfo {
    public static let name = "English Coach"
}

public enum CEFRLevel: String, Codable, CaseIterable, Identifiable, Sendable {
    case a1 = "A1", a2 = "A2", b1 = "B1", b2 = "B2", c1 = "C1"
    public var id: String { rawValue }
}

public enum ExerciseType: String, Codable, CaseIterable, Sendable {
    case info, flashcard, translate, dialogue
    case wordOrder = "word_order"
    case multipleChoice = "multiple_choice"

    /// The step of the lesson this kind of exercise belongs to.
    public var step: LessonStep {
        switch self {
        case .dialogue: .listen
        case .flashcard: .words
        case .info: .rule
        case .multipleChoice, .wordOrder: .recognise
        case .translate: .produce
        }
    }
}

/// The five steps of a lesson, always in this order. Mirrors web/src/core/types.ts.
///
/// Every serious course teaches by climbing: hear the language whole, meet the words,
/// get the rule that explains what was just heard, recognise it with the answer in front
/// of you, and only then produce it from nothing. Duolingo calls it scaffolding — "tap
/// the ending" before "type the ending".
///
/// Ours was not climbing at all. The order inside a lesson was whatever order the JSON
/// happened to be written in: the second Spanish lesson asked for a free translation
/// fifth, between two flashcards. So the step is derived from the exercise type and the
/// decoder refuses a v2 pack whose lesson goes back down a step.
public enum LessonStep: Int, CaseIterable, Sendable {
    case listen, words, rule, recognise, produce

    /// What the learner sees above each step, so the shape of a lesson is never a surprise.
    public var title: String {
        switch self {
        case .listen: "ПОСЛУШАЙ"
        case .words: "НОВОЕ СЛОВО"
        case .rule: "КОРОТКОЕ ПРАВИЛО"
        case .recognise: "УЗНАЙ"
        case .produce: "СКАЖИ САМ"
        }
    }
}

/// One turn of a dialogue: who says it, what they say, what it means.
public struct DialogueLine: Codable, Equatable, Sendable {
    public let speaker: String
    public let text: String
    public let translation: String

    public init(speaker: String, text: String, translation: String) {
        self.speaker = speaker; self.text = text; self.translation = translation
    }
}

/// A checkpoint closes a unit: the same situation end to end, no hints, production only.
public enum LessonKind: String, Codable, Sendable {
    case lesson, checkpoint
}

public struct CoursePack: Codable, Identifiable, Equatable, Sendable {
    public let schemaVersion: Int
    public let level: CEFRLevel
    public let chapters: [Chapter]
    public var id: String { level.rawValue }

    public init(schemaVersion: Int, level: CEFRLevel, chapters: [Chapter]) {
        self.schemaVersion = schemaVersion; self.level = level; self.chapters = chapters
    }
}

public struct Chapter: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let title: String
    public let subtitle: String?
    public let lessons: [Lesson]
    /// What the learner will be able to do when the unit is done, in their own language:
    /// «заказать кофе», «спросить, где что находится».
    ///
    /// A course named after grammar is a table of contents, not a path. Every course that
    /// works — Duolingo, Babbel, Busuu — states the unit as an ability and lets the grammar
    /// live inside it. This is that statement, and the progress screen is built from it.
    public let canDo: [String]?

    public init(id: String, title: String, subtitle: String?, lessons: [Lesson], canDo: [String]? = nil) {
        self.id = id; self.title = title; self.subtitle = subtitle
        self.lessons = lessons; self.canDo = canDo
    }
}

public struct Lesson: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let title: String
    public let summary: String
    public let estimatedMinutes: Int
    public let exercises: [Exercise]
    /// A checkpoint closes a unit: production only, no hints. Passing it is what turns
    /// "прошёл уроки" into "умею".
    public let kind: LessonKind?

    public init(id: String, title: String, summary: String, estimatedMinutes: Int, exercises: [Exercise], kind: LessonKind? = nil) {
        self.id = id; self.title = title; self.summary = summary
        self.estimatedMinutes = estimatedMinutes; self.exercises = exercises; self.kind = kind
    }
}

public struct Exercise: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let type: ExerciseType
    public let title: String?
    public let prompt: String?
    public let canonicalAnswer: String?
    public let acceptedAnswers: [String]?
    public let hint: String?
    public let explanation: String?
    public let options: [String]?
    public let correctOption: String?
    public let tokens: [String]?
    public let translation: String?
    public let example: String?
    public let difficulty: Int?
    /// Grammar topics from `Syllabus/syllabus.json` that this exercise drills. Optional
    /// for older packs; the syllabus test refuses ids that are not in the manifest.
    public let topics: [String]?
    /// The exchange to listen through, for a `dialogue`. Nothing to answer.
    public let lines: [DialogueLine]?
}

public struct PlacementQuestion: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let level: CEFRLevel
    public let prompt: String
    public let options: [String]
    public let correctOption: String

    public init(id: String, level: CEFRLevel, prompt: String, options: [String], correctOption: String) {
        self.id = id; self.level = level; self.prompt = prompt
        self.options = options; self.correctOption = correctOption
    }
}

public struct PlacementBank: Codable, Equatable, Sendable {
    public let schemaVersion: Int
    public let questions: [PlacementQuestion]

    public init(schemaVersion: Int, questions: [PlacementQuestion]) {
        self.schemaVersion = schemaVersion; self.questions = questions
    }
}

public struct UserProfile: Codable, Equatable, Sendable {
    public var selectedLevel: CEFRLevel
    public var dailyGoalMinutes: Int
    public var reminderHour: Int
    public var reminderMinute: Int
    public var remindersEnabled: Bool

    public init(selectedLevel: CEFRLevel, dailyGoalMinutes: Int, reminderHour: Int, reminderMinute: Int, remindersEnabled: Bool) {
        self.selectedLevel = selectedLevel; self.dailyGoalMinutes = dailyGoalMinutes
        self.reminderHour = reminderHour; self.reminderMinute = reminderMinute
        self.remindersEnabled = remindersEnabled
    }
}

public struct AttemptRecord: Codable, Equatable, Identifiable, Sendable {
    public let id: UUID
    public let exerciseID: String
    public let correct: Bool
    public let date: Date

    public init(id: UUID, exerciseID: String, correct: Bool, date: Date) {
        self.id = id; self.exerciseID = exerciseID; self.correct = correct; self.date = date
    }
}

public struct ReviewItem: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let exerciseID: String
    public var due: Date
    public var intervalDays: Int
    public var ease: Double
    public var repetitions: Int

    public init(id: String, exerciseID: String, due: Date, intervalDays: Int, ease: Double, repetitions: Int) {
        self.id = id; self.exerciseID = exerciseID; self.due = due
        self.intervalDays = intervalDays; self.ease = ease; self.repetitions = repetitions
    }
}

public struct UserState: Codable, Equatable, Sendable {
    public var profile: UserProfile?
    public var completedLessonIDs: Set<String>
    public var attempts: [AttemptRecord]
    public var reviews: [ReviewItem]
    public var points: Int
    /// Levels for which the user dismissed the "move up" suggestion, so we don't nag.
    /// Optional for backward compatibility with older saved state.json files.
    public var levelUpDismissed: [String]?
    /// Seconds spent in lessons per day ("2026-07-23" → 420), for the daily goal.
    /// Optional for backward compatibility with older saved state.json files.
    public var practiceSeconds: [String: Int]?
    /// Phrasings the learner marked as correct after the checker disagreed, per exercise.
    /// The escape hatch: whatever the checker misses, it only ever costs one tap, once.
    public var acceptedAnswers: [String: [String]]?

    public static let fresh = UserState(profile: nil, completedLessonIDs: [], attempts: [], reviews: [], points: 0)

    public init(profile: UserProfile?, completedLessonIDs: Set<String>, attempts: [AttemptRecord], reviews: [ReviewItem], points: Int, levelUpDismissed: [String]? = nil, practiceSeconds: [String: Int]? = nil, acceptedAnswers: [String: [String]]? = nil) {
        self.profile = profile; self.completedLessonIDs = completedLessonIDs
        self.attempts = attempts; self.reviews = reviews; self.points = points
        self.levelUpDismissed = levelUpDismissed
        self.practiceSeconds = practiceSeconds
        self.acceptedAnswers = acceptedAnswers
    }

    /// How many answers the log keeps.
    ///
    /// The web client shares this core, and there an origin gets about 4.8 MB of
    /// localStorage: a finished A1 already spends over a megabyte on review items, and
    /// an unbounded log crossed the quota at ~30 000 answers — silently, because the
    /// save is wrapped in a catch. The window only holds statistics; "has this been
    /// answered before" comes from `seenExerciseIDs`, which never forgets.
    public static let attemptLogLimit = 4000

    /// Every exercise the learner has ever answered. Review items are one per exercise
    /// and are never dropped, so they outlive the attempt window.
    public var seenExerciseIDs: Set<String> {
        var seen = Set(reviews.map(\.exerciseID))
        for attempt in attempts { seen.insert(attempt.exerciseID) }
        return seen
    }

    public mutating func trimAttempts() {
        guard attempts.count > Self.attemptLogLimit else { return }
        attempts = Array(attempts.suffix(Self.attemptLogLimit))
    }
}
