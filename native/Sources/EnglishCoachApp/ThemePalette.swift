import SwiftUI

/// The three looks, mirrored from `web/src/styles.css`.
///
/// They differ structurally, not just in hue: a cartoon needs weight (thick outline,
/// a button that sinks onto its own edge), a minimal needs none (hairlines, no shadow),
/// a night needs a lit card on a dark field. So the palette carries metrics as well as
/// colours, and every view reads them instead of hard-coding white and a soft shadow.
enum ThemeID: String, CaseIterable, Identifiable, Sendable {
    case cartoon, minimal, night
    var id: String { rawValue }

    var title: String {
        switch self {
        case .cartoon: "Мультяшная"
        case .minimal: "Минимальная"
        case .night: "Ночная"
        }
    }

    var note: String {
        switch self {
        case .cartoon: "Толстый контур, кнопки с бортиком, тёплая бумага"
        case .minimal: "Волосяные линии, крупный текст, один акцент"
        case .night: "Тёмный фон, светится только карточка"
        }
    }
}

struct ThemePalette: Sendable {
    let id: ThemeID
    let ink: Color
    let inkSoft: Color
    let accent: Color
    let accentSoft: Color
    let accentFg: Color
    let violet: Color
    let blue: Color
    let amber: Color
    let mint: Color
    let coral: Color
    let coralInk: Color
    /// Raised bars (header, player bar) and the card fill beneath the content.
    let surface: Color
    let cardFill: Color
    let hairline: Color
    let track: Color
    let rowHover: Color
    let backgroundColors: [Color]
    /// The main action: a flat fill in the physical themes, a gradient at night.
    let buttonFill: [Color]
    let radius: CGFloat
    let borderWidth: CGFloat
    let borderColor: Color
    let cardShadowColor: Color
    let cardShadowRadius: CGFloat
    let cardShadowY: CGFloat
    /// How far a pressed button travels: the cartoon one sinks, the flat ones settle.
    let pressY: CGFloat
    let colorScheme: ColorScheme

    var background: LinearGradient {
        LinearGradient(colors: backgroundColors, startPoint: .topLeading, endPoint: .bottomTrailing)
    }

    var buttonGradient: LinearGradient {
        LinearGradient(colors: buttonFill, startPoint: .leading, endPoint: .trailing)
    }

    static let cartoon = ThemePalette(
        id: .cartoon,
        ink: Color(red: 0.14, green: 0.12, blue: 0.10),
        inkSoft: Color(red: 0.55, green: 0.50, blue: 0.44),
        accent: Color(red: 0.95, green: 0.42, blue: 0.24),
        accentSoft: Color(red: 0.95, green: 0.42, blue: 0.24).opacity(0.16),
        accentFg: .white,
        violet: Color(red: 0.48, green: 0.36, blue: 0.94),
        blue: Color(red: 0.18, green: 0.60, blue: 0.84),
        amber: Color(red: 0.96, green: 0.65, blue: 0.14),
        mint: Color(red: 0.21, green: 0.73, blue: 0.47),
        coral: Color(red: 0.95, green: 0.42, blue: 0.24),
        coralInk: Color(red: 0.72, green: 0.28, blue: 0.14),
        surface: Color(red: 1.0, green: 0.99, blue: 0.98),
        cardFill: Color(red: 1.0, green: 0.99, blue: 0.976),
        hairline: Color(red: 0.14, green: 0.12, blue: 0.10).opacity(0.14),
        track: Color(red: 0.14, green: 0.12, blue: 0.10).opacity(0.12),
        rowHover: Color(red: 0.14, green: 0.12, blue: 0.10).opacity(0.05),
        backgroundColors: [Color(red: 0.984, green: 0.957, blue: 0.902), Color(red: 0.965, green: 0.925, blue: 0.878)],
        buttonFill: [Color(red: 0.95, green: 0.42, blue: 0.24)],
        radius: 20, borderWidth: 2,
        borderColor: Color(red: 0.14, green: 0.12, blue: 0.10),
        cardShadowColor: Color(red: 0.14, green: 0.12, blue: 0.10).opacity(0.9),
        cardShadowRadius: 0, cardShadowY: 5,
        pressY: 4,
        colorScheme: .light
    )

