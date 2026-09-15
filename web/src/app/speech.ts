import { DEFAULT_LANGUAGE, languageOf, voiceWordPath } from '../core'
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

/**
 * Какие из двух голосов доступны.
 *
 * Со вшитой озвучкой — оба, всегда: файлы лежат в сборке и от системы не зависят. Это
 * важно именно для испанского, где системного мужского голоса на устройстве может не
 * быть вовсе — раньше строка «Мужской» там просто не показывалась, хотя записи есть.
 */
export function availableGenders(code: LanguageCode = language): VoiceGender[] {
  if (hasBuiltInVoice(code)) return ['female', 'male']
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
 * Слова списка 3000 озвучены заранее и лежат в самом приложении.
 *
 * Кристиан 13.09.2026: «вшей в приложение голос, чтобы не нужно было настраивать».
 * Системный синтез этого не даёт: по умолчанию Apple ставит облегчённый вариант, он
 * звучит роботом, а живой надо скачивать руками в настройках телефона. Поэтому для
 * слов звук не синтезируется на устройстве, а взят из файла: два голоса, мужской и
 * женский, записаны заранее (Piper, голоса ryan и lessac) и весят 10 МБ на оба.
 *
 * Файлы не входят в предзагрузку — иначе первый запуск тянул бы десять мегабайт, — но
 * остаются офлайн после первого прослушивания: их забирает runtime-кэш service worker.
 *
 * Фразы уроков по-прежнему читает система: их пятнадцать тысяч, и заранее озвучить их
 * значит увезти в сборку триста мегабайт.
 */
/**
 * Языки, для которых озвучен список частых слов.
 *
 * Испанский добавлен 15.09.2026 вместе со своим частотным списком: до этого кнопка 🔊 на
 * карточке просеивания падала в системный синтез — тот самый, из-за которого озвучку и
 * вшили в приложение.
 */
const BUILT_IN_WORD_LANGUAGES: LanguageCode[] = ['en', 'es']
/** Языки, для которых озвучены фразы уроков — то есть почти всё, что приложение говорит. */
const BUILT_IN_PHRASE_LANGUAGES: LanguageCode[] = ['en', 'es']

/**
 * Умеет ли браузер играть вшитые файлы.
 *
 * Ogg/Opus появился в Safari только в 18.4 (март 2025); на iPhone постарше такой файл
 * не играет вовсе. Спрашивать об этом браузер дешевле, чем выяснять осечкой: иначе на
 * каждое нажатие уходил бы запрос, потом ошибка, и лишь потом звук — с задержкой.
 *
 * Если спросить не удалось, считаем, что умеет: осторожность здесь обошлась бы дороже
 * попытки — файл всё равно подстрахован системным синтезом, а отказ от него без причины
 * лишил бы человека того самого живого голоса, ради которого всё и сделано.
 */
let canPlayFiles: boolean | null = null
function playsBuiltIn(): boolean {
  if (canPlayFiles === null) {
    try {
      const probe = new Audio()
      canPlayFiles = typeof probe.canPlayType !== 'function'
        || probe.canPlayType('audio/ogg; codecs=opus') !== ''
    } catch {
      canPlayFiles = true
    }
  }
  return canPlayFiles
}

/** Есть ли у языка своя озвучка в сборке — от системных голосов она не зависит. */
export function hasBuiltInVoice(code: LanguageCode = language): boolean {
  if (!playsBuiltIn()) return false
  return BUILT_IN_PHRASE_LANGUAGES.includes(code) || BUILT_IN_WORD_LANGUAGES.includes(code)
}

export function builtInVoiceURL(word: string, gender: VoiceGender, code: LanguageCode = language): string | null {
  if (!BUILT_IN_WORD_LANGUAGES.includes(code) || !playsBuiltIn()) return null
  // Отдельными файлами озвучен список 3000 слов, и в нём все записи однословные. Без
  // этой проверки каждая фраза, не найденная в спрайте, сперва просила несуществующий
  // файл `and-it-was-not-a-joke.opus` — запрос впустую и задержка перед звуком.
  if (/\s/.test(word.trim())) return null
  return voiceWordPath(word, code, gender)
}

let player: HTMLAudioElement | null = null

/**
 * Произнести слово вшитым голосом. `false` — файла нет, и вызывающий переходит к синтезу.
 *
 * Ошибка загрузки не остаётся молчанием: `onEnd` вызывается в любом случае, потому что
 * на нём висят цепочки вроде «сказал — теперь запиши себя».
 */
export function speakBuiltIn(word: string, onEnd?: () => void): boolean {
  const gender = storedGender() ?? 'female'
  const url = builtInVoiceURL(word, gender)
  if (!url) return false
  try {
    stopSpeaking()
    player?.pause()
    const audio = new Audio(url)
    player = audio
    let finished = false
    // Осечка файла — не повод молчать: дочитывает система.
    const fallback = () => {
      if (finished) return
      finished = true
      speak(word, onEnd)
    }
    audio.addEventListener('ended', () => { finished = true; onEnd?.() })
    audio.addEventListener('error', fallback, { once: true })
    void audio.play().catch(fallback)
    return true
  } catch {
    return false
  }
}

/**
 * Фразы уроков озвучены заранее и склеены в спрайты — по одному файлу на главу.
 *
 * Файлами это не собрать: фраз тридцать восемь тысяч, и по файлу на каждую — это
 * семьдесят шесть тысяч штук на два голоса, больше, чем принимает хостинг статики.
 * Глава весит один-три мегабайта, тянется за раз и целиком остаётся в кэше, а внутрь
 * файла браузер переходит по времени точно — проверено, расхождение ноль миллисекунд.
 *
 * Манифест уровня (хэш фразы → глава, старт, длительность) подгружается один раз, когда
 * человек входит в режим со звуком. Пока он не загружен, `speakPhrase` возвращает `false`
 * и звук идёт прежним путём — вшитым словом или системным синтезом.
 */
type PhraseMark = [chapter: string, start: number, duration: number]

const manifests = new Map<string, Record<string, PhraseMark>>()
const loading = new Map<string, Promise<void>>()

/**
 * Хэш фразы. Тот же djb2, что в `scripts/voice-build.py`: синхронный, без крипто-API.
 *
 * `>>> 0` здесь обязателен, и это не украшение. Битовые операции в JS работают со
 * знаковым int32, поэтому `& 0xFFFFFFFF` беззнаковым числа не делает: тот же djb2
 * возвращал `-73d684e` там, где Python отдаёт `f8c297b2`, и ни одна фраза не находилась
 * в манифесте. Поймано живой проверкой в браузере — тест это пропустил, потому что
 * повторял ту же ошибку своей копией функции.
 */
function phraseHash(text: string): string {
  let value = 5381
  for (const char of text) {
    value = ((value * 33) ^ char.codePointAt(0)!) >>> 0
  }
  return value.toString(16).padStart(8, '0')
}

const manifestKey = (level: string, code: LanguageCode, gender: VoiceGender): string =>
  `${code}/${gender}/${level.toLowerCase()}`

/**
 * Подгрузить таймкоды уровня. Зовётся при входе в режим со звуком; повторные вызовы
 * ничего не стоят, а отсутствие файла — не ошибка: уровень может быть просто не озвучен.
 */
export function preloadPhraseVoice(level: string, code: LanguageCode = language): Promise<void> {
  const gender = storedGender() ?? 'female'
  const key = manifestKey(level, code, gender)
  if (!playsBuiltIn()) return Promise.resolve()
  if (manifests.has(key)) return Promise.resolve()
  const already = loading.get(key)
  if (already) return already

  const task = fetch(`voice/${code}/${gender}/phrases-${level.toLowerCase()}.json`)
    .then((response) => (response.ok ? response.json() : {}))
    .then((marks) => { manifests.set(key, marks as Record<string, PhraseMark>) })
    .catch(() => { manifests.set(key, {}) })
    .finally(() => { loading.delete(key) })
  loading.set(key, task)
  return task
}

/**
 * Произнести фразу из спрайта. `false` — таймкода нет, и вызывающий идёт дальше по
 * цепочке: вшитое слово, затем системный синтез.
 */
export function speakPhrase(text: string, level: string, onEnd?: () => void): boolean {
  const gender = storedGender() ?? 'female'
  const marks = manifests.get(manifestKey(level, language, gender))
  const mark = marks?.[phraseHash(text.trim())]
  if (!mark) return false

  const [chapter, start, duration] = mark
  try {
    stopSpeaking()
    const audio = new Audio(`voice/${language}/${gender}/${chapter}.opus`)
    player = audio
    let finished = false
    const finish = () => {
      if (finished) return
      finished = true
      audio.pause()
      onEnd?.()
    }

    /**
     * Не заигралось — читаем системным голосом, а не молчим.
     *
     * Прежде здесь был `catch(finish)`: любая осечка — блокировка автозапуска, сеть,
     * битый файл — превращалась в тишину, и человек нажимал кнопку, а звука не было.
     * Тишина хуже механического голоса: она выглядит как поломка и ничему не учит.
     */
    const fallback = () => {
      if (finished) return
      finished = true
      audio.pause()
      speak(text, onEnd)
    }

    // `play()` вызывается сразу, а перемотка — после начала воспроизведения.
    //
    // Порядок именно такой из-за Safari: он разрешает звук только в том же такте, что
    // и нажатие. Прежний код ждал `loadedmetadata`, то есть к моменту `play()` жест был
    // уже «потерян», и на iPhone воспроизведение блокировалось без всякой ошибки —
    // именно это и значило «нажимаю, а голоса не слышно».
    // Перемотка ставится дважды. Сразу — чтобы не услышать начало чужой фразы: глава
    // часто уже в кэше, и тогда первая попытка срабатывает. И ещё раз после старта,
    // потому что на свежем файле метаданных в этот момент может не быть, и браузер
    // молча её проглатывает.
    const seek = () => { try { audio.currentTime = start } catch { /* метаданных ещё нет */ } }
    seek()
    audio.addEventListener('error', fallback, { once: true })
    void audio.play().then(() => {
      if (Math.abs(audio.currentTime - start) > 0.25) seek()
      // Конец фразы — по таймеру: внутри спрайта событие `ended` придёт только в конце
      // всей главы, то есть через минуты.
      window.setTimeout(finish, duration * 1000 + 140)
    }).catch(fallback)
    return true
  } catch {
    return false
  }
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
  if (player) { player.pause(); player = null }
}

/**
 * Единственная точка озвучки для экранов: спрайт фразы, затем вшитое слово, затем
 * системный синтез.
 *
 * Порядок именно такой, и он же — порядок качества. Заранее записанное звучит живым
 * голосом и одинаково на любом устройстве; система читает облегчённым голосом, который
 * Кристиан справедливо назвал роботом, и её очередь — последняя.
 */
export function say(text: string, level?: string, onEnd?: () => void, rate = 0.95): void {
  if (level && speakPhrase(text, level, onEnd)) return
  if (speakBuiltIn(text, onEnd)) return
  speak(text, onEnd, rate)
}
