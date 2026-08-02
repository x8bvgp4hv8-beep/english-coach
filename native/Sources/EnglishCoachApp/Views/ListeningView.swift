import SwiftUI
import EnglishCoachCore

/// Hear the sentence, write down what you heard.
///
/// The English stays hidden until the answer is in — that is the whole point. Reading it
/// first turns the drill back into reading, which is the skill that was never the problem.
struct ListeningView: View {
    @Environment(AppModel.self) private var model
    @State private var speech = SpeechService()
    @State private var answer = ""
    @State private var showGloss = false
    @State private var plays = 0
    @FocusState private var writing: Bool

    var body: some View {
        VStack(spacing: 0) {
            topBar
            if model.listeningIsComplete { finished }
            else if let item = model.currentListeningItem {
                card(item).id(item.exerciseID)
                    .transition(.opacity.combined(with: .move(edge: .trailing)))
            }
        }
        .animation(.snappy, value: model.currentListeningItem?.exerciseID)
        .onAppear { play() }
        .onChange(of: model.currentListeningItem?.exerciseID) { _, _ in
            answer = ""
            showGloss = false
            // The next sentence plays itself, so the drill is one keystroke per item.
            play()
        }
        .onDisappear { speech.stop() }
    }

    private func play(rate: Float = 0.47) {
        guard let item = model.currentListeningItem else { return }
        plays += 1
        speech.speak(item.text, rate: rate)
    }

    private func leave() {
        speech.stop()
        model.closeListening()
    }

    private func submit() {
        guard !answer.trimmingCharacters(in: .whitespaces).isEmpty else { return }
        writing = false
        model.submitHeard(answer)
    }

    private var topBar: some View {
        VStack(spacing: 10) {
            HStack(spacing: 12) {
                Button { leave() } label: { Image(systemName: "xmark") }
                    .buttonStyle(.plain).foregroundStyle(.secondary).help("Выйти")
                Spacer()
                Text("На слух").font(.headline)
                Spacer()
                Text("\(min(model.session.exerciseIndex + 1, max(1, model.listeningItems.count))) / \(max(1, model.listeningItems.count))")
                    .monospacedDigit().foregroundStyle(.secondary)
            }
            ProgressView(value: Double(model.session.exerciseIndex), total: Double(max(1, model.listeningItems.count)))
                .tint(CoachTheme.blue)
        }
        .padding(20)
        .background(CoachTheme.surface)
    }

    private func card(_ item: ListeningItem) -> some View {
        let feedback = model.session.feedback
        return VStack(spacing: 22) {
            Spacer(minLength: 12)
            VStack(spacing: 18) {
                Text("ЗАПИШИ, ЧТО УСЛЫШАЛ").font(.caption.weight(.black)).foregroundStyle(CoachTheme.blue).tracking(1.2)

                Button { play() } label: {
                    ZStack {
                        Circle().fill(CoachTheme.blue).frame(width: 96, height: 96)
                            .shadow(color: CoachTheme.blue.opacity(0.35), radius: 12, y: 6)
                        Image(systemName: "speaker.wave.3.fill")
                            .font(.system(size: 34, weight: .bold)).foregroundStyle(.white)
                    }
                }
                .buttonStyle(.plain)
                .help("Прослушать")

                HStack(spacing: 10) {
                    listenButton("Ещё раз", "arrow.clockwise") { play() }
                    listenButton("Медленно", "tortoise.fill") { play(rate: SpeechService.slowRate) }
                    listenButton("Смысл", "lightbulb.fill") { showGloss = true }
                        .disabled(item.gloss == nil || showGloss)
                }

                if showGloss, let gloss = item.gloss {
                    Text(gloss).font(.callout).foregroundStyle(.secondary).multilineTextAlignment(.center)
                }

                TextField("Что ты услышал…", text: $answer)
                    .textFieldStyle(.plain)
                    .font(.title3)
                    .padding(14)
                    .background(CoachTheme.cardFill, in: RoundedRectangle(cornerRadius: 14))
                    .overlay(RoundedRectangle(cornerRadius: 14).stroke(CoachTheme.borderColor, lineWidth: max(2, CoachTheme.borderWidth)))
                    .focused($writing)
                    .disabled(feedback != nil)
                    .onSubmit(submit)

                if let feedback { verdict(feedback, item: item) }

                if feedback == nil {
                    VStack(spacing: 8) {
                        Button("Проверить") { submit() }
                            .buttonStyle(PrimaryButtonStyle(color: CoachTheme.blue))
                            .disabled(answer.trimmingCharacters(in: .whitespaces).isEmpty)
                        Button("Не разобрал — покажи") { withAnimation { model.revealHeard() } }
                            .buttonStyle(.plain).font(.callout).foregroundStyle(.secondary)
                    }
                } else {
                    HStack(spacing: 12) {
                        Button("Ещё раз, медленно") { play(rate: SpeechService.slowRate) }.buttonStyle(.bordered)
                        Button("Дальше") { withAnimation { model.advance() } }
                            .buttonStyle(PrimaryButtonStyle(color: feedback?.isCorrect == true ? CoachTheme.mint : CoachTheme.blue))
                    }
                }
            }
            .padding(28).frame(maxWidth: 470)
            .coachCard(radius: 26)
            Spacer()
        }
        .padding(.horizontal, 28)
    }

