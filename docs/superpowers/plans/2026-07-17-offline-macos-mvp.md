# English Coach Offline macOS MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and package a native, free, offline macOS menu-bar English trainer with levels A1–C1, a game-map course, deterministic exercises, local progress, reviews, and reminders.

**Architecture:** Add a standalone Swift Package in `native/` and preserve the existing private Python coach unchanged. SwiftUI owns the menu-bar and windows; typed domain modules load immutable JSON course packs and store user state through a small persistence interface backed by a local JSON file for a dependable command-line-tools build. The content schema stays platform-neutral for a future mobile client.

**Tech Stack:** Swift 6, SwiftUI, AppKit, UserNotifications, AVFoundation speech synthesis, Swift Package Manager, XCTest, shell packaging scripts.

---

## File map

- `native/Package.swift` — Swift package products, resources, and test targets.
- `native/Sources/EnglishCoachApp/EnglishCoachApp.swift` — app entry, menu-bar scene, window routing.
- `native/Sources/EnglishCoachApp/AppModel.swift` — observable application state and high-level actions.
- `native/Sources/EnglishCoachApp/Models.swift` — content and persisted-state value types.
- `native/Sources/EnglishCoachApp/ContentRepository.swift` — bundled JSON decoding, validation, indexing.
- `native/Sources/EnglishCoachApp/AnswerChecker.swift` — normalization and deterministic grading.
- `native/Sources/EnglishCoachApp/ProgressStore.swift` — local JSON persistence with atomic writes.
- `native/Sources/EnglishCoachApp/ReviewEngine.swift` — review creation and interval updates.
- `native/Sources/EnglishCoachApp/CourseRouting.swift` — lesson unlocks and recommended lesson.
- `native/Sources/EnglishCoachApp/NotificationService.swift` — notification permission and scheduling.
- `native/Sources/EnglishCoachApp/Views/` — focused SwiftUI screens, one file per screen/component.
- `native/Sources/EnglishCoachApp/Resources/Courses/*.json` — original starter packs A1–C1.
- `native/Tests/EnglishCoachAppTests/` — unit and integration tests.
- `scripts/build-macos-app.sh` — release build and `.app` assembly.
- `scripts/create-dmg.sh` — local `.dmg` packaging.
- `.gitignore` — excludes private recordings, database, caches, build products, and brainstorm artifacts.
- `README.md` — public product, install, build, privacy, and current limitations.
- `CONTRIBUTING.md` — course-pack contribution contract.

### Task 1: Public-repository safety and Swift package skeleton

**Files:**
- Create: `.gitignore`
- Create: `native/Package.swift`
- Create: `native/Sources/EnglishCoachApp/EnglishCoachApp.swift`
- Create: `native/Tests/EnglishCoachAppTests/SmokeTests.swift`

- [ ] **Step 1: Add a safety-first ignore file**

```gitignore
.DS_Store
.build/
native/.build/
build/
dist/
.swiftpm/
.superpowers/
__pycache__/
*.pyc
data/
config.json
*.wav
*.dmg
*.app/
```

- [ ] **Step 2: Write a failing package smoke test**

```swift
import XCTest
@testable import EnglishCoachApp

final class SmokeTests: XCTestCase {
    func testProductIdentity() {
        XCTAssertEqual(ProductInfo.name, "English Coach")
    }
}
```

- [ ] **Step 3: Run the test and verify the package does not exist yet**

Run: `cd native && swift test`

Expected: FAIL because `Package.swift` or `ProductInfo` does not exist.

- [ ] **Step 4: Create the package and minimal entry point**

```swift
// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "EnglishCoach",
    platforms: [.macOS(.v14)],
    products: [.executable(name: "EnglishCoach", targets: ["EnglishCoachApp"])],
    targets: [
        .executableTarget(name: "EnglishCoachApp", resources: [.process("Resources")]),
        .testTarget(name: "EnglishCoachAppTests", dependencies: ["EnglishCoachApp"])
    ]
)
```

```swift
import SwiftUI

enum ProductInfo { static let name = "English Coach" }

@main
struct EnglishCoachApp: App {
    var body: some Scene {
        WindowGroup { Text(ProductInfo.name) }
    }
}
```

- [ ] **Step 5: Run the test**

Run: `cd native && swift test`

Expected: PASS.

- [ ] **Step 6: Initialize Git without staging private user data**

