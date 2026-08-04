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

    // MARK: - Finding the files
    //
    // Every content file is named `<language>-<what>.json`, and that prefix is what makes
    // the lookup work at all: SwiftPM flattens `Resources/Languages/en/…` into the bundle
    // root, so an `a1.json` per language would collide there. The prefix also survives a
    // build that keeps the folders, which is why the search below walks the tree instead
    // of listing one directory.

    private static let bundleName = "EnglishCoach_EnglishCoachCore.bundle"

    /// The resource bundle: inside the built .app it sits next to the binary, in tests it
    /// is the package's own module bundle.
    static func contentBundle() -> Bundle {
        let candidates = [
            Bundle.main.resourceURL?.appendingPathComponent(bundleName),
            Bundle.main.bundleURL.appendingPathComponent(bundleName)
        ].compactMap { $0 }
        if let url = candidates.first(where: { FileManager.default.fileExists(atPath: $0.path) }),
           let appBundle = Bundle(url: url) {
            return appBundle
        }
        return .module
    }

    /// Every JSON file in the bundle, however deeply the build chose to nest it.
    static func jsonFiles(in bundle: Bundle) -> [URL] {
        let root = bundle.bundleURL
        guard let walker = FileManager.default.enumerator(at: root, includingPropertiesForKeys: nil) else { return [] }
        return walker.compactMap { $0 as? URL }.filter { $0.pathExtension == "json" }
    }

    private static func files(for language: LanguageCode, in bundle: Bundle) -> [URL] {
        jsonFiles(in: bundle).filter { $0.lastPathComponent.hasPrefix("\(language.rawValue)-") }
    }

    /// Which languages actually shipped, so the picker never offers an empty course.
    public static func availableLanguages(bundle: Bundle? = nil) -> [LanguageCode] {
        let bundle = bundle ?? contentBundle()
        let names = Set(jsonFiles(in: bundle).map(\.lastPathComponent))
        return LanguageCode.allCases.filter { code in
            names.contains { $0.hasPrefix("\(code.rawValue)-") && $0.contains("syllabus") }
        }
    }

    // MARK: - Course packs

    public static func loadBundled(_ language: LanguageCode = .default) throws -> [CoursePack] {
        try loadBundled(language, bundle: contentBundle())
    }

    public static func loadBundled(_ language: LanguageCode = .default, bundle: Bundle) throws -> [CoursePack] {
        let notCourses = ["placement", "syllabus"]
        let urls = files(for: language, in: bundle).filter { url in
            !notCourses.contains { url.lastPathComponent.contains($0) }
        }
        guard !urls.isEmpty else { throw ContentError.emptyCourse }
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

    public static func loadPlacement(_ language: LanguageCode = .default) throws -> PlacementBank {
        try loadPlacement(language, bundle: contentBundle())
    }

    public static func loadPlacement(_ language: LanguageCode = .default, bundle: Bundle) throws -> PlacementBank {
        guard let file = files(for: language, in: bundle).first(where: { $0.lastPathComponent.contains("placement") }) else {
            throw ContentError.emptyCourse
        }
        return try decodePlacement(Data(contentsOf: file))
    }

    // MARK: - Syllabus

    public static func decodeSyllabus(_ data: Data) throws -> Syllabus {
        let syllabus = try JSONDecoder().decode(Syllabus.self, from: data)
        guard syllabus.schemaVersion == 1 else { throw ContentError.unsupportedSchema(syllabus.schemaVersion) }
        guard !syllabus.topics.isEmpty else { throw ContentError.emptyCourse }
        var ids = Set<String>()
        for topic in syllabus.topics {
            guard ids.insert(topic.id).inserted else { throw ContentError.duplicateID(topic.id) }
            guard topic.minExercises > 0 else { throw ContentError.invalidExercise(topic.id) }
        }
        return syllabus
    }

    public static func loadSyllabus(_ language: LanguageCode = .default) throws -> Syllabus {
        try loadSyllabus(language, bundle: contentBundle())
    }

    public static func loadSyllabus(_ language: LanguageCode = .default, bundle: Bundle) throws -> Syllabus {
        guard let file = files(for: language, in: bundle).first(where: { $0.lastPathComponent.contains("syllabus") }) else {
            throw ContentError.emptyCourse
        }
        return try decodeSyllabus(Data(contentsOf: file))
    }
}
