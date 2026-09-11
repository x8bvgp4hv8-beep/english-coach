import { PracticeEngine, prioritise } from './practice'
import { shadowingPhrase } from './shadowing'
import { DEFAULT_LANGUAGE } from './language'
import type { LanguageCode } from './language'
import type { CEFRLevel, CoursePack, Exercise, Lesson, UserState } from './types'

/**
 * Listening: hear the sentence, write down what you heard, see what slipped past.
 * Kept in step with `EnglishCoachCore/Listening.swift`.
 *
 * Everything else in the app puts the English in front of the eyes first. That trains
 * reading, and reading is the skill that was never the problem: the wall is a native
 * speaker saying a sentence at speed. Here the text is hidden until the answer is in,
 * so the only way through is the ear.
 *
 * It is checked, not self-assessed. The same checker the written exercises use already
 * forgives contractions, British spelling and a slipped letter, and its word diff can
 * name the words that did not come through — which is exactly the feedback a listener
 * needs. Phrases are the ones that already ship: no new content, no network, no keys.
 */

export const LISTENING_LESSON_ID = 'listening'
const DEFAULT_SIZE = 8

/**
 * Two words heard is vocabulary; three carry a structure, and structure is what gets
 * lost at speed. Below that it is a spelling test with a speaker attached.
 */
const MIN_WORDS = 3

/**
 * Sentence-shaped: a capital at the front, a full stop at the back.
 *
 * Необходимое условие, но далеко не достаточное — см. ниже.
 */
const SENTENCE = /^[A-Z].*[.!?]$/

/**
 * Реплика, вырванная из разговора: формально предложение, на слух — ничто.
 *
 * Курс собран из диалогов, и в нём полно ответов, которые без предыдущей фразы не
 * значат ничего: «By this policy.», «And fifteen years of company.», «Two years in a
 * warehouse.», «Half on completion.». Заглавная буква и точка у них на месте, поэтому
 * прежний фильтр их пропускал, и в аудировании приходилось записывать обрывки.
 *
 * Ловятся они по началу: сочинительный союз, предлог или слово-реакция в первой позиции
 * значит, что предложение началось до этого.
 */
const FRAGMENT = /^(And|But|So|Or|Nor|Plus|Also|Because|Though|Although|Unless|While|Whereas|By|With|Without|From|For|In|On|At|To|Of|Into|Over|Under|After|Before|During|Yes|No|Sorry|Thanks|Right|Okay|OK|Exactly|Maybe|Perhaps|Probably|Only|Even|Just|Almost|Nearly|Twice|Once|Named|Dated|Confirmed|Always|Never|Sometimes|Usually)\b/

/** Начало настоящего предложения: подлежащее, вопрос или повелительная форма. */
const OPENER = /^(I|You|He|She|We|They|It|There|The|A|An|This|That|These|Those|My|Your|His|Her|Our|Their|Nobody|Somebody|Everyone|Someone|People|Who|What|Where|When|Why|How|Which|Whose|Any|Is|Are|Was|Were|Am|Do|Does|Did|Have|Has|Had|Can|Could|Will|Would|Should|Must|Shall|May|Might|Let|[A-Z][a-z]+)\b/

/**
 * Хоть один глагол — иначе это перечисление, а не фраза.
 *
 * Список, а не правило: «Named, dated and linked.», «Two automatic ones.», «Half on
 * completion.» выглядят как предложения ровно до того момента, когда в них пытаются
 * найти сказуемое. Регистр не учитывается: в вопросе глагол стоит первым и с заглавной
 * буквы — «Was the lock broken?», — и регистрозависимый список выбрасывал такие вопросы
 * вместе с мусором.
 */
const HAS_VERB = /\b(is|are|was|were|am|be|been|being|has|have|had|do|does|did|will|would|can|could|should|must|might|may|went|said|got|made|took|came|saw|knew|thought|found|gave|told|left|felt|kept|put|let|set|cut|read|paid|sent|lost|won|ran|began|drank|spoke|wrote|broke|stole|ate|chose|rang|sang|swam|forgot|understood|brought|bought|taught|caught|held|meant|met|sat|slept|spent|stood|hurt|cost|shut|need|needs|want|wants|like|likes|know|knows|think|thinks|say|says|go|goes|work|works|move|moves|ask|asks|help|helps|start|starts|stop|stops|change|changes|show|shows|keep|keeps|pay|pays|send|sends|call|calls|try|tries|use|uses|take|takes|make|makes|give|gives|get|gets|come|comes|see|sees|look|looks|feel|feels|leave|leaves|find|finds|tell|tells|matter|matters|bother|bothers|broken|closed|open)\b|\w{3,}ed\b/i

export interface ListeningItem {
  /** The exercise the sentence came from: progress is recorded against it. */
  exerciseID: string
  /** The English sentence, played but not shown until the answer is in. */
  text: string
  /** Russian meaning, offered as a hint before the answer. */
  gloss?: string
}

export interface ListeningSet {
  items: ListeningItem[]
  /** The same sentences as exercises, so the session records against real ids. */
  exercises: Exercise[]
}

export interface ListeningOptions {
  courses: CoursePack[]
  level: CEFRLevel
  language?: LanguageCode
  state: UserState
  size?: number
  now?: Date
  random?: () => number
}

/** The sentence to play for an exercise, or null when it has none worth listening to. */
export function listeningPhrase(exercise: Exercise, language: LanguageCode = DEFAULT_LANGUAGE): ListeningItem | null {
  const item = shadowingPhrase(exercise)
  if (!item) return null
  const text = item.text.trim()
  // "From my perspective…" is a sentence opener, not a sentence: nobody can write down
  // where it was going. Fine to say out loud, useless to transcribe.
  if (text.includes('…') || !SENTENCE.test(text)) return null
  if (text.split(/\s+/).length < MIN_WORDS) return null

  // Три списка выше собраны на английском и проверены английским замером
  // (`npm run measure:listening`). На испанском они отсеивают 99% — там нет ни одного
  // английского вспомогательного глагола, — поэтому другому языку достаётся только
  // базовое правило. Выключить ему аудирование ради чистоты было бы хуже, чем оставить
  // прежний порог: испанский набор придётся собирать и мерить отдельно.
  if (language !== 'en') return item
  if (FRAGMENT.test(text) || !OPENER.test(text) || !HAS_VERB.test(text)) return null
  return item
}

export const ListeningEngine = {
  /** Every sentence the learner could take by ear at this level and below. */
  pool(courses: CoursePack[], level: CEFRLevel, language: LanguageCode = DEFAULT_LANGUAGE): Exercise[] {
    return PracticeEngine.pool(courses, level).filter((exercise) => listeningPhrase(exercise, language) !== null)
  },

  count(courses: CoursePack[], level: CEFRLevel, language: LanguageCode = DEFAULT_LANGUAGE): number {
    return this.pool(courses, level, language).length
  },

  build({ courses, level, language = DEFAULT_LANGUAGE, state, size = DEFAULT_SIZE, now = new Date(), random = Math.random }: ListeningOptions): ListeningSet {
    const exercises = prioritise(this.pool(courses, level, language), state, now, random).slice(0, size)
    return { exercises, items: exercises.map((exercise) => listeningPhrase(exercise, language)!) }
  },

  /** Writing down what you heard is slow, so a set is short; it is never "completed". */
  lesson(exercises: Exercise[]): Lesson {
    return {
      id: LISTENING_LESSON_ID,
      title: 'На слух',
      summary: 'Слушай и записывай.',
      estimatedMinutes: Math.max(2, exercises.length),
      exercises,
    }
  },
}
