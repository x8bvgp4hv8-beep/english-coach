# English Coach Offline macOS MVP — Design

Date: 2026-07-17
Status: Approved by user

## 1. Product goal

Build a free, offline-first English-learning application for macOS that lives in the menu bar, requires no browser, account, subscription, API key, or AI service, and can be shared with family and friends as a normal application.

The product borrows Dad English's learning pattern—not its copyrighted content or assets: short explanations, active Russian-to-English recall, immediate checking, cards, spaced repetition, and visible progress.

The existing personal Python application remains available as a private edition with AI conversation. The public MVP is a new SwiftUI application with no AI dependency.

## 2. MVP boundaries

### Included

- Native macOS menu bar application built with SwiftUI.
- First-run onboarding with level selection: A1, A2, B1, B2, or C1.
- Daily-goal selection: 5, 10, or 15 minutes.
- Bright, friendly game-map interface.
- Recommended linear route through chapters and lessons.
- Catalog that allows opening any available topic.
- Lesson flow with theory, examples, cards, translation, word ordering, and multiple choice.
- Deterministic offline answer checking with accepted alternatives.
- Local progress, streak, points, mistakes, and spaced repetition.
- A small but complete starter chapter for every level A1–C1.
- All learning content bundled as reusable versioned JSON.
- Settings to change level and daily goal without deleting progress.
- Local notifications for daily practice.
- Repository documentation and a repeatable macOS build process.

### Excluded from the public MVP

- AI grading or generated exercises.
- Free-form voice conversation.
- Accounts, cloud sync, payments, subscriptions, or analytics.
- iPhone and Android applications.
- A complete multi-year curriculum for every level.
- App Store distribution and automatic updates.

The JSON content contract is intentionally platform-neutral so a future mobile client can consume the same course packs.

## 3. Experience and navigation

### Menu bar

Clicking the menu bar icon shows:

1. Continue lesson.
2. Review due items.
3. Open course map.
4. Today's progress, streak, and points.
5. Settings and Quit.

The main window is hidden rather than terminating when closed. The menu bar process remains active for reminders.

### Onboarding

The first launch asks for:

1. English level: A1–C1.
2. Daily goal: 5, 10, or 15 minutes.
3. Preferred reminder time, with notifications optional.

No account or personal data is requested.

### Course map

The home screen uses the approved bright, friendly game-map direction. Chapters form a vertical route. Each lesson node has one of four states: completed, current, available, or locked. The recommended next lesson has the strongest visual emphasis.

Users may open the catalog and jump to any bundled lesson. Completing an out-of-order lesson records progress but does not erase or unexpectedly move the recommended route.

### Exercise screen

The MVP uses the recommended focus-card layout: one large prompt, one clear action, visible lesson progress, optional hint, and immediate feedback. This layout fits a compact Mac window and translates naturally to a future phone UI.

## 4. Learning model

Every starter chapter contains at least:

- one short theory lesson;
- one example-card block;
- one active practice block;
- one mixed checkpoint;
- review items generated from mistakes.

Supported MVP exercise types:

1. `info` — short explanation and examples.
2. `flashcard` — phrase, translation, and optional example.
3. `translate` — Russian-to-English typed recall.
4. `word_order` — arrange tokens into a sentence.
5. `multiple_choice` — choose one answer.

Typed answers are normalized for case, surrounding whitespace, repeated spaces, straight/curly apostrophes, and terminal punctuation. Every translation exercise includes one canonical answer and may include explicit accepted alternatives. The checker never invents equivalence; uncertain answers are marked wrong and the canonical answer is shown.

On a wrong answer, the user may retry once or continue. The canonical phrase is added to review. On a correct answer, the application gives concise positive feedback and advances.

## 5. Starter content

The MVP ships one complete chapter for each selectable level:

- A1: Introductions and `to be`.
- A2: Daily routines and Present Simple.
- B1: Experiences and Present Perfect.
- B2: Opinions, nuance, and linking ideas.
- C1: Hedging and precise professional communication.

Each chapter should demonstrate the entire learning loop rather than provide a large shallow exercise dump. Additional content can be added later without application code changes.

Content must be original. Dad English text, exercise databases, artwork, audio, branding, and private screens must not be copied.

## 6. Architecture

