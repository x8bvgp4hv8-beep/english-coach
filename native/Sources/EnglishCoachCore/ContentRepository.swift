import Foundation

public enum ContentError: Error, Equatable {
    case unsupportedSchema(Int)
    case emptyCourse
    case duplicateID(String)
    case invalidExercise(String)
}

public enum ContentRepository {
    static let schemaVersions: Set<Int> = [1, 2]

    /// Откуда учащийся: подстановки `{country}` и `{city}` в содержании становятся его
    /// страной и городом. Пока приложение не спросило — нейтральный пример, заведомо
    /// чужой, чтобы фраза читалась как пример, а не как утверждение о самом человеке.
    public struct Home: Sendable, Equatable {
        public var country: String
        public var city: String
        public var title: String
        public var cityTitle: String
        public init(country: String, city: String, title: String, cityTitle: String) {
            self.country = country; self.city = city; self.title = title; self.cityTitle = cityTitle
        }
        public static let example = Home(country: "Spain", city: "Madrid", title: "Испании", cityTitle: "Мадрида")
    }

    /// Замена идёт по тексту JSON до разбора: подстановки — уникальные строки, а так
    /// не приходится пересобирать все структуры ради пяти слов. Дом передаётся
    /// параметром, а не глобальной переменной: содержание читают из разных потоков.
    public static func decode(_ data: Data, home: Home = .example) throws -> CoursePack {
        let filled = personalise(data, home: home)
        let course = try JSONDecoder().decode(CoursePack.self, from: filled)
        guard Self.schemaVersions.contains(course.schemaVersion) else { throw ContentError.unsupportedSchema(course.schemaVersion) }
        guard !course.chapters.isEmpty else { throw ContentError.emptyCourse }
        // v1 packs are grammar chapters; v2 packs are can-do units with the five-step ladder.
        let isUnit = course.schemaVersion >= 2
        var ids = Set<String>()
        for chapter in course.chapters {
            guard ids.insert(chapter.id).inserted else { throw ContentError.duplicateID(chapter.id) }
            // A unit exists to make someone able to do something. If it cannot say what, it
            // is a grammar chapter with a new name, and the progress screen has nothing to show.
            if isUnit && chapter.canDo?.isEmpty != false { throw ContentError.invalidExercise(chapter.id) }

            for lesson in chapter.lessons {
                guard ids.insert(lesson.id).inserted else { throw ContentError.duplicateID(lesson.id) }
                var climbed = -1
                for exercise in lesson.exercises {
                    guard ids.insert(exercise.id).inserted else { throw ContentError.duplicateID(exercise.id) }
                    if exercise.type == .translate && exercise.canonicalAnswer?.isEmpty != false {
                        throw ContentError.invalidExercise(exercise.id)
                    }
                    if exercise.type == .multipleChoice && (exercise.options?.contains(exercise.correctOption ?? "") != true) {
                        throw ContentError.invalidExercise(exercise.id)
                    }
                    if exercise.type == .dialogue && (exercise.lines?.count ?? 0) < 2 {
                        throw ContentError.invalidExercise(exercise.id)
                    }
                    if isUnit {
                        // The ladder: a lesson may stay on a step or move up, never back down.
                        let step = exercise.type.step.rawValue
                        if step < climbed { throw ContentError.invalidExercise(exercise.id) }
                        climbed = step
                    }
                }
                // A checkpoint is the unit's exam: producing the language, nothing to lean on.
                if isUnit, lesson.kind == .checkpoint,
                   let soft = lesson.exercises.first(where: { $0.type.step != .produce || $0.hint != nil }) {
                    throw ContentError.invalidExercise(soft.id)
                }
            }
        }
        return course
    }

    static func personalise(_ data: Data, home: Home) -> Data {
        guard var text = String(data: data, encoding: .utf8) else { return data }
        guard text.contains("{country}") || text.contains("{city}")
            || text.contains("{страна}") || text.contains("{город}") else { return data }
        text = text.replacingOccurrences(of: "{country}", with: home.country)
        text = text.replacingOccurrences(of: "{city}", with: home.city)
        text = text.replacingOccurrences(of: "{страна}", with: home.title)
        text = text.replacingOccurrences(of: "{город}", with: home.cityTitle)
        return Data(text.utf8)
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

    public static func loadBundled(_ language: LanguageCode = .default, home: Home = .example) throws -> [CoursePack] {
        try loadBundled(language, bundle: contentBundle(), home: home)
    }

    public static func loadBundled(_ language: LanguageCode = .default, bundle: Bundle, home: Home = .example) throws -> [CoursePack] {
        let notCourses = ["placement", "syllabus"]
        let urls = files(for: language, in: bundle).filter { url in
            !notCourses.contains { url.lastPathComponent.contains($0) }
        }
        guard !urls.isEmpty else { throw ContentError.emptyCourse }
        return try urls.sorted { $0.lastPathComponent < $1.lastPathComponent }
            .map { try decode(Data(contentsOf: $0), home: home) }
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
