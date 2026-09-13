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
 * Настоящие голоса, по именам, и пол каждого.
 *
 * Список «что исключить» — очевидный способ, и он не работает: из 41 английского голоса
 * macOS 35 — это мультяшные синтезаторы девяностых (Зарвокс, Бах, Виолончель), причём
 * браузер отдаёт их имена переведёнными на язык интерфейса. Чёрный список, написанный
 * по-английски, пропускает их все.
 *
 * Поэтому правило обратное: предлагаются только настоящие голоса, в обоих написаниях,
 * какие может вернуть браузер. Неизвестный — значит не предлагается; это безопасная
 * сторона ошибки: хуже отсутствия хорошего голоса в списке только урок, прочитанный
 * роботом.
 *
 * Пол здесь же, потому что Web Speech API его не сообщает вовсе, а выбор из двух —
 * мужского и женского — это то, чем список голосов должен быть. Шесть имён, из которых
 * человек всё равно не знает, кто как звучит, выбором не являются.
 */
export type VoiceGender = 'male' | 'female'

const VOICE_GENDER: Record<string, VoiceGender> = {
  // Английские — мужские
  daniel: 'male', дэниэл: 'male', alex: 'male', алекс: 'male', oliver: 'male', оливер: 'male',
  aaron: 'male', аарон: 'male', evan: 'male', эван: 'male', nathan: 'male', нейтан: 'male',
  rishi: 'male', риши: 'male', fred: 'male', фред: 'male', tom: 'male', том: 'male',
  arthur: 'male', артур: 'male', gordon: 'male', гордон: 'male', ryan: 'male', райан: 'male',
  guy: 'male', george: 'male', джордж: 'male', james: 'male', джеймс: 'male',
  // Английские — женские
  samantha: 'female', саманта: 'female', karen: 'female', карен: 'female',
  moira: 'female', мойра: 'female', tessa: 'female', тесса: 'female',
  fiona: 'female', фиона: 'female', serena: 'female', серена: 'female',
  kate: 'female', кейт: 'female', ava: 'female', ава: 'female',
  allison: 'female', эллисон: 'female', susan: 'female', сьюзан: 'female',
  nicky: 'female', ники: 'female', zoe: 'female', зои: 'female',
  noelle: 'female', ноэль: 'female', catherine: 'female', кэтрин: 'female',
  martha: 'female', марта: 'female', sonia: 'female', соня: 'female',
  libby: 'female', jenny: 'female', aria: 'female', michelle: 'female',
  // Испанские — мужские
  jorge: 'male', хорхе: 'male', juan: 'male', хуан: 'male', diego: 'male', диего: 'male',
  carlos: 'male', карлос: 'male', enrique: 'male', энрике: 'male', pablo: 'male', пабло: 'male',
  alvaro: 'male', álvaro: 'male', альваро: 'male', miguel: 'male', мигель: 'male',
  // Испанские — женские
  monica: 'female', 'mónica': 'female', моника: 'female', paulina: 'female', паулина: 'female',
  marisol: 'female', 'марисоль': 'female', angelica: 'female', 'angélica': 'female', анхелика: 'female',
  soledad: 'female', соледад: 'female', isabela: 'female', изабела: 'female',
  elvira: 'female', эльвира: 'female', laura: 'female', лаура: 'female',
  esperanza: 'female', эсперанса: 'female', dalia: 'female', далия: 'female',
}

const REAL_VOICES = new Set(Object.keys(VOICE_GENDER))

/**
 * Насколько голос хорош — по тому, что о нём говорит система.
 *
 * Apple ставит рядом с именем вариант синтеза: `-compact` звучит механически, а
 * `enhanced`, `premium` и голоса Siri — почти как человек. В Safari это видно в
 * `voiceURI` (`com.apple.voice.enhanced.es-ES.Monica`), и тогда выбирается лучший.
 * В Chrome на macOS `voiceURI` равен имени, признака нет, и все варианты равны —
 * поэтому признак отсутствия качества никогда не понижает голос, он только повышает.
 */
function quality(item: SpeechSynthesisVoice): number {
  const uri = `${item.voiceURI} ${item.name}`.toLowerCase()
  if (/siri/.test(uri)) return 3
  if (/premium/.test(uri)) return 3
  if (/enhanced/.test(uri)) return 2
  if (/compact/.test(uri)) return 0
  return 1
}

/**
 * Whether the allowlist above applies at all.
 *
 * It exists because Apple ships dozens of joke synthesisers next to the real voices.
 * Nobody else does: Android installs a handful of Google voices, Windows a couple of
 * Microsoft ones, and all of them are real — but none is named anything the list has
 * heard of. Applied there, the allowlist empties the settings screen instead of tidying
 * it, and the learner ends up with no voice to pick at all.
 */
export const APPLE = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent)

/**
 * When two entries are the same voice.
 *
 * On Apple the locale in brackets is decoration: "Eddy (испанский (Испания))" is Eddy.
 * On Android the brackets are the entire distinction — "español (España)" and
 * "español (México)" are different voices, and folding them together leaves a list with
 * a single line on it.
 */
const identity = (name: string): string =>
  (APPLE ? name.split(' (')[0] : name).trim().toLowerCase()

