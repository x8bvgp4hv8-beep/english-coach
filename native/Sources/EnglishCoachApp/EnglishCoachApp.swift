import AppKit
import SwiftUI
import EnglishCoachCore

@main
struct EnglishCoachApp: App {
    @State private var model = AppModel.live()
    @NSApplicationDelegateAdaptor(AppDelegate.self) private var delegate

    var body: some Scene {
        // The window scene comes first so macOS opens the learning window on launch.
        // With the menu bar scene first the app started invisibly: only the status item appeared.
        WindowGroup(ProductInfo.name, id: "main") {
            RootView().environment(model).frame(minWidth: 520, minHeight: 650)
        }
        .defaultSize(width: 580, height: 720)
        .windowResizability(.contentMinSize)

        MenuBarExtra(ProductInfo.name, systemImage: "graduationcap.fill") {
            MenuBarView().environment(model)
        }
    }
}

final class AppDelegate: NSObject, NSApplicationDelegate {
    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.activate(ignoringOtherApps: true)
    }

    /// Clicking the Dock icon after the window was closed brings the learning window back.
    func applicationShouldHandleReopen(_ sender: NSApplication, hasVisibleWindows flag: Bool) -> Bool {
        if !flag { NSApp.windows.first { $0.canBecomeMain }?.makeKeyAndOrderFront(nil) }
        NSApp.activate(ignoringOtherApps: true)
        return true
    }
}
