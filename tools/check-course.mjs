#!/usr/bin/env node
/**
 * Те же ворота, что и в swift run EnglishCoachCoreTests, но за полсекунды.
 *
 * Полный прогон нативных тестов идёт минуты — а при написании курса сверяться нужно
 * после каждого блока. Здесь повторены ровно те проверки, которые ловят ошибки автора,
 * а не программиста: лестница шагов, трей со словами, теги, покрытие силлабуса и
 * порядок словаря. Нативный прогон остаётся последним словом перед публикацией.
 *
 * Запуск: node tools/check-course.mjs en
 */

import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const languages = join(root, 'native/Sources/EnglishCoachCore/Resources/Languages')
const LEVELS = ['a1', 'a2', 'b1', 'b2', 'c1']
const STEP = { dialogue: 0, flashcard: 1, info: 2, multiple_choice: 3, word_order: 3, translate: 4 }

/** Слова длиннее одной буквы; апостроф и дефис не режут слово. Копия VocabularyOrder. */
function vocabulary(text) {
  if (!text) return new Set()
  const found = new Set()
  let current = ''
  const flush = () => {
    const trimmed = current.replace(/^['’-]+|['’-]+$/g, '')
    if (trimmed.length > 1) found.add(trimmed)
    current = ''
  }
  for (const character of text.toLowerCase()) {
    if (/\p{L}/u.test(character) || character === "'" || character === '’' || character === '-') current += character
    else flush()
  }
  flush()
  return found
}

function shown(exercise) {
  const parts = {
    info: [exercise.title, exercise.explanation],
    flashcard: [exercise.prompt, exercise.example],
    word_order: [(exercise.tokens ?? []).join(' '), exercise.canonicalAnswer],
    multiple_choice: [exercise.prompt, (exercise.options ?? []).join(' ')],
    translate: [exercise.canonicalAnswer, exercise.hint],
    dialogue: (exercise.lines ?? []).map((line) => line.text),
  }[exercise.type] ?? []
  const out = new Set()
  for (const part of parts) for (const word of vocabulary(part)) out.add(word)
  return out
}

