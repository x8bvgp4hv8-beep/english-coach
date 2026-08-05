import Foundation

/// The languages the app can teach. Mirrors web/src/core/language.ts.
///
/// A language is not a setting inside one course — it is the whole app: its own course
/// packs, its own placement test, its own syllabus, its own progress and its own voice.
/// Everything that differs between English and Spanish is named here once, so a third
/// language is a case in this enum plus a folder of content.
public enum LanguageCode: String, Codable, CaseIterable, Identifiable, Sendable {
    case en, es
    public var id: String { rawValue }

    public static let `default`: LanguageCode = .en
}

public struct LearningLanguage: Identifiable, Equatable, Sendable {
    public let code: LanguageCode
    /// What it is called in the interface, which is Russian.
    public let title: String
    /// What it calls itself, for the cards on the picker.
    public let nativeTitle: String
    /// Two letters for chips and headers.
    public let short: String
    /// Russian genitive, for «пять минут испанского».
    public let genitive: String
    /// Russian prepositional, for «шаг в испанском».
    public let locative: String
    /// The greeting on the picker card: the language speaking for itself.
    public let greeting: String
    /// One line of what it is like to start.
    public let note: String
    /// BCP-47 tag for speech synthesis.
    public let speechLocale: String
    /// Fallback locales, because a Mac may not have the first choice installed.
    public let speechFallbacks: [String]

    public var id: String { code.rawValue }
}

public enum Languages {
    public static let all: [LearningLanguage] = [
        LearningLanguage(
            code: .en, title: "Английский", nativeTitle: "English", short: "EN",
            genitive: "английского", locative: "английском",
            greeting: "Hello!", note: "От первых фраз до свободной речи: A1–C1",
            speechLocale: "en-GB", speechFallbacks: ["en-US", "en"]
        ),
        LearningLanguage(
            code: .es, title: "Испанский", nativeTitle: "Español", short: "ES",
            genitive: "испанского", locative: "испанском",
            greeting: "¡Hola!", note: "От первых фраз до свободной речи: A1–C1",
            speechLocale: "es-ES", speechFallbacks: ["es-MX", "es"]
        )
    ]

    public static func of(_ code: LanguageCode) -> LearningLanguage {
        all.first { $0.code == code } ?? all[0]
    }
}
