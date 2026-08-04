import SwiftUI
import EnglishCoachCore

struct CompletionView: View {
    @Environment(AppModel.self) private var model
    var body: some View {
        VStack(spacing: 22) {
            Spacer()
            ZStack { Circle().fill(CoachTheme.amber.gradient).frame(width: 110, height: 110).shadow(color: CoachTheme.amber.opacity(0.35), radius: 22, y: 10); Image(systemName: "star.fill").font(.system(size: 50)).foregroundStyle(.white) }
            Text("Урок пройден!").font(.system(size: 34, weight: .black, design: .rounded))
            Text("Ты сделал ещё один реальный шаг в \(model.currentLanguage.locative).").font(.title3).foregroundStyle(.secondary).multilineTextAlignment(.center)
            HStack(spacing: 30) { metric("sparkles", "\(model.totalPoints)", "очков"); metric("flame.fill", "\(model.streak())", "дней подряд") }.padding(20).coachCard(radius: 20)
            if let next = model.suggestedNextLevel { levelUpCard(next) }
            Button("Вернуться на карту") { model.closeLesson() }.buttonStyle(PrimaryButtonStyle()).frame(maxWidth: 330)
            Spacer()
        }.padding(36)
    }

    private func levelUpCard(_ next: CEFRLevel) -> some View {
        VStack(spacing: 10) {
            Text("🎉 Уровень \(model.selectedLevel.rawValue) пройден полностью!").font(.headline.bold()).multilineTextAlignment(.center)
            Text("Ты отлично справляешься — можно переходить на \(next.rawValue).").font(.callout).foregroundStyle(.secondary).multilineTextAlignment(.center)
            Button("Перейти на уровень \(next.rawValue)") { model.advanceToSuggestedLevel() }
                .buttonStyle(PrimaryButtonStyle(color: CoachTheme.mint)).frame(maxWidth: 330)
        }
        .padding(18)
        .background(CoachTheme.mint.opacity(0.14), in: RoundedRectangle(cornerRadius: 18))
        .overlay(RoundedRectangle(cornerRadius: 18).stroke(CoachTheme.mint.opacity(0.45)))
    }

    private func metric(_ icon: String, _ value: String, _ label: String) -> some View { VStack { Image(systemName: icon).foregroundStyle(CoachTheme.accentColor); Text(value).font(.title.bold()); Text(label).font(.caption).foregroundStyle(.secondary) } }
}
