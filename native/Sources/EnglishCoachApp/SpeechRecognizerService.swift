import Foundation
import Speech

/// Transcribes the learner's own take, so shadowing can say which words came through.
///
/// This is not pronunciation scoring and does not pretend to be: a recogniser reports the
/// words it heard, not how close a vowel was. But "the machine heard *I work* where you
/// meant *I walk*" is the single most useful thing it can tell a learner, and it costs
/// nothing — recognition is forced on-device, so nothing leaves the Mac and it works
/// offline like the rest of the app.
@MainActor
@Observable
final class SpeechRecognizerService {
    enum Status: Equatable {
        case idle, working, denied, unavailable
        case heard(String)
        case failed
    }

    private(set) var status: Status = .idle

    private let recognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-US"))

    /// True only when the language model is on the machine; without it we would have to
    /// send the recording to Apple, which this app does not do.
    var isAvailable: Bool { recognizer?.isAvailable == true && recognizer?.supportsOnDeviceRecognition == true }

    func reset() { if status != .denied && status != .unavailable { status = .idle } }

    func transcribe(_ url: URL) {
        guard let recognizer, isAvailable else { status = .unavailable; return }
        status = .working
        Task { @MainActor in
            guard await Self.authorized() else { status = .denied; return }
            let request = SFSpeechURLRecognitionRequest(url: url)
            request.requiresOnDeviceRecognition = true
            request.taskHint = .dictation
            do {
                let text = try await Self.run(request, on: recognizer)
                status = text.isEmpty ? .failed : .heard(text)
            } catch {
                status = .failed
            }
        }
    }

    private static func authorized() async -> Bool {
        if SFSpeechRecognizer.authorizationStatus() == .authorized { return true }
        return await withCheckedContinuation { continuation in
            SFSpeechRecognizer.requestAuthorization { continuation.resume(returning: $0 == .authorized) }
        }
    }

    /// The callback fires more than once; only the final pass is the answer, and the
    /// continuation must be resumed exactly once either way.
    private static func run(_ request: SFSpeechURLRecognitionRequest, on recognizer: SFSpeechRecognizer) async throws -> String {
        try await withCheckedThrowingContinuation { continuation in
            nonisolated(unsafe) var finished = false
            recognizer.recognitionTask(with: request) { result, error in
                guard !finished else { return }
                if let error {
                    finished = true
                    continuation.resume(throwing: error)
                } else if let result, result.isFinal {
                    finished = true
                    continuation.resume(returning: result.bestTranscription.formattedString)
                }
            }
        }
    }
}