Run: `git init && git add .gitignore native/Package.swift native/Sources/EnglishCoachApp/EnglishCoachApp.swift native/Tests/EnglishCoachAppTests/SmokeTests.swift docs/superpowers/specs docs/superpowers/plans && git status --short`

Expected: only the listed source/docs files are staged; `data/` and `config.json` are absent.

- [ ] **Step 7: Commit**

Run: `git commit -m "chore: scaffold native English Coach app"`

### Task 2: Typed content schema and validation

**Files:**
- Create: `native/Sources/EnglishCoachApp/Models.swift`
- Create: `native/Sources/EnglishCoachApp/ContentRepository.swift`
- Create: `native/Tests/EnglishCoachAppTests/ContentRepositoryTests.swift`
- Create: `native/Tests/EnglishCoachAppTests/Fixtures/valid-course.json`

- [ ] **Step 1: Write failing decoding and duplicate-ID tests**

```swift
import XCTest
@testable import EnglishCoachApp

final class ContentRepositoryTests: XCTestCase {
    func testDecodesValidCourse() throws {
        let data = try XCTUnwrap(Self.fixture("valid-course"))
        let course = try ContentRepository.decode(data)
        XCTAssertEqual(course.level, .a1)
        XCTAssertEqual(course.chapters.first?.lessons.first?.exercises.count, 2)
    }

    func testRejectsDuplicateExerciseIDs() throws {
        let data = #"{"schemaVersion":1,"level":"A1","chapters":[{"id":"c","title":"C","lessons":[{"id":"l","title":"L","exercises":[{"id":"same","type":"info","title":"One"},{"id":"same","type":"info","title":"Two"}]}]}]}"#.data(using: .utf8)!
        XCTAssertThrowsError(try ContentRepository.decode(data))
    }

    private static func fixture(_ name: String) -> Data? {
        let url = Bundle.module.url(forResource: name, withExtension: "json", subdirectory: "Fixtures")
        return url.flatMap { try? Data(contentsOf: $0) }
    }
}
```

- [ ] **Step 2: Run tests and verify failure**

Run: `cd native && swift test --filter ContentRepositoryTests`

Expected: FAIL because the model and repository types do not exist.

- [ ] **Step 3: Implement Codable value types**

```swift
enum CEFRLevel: String, Codable, CaseIterable, Identifiable {
    case a1 = "A1", a2 = "A2", b1 = "B1", b2 = "B2", c1 = "C1"
    var id: String { rawValue }
}

enum ExerciseType: String, Codable { case info, flashcard, translate, wordOrder = "word_order", multipleChoice = "multiple_choice" }

struct CoursePack: Codable, Identifiable {
    let schemaVersion: Int
    let level: CEFRLevel
    let chapters: [Chapter]
    var id: String { level.rawValue }
}

struct Chapter: Codable, Identifiable { let id: String; let title: String; let subtitle: String?; let lessons: [Lesson] }
struct Lesson: Codable, Identifiable { let id: String; let title: String; let summary: String; let estimatedMinutes: Int; let exercises: [Exercise] }
struct Exercise: Codable, Identifiable {
    let id: String
    let type: ExerciseType
    let title: String?
    let prompt: String?
    let canonicalAnswer: String?
    let acceptedAnswers: [String]?
    let hint: String?
    let explanation: String?
    let options: [String]?
    let correctOption: String?
    let tokens: [String]?
    let translation: String?
    let example: String?
}
```

- [ ] **Step 4: Implement repository validation**

```swift
enum ContentError: Error, Equatable { case unsupportedSchema(Int), emptyCourse, duplicateID(String), invalidExercise(String) }

enum ContentRepository {
    static func decode(_ data: Data) throws -> CoursePack {
        let course = try JSONDecoder().decode(CoursePack.self, from: data)
        guard course.schemaVersion == 1 else { throw ContentError.unsupportedSchema(course.schemaVersion) }
        guard !course.chapters.isEmpty else { throw ContentError.emptyCourse }
        var ids = Set<String>()
        for chapter in course.chapters {
            guard ids.insert(chapter.id).inserted else { throw ContentError.duplicateID(chapter.id) }
            for lesson in chapter.lessons {
                guard ids.insert(lesson.id).inserted else { throw ContentError.duplicateID(lesson.id) }
                for exercise in lesson.exercises {
                    guard ids.insert(exercise.id).inserted else { throw ContentError.duplicateID(exercise.id) }
                    if exercise.type == .translate && exercise.canonicalAnswer?.isEmpty != false {
                        throw ContentError.invalidExercise(exercise.id)
                    }
                }
            }
        }
        return course
    }
}
```

