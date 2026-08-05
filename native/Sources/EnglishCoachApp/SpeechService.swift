import AVFoundation
import EnglishCoachCore

@MainActor
final class SpeechService {
    private let synthesizer = AVSpeechSynthesizer()

    /// Slow enough that the words come apart, fast enough to still be a sentence.
    static let slowRate: Float = 0.34

    /// The app teaches one language at a time, so the voice is a single shared fact rather
    /// than an argument every view has to pass down. `AppModel` sets it with the language.
    static var language: LearningLanguage = Languages.of(.default)

    /// The voices worth learning from, by name.
    ///
    /// A list of what to exclude was the obvious way round and it does not work: of the
    /// 41 English voices macOS installs, 35 are cartoons and joke synthesisers from the
    /// nineties, and on the web the browser hands their names back translated into the
    /// interface language. So the rule is inverted — only real voices are offered, and
    /// unknown means not offered. The worst case is a good voice missing from a list of
    /// six, not a lesson read by a robot.
    private static let realVoices: Set<String> = [
        "samantha", "саманта", "daniel", "дэниэл", "alex", "алекс", "karen", "карен",
        "moira", "мойра", "rishi", "риши", "tessa", "тесса", "fiona", "фиона",
        "serena", "серена", "kate", "кейт", "oliver", "оливер", "ava", "ава",
        "allison", "эллисон", "susan", "сьюзан", "nicky", "ники", "aaron", "аарон",
        "zoe", "зои", "evan", "эван", "nathan", "нейтан", "noelle", "ноэль",
        "mónica", "monica", "моника", "paulina", "паулина", "jorge", "хорхе",
        "juan", "хуан", "diego", "диего", "marisol", "марисоль", "carlos", "карлос",
        "angelica", "angélica", "анхелика", "soledad", "соледад", "isabela", "изабела"
    ]

    /// More than this is a list to scroll, not a choice to make.
    private static let maxVoices = 6

    /// Every installed voice that can read the current language, best first.
    ///
    /// Quality is the thing that matters most here and the one nobody thinks about: macOS
    /// ships every language with a `compact` voice, which is the robotic one. The enhanced
    /// and premium versions are a separate download, and until they are installed the app
    /// has nothing better to offer — so this list also tells the settings screen what
    /// quality it is actually working with.
    static func voices(for language: LearningLanguage) -> [AVSpeechSynthesisVoice] {
        let real = voices(for: language, accepting: { realVoices.contains($0.name.lowercased()) })
        // An unknown system, or Apple renamed something: better a list with a cartoon in
        // it than an empty settings screen.
        return real.isEmpty ? voices(for: language, accepting: { !$0.name.contains(" (") }) : real
    }

    private static func voices(
        for language: LearningLanguage,
        accepting accept: (AVSpeechSynthesisVoice) -> Bool
    ) -> [AVSpeechSynthesisVoice] {
        let all = AVSpeechSynthesisVoice.speechVoices()
        var found: [AVSpeechSynthesisVoice] = []
        var seen: Set<String> = []
        for locale in [language.speechLocale] + language.speechFallbacks {
            let here = all
                .filter { $0.language.hasPrefix(locale) && !seen.contains($0.name) && accept($0) }
                // Best quality first: the same name can be installed as compact and premium.
                .sorted { $0.quality.rawValue > $1.quality.rawValue }
            for voice in here where !seen.contains(voice.name) {
                seen.insert(voice.name)
                found.append(voice)
                if found.count >= maxVoices { return found }
            }
        }
        return found
    }

    static func quality(_ voice: AVSpeechSynthesisVoice) -> String {
        switch voice.quality {
        case .premium: "премиум"
        case .enhanced: "улучшенный"
        default: "облегчённый"
        }
    }

    // MARK: - The learner's own choice
    //
    // Kept per language in UserDefaults: the voice that reads Spanish has nothing to do
    // with the one that reads English, and picking one must not silently change the other.

    private static func key(_ code: LanguageCode) -> String { "voice.\(code.rawValue)" }

    static func chosenIdentifier(for code: LanguageCode) -> String? {
        UserDefaults.standard.string(forKey: key(code))
    }

    static func choose(_ voice: AVSpeechSynthesisVoice?, for code: LanguageCode) {
        if let voice { UserDefaults.standard.set(voice.identifier, forKey: key(code)) }
        else { UserDefaults.standard.removeObject(forKey: key(code)) }
    }

    /// What will actually speak: the learner's pick if it is still installed, otherwise the
    /// best available for the language.
    static func activeVoice() -> AVSpeechSynthesisVoice? {
        let available = voices(for: language)
        if let identifier = chosenIdentifier(for: language.code),
           let mine = available.first(where: { $0.identifier == identifier }) {
            return mine
        }
        return available.first ?? AVSpeechSynthesisVoice(language: language.speechLocale)
    }

    func speak(_ text: String, rate: Float = 0.47, voice: AVSpeechSynthesisVoice? = nil) {
        guard !text.isEmpty else { return }
        let utterance = AVSpeechUtterance(string: text)
        utterance.voice = voice ?? Self.activeVoice()
        utterance.rate = rate
        synthesizer.stopSpeaking(at: .immediate)
        synthesizer.speak(utterance)
    }

    func stop() { synthesizer.stopSpeaking(at: .immediate) }

    /// Waits out the system voice, so the learner's own take can follow it without a gap.
    /// `AVSpeechSynthesizerDelegate` cannot be adopted by a `@MainActor` type under Swift 6,
    /// so the end of the phrase is observed rather than subscribed to.
    func waitUntilSilent() async {
        var ticks = 0
        while !synthesizer.isSpeaking, ticks < 20 {
            try? await Task.sleep(for: .milliseconds(50))
            ticks += 1
        }
        while synthesizer.isSpeaking {
            try? await Task.sleep(for: .milliseconds(80))
        }
    }
}
