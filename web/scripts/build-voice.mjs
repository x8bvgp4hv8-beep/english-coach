/**
 * Озвучка списка 3000 слов — два голоса, прямо в приложение.
 *
 * Зачем файлы, а не синтез на устройстве: системный голос по умолчанию — облегчённый
 * вариант Apple, он звучит роботом, а живой надо скачивать руками в настройках телефона.
 * Кристиан 13.09.2026: «вшей в приложение голос, чтобы не нужно было настраивать».
 *
 * Чем: Piper (MIT), голоса ryan (мужской) и lessac (женский) из открытого набора
 * rhasspy/piper-voices. Генерация локальная, без ключей и сети во время работы
 * приложения; результат — 6000 файлов opus по 1,5–2 КБ, около 10 МБ на оба голоса.
 *
 * Запуск (модели скачиваются в кэш при первом разе, по 60 МБ каждая):
 *
 *   uv tool install piper-tts
 *   node scripts/build-voice.mjs en      # английские 3000
 *   node scripts/build-voice.mjs es      # испанский частотный список
 *
 * Файлы кладутся в `public/voice/en/<male|female>/<слово>.opus`. В предзагрузку
 * service worker они не попадают (см. `globPatterns` в vite.config.ts) — их забирает
 * runtime-кэш при первом прослушивании.
 */
import { execFile, spawn } from 'node:child_process'
import { mkdir, readFile, readdir, rm, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const run = promisify(execFile)
const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')

/**
 * Голоса: имя модели Piper и папка, в которую кладётся результат.
 *
 * Те же модели, что у фраз (`voice-build.py`), иначе слово и фраза читались бы разными
 * дикторами — на слух это звучит как сбой, а не как один курс.
 */
const VOICES = {
  en: [
    { gender: 'male', model: 'en_US-ryan-medium' },
    { gender: 'female', model: 'en_US-lessac-medium' },
  ],
  es: [
    { gender: 'male', model: 'es_ES-davefx-medium' },
    { gender: 'female', model: 'es_MX-claude-high' },
  ],
}

/** Какой список слов озвучивать: файл ищется по префиксу языка. */
const WORDLIST = {
  en: 'en-wordlist-3000.json',
  es: 'es-wordlist-frequent.json',
}

const MODELS_DIR = join(root, '.voice-models')
const HUGGINGFACE = 'https://huggingface.co/rhasspy/piper-voices/resolve/main'

/** Имя файла из слова — то же правило, что в `speech.ts`. */
const fileName = (word) => word.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '')

async function ensureModel(model) {
  const onnx = join(MODELS_DIR, `${model}.onnx`)
  if (existsSync(onnx)) return onnx
  await mkdir(MODELS_DIR, { recursive: true })
  // Имя модели устроено как «es_ES-davefx-medium»: из него собирается путь на Hugging Face.
  const [locale, name, quality] = [model.split('-')[0], model.split('-')[1], model.split('-')[2]]
  const url = `${HUGGINGFACE}/${locale.split('_')[0]}/${locale}/${name}/${quality}/${model}`
  console.log(`качаю модель ${model} (~60 МБ)…`)
  await run('curl', ['-sL', '-o', onnx, `${url}.onnx`])
  await run('curl', ['-sL', '-o', `${onnx}.json`, `${url}.onnx.json`])
  return onnx
}

/**
 * Синтез списка слов одним запуском Piper: слова уходят ему в stdin, файлы называются
 * по тексту — так соответствие «слово → файл» не приходится держать отдельно.
 *
 * Почему `spawn`, а не `execFile`: у `execFile` нет параметра `input`, и он молча его
 * игнорирует — stdin остаётся открытым и пустым, а Piper спит на чтении. Испанский
 * прогон так и висел 14 минут с 0,6 с процессорного времени и ни одним файлом.
 * Поэтому stdin пишется руками и обязательно закрывается: `end()` здесь — не
 * вежливость, а единственный сигнал «слова кончились».
 */
async function synthesize(onnx, words, wav) {
  await new Promise((resolve, reject) => {
    const piper = spawn('piper', ['-m', onnx, '--output-dir', wav, '--output-dir-naming', 'text'], {
      stdio: ['pipe', 'inherit', 'inherit'],
    })
    piper.on('error', reject)
    piper.on('close', async (code) => {
      // Piper пишет прогресс в stderr, и ненулевой код здесь означает настоящую ошибку —
      // но только если не вышло ни одного файла.
      if (code === 0 || (await readdir(wav)).length > 0) resolve()
      else reject(new Error(`piper вышел с кодом ${code} и не создал ни одного файла`))
    })
    piper.stdin.on('error', reject)
    piper.stdin.end(`${words.join('\n')}\n`)
  })
}

async function main() {
  const language = process.argv[2] ?? 'en'
  if (!VOICES[language]) throw new Error(`нет голосов для языка ${language}`)
  const wordlistPath = join(
    root, '..', 'native', 'Sources', 'EnglishCoachCore', 'Resources', 'Languages', language,
    WORDLIST[language],
  )
  const pack = JSON.parse(await readFile(wordlistPath, 'utf8'))
  const words = pack.items.map((item) => item.w)
  console.log(`${language}: слов в списке ${words.length}`)

  for (const { gender, model } of VOICES[language]) {
    const onnx = await ensureModel(model)
    const wav = join(MODELS_DIR, `wav-${language}-${gender}`)
    const out = join(root, 'public', 'voice', language, gender)
    await rm(wav, { recursive: true, force: true })
    await mkdir(wav, { recursive: true })
    await mkdir(out, { recursive: true })

    console.log(`${gender}: синтез…`)
    await synthesize(onnx, words, wav)

    console.log(`${gender}: сжатие в opus…`)
    let done = 0
    const missing = []
    for (const word of words) {
      // Последний вариант — про `con`. Piper прогоняет имя через `pathvalidate`, а тот
      // дописывает подчёркивание к именам, зарезервированным в Windows (CON, PRN, AUX,
      // NUL, COM1…). На macOS файл был бы законным, но Piper об этом не спрашивает: в
      // испанском списке из-за этого молча потерялся предлог `con` — 825 слов из 826.
      const candidates = [
        `${word}.wav`, `${word.replace(/\s+/g, '_')}.wav`, `${word.replace(/\s+/g, '')}.wav`,
        `${word}_.wav`,
      ]
      const source = candidates.map((name) => join(wav, name)).find((path) => existsSync(path))
      if (!source) { missing.push(word); continue }
      await run('ffmpeg', [
        '-y', '-loglevel', 'error', '-i', source,
        '-c:a', 'libopus', '-b:a', '24k', '-ac', '1',
        join(out, `${fileName(word)}.opus`),
      ])
      done += 1
    }

    // В этой же папке лежат спрайты фраз — их вес к словам не относится.
    const files = (await readdir(out)).filter((name) => words.some((word) => `${fileName(word)}.opus` === name))
    const sizes = await Promise.all(files.map(async (name) => (await stat(join(out, name))).size))
    const total = sizes.reduce((sum, size) => sum + size, 0)
    console.log(
      `${gender}: готово ${done}, без звука ${missing.length}`
      + `${missing.length ? ` (${missing.slice(0, 5).join(', ')})` : ''}`
      + `, вес ${(total / 1024 / 1024).toFixed(1)} МБ`,
    )
    await rm(wav, { recursive: true, force: true })
  }
}

main().catch((error) => { console.error(error); process.exit(1) })
