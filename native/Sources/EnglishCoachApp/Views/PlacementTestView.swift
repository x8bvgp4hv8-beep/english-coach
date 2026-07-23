import SwiftUI
import EnglishCoachCore

/// The placement question flow itself. Shared by onboarding and by "retake the test"
/// in settings, so the question bank is not a one-shot first-run resource.
struct PlacementTestView: View {
    @Environment(AppModel.self) private var model
    @State private var picked: String?
    /// Called with the recommended level once the answers pin one down.
    let onFinish: (CEFRLevel) -> Void
    let onSkip: () -> Void
    var skipTitle = "Пропустить и выбрать вручную"

    var body: some View {
        if let question = model.currentPlacementQuestion {
            VStack(spacing: 18) {
                Text("ВОПРОС \(model.placementCurrentNumber)")
                    .font(.caption.weight(.black)).foregroundStyle(CoachTheme.violet).tracking(1.2)
                ProgressView(value: model.placementProgress).tint(CoachTheme.violet).frame(maxWidth: 340)
                Text("Вопросы усложняются. Тест закончится, как только уровень станет ясен.")
                    .font(.caption).foregroundStyle(.secondary).multilineTextAlignment(.center)
                    .fixedSize(horizontal: false, vertical: true).frame(maxWidth: 340)
                Text(question.prompt).font(.system(size: 24, weight: .bold, design: .rounded)).multilineTextAlignment(.center)
                VStack(spacing: 10) {
                    ForEach(question.options, id: \.self) { option in
                        Button { picked = option } label: { Text(option) }
                            .buttonStyle(ChoiceButtonStyle(selected: picked == option))
                    }
                }.frame(maxWidth: 340)
                Button("Ответить") {
                    guard let choice = picked else { return }
                    model.answerPlacement(choice); model.advancePlacement(); picked = nil
                    if model.placementFinished { onFinish(model.placementRecommendedLevel) }
                }.buttonStyle(PrimaryButtonStyle()).frame(maxWidth: 340).disabled(picked == nil)
                Button(skipTitle) { picked = nil; model.cancelPlacement(); onSkip() }
                    .buttonStyle(.plain).font(.callout).foregroundStyle(.secondary)
            }
        }
    }
}

/// Retake flow presented from settings: questions → result → apply the level.
struct PlacementSheet: View {
    @Environment(AppModel.self) private var model
    @State private var result: CEFRLevel?
    let onClose: () -> Void

    var body: some View {
        ZStack {
            CoachTheme.background.ignoresSafeArea()
            VStack(spacing: 22) {
                if let level = result {
                    Text("Твой уровень — \(level.rawValue)").font(.system(size: 26, weight: .black, design: .rounded))
                    Text(level.rawValue).font(.system(size: 60, weight: .black, design: .rounded)).foregroundStyle(CoachTheme.violet)
                    Text("Маршрут переключится на этот уровень. Пройденные уроки останутся отмеченными.")
                        .font(.callout).foregroundStyle(.secondary).multilineTextAlignment(.center).frame(maxWidth: 340)
                    Button("Перейти на \(level.rawValue)") { model.selectLevel(level); onClose() }
                        .buttonStyle(PrimaryButtonStyle()).frame(maxWidth: 340)
                    Button("Оставить \(model.selectedLevel.rawValue)") { onClose() }.buttonStyle(.bordered).frame(maxWidth: 340)
                } else {
                    PlacementTestView(onFinish: { result = $0 }, onSkip: onClose, skipTitle: "Отменить тест")
                }
            }.padding(34)
        }
        .frame(width: 460, height: 560)
        .foregroundStyle(CoachTheme.ink)
    }
}
