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

    public static let fresh = UserState(profile: nil, completedLessonIDs: [], attempts: [], reviews: [], points: 0)

    public init(profile: UserProfile?, completedLessonIDs: Set<String>, attempts: [AttemptRecord], reviews: [ReviewItem], points: Int) {
        self.profile = profile; self.completedLessonIDs = completedLessonIDs
        self.attempts = attempts; self.reviews = reviews; self.points = points
    }
}
