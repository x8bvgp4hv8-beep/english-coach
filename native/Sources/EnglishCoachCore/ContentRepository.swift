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
        let bundleName = "EnglishCoach_EnglishCoachCore.bundle"
        let candidates = [
            Bundle.main.resourceURL?.appendingPathComponent(bundleName),
            Bundle.main.bundleURL.appendingPathComponent(bundleName)
        ].compactMap { $0 }
        if let url = candidates.first(where: { FileManager.default.fileExists(atPath: $0.path) }),
           let appBundle = Bundle(url: url) {
            return try loadBundled(bundle: appBundle)
        }
        return try loadBundled(bundle: .module)
    }

    public static func loadBundled(bundle: Bundle) throws -> [CoursePack] {
        let root: URL? = bundle.bundleURL
        let direct = root.flatMap { try? FileManager.default.contentsOfDirectory(at: $0, includingPropertiesForKeys: nil) } ?? []
        let nested = root.map { $0.appendingPathComponent("Courses") }
            .flatMap { try? FileManager.default.contentsOfDirectory(at: $0, includingPropertiesForKeys: nil) } ?? []
        let urls = (direct + nested).filter { $0.pathExtension == "json" && !$0.lastPathComponent.contains("placement") }
        return try urls.sorted { $0.lastPathComponent < $1.lastPathComponent }
            .map { try decode(Data(contentsOf: $0)) }
    }

    // MARK: - Placement test bank

    public static func decodePlacement(_ data: Data) throws -> PlacementBank {
        let bank = try JSONDecoder().decode(PlacementBank.self, from: data)
        guard bank.schemaVersion == 1 else { throw ContentError.unsupportedSchema(bank.schemaVersion) }
        guard !bank.questions.isEmpty else { throw ContentError.emptyCourse }
        var ids = Set<String>()
        for question in bank.questions {
            guard ids.insert(question.id).inserted else { throw ContentError.duplicateID(question.id) }
            guard question.options.contains(question.correctOption) else { throw ContentError.invalidExercise(question.id) }
        }
        return bank
    }

    public static func loadPlacement() throws -> PlacementBank {
        let bundleName = "EnglishCoach_EnglishCoachCore.bundle"
        let candidates = [
            Bundle.main.resourceURL?.appendingPathComponent(bundleName),
            Bundle.main.bundleURL.appendingPathComponent(bundleName)
        ].compactMap { $0 }
        if let url = candidates.first(where: { FileManager.default.fileExists(atPath: $0.path) }),
           let appBundle = Bundle(url: url) {
            return try loadPlacement(bundle: appBundle)
        }
        return try loadPlacement(bundle: .module)
    }

    public static func loadPlacement(bundle: Bundle) throws -> PlacementBank {
        let root = bundle.bundleURL
        // The file may land in a Placement/ subfolder or (if the bundler flattens) at the root.
        let places = [root.appendingPathComponent("Placement"), root]
        for dir in places {
            let urls = (try? FileManager.default.contentsOfDirectory(at: dir, includingPropertiesForKeys: nil)) ?? []
            if let file = urls.first(where: { $0.lastPathComponent.contains("placement") && $0.pathExtension == "json" }) {
                return try decodePlacement(Data(contentsOf: file))
            }
        }
        throw ContentError.emptyCourse
    }
}
