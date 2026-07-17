import SwiftUI
import EnglishCoachCore

struct SettingsView: View {
    @Environment(AppModel.self) private var model
    @State private var reminderError: String?
    var body: some View {
        VStack(spacing: 0) {
            HStack { Button { model.screen = .map } label: { Label("Назад", systemImage: "chevron.left") }; Spacer(); Text("Настройки").font(.title2.bold()); Spacer() }.padding(20)
            Form {
                Picker("Уровень", selection: Binding(get: { model.selectedLevel }, set: { value in model.selectLevel(value) })) { ForEach(CEFRLevel.allCases) { Text($0.rawValue).tag($0) } }
                Picker("Дневная цель", selection: Binding(get: { model.state.profile?.dailyGoalMinutes ?? 10 }, set: { value in model.updateGoal(value) })) { ForEach([5, 10, 15], id: \.self) { Text("\($0) минут").tag($0) } }
                Section("Напоминание") {
                    Toggle("Напоминать каждый день", isOn: Binding(
                        get: { model.state.profile?.remindersEnabled ?? false },
                        set: { enabled in updateReminder(enabled: enabled, hour: model.state.profile?.reminderHour ?? 19) }
                    ))
                    Picker("Время", selection: Binding(
                        get: { model.state.profile?.reminderHour ?? 19 },
                        set: { hour in updateReminder(enabled: model.state.profile?.remindersEnabled ?? false, hour: hour) }
                    )) {
                        ForEach(8...22, id: \.self) { hour in Text(String(format: "%02d:00", hour)).tag(hour) }
                    }.disabled(!(model.state.profile?.remindersEnabled ?? false))
                    if let reminderError { Text(reminderError).font(.caption).foregroundStyle(.orange) }
                }
                LabeledContent("Хранение") { Text("Только на этом Mac").foregroundStyle(.secondary) }
                LabeledContent("Сеть") { Text("Не используется").foregroundStyle(.secondary) }
            }.formStyle(.grouped).padding(20)
        }
    }

    private func updateReminder(enabled: Bool, hour: Int) {
        model.updateReminder(enabled: enabled, hour: hour)
        if enabled {
            Task {
                do { try await NotificationService.requestAndSchedule(hour: hour, minute: 0); reminderError = nil }
                catch { reminderError = "macOS не разрешила создать напоминание." }
            }
        } else {
            NotificationService.disable(); reminderError = nil
        }
    }
}
