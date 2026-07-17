// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "EnglishCoach",
    platforms: [.macOS(.v14)],
    products: [.executable(name: "EnglishCoach", targets: ["EnglishCoachApp"])],
    targets: [
        .executableTarget(
            name: "EnglishCoachApp",
            resources: [.process("Resources")]
        ),
        .testTarget(
            name: "EnglishCoachAppTests",
            dependencies: ["EnglishCoachApp"]
        )
    ]
)
