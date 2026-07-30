import SwiftUI
import EnglishCoachCore

struct CourseMapView: View {
    @Environment(AppModel.self) private var model

    var body: some View {
        VStack(spacing: 0) {
            header
            ScrollView {
                LazyVStack(alignment: .leading, spacing: 0) {
                    if let next = model.suggestedNextLevel { levelUpCard(next) }
                    sectionTitle("Сегодня")
                    continueCard
                    if model.dueCount > 0 { reviewCard }
                    if !model.weakTopics.isEmpty {
                        sectionTitle("Что проседает", hint: "Считается по твоим ответам, а не по пройденным урокам")
                        ForEach(model.weakTopics.prefix(3)) { item in
                            ActionCard(
                                icon: "target",
                                iconColor: CoachTheme.coral,
                                kicker: "\(Int((item.accuracy * 100).rounded()))% ВЕРНЫХ",
                                title: item.topic.title,
                                subtitle: "\(item.correct) из \(item.attempts) · нажми, чтобы потренировать",
                                action: { model.startTopicPractice(item.topic.id) }
                            ).padding(.top, 10)
                        }
                    }
                    if model.practiceIsAvailable {
                        sectionTitle("Виды заданий", hint: "Можно тренировать отдельно, сколько угодно раз")
                        practiceKinds
                    }
                    grammarLink
                    sectionTitle("Маршрут \(model.selectedLevel.rawValue)", hint: "Уроки идут по порядку: правило, новые фразы, упражнения")
                    ForEach(Array(chapters.enumerated()), id: \.element.id) { number, chapter in
                        chapterSection(number: number + 1, chapter: chapter)
                    }
                    catalogLink
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 30)
            }
        }
    }

    private var chapters: [Chapter] { model.selectedCourse?.chapters ?? [] }

    // MARK: - Header

    private var header: some View {
        VStack(spacing: 14) {
            HStack(alignment: .center, spacing: 10) {
                VStack(alignment: .leading, spacing: 1) {
                    Text("ENGLISH COACH").font(.system(size: 10, weight: .black)).tracking(1.4).foregroundStyle(CoachTheme.accentColor.opacity(0.75))
                    Text("Твой маршрут").font(.system(size: 21, weight: .black, design: .rounded))
                }
                Spacer(minLength: 8)
                stat("flame.fill", "\(model.streak())", .orange, "дней подряд")
                stat("sparkles", "\(model.totalPoints)", CoachTheme.accentColor, "очков всего")
                levelMenu
                Button { model.screen = .settings } label: { Image(systemName: "gearshape.fill").font(.system(size: 15)) }
                    .buttonStyle(.plain).foregroundStyle(.secondary).help("Настройки")
            }
            HStack(spacing: 18) {
                meter(title: "Уровень \(model.selectedLevel.rawValue)",
                      caption: "\(Int((model.currentLevelProgress * 100).rounded()))%",
                      value: model.currentLevelProgress,
                      tint: CoachTheme.accentColor)
                meter(title: "Цель дня",
                      caption: model.dailyGoalReached ? "выполнена" : "\(model.todayPracticeMinutes) / \(model.dailyGoalMinutes) мин",
                      value: model.dailyGoalProgress,
                      tint: model.dailyGoalReached ? CoachTheme.mint : CoachTheme.amber)
            }
        }
        .padding(.horizontal, 24).padding(.top, 16).padding(.bottom, 14)
        .background(CoachTheme.surface)
        .overlay(alignment: .bottom) { Rectangle().fill(CoachTheme.hairline).frame(height: 1) }
    }

    private func stat(_ icon: String, _ text: String, _ color: Color, _ help: String) -> some View {
        HStack(spacing: 4) {
            Image(systemName: icon).font(.system(size: 12)).foregroundStyle(color)
            Text(text).font(.system(size: 14, weight: .bold)).monospacedDigit()
        }.help(help)
    }

    private var levelMenu: some View {
        Menu {
            ForEach(CEFRLevel.allCases) { level in Button(level.rawValue) { model.selectLevel(level) } }
        } label: {
            Text(model.selectedLevel.rawValue).font(.system(size: 13, weight: .heavy))
        }
        .menuStyle(.borderlessButton).fixedSize()
        .padding(.horizontal, 9).padding(.vertical, 5)
        .background(CoachTheme.accentSoft, in: Capsule())
        .foregroundStyle(CoachTheme.accentColor)
    }

    private func meter(title: String, caption: String, value: Double, tint: Color) -> some View {
        VStack(alignment: .leading, spacing: 5) {
            HStack(spacing: 6) {
                Text(title).font(.system(size: 11, weight: .bold)).foregroundStyle(.secondary)
                Spacer(minLength: 4)
                Text(caption).font(.system(size: 11, weight: .semibold)).monospacedDigit().foregroundStyle(tint)
            }
            MeterBar(value: value, tint: tint)
        }
    }

