import SwiftUI
import EnglishCoachCore

struct CourseMapView: View {
    @Environment(AppModel.self) private var model
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        VStack(spacing: 0) {
            header
            levelProgressBar
            ScrollView {
                VStack(spacing: 16) {
                    if let next = model.suggestedNextLevel { levelUpCard(next) }
                    ForEach(model.selectedCourse?.chapters ?? []) { chapter in
                        chapterHeader(chapter)
                        ForEach(chapter.lessons) { lesson in
                            let index = globalIndex(of: lesson)
                            if index > 0 { dottedPath }
                            LessonNodeView(lesson: lesson, state: nodeState(index, lesson))
                                .offset(x: index.isMultiple(of: 2) ? -58 : 58)
                                .onTapGesture { if model.nodeIsUnlocked(index) { model.startLesson(lesson) } }
                                .animation(reduceMotion ? nil : .spring(response: 0.45, dampingFraction: 0.7), value: model.state.completedLessonIDs)
                        }
                    }
                    Button("Открыть каталог") { model.screen = .catalog }.buttonStyle(.bordered).padding(.top, 20)
                }.padding(.vertical, 24).padding(.horizontal, 44)
            }
        }
    }

    private func globalIndex(of lesson: Lesson) -> Int { model.currentLessons.firstIndex { $0.id == lesson.id } ?? 0 }

    private func chapterHeader(_ chapter: Chapter) -> some View {
        VStack(spacing: 2) {
            Text(chapter.title).font(.system(size: 24, weight: .black, design: .rounded))
            if let subtitle = chapter.subtitle { Text(subtitle).font(.callout).foregroundStyle(.secondary).multilineTextAlignment(.center) }
        }.padding(.top, 12)
    }

    private var header: some View {
        HStack(spacing: 14) {
            VStack(alignment: .leading, spacing: 2) {
                Text("ENGLISH COACH").font(.caption2.weight(.black)).foregroundStyle(CoachTheme.violet)
                Text("Твой маршрут").font(.title2.weight(.black))
            }
            Spacer()
            stat("flame.fill", "\(model.streak())", .orange)
            stat("sparkles", "\(model.totalPoints)", CoachTheme.violet)
            Menu {
                ForEach(CEFRLevel.allCases) { level in Button(level.rawValue) { model.selectLevel(level) } }
            } label: { Text(model.selectedLevel.rawValue).font(.headline.bold()).padding(.horizontal, 12).padding(.vertical, 8).background(.white.opacity(0.78), in: Capsule()) }
            Button { model.screen = .settings } label: { Image(systemName: "gearshape.fill") }.buttonStyle(.plain)
        }.padding(20).background(.white.opacity(0.55))
    }

    private var levelProgressBar: some View {
        let progress = model.currentLevelProgress
        return VStack(spacing: 6) {
            HStack {
                Text("Уровень \(model.selectedLevel.rawValue)").font(.subheadline.weight(.bold))
                Spacer()
                Text("\(Int((progress * 100).rounded()))%").font(.subheadline.monospacedDigit().weight(.semibold)).foregroundStyle(.secondary)
            }
            ProgressView(value: progress).tint(CoachTheme.violet)
            dailyGoalRow
        }.padding(.horizontal, 20).padding(.vertical, 10).background(.white.opacity(0.4))
    }

    private var dailyGoalRow: some View {
        HStack(spacing: 8) {
            Image(systemName: model.dailyGoalReached ? "checkmark.circle.fill" : "target")
                .foregroundStyle(model.dailyGoalReached ? CoachTheme.mint : CoachTheme.amber)
            Text(model.dailyGoalReached
                 ? "Цель дня выполнена: \(model.todayPracticeMinutes) мин"
                 : "Цель дня: \(model.todayPracticeMinutes) из \(model.dailyGoalMinutes) мин")
                .font(.caption.weight(.medium)).foregroundStyle(.secondary)
            Spacer()
            ProgressView(value: model.dailyGoalProgress)
                .tint(model.dailyGoalReached ? CoachTheme.mint : CoachTheme.amber)
                .frame(width: 90)
        }.padding(.top, 2)
    }

    private func levelUpCard(_ next: CEFRLevel) -> some View {
        VStack(spacing: 12) {
            Text("🎉 Уровень \(model.selectedLevel.rawValue) пройден!").font(.headline.bold())
            Text("Ты отлично справляешься. Готов перейти на уровень \(next.rawValue)?").multilineTextAlignment(.center).foregroundStyle(.secondary)
            HStack(spacing: 12) {
                Button("Позже") { withAnimation { model.dismissLevelUp() } }.buttonStyle(.bordered)
                Button("Перейти на \(next.rawValue)") { withAnimation { model.advanceToSuggestedLevel() } }.buttonStyle(PrimaryButtonStyle(color: CoachTheme.mint))
            }
        }
        .padding(20)
        .background(CoachTheme.mint.opacity(0.14), in: RoundedRectangle(cornerRadius: 20))
        .overlay(RoundedRectangle(cornerRadius: 20).stroke(CoachTheme.mint.opacity(0.45)))
    }

    private func stat(_ icon: String, _ text: String, _ color: Color) -> some View {
        HStack(spacing: 5) { Image(systemName: icon).foregroundStyle(color); Text(text).font(.headline.monospacedDigit()) }
    }
    private var dottedPath: some View { Capsule().fill(CoachTheme.violet.opacity(0.25)).frame(width: 4, height: 25) }
    private func nodeState(_ index: Int, _ lesson: Lesson) -> LessonNodeView.State {
        if model.state.completedLessonIDs.contains(lesson.id) { return .completed }
        if model.recommendedLesson?.id == lesson.id { return .current }
        return model.nodeIsUnlocked(index) ? .available : .locked
    }
}

struct LessonNodeView: View {
    enum State { case completed, current, available, locked }
    let lesson: Lesson
    let state: State
    private var color: Color { switch state { case .completed: CoachTheme.violet; case .current: CoachTheme.amber; case .available: CoachTheme.blue; case .locked: .gray.opacity(0.55) } }
    private var icon: String { switch state { case .completed: "checkmark"; case .current: "play.fill"; case .available: "book.fill"; case .locked: "lock.fill" } }
    var body: some View {
        VStack(spacing: 8) {
            ZStack {
                Circle().fill(color.gradient).frame(width: state == .current ? 82 : 68, height: state == .current ? 82 : 68)
                    .shadow(color: color.opacity(0.32), radius: 10, y: 7)
                Image(systemName: icon).font(.title2.bold()).foregroundStyle(.white)
            }
            Text(lesson.title).font(.headline.weight(.bold))
            Text("\(lesson.estimatedMinutes) мин").font(.caption).foregroundStyle(.secondary)
        }.padding(.vertical, 8).contentShape(Rectangle())
            .accessibilityElement(children: .combine).accessibilityLabel("\(lesson.title), \(accessibilityState)")
    }
    private var accessibilityState: String { switch state { case .completed: "пройдено"; case .current: "текущий урок"; case .available: "доступно"; case .locked: "закрыто" } }
}
