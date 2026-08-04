import SwiftUI

struct RootView: View {
    @Environment(AppModel.self) private var model
    var body: some View {
        ZStack {
            CoachTheme.background.ignoresSafeArea()
            // The picker outranks everything: it is the first screen, and it stays
            // reachable from onboarding and settings alike.
            if !model.languageChosen {
                LanguagePickerView()
            } else if model.screen == .language {
                LanguagePickerView(back: { model.screen = .map })
            } else if let error = model.startupError {
                ContentUnavailableView("Материалы не загрузились", systemImage: "exclamationmark.triangle", description: Text(error)).padding(40)
            } else if model.isOnboarding {
                OnboardingView()
            } else if model.shadowingActive {
                ShadowingView()
            } else if model.listeningActive {
                ListeningView()
            } else if model.activeLesson != nil {
                LessonPlayerView()
            } else {
                switch model.screen {
                case .map: CourseMapView()
                case .catalog: CatalogView()
                case .settings: SettingsView()
                case .topics: TopicsView()
                case .language: LanguagePickerView(back: { model.screen = .map })
                }
            }
        }
        // System controls and `.secondary` text must match the chosen theme, not the
        // system setting: a light palette in Dark Mode gives light-grey-on-light text.
        .preferredColorScheme(CoachTheme.colorScheme)
        // `CoachTheme` is read inside every body, so switching a theme has to rebuild
        // the tree rather than wait for some observed property to change. The language
        // repaints the same palette, so it belongs in the identity too. The rebuild must
        // not animate: an identity swap keeps the old tree alive for the length of the
        // transition, and the two copies draw over each other as doubled text.
        .id("\(model.themeID.rawValue)-\(model.language?.rawValue ?? "none")")
        .transaction { $0.animation = nil }
        .foregroundStyle(CoachTheme.ink)
        .alert("Прогресс не сохранён", isPresented: Binding(get: { model.transientError != nil }, set: { if !$0 { model.transientError = nil } })) {
            Button("Понятно", role: .cancel) {}
        } message: { Text(model.transientError ?? "") }
    }
}
