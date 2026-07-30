/**
 * Look and feel, kept out of the learning core on purpose: a theme is chrome, not
 * progress, so it never touches `UserState` (which is mirrored in Swift and tested
 * against it) and never travels in a progress backup.
 */

export type ThemeID = 'cartoon' | 'minimal' | 'night'

export const THEMES: Array<{ id: ThemeID; title: string; note: string }> = [
  { id: 'cartoon', title: 'Мультяшная', note: 'Толстый контур, кнопки с бортиком, тёплая бумага' },
  { id: 'minimal', title: 'Минимальная', note: 'Волосяные линии, крупный текст, один акцент' },
  { id: 'night', title: 'Ночная', note: 'Тёмный фон, светится только карточка' },
]

const KEY = 'english-coach.theme'
const DEFAULT: ThemeID = 'minimal'

const known = (value: string | null): value is ThemeID =>
  THEMES.some((theme) => theme.id === value)

export function loadTheme(): ThemeID {
  try {
    const stored = localStorage.getItem(KEY)
    return known(stored) ? stored : DEFAULT
  } catch {
    return DEFAULT
  }
}

/** Applied to the root element, where the token sets in styles.css hang off it. */
export function applyTheme(theme: ThemeID): void {
  document.documentElement.dataset.theme = theme
  // The browser chrome around a standalone PWA has to follow the page, or a dark
  // theme sits inside a white status bar.
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', theme === 'night' ? '#12102a' : '#eef4ff')
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    // A blocked storage costs the preference, not the session.
  }
}