- [ ] **Step 5: Run tests and commit**

Run: `cd native && swift test --filter ContentRepositoryTests`

Expected: PASS.

Run: `git add native && git commit -m "feat: add validated course content schema"`

### Task 3: Deterministic answer checking

**Files:**
- Create: `native/Sources/EnglishCoachApp/AnswerChecker.swift`
- Create: `native/Tests/EnglishCoachAppTests/AnswerCheckerTests.swift`

- [ ] **Step 1: Write failing normalization tests**

```swift
final class AnswerCheckerTests: XCTestCase {
    func testIgnoresCaseSpacingApostropheAndTerminalPunctuation() {
        let result = AnswerChecker.check("  I DON’T   know! ", canonical: "I don't know", accepted: [])
        XCTAssertTrue(result.isCorrect)
    }

    func testAcceptsOnlyExplicitAlternative() {
        XCTAssertTrue(AnswerChecker.check("I have not seen it", canonical: "I haven't seen it", accepted: ["I have not seen it"]).isCorrect)
        XCTAssertFalse(AnswerChecker.check("Never saw it", canonical: "I haven't seen it", accepted: []).isCorrect)
    }
}
```

- [ ] **Step 2: Run tests and verify failure**

Run: `cd native && swift test --filter AnswerCheckerTests`

Expected: FAIL because `AnswerChecker` does not exist.

- [ ] **Step 3: Implement the checker**

```swift
struct AnswerResult: Equatable { let isCorrect: Bool; let canonical: String }

enum AnswerChecker {
    static func normalize(_ input: String) -> String {
        input.lowercased()
            .replacingOccurrences(of: "’", with: "'")
            .trimmingCharacters(in: .whitespacesAndNewlines.union(CharacterSet(charactersIn: ".!?")))
            .split(whereSeparator: { $0.isWhitespace })
            .joined(separator: " ")
    }

    static func check(_ answer: String, canonical: String, accepted: [String]) -> AnswerResult {
        let expected = ([canonical] + accepted).map(normalize)
        return AnswerResult(isCorrect: expected.contains(normalize(answer)), canonical: canonical)
    }
}
```

- [ ] **Step 4: Run tests and commit**

Run: `cd native && swift test --filter AnswerCheckerTests`

Expected: PASS.

Run: `git add native && git commit -m "feat: add offline answer checking"`

### Task 4: Local progress persistence

**Files:**
- Create: `native/Sources/EnglishCoachApp/ProgressStore.swift`
- Create: `native/Tests/EnglishCoachAppTests/ProgressStoreTests.swift`

- [ ] **Step 1: Write failing round-trip test**

```swift
final class ProgressStoreTests: XCTestCase {
    func testRoundTripPreservesProfilesAndProgressAcrossLevels() throws {
        let url = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        let store = ProgressStore(url: url)
        var state = UserState.fresh
        state.profile = .init(selectedLevel: .b1, dailyGoalMinutes: 10, reminderHour: 19, reminderMinute: 0, remindersEnabled: true)
        state.completedLessonIDs = ["a1-intro", "b1-experiences"]
        try store.save(state)
        XCTAssertEqual(try store.load(), state)
    }
}
```

- [ ] **Step 2: Run test and verify failure**

Run: `cd native && swift test --filter ProgressStoreTests`

Expected: FAIL because persisted-state types are missing.

- [ ] **Step 3: Add persisted models and atomic store**

```swift
struct UserProfile: Codable, Equatable {
    var selectedLevel: CEFRLevel
    var dailyGoalMinutes: Int
    var reminderHour: Int
    var reminderMinute: Int
    var remindersEnabled: Bool
}

struct AttemptRecord: Codable, Equatable, Identifiable { let id: UUID; let exerciseID: String; let correct: Bool; let date: Date }
struct ReviewItem: Codable, Equatable, Identifiable { let id: String; let exerciseID: String; var due: Date; var intervalDays: Int; var ease: Double; var repetitions: Int }
struct UserState: Codable, Equatable {
    var profile: UserProfile?
    var completedLessonIDs: Set<String>
    var attempts: [AttemptRecord]
    var reviews: [ReviewItem]
    var points: Int
    static let fresh = UserState(profile: nil, completedLessonIDs: [], attempts: [], reviews: [], points: 0)
}

struct ProgressStore {
    let url: URL
    func load() throws -> UserState {
        guard FileManager.default.fileExists(atPath: url.path) else { return .fresh }
        return try JSONDecoder.coach.decode(UserState.self, from: Data(contentsOf: url))
    }
    func save(_ state: UserState) throws {
        try FileManager.default.createDirectory(at: url.deletingLastPathComponent(), withIntermediateDirectories: true)
        try JSONEncoder.coach.encode(state).write(to: url, options: .atomic)
    }
}
```

