// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "EnglishCoach",
    platforms: [.macOS(.v14)],
    products: [
        .executable(name: "EnglishCoach", targets: ["EnglishCoachApp"]),
        .executable(name: "EnglishCoachCoreTests", targets: ["EnglishCoachCoreTests"])
    ],
    targets: [
        .target(name: "EnglishCoachCore", resources: [.process("Resources")]),
        .executableTarget(
            name: "EnglishCoachApp",
            dependencies: ["EnglishCoachCore"]
        ),
        .executableTarget(name: "EnglishCoachCoreTests", dependencies: ["EnglishCoachCore"])
    ]
)
