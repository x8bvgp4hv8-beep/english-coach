/**
 * Замер режима слов: сколько карточек проходит как лексическая единица и что именно.
 *
 * Существует потому, что жалоба «хочу поучить слова, а дают hello goodbye» проверяется
 * только цифрой. Первый замер (11.09.2026) дал по B1: одиночных слов 4%, коллокаций 61%,
 * обрывков 27%, целых предложений 6%. После отбора в наборе должны остаться только слова,
 * группы и формы глагола — а объём должен остаться достаточным, иначе режим пустой.
 *
 *   node scripts/measure-vocabulary.mjs [--sample N]
 *
 * Запускать после `npm run sync-content`: читается собранный контент из public/content.
 */
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const contentDir = join(here, '..', 'public', 'content')

if (!existsSync(contentDir)) {
  console.error('Контент не собран. Сначала: npm run sync-content')
  process.exit(1)
}

// Отбор живёт в ядре, здесь он только применяется: два правила разошлись бы молча.
const { vocabularyUnit } = await import('../src/core/vocabulary.ts')

const sampleSize = Number(process.argv[process.argv.indexOf('--sample') + 1]) || 0
const read = (path) => JSON.parse(readFileSync(join(contentDir, path), 'utf8'))
const languages = read('index.json').languages

const KIND_TITLE = { word: 'слова', phrase: 'группы', forms: 'формы глагола' }

for (const language of languages) {
  const index = read(`${language}/index.json`)
  console.log(`\n${language.toUpperCase()}`)
  for (const file of index.courses) {
    const course = read(`${language}/courses/${file}`)
    const cards = course.chapters
      .flatMap((chapter) => chapter.lessons)
      .flatMap((lesson) => lesson.exercises)
      .filter((exercise) => exercise.type === 'flashcard')
    if (cards.length === 0) continue

    const kinds = {}
    const units = []
    for (const card of cards) {
      const kind = vocabularyUnit(card, language)
      if (!kind) continue
      kinds[KIND_TITLE[kind]] = (kinds[KIND_TITLE[kind]] ?? 0) + 1
      units.push(card)
    }
    const share = Math.round((units.length / cards.length) * 100)
    const breakdown = Object.entries(kinds).map(([name, count]) => `${name} ${count}`).join(', ')
    console.log(`  ${course.level}: карточек ${cards.length} → единиц ${units.length} (${share}%)  ${breakdown || '—'}`)

    if (sampleSize > 0 && units.length > 0) {
      const step = Math.max(1, Math.floor(units.length / sampleSize))
      for (const unit of units.filter((_, i) => i % step === 0).slice(0, sampleSize)) {
        console.log(`      ${unit.prompt}  —  ${unit.translation}`)
      }
    }
  }
}
console.log()
