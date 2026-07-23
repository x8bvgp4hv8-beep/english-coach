import Foundation

public enum Verdict: String, Equatable, Sendable {
    case correct, typo, wrong
}

public struct WordDiff: Equatable, Sendable {
    public enum Kind: String, Equatable, Sendable { case same, missing, extra }
    public let kind: Kind
    public let text: String
    public init(kind: Kind, text: String) { self.kind = kind; self.text = text }
}

public struct AnswerResult: Equatable, Sendable {
    public let isCorrect: Bool
    public let verdict: Verdict
    public let canonical: String
    /// The correctly spelled word, when the verdict is a typo.
    public let typo: String?
    /// Word level difference against the expected answer, when it is wrong.
    public let diff: [WordDiff]

    public init(isCorrect: Bool, verdict: Verdict, canonical: String, typo: String? = nil, diff: [WordDiff] = []) {
        self.isCorrect = isCorrect; self.verdict = verdict; self.canonical = canonical
        self.typo = typo; self.diff = diff
    }
}

/// Answer checking, kept in step with `web/src/core/answer.ts`.
///
/// Plain string equality told learners "неверно" for answers that were in fact correct:
/// 38 of the 100 open-answer exercises carry no alternative phrasing at all, and those
/// answers then went into spaced repetition. Contractions and British spelling now
/// compare equal, and a single mistyped long word counts as a typo. Anything grammatical
/// (tense, agreement, articles, prepositions, inflections) still fails.
public enum AnswerChecker {
    /// Ambiguous forms expand to every reading; the answer matches if any reading matches.
    private static let contractions: [String: [String]] = [
        "i'm": ["i am"],
        "you're": ["you are"], "we're": ["we are"], "they're": ["they are"],
        "isn't": ["is not"], "aren't": ["are not"], "wasn't": ["was not"], "weren't": ["were not"],
        "don't": ["do not"], "doesn't": ["does not"], "didn't": ["did not"],
        "can't": ["cannot", "can not"], "couldn't": ["could not"], "won't": ["will not"],
        "wouldn't": ["would not"], "shouldn't": ["should not"], "mustn't": ["must not"],
        "haven't": ["have not"], "hasn't": ["has not"], "hadn't": ["had not"],
        "i've": ["i have"], "you've": ["you have"], "we've": ["we have"], "they've": ["they have"],
        "i'll": ["i will"], "you'll": ["you will"], "he'll": ["he will"], "she'll": ["she will"],
        "we'll": ["we will"], "they'll": ["they will"], "it'll": ["it will"],
        "i'd": ["i would", "i had"], "you'd": ["you would", "you had"], "he'd": ["he would", "he had"],
        "she'd": ["she would", "she had"], "we'd": ["we would", "we had"], "they'd": ["they would", "they had"],
        "he's": ["he is", "he has"], "she's": ["she is", "she has"], "it's": ["it is", "it has"],
        "that's": ["that is"], "there's": ["there is", "there has"], "here's": ["here is"],
        "who's": ["who is"], "what's": ["what is"], "let's": ["let us"]
    ]

    /// British spelling on the left, the form both are folded to on the right.
    private static let spelling: [String: String] = [
        "colour": "color", "colours": "colors", "favourite": "favorite", "favourites": "favorites",
        "behaviour": "behavior", "neighbour": "neighbor", "neighbours": "neighbors", "humour": "humor",
        "realise": "realize", "realised": "realized", "organise": "organize", "organised": "organized",
        "apologise": "apologize", "apologised": "apologized", "recognise": "recognize", "recognised": "recognized",
        "travelled": "traveled", "travelling": "traveling", "cancelled": "canceled", "cancelling": "canceling",
        "centre": "center", "centres": "centers", "theatre": "theater", "theatres": "theaters",
        "metre": "meter", "metres": "meters", "litre": "liter", "litres": "liters",
        "grey": "gray", "programme": "program", "programmes": "programs",
        "licence": "license", "defence": "defense", "practise": "practice", "practised": "practiced"
    ]