    // MARK: - Primary actions

    @ViewBuilder private var continueCard: some View {
        if let lesson = model.recommendedLesson {
            let resuming = model.state.completedLessonIDs.contains(lesson.id)
            ActionCard(
                icon: resuming ? "arrow.counterclockwise" : "play.fill",
                iconColor: CoachTheme.amber,
                kicker: resuming ? "ВСЕ УРОКИ ПРОЙДЕНЫ" : "ПРОДОЛЖИТЬ",
                title: lesson.title,
                subtitle: [chapterTitle(for: lesson), "\(lesson.estimatedMinutes) мин"].compactMap { $0 }.joined(separator: " · "),
                action: { model.startLesson(lesson) }
            ).padding(.top, 20)
        }
    }

    private var reviewCard: some View {
        ActionCard(
            icon: "arrow.triangle.2.circlepath",
            iconColor: CoachTheme.blue,
            kicker: "ПОВТОРЕНИЕ",
            title: "\(model.dueCount) \(pluralize(model.dueCount, "упражнение", "упражнения", "упражнений")) \(pluralize(model.dueCount, "ждёт", "ждут", "ждут"))",
            subtitle: "Ошибки возвращаются, пока не закрепятся",
            action: { model.startReview() }
        ).padding(.top, 10)
    }

    /// Named groups, so the screen answers "что тут вообще можно делать".
    private func sectionTitle(_ title: String, hint: String? = nil) -> some View {
        VStack(alignment: .leading, spacing: 3) {
            Text(title.uppercased()).font(.system(size: 12, weight: .black)).tracking(0.6)
            if let hint { Text(hint).font(.caption).foregroundStyle(.secondary).fixedSize(horizontal: false, vertical: true) }
        }.padding(.top, 24).frame(maxWidth: .infinity, alignment: .leading)
    }

    /// Computed, not stored: a stored dictionary would freeze the colours of whichever
    /// theme happened to be live when the view was first built.
    private static var kindIcons: [String: (String, Color)] { [
        "mixed": ("bolt.fill", CoachTheme.violet),
        "flashcard": ("rectangle.on.rectangle.angled", CoachTheme.blue),
        "translate": ("pencil.line", CoachTheme.amber),
        "word_order": ("puzzlepiece.fill", CoachTheme.mint),
        "multiple_choice": ("checkmark.square.fill", Color(red: 0.76, green: 0.49, blue: 0.88))
    ] }

    private var practiceKinds: some View {
        let counts = model.practiceCounts
        return VStack(spacing: 0) {
            // Speaking comes first: it is the only exercise that gets the mouth moving.
            kindRow(
                icon: "mic.fill", color: CoachTheme.coral,
                title: "Вслух за диктором", subtitle: "Слушай, повторяй, сравнивай себя с эталоном",
                count: model.shadowingCount, action: { model.startShadowing() }
            )
            Rectangle().fill(CoachTheme.hairline).frame(height: 1).padding(.leading, 62)
            ForEach(PracticeEngine.kinds) { kind in
                let art = Self.kindIcons[kind.id] ?? ("bolt.fill", CoachTheme.violet)
                kindRow(
                    icon: art.0, color: art.1, title: kind.title, subtitle: kind.subtitle,
                    count: counts[kind.id] ?? 0, action: { model.startPractice(kindID: kind.id) }
                )
                if kind.id != PracticeEngine.kinds.last?.id {
                    Rectangle().fill(CoachTheme.hairline).frame(height: 1).padding(.leading, 62)
                }
            }
        }
        .coachCard(radius: 16)
        .padding(.top, 10)
    }

