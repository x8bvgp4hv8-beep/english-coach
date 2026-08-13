import type { ReactNode } from 'react'

export interface LanguageCardProps {
  /** Two-letter code. Also picks the card's fixed colour: `en` indigo, `es` terracotta. */
  code: string
  /** The badge in the corner, e.g. "ENG". */
  short: string
  /** A hello in the language itself — the loudest thing on the card. */
  greeting: string
  /** BCP-47 tag for the greeting, so a screen reader says it in the right voice. */
  greetingLocale?: string
  /** The language in Russian. */
  title: string
  /** The language in its own words: "Español". */
  nativeTitle: string
  /** One line: either the pitch, or the saved progress ("Уровень A2 · 320 ✦"). */
  note: string
  /** The call to action: "начать", "продолжить", "сейчас здесь". */
  state: string
  /** The course currently open. Tints the card in its own colour. */
  current?: boolean
  /**
   * Anything to stand at the top of the card — the app puts the mascot in its hat here.
   * A slot rather than a prop for the mascot itself: the kit stays presentational and
   * knows nothing about custom elements.
   */
  mascot?: ReactNode
  onChoose?: () => void
}

/**
 * One course to walk into.
 *
 * Each card wears its own language's colour whichever course is active, because that
 * colour is what the learner will see for the rest of the session: choosing here is
 * choosing a voice, a syllabus and a separate record of progress.
 */
export function LanguageCard({
  code, short, greeting, greetingLocale, title, nativeTitle, note, state, current, mascot, onChoose,
}: LanguageCardProps) {
  return (
    <button className={`lang-card ${code}${current ? ' current' : ''}`} onClick={onChoose}>
      <span className="lang-short">{short}</span>
      {mascot}
      <span className="lang-greeting" lang={greetingLocale}>{greeting}</span>
      <span className="lang-name">{title}</span>
      <span className="lang-native">{nativeTitle}</span>
      <span className="lang-note">{note}</span>
      <span className="lang-state">{state}</span>
    </button>
  )
}
