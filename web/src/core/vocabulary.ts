import { PracticeEngine, prioritise } from './practice'
import type { LanguageCode } from './language'
import type { CEFRLevel, CoursePack, Exercise, Lesson, UserState } from './types'

/**
 * «Хочу поучить слова» — режим, которого в приложении не было.
 *
 * Карточки курса нарезаны из реплик диалога, поэтому на карточке оказывается не слово,
 * а кусок фразы. Замер по B1: одиночных слов 4%, коллокаций из двух-трёх слов 61%,
 * обрывков из четырёх и больше 27%, целых предложений 6%, и ещё двадцать семь карточек
 * с многоточием — «How long have you been…?». Само приложение это не скрывало: подпись
 * над карточкой говорит «НОВАЯ ФРАЗА».
 *
 * Для «повторить фразу» такая карточка работает. Для «выучить слово» — нет: обрывок
 * `had left the tap running` нельзя ни вспомнить отдельно, ни поставить в другое
 * предложение. Поэтому здесь из того же контента отбирается то, что является
 * лексической единицей, а остальное остаётся в режиме фраз.
 *
 * Отбор — распознавание, а не разметка контента: размечать 15 000 карточек руками никто
 * не станет, а правило проверяется замером (`scripts/measure-vocabulary.mjs`) и держится
 * тестом. Признак «не единица» ищется с двух сторон, и русская сторона надёжнее:
 * личная форма глагола в переводе выдаёт огрызок предложения даже там, где английская
 * сторона выглядит невинно («the letter says» — «в письме написано»).
 */

export type VocabularyKind = 'word' | 'phrase' | 'forms'

/**
 * Служебные слова, с которых начинается именная или предложная группа — то есть единица.
 *
 * `of` в английском списке отсутствует намеренно: он почти всегда стоит в середине фразы,
 * и «of one problem», «of guessing» — это осколки, а не то, что учат как слово.
 */
const OPENERS: Record<LanguageCode, RegExp> = {
  en: /^(a|an|the|my|your|his|her|our|their|its|this|that|these|those|in|on|at|for|from|with|without|by|about|to|into|over|under|after|before|during|half|one|two|three|four|five|no|any|some|another|both|each|every|more|less|most|least|per)\b/i,
  es: /^(el|la|los|las|un|una|unos|unas|de|del|en|con|sin|por|para|a|al|este|esta|estos|estas|ese|esa|mi|tu|su|nuestro|medio|media|dos|tres|cuatro|cinco|cada|otro|otra|más|menos|algún|alguna|ningún|ninguna|todo|toda)\b/i,
}

/** Личная форма вспомогательного глагола: значит на карточке предложение, а не единица. */
const AUXILIARIES: Record<LanguageCode, RegExp> = {
  en: /\b(is|are|was|were|be|been|being|am|has|have|had|do|does|did|will|would|can|could|should|must|might|may)\b/i,
  es: /\b(es|son|está|están|estoy|soy|era|eran|fue|fueron|ha|han|he|hay|tiene|tienen|tengo|puede|pueden|puedo|va|van|voy|será|sería|hab[íi]a)\b/i,
}

/** Союз или относительное слово: карточка — обрывок придаточного. */
const SUBORDINATORS: Record<LanguageCode, RegExp> = {
  en: /\b(than|which|where|who|whom|whose|when|why|whether|unless|while|because|though|if)\b/i,
  es: /\b(que|quien|quienes|donde|cuando|porque|aunque|mientras|si|cual|cuales)\b/i,
}

/**
 * Смысловой глагол в третьем лице — вторая половина огрызка вроде «the clock stops».
 *
 * Список, а не правило про `-s`: по одному окончанию существительные во множественном
 * числе неотличимы от глаголов, и «three countries», «motorways», «the traps» вылетели
 * бы вместе с ними.
 */
const THIRD_PERSON: Record<LanguageCode, RegExp> = {
  // `para` в этом списке быть не может, хотя это форма `parar`: в испанском это прежде
  // всего предлог «для», и «para mí» вылетало бы из словаря как предложение.
  en: /\b(says|stops|works|means|takes|makes|gets|goes|comes|fades|joins|helps|needs|looks|feels|costs|hurts|keeps|runs|seems|sounds|matters|counts|changes|starts|ends|happens|depends|remains|applies|arrives|leaves|moves|opens|closes|holds|sends|shows|gives|wants|knows|thinks|finds|pays|reads|writes|lives|plays|calls|asks|puts|lets|wins|loses|rests|grows|falls|rises|adds|drops|fits|turns)\b/i,
  es: /\b(dice|dicen|funciona|significa|toma|hace|hacen|llega|llegan|sale|salen|queda|quedan|pasa|pasan|cuesta|cuestan|ayuda|necesita|parece|suena|empieza|termina|depende|vive|viven|escribe|lee|juega|llama|pregunta|gana|pierde|crece|cae|sube)\b/i,
}

