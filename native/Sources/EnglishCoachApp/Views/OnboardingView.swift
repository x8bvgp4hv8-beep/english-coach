import SwiftUI
import EnglishCoachCore

struct OnboardingView: View {
    enum Stage { case intro, placement, placementResult, level, goal }
    @Environment(AppModel.self) private var model
    @State private var stage: Stage = .intro
    @State private var level: CEFRLevel = .a1
    @State private var goal = 10

    var body: some View {
        VStack(spacing: 24) {
            Spacer()
            icon
            switch stage {
            case .intro: intro
            case .placement: placement
            case .placementResult: placementResult
            case .level: levelPicker
            case .goal: goalPicker
            }
            Spacer()
        }.padding(42)
    }

    private var icon: some View {
        ZStack {
            Circle().fill(CoachTheme.amber.gradient).frame(width: 88, height: 88).shadow(color: CoachTheme.amber.opacity(0.35), radius: 18, y: 8)
            Image(systemName: "text.bubble.fill").font(.system(size: 38)).foregroundStyle(.white)
        }
    }

    private func heading(_ title: String, _ subtitle: String) -> some View {
        VStack(spacing: 10) {
            Text(title).font(.system(size: 30, weight: .black, design: .rounded)).multilineTextAlignment(.center)
            Text(subtitle).foregroundStyle(.secondary).multilineTextAlignment(.center)
        }
    }

    // MARK: Intro — choose how to set the level

    private var intro: some View {
        VStack(spacing: 22) {
            heading(
                "\(model.currentLanguage.greeting) Давай настроим уровень",
                "Курс: \(model.currentLanguage.title.lowercased()). Короткий тест подберёт стартовый уровень — или выбери его сам."
            )
            VStack(spacing: 12) {
                if model.hasPlacementTest {
                    Button {
                        model.startPlacement(); withAnimation(.snappy) { stage = .placement }
                    } label: { Label("Пройти тест на уровень", systemImage: "checklist") }
                        .buttonStyle(PrimaryButtonStyle()).frame(maxWidth: 340)
                }
                Button("Выбрать уровень вручную") { withAnimation(.snappy) { stage = .level } }
                    .buttonStyle(.bordered).frame(maxWidth: 340)
                // The picker stays one click away: a language chosen by mistake must not
                // cost an onboarding to undo.
                Button("Другой язык") { model.screen = .language }
                    .buttonStyle(.plain).foregroundStyle(CoachTheme.inkSoft)
            }
        }
    }

    // MARK: Placement test

    private var placement: some View {
        PlacementTestView(
            onFinish: { recommended in level = recommended; withAnimation(.snappy) { stage = .placementResult } },
            onSkip: { withAnimation(.snappy) { stage = .level } }
        )
    }

    private var placementResult: some View {
        VStack(spacing: 20) {
            heading("Твой уровень — \(level.rawValue)", "Мы начнём отсюда. Если станет легко, приложение само предложит перейти выше.")
            Text(level.rawValue).font(.system(size: 64, weight: .black, design: .rounded)).foregroundStyle(CoachTheme.accentColor)
            VStack(spacing: 12) {
                Button("Продолжить") { withAnimation(.snappy) { stage = .goal } }.buttonStyle(PrimaryButtonStyle()).frame(maxWidth: 340)
                Button("Выбрать другой уровень") { withAnimation(.snappy) { stage = .level } }.buttonStyle(.bordered).frame(maxWidth: 340)
            }
        }
    }

    // MARK: Manual level + goal

    private var levelPicker: some View {
        VStack(spacing: 22) {
            heading("Выбери свой уровень", "Его всегда можно изменить в настройках.")
            HStack(spacing: 10) {
                ForEach(CEFRLevel.allCases) { item in
                    Button(item.rawValue) { level = item }.buttonStyle(LevelButtonStyle(selected: item == level))
                }
            }
            Button("Продолжить") { withAnimation(.snappy) { stage = .goal } }.buttonStyle(PrimaryButtonStyle()).frame(maxWidth: 340)
        }
    }

    private var goalPicker: some View {
        VStack(spacing: 22) {
            heading("Сколько времени в день?", "Небольшие регулярные шаги работают лучше марафонов.")
            HStack(spacing: 12) {
                ForEach([5, 10, 15], id: \.self) { minutes in
                    Button { goal = minutes } label: {
                        VStack { Text("\(minutes)").font(.title.bold()); Text("минут").font(.caption) }.frame(width: 86, height: 70)
                    }.buttonStyle(LevelButtonStyle(selected: goal == minutes))
                }
            }
            Button("Открыть маршрут") { model.completeOnboarding(level: level, dailyGoal: goal, reminderHour: 19) }
                .buttonStyle(PrimaryButtonStyle()).frame(maxWidth: 340)
        }
    }
}

/// Same rule as the answer options: a chosen level is a state, so it is tinted and
/// outlined rather than filled. Solid accent belongs to the button that moves on.
private struct LevelButtonStyle: ButtonStyle {
    let selected: Bool
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.headline.weight(.bold))
            .foregroundStyle(selected ? CoachTheme.palette.accent : CoachTheme.ink)
            .padding(.horizontal, 16).padding(.vertical, 13)
            .background(selected ? CoachTheme.accentSoft : CoachTheme.cardFill, in: RoundedRectangle(cornerRadius: 14))
            .overlay(RoundedRectangle(cornerRadius: 14).stroke(selected ? CoachTheme.palette.accent : CoachTheme.borderColor, lineWidth: selected ? 2 : CoachTheme.borderWidth))
            .scaleEffect(configuration.isPressed ? 0.96 : 1)
    }
}

