import { LanguageCard } from 'english-coach-web'

/**
 * The first screen. Each card wears its own language's colour whichever course is
 * open, because that colour is what the learner sees for the rest of the session.
 */
export function Picker() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: 380 }}>
      <LanguageCard
        code="en" short="ENG" greeting="Hello!" greetingLocale="en-US"
        title="Английский" nativeTitle="English"
        note="Уровень B1 · 10 ✦" state="продолжить"
      />
      <LanguageCard
        code="es" short="ESP" greeting="¡Hola!" greetingLocale="es-ES"
        title="Испанский" nativeTitle="Español"
        note="Уровень A2 · 320 ✦" state="сейчас здесь" current
      />
    </div>
  )
}

/** Never opened: the card pitches the course instead of reporting progress. */
export function Fresh() {
  return (
    <div style={{ width: 190 }}>
      <LanguageCard
        code="es" short="ESP" greeting="¡Hola!" greetingLocale="es-ES"
        title="Испанский" nativeTitle="Español"
        note="A1 — полные 92 часа с нуля; дальше A2–C1, пока по часу"
        state="начать"
      />
    </div>
  )
}

/** The course currently open, tinted in its own colour. */
export function Current() {
  return (
    <div style={{ width: 190 }}>
      <LanguageCard
        code="en" short="ENG" greeting="Hello!" greetingLocale="en-US"
        title="Английский" nativeTitle="English"
        note="Уровень B1 · 10 ✦" state="сейчас здесь" current
      />
    </div>
  )
}
