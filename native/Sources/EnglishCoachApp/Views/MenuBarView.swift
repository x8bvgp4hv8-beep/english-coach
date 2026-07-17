import SwiftUI

struct MenuBarView: View {
    @Environment(AppModel.self) private var model
    @Environment(\.openWindow) private var openWindow
    var body: some View {
        Button { if let lesson = model.recommendedLesson { model.startLesson(lesson) }; openWindow(id: "main") } label: { Label("Продолжить урок", systemImage: "play.fill") }
        Button { model.startReview(); openWindow(id: "main") } label: { Label("Повторить сегодня (\(model.dueCount))", systemImage: "arrow.triangle.2.circlepath") }.disabled(model.dueCount == 0)
        Button { model.screen = .map; openWindow(id: "main") } label: { Label("Открыть карту", systemImage: "map.fill") }
        Divider()
        Text("🔥 \(model.streak()) дней  ·  ✦ \(model.todayPoints) очков")
        Divider()
        Button("Настройки") { model.screen = .settings; openWindow(id: "main") }
        Button("Выйти") { NSApplication.shared.terminate(nil) }.keyboardShortcut("q")
    }
}