/** What a voice is called on screen — the same rule, kept in one place. */
export const voiceLabel = (item: SpeechSynthesisVoice): string =>
  APPLE ? item.name.split(' (')[0] : item.name

const matches = (item: SpeechSynthesisVoice, wanted: string): boolean =>
  item.lang.replace('_', '-').toLowerCase().startsWith(wanted.toLowerCase())

/** Все настоящие голоса языка, лучшие варианты первыми. */
export function voicesFor(code: LanguageCode = language): SpeechSynthesisVoice[] {
  if (!('speechSynthesis' in window)) return []
  const wanted = languageOf(code)
  const installed = speechSynthesis.getVoices()
  const locales = [wanted.speechLocale, ...wanted.speechFallbacks]

  const forLocale = (item: SpeechSynthesisVoice): number =>
    locales.findIndex((locale) => matches(item, locale))

  const found = installed.filter((item) => forLocale(item) >= 0 && REAL_VOICES.has(identity(item.name)))
  // Точная локаль раньше запасной, лучший вариант синтеза раньше облегчённого:
  // испанский курс должен звучать Моникой из Испании, а не Паулиной из Мексики.
  found.sort((a, b) => forLocale(a) - forLocale(b) || quality(b) - quality(a))

  const seen = new Set<string>()
  return found.filter((item) => {
    const name = identity(item.name)
    if (seen.has(name)) return false
    seen.add(name)
    return true
  })
}

/**
 * Голос по полу: один мужской и один женский, лучшие из установленных.
 *
 * Кристиан 13.09.2026: «оставил бы два голоса, мужской и женский». Шесть имён выбором не
 * были — по имени нельзя понять, как голос звучит, а послушать все шесть никто не станет.
 */
export function voiceByGender(gender: VoiceGender, code: LanguageCode = language): SpeechSynthesisVoice | null {
  return voicesFor(code).find((item) => VOICE_GENDER[identity(item.name)] === gender) ?? null
}

/**
 * Облегчённый ли это голос — тот самый, что звучит роботом.
 *
 * Apple ставит по умолчанию вариант `compact`: он весит мало и синтезирует механически.
 * Рядом в системе бесплатно доступны Enhanced, Premium и голоса Siri, и звучат они почти
 * как человек, но их надо один раз скачать. В Safari вариант виден в `voiceURI`
 * (`com.apple.ttsbundle…compact`), и тогда приложение может сказать об этом прямо.
 *
 * В Chrome на macOS `voiceURI` равен имени и не содержит ничего — там `null`, и экран
 * молчит, вместо того чтобы гадать. Неизвестно не значит «плохо».
 */
export function isCompact(item: SpeechSynthesisVoice | null): boolean | null {
  if (!item) return null
  const uri = `${item.voiceURI} ${item.name}`.toLowerCase()
  if (/compact/.test(uri)) return true
  if (/enhanced|premium|siri/.test(uri)) return false
  return null
}

/** Какие из двух голосов вообще есть на этом устройстве. */
export function availableGenders(code: LanguageCode = language): VoiceGender[] {
  return (['female', 'male'] as VoiceGender[]).filter((gender) => voiceByGender(gender, code) !== null)
}

/**
 * Есть ли для языка хоть один настоящий голос.
 *
 * Главный вопрос этого файла, и до 13.09.2026 его никто не задавал. Если испанского
 * голоса в системе нет, `speechSynthesis` всё равно произносит текст — тем голосом,
 * который есть, то есть английским или русским. Получается испанская фраза с чужой
 * фонетикой; пользователи так и говорили — «неправильное произношение». Молчание в этом
 * месте полезнее: человек учит звучание, и неверное звучание хуже, чем никакое.
 */
export function hasVoice(code: LanguageCode = language): boolean {
  return voicesFor(code).length > 0
}

// MARK: - The learner's own choice
//
// Kept per language: the voice that reads Spanish has nothing to do with the one that
// reads English, and picking one should not silently change the other.

const KEY = 'english-coach.voice'

const storedGender = (code: LanguageCode = language): VoiceGender | null => {
  try {
    const value = localStorage.getItem(`${KEY}.${code}`)
    return value === 'male' || value === 'female' ? value : null
  } catch {
    return null
  }
}

export function chosenGender(code: LanguageCode = language): VoiceGender | null {
  return storedGender(code)
}

export function chooseGender(gender: VoiceGender | null, code: LanguageCode = language): void {
  try {
    if (gender) localStorage.setItem(`${KEY}.${code}`, gender)
    else localStorage.removeItem(`${KEY}.${code}`)
  } catch {
    // A blocked storage costs the preference, not the sound.
  }
}

/**
 * Что будет говорить: выбранный пол, если такой голос есть, иначе любой настоящий голос
 * языка, иначе ничего — и тогда приложение молчит, а не читает чужим голосом.
 */
export function activeVoice(): SpeechSynthesisVoice | null {
  const gender = storedGender()
  if (gender) {
    const mine = voiceByGender(gender)
    if (mine) return mine
  }
  return voicesFor()[0] ?? null
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
  const chosen = activeVoice()
  // Нет голоса для этого языка — молчим. Прежде здесь всё равно произносилось, и
  // система читала испанский тем голосом, что нашёлся: английским или русским.
  if (!chosen) {
    onEnd?.()
    return
  }
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = voice.speechLocale
  utterance.voice = chosen
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
