import SwiftUI

struct RootView: View {
    @Environment(AppModel.self) private var model
    var body: some View {
        ZStack {
            CoachTheme.background.ignoresSafeArea()
            if let error = model.startupError {
                ContentUnavailableView("Материалы не загрузились", systemImage: "exclamationmark.triangle", description: Text(error)).padding(40)
            } else if model.isOnboarding {
                OnboardingView()
            } else if model.activeLesson != nil {
                LessonPlayerView()
            } else {
                switch model.screen {
                case .map: CourseMapView()
                case .catalog: CatalogView()
                case .settings: SettingsView()
                }
            }
        }
        // The palette is a fixed light one, so system controls and `.secondary` text
        // must stay light too — otherwise they turn light-grey-on-light in Dark Mode.
        .preferredColorScheme(.light)
        .foregroundStyle(CoachTheme.ink)
        .alert("Прогресс не сохранён", isPresented: Binding(get: { model.transientError != nil }, set: { if !$0 { model.transientError = nil } })) {
            Button("Понятно", role: .cancel) {}
        } message: { Text(model.transientError ?? "") }
    }
}
