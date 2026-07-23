import SwiftUI
import EnglishCoachCore

struct LessonPlayerView: View {
    @Environment(AppModel.self) private var model
    @State private var answer = ""
    @State private var selectedIndices: [Int] = []
    @State private var selectedOption: String?
    @State private var speech = SpeechService()

    var body: some View {
        VStack(spacing: 0) {
            topBar
            if model.lessonIsComplete { CompletionView() }
            else if let exercise = model.currentExercise {
                exerciseCard(exercise).id(exercise.id).transition(.opacity.combined(with: .move(edge: .trailing)))
            }
        }
        .onChange(of: model.currentExercise?.id) { _, _ in resetInputs() }
    }

    private func resetInputs() { answer = ""; selectedIndices = []; selectedOption = nil }

    private var topBar: some View {
        VStack(spacing: 10) {
            HStack(spacing: 12) {
                Button { model.closeLesson() } label: { Image(systemName: "xmark") }
                    .buttonStyle(.plain).foregroundStyle(.secondary).help("Выйти из урока")
                if model.canGoBack {
                    Button { withAnimation { model.goBack() } } label: { Label("Назад", systemImage: "chevron.left") }
                        .buttonStyle(.plain).foregroundStyle(CoachTheme.violet)
                }
                Spacer()
                Text(model.activeLesson?.title ?? "Урок").font(.headline).lineLimit(1)
                Spacer()
                Text("\(min(model.session.exerciseIndex + 1, model.activeLesson?.exercises.count ?? 1)) / \(model.activeLesson?.exercises.count ?? 1)")
                    .monospacedDigit().foregroundStyle(.secondary)
            }
            ProgressView(value: Double(model.session.exerciseIndex), total: Double(max(1, model.activeLesson?.exercises.count ?? 1))).tint(CoachTheme.violet)
        }.padding(20).background(.white.opacity(0.52))
    }

    @ViewBuilder private func exerciseCard(_ exercise: Exercise) -> some View {
        VStack(spacing: 22) {
            Spacer(minLength: 12)
            VStack(spacing: 18) {
                Text(label(for: exercise.type)).font(.caption.weight(.black)).foregroundStyle(CoachTheme.violet).tracking(1.2)
                if let title = exercise.title { Text(title).font(.system(size: 27, weight: .black, design: .rounded)).multilineTextAlignment(.center) }
                if let prompt = exercise.prompt {
                    HStack(spacing: 8) {
                        Text(prompt).font(.system(size: 24, weight: .bold, design: .rounded)).multilineTextAlignment(.center)
                        if exercise.type == .flashcard { Button { speech.speak(prompt) } label: { Image(systemName: "speaker.wave.2.fill") }.buttonStyle(.plain).foregroundStyle(CoachTheme.blue) }
                    }
                }
                content(for: exercise)
                if let hint = exercise.hint, model.feedback == nil { Label(hint, systemImage: "lightbulb.fill").font(.callout).foregroundStyle(.secondary) }
                feedbackView
            }
            .padding(28).frame(maxWidth: 470)
            .background(.white.opacity(0.9), in: RoundedRectangle(cornerRadius: 26, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: 26).stroke(.white, lineWidth: 1))
            .shadow(color: CoachTheme.violet.opacity(0.14), radius: 28, y: 15)
            Spacer()
        }.padding(.horizontal, 28).animation(.snappy, value: model.feedback)
    }