    /// Grammar carriers: a difference here is never "just a typo".
    private static let functionWords: Set<String> = [
        "a", "an", "the", "is", "are", "am", "was", "were", "be", "been", "being",
        "do", "does", "did", "have", "has", "had", "will", "would", "shall", "should",
        "can", "could", "may", "might", "must", "not", "no", "to", "of", "in", "on", "at",
        "for", "from", "by", "with", "about", "into", "over", "under", "and", "or", "but",
        "he", "she", "it", "they", "we", "you", "i", "his", "her", "its", "their", "our", "your", "my",
        "this", "that", "these", "those", "there", "here", "some", "any", "much", "many"
    ]

    /// Endings that carry grammar: dropping one is a mistake, never a slip of the finger.
    private static let inflections = ["s", "es", "ed", "d", "ing", "er", "est", "ly", "ies"]

    private static let maxVariants = 12

    public static func normalize(_ input: String) -> String {
        // Punctuation is dropped so word-order tokens (joined with spaces, "However ,")
        // match a canonical answer where it is attached ("However,").
        input.lowercased()
            .replacingOccurrences(of: "’", with: "'")
            .components(separatedBy: CharacterSet(charactersIn: ".,!?;:—–\"()"))
            .joined(separator: " ")
            .split(whereSeparator: { $0.isWhitespace })
            .map { spelling[String($0)] ?? String($0) }
            .joined(separator: " ")
    }

    /// Every reading of a normalized sentence once contractions are expanded.
    public static func variants(_ normalized: String) -> [String] {
        var results: [[String]] = [[]]
        for word in normalized.split(separator: " ").map(String.init) {
            let options = contractions[word] ?? [word]
            var next: [[String]] = []
            outer: for partial in results {
                for option in options {
                    next.append(partial + option.split(separator: " ").map(String.init))
                    if next.count >= maxVariants { break outer }
                }
            }
            results = next
        }
        var seen = Set<String>()
        return results
            .map { $0.map { spelling[$0] ?? $0 }.joined(separator: " ") }
            .filter { seen.insert($0).inserted }
    }

    private static func levenshtein(_ a: String, _ b: String) -> Int {
        if a == b { return 0 }
        let source = Array(a), target = Array(b)
        if source.isEmpty { return target.count }
        if target.isEmpty { return source.count }
        var previous = Array(0...target.count)
        for i in 1...source.count {
            var diagonal = previous[0]
            previous[0] = i
            for j in 1...target.count {
                let candidate = min(previous[j] + 1, previous[j - 1] + 1, diagonal + (source[i - 1] == target[j - 1] ? 0 : 1))
                diagonal = previous[j]
                previous[j] = candidate
            }
        }
        return previous[target.count]
    }

    /// True when the two words differ only by an inflection, e.g. cat / cats, work / worked.
    private static func isInflection(_ a: String, _ b: String) -> Bool {
        let shorter = a.count <= b.count ? a : b
        let longer = a.count <= b.count ? b : a
        guard longer.hasPrefix(shorter) else {
            // cities / city: the stem changes, but it is still morphology.
            var stem = longer
            for suffix in ["ies", "ied"] where longer.hasSuffix(suffix) {
                stem = String(longer.dropLast(suffix.count))
            }
            return !stem.isEmpty && stem != longer && shorter.hasPrefix(stem)
        }
        return inflections.contains(String(longer.dropFirst(shorter.count)))
    }

    /// A single long content word misspelled by one or two letters.
    private static func typo(answerWords: [String], expectedWords: [String]) -> String? {
        guard answerWords.count == expectedWords.count else { return nil }
        let differing = zip(answerWords, expectedWords).filter { $0 != $1 }
        guard differing.count == 1, let pair = differing.first else { return nil }
        let (written, expected) = pair
        guard !functionWords.contains(written), !functionWords.contains(expected) else { return nil }
        guard expected.count >= 4, !isInflection(written, expected) else { return nil }
        let distance = levenshtein(written, expected)
        let budget = expected.count >= 8 ? 2 : 1
        return distance > 0 && distance <= budget ? expected : nil
    }

