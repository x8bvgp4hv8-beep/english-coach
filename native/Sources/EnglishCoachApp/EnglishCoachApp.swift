import SwiftUI

enum ProductInfo {
    static let name = "English Coach"
}

@main
struct EnglishCoachApp: App {
    var body: some Scene {
        WindowGroup {
            Text(ProductInfo.name)
        }
    }
}
