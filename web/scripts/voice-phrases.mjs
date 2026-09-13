/**
 * Первый шаг озвучки фраз: выгрузить то, что приложение вообще может произнести.
 *
 * Список берётся из `shadowingPhrase` — той самой функции, которой пользуются режимы
 * «Вслух за диктором» и «Аудирование». Иначе в проекте появилось бы второе определение
 * правды: одно решает, что читать вслух, другое — что озвучивать заранее, и они
 * разъезжаются на первой же правке.
 *
 *   npm run build:voice:phrases   (зовёт этот шаг, потом voice-build.py)
 *
 * Результат — `.voice-build/phrases.json`: по одной записи на главу, фразы внутри главы
 * уникальны. Главами, потому что спрайт на главу весит один-три мегабайта — столько
 * можно тянуть по сети за раз, и столько же имеет смысл держать в кэше.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const { decodeCourse } = await import(join(root, 'src/core/content.ts'))
const { shadowingPhrase } = await import(join(root, 'src/core/shadowing.ts'))

const contentDir = join(root, 'public', 'content')
const read = async (path) => JSON.parse(await readFile(join(contentDir, path), 'utf8'))

const chapters = []
let phraseCount = 0

for (const language of (await read('index.json')).languages) {
  const index = await read(`${language}/index.json`)
  for (const file of index.courses) {
    const course = decodeCourse(await read(`${language}/courses/${file}`))
    for (const chapter of course.chapters) {
      const texts = new Set()
      for (const lesson of chapter.lessons) {
        for (const exercise of lesson.exercises) {
          const item = shadowingPhrase(exercise)
          if (item) texts.add(item.text)
          // Лицевая сторона карточки читается вслух отдельной кнопкой в уроке.
          if (exercise.type === 'flashcard' && exercise.prompt) texts.add(exercise.prompt.trim())
        }
      }
      if (texts.size === 0) continue
      chapters.push({ language, level: course.level, chapter: chapter.id, phrases: [...texts] })
      phraseCount += texts.size
    }
  }
}

const out = join(root, '.voice-build')
await mkdir(out, { recursive: true })
await writeFile(join(out, 'phrases.json'), JSON.stringify(chapters), 'utf8')

const byLanguage = {}
for (const item of chapters) {
  byLanguage[item.language] = (byLanguage[item.language] ?? 0) + item.phrases.length
}
console.log(`глав ${chapters.length}, фраз ${phraseCount}:`)
for (const [language, count] of Object.entries(byLanguage)) console.log(`  ${language}: ${count}`)
console.log(`→ ${join(out, 'phrases.json')}`)