- [ ] **Step 4: Run tests and commit**

Run: `cd native && swift test --filter ProgressStoreTests`

Expected: PASS.

Run: `git add native && git commit -m "feat: persist local learning progress"`

### Task 5: Course routing and spaced review

**Files:**
- Create: `native/Sources/EnglishCoachApp/CourseRouting.swift`
- Create: `native/Sources/EnglishCoachApp/ReviewEngine.swift`
- Create: `native/Tests/EnglishCoachAppTests/CourseRoutingTests.swift`
- Create: `native/Tests/EnglishCoachAppTests/ReviewEngineTests.swift`

- [ ] **Step 1: Write failing route and review tests**

```swift
func testNextLessonIsFirstIncompleteInSelectedLevel() {
    let lessons = [Lesson.stub(id: "one"), Lesson.stub(id: "two")]
    XCTAssertEqual(CourseRouting.nextLesson(in: lessons, completed: ["one"])?.id, "two")
}

func testReviewIntervalsAndFailureReset() {
    let now = Date(timeIntervalSince1970: 1_000)
    var item = ReviewEngine.newItem(exerciseID: "e", now: now)
    item = ReviewEngine.recordSuccess(item, now: now)
    XCTAssertEqual(item.intervalDays, 1)
    item = ReviewEngine.recordSuccess(item, now: now)
    XCTAssertEqual(item.intervalDays, 3)
    item = ReviewEngine.recordFailure(item, now: now)
    XCTAssertEqual(item.intervalDays, 1)
    XCTAssertEqual(item.repetitions, 0)
}
```

- [ ] **Step 2: Run tests and verify failure**

Run: `cd native && swift test --filter 'CourseRoutingTests|ReviewEngineTests'`

Expected: FAIL because both engines are missing.

- [ ] **Step 3: Implement pure routing and review functions**

```swift
enum CourseRouting {
    static func nextLesson(in lessons: [Lesson], completed: Set<String>) -> Lesson? {
        lessons.first { !completed.contains($0.id) }
    }
    static func isUnlocked(index: Int, lessons: [Lesson], completed: Set<String>) -> Bool {
        index == 0 || completed.contains(lessons[index - 1].id)
    }
}

enum ReviewEngine {
    static func newItem(exerciseID: String, now: Date) -> ReviewItem {
        .init(id: exerciseID, exerciseID: exerciseID, due: now, intervalDays: 0, ease: 2.3, repetitions: 0)
    }
    static func recordSuccess(_ source: ReviewItem, now: Date) -> ReviewItem {
        var item = source; item.repetitions += 1
        item.intervalDays = item.repetitions == 1 ? 1 : item.repetitions == 2 ? 3 : item.repetitions == 3 ? 7 : min(180, Int((Double(max(1, item.intervalDays)) * item.ease).rounded()))
        item.ease = min(3, item.ease + 0.05)
        item.due = Calendar.current.date(byAdding: .day, value: item.intervalDays, to: now)!
        return item
    }
    static func recordFailure(_ source: ReviewItem, now: Date) -> ReviewItem {
        var item = source; item.repetitions = 0; item.intervalDays = 1; item.ease = max(1.6, item.ease - 0.2)
        item.due = Calendar.current.date(byAdding: .day, value: 1, to: now)!
        return item
    }
}
```

- [ ] **Step 4: Run tests and commit**

Run: `cd native && swift test --filter 'CourseRoutingTests|ReviewEngineTests'`

Expected: PASS.

Run: `git add native && git commit -m "feat: add course routing and spaced review"`

### Task 6: Original starter content for A1–C1

