import SwiftUI
import EnglishCoachCore

/// The first screen, and the only place the two halves of the app meet.
///
/// Each card is painted in its own language's accent, because that accent is what the
/// learner will see for the rest of the session: choosing here is choosing a colour, a
/// voice, a course and a separate record of progress.
struct LanguagePickerView: View {
    @Environment(AppModel.self) private var model
    /// Set when the picker was opened from inside the app, so it can be left again.
    var back: (() -> Void)?

    var body: some View {
        VStack(spacing: 0) {
            if let back {
                HStack {
                    Button { back() } label: { Label("Назад", systemImage: "chevron.left") }
                    Spacer()
                    Text("Язык").font(.title2.bold())
                    Spacer()
                }
                .padding(20)
            }

            ScrollView {
                VStack(spacing: 18) {
                    if back == nil {
                        VStack(spacing: 10) {
                            Text("🗺").font(.system(size: 54))
                            Text("Что учим?").font(.largeTitle.bold())
                            Text("Два независимых курса: свой маршрут, свой прогресс, свой голос. Язык можно поменять в любой момент.")
                                .font(.callout).foregroundStyle(CoachTheme.inkSoft)
                                .multilineTextAlignment(.center).frame(maxWidth: 380)
                        }
                        .padding(.top, 28)
                    }

                    HStack(alignment: .top, spacing: 14) {
                        ForEach(model.availableLanguages) { language in
                            card(language)
                        }
                    }

                    Text("Прогресс у языков раздельный: занятия по испанскому не сбивают английский стрик и наоборот. Начатый курс ждёт на своей карточке — выбор языка ничего не сбрасывает.")
                        .font(.caption).foregroundStyle(CoachTheme.inkSoft)
                        .multilineTextAlignment(.center).frame(maxWidth: 420)
                }
                .padding(24)
            }
        }
    }

    private func card(_ language: LearningLanguage) -> some View {
        let tint = Self.tint(language.code)
        let current = model.language == language.code
        let started = Self.startedAt(language.code)
        return Button { model.selectLanguage(language.code) } label: {
            VStack(alignment: .leading, spacing: 2) {
                Text(language.short)
                    .font(.caption2.weight(.black)).kerning(1)
                    .padding(.horizontal, 7).padding(.vertical, 3)
                    .background(tint, in: RoundedRectangle(cornerRadius: 6, style: .continuous))
                    .foregroundStyle(.white)
                Text(language.greeting).font(.title.bold()).foregroundStyle(tint).padding(.top, 10)
                Text(language.title).font(.headline).padding(.top, 6)
                Text(language.nativeTitle).font(.caption).foregroundStyle(CoachTheme.inkSoft)
                // A course already begun says so with its own numbers: on the very first
                // screen after an update, that is the answer to "а где мой прогресс".
                Text(started.map { "Уровень \($0.level.rawValue) · \($0.points) ✦" } ?? language.note)
                    .font(.caption).foregroundStyle(CoachTheme.inkSoft).padding(.top, 8)
                Text(current ? "СЕЙЧАС ЗДЕСЬ" : started != nil ? "ПРОДОЛЖИТЬ" : "НАЧАТЬ")
                    .font(.caption2.weight(.black)).kerning(0.6).foregroundStyle(tint).padding(.top, 10)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(16)
            .coachCard()
            .overlay(
                RoundedRectangle(cornerRadius: CoachTheme.radius, style: .continuous)
                    .stroke(current ? tint : .clear, lineWidth: 2)
            )
        }
        .buttonStyle(.plain)
    }

    /// What is already saved for a language, or nil when it has never been opened.
    private static func startedAt(_ code: LanguageCode) -> (level: CEFRLevel, points: Int)? {
        guard let state = try? ProgressStore.live(code).load(), let profile = state.profile else { return nil }
        return (profile.selectedLevel, state.points)
    }

    /// Fixed, not themed: each card wears its own language's colour whichever one is active.
    private static func tint(_ code: LanguageCode) -> Color {
        switch code {
        case .en: Color(red: 0.435, green: 0.416, blue: 0.878)
        case .es: Color(red: 0.788, green: 0.314, blue: 0.173)
        }
    }
}
