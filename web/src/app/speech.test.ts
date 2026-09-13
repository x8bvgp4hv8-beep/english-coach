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
    expect(speech.availableGenders('es')).toEqual([])

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
      constructor(src: string) { this.src = src; played.push(src) }
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

    // Многословные единицы названы так же, как при генерации.
    speech.speakBuiltIn("all right")
    expect(played.at(-1)).toBe('voice/en/female/all-right.opus'.replace('female', 'male'))
  })

  it('для языка без вшитой озвучки возвращает false', async () => {
    install(APPLE_VOICES)
    vi.stubGlobal('Audio', class { addEventListener() {} pause() {} play() { return Promise.resolve() } })
    const speech = await import('./speech')
    // Испанской озвучки в сборке нет: там остаётся системный синтез.
    expect(speech.builtInVoiceURL('agua', 'female', 'es')).toBeNull()
    speech.setVoiceLanguage('es')
    expect(speech.speakBuiltIn('agua')).toBe(false)
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
