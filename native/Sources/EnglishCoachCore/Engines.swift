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
