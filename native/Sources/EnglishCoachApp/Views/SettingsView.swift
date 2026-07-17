import SwiftUI
import EnglishCoachCore

struct SettingsView: View {
    @Environment(AppModel.self) private var model
    var body: some View {
        VStack(spacing: 0) {
            HStack { Button { model.screen = .map } label: { Label("Назад", systemImage: "chevron.left") }; Spacer(); Text("Настройки").font(.title2.bold()); Spacer() }.padding(20)
            Form {
                Picker("Уровень", selection: Binding(get: { model.selectedLevel }, set: { value in model.selectLevel(value) })) { ForEach(CEFRLevel.allCases) { Text($0.rawValue).tag($0) } }
                Picker("Дневная цель", selection: Binding(get: { model.state.profile?.dailyGoalMinutes ?? 10 }, set: { value in model.updateGoal(value) })) { ForEach([5, 10, 15], id: \.self) { Text("\($0) минут").tag($0) } }
                LabeledContent("Хранение") { Text("Только на этом Mac").foregroundStyle(.secondary) }
                LabeledContent("Сеть") { Text("Не используется").foregroundStyle(.secondary) }
            }.formStyle(.grouped).padding(20)
        }
    }
}
