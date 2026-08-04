import { DEFAULT_LANGUAGE } from './language'
import { decodeSyllabus } from './syllabus'
import { ContentError } from './types'
import type { LanguageCode } from './language'
import type { CoursePack, PlacementBank, Syllabus } from './types'

/** Mirrors EnglishCoachCore/ContentRepository.swift: same validation, same failure modes. */

export function decodeCourse(raw: unknown): CoursePack {
  const course = raw as CoursePack
  if (course?.schemaVersion !== 1) throw new ContentError('unsupportedSchema', String(course?.schemaVersion))
  if (!course.chapters?.length) throw new ContentError('emptyCourse')

  const ids = new Set<string>()
  const claim = (id: string) => {
    if (ids.has(id)) throw new ContentError('duplicateID', id)
    ids.add(id)
  }

  for (const chapter of course.chapters) {
    claim(chapter.id)
    for (const lesson of chapter.lessons) {
      claim(lesson.id)
      for (const exercise of lesson.exercises) {
        claim(exercise.id)
        if (exercise.type === 'translate' && !exercise.canonicalAnswer) {
          throw new ContentError('invalidExercise', exercise.id)
        }
        if (exercise.type === 'multiple_choice' && !(exercise.options ?? []).includes(exercise.correctOption ?? '')) {
          throw new ContentError('invalidExercise', exercise.id)
        }
      }
    }
  }
  return course
}

export function decodePlacement(raw: unknown): PlacementBank {
  const bank = raw as PlacementBank
  if (bank?.schemaVersion !== 1) throw new ContentError('unsupportedSchema', String(bank?.schemaVersion))
  if (!bank.questions?.length) throw new ContentError('emptyCourse')

  const ids = new Set<string>()
  for (const question of bank.questions) {
    if (ids.has(question.id)) throw new ContentError('duplicateID', question.id)
    ids.add(question.id)
    if (!question.options.includes(question.correctOption)) throw new ContentError('invalidExercise', question.id)
  }
  return bank
}

/**
 * Fetches one language's packs, which `scripts/sync-content.mjs` copied into
 * `content/<code>/`.
 *
 * The path is relative on purpose. An absolute `/content` resolves against the domain
 * root, which is right on a bare host and wrong on GitHub Pages, where the app lives at
 * `/<repo>/` — there it asked the domain root and got a 404 with no lessons at all.
 */
export async function loadContent(
  language: LanguageCode = DEFAULT_LANGUAGE,
  base = 'content',
): Promise<{ courses: CoursePack[]; placement: PlacementBank; syllabus: Syllabus }> {
  const root = `${base}/${language}`
  const index = (await fetchJSON(`${root}/index.json`)) as { courses: string[] }
  const courses = await Promise.all(
    [...index.courses].sort().map(async (file) => decodeCourse(await fetchJSON(`${root}/courses/${file}`))),
  )
  const placement = decodePlacement(await fetchJSON(`${root}/placement.json`))
  const syllabus = decodeSyllabus(await fetchJSON(`${root}/syllabus.json`))
  return { courses, placement, syllabus }
}

async function fetchJSON(url: string): Promise<unknown> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Не удалось загрузить ${url}: ${response.status}`)
  return response.json()
}
