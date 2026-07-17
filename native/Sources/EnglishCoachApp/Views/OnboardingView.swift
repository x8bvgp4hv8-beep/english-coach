import SwiftUI
import EnglishCoachCore

struct OnboardingView: View {
    @Environment(AppModel.self) private var model
    @State private var level: CEFRLevel = .a1
    @State private var goal = 10
    @State private var step = 0

    var body: some View {
        VStack(spacing: 24) {
            Spacer()
            ZStack {
                Circle().fill(CoachTheme.amber.gradient).frame(width: 88, height: 88).shadow(color: CoachTheme.amber.opacity(0.35), radius: 18, y: 8)
                Image(systemName: "text.bubble.fill").font(.system(size: 38)).foregroundStyle(.white)
            }
            Text(step == 0 ? "Начнём с твоего уровня" : "Сколько времени в день?")
                .font(.system(size: 30, weight: .black, design: .rounded)).multilineTextAlignment(.center)
            Text(step == 0 ? "Его всегда можно изменить в настройках." : "Небольшие регулярные шаги работают лучше марафонов.")
                .foregroundStyle(.secondary).multilineTextAlignment(.center)
            if step == 0 {
                HStack(spacing: 10) {
                    ForEach(CEFRLevel.allCases) { item in
                        Button(item.rawValue) { level = item }
                            .buttonStyle(LevelButtonStyle(selected: item == level))
                    }
                }
            } else {
                HStack(spacing: 12) {
                    ForEach([5, 10, 15], id: \.self) { minutes in
                        Button { goal = minutes } label: {
                            VStack { Text("\(minutes)").font(.title.bold()); Text("минут").font(.caption) }.frame(width: 86, height: 70)
                        }.buttonStyle(LevelButtonStyle(selected: goal == minutes))
                    }
                }
            }
            Button(step == 0 ? "Продолжить" : "Открыть маршрут") {
                if step == 0 { withAnimation(.snappy) { step = 1 } }
                else { model.completeOnboarding(level: level, dailyGoal: goal, reminderHour: 19) }
            }.buttonStyle(PrimaryButtonStyle()).frame(maxWidth: 340)
            Spacer()
            Text("Без аккаунта · Без подписки · Работает офлайн").font(.caption.weight(.medium)).foregroundStyle(.secondary)
        }.padding(42)
    }
}

private struct LevelButtonStyle: ButtonStyle {
    let selected: Bool
    func makeBody(configuration: Configuration) -> some View {
        configuration.label.font(.headline.weight(.bold)).foregroundStyle(selected ? .white : CoachTheme.ink)
            .padding(.horizontal, 16).padding(.vertical, 13)
            .background(selected ? CoachTheme.violet : .white.opacity(0.75), in: RoundedRectangle(cornerRadius: 14))
            .overlay(RoundedRectangle(cornerRadius: 14).stroke(.white.opacity(0.8)))
            .scaleEffect(configuration.isPressed ? 0.96 : 1)
    }
}
