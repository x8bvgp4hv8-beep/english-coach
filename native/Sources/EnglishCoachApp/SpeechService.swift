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

    /// Apple ships a set of character voices — Eddy, Grandma, Rocko and friends — in every
    /// language, and they sort ahead of the real one. Reading a model phrase in a cartoon
    /// voice teaches the wrong thing, so they are never chosen automatically. They stay in
    /// the picker: it is the learner's app, and someone may want Grandma.
    private static let novelty: Set<String> = [
        "Eddy", "Flo", "Grandma", "Grandpa", "Reed", "Rocko", "Sandy", "Shelley",
        "Albert", "Bad News", "Bahh", "Bells", "Boing", "Bubbles", "Cellos", "Wobble",
        "Fred", "Good News", "Jester", "Junior", "Kathy", "Organ", "Superstar", "Ralph",
        "Trinoids", "Whisper", "Zarvox"
    ]

    /// Every installed voice that can read the current language, best first.
    ///
    /// Quality is the thing that matters most here and the one nobody thinks about: macOS
    /// ships every language with a `compact` voice, which is the robotic one. The enhanced
    /// and premium versions are a separate download, and until they are installed the app
    /// has nothing better to offer — so this list also tells the settings screen what
    /// quality it is actually working with.
    static func voices(for language: LearningLanguage) -> [AVSpeechSynthesisVoice] {
        let all = AVSpeechSynthesisVoice.speechVoices()
        var found: [AVSpeechSynthesisVoice] = []
        for locale in [language.speechLocale] + language.speechFallbacks {
            for voice in all where voice.language.hasPrefix(locale) && !found.contains(voice) {
                found.append(voice)
            }
        }
        return found.sorted { left, right in
            let leftPlain = !novelty.contains(left.name), rightPlain = !novelty.contains(right.name)
            if leftPlain != rightPlain { return leftPlain }
            return left.quality.rawValue > right.quality.rawValue
        }
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
