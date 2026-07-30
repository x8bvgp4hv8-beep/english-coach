import SwiftUI
import EnglishCoachCore

/// Say it out loud, hear yourself next to the model phrase, judge it.
/// There is no speech grading and no need for one — the ear does the grading.
struct ShadowingView: View {
    @Environment(AppModel.self) private var model
    @State private var speech = SpeechService()
    @State private var recorder = RecorderService()

    var body: some View {
        VStack(spacing: 0) {
            topBar
            if model.shadowingIsComplete { finished }
            else if let item = model.currentShadowingItem { card(item).id(item.exerciseID) }
        }
        .onChange(of: model.currentShadowingItem?.exerciseID) { _, _ in
            speech.stop()
            recorder.discard()
        }
        .onDisappear { speech.stop(); recorder.discard() }
    }

    private func leave() {
        speech.stop()
        recorder.discard()
        model.closeShadowing()
    }

    private var topBar: some View {
        VStack(spacing: 10) {
            HStack(spacing: 12) {
                Button { leave() } label: { Image(systemName: "xmark") }
                    .buttonStyle(.plain).foregroundStyle(.secondary).help("Выйти")
                Spacer()
                Text("Вслух за диктором").font(.headline)
                Spacer()
                Text("\(min(model.session.exerciseIndex + 1, max(1, model.shadowingItems.count))) / \(max(1, model.shadowingItems.count))")
                    .monospacedDigit().foregroundStyle(.secondary)
            }
            ProgressView(value: Double(model.session.exerciseIndex), total: Double(max(1, model.shadowingItems.count)))
                .tint(CoachTheme.coral)
        }
        .padding(20)
        .background(.white.opacity(0.52))
    }

    private func card(_ item: ShadowingItem) -> some View {
        VStack(spacing: 22) {
            Spacer(minLength: 12)
            VStack(spacing: 18) {
                Text("ПОВТОРИ ВСЛУХ").font(.caption.weight(.black)).foregroundStyle(CoachTheme.coral).tracking(1.2)
                Text(item.text)
                    .font(.system(size: 26, weight: .bold, design: .rounded))
                    .multilineTextAlignment(.center)
                if let gloss = item.gloss {
                    Text(gloss).font(.title3).foregroundStyle(.secondary).multilineTextAlignment(.center)
                }

                HStack(spacing: 10) {
                    listenButton("Эталон", "speaker.wave.2.fill") { speech.speak(item.text) }
                    listenButton("Я", "play.fill") { speech.stop(); recorder.play() }.disabled(!recorder.hasTake)
                    // Model phrase, then your own take: the difference is heard, not guessed.
                    listenButton("Подряд", "arrow.left.arrow.right") {
                        Task { @MainActor in
                            speech.speak(item.text)
                            await speech.waitUntilSilent()
                            recorder.play()
                        }
                    }.disabled(!recorder.hasTake)
                }

                Divider()

                HStack(spacing: 16) {
                    Button { recorder.toggle() } label: {
                        ZStack {
                            Circle()
                                .fill(recorder.status == .recording ? Color(red: 0.84, green: 0.24, blue: 0.24) : CoachTheme.coral)
                                .frame(width: 62, height: 62)
                                .shadow(color: CoachTheme.coral.opacity(0.4), radius: 10, y: 5)
                            Image(systemName: recorder.status == .recording ? "stop.fill" : "mic.fill")
                                .font(.system(size: 24, weight: .bold)).foregroundStyle(.white)
                        }
                    }
                    .buttonStyle(.plain)
                    .help(recorder.status == .recording ? "Остановить запись" : "Записать себя")

                    Text(note).font(.callout).foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                        .frame(maxWidth: .infinity, alignment: .leading)
                }

                HStack(spacing: 12) {
                    Button("Ещё поработать") { model.shadowingSelfAssess(false) }.buttonStyle(.bordered)
                    Button("Получилось") { model.shadowingSelfAssess(true) }
                        .buttonStyle(PrimaryButtonStyle(color: CoachTheme.mint))
                }
            }
            .padding(28).frame(maxWidth: 470)
            .background(.white.opacity(0.9), in: RoundedRectangle(cornerRadius: 26, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: 26).stroke(.white, lineWidth: 1))
            .shadow(color: CoachTheme.coral.opacity(0.14), radius: 28, y: 15)
            Spacer()
        }
        .padding(.horizontal, 28)
    }

    private var note: String {
        switch recorder.status {
        case .recording: "Говори — потом нажми ещё раз"
        case .ready: "Сравни себя с эталоном и оцени"
        case .denied: "Микрофон не разрешён. Разреши доступ в «Системных настройках → Конфиденциальность → Микрофон» — или просто говори вслух, разбор всё равно засчитается."
        case .failed: "Записать не получилось. Говори вслух и сравнивай на слух."
        case .idle: "Послушай эталон, повтори вслух и запиши себя"
        }
    }

    private func listenButton(_ title: String, _ icon: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Label(title, systemImage: icon)
                .font(.callout.weight(.semibold))
                .frame(maxWidth: .infinity).padding(.vertical, 9)
                .background(CoachTheme.coral.opacity(0.14), in: RoundedRectangle(cornerRadius: 12))
                .foregroundStyle(CoachTheme.coralInk)
        }
        .buttonStyle(.plain)
    }

    private var finished: some View {
        VStack(spacing: 22) {
            Spacer()
            ZStack {
                Circle().fill(CoachTheme.coral.gradient).frame(width: 110, height: 110)
                    .shadow(color: CoachTheme.coral.opacity(0.35), radius: 22, y: 10)
                Image(systemName: "mic.fill").font(.system(size: 46)).foregroundStyle(.white)
            }
            Text("Проговорено!").font(.system(size: 34, weight: .black, design: .rounded))
            Text("Рот работал — это и есть тот самый сдвиг.")
                .font(.title3).foregroundStyle(.secondary).multilineTextAlignment(.center)
            Button("Вернуться на карту") { leave() }.buttonStyle(PrimaryButtonStyle()).frame(maxWidth: 330)
            Spacer()
        }
        .padding(36)
    }
}
