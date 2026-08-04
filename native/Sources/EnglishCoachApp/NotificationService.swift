import AppKit
import UserNotifications
import EnglishCoachCore

/// The daily reminder.
///
/// Three things went wrong here, and all three were invisible from the interface:
///
///  1. A refused permission was swallowed — the toggle stayed on and nothing was ever
///     scheduled. "Включено" has to mean scheduled, so refusal now throws.
///  2. Scheduling happened only when the toggle changed. A rebuild of the app drops the
///     pending request, so after any update the reminder quietly stopped existing while
///     the saved profile still said it was on. It is now re-scheduled at every launch.
///  3. The reminder names the language being learnt, so switching languages has to
///     re-schedule it too, or Spanish gets reminded about English.
///
/// The interface no longer reports the saved flag: it reports what the system actually
/// has queued, because that is the only thing that will wake anyone up.
enum NotificationService {
    enum ReminderError: LocalizedError {
        case denied
        case noAnswer

        var errorDescription: String? {
            switch self {
            case .denied:
                "macOS не разрешила уведомления. Системные настройки → Уведомления → \(ProductInfo.name)."
            case .noAnswer:
                "macOS не ответила на запрос разрешения. Так бывает, когда система помнит приложение по старому пути: перенеси \(ProductInfo.name) в «Программы» и запусти оттуда."
            }
        }
    }

    private static let id = "daily-practice"

    /// Asks for permission if it has not been asked yet, then schedules. Throws on refusal
    /// so the caller can turn the switch back off instead of lying to the learner.
    static func requestAndSchedule(hour: Int, minute: Int, language: LearningLanguage) async throws {
        guard try await requestAuthorization() else { throw ReminderError.denied }
        try await schedule(hour: hour, minute: minute, language: language)
    }

    /// The permission request does not always come back. When macOS has the bundle id
    /// registered against a path that no longer exists, the call simply never answers —
    /// and the switch would sit there looking enabled forever. A deadline turns that
    /// silence into something the learner can read and act on.
    private static func requestAuthorization(timeout: Duration = .seconds(15)) async throws -> Bool {
        try await withThrowingTaskGroup(of: Bool.self) { group in
            group.addTask {
                try await UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound])
            }
            group.addTask {
                try await Task.sleep(for: timeout)
                throw ReminderError.noAnswer
            }
            defer { group.cancelAll() }
            guard let first = try await group.next() else { throw ReminderError.noAnswer }
            return first
        }
    }

    /// Re-arms an already permitted reminder without ever showing a permission dialog.
    /// Called at launch and after a language switch; returns false when the system would
    /// not deliver it, so the profile can stop claiming otherwise.
    @discardableResult
    static func refresh(hour: Int, minute: Int, language: LearningLanguage) async -> Bool {
        let center = UNUserNotificationCenter.current()
        let settings = await center.notificationSettings()
        guard settings.authorizationStatus == .authorized || settings.authorizationStatus == .provisional else {
            disable()
            return false
        }
        do {
            try await schedule(hour: hour, minute: minute, language: language)
            return true
        } catch {
            return false
        }
    }

    private static func schedule(hour: Int, minute: Int, language: LearningLanguage) async throws {
        let center = UNUserNotificationCenter.current()
        center.removePendingNotificationRequests(withIdentifiers: [id])
        try await center.add(makeRequest(hour: hour, minute: minute, language: language))
    }

    static func disable() {
        UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: [id])
    }

    /// What is actually queued, in words — "завтра в 19:00" or nil when nothing is.
    /// The settings screen shows this instead of the stored flag.
    static func pendingSummary(calendar: Calendar = .current, now: Date = .now) async -> String? {
        let requests = await UNUserNotificationCenter.current().pendingNotificationRequests()
        guard let trigger = requests.first(where: { $0.identifier == id })?.trigger as? UNCalendarNotificationTrigger,
              let next = trigger.nextTriggerDate() else { return nil }
        let time = String(format: "%02d:%02d", calendar.component(.hour, from: next), calendar.component(.minute, from: next))
        return calendar.isDateInToday(next) ? "сегодня в \(time)"
            : calendar.isDateInTomorrow(next) ? "завтра в \(time)"
            : "в \(time)"
    }

    static func makeRequest(hour: Int, minute: Int, language: LearningLanguage = Languages.of(.default)) -> UNNotificationRequest {
        let content = UNMutableNotificationContent()
        content.title = ProductInfo.name
        content.body = "Пять минут \(language.genitive) — и сегодняшний шаг готов."
        content.sound = .default
        let trigger = UNCalendarNotificationTrigger(dateMatching: DateComponents(hour: hour, minute: minute), repeats: true)
        return UNNotificationRequest(identifier: id, content: content, trigger: trigger)
    }
}

/// Without a delegate macOS drops the banner whenever the app is in front, which reads as
/// "напоминания не работают" to anyone testing them with the window open.
///
/// `@unchecked Sendable` because the delegate protocol cannot be adopted by a `@MainActor`
/// type under Swift 6 — the same constraint `SpeechService` runs into. It is safe here for
/// a plain reason: the object holds no state at all, and everything it touches it touches
/// on the main actor.
final class NotificationPresenter: NSObject, UNUserNotificationCenterDelegate, @unchecked Sendable {
    static let shared = NotificationPresenter()

    func install() { UNUserNotificationCenter.current().delegate = self }

    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification
    ) async -> UNNotificationPresentationOptions {
        [.banner, .sound]
    }

    /// Tapping the reminder is a request to practise, so it brings the window back.
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse
    ) async {
        await MainActor.run {
            NSApp.activate(ignoringOtherApps: true)
            if let window = NSApp.windows.first(where: { $0.canBecomeMain }) {
                window.makeKeyAndOrderFront(nil)
            } else {
                MainWindow.shared.open?()
            }
        }
    }
}
