import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Выбор голоса: пол, качество и главное — язык.
 *
 * Проверяется мокнутым `speechSynthesis`, потому что настоящий зависит от того, что
 * человек установил в систему, и на разных машинах отвечает по-разному. Ровно из-за
 * этого и появился баг, который здесь закреплён: если голоса для языка нет, браузер
 * всё равно произносит текст — тем голосом, что нашёлся, — и испанская фраза звучит с
 * английской фонетикой. Пользователи так и говорили: «неправильное произношение».
 */

interface FakeVoice {
  name: string
  lang: string
  voiceURI: string
  default: boolean
  localService: boolean
}

/** Мокнутый `speechSynthesis` — с типом, который знает про `mock.calls`. */
const synthesis = () =>
  (globalThis as unknown as { speechSynthesis: { speak: ReturnType<typeof vi.fn> } }).speechSynthesis

const voice = (name: string, lang: string, uri = name): FakeVoice =>
  ({ name, lang, voiceURI: uri, default: false, localService: true })

/** Голоса ставятся до импорта модуля: он читает `navigator` на уровне файла. */
function install(voices: FakeVoice[], userAgent = 'Macintosh'): void {
  const store = new Map<string, string>()
  vi.stubGlobal('navigator', { userAgent })
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value) },
    removeItem: (key: string) => { store.delete(key) },
  })
  vi.stubGlobal('speechSynthesis', {
    getVoices: () => voices,
    speak: vi.fn(),
    cancel: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })
  vi.stubGlobal('window', globalThis)
  vi.stubGlobal('SpeechSynthesisUtterance', class {
    text: string
    lang = ''
    rate = 1
    voice: unknown = null
    onend: (() => void) | null = null
    onerror: (() => void) | null = null
    constructor(text: string) { this.text = text }
  })
}

/**
 * Эталонные хэши, посчитанные питоновским `voice-build.py`.
 *
 * Вписаны числами намеренно. Первая версия теста считала хэш своей копией функции из
 * приложения — и пропустила настоящий баг: в JS битовые операции знаковые, хэш выходил
 * отрицательным и не совпадал с манифестом. Копия ошибки совпадает с ошибкой всегда,
 * поэтому сверяться надо с тем, что записано на диск.
 */
const PYTHON_HASH: Record<string, string> = {
  'A fin de mes estoy sin blanca.': 'f8c297b2',
  'I get up late on Sunday.': '0d15d218',
}

const APPLE_VOICES = [
  // Настоящие
  voice('Дэниэл', 'en-GB'), voice('Саманта', 'en-US'), voice('Карен', 'en-AU'),
  voice('Моника', 'es-ES'), voice('Паулина', 'es-MX'),
  // Мультяшные, которых macOS ставит рядом
  voice('Зарвокс', 'en-US'), voice('Виолончель', 'en-US'), voice('Бах', 'en-US'),
  voice('Eddy (испанский (Испания))', 'es-ES'), voice('Grandma (испанский (Испания))', 'es-ES'),
]

