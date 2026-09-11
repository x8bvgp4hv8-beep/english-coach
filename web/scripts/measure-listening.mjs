/**
 * Замер аудирования: сколько фраз проходит как записываемое на слух и что отсеялось.
 *
 * Правило ужесточили 11.09.2026, потому что в набор попадали реплики, вырванные из
 * диалога: «By this policy.», «And fifteen years of company.», «Half on completion.» —
 * формально предложения, а записать их без предыдущей фразы нельзя. Замер нужен, чтобы
 * видеть цену: строгость легко довести до пустого раздела.
 *
 *   npm run measure:listening [-- --sample N]
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

const { listeningPhrase } = await import('../src/core/listening.ts')
const { shadowingPhrase } = await import('../src/core/shadowing.ts')

const sampleSize = Number(process.argv[process.argv.indexOf('--sample') + 1]) || 0
const read = (path) => JSON.parse(readFileSync(join(contentDir, path), 'utf8'))

for (const language of read('index.json').languages) {
  console.log(`\n${language.toUpperCase()}`)
  for (const file of read(`${language}/index.json`).courses) {
    const course = read(`${language}/courses/${file}`)
    const exercises = course.chapters.flatMap((c) => c.lessons).flatMap((l) => l.exercises)
    // Прежнее правило: сказуемое можно произнести, начинается с заглавной, кончается точкой.
    const sayable = exercises.filter((e) => {
      const item = shadowingPhrase(e)
      return item && /^[A-Z].*[.!?]$/.test(item.text.trim()) && !item.text.includes('…')
        && item.text.trim().split(/\s+/).length >= 3
    })
    const kept = exercises.filter((e) => listeningPhrase(e, language))
    if (sayable.length === 0) continue
    const share = Math.round((kept.length / sayable.length) * 100)
    console.log(`  ${course.level}: похожих на предложение ${sayable.length} → в наборе ${kept.length} (${share}%)`)

    if (sampleSize > 0) {
      const keptIDs = new Set(kept.map((e) => e.id))
      const dropped = sayable.filter((e) => !keptIDs.has(e.id))
      const pick = (list) => {
        const step = Math.max(1, Math.floor(list.length / sampleSize))
        return list.filter((_, i) => i % step === 0).slice(0, sampleSize)
      }
      console.log('    отсеяно:')
      for (const e of pick(dropped)) console.log(`      ${shadowingPhrase(e).text}`)
      console.log('    осталось:')
      for (const e of pick(kept)) console.log(`      ${listeningPhrase(e, language).text}`)
    }
  }
}
console.log()