### Application modules

- `AppShell`: menu bar lifecycle, windows, and commands.
- `Onboarding`: first-run preferences.
- `CourseMap`: recommended route and catalog entry.
- `LessonPlayer`: exercise sequencing and UI state.
- `AnswerChecker`: deterministic answer normalization and validation.
- `ReviewEngine`: spaced repetition scheduling.
- `ProgressStore`: local persistence and migrations.
- `ContentKit`: decoding, validating, and indexing bundled course packs.
- `Notifications`: local practice reminders.

Each module exposes typed Swift interfaces. Views do not decode JSON or query storage directly.

### Persistence

User state is stored locally with SwiftData. Core entities:

- `UserProfile`: selected level, daily goal, reminder preference.
- `LessonProgress`: lesson ID, state, score, completion timestamp.
- `ExerciseAttempt`: exercise ID, result, attempts, timestamp.
- `ReviewItem`: stable content ID, due date, interval, ease, repetitions.
- `DailyActivity`: date, minutes, completed exercises, points.

Learning content is immutable bundled JSON, identified by stable IDs and a schema version. User records refer to content IDs and never duplicate entire lessons.

### Data flow

1. `ContentKit` validates and indexes course packs at launch.
2. `ProgressStore` loads profile and progress.
3. `CourseMap` combines content metadata with progress to select the next lesson.
4. `LessonPlayer` requests one typed exercise at a time.
5. `AnswerChecker` returns correct/incorrect plus the canonical response.
6. The attempt is persisted; mistakes are scheduled by `ReviewEngine`.
7. Completion updates the route, points, streak, and menu bar summary.

No network request occurs in the public MVP.

## 7. Review scheduling

The MVP uses a transparent SM-2-inspired schedule:

- first miss: due today until answered correctly, then tomorrow;
- first successful review: 1 day;
- second: 3 days;
- third: 7 days;
- later: interval multiplied by ease, with a safe upper bound.

A failed review resets the interval to 1 day and reduces ease. Review history remains local.

## 8. Visual direction

- Bright, friendly game aesthetic selected by the user.
- Soft gradients, rounded lesson nodes, clear progress paths, and celebratory but restrained motion.
- Friendly to adults and children; avoid cartoon mascots and childish copy in the MVP.
- System typography and native controls where practical.
- Full keyboard navigation, VoiceOver labels, reduced-motion support, and sufficient contrast.
- Light appearance is primary for MVP; dark mode may follow if it risks the schedule.

## 9. Error handling

- Invalid bundled content is detected by a validation test and again at startup. The app skips an invalid pack, shows a readable local error, and keeps other levels usable.
- Persistence failures show a non-destructive error and keep the current lesson in memory so an answer is not lost immediately.
- Notification denial does not block onboarding or practice.
- Missing optional audio falls back to on-device speech synthesis.
- If the selected level has no valid content, the app opens the catalog of available levels and explains the issue.

## 10. Testing and MVP acceptance

### Automated

- Unit tests for answer normalization and accepted alternatives.
- Unit tests for route unlocking and recommended-next-lesson logic.
- Unit tests for SRS intervals and failure resets.
- Content-schema validation for every bundled JSON file.
- Persistence round-trip and migration tests.
- UI smoke tests for onboarding, completing a lesson, and completing a review.

### Manual acceptance

The MVP is complete when a clean macOS user can:

1. Build or install the application using documented steps.
2. Launch it from Applications and see the menu bar icon.
3. Select any level A1–C1 without an account or API key.
4. Complete a starter lesson entirely offline.
5. Receive immediate deterministic feedback.
6. Close and reopen the app without losing progress.
7. See a mistake appear in review and complete that review.
8. Change level and return without losing earlier progress.
9. Enable a local reminder.
10. Use the public build without the private AI conversation module.

## 11. Distribution

The repository will contain source, original starter content, tests, build instructions, contribution guidance for new content packs, and license files. A release build can be packaged as a `.dmg`. Unsigned builds may trigger Gatekeeper; code signing and notarization are follow-up distribution work unless credentials are provided.

The current directory is not a Git repository, so committing and publishing to GitHub is not part of the design-document step. Repository initialization should occur during implementation only after confirming which existing local files belong in the public project.
