import Foundation

public protocol ProgressStoring: Sendable {
    func load() throws -> UserState
    func save(_ state: UserState) throws
}

public struct ProgressStore: ProgressStoring, Sendable {
    public let url: URL
    public init(url: URL) { self.url = url }

    /// Each language keeps its own record: level, streak, points and spaced repetition are
    /// about one language and would be nonsense pooled. English stays in the original
    /// `state.json` so that adding Spanish does not cost anyone their English progress.
    public static func live(_ language: LanguageCode = .default) -> ProgressStore {
        let base = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
        let name = language == .default ? "state.json" : "state-\(language.rawValue).json"
        return ProgressStore(url: base.appendingPathComponent("EnglishCoach/\(name)"))
    }

    public func load() throws -> UserState {
        guard FileManager.default.fileExists(atPath: url.path) else { return .fresh }
        let decoder = JSONDecoder(); decoder.dateDecodingStrategy = .iso8601
        return try decoder.decode(UserState.self, from: Data(contentsOf: url))
    }

    public func save(_ state: UserState) throws {
        try FileManager.default.createDirectory(at: url.deletingLastPathComponent(), withIntermediateDirectories: true)
        let encoder = JSONEncoder(); encoder.outputFormatting = [.prettyPrinted, .sortedKeys]; encoder.dateEncodingStrategy = .iso8601
        try encoder.encode(state).write(to: url, options: .atomic)
    }
}