    @ViewBuilder private func content(for exercise: Exercise) -> some View {
        switch exercise.type {
        case .info:
            Text(exercise.explanation ?? "").font(.title3).lineSpacing(6).multilineTextAlignment(.center)
            Button("Понятно") { withAnimation { model.completePassive() } }.buttonStyle(PrimaryButtonStyle())
        case .flashcard:
            Text(exercise.translation ?? "").font(.title3).foregroundStyle(.secondary)
            if let example = exercise.example { Text(example).italic().padding(12).background(CoachTheme.mist, in: RoundedRectangle(cornerRadius: 12)) }
            Button("Запомнил") { withAnimation { model.completePassive() } }.buttonStyle(PrimaryButtonStyle(color: CoachTheme.blue))
        case .translate:
            TextField("Напиши перевод…", text: $answer).textFieldStyle(.plain).font(.title3).padding(14).background(.white, in: RoundedRectangle(cornerRadius: 14)).overlay(RoundedRectangle(cornerRadius: 14).stroke(CoachTheme.violet.opacity(0.25), lineWidth: 2)).onSubmit(submitText).disabled(model.feedback != nil)
            if model.feedback == nil { Button("Проверить", action: submitText).buttonStyle(PrimaryButtonStyle()) }
        case .wordOrder:
            wordOrder(exercise.tokens ?? [])
        case .multipleChoice:
            multipleChoice(exercise.options ?? [])
        }
    }

    // MARK: - Word order (assemble the sentence, tokens are removable)

    @ViewBuilder private func wordOrder(_ tokens: [String]) -> some View {
        FlowLayout(spacing: 8) {
            ForEach(Array(selectedIndices.enumerated()), id: \.offset) { position, index in
                Button { if model.feedback == nil { withAnimation(.snappy) { _ = selectedIndices.remove(at: position) } } } label: {
                    chip(tokens[index], filled: true)
                }.buttonStyle(.plain)
            }
        }
        .frame(maxWidth: .infinity, minHeight: 56, alignment: .leading)
        .padding(10)
        .background(CoachTheme.mist, in: RoundedRectangle(cornerRadius: 14))
        .overlay(alignment: .leading) {
            if selectedIndices.isEmpty { Text("Нажимай на слова ниже, чтобы собрать фразу").font(.callout).foregroundStyle(.secondary).padding(.horizontal, 14) }
        }

        FlowLayout(spacing: 8) {
            ForEach(Array(tokens.enumerated()), id: \.offset) { index, token in
                let used = selectedIndices.contains(index)
                Button { if model.feedback == nil, !used { withAnimation(.snappy) { selectedIndices.append(index) } } } label: {
                    chip(token, filled: false).opacity(used ? 0.25 : 1)
                }.buttonStyle(.plain).disabled(used || model.feedback != nil)
            }
        }

        if model.feedback == nil {
            HStack(spacing: 12) {
                Button { withAnimation(.snappy) { selectedIndices = [] } } label: { Label("Очистить", systemImage: "arrow.uturn.backward") }
                    .buttonStyle(.bordered).disabled(selectedIndices.isEmpty)
                Button("Проверить") { model.submitText(selectedIndices.map { tokens[$0] }.joined(separator: " ")) }
                    .buttonStyle(PrimaryButtonStyle()).disabled(selectedIndices.isEmpty)
            }
        }
    }

    // MARK: - Multiple choice (select, then confirm)

    @ViewBuilder private func multipleChoice(_ options: [String]) -> some View {
        ForEach(options, id: \.self) { option in
            Button { if model.feedback == nil { selectedOption = option } } label: { Text(option) }
                .buttonStyle(ChoiceButtonStyle(selected: selectedOption == option))
                .disabled(model.feedback != nil)
        }
        if model.feedback == nil {
            Button("Проверить") { if let option = selectedOption { model.submitChoice(option) } }
                .buttonStyle(PrimaryButtonStyle()).disabled(selectedOption == nil)
        }
    }

    private func chip(_ text: String, filled: Bool) -> some View {
        Text(text).font(.headline)
            .padding(.horizontal, 14).padding(.vertical, 9)
            .background(filled ? CoachTheme.violet : Color.white, in: Capsule())
            .foregroundStyle(filled ? .white : CoachTheme.ink)
            .overlay(Capsule().stroke(CoachTheme.violet.opacity(filled ? 0 : 0.35), lineWidth: 1.5))
    }