describe('выбор голоса', () => {
  beforeEach(() => { vi.resetModules(); vi.unstubAllGlobals() })

  it('со вшитой озвучкой оба голоса доступны независимо от системы', async () => {
    // Испанского мужского голоса в системе может не быть вовсе — записи в сборке есть,
    // и строка «Мужской» обязана остаться доступной.
    install([voice('Моника', 'es-ES')])
    const speech = await import('./speech')
    expect(speech.availableGenders('es')).toEqual(['female', 'male'])
    expect(speech.hasBuiltInVoice('es')).toBe(true)
  })

  it('оставляет два голоса — мужской и женский', async () => {
    install(APPLE_VOICES)
    const speech = await import('./speech')
    expect(speech.availableGenders('en')).toEqual(['female', 'male'])
    expect(speech.voiceByGender('male', 'en')?.name).toBe('Дэниэл')
    expect(speech.voiceByGender('female', 'en')?.name).toBe('Саманта')
  })

  it('не предлагает мультяшные синтезаторы', async () => {
    install(APPLE_VOICES)
    const speech = await import('./speech')
    const names = speech.voicesFor('en').map((item) => item.name)
    expect(names).not.toContain('Зарвокс')
    expect(names).not.toContain('Виолончель')
    // Голоса-персонажи Apple для испанского — та же история, и их тоже быть не должно.
    expect(speech.voicesFor('es').map((item) => item.name)).toEqual(['Моника', 'Паулина'])
  })

  it('берёт голос точной локали раньше запасной', async () => {
    install(APPLE_VOICES)
    const speech = await import('./speech')
    // Курс испанский из Испании: Моника (es-ES) вперёд Паулины (es-MX).
    expect(speech.voiceByGender('female', 'es')?.name).toBe('Моника')
  })

  it('предпочитает улучшенный вариант облегчённому', async () => {
    install([
      { ...voice('Samantha', 'en-US', 'com.apple.ttsbundle.Samantha-compact'), name: 'Samantha' },
      { ...voice('Samantha', 'en-US', 'com.apple.voice.enhanced.en-US.Samantha'), name: 'Samantha (Enhanced)' },
      voice('Daniel', 'en-GB'),
    ])
    const speech = await import('./speech')
    expect(speech.voiceByGender('female', 'en')?.voiceURI).toContain('enhanced')
  })

  it('для языка без голоса молчит, а не читает чужим', async () => {
    // Главный случай: испанский курс на устройстве, где испанского голоса нет.
    install([voice('Саманта', 'en-US'), voice('Дэниэл', 'en-GB')])
    const speech = await import('./speech')
    speech.setVoiceLanguage('es')

    expect(speech.hasVoice('es')).toBe(false)
    // Системных голосов для языка нет; выбор пола при этом остаётся, потому что его
    // теперь определяет вшитая озвучка, а не система.
    expect(speech.voicesFor('es')).toEqual([])

    const ended = vi.fn()
    speech.speak('Hola, ¿qué tal?', ended)
    // Ничего не произнесено, и цепочка, которая ждёт конца речи, всё равно продолжена.
    expect(synthesis().speak).not.toHaveBeenCalled()
    expect(ended).toHaveBeenCalled()
  })

  it('для языка с голосом произносит именно им', async () => {
    install(APPLE_VOICES)
    const speech = await import('./speech')
    speech.setVoiceLanguage('es')
    speech.chooseGender('female', 'es')
    speech.speak('Hola')

    const synth = synthesis()
    expect(synth.speak).toHaveBeenCalledTimes(1)
    const said = synth.speak.mock.calls[0][0] as { lang: string; voice: FakeVoice }
    expect(said.lang).toBe('es-ES')
    expect(said.voice.name).toBe('Моника')
  })

  it('слова списка читает вшитый голос, а не система', async () => {
    install(APPLE_VOICES)
    const played: string[] = []
    class FakeAudio {
      src: string
      // Пустой `new Audio()` — проверка формата, а не запрос файла: её не считаем.
      constructor(src: string) { this.src = src; if (src) played.push(src) }
      addEventListener() {}
      pause() {}
      play() { return Promise.resolve() }
    }
    vi.stubGlobal('Audio', FakeAudio)

    const speech = await import('./speech')
    speech.setVoiceLanguage('en')
    speech.chooseGender('male', 'en')

    expect(speech.speakBuiltIn('water')).toBe(true)
    expect(played).toEqual(['voice/en/male/water.opus'])
    // Система при этом молчит: голос уже прозвучал из файла.
    expect(synthesis().speak).not.toHaveBeenCalled()

    // А вот на многословную единицу отдельного файла нет: в списке 3000 все записи
    // однословные, и раньше приложение впустую просило `all-right.opus`. Такой текст
    // читается спрайтом главы, а если его там нет — системой.
    expect(speech.speakBuiltIn('all right')).toBe(false)
    expect(played).toEqual(['voice/en/male/water.opus'])
  })

  it('испанское слово читает свой файл, и диакритика в имени цела', async () => {
    install(APPLE_VOICES)
    vi.stubGlobal('Audio', class { addEventListener() {} pause() {} play() { return Promise.resolve() } })
    const speech = await import('./speech')
    // До 15.09.2026 испанского в списке озвученных языков не было, и кнопка 🔊 на
    // карточке просеивания падала в системный синтез. Теперь у испанского свой
    // частотный список и свои файлы.
    expect(speech.builtInVoiceURL('agua', 'female', 'es')).toBe('voice/es/female/agua.opus')
    // Буквы с надстрочными знаками остаются как есть: имя файла не транслитерируется,
    // иначе `día.opus` никогда бы не нашёлся.
    expect(speech.builtInVoiceURL('día', 'male', 'es')).toBe('voice/es/male/día.opus')
    // А многословная единица по-прежнему без файла — её читает спрайт главы.
    expect(speech.builtInVoiceURL('buenos días', 'male', 'es')).toBeNull()
  })

  it('фразу уровня читает спрайт, а не система', async () => {
    install(APPLE_VOICES)
    const created: Array<{ src: string; currentTime: number; played: boolean }> = []
    class FakeAudio {
      src: string
      currentTime = 0
      readyState = 1
      played = false
      constructor(src: string) {
        this.src = src
        // Пустой `new Audio()` — это проверка «умеет ли браузер формат», файла она не
        // просит, и в списке запрошенного ей не место.
        if (src) created.push(this as unknown as { src: string; currentTime: number; played: boolean })
      }
      addEventListener() {}
      pause() {}
      play() { this.played = true; return Promise.resolve() }
    }
    vi.stubGlobal('Audio', FakeAudio)
    const phrase = 'I get up late on Sunday.'
    vi.stubGlobal('fetch', vi.fn(async (url: string) => ({
      ok: url.includes('phrases-a1.json'),
      json: async () => ({ [PYTHON_HASH[phrase]]: ['en-a1-every-day', 12.5, 1.8] }),
    })))

    const speech = await import('./speech')
    speech.setVoiceLanguage('en')
    speech.chooseGender('female', 'en')

    // До загрузки манифеста звук идёт прежним путём.
    expect(speech.speakPhrase(phrase, 'A1')).toBe(false)

    await speech.preloadPhraseVoice('A1')
    expect(speech.speakPhrase(phrase, 'A1')).toBe(true)
    expect(created).toHaveLength(1)
    expect(created[0].src).toBe('voice/en/female/en-a1-every-day.opus')
    expect(created[0].played, 'play вызывается сразу, в такте нажатия').toBe(true)

    // Перемотка — после старта: Safari разрешает звук только в том же такте, что и
    // нажатие, поэтому ждать `loadedmetadata` перед `play()` нельзя.
    await Promise.resolve()
    await Promise.resolve()
    expect(created[0].currentTime).toBe(12.5)
    expect(synthesis().speak).not.toHaveBeenCalled()

    // Фраза, которой в манифесте нет, спрайтом не читается.
    expect(speech.speakPhrase('Something else entirely.', 'A1')).toBe(false)
  })

  it('если файл не заиграл, дочитывает система, а не тишина', async () => {
    // Прежде любая осечка — блокировка автозапуска, сеть, битый файл — давала тишину:
    // человек нажимал кнопку, а звука не было. Это и значило «голос не слышно».
    install(APPLE_VOICES)
    class BrokenAudio {
      currentTime = 0
      readyState = 1
      constructor(public src: string) {}
      addEventListener() {}
      pause() {}
      play() { return Promise.reject(new Error('NotAllowedError')) }
    }
    vi.stubGlobal('Audio', BrokenAudio)
    const phrase = 'I get up late on Sunday.'
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({ [PYTHON_HASH[phrase]]: ['en-a1-every-day', 12.5, 1.8] }),
    })))

    const speech = await import('./speech')
    speech.setVoiceLanguage('en')
    await speech.preloadPhraseVoice('A1')
    expect(speech.speakPhrase(phrase, 'A1')).toBe(true)

    await new Promise((resolve) => setTimeout(resolve, 10))
    expect(synthesis().speak, 'фраза дочитана системным голосом').toHaveBeenCalledTimes(1)
  })

  it('уровень без озвучки не ломает воспроизведение', async () => {
    install(APPLE_VOICES)
    vi.stubGlobal('Audio', class { addEventListener() {} pause() {} play() { return Promise.resolve() } })
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, json: async () => ({}) })))
    const speech = await import('./speech')
    speech.setVoiceLanguage('en')
    await speech.preloadPhraseVoice('C1')
    expect(speech.speakPhrase('Whatever it is.', 'C1')).toBe(false)
  })

  it('браузер без ogg/opus читает системой, а не молчит', async () => {
    // Safari научился ogg/opus только в 18.4 (март 2025). На iPhone постарше файл не
    // играет вовсе, и правильный ответ — не тратить на него попытку, а сразу читать
    // системным голосом: человек услышит механическую речь, но услышит.
    install(APPLE_VOICES)
    vi.stubGlobal('Audio', class {
      addEventListener() {}
      pause() {}
      play() { return Promise.resolve() }
      canPlayType() { return '' }
    })
    const speech = await import('./speech')
    speech.setVoiceLanguage('en')

    expect(speech.hasBuiltInVoice('en'), 'вшитый голос недоступен на этом браузере').toBe(false)
    expect(speech.builtInVoiceURL('water', 'male')).toBe(null)
    expect(speech.speakBuiltIn('water')).toBe(false)

    speech.say('water')
    expect(synthesis().speak).toHaveBeenCalledTimes(1)
  })

  it('за файлом на целую фразу не ходит — их озвучены только слова', async () => {
    // Отдельными файлами озвучен список 3000 слов, и там нет ничего многословного.
    install(APPLE_VOICES)
    vi.stubGlobal('Audio', class { addEventListener() {} pause() {} play() { return Promise.resolve() } })
    const speech = await import('./speech')
    speech.setVoiceLanguage('en')

    expect(speech.builtInVoiceURL('water', 'male')).toBe('voice/en/male/water.opus')
    expect(speech.builtInVoiceURL('And it was not a joke.', 'male')).toBe(null)
    expect(speech.speakBuiltIn('And it was not a joke.')).toBe(false)
  })

  it('выбор пола хранится отдельно для каждого языка', async () => {
    install(APPLE_VOICES)
    const speech = await import('./speech')
    speech.chooseGender('male', 'en')
    speech.chooseGender('female', 'es')
    expect(speech.chosenGender('en')).toBe('male')
    expect(speech.chosenGender('es')).toBe('female')
  })
})
