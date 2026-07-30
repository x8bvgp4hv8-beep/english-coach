import SwiftUI
import EnglishCoachCore

/// Every grammar topic of the level with the learner's record on it, and a way straight
/// into practising the weak one. The data was already there — attempts carry an exercise
/// id, exercises carry topics — it just had nowhere to be seen.
struct TopicsView: View {
    @Environment(AppModel.self) private var model

    var body: some View {
        VStack(spacing: 0) {
            header
            ScrollView {
                LazyVStack(alignment: .leading, spacing: 0) {
                    if !weak.isEmpty {
                        section("Проседает", hint: "Считается по твоим ответам: тема попадает сюда после \(TopicProgressEngine.enoughAttempts) попыток.")
                        ForEach(weak) { row($0) }
                    }
                    if !known.isEmpty {
                        section("Держится")
                        ForEach(known) { row($0) }
                    }
                    if !early.isEmpty {
                        section("Мало попыток", hint: "Пара ответов ещё ничего не доказывает, вывода по ним нет.")
                        ForEach(early) { row($0) }
                    }
                    if !untouched.isEmpty {
                        section("Ещё не трогал", hint: "\(untouched.count) тем ждут первого захода.")
                        ForEach(untouched) { row($0) }
                    }
                }
                .padding(.horizontal, 24).padding(.bottom, 30)
            }
        }
    }

    private var weak: [TopicProgress] { model.weakTopics }
    /// By id, not by value: the two engine calls build separate records for one topic.
    private var weakIDs: Set<String> { Set(weak.map(\.topic.id)) }
    /// One or two answers are not a verdict: a topic with 0 of 1 is not "holding up".
    private var early: [TopicProgress] { model.topicProgress.filter { $0.attempts > 0 && $0.attempts < TopicProgressEngine.enoughAttempts } }
    private var known: [TopicProgress] {
        model.topicProgress.filter { $0.attempts >= TopicProgressEngine.enoughAttempts && !weakIDs.contains($0.topic.id) }
    }
    private var untouched: [TopicProgress] { model.topicProgress.filter { $0.attempts == 0 } }

    private var header: some View {
        HStack {
            Button { model.screen = .map } label: { Label("Назад", systemImage: "chevron.left") }
                .buttonStyle(.plain).foregroundStyle(CoachTheme.accentColor)
            Spacer()
            Text("Грамматика").font(.title2.bold())
            Spacer()
            Text("Назад").opacity(0)
        }
        .padding(20)
        .background(CoachTheme.surface)
        .overlay(alignment: .bottom) { Rectangle().fill(CoachTheme.hairline).frame(height: 1) }
    }

    private func section(_ title: String, hint: String? = nil) -> some View {
        VStack(alignment: .leading, spacing: 3) {
            Text(title.uppercased()).font(.system(size: 12, weight: .black)).tracking(0.6)
            if let hint {
                Text(hint).font(.caption).foregroundStyle(.secondary).fixedSize(horizontal: false, vertical: true)
            }
        }
        .padding(.top, 24).frame(maxWidth: .infinity, alignment: .leading)
    }

    private func row(_ item: TopicProgress) -> some View {
        let seen = item.attempts > 0
        let percent = Int((item.accuracy * 100).rounded())
        let tone: Color = !seen ? CoachTheme.inkSoft : percent < 60 ? CoachTheme.coral : percent < 75 ? CoachTheme.amber : CoachTheme.mint

        return Button { model.startTopicPractice(item.topic.id) } label: {
            HStack(spacing: 12) {
                VStack(alignment: .leading, spacing: 4) {
                    HStack(alignment: .firstTextBaseline) {
                        Text(item.topic.title).font(.system(size: 15, weight: .semibold))
                        Spacer(minLength: 8)
                        Text(seen ? "\(percent)%" : "\(item.exercises) упр.")
                            .font(.system(size: 13, weight: .bold)).monospacedDigit().foregroundStyle(tone)
                    }
                    Text(item.topic.summary).font(.system(size: 12)).foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                    MeterBar(value: seen ? max(0.04, item.accuracy) : 0, tint: tone, height: 5).padding(.top, 2)
                    if seen {
                        Text("\(item.correct) из \(item.attempts) верно · \(item.topic.level.rawValue)")
                            .font(.system(size: 11)).foregroundStyle(.secondary)
                    }
                }
                Image(systemName: "play.fill").font(.system(size: 11)).foregroundStyle(.secondary)
            }
            .padding(14)
            .frame(maxWidth: .infinity)
            .coachCard()
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .padding(.top, 10)
    }
}
