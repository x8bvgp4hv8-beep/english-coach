import Foundation

public enum CourseRouting {
    public static func nextLesson(in lessons: [Lesson], completed: Set<String>) -> Lesson? {
        lessons.first { !completed.contains($0.id) }
    }

    public static func isUnlocked(index: Int, lessons: [Lesson], completed: Set<String>) -> Bool {
        guard lessons.indices.contains(index) else { return false }
        return index == 0 || completed.contains(lessons[index - 1].id)
    }
}

public enum LevelOrder {
    public static let all: [CEFRLevel] = [.a1, .a2, .b1, .b2, .c1]
    public static func next(after level: CEFRLevel) -> CEFRLevel? {
        guard let i = all.firstIndex(of: level), i + 1 < all.count else { return nil }
        return all[i + 1]
    }
}

/// Turns placement-test answers into a recommended starting level.
public enum PlacementScorer {
    /// Places the learner at the first level they cannot comfortably pass (accuracy < threshold).
    /// If they pass every level, recommends the top level; if they fail the easiest, recommends it.
    public static func recommend(bank: [PlacementQuestion], correctIDs: Set<String>, passThreshold: Double = 0.6) -> CEFRLevel {
        for level in LevelOrder.all {
            let questions = bank.filter { $0.level == level }
            guard !questions.isEmpty else { continue }
            let correct = questions.filter { correctIDs.contains($0.id) }.count
            if Double(correct) / Double(questions.count) < passThreshold { return level }
        }
        return LevelOrder.all.last ?? .a1
    }

    /// True once the answers so far already fix the recommendation, so the remaining
    /// (harder) questions cannot change it. Lets the test stop early instead of
    /// walking the learner through the whole bank.
    public static func isDecided(bank: [PlacementQuestion], answeredIDs: Set<String>, correctIDs: Set<String>, passThreshold: Double = 0.6) -> Bool {
        for level in LevelOrder.all {
            let questions = bank.filter { $0.level == level }
            guard !questions.isEmpty else { continue }
            guard questions.allSatisfy({ answeredIDs.contains($0.id) }) else { return false }
            let correct = questions.filter { correctIDs.contains($0.id) }.count
            if Double(correct) / Double(questions.count) < passThreshold { return true }
        }
        return true
    }
}

/// Level-level progress, mastery detection and adaptive difficulty helpers.
public enum ProgressionEngine {
    public static func lessons(for level: CEFRLevel, in courses: [CoursePack]) -> [Lesson] {
        courses.first { $0.level == level }?.chapters.flatMap(\.lessons) ?? []
    }

    public static func levelProgress(level: CEFRLevel, courses: [CoursePack], completed: Set<String>) -> Double {
        let all = lessons(for: level, in: courses)
        guard !all.isEmpty else { return 0 }
        return Double(all.filter { completed.contains($0.id) }.count) / Double(all.count)
    }

    public static func isLevelComplete(level: CEFRLevel, courses: [CoursePack], completed: Set<String>) -> Bool {
        let all = lessons(for: level, in: courses)
        return !all.isEmpty && all.allSatisfy { completed.contains($0.id) }
    }

    public static func exerciseIDs(for level: CEFRLevel, in courses: [CoursePack]) -> Set<String> {
        Set(lessons(for: level, in: courses).flatMap(\.exercises).map(\.id))
    }

    /// Accuracy over the most recent attempts on this level's exercises.
    public static func accuracy(level: CEFRLevel, courses: [CoursePack], attempts: [AttemptRecord], lastN: Int = 40) -> Double {
        let ids = exerciseIDs(for: level, in: courses)
        let relevant = attempts.filter { ids.contains($0.exerciseID) }.suffix(lastN)
        guard !relevant.isEmpty else { return 0 }
        return Double(relevant.filter(\.correct).count) / Double(relevant.count)
    }

    /// True when the level is fully completed with high accuracy and a harder level exists,
    /// unless the user already dismissed the suggestion for this level.
    public static func shouldSuggestAdvance(level: CEFRLevel, courses: [CoursePack], completed: Set<String>, attempts: [AttemptRecord], dismissed: Set<String>, accuracyThreshold: Double = 0.8) -> Bool {
        guard LevelOrder.next(after: level) != nil else { return false }
        guard !dismissed.contains(level.rawValue) else { return false }
        guard isLevelComplete(level: level, courses: courses, completed: completed) else { return false }
        return accuracy(level: level, courses: courses, attempts: attempts) >= accuracyThreshold
    }
}

/// Daily practice time, so the goal picked during onboarding actually means something.
public enum PracticeLog {
    /// A single very long stretch is almost always a window left open, not study time.
    public static let sessionCapSeconds = 30 * 60

    public static func dayKey(_ date: Date, calendar: Calendar = .current) -> String {
        let parts = calendar.dateComponents([.year, .month, .day], from: date)
        return String(format: "%04d-%02d-%02d", parts.year ?? 0, parts.month ?? 0, parts.day ?? 0)
    }

    public static func adding(seconds: Int, to log: [String: Int]?, on date: Date, calendar: Calendar = .current) -> [String: Int] {
        var updated = log ?? [:]
        let clamped = max(0, min(seconds, sessionCapSeconds))
        guard clamped > 0 else { return updated }
        updated[dayKey(date, calendar: calendar), default: 0] += clamped
        return updated
    }

    public static func minutes(in log: [String: Int]?, on date: Date, calendar: Calendar = .current) -> Int {
        (log?[dayKey(date, calendar: calendar)] ?? 0) / 60
    }
}

public enum ReviewEngine {
    public static func newItem(exerciseID: String, now: Date) -> ReviewItem {
        ReviewItem(id: exerciseID, exerciseID: exerciseID, due: now, intervalDays: 0, ease: 2.3, repetitions: 0)
    }

    public static func recordSuccess(_ source: ReviewItem, now: Date) -> ReviewItem {
        var item = source
        item.repetitions += 1
        if item.repetitions == 1 { item.intervalDays = 1 }
        else if item.repetitions == 2 { item.intervalDays = 3 }
        else if item.repetitions == 3 { item.intervalDays = 7 }
        else { item.intervalDays = min(180, Int((Double(max(1, item.intervalDays)) * item.ease).rounded())) }
        item.ease = min(3, item.ease + 0.05)
        item.due = Calendar.current.date(byAdding: .day, value: item.intervalDays, to: now) ?? now
        return item
    }

    public static func recordFailure(_ source: ReviewItem, now: Date) -> ReviewItem {
        var item = source
        item.repetitions = 0; item.intervalDays = 1; item.ease = max(1.6, item.ease - 0.2)
        item.due = Calendar.current.date(byAdding: .day, value: 1, to: now) ?? now
        return item
    }
}