**Files:**
- Create: `native/Sources/EnglishCoachApp/Resources/Courses/a1.json`
- Create: `native/Sources/EnglishCoachApp/Resources/Courses/a2.json`
- Create: `native/Sources/EnglishCoachApp/Resources/Courses/b1.json`
- Create: `native/Sources/EnglishCoachApp/Resources/Courses/b2.json`
- Create: `native/Sources/EnglishCoachApp/Resources/Courses/c1.json`
- Create: `native/Tests/EnglishCoachAppTests/BundledContentTests.swift`

- [ ] **Step 1: Write a failing all-level content test**

```swift
func testEveryLevelHasACompleteStarterChapter() throws {
    let courses = try ContentRepository.loadBundled()
    XCTAssertEqual(Set(courses.map(\.level)), Set(CEFRLevel.allCases))
    for course in courses {
        let exercises = course.chapters.flatMap(\.lessons).flatMap(\.exercises)
        XCTAssertTrue(Set(exercises.map(\.type)).isSuperset(of: [.info, .flashcard, .translate, .wordOrder, .multipleChoice]))
        XCTAssertGreaterThanOrEqual(exercises.count, 10)
    }
}
```

- [ ] **Step 2: Run test and verify failure**

Run: `cd native && swift test --filter BundledContentTests`

Expected: FAIL because no course packs exist.

- [ ] **Step 3: Add five original course packs**

Use the schema below for every level, with unique stable IDs and at least ten exercises. Replace the sample lesson topic as specified by the design; do not copy Dad English wording.

```json
{
  "schemaVersion": 1,
  "level": "A1",
  "chapters": [{
    "id": "a1-introductions",
    "title": "Hello!",
    "subtitle": "Introductions and the verb to be",
    "lessons": [{
      "id": "a1-introductions-01",
      "title": "Meet someone new",
      "summary": "Say who you are and ask simple questions.",
      "estimatedMinutes": 8,
      "exercises": [
        {"id":"a1-intro-info","type":"info","title":"I am, you are","explanation":"Use am after I and are after you, we, and they."},
        {"id":"a1-intro-card","type":"flashcard","prompt":"Nice to meet you.","translation":"Приятно познакомиться.","example":"Hi, I'm Anna. Nice to meet you."},
        {"id":"a1-intro-translate","type":"translate","prompt":"Я из Вильнюса.","canonicalAnswer":"I am from Vilnius.","acceptedAnswers":["I'm from Vilnius."],"hint":"I am / I'm"},
        {"id":"a1-intro-order","type":"word_order","prompt":"Как тебя зовут?","canonicalAnswer":"What is your name?","tokens":["your","What","name","is","?"]},
        {"id":"a1-intro-choice","type":"multiple_choice","prompt":"Choose: She ___ my sister.","options":["am","is","are"],"correctOption":"is"}
      ]
    }]
  }]
}
```

- [ ] **Step 4: Implement bundled loading and run validation**

```swift
static func loadBundled(bundle: Bundle = .module) throws -> [CoursePack] {
    let urls = bundle.urls(forResourcesWithExtension: "json", subdirectory: "Courses") ?? []
    return try urls.sorted { $0.lastPathComponent < $1.lastPathComponent }
        .map { try decode(Data(contentsOf: $0)) }
}
```

Run: `cd native && swift test --filter BundledContentTests`

Expected: PASS for all five levels and exercise-type coverage.

- [ ] **Step 5: Commit**

Run: `git add native && git commit -m "content: add original A1 to C1 starter chapters"`

### Task 7: App model and lesson state machine

**Files:**
- Create: `native/Sources/EnglishCoachApp/AppModel.swift`
- Create: `native/Tests/EnglishCoachAppTests/AppModelTests.swift`

- [ ] **Step 1: Write failing end-to-end lesson-state test**

```swift
@MainActor
func testWrongTranslationCreatesReviewAndCompletionPersists() throws {
    let store = InMemoryProgressStore()
    let model = AppModel(courses: [.fixtureA1], store: store)
    model.startLesson(.fixtureA1Lesson)
    model.submitText("wrong")
    XCTAssertEqual(model.feedback?.isCorrect, false)
    XCTAssertEqual(model.state.reviews.count, 1)
    model.continueLessonUntilCompleteForTesting()
    XCTAssertTrue(model.state.completedLessonIDs.contains("a1-introductions-01"))
}
```

- [ ] **Step 2: Run and verify failure**

Run: `cd native && swift test --filter AppModelTests`

Expected: FAIL because `AppModel` is missing.

- [ ] **Step 3: Implement observable state transitions**

