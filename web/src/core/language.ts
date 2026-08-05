/**
 * The languages the app can teach. Mirrors EnglishCoachCore/Language.swift.
 *
 * A language is not a setting inside one course — it is the whole app: its own course
 * packs, its own placement test, its own syllabus, its own progress and its own voice.
 * Everything that differs between English and Spanish is named here once, so a third
 * language is a row in this table plus a folder of content.
 */

export type LanguageCode = 'en' | 'es'

export interface LearningLanguage {
  code: LanguageCode
  /** What it is called in the interface, which is Russian. */
  title: string
  /** What it calls itself, for the cards on the picker. */
  nativeTitle: string
  /** Two letters for chips and headers. */
  short: string
  /** Russian genitive, for «пять минут испанского». */
  genitive: string
  /** Russian prepositional, for «шаг в испанском». */
  locative: string
  /** The greeting on the picker card: the language speaking for itself. */
  greeting: string
  /** One line of what it is like to start. */
  note: string
  /** BCP-47 tag for speech synthesis, and for the `lang` attribute on quoted text. */
  speechLocale: string
  /** Fallback locales, because a phone may not have the first choice installed. */
  speechFallbacks: string[]
}

export const LANGUAGES: readonly LearningLanguage[] = [
  {
    code: 'en',
    title: 'Английский',
    nativeTitle: 'English',
    short: 'EN',
    genitive: 'английского',
    locative: 'английском',
    greeting: 'Hello!',
    note: 'От первых фраз до свободной речи: A1–C1',
    speechLocale: 'en-GB',
    speechFallbacks: ['en-US', 'en'],
  },
  {
    code: 'es',
    title: 'Испанский',
    nativeTitle: 'Español',
    short: 'ES',
    genitive: 'испанского',
    locative: 'испанском',
    greeting: '¡Hola!',
    note: 'От первых фраз до свободной речи: A1–C1',
    speechLocale: 'es-ES',
    speechFallbacks: ['es-MX', 'es'],
  },
] as const

export const LANGUAGE_CODES: readonly LanguageCode[] = LANGUAGES.map((item) => item.code)

export const DEFAULT_LANGUAGE: LanguageCode = 'en'

export function isLanguageCode(value: unknown): value is LanguageCode {
  return typeof value === 'string' && LANGUAGE_CODES.includes(value as LanguageCode)
}

export function languageOf(code: LanguageCode): LearningLanguage {
  return LANGUAGES.find((item) => item.code === code) ?? LANGUAGES[0]
}
