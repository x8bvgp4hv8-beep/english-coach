#!/usr/bin/env node
/**
 * Собирает курс из авторских исходников: content-src/<lang>/<level>/*.mjs → <lang>-<level>.json
 *
 * Писать руками 7000 объектов JSON нельзя — это не работа с языком, а работа с
 * пунктуацией. Поэтому автор пишет только язык: диалог, пять слов, правило, три вопроса,
 * сборку фразы и три перевода. Всё остальное — идентификаторы, порядок ступеней, минуты,
 * теги — раскладывает этот файл, одинаково для каждого урока.
 *
 * Канон урока (он же лестница из ContentRepository: listen → words → rule → recognise →
 * produce; шаг не может идти вниз):
 *
 *   1 dialogue → 5 flashcard → 1 info → 3 multiple_choice → 1 word_order → 3 translate
 *
 * Итого 14 упражнений и 11 минут. Блок — 16 таких уроков плюс проверка на 6 переводов и
 * 5 минут: 181 минута ≈ три часа. Тридцать блоков = 90 часов = норма Cambridge для A1.
 *
 * Запуск: node tools/build-course.mjs en a1
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const LESSON_MINUTES = 11
const CHECKPOINT_MINUTES = 5

/** Слова фразы вперемешку — но так, чтобы порядок никогда не совпал с верным. */
function shuffleTokens(answer) {
  const tokens = answer.replace(/[.!?,]/g, '').split(/\s+/).filter(Boolean)
  if (tokens.length < 2) return tokens
  // Детерминированно: разворот плюс сдвиг. Случайность в сборке курса означала бы, что
  // два запуска дают разные файлы, и любая правка выглядит как переписанный курс.
  const mixed = [...tokens].reverse()
  if (mixed.join(' ') === tokens.join(' ')) mixed.push(mixed.shift())
  return mixed
}

function exercisesFor(lesson, lessonID) {
  const topics = lesson.topics ?? []
  const out = []
  const push = (suffix, body) => out.push({ id: `${lessonID}-${suffix}`, topics, ...body })

  if (lesson.checkpoint) {
    // Проверка блока: только производство и никаких подсказок — так требует декодер.
    lesson.produce.forEach(([prompt, answer, accepted], index) => {
      push(`t${index + 1}`, {
        type: 'translate',
        prompt,
        canonicalAnswer: answer,
        ...(accepted?.length ? { acceptedAnswers: accepted } : {}),
      })
    })
    return out
  }

  const [dialogueTitle, lines] = lesson.dialogue
  push('d', {
    type: 'dialogue',
    title: dialogueTitle,
    lines: lines.map(([speaker, text, translation]) => ({ speaker, text, translation })),
  })

  lesson.words.forEach(([prompt, translation, example], index) => {
    push(`w${index + 1}`, { type: 'flashcard', prompt, translation, ...(example ? { example } : {}) })
  })

  const [ruleTitle, explanation] = lesson.rule
  push('r', { type: 'info', title: ruleTitle, explanation })

  lesson.quiz.forEach(([prompt, options, correct], index) => {
    push(`c${index + 1}`, { type: 'multiple_choice', prompt, options, correctOption: options[correct] })
  })

  const [orderPrompt, orderAnswer] = lesson.order
  push('o', {
    type: 'word_order',
    prompt: orderPrompt,
    canonicalAnswer: orderAnswer,
    tokens: shuffleTokens(orderAnswer),
  })

  lesson.produce.forEach(([prompt, answer, accepted], index) => {
    push(`t${index + 1}`, {
      type: 'translate',
      prompt,
      canonicalAnswer: answer,
      ...(accepted?.length ? { acceptedAnswers: accepted } : {}),
    })
  })

  return out
}

export async function build(language, level) {
  const dir = join(root, 'content-src', language, level)
  const files = readdirSync(dir).filter((name) => name.endsWith('.mjs')).sort()
  const chapters = []

  for (const file of files) {
    const chapter = (await import(pathToFileURL(join(dir, file)).href)).default
    const chapterID = `${language}-${level}-${chapter.slug}`
    chapters.push({
      id: chapterID,
      title: chapter.title,
      subtitle: chapter.subtitle,
      canDo: chapter.canDo,
      lessons: chapter.lessons.map((lesson, index) => {
        const lessonID = lesson.checkpoint
          ? `${chapterID}-check`
          : `${chapterID}-${String(index + 1).padStart(2, '0')}`
        return {
          id: lessonID,
          title: lesson.title,
          summary: lesson.summary,
          estimatedMinutes: lesson.checkpoint ? CHECKPOINT_MINUTES : LESSON_MINUTES,
          ...(lesson.checkpoint ? { kind: 'checkpoint' } : {}),
          exercises: exercisesFor(lesson, lessonID),
        }
      }),
    })
  }

  const pack = { schemaVersion: 2, level: level.toUpperCase(), chapters }
  const target = join(
    root,
    'native/Sources/EnglishCoachCore/Resources/Languages',
    language,
    `${language}-${level}.json`,
  )
  writeFileSync(target, JSON.stringify(pack, null, 2) + '\n')

  const lessons = chapters.flatMap((chapter) => chapter.lessons)
  const minutes = lessons.reduce((sum, lesson) => sum + lesson.estimatedMinutes, 0)
  return {
    target,
    chapters: chapters.length,
    lessons: lessons.length,
    exercises: lessons.reduce((sum, lesson) => sum + lesson.exercises.length, 0),
    hours: minutes / 60,
  }
}

const [, , language = 'en', level = 'a1'] = process.argv
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const stats = await build(language, level)
  console.log(
    `${stats.target.split('/').pop()}: блоков ${stats.chapters}, уроков ${stats.lessons}, ` +
    `упражнений ${stats.exercises}, ${stats.hours.toFixed(1)} ч`,
  )
}