    static let minimal = ThemePalette(
        id: .minimal,
        ink: Color(red: 0.08, green: 0.07, blue: 0.12),
        inkSoft: Color(red: 0.53, green: 0.51, blue: 0.60),
        accent: Color(red: 0.08, green: 0.07, blue: 0.12),
        accentSoft: Color(red: 0.08, green: 0.07, blue: 0.12).opacity(0.06),
        accentFg: .white,
        violet: Color(red: 0.44, green: 0.42, blue: 0.88),
        blue: Color(red: 0.25, green: 0.59, blue: 0.82),
        amber: Color(red: 0.90, green: 0.60, blue: 0.17),
        mint: Color(red: 0.27, green: 0.69, blue: 0.52),
        coral: Color(red: 0.89, green: 0.44, blue: 0.36),
        coralInk: Color(red: 0.70, green: 0.30, blue: 0.23),
        surface: Color(red: 0.99, green: 0.99, blue: 1.0),
        cardFill: .white,
        hairline: Color(red: 0.08, green: 0.07, blue: 0.12).opacity(0.10),
        track: Color(red: 0.08, green: 0.07, blue: 0.12).opacity(0.08),
        rowHover: Color(red: 0.08, green: 0.07, blue: 0.12).opacity(0.04),
        backgroundColors: [Color(red: 0.984, green: 0.984, blue: 0.992), Color(red: 0.965, green: 0.965, blue: 0.98)],
        buttonFill: [Color(red: 0.08, green: 0.07, blue: 0.12)],
        radius: 14, borderWidth: 1,
        borderColor: Color(red: 0.08, green: 0.07, blue: 0.12).opacity(0.12),
        cardShadowColor: .clear,
        cardShadowRadius: 0, cardShadowY: 0,
        pressY: 0,
        colorScheme: .light
    )

    static let night = ThemePalette(
        id: .night,
        ink: Color(red: 0.937, green: 0.933, blue: 0.984),
        inkSoft: Color(red: 0.569, green: 0.549, blue: 0.769),
        accent: Color(red: 0.482, green: 0.435, blue: 0.941),
        accentSoft: Color(red: 0.482, green: 0.435, blue: 0.941).opacity(0.26),
        accentFg: .white,
        violet: Color(red: 0.608, green: 0.565, blue: 1.0),
        blue: Color(red: 0.345, green: 0.784, blue: 0.941),
        amber: Color(red: 1.0, green: 0.749, blue: 0.361),
        mint: Color(red: 0.341, green: 0.839, blue: 0.639),
        coral: Color(red: 1.0, green: 0.608, blue: 0.490),
        coralInk: Color(red: 1.0, green: 0.706, blue: 0.612),
        surface: Color(red: 0.114, green: 0.098, blue: 0.235),
        cardFill: Color(red: 0.153, green: 0.133, blue: 0.302),
        hairline: Color.white.opacity(0.14),
        track: Color.white.opacity(0.12),
        rowHover: Color.white.opacity(0.06),
        backgroundColors: [Color(red: 0.106, green: 0.086, blue: 0.235), Color(red: 0.059, green: 0.051, blue: 0.145)],
        buttonFill: [Color(red: 0.482, green: 0.435, blue: 0.941), Color(red: 0.345, green: 0.784, blue: 0.941)],
        radius: 22, borderWidth: 1,
        borderColor: Color.white.opacity(0.14),
        cardShadowColor: Color.black.opacity(0.5),
        cardShadowRadius: 26, cardShadowY: 16,
        pressY: 0,
        colorScheme: .dark
    )

    static func of(_ id: ThemeID) -> ThemePalette {
        switch id {
        case .cartoon: cartoon
        case .minimal: minimal
        case .night: night
        }
    }
}