const normalise = (text) => text.toLowerCase().replace(/[^\p{L}\p{N}' ]/gu, ' ').replace(/\s+/g, ' ').trim()

// Подстановки заменяются на нейтральный пример до всех проверок: приложение делает
// то же самое при загрузке, и проверять надо ровно тот текст, который увидит человек.
const EXAMPLE_HOME = { '{country}': 'Spain', '{city}': 'Madrid', '{страна}': 'Испании', '{город}': 'Мадрида' }
const personalise = (text) => Object.entries(EXAMPLE_HOME)
  .reduce((out, [key, value]) => out.split(key).join(value), text)

const language = process.argv[2] ?? 'en'
const packs = []
for (const level of LEVELS) {
  try {
    packs.push(JSON.parse(personalise(readFileSync(join(languages, language, `${language}-${level}.json`), 'utf8'))))
  } catch { /* уровня может не быть на диске */ }
}
const syllabus = JSON.parse(readFileSync(join(languages, language, `${language}-syllabus.json`), 'utf8'))

const problems = []
const ids = new Set()
const topicCounts = new Map()

for (const pack of packs) {
  for (const chapter of pack.chapters) {
    if (ids.has(chapter.id)) problems.push(`дубль id: ${chapter.id}`)
    ids.add(chapter.id)
    if (pack.schemaVersion >= 2 && !(chapter.canDo?.length > 0)) problems.push(`${chapter.id}: нет canDo`)

    const drilledTopics = new Set()
    for (const lesson of chapter.lessons) {
      if (ids.has(lesson.id)) problems.push(`дубль id: ${lesson.id}`)
      ids.add(lesson.id)
      let climbed = -1
      for (const exercise of lesson.exercises) {
        if (ids.has(exercise.id)) problems.push(`дубль id: ${exercise.id}`)
        ids.add(exercise.id)
        const topics = exercise.topics ?? []
        if (topics.length === 0) problems.push(`${exercise.id}: нет темы`)
        // Покрытие считается по практике: правило и диалог — это знакомство, а не работа.
        // Ровно так же считает SyllabusEngine, и расходиться с ним здесь нельзя.
        const isPractice = exercise.type !== 'info' && exercise.type !== 'dialogue'
        for (const topic of topics) {
          if (isPractice) {
            topicCounts.set(topic, (topicCounts.get(topic) ?? 0) + 1)
            drilledTopics.add(topic)
          } else {
            topicCounts.set(topic, topicCounts.get(topic) ?? 0)
          }
        }
        if (pack.schemaVersion >= 2) {
          const step = STEP[exercise.type]
          if (step < climbed) problems.push(`${exercise.id}: шаг вниз (${exercise.type})`)
          climbed = Math.max(climbed, step)
        }
        if (exercise.type === 'translate' && !exercise.canonicalAnswer) problems.push(`${exercise.id}: нет ответа`)
        if (exercise.type === 'multiple_choice' && !(exercise.options ?? []).includes(exercise.correctOption)) {
          problems.push(`${exercise.id}: верного варианта нет среди options`)
        }
        if (exercise.type === 'dialogue' && (exercise.lines ?? []).length < 2) problems.push(`${exercise.id}: диалог короче двух реплик`)
        if (exercise.type === 'word_order') {
          const tokens = exercise.tokens ?? []
          if (tokens.length < 2) problems.push(`${exercise.id}: трей из одного слова`)
          const tray = normalise(tokens.join(' ')).split(' ').sort().join(' ')
          const answer = normalise(exercise.canonicalAnswer ?? '').split(' ').sort().join(' ')
          if (tray !== answer) problems.push(`${exercise.id}: трей не собирает ответ`)
        }
        if (lesson.kind === 'checkpoint' && (STEP[exercise.type] !== 4 || exercise.hint)) {
          problems.push(`${exercise.id}: в проверке только производство и без подсказок`)
        }
      }
    }
    if (pack.schemaVersion >= 2 && drilledTopics.size < 4) {
      problems.push(`${chapter.id}: тем в блоке ${drilledTopics.size}, нужно ≥4`)
    }
  }
}

// Повторить фразу в проверке блока — нормально и полезно: испанский A1 так и сделан.
// А вот два одинаковых ответа рядом ломают проверку «ответ от другого упражнения не
// принимается»: она сравнивает соседей на расстоянии 1 и 7 и считает совпадение
// ложным срабатыванием проверяльщика. Значит повтор должен стоять далеко.
const translates = packs.flatMap((pack) => pack.chapters)
  .flatMap((chapter) => chapter.lessons)
  .flatMap((lesson) => lesson.exercises)
  .filter((exercise) => exercise.type === 'translate' && exercise.canonicalAnswer)
for (let i = 0; i < translates.length; i += 1) {
  for (const offset of [1, 7]) {
    const other = translates[(i + offset) % translates.length]
    if (!other || other.id === translates[i].id) continue
    if (normalise(other.canonicalAnswer) === normalise(translates[i].canonicalAnswer)) {
      problems.push(`${translates[i].id}: тот же ответ рядом с ${other.id} — «${translates[i].canonicalAnswer}»`)
    }
  }
}

const defined = new Set(syllabus.topics.map((topic) => topic.id))
for (const topic of topicCounts.keys()) {
  if (!defined.has(topic)) problems.push(`тема вне силлабуса: ${topic}`)
}

const gaps = syllabus.topics.filter((topic) => (topicCounts.get(topic.id) ?? 0) < topic.minExercises)

// Порядок словаря: перевод не имеет права требовать слово, которого курс ещё не показал.
const order = ['A1', 'A2', 'B1', 'B2', 'C1']
const known = new Set()
const unseen = []
for (const pack of [...packs].sort((a, b) => order.indexOf(a.level) - order.indexOf(b.level))) {
  for (const chapter of pack.chapters) {
    for (const lesson of chapter.lessons) {
      for (const exercise of lesson.exercises) {
        if (exercise.type === 'translate' && exercise.canonicalAnswer) {
          const missing = [...vocabulary(exercise.canonicalAnswer)].filter((word) => !known.has(word))
          if (missing.length) unseen.push({ level: pack.level, id: exercise.id, words: missing })
        }
        for (const word of shown(exercise)) known.add(word)
      }
    }
  }
}

const a1Unseen = unseen.filter((item) => item.level === 'A1')

console.log(`язык: ${language}`)
console.log(`  ошибок структуры: ${problems.length}`)
problems.slice(0, 15).forEach((problem) => console.log(`    · ${problem}`))
console.log(`  тем без покрытия: ${gaps.length} (потолок ${syllabus.coverageDebtCeiling})`)
gaps.slice(0, 15).forEach((topic) => console.log(`    · ${topic.id}: ${topicCounts.get(topic.id) ?? 0} из ${topic.minExercises}`))
console.log(`  переводов на невыученных словах: всего ${unseen.length}, на A1 ${a1Unseen.length} (потолок A1 — 0)`)
unseen.slice(0, 15).forEach((item) => console.log(`    · ${item.id}: ${item.words.join(', ')}`))

const failed = problems.length > 0 || gaps.length > syllabus.coverageDebtCeiling ||
  a1Unseen.length > 0 || unseen.length > (syllabus.vocabularyDebtCeiling ?? 0)
console.log(failed ? '\nНЕ ГОТОВО' : '\nВСЁ ЗЕЛЁНОЕ')
process.exit(failed ? 1 : 0)
