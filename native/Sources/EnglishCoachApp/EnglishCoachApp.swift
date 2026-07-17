import SwiftUI
import EnglishCoachCore

@main
struct EnglishCoachApp: App {
    @State private var model = AppModel.live()
    var body: some Scene {
        MenuBarExtra(ProductInfo.name, systemImage: "graduationcap.fill") {
            MenuBarView().environment(model)
        }
        Window(ProductInfo.name, id: "main") {
            RootView().environment(model).frame(minWidth: 520, minHeight: 650)
        }
        .defaultSize(width: 580, height: 720)
        .windowResizability(.contentMinSize)
    }
}