/**
 * Подлежащее в начале — значит это предложение, а не единица.
 *
 * Нужно потому, что конечная точка перестала быть признаком предложения: испанский
 * контент ставит её даже одиночному слову («Hola.», «Adiós.»), и по точке из словаря
 * вылетали 874 карточки A1 — больше половины коротких. Точка снимается, а предложения
 * теперь ловятся по подлежащему: «It stays», «They never do», «Nobody knows».
 */
const SUBJECTS: Record<LanguageCode, RegExp> = {
  en: /^(i|you|he|she|we|they|it|there|nobody|somebody|anybody|everybody|everyone|someone|no\s?one|that|this|these|those|people)\b/i,
  es: /^(yo|tú|él|ella|usted|nosotros|nosotras|ellos|ellas|ustedes|nadie|alguien|todos|todas|esto|eso|aquello|la\s?gente)\b/i,
}

/** Личная форма русского глагола в переводе: «счётчик останавливается», «перестала притворяться». */
const RUSSIAN_FINITE = /(ется|ится|ются|атся|ятся|ает|яет|еет|ует|ыва[ею]т|ит|ат|ят|ут|ют|ла|ло|ли|[аеиоуыя]л)$/
/** Русский инфинитив — признак того, что глагольная фраза всё-таки единица: «вернуть», «осваиваться». */
const RUSSIAN_INFINITIVE = /(ть|ться)$/

/** Сколько слов ещё держится как одна единица. Четыре — это уже обрывок предложения. */
const MAX_WORDS = 3

/**
 * Чем является карточка — словом, устойчивой группой, набором форм, или ничем из этого.
 *
 * `null` не значит «плохая карточка»: в режиме фраз она на месте. Значит только, что
 * её нельзя выдать под вопросом «что это слово значит».
 */
export function vocabularyUnit(exercise: Exercise, language: LanguageCode): VocabularyKind | null {
  if (exercise.type !== 'flashcard') return null
  const prompt = (exercise.prompt ?? '').trim()
  const translation = (exercise.translation ?? '').trim()
  if (!prompt || !translation) return null
  // Многоточие — это оборванная фраза, запятая — две части предложения.
  if (prompt.includes('…') || prompt.includes(',') || translation.includes(',')) return null

  // «break — broke — broken»: для темы неправильных глаголов это и есть единица.
  if (prompt.includes(' — ')) return 'forms'

  // Конечная точка снимается, а не отбраковывается: см. `SUBJECTS`. Испанские
  // открывающие знаки — тоже: «¿Qué tal» без этого не совпадает ни с одним правилом.
  const bare = prompt.replace(/^[¿¡]+/, '').replace(/[.!?]+$/, '').trim()
  if (!bare) return null
  if (SUBJECTS[language].test(bare)) return null

  const words = bare.split(/\s+/)
  if (words.length > MAX_WORDS) return null
  if (AUXILIARIES[language].test(bare)) return null
  if (SUBORDINATORS[language].test(bare)) return null
  if (THIRD_PERSON[language].test(bare)) return null

  const translationWords = translation.split(/\s+/)
  if (translationWords.length > 1 && translationWords.some((word) => RUSSIAN_FINITE.test(word.toLowerCase()))) {
    return null
  }

  if (words.length === 1) return 'word'
  if (OPENERS[language].test(bare)) return 'phrase'
  // Глагольная фраза опознаётся по переводу: английская сторона «hand back» и
  // «nobody rests» выглядят одинаково, а «вернуть» и «никто не отдыхает» — нет.
  if (RUSSIAN_INFINITIVE.test(translation)) return 'phrase'
  return null
}

export const VOCABULARY_LESSON_ID = 'vocabulary'
const DEFAULT_SIZE = 12

export interface VocabularyOptions {
  courses: CoursePack[]
  level: CEFRLevel
  language: LanguageCode
  state: UserState
  size?: number
  now?: Date
  random?: () => number
}

export const VocabularyEngine = {
  /** Слова уровня, которые можно выдать сейчас. Порядок — общий для всей практики. */
  pool(courses: CoursePack[], level: CEFRLevel, language: LanguageCode): Exercise[] {
    return PracticeEngine
      .pool(courses, level, ['flashcard'])
      .filter((exercise) => vocabularyUnit(exercise, language) !== null)
  },

  count(courses: CoursePack[], level: CEFRLevel, language: LanguageCode): number {
    return this.pool(courses, level, language).length
  },

  build({ courses, level, language, state, size = DEFAULT_SIZE, now = new Date(), random = Math.random }: VocabularyOptions): Exercise[] {
    const pool = this.pool(courses, level, language)
    if (pool.length === 0) return []
    return prioritise(pool, state, now, random).slice(0, size)
  },

  /** Набор слов как урок для сессии; пройденным он не отмечается. */
  lesson(exercises: Exercise[]): Lesson {
    return {
      id: VOCABULARY_LESSON_ID,
      title: 'Слова',
      summary: 'Слово, перевод и пример употребления.',
      estimatedMinutes: Math.max(2, Math.round(exercises.length * 0.5)),
      exercises,
    }
  },
}
