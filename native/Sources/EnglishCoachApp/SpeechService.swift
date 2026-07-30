import AVFoundation

@MainActor
final class SpeechService {
    private let synthesizer = AVSpeechSynthesizer()

    func speak(_ text: String) {
        guard !text.isEmpty else { return }
        let utterance = AVSpeechUtterance(string: text)
        utterance.voice = AVSpeechSynthesisVoice(language: "en-GB")
        utterance.rate = 0.47
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
