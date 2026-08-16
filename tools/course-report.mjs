#!/usr/bin/env node
// Сколько часов на самом деле лежит в курсах — и сколько не хватает до нормы Cambridge.
//
// Единственный способ узнать объём уровня: сложить estimatedMinutes уроков. Норма и её
// источник — в docs/hours.md; здесь она продублирована только как цель для отчёта.

import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const languages = join(root, 'native/Sources/EnglishCoachCore/Resources/Languages')

/** Прибавка часов за уровень, не накопительный итог. */
const TARGET = { A1: 90, A2: 90, B1: 175, B2: 160, C1: 200 }
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1']

const pad = (value, width) => String(value).padStart(width)

let grandGap = 0
for (const language of readdirSync(languages).filter((name) => !name.startsWith('.')).sort()) {
  console.log(`\n=== ${language.toUpperCase()}`)
  console.log('  уровень  блоков  уроков  упражнений    часов    цель   не хватает')
  let total = 0
  for (const level of LEVELS) {
    const file = join(languages, language, `${language}-${level.toLowerCase()}.json`)
    let pack
    try {
      pack = JSON.parse(readFileSync(file, 'utf8'))
    } catch {
      continue
    }
    const lessons = pack.chapters.flatMap((chapter) => chapter.lessons)
    const minutes = lessons.reduce((sum, lesson) => sum + (lesson.estimatedMinutes ?? 0), 0)
    const exercises = lessons.reduce((sum, lesson) => sum + lesson.exercises.length, 0)
    const hours = minutes / 60
    const gap = Math.max(0, TARGET[level] - hours)
    grandGap += gap
    total += hours
    console.log(
      `  ${pad(level, 7)}  ${pad(pack.chapters.length, 6)}  ${pad(lessons.length, 6)}  ${pad(exercises, 10)}` +
      `  ${pad(hours.toFixed(1), 7)}  ${pad(TARGET[level], 6)}  ${pad(gap > 0 ? gap.toFixed(1) : '—', 11)}`,
    )
  }
  console.log(`  всего в языке: ${total.toFixed(1)} ч`)
}

console.log(`\nНе хватает до нормы суммарно: ${grandGap.toFixed(1)} ч`)
