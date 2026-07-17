import SwiftUI

struct CompletionView: View {
    @Environment(AppModel.self) private var model
    var body: some View {
        VStack(spacing: 22) {
            Spacer()
            ZStack { Circle().fill(CoachTheme.amber.gradient).frame(width: 110, height: 110).shadow(color: CoachTheme.amber.opacity(0.35), radius: 22, y: 10); Image(systemName: "star.fill").font(.system(size: 50)).foregroundStyle(.white) }
            Text("Урок пройден!").font(.system(size: 34, weight: .black, design: .rounded))
            Text("Ты сделал ещё один реальный шаг в английском.").font(.title3).foregroundStyle(.secondary)
            HStack(spacing: 30) { metric("sparkles", "\(model.todayPoints)", "очков"); metric("flame.fill", "\(model.streak())", "дней подряд") }.padding(20).background(.white.opacity(0.8), in: RoundedRectangle(cornerRadius: 20))
            Button("Вернуться на карту") { model.closeLesson() }.buttonStyle(PrimaryButtonStyle()).frame(maxWidth: 330)
            Spacer()
        }.padding(36)
    }
    private func metric(_ icon: String, _ value: String, _ label: String) -> some View { VStack { Image(systemName: icon).foregroundStyle(CoachTheme.violet); Text(value).font(.title.bold()); Text(label).font(.caption).foregroundStyle(.secondary) } }
}
