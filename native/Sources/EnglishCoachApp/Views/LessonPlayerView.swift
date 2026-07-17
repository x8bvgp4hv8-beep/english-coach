import SwiftUI
import EnglishCoachCore

struct LessonPlayerView: View {
    @Environment(AppModel.self) private var model
    @State private var answer = ""
    @State private var selectedTokens: [String] = []
    @State private var speech = SpeechService()

    var body: some View {
        VStack(spacing: 0) {
            topBar
            if model.lessonIsComplete { CompletionView() }
            else if let exercise = model.currentExercise { exerciseCard(exercise).id(exercise.id).transition(.opacity.combined(with: .move(edge: .trailing))) }
        }
    }

    private var topBar: some View {
        VStack(spacing: 10) {
            HStack { Button("Завершить") { model.closeLesson() }.buttonStyle(.plain).foregroundStyle(.secondary); Spacer(); Text(model.activeLesson?.title ?? "Урок").font(.headline); Spacer(); Text("\(min(model.session.exerciseIndex + 1, model.activeLesson?.exercises.count ?? 1)) / \(model.activeLesson?.exercises.count ?? 1)").monospacedDigit().foregroundStyle(.secondary) }
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
            TextField("Напиши перевод…", text: $answer).textFieldStyle(.plain).font(.title3).padding(14).background(.white, in: RoundedRectangle(cornerRadius: 14)).overlay(RoundedRectangle(cornerRadius: 14).stroke(CoachTheme.violet.opacity(0.25), lineWidth: 2)).onSubmit(submitText)
            if model.feedback == nil { Button("Проверить", action: submitText).buttonStyle(PrimaryButtonStyle()) }
        case .wordOrder:
            Text(selectedTokens.joined(separator: " ")).frame(maxWidth: .infinity, minHeight: 48).padding(10).background(.white, in: RoundedRectangle(cornerRadius: 13))
            tokenGrid(exercise.tokens ?? [])
            if model.feedback == nil { Button("Проверить") { model.submitText(selectedTokens.joined(separator: " ")) }.buttonStyle(PrimaryButtonStyle()) }
        case .multipleChoice:
            ForEach(exercise.options ?? [], id: \.self) { option in
                Button(option) { model.submitChoice(option) }.buttonStyle(ChoiceButtonStyle())
            }
        }
    }

    private func tokenGrid(_ tokens: [String]) -> some View {
        LazyVGrid(columns: [GridItem(.adaptive(minimum: 76))], spacing: 9) {
            ForEach(Array(tokens.enumerated()), id: \.offset) { _, token in Button(token) { selectedTokens.append(token) }.buttonStyle(.bordered).disabled(selectedTokens.filter { $0 == token }.count >= tokens.filter { $0 == token }.count) }
        }
    }

    @ViewBuilder private var feedbackView: some View {
        if let feedback = model.feedback {
            VStack(spacing: 12) {
                Label(feedback.isCorrect ? "Отлично!" : "Пока не так", systemImage: feedback.isCorrect ? "checkmark.circle.fill" : "arrow.counterclockwise.circle.fill")
                    .font(.title3.bold()).foregroundStyle(feedback.isCorrect ? CoachTheme.mint : .orange)
                if !feedback.isCorrect { Text("Правильный ответ: \(feedback.canonical)").multilineTextAlignment(.center) }
                HStack {
                    if !feedback.isCorrect && !model.session.retryUsed { Button("Попробовать ещё") { answer = ""; selectedTokens = []; model.retry() }.buttonStyle(.bordered) }
                    Button("Дальше") { answer = ""; selectedTokens = []; withAnimation { model.advance() } }.buttonStyle(PrimaryButtonStyle(color: feedback.isCorrect ? CoachTheme.mint : CoachTheme.violet))
                }
            }.padding(.top, 4)
        }
    }

    private func submitText() { guard !answer.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }; model.submitText(answer) }
    private func label(for type: ExerciseType) -> String { switch type { case .info: "КОРОТКОЕ ПРАВИЛО"; case .flashcard: "НОВАЯ ФРАЗА"; case .translate: "ПЕРЕВЕДИ НА АНГЛИЙСКИЙ"; case .wordOrder: "СОБЕРИ ПРЕДЛОЖЕНИЕ"; case .multipleChoice: "ВЫБЕРИ ОТВЕТ" } }
}

private struct ChoiceButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label.font(.headline).foregroundStyle(CoachTheme.ink).frame(maxWidth: .infinity).padding(13).background(.white, in: RoundedRectangle(cornerRadius: 13)).overlay(RoundedRectangle(cornerRadius: 13).stroke(CoachTheme.violet.opacity(0.2), lineWidth: 2)).scaleEffect(configuration.isPressed ? 0.98 : 1)
    }
}
