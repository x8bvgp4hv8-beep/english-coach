import AVFoundation
import SwiftUI
import EnglishCoachCore

struct SettingsView: View {
    @Environment(AppModel.self) private var model
    @State private var reminderError: String?
    @State private var showPlacement = false
    /// What the system actually has queued. The stored flag is a wish; this is the fact.
    @State private var reminderPending: String?
    @State private var voiceIdentifier: String?
    @State private var speech = SpeechService()
    var body: some View {
        VStack(spacing: 0) {
            HStack { Button { model.screen = .map } label: { Label("Назад", systemImage: "chevron.left") }; Spacer(); Text("Настройки").font(.title2.bold()); Spacer() }.padding(20)
            Form {
                LabeledContent("Язык") {
                    Button(model.currentLanguage.title) { model.screen = .language }
                }
                Section("Голос") {
                    // Качество тут решает всё: macOS ставит облегчённый голос, он и звучит
                    // роботом, а улучшенный и премиум — отдельная загрузка. Раз приложение
                    // не может её сделать за пользователя, оно хотя бы честно показывает,
                    // с чем работает.
                    Picker("Читает", selection: Binding(
                        get: { voiceIdentifier ?? SpeechService.activeVoice()?.identifier ?? "" },
                        set: { identifier in
                            let voice = SpeechService.voices(for: model.currentLanguage)
                                .first { $0.identifier == identifier }
                            SpeechService.choose(voice, for: model.currentLanguage.code)
                            voiceIdentifier = identifier
                            if let voice { speech.speak(model.currentLanguage.greeting, voice: voice) }
                        }
                    )) {
                        ForEach(SpeechService.voices(for: model.currentLanguage), id: \.identifier) { voice in
                            Text("\(voice.name) — \(SpeechService.quality(voice))").tag(voice.identifier)
                        }
                    }
                    if SpeechService.voices(for: model.currentLanguage).allSatisfy({ $0.quality == .default }) {
                        Text("Все голоса этого языка — облегчённые, поэтому звучат механически. Живой голос скачивается один раз: Системные настройки → Универсальный доступ → Устная речь → Системный голос → «Управление голосами», там выбрать вариант Enhanced или Premium.")
                            .font(.caption).foregroundStyle(.secondary).fixedSize(horizontal: false, vertical: true)
                    }
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
                    LabeledContent("Запланировано") {
                        Text(reminderPending ?? "ничего").foregroundStyle(.secondary)
                    }
                    if let reminderError { Text(reminderError).font(.caption).foregroundStyle(.orange) }
                }
                LabeledContent("Всего очков") { Text("\(model.totalPoints)").foregroundStyle(.secondary) }
            }.formStyle(.grouped).padding(20)
        }
        .sheet(isPresented: $showPlacement) {
            PlacementSheet { model.cancelPlacement(); showPlacement = false }.environment(model)
        }
        .task { reminderPending = await NotificationService.pendingSummary() }
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
        guard enabled else {
            NotificationService.disable()
            reminderError = nil
            reminderPending = nil
            return
        }
        Task {
            do {
                try await NotificationService.requestAndSchedule(hour: hour, minute: 0, language: model.currentLanguage)
                reminderError = nil
            } catch {
                // A refusal used to be swallowed: the switch stayed on and nothing was
                // ever scheduled. Now it goes back off, so "включено" keeps its meaning.
                model.updateReminder(enabled: false, hour: hour)
                reminderError = error.localizedDescription
            }
            reminderPending = await NotificationService.pendingSummary()
        }
    }
}