`AppModel` must expose `courses`, `state`, `activeLesson`, `exerciseIndex`, `feedback`, `isOnboarding`, `dueReviews`, `recommendedLesson`, `startLesson`, `submitText`, `submitChoice`, `submitWordOrder`, `advance`, `finishLesson`, `selectLevel`, and `save`. Each submit method records an attempt, adds or updates a review on failure, awards 10 points on first-attempt success, and persists through a `ProgressStoring` protocol.

```swift
@MainActor
@Observable
final class AppModel {
    private(set) var courses: [CoursePack]
    private(set) var state: UserState
    var activeLesson: Lesson?
    var exerciseIndex = 0
    var feedback: AnswerResult?
    private let store: ProgressStoring

    var isOnboarding: Bool { state.profile == nil }
    var currentExercise: Exercise? { activeLesson?.exercises[safe: exerciseIndex] }

    func submitText(_ text: String) {
        guard let exercise = currentExercise, let canonical = exercise.canonicalAnswer else { return }
        let result = AnswerChecker.check(text, canonical: canonical, accepted: exercise.acceptedAnswers ?? [])
        record(exercise: exercise, result: result)
    }
}
```

- [ ] **Step 4: Run tests and commit**

Run: `cd native && swift test --filter AppModelTests`

Expected: PASS.

Run: `git add native && git commit -m "feat: add offline lesson state machine"`

### Task 8: Onboarding, game map, catalog, and settings UI

**Files:**
- Create: `native/Sources/EnglishCoachApp/Views/RootView.swift`
- Create: `native/Sources/EnglishCoachApp/Views/OnboardingView.swift`
- Create: `native/Sources/EnglishCoachApp/Views/CourseMapView.swift`
- Create: `native/Sources/EnglishCoachApp/Views/LessonNodeView.swift`
- Create: `native/Sources/EnglishCoachApp/Views/CatalogView.swift`
- Create: `native/Sources/EnglishCoachApp/Views/SettingsView.swift`
- Create: `native/Tests/EnglishCoachAppTests/ViewModelContractTests.swift`

- [ ] **Step 1: Write failing view-model contract tests**

```swift
@MainActor
func testChangingLevelKeepsCompletedLessons() {
    let model = AppModel.fixture(completed: ["a1-introductions-01"])
    model.selectLevel(.b2)
    XCTAssertEqual(model.state.profile?.selectedLevel, .b2)
    XCTAssertTrue(model.state.completedLessonIDs.contains("a1-introductions-01"))
}
```

- [ ] **Step 2: Run tests and verify failure**

Run: `cd native && swift test --filter ViewModelContractTests`

Expected: FAIL until level selection and settings state are implemented.

- [ ] **Step 3: Build the approved bright game map**

Use a vertical `ScrollView`, a soft blue-to-lilac background, alternating horizontal node offsets, connecting paths, and four node states. The current node uses amber, completed nodes violet, available nodes blue, and locked nodes gray. Add VoiceOver labels such as `"Daily routines, current lesson"` and honor `accessibilityReduceMotion`.

```swift
struct CourseMapView: View {
    @Environment(AppModel.self) private var model
    var body: some View {
        ScrollView {
            LazyVStack(spacing: 18) {
                ForEach(Array(model.currentLessons.enumerated()), id: \.element.id) { index, lesson in
                    LessonNodeView(lesson: lesson, state: model.nodeState(index: index))
                        .offset(x: index.isMultiple(of: 2) ? -46 : 46)
                        .onTapGesture { if model.canOpen(index: index) { model.startLesson(lesson) } }
                }
            }.padding(32)
        }
        .background(LinearGradient(colors: [.cyan.opacity(0.14), .purple.opacity(0.14)], startPoint: .topLeading, endPoint: .bottomTrailing))
    }
}
```

- [ ] **Step 4: Add onboarding, catalog, and settings**

Onboarding stores a level, daily goal, and optional reminder. Catalog groups lessons by level and chapter. Settings changes the same profile values without clearing `completedLessonIDs`, `attempts`, or `reviews`.

- [ ] **Step 5: Run tests and manual preview**

Run: `cd native && swift test`

Expected: all tests PASS.

Run: `cd native && swift run EnglishCoach`

Expected: onboarding appears on a clean state; selecting A1 opens the bright game map.

- [ ] **Step 6: Commit**

Run: `git add native && git commit -m "feat: add onboarding and game-map course UI"`

