import Foundation

public enum ContentError: Error, Equatable {
    case unsupportedSchema(Int)
    case emptyCourse
    case duplicateID(String)
    case invalidExercise(String)
}

public enum ContentRepository {
    public static func decode(_ data: Data) throws -> CoursePack {
        let course = try JSONDecoder().decode(CoursePack.self, from: data)
        guard course.schemaVersion == 1 else { throw ContentError.unsupportedSchema(course.schemaVersion) }
        guard !course.chapters.isEmpty else { throw ContentError.emptyCourse }
        var ids = Set<String>()
        for chapter in course.chapters {
            guard ids.insert(chapter.id).inserted else { throw ContentError.duplicateID(chapter.id) }
            for lesson in chapter.lessons {
                guard ids.insert(lesson.id).inserted else { throw ContentError.duplicateID(lesson.id) }
                for exercise in lesson.exercises {
                    guard ids.insert(exercise.id).inserted else { throw ContentError.duplicateID(exercise.id) }
                    if exercise.type == .translate && exercise.canonicalAnswer?.isEmpty != false {
                        throw ContentError.invalidExercise(exercise.id)
                    }
                    if exercise.type == .multipleChoice && (exercise.options?.contains(exercise.correctOption ?? "") != true) {
                        throw ContentError.invalidExercise(exercise.id)
                    }
                }
            }
        }
        return course
    }

    public static func loadBundled() throws -> [CoursePack] {
        try loadBundled(bundle: .module)
    }

    public static func loadBundled(bundle: Bundle) throws -> [CoursePack] {
        let root: URL? = bundle.bundleURL
        let direct = root.flatMap { try? FileManager.default.contentsOfDirectory(at: $0, includingPropertiesForKeys: nil) } ?? []
        let nested = root.map { $0.appendingPathComponent("Courses") }
            .flatMap { try? FileManager.default.contentsOfDirectory(at: $0, includingPropertiesForKeys: nil) } ?? []
        let urls = (direct + nested).filter { $0.pathExtension == "json" }
        return try urls.sorted { $0.lastPathComponent < $1.lastPathComponent }
            .map { try decode(Data(contentsOf: $0)) }
    }
}
