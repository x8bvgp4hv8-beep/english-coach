import { ContentError } from './types'
import type { CoursePack, PlacementBank } from './types'

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

/** Fetches the packs that `scripts/sync-content.mjs` copied into /content. */
export async function loadContent(base = '/content'): Promise<{ courses: CoursePack[]; placement: PlacementBank }> {
  const index = (await fetchJSON(`${base}/index.json`)) as { courses: string[] }
  const courses = await Promise.all(
    [...index.courses].sort().map(async (file) => decodeCourse(await fetchJSON(`${base}/courses/${file}`))),
  )
  const placement = decodePlacement(await fetchJSON(`${base}/placement.json`))
  return { courses, placement }
}

async function fetchJSON(url: string): Promise<unknown> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Не удалось загрузить ${url}: ${response.status}`)
  return response.json()
}