### Task 9: Exercise player and review UI

**Files:**
- Create: `native/Sources/EnglishCoachApp/Views/LessonPlayerView.swift`
- Create: `native/Sources/EnglishCoachApp/Views/ExerciseCardView.swift`
- Create: `native/Sources/EnglishCoachApp/Views/ReviewView.swift`
- Create: `native/Sources/EnglishCoachApp/Views/CompletionView.swift`
- Create: `native/Tests/EnglishCoachAppTests/LessonFlowTests.swift`

- [ ] **Step 1: Write failing mixed-lesson flow test**

```swift
@MainActor
func testMixedExerciseLessonCompletesAndAwardsPoints() {
    let model = AppModel.fixture(lesson: .allExerciseTypes)
    model.startLesson(.allExerciseTypes)
    model.completeCurrentCorrectlyForTesting()
    model.completeCurrentCorrectlyForTesting()
    model.completeCurrentCorrectlyForTesting()
    model.completeCurrentCorrectlyForTesting()
    model.completeCurrentCorrectlyForTesting()
    XCTAssertTrue(model.state.completedLessonIDs.contains(Lesson.allExerciseTypes.id))
    XCTAssertEqual(model.state.points, 50)
}
```

- [ ] **Step 2: Run and verify failure**

Run: `cd native && swift test --filter LessonFlowTests`

Expected: FAIL until every exercise type advances correctly.

- [ ] **Step 3: Implement the focus-card exercise UI**

Render one exercise at a time with a progress bar, large prompt, optional hint, and one primary button. Use `TextField` for translation, tappable tokens for word order, buttons for multiple choice, and reveal/continue controls for info and flashcards. Wrong feedback shows the canonical answer, permits one retry, and offers Continue.

- [ ] **Step 4: Implement review and completion views**

Review uses the same exercise card and filters `state.reviews` by `due <= now`. Completion shows points earned, current streak, and buttons for the map and next lesson.

- [ ] **Step 5: Run tests and manual flow**

Run: `cd native && swift test && swift run EnglishCoach`

Expected: tests PASS; a user can finish one lesson, see immediate feedback, and review a deliberate mistake.

- [ ] **Step 6: Commit**

Run: `git add native && git commit -m "feat: add lesson and spaced-review experience"`

### Task 10: Menu bar, reminders, audio, and lifecycle

**Files:**
- Modify: `native/Sources/EnglishCoachApp/EnglishCoachApp.swift`
- Create: `native/Sources/EnglishCoachApp/NotificationService.swift`
- Create: `native/Sources/EnglishCoachApp/SpeechService.swift`
- Create: `native/Sources/EnglishCoachApp/Views/MenuBarView.swift`
- Create: `native/Tests/EnglishCoachAppTests/NotificationServiceTests.swift`

- [ ] **Step 1: Write failing notification-content test**

```swift
func testReminderRequestUsesProfileTimeAndStableIdentifier() {
    let request = NotificationService.makeRequest(hour: 19, minute: 30)
    XCTAssertEqual(request.identifier, "daily-practice")
    let trigger = request.trigger as? UNCalendarNotificationTrigger
    XCTAssertEqual(trigger?.dateComponents.hour, 19)
    XCTAssertEqual(trigger?.dateComponents.minute, 30)
}
```

- [ ] **Step 2: Run and verify failure**

Run: `cd native && swift test --filter NotificationServiceTests`

Expected: FAIL because the notification service is missing.

- [ ] **Step 3: Implement reminders and on-device speech**

```swift
enum NotificationService {
    static func makeRequest(hour: Int, minute: Int) -> UNNotificationRequest {
        let content = UNMutableNotificationContent()
        content.title = "English Coach"
        content.body = "Пять минут английского — и сегодняшний шаг готов."
        content.sound = .default
        let trigger = UNCalendarNotificationTrigger(dateMatching: DateComponents(hour: hour, minute: minute), repeats: true)
        return UNNotificationRequest(identifier: "daily-practice", content: content, trigger: trigger)
    }
}

final class SpeechService {
    private let synthesizer = AVSpeechSynthesizer()
    func speak(_ text: String) {
        let utterance = AVSpeechUtterance(string: text)
        utterance.voice = AVSpeechSynthesisVoice(language: "en-GB")
        synthesizer.speak(utterance)
    }
}
```

