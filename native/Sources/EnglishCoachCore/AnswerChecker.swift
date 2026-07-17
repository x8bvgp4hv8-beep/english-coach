import Foundation

public struct AnswerResult: Equatable, Sendable {
    public let isCorrect: Bool
    public let canonical: String
}

public enum AnswerChecker {
    public static func normalize(_ input: String) -> String {
        input.lowercased()
            .replacingOccurrences(of: "’", with: "'")
            .trimmingCharacters(in: .whitespacesAndNewlines.union(CharacterSet(charactersIn: ".!?")))
            .split(whereSeparator: { $0.isWhitespace })
            .joined(separator: " ")
    }

    public static func check(_ answer: String, canonical: String, accepted: [String]) -> AnswerResult {
        let expected = ([canonical] + accepted).map(normalize)
        return AnswerResult(isCorrect: expected.contains(normalize(answer)), canonical: canonical)
    }
}