    @ViewBuilder private var feedbackView: some View {
        if let feedback = model.feedback {
            VStack(spacing: 12) {
                Label(headline(for: feedback.verdict), systemImage: feedback.isCorrect ? "checkmark.circle.fill" : "arrow.counterclockwise.circle.fill")
                    .font(.title3.bold()).foregroundStyle(feedback.isCorrect ? CoachTheme.mint : .orange)
                if feedback.verdict == .typo, let typo = feedback.typo {
                    Text("Опечатка: правильно пишется «\(typo)»").font(.callout).foregroundStyle(.secondary).multilineTextAlignment(.center)
                }
                if feedback.verdict == .wrong {
                    Text("Правильный ответ: \(feedback.canonical)").multilineTextAlignment(.center)
                    if let hint = mistakeHint(feedback.diff) {
                        Text(hint).font(.callout).foregroundStyle(.orange).multilineTextAlignment(.center)
                    }
                }
                HStack {
                    if !feedback.isCorrect && !model.session.retryUsed {
                        Button("Попробовать ещё") { resetInputs(); model.retry() }.buttonStyle(.bordered)
                    }
                    Button("Дальше") { resetInputs(); withAnimation { model.advance() } }
                        .buttonStyle(PrimaryButtonStyle(color: feedback.isCorrect ? CoachTheme.mint : CoachTheme.violet))
                }
                // The escape hatch: whatever the checker still gets wrong costs one tap, once.
                if feedback.verdict == .wrong, canOverrule {
                    Button("Мой ответ тоже верный") { withAnimation { model.markLastAnswerCorrect() } }
                        .buttonStyle(.plain).font(.callout).foregroundStyle(CoachTheme.violet)
                }
            }.padding(.top, 4)
        }
    }

    private var canOverrule: Bool {
        guard let type = model.currentExercise?.type else { return false }
        return type == .translate || type == .wordOrder
    }

    private func headline(for verdict: Verdict) -> String {
        switch verdict {
        case .correct: "Отлично!"
        case .typo: "Почти! Засчитано"
        case .wrong: "Пока не так"
        }
    }

    /// Names what is missing or extra, but only when the answer was close enough to fix.
    private func mistakeHint(_ diff: [WordDiff]) -> String? {
        guard let summary = AnswerChecker.diffSummary(diff) else { return nil }
        if summary.orderOnly { return "Слова верные, но порядок другой" }
        var parts: [String] = []
        if !summary.missing.isEmpty { parts.append("не хватает: \(summary.missing.joined(separator: ", "))") }
        if !summary.extra.isEmpty { parts.append("лишнее: \(summary.extra.joined(separator: ", "))") }
        return parts.isEmpty ? nil : parts.joined(separator: "  ·  ")
    }

    private func submitText() { guard !answer.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }; model.submitText(answer) }
    private func label(for type: ExerciseType) -> String { switch type { case .info: "КОРОТКОЕ ПРАВИЛО"; case .flashcard: "НОВАЯ ФРАЗА"; case .translate: "ПЕРЕВЕДИ НА АНГЛИЙСКИЙ"; case .wordOrder: "СОБЕРИ ПРЕДЛОЖЕНИЕ"; case .multipleChoice: "ВЫБЕРИ ОТВЕТ" } }
}

/// Simple wrapping layout so word chips flow onto multiple lines.
struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout Void) -> CGSize {
        let maxWidth = proposal.width ?? .infinity
        var x: CGFloat = 0, y: CGFloat = 0, rowHeight: CGFloat = 0
        for sub in subviews {
            let size = sub.sizeThatFits(.unspecified)
            if x + size.width > maxWidth, x > 0 { x = 0; y += rowHeight + spacing; rowHeight = 0 }
            x += size.width + spacing
            rowHeight = max(rowHeight, size.height)
        }
        return CGSize(width: maxWidth == .infinity ? x : maxWidth, height: y + rowHeight)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout Void) {
        var x = bounds.minX, y = bounds.minY, rowHeight: CGFloat = 0
        for sub in subviews {
            let size = sub.sizeThatFits(.unspecified)
            if x + size.width > bounds.maxX, x > bounds.minX { x = bounds.minX; y += rowHeight + spacing; rowHeight = 0 }
            sub.place(at: CGPoint(x: x, y: y), proposal: ProposedViewSize(size))
            x += size.width + spacing
            rowHeight = max(rowHeight, size.height)
        }
    }
}
