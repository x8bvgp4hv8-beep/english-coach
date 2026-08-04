import SwiftUI
import EnglishCoachCore

struct SettingsView: View {
    @Environment(AppModel.self) private var model
    @State private var reminderError: String?
    @State private var showPlacement = false
    var body: some View {
        VStack(spacing: 0) {
            HStack { Button { model.screen = .map } label: { Label("Назад", systemImage: "chevron.left") }; Spacer(); Text("Настройки").font(.title2.bold()); Spacer() }.padding(20)
            Form {
                LabeledContent("Язык") {
                    Button(model.currentLanguage.title) { model.screen = .language }
                }
                Section("Оформление") {
                    // Swatches rather than names: the choice is made by eye.
                    HStack(spacing: 10) {
                        ForEach(ThemeID.allCases) { id in
                            themeCard(id)
                        }
                    }
                    .padding(.vertical, 4)
                }
                Picker("Уровень", selection: Binding(get: { model.selectedLevel }, set: { value in model.selectLevel(value) })) { ForEach(CEFRLevel.allCases) { Text($0.rawValue).tag($0) } }
                if model.hasPlacementTest {
                    LabeledContent("Тест на уровень") {
                        Button("Пройти заново") { model.startPlacement(); showPlacement = true }
                    }
                }
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
                LabeledContent("Всего очков") { Text("\(model.totalPoints)").foregroundStyle(.secondary) }
            }.formStyle(.grouped).padding(20)
        }
        .sheet(isPresented: $showPlacement) {
            PlacementSheet { model.cancelPlacement(); showPlacement = false }.environment(model)
        }
    }

    private func themeCard(_ id: ThemeID) -> some View {
        let palette = ThemePalette.of(id, language: model.language ?? .default)
        let chosen = model.themeID == id
        return Button { model.selectTheme(id) } label: {
            VStack(alignment: .leading, spacing: 6) {
                HStack(spacing: 0) {
                    palette.backgroundColors[0]
                    palette.cardFill
                    palette.buttonFill[0]
                }
                .frame(height: 30)
                .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
                .overlay(RoundedRectangle(cornerRadius: 8).stroke(CoachTheme.hairline))
                Text(id.title).font(.system(size: 12, weight: .semibold))
                Text(id.note).font(.system(size: 10)).foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }
            .padding(9)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(chosen ? CoachTheme.accentSoft : Color.clear, in: RoundedRectangle(cornerRadius: 12))
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(chosen ? CoachTheme.palette.accent : CoachTheme.hairline, lineWidth: chosen ? 2 : 1))
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }

    private func updateReminder(enabled: Bool, hour: Int) {
        model.updateReminder(enabled: enabled, hour: hour)
        if enabled {
            Task {
                do { try await NotificationService.requestAndSchedule(hour: hour, minute: 0, language: model.currentLanguage); reminderError = nil }
                catch { reminderError = "macOS не разрешила создать напоминание." }
            }
        } else {
            NotificationService.disable(); reminderError = nil
        }
    }
}
