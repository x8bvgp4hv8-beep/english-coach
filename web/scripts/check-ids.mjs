/**
 * Храповик на `id` уроков и упражнений: они не должны меняться никогда.
 *
 * На `id` стоит весь прогресс: пройденные уроки (`completedLessonIDs`), очередь повторения
 * (`reviews`), журнал попыток (`attempts`). Сдвиг одного `id` означает, что человек теряет
 * месяцы: пройденный урок снова непройденный, выученное слово снова новое. Поймать это
 * глазами нельзя — в двух языках 65 тысяч упражнений.
 *
 *   node scripts/check-ids.mjs          — сверить с отпечатком
 *   node scripts/check-ids.mjs --write  — записать новый отпечаток (только осознанно!)
 *
 * Отпечаток лежит в `scripts/content-ids.json`: это не контент, а страховка, и место ей
 * рядом с проверкой. Хранится не список всех 52 тысяч `id`, а `id` урока и отпечаток его
 * упражнений — полный список весил 1,5 МБ и перезаписывался бы на каждую правку контента.
 * Скрипт падает с кодом 1 на любом расхождении: пропал урок, пропало или добавилось
 * упражнение внутри урока, переехал порядок.
 *
 * `--write` нужен по-настоящему редко: когда контент осознанно добавляют (новая глава) или
 * когда `id` меняют намеренно, понимая, что прогресс по ним сбросится.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const contentDir = join(root, 'public', 'content')
const printPath = join(here, 'content-ids.json')

if (!existsSync(contentDir)) {
  console.error('Контент не собран. Сначала: npm run sync-content')
  process.exit(1)
}

const read = (path) => JSON.parse(readFileSync(join(contentDir, path), 'utf8'))

const digest = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16)

/**
 * Отпечаток: для каждого языка — `id` урока и отпечаток его упражнений с их числом.
 *
 * Сами `id` упражнений не хранятся: их 52 тысячи, и файл весил бы 1,5 МБ. Отпечаток
 * ловит любое изменение внутри урока, а урок называется по имени — этого хватает, чтобы
 * пойти и посмотреть, что там поехало.
 */
function fingerprint() {
  const out = {}
  for (const language of read('index.json').languages) {
    const index = read(`${language}/index.json`)
    const lessons = {}
    for (const file of index.courses) {
      const course = read(`${language}/courses/${file}`)
      for (const chapter of course.chapters) {
        for (const lesson of chapter.lessons) {
          const ids = lesson.exercises.map((exercise) => exercise.id)
          lessons[lesson.id] = `${digest(ids)}:${ids.length}`
        }
      }
    }
    out[language] = lessons
  }
  return out
}

const now = fingerprint()

if (process.argv.includes('--write')) {
  const counts = Object.entries(now).map(([language, lessons]) => {
    const total = Object.values(lessons).reduce((sum, mark) => sum + Number(mark.split(':')[1]), 0)
    return `${language}: уроков ${Object.keys(lessons).length}, упражнений ${total}`
  })
  writeFileSync(printPath, `${JSON.stringify({ schemaVersion: 1, digest: digest(now), languages: now }, null, 1)}\n`, 'utf8')
  console.log(`отпечаток записан (${digest(now)})\n  ${counts.join('\n  ')}`)
  process.exit(0)
}

if (!existsSync(printPath)) {
  console.error('Отпечатка нет. Записать текущий: node scripts/check-ids.mjs --write')
  process.exit(1)
}

const before = JSON.parse(readFileSync(printPath, 'utf8')).languages
const problems = []

for (const language of Object.keys(before)) {
  const old = before[language] ?? {}
  const fresh = now[language] ?? {}

  for (const lessonID of Object.keys(old)) {
    if (!(lessonID in fresh)) { problems.push(`${language}: урок пропал — ${lessonID}`); continue }
    if (old[lessonID] !== fresh[lessonID]) {
      const [, wasCount] = old[lessonID].split(':')
      const [, nowCount] = fresh[lessonID].split(':')
      problems.push(
        `${language} · ${lessonID}: упражнения изменились`
        + (wasCount === nowCount ? ` (число то же, ${nowCount} — значит поехали id или порядок)` : ` (было ${wasCount}, стало ${nowCount})`),
      )
    }
  }
  for (const lessonID of Object.keys(fresh)) {
    if (!(lessonID in old)) problems.push(`${language}: урок добавился — ${lessonID}`)
  }
}

const lessons = Object.values(now).reduce((sum, list) => sum + Object.keys(list).length, 0)
const exercises = Object.values(now).reduce(
  (sum, list) => sum + Object.values(list).reduce((inner, mark) => inner + Number(mark.split(':')[1]), 0), 0)

if (problems.length === 0) {
  console.log(`id на месте: уроков ${lessons}, упражнений ${exercises}, отпечаток ${digest(now)}`)
  process.exit(0)
}

console.error(`РАСХОЖДЕНИЕ в id (${problems.length}):`)
for (const line of problems.slice(0, 40)) console.error('   ', line)
if (problems.length > 40) console.error(`    …и ещё ${problems.length - 40}`)
console.error('\nЕсли это намеренно (добавили главу, переименовали урок) — прогресс по этим id')
console.error('сбросится. Осознанно записать новый отпечаток: node scripts/check-ids.mjs --write')
process.exit(1)