    @ViewBuilder private func verdict(_ result: AnswerResult, item: ListeningItem) -> some View {
        VStack(spacing: 6) {
            Text(title(for: result))
                .font(.callout.weight(.bold))
                .foregroundStyle(result.isCorrect ? CoachTheme.mint : CoachTheme.amber)
            if result.verdict == .typo, let typo = result.typo {
                Text("Правильно пишется «\(typo)»").font(.caption).foregroundStyle(.secondary)
            }
            // The sentence with the words that slipped past marked in it: seeing where the
            // ear gave out is the lesson, the score is not.
            heardLine(result, fallback: item.text)
                .font(.system(size: 18, weight: .semibold))
                .multilineTextAlignment(.center)
            if let gloss = item.gloss {
                Text(gloss).font(.caption).foregroundStyle(.secondary).multilineTextAlignment(.center)
            }
            if let hint = missedWords(result.diff) {
                Text(hint).font(.caption).foregroundStyle(CoachTheme.amber)
            }
        }
        .padding(.top, 4)
    }

    private func title(for result: AnswerResult) -> String {
        switch result.verdict {
        case .correct: plays <= 1 ? "С первого раза!" : "Точно!"
        case .typo: "Услышал верно, написал с опиской"
        case .wrong: answer.trimmingCharacters(in: .whitespaces).isEmpty ? "Вот что там было" : "Не всё дошло"
        }
    }

    private func heardLine(_ result: AnswerResult, fallback: String) -> Text {
        // Marking up only helps when something got through. If nothing did — an empty
        // answer, or one that missed entirely — a wall of amber says only what the learner
        // already knows.
        guard result.diff.contains(where: { $0.kind == .same }) else { return Text(fallback) }
        let parts = result.diff.filter { $0.kind != .extra }
        // The diff is built from stripped words; the sentence gets its full stop back so
        // the line still reads as one.
        let tail = fallback.last.map { ".!?".contains($0) ? String($0) : "" } ?? ""
        return parts.enumerated().reduce(Text("")) { line, pair in
            let last = pair.offset == parts.count - 1
            let word = Text(pair.element.text + (last ? tail : " "))
            return line + (pair.element.kind == .missing ? word.foregroundColor(CoachTheme.amber) : word)
        }
    }

    /// Names what the ear missed, but only when the answer was close enough for a list to help.
    private func missedWords(_ diff: [WordDiff]) -> String? {
        guard let summary = AnswerChecker.diffSummary(diff) else { return nil }
        if summary.orderOnly { return "Слова верные, но порядок другой" }
        var parts: [String] = []
        if !summary.missing.isEmpty { parts.append("не расслышал: \(summary.missing.joined(separator: ", "))") }
        if !summary.extra.isEmpty { parts.append("послышалось лишнее: \(summary.extra.joined(separator: ", "))") }
        return parts.isEmpty ? nil : parts.joined(separator: "  ·  ")
    }

    private func listenButton(_ title: String, _ icon: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Label(title, systemImage: icon)
                .font(.callout.weight(.semibold))
                .frame(maxWidth: .infinity).padding(.vertical, 9)
                .background(CoachTheme.blue.opacity(0.14), in: RoundedRectangle(cornerRadius: 12))
                .foregroundStyle(CoachTheme.blue)
        }
        .buttonStyle(.plain)
    }

    private var finished: some View {
        VStack(spacing: 22) {
            Spacer()
            ZStack {
                Circle().fill(CoachTheme.blue.gradient).frame(width: 110, height: 110)
                    .shadow(color: CoachTheme.blue.opacity(0.35), radius: 22, y: 10)
                Image(systemName: "ear.fill").font(.system(size: 46)).foregroundStyle(.white)
            }
            Text("Уловил!").font(.system(size: 34, weight: .black, design: .rounded))
            Text("Речь на слух — то, что не тренируется чтением.")
                .font(.title3).foregroundStyle(.secondary).multilineTextAlignment(.center)
            Button("Вернуться на карту") { leave() }.buttonStyle(PrimaryButtonStyle()).frame(maxWidth: 330)
            Spacer()
        }
        .padding(36)
    }
}
