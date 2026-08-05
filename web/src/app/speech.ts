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
 * The voices worth learning from, by name.
 *
 * A list of what to exclude was the obvious way round and it does not work: of the 41
 * English voices macOS installs, 35 are cartoons and joke synthesisers from the nineties
 * — Zarvox, Bells, Superstar — and the browser hands their names back translated into
 * the interface language ("Альберт", "Виолончель"). A blocklist written in English lets
 * every one of them through.
 *
 * So the rule is inverted: only the real voices are offered, listed in both spellings the
 * browser can return. Unknown means not offered, which is the safe direction — the worst
 * case is a good voice missing from a list of six, not a lesson read by a robot.
 */
const REAL_VOICES = new Set([
  // English
  'samantha', 'саманта', 'daniel', 'дэниэл', 'alex', 'алекс', 'karen', 'карен',
  'moira', 'мойра', 'rishi', 'риши', 'tessa', 'тесса', 'fiona', 'фиона',
  'serena', 'серена', 'kate', 'кейт', 'oliver', 'оливер', 'ava', 'ава',
  'allison', 'эллисон', 'susan', 'сьюзан', 'nicky', 'ники', 'aaron', 'аарон',
  'zoe', 'зои', 'evan', 'эван', 'nathan', 'нейтан', 'noelle', 'ноэль',
  // Spanish
  'mónica', 'monica', 'моника', 'paulina', 'паулина', 'jorge', 'хорхе',
  'juan', 'хуан', 'diego', 'диего', 'marisol', 'марисоль', 'carlos', 'карлос',
  'angelica', 'angélica', 'анхелика', 'soledad', 'соледад', 'isabela', 'изабела',
])

/** More than this is a list to scroll, not a choice to make. */
const MAX_VOICES = 6

/** "Eddy (испанский (Испания))" is the same voice as "Eddy" — the suffix is decoration. */
const baseName = (name: string): string => name.split(' (')[0].trim().toLowerCase()

const matches = (item: SpeechSynthesisVoice, wanted: string): boolean =>
  item.lang.replace('_', '-').toLowerCase().startsWith(wanted.toLowerCase())

/**
 * The voices worth offering for the current language: real ones only, one entry per
 * name, and never more than a screenful. The exact locale comes first, so a Spanish
 * course lists Mónica before Paulina and not the other way round.
 */
export function voicesFor(code: LanguageCode = language): SpeechSynthesisVoice[] {
  if (!('speechSynthesis' in window)) return []
  const wanted = languageOf(code)
  const installed = speechSynthesis.getVoices()

  const collect = (accept: (item: SpeechSynthesisVoice) => boolean): SpeechSynthesisVoice[] => {
    const found: SpeechSynthesisVoice[] = []
    const seen = new Set<string>()
    for (const locale of [wanted.speechLocale, ...wanted.speechFallbacks]) {
      for (const item of installed) {
        const name = baseName(item.name)
        if (!matches(item, locale) || seen.has(name) || !accept(item)) continue
        seen.add(name)
        found.push(item)
        if (found.length >= MAX_VOICES) return found
      }
    }
    return found
  }

  const real = collect((item) => REAL_VOICES.has(baseName(item.name)))
  if (real.length > 0) return real
  // An unknown system, or Apple renamed something: better a list with a cartoon in it
  // than an empty settings screen. The character voices carry the language in brackets,
  // so at least those can still be kept out.
  return collect((item) => !item.name.includes(' ('))
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
  // On Apple platforms the first real voice for a language is the one meant to be
  // listened to: Mónica, Daniel, Samantha.
  return mine ?? available.find((item) => item.default) ?? available[0] ?? null
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
