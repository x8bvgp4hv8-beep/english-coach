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

/// The learner's record on one grammar topic, for the weak spots screen.
public struct TopicProgress: Equatable, Identifiable, Sendable {
    public let topic: SyllabusTopic
    public let attempts: Int
    public let correct: Int
    /// Zero when the topic has never been attempted, so callers must check `attempts`.
    public let accuracy: Double
    /// How many exercises exist for it, so a topic with none is never offered.
    public let exercises: Int

    public var id: String { topic.id }
}

/// What the learner is actually good at, per grammar topic.
///
/// The app already records every attempt against an exercise id, and every exercise now
/// carries its topics, so the weak spots were sitting in the data with nothing reading
/// them. This is the reader: it turns "wrong on b1-ch4-l1-ex4" into "Present Perfect
/// against Past Simple, 4 of 9 right". Mirrors `web/src/core/syllabus.ts`.
public enum TopicProgressEngine {
    /// How few attempts still count as "no opinion yet" about a topic.
    public static let enoughAttempts = 3
    /// Below this share of correct answers a topic is worth putting back in front of you.
    public static let weakAccuracy = 0.75

    public static func all(syllabus: Syllabus, courses: [CoursePack], state: UserState, level: CEFRLevel) -> [TopicProgress] {
        let ceiling = LevelOrder.all.firstIndex(of: level) ?? 0
        let inScope = syllabus.topics.filter { (LevelOrder.all.firstIndex(of: $0.level) ?? 0) <= ceiling }

        var topicsOf: [String: [String]] = [:]
        var available: [String: Int] = [:]
        for exercise in courses.flatMap(\.chapters).flatMap(\.lessons).flatMap(\.exercises) where exercise.type != .info {
            let topics = exercise.topics ?? []
            topicsOf[exercise.id] = topics
            for topic in topics { available[topic, default: 0] += 1 }
        }

        var tally: [String: (attempts: Int, correct: Int)] = [:]
        for attempt in state.attempts {
            for topic in topicsOf[attempt.exerciseID] ?? [] {
                var current = tally[topic] ?? (0, 0)
                current.attempts += 1
                if attempt.correct { current.correct += 1 }
                tally[topic] = current
            }
        }

        return inScope.map { topic in
            let record = tally[topic.id] ?? (attempts: 0, correct: 0)
            return TopicProgress(
                topic: topic,
                attempts: record.attempts,
                correct: record.correct,
                accuracy: record.attempts > 0 ? Double(record.correct) / Double(record.attempts) : 0,
                exercises: available[topic.id] ?? 0
            )
        }
    }

    /// Worst first. A topic needs a few attempts before it can be called weak — one slip
    /// on a first sight of Past Perfect says nothing.
    public static func weak(syllabus: Syllabus, courses: [CoursePack], state: UserState, level: CEFRLevel) -> [TopicProgress] {
        all(syllabus: syllabus, courses: courses, state: state, level: level)
            .filter { $0.attempts >= enoughAttempts && $0.accuracy < weakAccuracy }
            .sorted { $0.accuracy == $1.accuracy ? $0.attempts > $1.attempts : $0.accuracy < $1.accuracy }
    }

    /// Topics never practised, so the screen can offer them instead of staying empty.
    public static func untouched(syllabus: Syllabus, courses: [CoursePack], state: UserState, level: CEFRLevel) -> [TopicProgress] {
        all(syllabus: syllabus, courses: courses, state: state, level: level)
            .filter { $0.attempts == 0 && $0.exercises > 0 }
    }
}
