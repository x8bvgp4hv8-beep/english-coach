import SwiftUI
import EnglishCoachCore

/// The live palette. Views read these names, `ThemePalette` supplies the values, and
/// `AppModel.selectTheme` swaps the whole set. Nothing here is `let`: that is the point.
/// `@MainActor` because it is mutable shared state: only the UI reads or swaps it, and
/// Swift 6 will not let a plain global be written from anywhere.
@MainActor
enum CoachTheme {
    static private(set) var palette: ThemePalette = .minimal

    /// Theme and language are two axes of the same palette: the theme decides how the
    /// app is built, the language decides what colour it is built in.
    static func use(_ id: ThemeID, language: LanguageCode = .default) {
        palette = ThemePalette.of(id, language: language)
    }

    static var ink: Color { palette.ink }
    static var inkSoft: Color { palette.inkSoft }
    static var violet: Color { palette.violet }
    static var blue: Color { palette.blue }
    static var amber: Color { palette.amber }
    static var mint: Color { palette.mint }
    /// Speaking practice, the one exercise that is not read and typed.
    static var coral: Color { palette.coral }
    static var coralInk: Color { palette.coralInk }
    static var background: LinearGradient { palette.background }

    /// The main action: a flat fill where the theme is flat, a gradient at night.
    static var accent: LinearGradient { palette.buttonGradient }
    /// The same accent as a plain colour, for labels, ticks and progress tints.
    static var accentColor: Color { palette.accent }
    static var accentSoft: Color { palette.accentSoft }
    static var accentFg: Color { palette.accentFg }

    /// Raised surfaces (header, action rows), the card fill, and the lines between them.
    static var surface: Color { palette.surface }
    static var cardFill: Color { palette.cardFill }
    static var hairline: Color { palette.hairline }
    static var track: Color { palette.track }
    static var rowHover: Color { palette.rowHover }

    /// Soft panel behind an example or a word tray. Follows the accent so it never
    /// stays icy blue on a warm or dark theme.
    static var mist: Color { palette.accentSoft }

    static var radius: CGFloat { palette.radius }
    static var borderWidth: CGFloat { palette.borderWidth }
    static var borderColor: Color { palette.borderColor }
    static var pressY: CGFloat { palette.pressY }
    static var colorScheme: ColorScheme { palette.colorScheme }
}

/// Card and panel surface: fill, outline and shadow in one place, so a theme that wants
/// a hard bottom edge and one that wants no shadow at all are the same call site.
///
/// The shadow hangs on the filled shape, never on the modified view. SwiftUI's `.shadow`
/// falls from everything drawn inside, so a hard shadow (radius 0, offset 5) applied to
/// the card would print a solid copy of every label five points below itself.
struct CoachCard: ViewModifier {
    var radius: CGFloat?
    func body(content: Content) -> some View {
        let corner = radius ?? CoachTheme.radius
        let shape = RoundedRectangle(cornerRadius: corner, style: .continuous)
        let p = CoachTheme.palette
        return content
            .background {
                shape.fill(p.cardFill)
                    .shadow(color: p.cardShadowColor, radius: p.cardShadowRadius, y: p.cardShadowY)
            }
            .overlay(shape.stroke(p.borderColor, lineWidth: p.borderWidth))
    }
}

extension View {
    func coachCard(radius: CGFloat? = nil) -> some View { modifier(CoachCard(radius: radius)) }
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
///
/// A picked answer is a state, not a second action: filling it with the accent made it
/// weigh the same as the button that submits, and the eye could not tell them apart.
/// Selection is a tint, a firm border and a tick; the solid accent stays on the action.
struct ChoiceButtonStyle: ButtonStyle {
    var selected: Bool = false
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(selected ? .headline.bold() : .headline)
            .foregroundStyle(CoachTheme.ink)
            .frame(maxWidth: .infinity).padding(13)
            .background(selected ? CoachTheme.accentSoft : CoachTheme.cardFill, in: RoundedRectangle(cornerRadius: 13))
            .overlay(RoundedRectangle(cornerRadius: 13).stroke(selected ? CoachTheme.palette.accent : CoachTheme.borderColor, lineWidth: selected ? 2 : CoachTheme.borderWidth))
            .overlay(alignment: .trailing) {
                if selected {
                    Image(systemName: "checkmark").font(.subheadline.weight(.black))
                        .foregroundStyle(CoachTheme.palette.accent).padding(.trailing, 14)
                }
            }
            .scaleEffect(configuration.isPressed ? 0.98 : 1)
    }
}

/// The main action. Without a `color` it takes the accent gradient and a sheen that
/// sweeps once on press; with a colour it stays flat, because there the colour is the
/// message (green for "counted", blue for a card).
struct PrimaryButtonStyle: ButtonStyle {
    var color: Color?

    init(color: Color? = nil) { self.color = color }

    func makeBody(configuration: Configuration) -> some View {
        let p = CoachTheme.palette
        let shape = RoundedRectangle(cornerRadius: 15, style: .continuous)
        let pressed = configuration.isPressed
        return configuration.label
            .font(.headline.weight(.bold)).foregroundStyle(p.accentFg)
            .frame(maxWidth: .infinity).padding(.vertical, 13)
            // The shadow lives on the fill, not on the button: `.shadow` on the whole
            // control would stamp a hard copy of the label under it.
            .background {
                Group {
                    if let color { shape.fill(color) } else { shape.fill(p.buttonGradient) }
                }
                .shadow(color: p.cardShadowColor, radius: p.cardShadowRadius, y: pressed ? min(1, p.cardShadowY) : p.cardShadowY)
            }
            .overlay(shape.stroke(p.borderColor, lineWidth: p.borderWidth))
            .overlay { if color == nil { sheen(pressed: pressed).clipShape(shape) } }
            // The press is physical where the theme is: the cartoon button sinks onto its
            // own bottom edge, the flat ones only settle.
            .offset(y: pressed ? p.pressY : 0)
            .scaleEffect(pressed ? 0.99 : 1)
    }

    private func sheen(pressed: Bool) -> some View {
        GeometryReader { geo in
            LinearGradient(colors: [.clear, .white.opacity(0.4), .clear], startPoint: .leading, endPoint: .trailing)
                .frame(width: geo.size.width * 0.45)
                .rotationEffect(.degrees(18))
                .offset(x: pressed ? geo.size.width * 1.15 : -geo.size.width * 0.6)
                .animation(.easeOut(duration: 0.55), value: pressed)
        }
        .allowsHitTesting(false)
    }
}
