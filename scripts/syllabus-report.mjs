// Печатает, что уровень обещает и что из этого реально есть в контенте.
// Запуск: node scripts/syllabus-report.mjs
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const res = join(root, 'native', 'Sources', 'EnglishCoachCore', 'Resources')
const read = (p) => JSON.parse(readFileSync(p, 'utf8'))

const syllabus = read(join(res, 'Syllabus', 'syllabus.json'))
const courses = readdirSync(join(res, 'Courses')).filter((f) => f.endsWith('.json')).map((f) => read(join(res, 'Courses', f)))

const counts = {}
for (const course of courses) {
  for (const chapter of course.chapters) {
    for (const lesson of chapter.lessons) {
      for (const exercise of lesson.exercises) {
        if (exercise.type === 'info') continue
        for (const topic of exercise.topics ?? []) counts[topic] = (counts[topic] ?? 0) + 1
      }
    }
  }
}

let debt = 0
for (const level of ['A1', 'A2', 'B1', 'B2', 'C1']) {
  const topics = syllabus.topics.filter((t) => t.level === level)
  const done = topics.filter((t) => (counts[t.id] ?? 0) >= t.minExercises).length
  console.log(`\n${level}  ${done}/${topics.length} тем закрыто`)
  for (const t of topics) {
    const have = counts[t.id] ?? 0
    const ok = have >= t.minExercises
    if (!ok) debt += 1
    console.log(`  ${ok ? '✓' : '·'} ${t.id.padEnd(32)} ${String(have).padStart(2)}/${t.minExercises}  ${t.title}`)
  }
}
console.log(`\nдолг: ${debt} тем, потолок в манифесте: ${syllabus.coverageDebtCeiling}`)
if (debt > syllabus.coverageDebtCeiling) { console.error('долг вырос — тесты упадут'); process.exit(1) }
