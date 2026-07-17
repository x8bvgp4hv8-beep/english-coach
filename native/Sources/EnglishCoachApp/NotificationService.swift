import UserNotifications

enum NotificationService {
    static func requestAndSchedule(hour: Int, minute: Int) async throws {
        let center = UNUserNotificationCenter.current()
        let allowed = try await center.requestAuthorization(options: [.alert, .sound])
        guard allowed else { return }
        center.removePendingNotificationRequests(withIdentifiers: ["daily-practice"])
        try await center.add(makeRequest(hour: hour, minute: minute))
    }

    static func disable() { UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: ["daily-practice"]) }

    static func makeRequest(hour: Int, minute: Int) -> UNNotificationRequest {
        let content = UNMutableNotificationContent()
        content.title = "English Coach"
        content.body = "Пять минут английского — и сегодняшний шаг готов."
        content.sound = .default
        let trigger = UNCalendarNotificationTrigger(dateMatching: DateComponents(hour: hour, minute: minute), repeats: true)
        return UNNotificationRequest(identifier: "daily-practice", content: content, trigger: trigger)
    }
}
