import AppKit
import SwiftUI

struct MenuBarView: View {
    @Environment(AppModel.self) private var model
    @Environment(\.openWindow) private var openWindow
    var body: some View {
        Button {
            // Never restart a lesson that is already open — that would drop its progress.
            if !model.isOnboarding, model.activeLesson == nil, let lesson = model.recommendedLesson { model.startLesson(lesson) }
            show()
        } label: { Label(model.isOnboarding ? "Начать обучение" : "Продолжить урок", systemImage: "play.fill") }
        Button { model.startReview(); show() } label: { Label("Повторить сегодня (\(model.dueCount))", systemImage: "arrow.triangle.2.circlepath") }.disabled(model.dueCount == 0)
        Button { model.screen = .map; show() } label: { Label("Открыть карту", systemImage: "map.fill") }
        Divider()
        Text("🔥 \(model.streak()) дней  ·  ✦ \(model.totalPoints) очков")
        Divider()
        Button("Настройки") { model.screen = .settings; show() }
        Button("Выйти") { NSApplication.shared.terminate(nil) }.keyboardShortcut("q")
    }

    /// Opens the learning window and pulls it in front — without this the window
    /// appears behind whatever the user is working in.
    private func show() {
        openWindow(id: "main")
        NSApp.activate(ignoringOtherApps: true)
    }
}
