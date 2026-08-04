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

    /// The installed voice closest to the language, or none — in which case the system
    /// reads it in the default voice. A Mac without a Spanish voice still speaks; it just
    /// speaks badly, which is better than a silent button.
    private static func voice() -> AVSpeechSynthesisVoice? {
        for wanted in [language.speechLocale] + language.speechFallbacks {
            if let match = AVSpeechSynthesisVoice(language: wanted) { return match }
        }
        return nil
    }

    func speak(_ text: String, rate: Float = 0.47) {
        guard !text.isEmpty else { return }
        let utterance = AVSpeechUtterance(string: text)
        utterance.voice = Self.voice()
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
