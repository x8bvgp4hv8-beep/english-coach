import SwiftUI
import EnglishCoachCore

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
    var id: ThemeID
    var ink: Color
    var inkSoft: Color
    var accent: Color
    var accentSoft: Color
    var accentFg: Color
    var violet: Color
    var blue: Color
    var amber: Color
    var mint: Color
    var coral: Color
    var coralInk: Color
    /// Raised bars (header, player bar) and the card fill beneath the content.
    var surface: Color
    var cardFill: Color
    var hairline: Color
    var track: Color
    var rowHover: Color
    var backgroundColors: [Color]
    /// The main action: a flat fill in the physical themes, a gradient at night.
    var buttonFill: [Color]
    var radius: CGFloat
    var borderWidth: CGFloat
    var borderColor: Color
    var cardShadowColor: Color
    var cardShadowRadius: CGFloat
    var cardShadowY: CGFloat
    /// How far a pressed button travels: the cartoon one sinks, the flat ones settle.
    var pressY: CGFloat
    var colorScheme: ColorScheme

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

    static func of(_ id: ThemeID, language: LanguageCode) -> ThemePalette {
        of(id).tinted(for: language)
    }

    /// The language accent, mirrored from `web/src/styles.css`.
    ///
    /// The theme decides how the app is built, the language decides what colour it is
    /// built in, so the two are separate axes and every combination has to work. English
    /// keeps the indigo the app was born in; Spanish takes terracotta and saffron.
    func tinted(for language: LanguageCode) -> ThemePalette {
        guard language == .es else { return self }
        var p = self
        p.violet = Color(red: 0.831, green: 0.384, blue: 0.235)
        p.coral = Color(red: 0.851, green: 0.310, blue: 0.239)
        switch id {
        case .minimal:
            p.accent = Color(red: 0.722, green: 0.282, blue: 0.165)
            p.accentSoft = Color(red: 0.722, green: 0.282, blue: 0.165).opacity(0.09)
            p.buttonFill = [Color(red: 0.722, green: 0.282, blue: 0.165)]
            p.amber = Color(red: 0.827, green: 0.545, blue: 0.110)
        case .cartoon:
            p.accent = Color(red: 0.824, green: 0.263, blue: 0.122)
            p.accentSoft = Color(red: 0.824, green: 0.263, blue: 0.122).opacity(0.16)
            p.buttonFill = [Color(red: 0.824, green: 0.263, blue: 0.122)]
            p.violet = Color(red: 0.788, green: 0.333, blue: 0.184)
            p.backgroundColors = [Color(red: 0.992, green: 0.945, blue: 0.886), Color(red: 0.973, green: 0.902, blue: 0.831)]
        case .night:
            p.accent = Color(red: 0.941, green: 0.537, blue: 0.290)
            p.accentSoft = Color(red: 0.941, green: 0.537, blue: 0.290).opacity(0.26)
            p.buttonFill = [Color(red: 0.886, green: 0.376, blue: 0.227), Color(red: 0.961, green: 0.694, blue: 0.235)]
            p.violet = Color(red: 1.0, green: 0.616, blue: 0.388)
            p.inkSoft = Color(red: 0.769, green: 0.604, blue: 0.573)
            p.backgroundColors = [Color(red: 0.290, green: 0.122, blue: 0.133), Color(red: 0.094, green: 0.051, blue: 0.086)]
        }
        return p
    }
}