    private func kindRow(icon: String, color: Color, title: String, subtitle: String, count: Int, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 12) {
                ZStack {
                    RoundedRectangle(cornerRadius: 11, style: .continuous).fill(color).frame(width: 36, height: 36)
                    Image(systemName: icon).font(.system(size: 15, weight: .bold)).foregroundStyle(.white)
                }
                VStack(alignment: .leading, spacing: 1) {
                    Text(title).font(.system(size: 15, weight: .semibold))
                    Text(subtitle).font(.system(size: 11)).foregroundStyle(.secondary)
                }
                Spacer(minLength: 8)
                Text("\(count)").font(.system(size: 13, weight: .bold)).monospacedDigit().foregroundStyle(.secondary)
            }
            .padding(.horizontal, 14).padding(.vertical, 11)
            .frame(maxWidth: .infinity)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .disabled(count == 0)
        .opacity(count == 0 ? 0.4 : 1)
    }

    private func levelUpCard(_ next: CEFRLevel) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Уровень \(model.selectedLevel.rawValue) пройден").font(.system(size: 15, weight: .bold))
            Text("Дальше — \(next.rawValue). Пройденное останется отмеченным.").font(.callout).foregroundStyle(.secondary)
            HStack(spacing: 10) {
                Button("Перейти на \(next.rawValue)") { withAnimation { model.advanceToSuggestedLevel() } }
                    .buttonStyle(PrimaryButtonStyle(color: CoachTheme.mint)).fixedSize()
                Button("Позже") { withAnimation { model.dismissLevelUp() } }.buttonStyle(.bordered)
            }
        }
        .padding(18).frame(maxWidth: .infinity, alignment: .leading)
        .background(CoachTheme.mint.opacity(0.13), in: RoundedRectangle(cornerRadius: 16))
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(CoachTheme.mint.opacity(0.4)))
        .padding(.top, 10)
    }

    // MARK: - Chapters

    private func chapterSection(number: Int, chapter: Chapter) -> some View {
        let done = chapter.lessons.filter { model.state.completedLessonIDs.contains($0.id) }.count
        return VStack(alignment: .leading, spacing: 0) {
            HStack(alignment: .firstTextBaseline, spacing: 8) {
                Text("ГЛАВА \(number)").font(.system(size: 10, weight: .black)).tracking(1.2).foregroundStyle(CoachTheme.accentColor.opacity(0.7))
                Text(chapter.title).font(.system(size: 16, weight: .heavy, design: .rounded))
                Spacer(minLength: 8)
                Text("\(done) / \(chapter.lessons.count)").font(.system(size: 11, weight: .bold)).monospacedDigit()
                    .foregroundStyle(done == chapter.lessons.count ? CoachTheme.mint : .secondary)
            }
            if let subtitle = chapter.subtitle {
                Text(subtitle).font(.caption).foregroundStyle(.secondary).padding(.top, 3).fixedSize(horizontal: false, vertical: true)
            }
            Rectangle().fill(CoachTheme.hairline).frame(height: 1).padding(.top, 10)
            ForEach(Array(chapter.lessons.enumerated()), id: \.element.id) { position, lesson in
                let index = globalIndex(of: lesson)
                LessonRow(
                    lesson: lesson,
                    state: nodeState(index, lesson),
                    isFirst: position == 0,
                    isLast: position == chapter.lessons.count - 1,
                    action: { if model.nodeIsUnlocked(index) { model.startLesson(lesson) } }
                )
            }
        }
        .padding(.top, 26)
    }

    private var grammarLink: some View {
        Button { model.screen = .topics } label: {
            HStack(spacing: 6) {
                Image(systemName: "chart.bar.fill")
                Text("Вся грамматика уровня и мои проценты")
                Image(systemName: "chevron.right").font(.system(size: 10, weight: .bold))
            }.font(.system(size: 13, weight: .semibold))
        }
        .buttonStyle(.plain).foregroundStyle(CoachTheme.accentColor)
        .padding(.top, 16)
    }

    private var catalogLink: some View {
        Button { model.screen = .catalog } label: {
            HStack(spacing: 6) {
                Image(systemName: "square.grid.2x2")
                Text("Все уроки всех уровней")
                Image(systemName: "chevron.right").font(.system(size: 10, weight: .bold))
            }.font(.system(size: 13, weight: .semibold))
        }
        .buttonStyle(.plain).foregroundStyle(CoachTheme.accentColor)
        .padding(.top, 26)
    }

    // MARK: - Helpers

    private func globalIndex(of lesson: Lesson) -> Int { model.currentLessons.firstIndex { $0.id == lesson.id } ?? 0 }

    private func chapterTitle(for lesson: Lesson) -> String? {
        chapters.first { $0.lessons.contains { $0.id == lesson.id } }?.title
    }

    private func nodeState(_ index: Int, _ lesson: Lesson) -> LessonState {
        if model.state.completedLessonIDs.contains(lesson.id) { return .completed }
        if model.recommendedLesson?.id == lesson.id { return .current }
        return model.nodeIsUnlocked(index) ? .available : .locked
    }

    private func pluralize(_ count: Int, _ one: String, _ few: String, _ many: String) -> String {
        let mod100 = count % 100, mod10 = count % 10
        if (11...14).contains(mod100) { return many }
        if mod10 == 1 { return one }
        if (2...4).contains(mod10) { return few }
        return many
    }
}

// MARK: - Lesson row

enum LessonState { case completed, current, available, locked }

/// One lesson on the route. The connector line is drawn by the row itself and fills
/// the row's full height, so the rail is continuous by construction — the old layout
/// offset the nodes sideways while the line stayed centred, which read as broken.
private struct LessonRow: View {
    let lesson: Lesson
    let state: LessonState
    let isFirst: Bool
    let isLast: Bool
    let action: () -> Void
    @State private var hovering = false

