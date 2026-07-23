import SwiftUI

enum CoachTheme {
    static let ink = Color(red: 0.12, green: 0.11, blue: 0.25)
    static let violet = Color(red: 0.43, green: 0.40, blue: 0.88)
    static let blue = Color(red: 0.27, green: 0.64, blue: 0.88)
    static let amber = Color(red: 1.00, green: 0.67, blue: 0.22)
    static let mint = Color(red: 0.33, green: 0.78, blue: 0.59)
    static let mist = Color(red: 0.90, green: 0.97, blue: 1.00)
    static let lilac = Color(red: 0.95, green: 0.92, blue: 1.00)
    static let background = LinearGradient(colors: [mist, lilac], startPoint: .topLeading, endPoint: .bottomTrailing)

    /// Raised surfaces (header, action rows) and the hairlines that separate them.
    static let surface = Color.white.opacity(0.72)
    static let hairline = ink.opacity(0.09)
    static let track = ink.opacity(0.08)
    static let rowHover = ink.opacity(0.04)
}

/// Thin capsule meter. A plain ProgressView cannot be sized and tinted consistently
/// across the header, so the map draws its own.
struct MeterBar: View {
    let value: Double
    let tint: Color
    var height: CGFloat = 6

    var body: some View {
        GeometryReader { geo in
            ZStack(alignment: .leading) {
                Capsule().fill(CoachTheme.track)
                Capsule().fill(tint).frame(width: geo.size.width * max(0, min(1, value)))
            }
        }
        .frame(height: height)
    }
}

/// Answer option card — shared by the placement test and the lesson player.
struct ChoiceButtonStyle: ButtonStyle {
    var selected: Bool = false
    func makeBody(configuration: Configuration) -> some View {
        configuration.label.font(.headline).foregroundStyle(selected ? .white : CoachTheme.ink).frame(maxWidth: .infinity).padding(13)
            .background(selected ? CoachTheme.violet : Color.white, in: RoundedRectangle(cornerRadius: 13))
            .overlay(RoundedRectangle(cornerRadius: 13).stroke(CoachTheme.violet.opacity(selected ? 0 : 0.2), lineWidth: 2))
            .scaleEffect(configuration.isPressed ? 0.98 : 1)
    }
}

struct PrimaryButtonStyle: ButtonStyle {
    var color = CoachTheme.violet
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.headline.weight(.bold)).foregroundStyle(.white)
            .frame(maxWidth: .infinity).padding(.vertical, 13)
            .background(color.gradient, in: RoundedRectangle(cornerRadius: 15, style: .continuous))
            .shadow(color: color.opacity(configuration.isPressed ? 0.12 : 0.28), radius: configuration.isPressed ? 3 : 10, y: configuration.isPressed ? 2 : 6)
            .scaleEffect(configuration.isPressed ? 0.98 : 1)
    }
}
