import AppKit
import SwiftUI
import EnglishCoachCore

@main
struct EnglishCoachApp: App {
    @State private var model = AppModel.live()
    @NSApplicationDelegateAdaptor(AppDelegate.self) private var delegate

    var body: some Scene {
        // The window scene comes first so macOS opens the learning window on launch: with the
        // menu bar scene first the app started invisibly, with only the status item.
        // `Window`, not `WindowGroup`: this app has exactly one window, and a group opens a
        // second copy every time something asks for it.
        Window(ProductInfo.name, id: "main") {
            RootView().environment(model).windowReopener().frame(minWidth: 520, minHeight: 650)
        }
        .defaultSize(width: 580, height: 720)
        .windowResizability(.contentMinSize)

        MenuBarExtra(ProductInfo.name, systemImage: "graduationcap.fill") {
            MenuBarView().environment(model)
        }
    }
}

/// Closing the window destroys it, and AppKit then has nothing to bring back: clicking the
/// Dock icon did nothing while the app kept running. Only SwiftUI can open a WindowGroup
/// window, so the action is captured from a live view and reused later.
@MainActor
final class MainWindow {
    static let shared = MainWindow()
    var open: (() -> Void)?
}

private struct WindowReopener: ViewModifier {
    @Environment(\.openWindow) private var openWindow

    func body(content: Content) -> some View {
        content.onAppear { MainWindow.shared.open = { openWindow(id: "main") } }
    }
}

extension View {
    func windowReopener() -> some View { modifier(WindowReopener()) }
}

final class AppDelegate: NSObject, NSApplicationDelegate {
    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.activate(ignoringOtherApps: true)
        // Without this the banner is dropped whenever the app is in front, and a working
        // reminder looks broken to anyone testing it with the window open.
        NotificationPresenter.shared.install()
    }

    /// Clicking the Dock icon after the window was closed brings the learning window back.
    func applicationShouldHandleReopen(_ sender: NSApplication, hasVisibleWindows flag: Bool) -> Bool {
        if !flag {
            if let existing = NSApp.windows.first(where: { $0.canBecomeMain }) {
                existing.makeKeyAndOrderFront(nil)
            } else {
                MainWindow.shared.open?()
            }
        }
        NSApp.activate(ignoringOtherApps: true)
        return true
    }
}
