import { DEFAULT_LANGUAGE, languageOf } from '../core'
import type { LanguageCode, LearningLanguage } from '../core'

/** Slow enough that the words come apart, fast enough to still be a sentence. */
export const SLOW_RATE = 0.65

/**
 * The app teaches one language at a time, so the voice is a single global fact rather
 * than an argument every caller has to remember to pass. `setVoiceLanguage` is called
 * wherever the language is chosen or switched.
 */
let voice: LearningLanguage = languageOf(DEFAULT_LANGUAGE)

export function setVoiceLanguage(language: LanguageCode): void {
  voice = languageOf(language)
}

/**
 * The installed voice closest to the language, or none — in which case the browser
 * picks by `utterance.lang` and, failing that, reads it in whatever voice it has. A
 * phone without a Spanish voice still speaks; it just speaks badly, which is better
 * than a silent button.
 */
function pickVoice(): SpeechSynthesisVoice | null {
  const installed = speechSynthesis.getVoices()
  for (const wanted of [voice.speechLocale, ...voice.speechFallbacks]) {
    const match = installed.find((item) => item.lang.replace('_', '-').toLowerCase().startsWith(wanted.toLowerCase()))
    if (match) return match
  }
  return null
}

/**
 * System voice, no network and no assets. Safari needs a user gesture to start it.
 * `onEnd` also fires when speech is unavailable or fails, so callers can chain the
 * learner's own recording after the model phrase without ever getting stuck.
 */
export function speak(text: string, onEnd?: () => void, rate = 0.95): void {
  if (!('speechSynthesis' in window) || !text) {
    onEnd?.()
    return
  }
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = voice.speechLocale
  const chosen = pickVoice()
  if (chosen) utterance.voice = chosen
  utterance.rate = rate
  if (onEnd) {
    let done = false
    const finish = () => { if (!done) { done = true; onEnd() } }
    utterance.onend = finish
    utterance.onerror = finish
  }
  speechSynthesis.cancel()
  speechSynthesis.speak(utterance)
}

export function stopSpeaking(): void {
  if ('speechSynthesis' in window) speechSynthesis.cancel()
}