- [ ] **Step 4: Replace the simple scene with `MenuBarExtra` plus a named window**

```swift
@main
struct EnglishCoachApp: App {
    @State private var model = AppModel.live()
    var body: some Scene {
        MenuBarExtra("English Coach", systemImage: "graduationcap.fill") {
            MenuBarView().environment(model)
        }
        Window("English Coach", id: "main") {
            RootView().environment(model).frame(minWidth: 520, minHeight: 650)
        }
        .windowResizability(.contentMinSize)
    }
}
```

- [ ] **Step 5: Run tests and lifecycle check**

Run: `cd native && swift test && swift run EnglishCoach`

Expected: menu-bar icon remains after closing the main window; Continue Lesson and Review open the named window; denied notifications do not block practice; example speech works offline.

- [ ] **Step 6: Commit**

Run: `git add native && git commit -m "feat: add menu bar reminders and offline speech"`

### Task 11: Packaging, documentation, and completion audit

**Files:**
- Create: `scripts/build-macos-app.sh`
- Create: `scripts/create-dmg.sh`
- Create: `native/Resources/Info.plist`
- Modify: `README.md`
- Create: `CONTRIBUTING.md`
- Create: `LICENSE`

- [ ] **Step 1: Write the app-bundle build script**

```bash
#!/bin/zsh
set -euo pipefail
repo_root="${0:A:h:h}"
cd "$repo_root/native"
swift build -c release
app="$repo_root/dist/English Coach.app"
mkdir -p "$app/Contents/MacOS" "$app/Contents/Resources"
cp .build/release/EnglishCoach "$app/Contents/MacOS/EnglishCoach"
cp "$repo_root/native/Resources/Info.plist" "$app/Contents/Info.plist"
codesign --force --deep --sign - "$app"
echo "$app"
```

- [ ] **Step 2: Add an Info.plist configured as an agent application**

Set `CFBundleIdentifier` to `com.kristian.englishcoach`, `CFBundleName` to `English Coach`, `CFBundleExecutable` to `EnglishCoach`, `CFBundlePackageType` to `APPL`, `LSMinimumSystemVersion` to `14.0`, and `LSUIElement` to `true`.

- [ ] **Step 3: Write the DMG script**

```bash
#!/bin/zsh
set -euo pipefail
repo_root="${0:A:h:h}"
"$repo_root/scripts/build-macos-app.sh"
mkdir -p "$repo_root/dist"
hdiutil create -volname "English Coach" -srcfolder "$repo_root/dist/English Coach.app" -ov -format UDZO "$repo_root/dist/English-Coach.dmg"
```

- [ ] **Step 4: Replace the README with public instructions**

Document the product promise, macOS 14+ requirement, privacy/offline guarantee, installation from `.dmg`, Gatekeeper caveat for ad-hoc signing, source build command, test command, content structure, private Python edition status, screenshots location, and limitations.

- [ ] **Step 5: Add contribution and license files**

Use the MIT license for source code. `CONTRIBUTING.md` must require original content, stable IDs, schema validation, accepted answer alternatives, and at least one exercise of each supported type per starter chapter.

- [ ] **Step 6: Run the complete automated verification**

Run: `cd native && swift test`

Expected: all unit, integration, and content-validation tests PASS.

- [ ] **Step 7: Build and inspect the distributable**

Run: `chmod +x scripts/build-macos-app.sh scripts/create-dmg.sh && scripts/create-dmg.sh && codesign --verify --deep --strict 'dist/English Coach.app' && plutil -lint 'dist/English Coach.app/Contents/Info.plist' && test -f dist/English-Coach.dmg`

Expected: commands exit 0; `.app` and `.dmg` exist.

- [ ] **Step 8: Perform the manual acceptance checklist**

On a clean temporary state path: launch the `.app`, complete onboarding for each of A1–C1, finish one full lesson offline, intentionally miss an answer and complete its review, quit and relaunch to verify persistence, switch levels and verify old progress remains, enable a reminder, and confirm there is no AI/API/account UI.

- [ ] **Step 9: Audit repository safety**

Run: `git status --short && git ls-files | rg '(^data/|config\.json$|\.wav$|coach\.db$)'`

Expected: working tree contains only intentional changes; the second command returns no files.

- [ ] **Step 10: Commit the release candidate**

Run: `git add README.md CONTRIBUTING.md LICENSE native scripts .gitignore && git commit -m "release: complete offline macOS MVP"`

