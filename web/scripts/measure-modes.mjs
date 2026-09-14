/**
 * Замер экрана «Тренировка»: что видит человек с чистым прогрессом на каждом уровне.
 *
 * Существует потому, что жалоба «режим пишет „пока нечего“» проверяется только перечислением
 * всех режимов на всех уровнях, а не взглядом на один экран. Первый замер (13.09.2026) дал на
 * EN B1 три закрытых режима без объяснения при 2 790 тестах и 3 216 переводах на уровне.
 *
 *   npm run measure:modes
 *
 * Правило: закрытый режим обязан сказать, чем он открывается. Строка без объяснения — это
 * провал замера, и скрипт выходит с кодом 1, чтобы это нельзя было пропустить глазами.
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const contentDir = join(here, '..', 'public', 'content')

if (!existsSync(contentDir)) {
  console.error('Контент не собран. Сначала: npm run sync-content')
  process.exit(1)
}

// Правило живёт в ядре, здесь оно только применяется — иначе замер проверял бы свою копию
// правила, а не приложение (ровно так тест озвучки пропустил сломанный хэш 13.09).
const { modeStates } = await import('../src/core/modes.ts')
const { taughtCourses } = await import('../src/core/practice.ts')
const { decodeCourse } = await import('../src/core/content.ts')
const { decodeTheory } = await import('../src/core/theory.ts')
const { decodeSyllabus } = await import('../src/core/syllabus.ts')
const { decodePictures } = await import('../src/core/pictures.ts')

const read = (path) => JSON.parse(readFileSync(join(contentDir, path), 'utf8'))
const languages = read('index.json').languages

let failures = 0
const rows = []

for (const language of languages) {
  const index = read(`${language}/index.json`)
  const courses = index.courses.map((file) => decodeCourse(read(`${language}/courses/${file}`)))
  const syllabus = decodeSyllabus(read(`${language}/syllabus.json`))
  // Карта картинок передаётся замеру: без неё он говорил «картинок нет» на всех уровнях,
  // хотя они есть — то есть замер врал ровно про то, что должен был мерить.
  const pictures = index.pictures ? decodePictures(read(`${language}/${index.pictures}`), language) : null
  const topicIDs = new Set(syllabus.topics.map((topic) => topic.id))

  for (const course of courses) {
    const level = course.level
    const theoryFile = `${level.toLowerCase()}.json`
    const theory = (index.theory ?? []).includes(theoryFile)
      ? decodeTheory(read(`${language}/theory/${theoryFile}`), topicIDs)
      : null

    // Чистый прогресс: ни одного пройденного урока — то, что видит человек в первый день.
    const taught = taughtCourses(courses, level, new Set())
    const states = modeStates({ courses, taught, level, language, theory, pictures })

    const open = states.filter((state) => state.ready)
    const mute = states.filter((state) => !state.ready && !state.note.trim())
    failures += mute.length
    rows.push({ language, level, open: open.length, total: states.length, states, mute })
  }
}

for (const row of rows) {
  console.log(`\n${row.language.toUpperCase()} ${row.level}: открыто ${row.open} из ${row.total}`)
  for (const state of row.states) {
    console.log(`  ${state.ready ? '●' : '○'} ${state.title.padEnd(20)} ${state.ready ? `доступно ${state.count}` : state.note}`)
  }
  if (row.mute.length) {
    console.log(`  ПРОВАЛ: без объяснения — ${row.mute.map((s) => s.title).join(', ')}`)
  }
}

console.log(
  failures === 0
    ? '\nИтог: ни один закрытый режим не молчит — у каждого сказано, чем он открывается.'
    : `\nИтог: ПРОВАЛ, закрытых режимов без объяснения — ${failures}.`,
)
process.exit(failures === 0 ? 0 : 1)
