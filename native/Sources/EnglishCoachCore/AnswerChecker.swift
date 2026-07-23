import Foundation

public struct AnswerResult: Equatable, Sendable {
    public let isCorrect: Bool
    public let canonical: String
}

public enum AnswerChecker {
    public static func normalize(_ input: String) -> String {
        // Punctuation is ignored so that word-order tokens (which are joined with
        // spaces, e.g. "However ,") match a canonical answer where it is attached
        // ("However,"), and so a learner who forgets a comma or period still passes.
        let stripped = input.lowercased()
            .replacingOccurrences(of: "’", with: "'")
            .components(separatedBy: CharacterSet(charactersIn: ".,!?;:—–\"()"))
            .joined(separator: " ")
        return stripped
            .split(whereSeparator: { $0.isWhitespace })
            .joined(separator: " ")
    }

    public static func check(_ answer: String, canonical: String, accepted: [String]) -> AnswerResult {
        let expected = ([canonical] + accepted).map(normalize)
        return AnswerResult(isCorrect: expected.contains(normalize(answer)), canonical: canonical)
    }
}
