import { setVoiceLanguage } from './speech'
import { DEFAULT_LANGUAGE, isLanguageCode, storageKey } from '../core'
import type { LanguageCode } from '../core'

/**
 * Which language the app is currently teaching.
 *
 * Kept next to the theme rather than in `UserState`: it is not progress, it must not
 * travel in a progress backup, and each language's progress is stored under its own key
 * anyway. `null` means the choice has not been made yet — that is what opens the picker.
 */
const KEY = 'english-coach.language'

export function loadLanguage(): LanguageCode | null {
  try {
    const stored = localStorage.getItem(KEY)
    if (isLanguageCode(stored)) return stored
    // Someone who was already learning English before there was anything to choose
    // between must not be met by a picker: to them it reads as "мой прогресс пропал".
    // The picker is for a first run and for switching, not for an upgrade.
    if (localStorage.getItem(storageKey(DEFAULT_LANGUAGE)) !== null) {
      saveLanguage(DEFAULT_LANGUAGE)
      return DEFAULT_LANGUAGE
    }
    return null
  } catch {
    return null
  }
}

export function saveLanguage(language: LanguageCode): void {
  try {
    localStorage.setItem(KEY, language)
  } catch {
    // A blocked storage costs the preference, not the session.
  }
}

/**
 * Applied to the root element, where the accent overrides in styles.css hang off it.
 * The voice follows from the same call, so the two can never disagree.
 */
export function applyLanguage(language: LanguageCode): void {
  document.documentElement.dataset.learning = language
  setVoiceLanguage(language)
}