    /// Word level diff, so feedback can say what is missing rather than just print the answer.
    /// Splits into words for display: punctuation is dropped, but the writing is kept.
    private static func displayWords(_ input: String) -> [String] {
        input.replacingOccurrences(of: "’", with: "'")
            .components(separatedBy: CharacterSet(charactersIn: ".,!?;:—–\"()"))
            .joined(separator: " ")
            .split(whereSeparator: { $0.isWhitespace })
            .map(String.init)
    }

    public static func diffWords(_ answer: String, canonical: String) -> [WordDiff] {
        let a = normalize(answer).split(separator: " ").map(String.init)
        let b = normalize(canonical).split(separator: " ").map(String.init)
        // Compared in lower case, shown as written: "не хватает: Monday", not "monday".
        let aShown = displayWords(answer)
        let bShown = displayWords(canonical)
        var table = Array(repeating: Array(repeating: 0, count: b.count + 1), count: a.count + 1)
        if !a.isEmpty, !b.isEmpty {
            for i in stride(from: a.count - 1, through: 0, by: -1) {
                for j in stride(from: b.count - 1, through: 0, by: -1) {
                    table[i][j] = a[i] == b[j] ? table[i + 1][j + 1] + 1 : max(table[i + 1][j], table[i][j + 1])
                }
            }
        }
        var diff: [WordDiff] = []
        var i = 0, j = 0
        while i < a.count, j < b.count {
            if a[i] == b[j] {
                diff.append(WordDiff(kind: .same, text: j < bShown.count ? bShown[j] : b[j])); i += 1; j += 1
            } else if table[i + 1][j] >= table[i][j + 1] {
                diff.append(WordDiff(kind: .extra, text: i < aShown.count ? aShown[i] : a[i])); i += 1
            } else {
                diff.append(WordDiff(kind: .missing, text: j < bShown.count ? bShown[j] : b[j])); j += 1
            }
        }
        while i < a.count { diff.append(WordDiff(kind: .extra, text: i < aShown.count ? aShown[i] : a[i])); i += 1 }
        while j < b.count { diff.append(WordDiff(kind: .missing, text: j < bShown.count ? bShown[j] : b[j])); j += 1 }
        return diff
    }

    /// What to tell the learner about a wrong answer, or nil when the answer is too far
    /// off for a word list to help: naming twelve missing words is noise, not feedback.
    public static func diffSummary(_ diff: [WordDiff]) -> (missing: [String], extra: [String], orderOnly: Bool)? {
        guard !diff.isEmpty else { return nil }
        let same = diff.filter { $0.kind == .same }.count
        let expected = diff.filter { $0.kind != .extra }.count
        guard expected > 0, Double(same) / Double(expected) >= 0.5 else { return nil }
        let missing = diff.filter { $0.kind == .missing }.map(\.text)
        let extra = diff.filter { $0.kind == .extra }.map(\.text)
        guard !missing.isEmpty || !extra.isEmpty else { return nil }
        // Same words, different places: listing them as both missing and extra reads as nonsense.
        let key: ([String]) -> [String] = { $0.map { $0.lowercased() }.sorted() }
        let orderOnly = !missing.isEmpty && key(missing) == key(extra)
        return (missing, extra, orderOnly)
    }

    public static func check(_ answer: String, canonical: String, accepted: [String] = []) -> AnswerResult {
        let answerVariants = variants(normalize(answer))
        let expectedVariants = ([canonical] + accepted).flatMap { variants(normalize($0)) }

        if answerVariants.contains(where: { expectedVariants.contains($0) }) {
            return AnswerResult(isCorrect: true, verdict: .correct, canonical: canonical)
        }

        for expected in expectedVariants {
            for given in answerVariants {
                if let corrected = typo(answerWords: given.split(separator: " ").map(String.init),
                                        expectedWords: expected.split(separator: " ").map(String.init)) {
                    return AnswerResult(isCorrect: true, verdict: .typo, canonical: canonical, typo: corrected)
                }
            }
        }

        return AnswerResult(isCorrect: false, verdict: .wrong, canonical: canonical,
                            diff: diffWords(answer, canonical: canonical))
    }
}
