import AVFoundation
import Observation

/// Records the learner's voice so it can be played back next to the model phrase.
/// Nothing leaves the Mac: the take goes to a temporary file and is deleted as soon
/// as the next phrase comes up or the screen is closed.
@MainActor
@Observable
final class RecorderService {
    enum Status: Equatable { case idle, recording, ready, denied, failed }

    private(set) var status: Status = .idle
    private var recorder: AVAudioRecorder?
    private var player: AVAudioPlayer?
    private var takeURL: URL?

    var hasTake: Bool { takeURL != nil && status == .ready }

    func toggle() { status == .recording ? stop() : start() }

    func start() {
        Task { @MainActor in
            guard await AVCaptureDevice.requestAccess(for: .audio) else { status = .denied; return }
            discard()
            let url = FileManager.default.temporaryDirectory
                .appendingPathComponent("shadowing-\(UUID().uuidString).m4a")
            let settings: [String: Any] = [
                AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
                AVSampleRateKey: 44_100,
                AVNumberOfChannelsKey: 1,
                AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue
            ]
            do {
                let recorder = try AVAudioRecorder(url: url, settings: settings)
                guard recorder.record() else { status = .failed; return }
                self.recorder = recorder
                self.takeURL = url
                status = .recording
            } catch {
                status = .failed
            }
        }
    }

    func stop() {
        guard let recorder else { return }
        recorder.stop()
        self.recorder = nil
        status = takeURL == nil ? .idle : .ready
    }

    func play() {
        guard let takeURL, status == .ready else { return }
        do {
            let player = try AVAudioPlayer(contentsOf: takeURL)
            self.player = player
            player.play()
        } catch {
            status = .failed
        }
    }

    /// Takes are scratch: they never accumulate on disk and never outlive the phrase.
    func discard() {
        player?.stop()
        player = nil
        recorder?.stop()
        recorder = nil
        if let takeURL { try? FileManager.default.removeItem(at: takeURL) }
        takeURL = nil
        // A refusal is kept, so the note explaining it stays on screen.
        if status != .denied { status = .idle }
    }
}