    private var color: Color {
        switch state {
        case .completed: CoachTheme.accentColor
        case .current: CoachTheme.amber
        case .available: CoachTheme.blue
        case .locked: CoachTheme.ink.opacity(0.28)
        }
    }
    private var icon: String {
        switch state {
        case .completed: "checkmark"
        case .current: "play.fill"
        case .available: "book.fill"
        case .locked: "lock.fill"
        }
    }
    private var statusText: String {
        switch state {
        case .completed: "пройден"
        case .current: "продолжить"
        case .available: "доступен"
        case .locked: "откроется после предыдущего"
        }
    }
    private var lineColor: Color { state == .completed ? CoachTheme.accentColor.opacity(0.35) : CoachTheme.ink.opacity(0.12) }

    var body: some View {
        Button(action: action) {
            HStack(spacing: 13) {
                rail
                VStack(alignment: .leading, spacing: 2) {
                    Text(lesson.title).font(.system(size: 15, weight: .semibold))
                        .foregroundStyle(state == .locked ? AnyShapeStyle(Color.secondary) : AnyShapeStyle(CoachTheme.ink))
                    Text("\(lesson.estimatedMinutes) мин · \(statusText)").font(.system(size: 11)).foregroundStyle(.secondary)
                }.padding(.vertical, 11)
                Spacer(minLength: 8)
                trailing.padding(.vertical, 11)
            }
            .contentShape(Rectangle())
            .background(hovering && state != .locked ? CoachTheme.rowHover : .clear, in: RoundedRectangle(cornerRadius: 10))
        }
        .buttonStyle(.plain)
        .disabled(state == .locked)
        .onHover { hovering = $0 }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(lesson.title), \(statusText), \(lesson.estimatedMinutes) минут")
    }

    private var rail: some View {
        ZStack {
            VStack(spacing: 0) {
                Rectangle().fill(isFirst ? Color.clear : lineColor).frame(width: 2).frame(maxHeight: .infinity)
                Rectangle().fill(isLast ? Color.clear : lineColor).frame(width: 2).frame(maxHeight: .infinity)
            }
            node
        }
        .frame(width: 30)
        .frame(maxHeight: .infinity)
    }

    private var node: some View {
        ZStack {
            Circle().fill(state == .available ? CoachTheme.cardFill : color)
                .frame(width: state == .current ? 30 : 26, height: state == .current ? 30 : 26)
                .overlay(Circle().stroke(state == .available ? color.opacity(0.5) : .clear, lineWidth: 2))
                .shadow(color: state == .current ? color.opacity(0.45) : .clear, radius: 7, y: 3)
            Image(systemName: icon)
                .font(.system(size: state == .current ? 12 : 11, weight: .black))
                .foregroundStyle(state == .available ? color : .white)
        }
        .scaleEffect(hovering && state != .locked ? 1.06 : 1)
        .animation(.easeOut(duration: 0.16), value: hovering)
    }

    @ViewBuilder private var trailing: some View {
        switch state {
        case .current:
            Text("СЕЙЧАС").font(.system(size: 9, weight: .black)).tracking(0.8).foregroundStyle(.white)
                .padding(.horizontal, 8).padding(.vertical, 4)
                .background(CoachTheme.amber, in: Capsule())
        case .locked:
            EmptyView()
        default:
            Image(systemName: "chevron.right").font(.system(size: 11, weight: .bold)).foregroundStyle(.tertiary)
        }
    }
}

// MARK: - Action card

/// The one prominent thing to do next. Used for "continue" and for due reviews.
private struct ActionCard: View {
    let icon: String
    let iconColor: Color
    let kicker: String
    let title: String
    let subtitle: String
    let action: () -> Void
    @State private var hovering = false

    var body: some View {
        Button(action: action) {
            HStack(spacing: 14) {
                ZStack {
                    RoundedRectangle(cornerRadius: 13, style: .continuous).fill(iconColor.gradient).frame(width: 44, height: 44)
                    Image(systemName: icon).font(.system(size: 17, weight: .bold)).foregroundStyle(.white)
                }
                VStack(alignment: .leading, spacing: 3) {
                    Text(kicker).font(.system(size: 9, weight: .black)).tracking(1.1).foregroundStyle(iconColor)
                    Text(title).font(.system(size: 16, weight: .bold)).lineLimit(1)
                    Text(subtitle).font(.system(size: 11)).foregroundStyle(.secondary).lineLimit(1)
                }
                Spacer(minLength: 8)
                Image(systemName: "chevron.right").font(.system(size: 13, weight: .bold)).foregroundStyle(iconColor)
            }
            .padding(15)
            .coachCard(radius: 17)
            .overlay(RoundedRectangle(cornerRadius: 17, style: .continuous).stroke(iconColor.opacity(hovering ? 0.35 : 0), lineWidth: 1.5))
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .onHover { hovering = $0 }
        .animation(.easeOut(duration: 0.18), value: hovering)
    }
}
