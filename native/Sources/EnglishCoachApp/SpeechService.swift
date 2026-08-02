import AVFoundation

@MainActor
final class SpeechService {
    private let synthesizer = AVSpeechSynthesizer()

    /// Slow enough that the words come apart, fast enough to still be a sentence.
    static let slowRate: Float = 0.34

    func speak(_ text: String, rate: Float = 0.47) {
        guard !text.isEmpty else { return }
        let utterance = AVSpeechUtterance(string: text)
        utterance.voice = AVSpeechSynthesisVoice(language: "en-GB")
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
