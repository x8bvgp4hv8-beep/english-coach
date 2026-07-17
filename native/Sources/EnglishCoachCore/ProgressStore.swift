import Foundation

public protocol ProgressStoring: Sendable {
    func load() throws -> UserState
    func save(_ state: UserState) throws
}

public struct ProgressStore: ProgressStoring, Sendable {
    public let url: URL
    public init(url: URL) { self.url = url }

    public static var live: ProgressStore {
        let base = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
        return ProgressStore(url: base.appendingPathComponent("EnglishCoach/state.json"))
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
