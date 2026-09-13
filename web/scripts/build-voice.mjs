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
 *   node scripts/build-voice.mjs
 *
 * Файлы кладутся в `public/voice/en/<male|female>/<слово>.opus`. В предзагрузку
 * service worker они не попадают (см. `globPatterns` в vite.config.ts) — их забирает
 * runtime-кэш при первом прослушивании.
 */
import { execFile } from 'node:child_process'
import { mkdir, readFile, readdir, rm, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const run = promisify(execFile)
const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')

/** Голоса: имя модели Piper и папка, в которую кладётся результат. */
const VOICES = [
  { gender: 'male', model: 'en_US-ryan-medium' },
  { gender: 'female', model: 'en_US-lessac-medium' },
]

const MODELS_DIR = join(root, '.voice-models')
const BASE = 'https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US'

/** Имя файла из слова — то же правило, что в `speech.ts`. */
const fileName = (word) => word.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '')

async function ensureModel(model) {
  const onnx = join(MODELS_DIR, `${model}.onnx`)
  if (existsSync(onnx)) return onnx
  await mkdir(MODELS_DIR, { recursive: true })
  const [, , name, quality] = model.split(/[_-]/).length ? ['', '', model.split('-')[1], model.split('-')[2]] : []
  const url = `${BASE}/${name}/${quality}/${model}`
  console.log(`качаю модель ${model} (~60 МБ)…`)
  await run('curl', ['-sL', '-o', onnx, `${url}.onnx`])
  await run('curl', ['-sL', '-o', `${onnx}.json`, `${url}.onnx.json`])
  return onnx
}

async function main() {
  const wordlistPath = join(
    root, '..', 'native', 'Sources', 'EnglishCoachCore', 'Resources', 'Languages', 'en',
    'en-wordlist-3000.json',
  )
  const pack = JSON.parse(await readFile(wordlistPath, 'utf8'))
  const words = pack.items.map((item) => item.w)
  console.log(`слов в списке: ${words.length}`)

  for (const { gender, model } of VOICES) {
    const onnx = await ensureModel(model)
    const wav = join(MODELS_DIR, `wav-${gender}`)
    const out = join(root, 'public', 'voice', 'en', gender)
    await rm(wav, { recursive: true, force: true })
    await mkdir(wav, { recursive: true })
    await mkdir(out, { recursive: true })

    console.log(`${gender}: синтез…`)
    // Piper читает список строк со stdin и называет файлы по тексту — так соответствие
    // «слово → файл» не приходится держать отдельно.
    await run('piper', ['-m', onnx, '--output-dir', wav, '--output-dir-naming', 'text'], {
      input: words.join('\n'),
      maxBuffer: 1024 * 1024 * 64,
    }).catch(async (error) => {
      // Piper пишет прогресс в stderr, и ненулевой код здесь означает настоящую ошибку.
      if ((await readdir(wav)).length === 0) throw error
    })

    console.log(`${gender}: сжатие в opus…`)
    let done = 0
    const missing = []
    for (const word of words) {
      const candidates = [`${word}.wav`, `${word.replace(/\s+/g, '_')}.wav`, `${word.replace(/\s+/g, '')}.wav`]
      const source = candidates.map((name) => join(wav, name)).find((path) => existsSync(path))
      if (!source) { missing.push(word); continue }
      await run('ffmpeg', [
        '-y', '-loglevel', 'error', '-i', source,
        '-c:a', 'libopus', '-b:a', '24k', '-ac', '1',
        join(out, `${fileName(word)}.opus`),
      ])
      done += 1
    }

    const files = await readdir(out)
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
