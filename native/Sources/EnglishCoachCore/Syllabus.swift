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
    /// Translation exercises that still ask for words the course has not shown yet.
    /// The same ratchet, for the other half of "готов ли учащийся к этому заданию".
    public let vocabularyDebtCeiling: Int?
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
        for exercise in courses.flatMap(\.chapters).flatMap(\.lessons).flatMap(\.exercises) where exercise.type != .info && exercise.type != .dialogue {
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

    /// `taught` is the part of the course practice may draw from, which is not the whole
    /// level until the whole level has been walked. The learner's record is read from all
    /// of `courses` — an answer given is an answer given — but `exercises` counts only
    /// what can be drilled right now, so the screen never offers a topic that would open
    /// an empty set.
    public static func all(
        syllabus: Syllabus, courses: [CoursePack], state: UserState, level: CEFRLevel, taught: [CoursePack]? = nil
    ) -> [TopicProgress] {
        let ceiling = LevelOrder.all.firstIndex(of: level) ?? 0
        let inScope = syllabus.topics.filter { (LevelOrder.all.firstIndex(of: $0.level) ?? 0) <= ceiling }

        var topicsOf: [String: [String]] = [:]
        for exercise in courses.flatMap(\.chapters).flatMap(\.lessons).flatMap(\.exercises) where exercise.type != .info && exercise.type != .dialogue {
            topicsOf[exercise.id] = exercise.topics ?? []
        }
        let available = SyllabusEngine.counts(in: taught ?? courses)

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
    public static func weak(
        syllabus: Syllabus, courses: [CoursePack], state: UserState, level: CEFRLevel, taught: [CoursePack]? = nil
    ) -> [TopicProgress] {
        all(syllabus: syllabus, courses: courses, state: state, level: level, taught: taught)
            // A topic with nothing to drill yet is a fact, not an offer: it would open an empty set.
            .filter { $0.exercises > 0 && $0.attempts >= enoughAttempts && $0.accuracy < weakAccuracy }
            .sorted { $0.accuracy == $1.accuracy ? $0.attempts > $1.attempts : $0.accuracy < $1.accuracy }
    }

    /// Topics never practised, so the screen can offer them instead of staying empty.
    public static func untouched(
        syllabus: Syllabus, courses: [CoursePack], state: UserState, level: CEFRLevel, taught: [CoursePack]? = nil
    ) -> [TopicProgress] {
        all(syllabus: syllabus, courses: courses, state: state, level: level, taught: taught)
            .filter { $0.attempts == 0 && $0.exercises > 0 }
    }
}


/// Порядок ввода лексики: не просить произвести то, чего не показывали.
/// Kept in step with `unseenVocabulary` in web/src/core/syllabus.ts.
///
/// The first Spanish lesson used to open by asking the learner to write "Soy de Lituania"
/// — to a true beginner that is not an exercise, it is a wall. Across the two courses 149
/// of the 200 translation exercises did the same thing to some degree, and nothing in the
/// build noticed. So it is measured: a word counts as introduced once the learner has
/// been shown it, and anything a translation demands beyond that is debt with a ceiling.
public struct UnseenWords: Equatable, Sendable {
    public let exerciseID: String
    public let words: [String]
}

public enum VocabularyOrder {
    static func vocabulary(_ text: String?) -> Set<String> {
        guard let text else { return [] }
        var found: Set<String> = []
        var current = ""
        let joiners: Set<Character> = ["'", "\u{2019}", "-"]
        for character in text.lowercased() {
            if character.isLetter || joiners.contains(character) {
                current.append(character)
            } else {
                add(current, to: &found)
                current = ""
            }
        }
        add(current, to: &found)
        return found
    }

    private static func add(_ word: String, to found: inout Set<String>) {
        let trimmed = word.trimmingCharacters(in: CharacterSet(charactersIn: "\'\u{2019}-"))
        if trimmed.count > 1 { found.insert(trimmed) }
    }

    /// What an exercise puts in front of the learner, in the language being learnt.
    static func shown(_ exercise: Exercise) -> Set<String> {
        var parts: [String?] = []
        switch exercise.type {
        case .info: parts = [exercise.title, exercise.explanation]
        case .flashcard: parts = [exercise.prompt, exercise.example]
        case .wordOrder: parts = [(exercise.tokens ?? []).joined(separator: " "), exercise.canonicalAnswer]
        case .multipleChoice: parts = [exercise.prompt, (exercise.options ?? []).joined(separator: " ")]
        // Checking a translation reveals its answer, so from then on it is taught too.
        case .translate: parts = [exercise.canonicalAnswer, exercise.hint]
        // A dialogue is where a unit's language is first heard whole: everything counts.
        case .dialogue: parts = (exercise.lines ?? []).map(\.text)
        }
        return parts.reduce(into: Set<String>()) { $0.formUnion(vocabulary($1)) }
    }

    /// Translation exercises that ask for words the course has not shown yet, in order.
    public static func unseen(in courses: [CoursePack]) -> [UnseenWords] {
        var known: Set<String> = []
        var debt: [UnseenWords] = []
        let ordered = courses.sorted {
            (LevelOrder.all.firstIndex(of: $0.level) ?? 0) < (LevelOrder.all.firstIndex(of: $1.level) ?? 0)
        }
        for course in ordered {
            for chapter in course.chapters {
                for lesson in chapter.lessons {
                    for exercise in lesson.exercises {
                        if exercise.type == .translate, let answer = exercise.canonicalAnswer {
                            let missing = vocabulary(answer).subtracting(known)
                            if !missing.isEmpty {
                                debt.append(UnseenWords(exerciseID: exercise.id, words: missing.sorted()))
                            }
                        }
                        known.formUnion(shown(exercise))
                    }
                }
            }
        }
        return debt
    }
}
