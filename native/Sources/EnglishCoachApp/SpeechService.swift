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
}
