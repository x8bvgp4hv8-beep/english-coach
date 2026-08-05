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
let language: LanguageCode = DEFAULT_LANGUAGE

export function setVoiceLanguage(code: LanguageCode): void {
  language = code
  voice = languageOf(code)
}

/**
 * Apple ships a set of character voices — Eddy, Grandma, Rocko and friends — in every
 * language, and they sort ahead of the real one. Reading a model phrase in a cartoon
 * voice teaches the wrong thing, so they are never chosen automatically. They stay in
 * the picker: it is the learner's app, and someone may want Grandma.
 */
const NOVELTY = new Set([
  'eddy', 'flo', 'grandma', 'grandpa', 'reed', 'rocko', 'sandy', 'shelley',
  'albert', 'bad news', 'bahh', 'bells', 'boing', 'bubbles', 'cellos', 'wobble',
  'fred', 'good news', 'jester', 'junior', 'kathy', 'organ', 'superstar', 'ralph',
  'trinoids', 'whisper', 'zarvox',
])

/** "Eddy (испанский (Испания))" is the same voice as "Eddy" — the suffix is decoration. */
const baseName = (name: string): string => name.split(' (')[0].trim().toLowerCase()

const matches = (item: SpeechSynthesisVoice, wanted: string): boolean =>
  item.lang.replace('_', '-').toLowerCase().startsWith(wanted.toLowerCase())

/** Every installed voice that can speak the current language, the plain ones first. */
export function voicesFor(code: LanguageCode = language): SpeechSynthesisVoice[] {
  if (!('speechSynthesis' in window)) return []
  const wanted = languageOf(code)
  const installed = speechSynthesis.getVoices()
  const found: SpeechSynthesisVoice[] = []
  for (const locale of [wanted.speechLocale, ...wanted.speechFallbacks]) {
    for (const item of installed) {
      if (matches(item, locale) && !found.includes(item)) found.push(item)
    }
  }
  return found.sort((a, b) => Number(NOVELTY.has(baseName(a.name))) - Number(NOVELTY.has(baseName(b.name))))
}

// MARK: - The learner's own choice
//
// Kept per language: the voice that reads Spanish has nothing to do with the one that
// reads English, and picking one should not silently change the other.

const KEY = 'english-coach.voice'

const storedName = (code: LanguageCode = language): string | null => {
  try { return localStorage.getItem(`${KEY}.${code}`) } catch { return null }
}

export function chosenVoiceName(code: LanguageCode = language): string | null {
  return storedName(code)
}

export function chooseVoice(name: string | null, code: LanguageCode = language): void {
  try {
    if (name) localStorage.setItem(`${KEY}.${code}`, name)
    else localStorage.removeItem(`${KEY}.${code}`)
  } catch {
    // A blocked storage costs the preference, not the sound.
  }
}

/**
 * What will actually speak: the learner's pick if it is still installed, otherwise the
 * best automatic choice, otherwise nothing — in which case the browser reads by
 * `utterance.lang` alone, which is still better than silence.
 */
export function activeVoice(): SpeechSynthesisVoice | null {
  const available = voicesFor()
  if (available.length === 0) return null
  const picked = storedName()
  const mine = picked ? available.find((item) => item.name === picked) : undefined
  if (mine) return mine
  // The system default for the language, when it is not a character voice: on Apple
  // platforms that is Mónica, Daniel or Samantha — the ones meant to be listened to.
  const preferred = available.filter((item) => !NOVELTY.has(baseName(item.name)))
  return preferred.find((item) => item.default) ?? preferred[0] ?? null
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
  const chosen = activeVoice()
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
