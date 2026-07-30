import Foundation

/// What each level is supposed to teach, and how far the shipped content is from it.
/// Kept in step with `web/src/core/syllabus.ts`.
///
/// Without this the courses were a pile of lessons with no way to tell what was missing:
/// Present Continuous was absent from all 249 exercises and nothing said so. The manifest
/// is the promise, `coverage` is the audit, and the debt ceiling stops it from growing.
public struct SyllabusTopic: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let level: CEFRLevel
    public let title: String
    public let summary: String
    /// How many exercises the topic needs before it counts as taught, not mentioned.
    public let minExercises: Int
}

public struct Syllabus: Codable, Equatable, Sendable {
    public let schemaVersion: Int
    public let source: String
    /// The number of topics currently below target. A ratchet: content can only lower it,
    /// and the test fails when it grows, so a new gap cannot slip in unnoticed.
    public let coverageDebtCeiling: Int
    public let topics: [SyllabusTopic]
}

public struct TopicCoverage: Equatable, Sendable {
    public let topic: SyllabusTopic
    public let exercises: Int
    public var isCovered: Bool { exercises >= topic.minExercises }
}

public enum SyllabusEngine {
    /// Rule cards are excluded: reading a rule is not practising it.
    public static func counts(in courses: [CoursePack]) -> [String: Int] {
        var counts: [String: Int] = [:]
        for exercise in courses.flatMap(\.chapters).flatMap(\.lessons).flatMap(\.exercises) where exercise.type != .info {
            for topic in exercise.topics ?? [] { counts[topic, default: 0] += 1 }
        }
        return counts
    }

    public static func coverage(of syllabus: Syllabus, in courses: [CoursePack]) -> [TopicCoverage] {
        let counts = counts(in: courses)
        return syllabus.topics.map { TopicCoverage(topic: $0, exercises: counts[$0.id] ?? 0) }
    }

    public static func gaps(of syllabus: Syllabus, in courses: [CoursePack]) -> [TopicCoverage] {
        coverage(of: syllabus, in: courses).filter { !$0.isCovered }
    }

    /// Topic ids used by content that the manifest does not define — a typo in a pack.
    public static func unknownTopics(of syllabus: Syllabus, in courses: [CoursePack]) -> Set<String> {
        let known = Set(syllabus.topics.map(\.id))
        return Set(counts(in: courses).keys).subtracting(known)
    }

    /// The topics a level is responsible for, in manifest order, for a progress screen.
    public static func topics(for level: CEFRLevel, in syllabus: Syllabus) -> [SyllabusTopic] {
        syllabus.topics.filter { $0.level == level }
    }
}
