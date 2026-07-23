import Foundation

public enum ProductInfo {
    public static let name = "English Coach"
}

public enum CEFRLevel: String, Codable, CaseIterable, Identifiable, Sendable {
    case a1 = "A1", a2 = "A2", b1 = "B1", b2 = "B2", c1 = "C1"
    public var id: String { rawValue }
}

public enum ExerciseType: String, Codable, CaseIterable, Sendable {
    case info, flashcard, translate
    case wordOrder = "word_order"
    case multipleChoice = "multiple_choice"
}

public struct CoursePack: Codable, Identifiable, Equatable, Sendable {
    public let schemaVersion: Int
    public let level: CEFRLevel
    public let chapters: [Chapter]
    public var id: String { level.rawValue }
}

public struct Chapter: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let title: String
    public let subtitle: String?
    public let lessons: [Lesson]
}

public struct Lesson: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let title: String
    public let summary: String
    public let estimatedMinutes: Int
    public let exercises: [Exercise]

    public init(id: String, title: String, summary: String, estimatedMinutes: Int, exercises: [Exercise]) {
        self.id = id; self.title = title; self.summary = summary
        self.estimatedMinutes = estimatedMinutes; self.exercises = exercises
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
}
