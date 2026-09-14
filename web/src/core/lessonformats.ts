/**
 * Новые форматы внутри урока: другой способ задать тот же шаг.
 *
 * Зачем. Три формата — пары, картинки, «что слышишь» — появились 14.09.2026 на экране
 * «Тренировка», а время человек проводит в уроке: «Следующий урок» — главная кнопка
 * приложения. Пока форматы стоят рядом с уроком, однообразие самого урока никуда не
 * ушло: один диалог и тринадцать упражнений про те же четыре фразы.
 *
 * Как — не ломая `id`. На `id` уроков и упражнений стоит весь прогресс: пройденные
 * уроки, очередь повторения, журнал попыток. Добавить в урок настоящие упражнения
 * значило бы сдвинуть `id` и обнулить людям месяцы. Поэтому формат ничего не добавляет
 * в контент: шаг собирается на ходу **из карточек этого же урока**, а попытки пишутся
 * против их настоящих `id`. Урок становится на один-два шага длиннее, файл курса — нет.
 *
 * Куда встаёт. Сразу после последней карточки, то есть на место узнавания: слова уже
 * показали, производить ещё рано — самое время узнать их в другом виде. Лестница урока
 * (диалог → карточки → правило → узнавание → производство) при этом не нарушается:
 * `stepOf` для форматов возвращает `recognise`.
 */
import { assemblyWords } from './assembly'
import { HEARING_OPTIONS } from './hearing'
import { listeningPhrase } from './listening'
import { PICTURE_OPTIONS, pictureFor } from './pictures'
import { vocabularyUnit } from './vocabulary'
import type { LanguageCode } from './language'
import type { PicturePack } from './pictures'
import type { Exercise, FormatType, Lesson } from './types'

/** Сколько форматных шагов добавляется к одному уроку. Два — урок длиннее на седьмую часть. */
export const FORMATS_PER_LESSON = 2

/** Сколько пар в наборе внутри урока: меньше, чем в отдельном режиме — это один шаг, а не заход. */
const PAIRS_IN_LESSON = 4

export interface LessonFormatOptions {
  language: LanguageCode
  pictures: PicturePack | null
}

/** Карточки урока — единственный материал, из которого собирается формат. */
function cardsOf(lesson: Lesson): Exercise[] {
  return lesson.exercises.filter((exercise) => exercise.type === 'flashcard' && exercise.prompt && exercise.translation)
}

/**
 * Какие форматы урок может показать своими же карточками.
 *
 * Порядок предпочтения — от самого наглядного к самому трудному: картинка, пара, слух.
 * Требования у каждого свои, и они не выдуманы: четыре картинки нужны, чтобы собрать
 * сетку два на два; четыре пары — чтобы набор не читался как обрывок; четыре фразы —
 * чтобы набрать варианты на слух.
 */
export function availableFormats(lesson: Lesson, { language, pictures }: LessonFormatOptions): FormatType[] {
  const cards = cardsOf(lesson)
  const found: FormatType[] = []

  // Хватает одной карточки с картинкой: приманки берутся из всей карты, а не из урока
  // (`pictureQuestions`). Требование «четыре разные картинки в одном уроке» пропускало
  // 2 урока из 508 — то есть формат почти не показывался.
  const withPictures = cards.filter((card) => pictureFor(card.prompt ?? '', pictures) !== null)
  if (withPictures.length >= 1 && (pictures?.byWord.size ?? 0) >= PICTURE_OPTIONS) found.push('pictures')

  const units = cards.filter((card) => vocabularyUnit(card, language) !== null)
  const distinctMeanings = new Set(units.map((card) => (card.translation ?? '').trim().toLowerCase()))
  if (units.length >= PAIRS_IN_LESSON && distinctMeanings.size >= PAIRS_IN_LESSON) found.push('pairs')

  const sayable = cards.filter((card) => listeningPhrase(card, language) !== null)
  if (sayable.length >= HEARING_OPTIONS) found.push('hearing')

  // «Собери, что слышишь» — одной фразы достаточно: приманки берутся из соседних слов
  // того же набора, а не из четырёх разных фраз.
  const assemblable = sayable.filter((card) => {
    const words = assemblyWords(listeningPhrase(card, language)!.text).length
    return words >= 3 && words <= 9
  })
  if (assemblable.length >= 2) found.push('assembly')

  return found
}

/** Шаг формата: те же карточки урока, только показанные иначе. */
function formatStep(lesson: Lesson, format: FormatType, sources: Exercise[]): Exercise {
  return {
    // `::` в `id` не встречается в контенте — по нему шаг видно как собранный на ходу.
    id: `${lesson.id}::${format}`,
    type: format,
    sources,
  }
}

/**
 * Урок с добавленными шагами формата. Контент не меняется — меняется то, что показывают.
 *
 * Если материала на формат не хватает, урок возвращается как был: пустой шаг хуже, чем
 * его отсутствие.
 */
export function lessonWithFormats(lesson: Lesson, options: LessonFormatOptions): Lesson {
  const formats = availableFormats(lesson, options).slice(0, FORMATS_PER_LESSON)
  if (formats.length === 0) return lesson

  const cards = cardsOf(lesson)
  const { language, pictures } = options
  const steps: Exercise[] = []
  for (const format of formats) {
    if (format === 'pictures') {
      // По одной карточке на картинку: две карточки с одной картинкой дали бы вопрос,
      // у которого два верных ответа.
      const seen = new Set<string>()
      const sources = cards.filter((card) => {
        const hex = pictureFor(card.prompt ?? '', pictures)
        if (!hex || seen.has(hex)) return false
        seen.add(hex)
        return true
      })
      steps.push(formatStep(lesson, 'pictures', sources))
    }
    if (format === 'pairs') {
      const seen = new Set<string>()
      const sources = cards.filter((card) => {
        if (vocabularyUnit(card, language) === null) return false
        const meaning = (card.translation ?? '').trim().toLowerCase()
        if (seen.has(meaning)) return false
        seen.add(meaning)
        return true
      }).slice(0, PAIRS_IN_LESSON)
      steps.push(formatStep(lesson, 'pairs', sources))
    }
    if (format === 'hearing') {
      const sources = cards.filter((card) => listeningPhrase(card, language) !== null)
      steps.push(formatStep(lesson, 'hearing', sources))
    }
    if (format === 'assembly') {
      const sources = cards.filter((card) => {
        const item = listeningPhrase(card, language)
        if (!item) return false
        const words = assemblyWords(item.text).length
        return words >= 3 && words <= 9
      })
      steps.push(formatStep(lesson, 'assembly', sources))
    }
  }

  // Место вставки — сразу после последней карточки: слова показаны, производить рано.
  const lastCard = lesson.exercises.reduce(
    (found, exercise, index) => (exercise.type === 'flashcard' ? index : found), -1,
  )
  const at = lastCard + 1
  return {
    ...lesson,
    exercises: [...lesson.exercises.slice(0, at), ...steps, ...lesson.exercises.slice(at)],
    // Шаг формата — это полминуты, и урок не должен обещать меньше, чем занимает.
    estimatedMinutes: lesson.estimatedMinutes + steps.length,
  }
}
