import type { AnswerResult, WordDiff } from './types'

/**
 * Answer checking.
 *
 * The first version compared normalized strings for equality. With 38 of the 100
 * open-answer exercises carrying no alternative phrasing at all, that told learners
 * "неверно" for answers that were in fact correct, and pushed those answers into
 * spaced repetition. For a beginner that reads as "я не знаю английский", not as
 * "приложение придирается", so it is worth more than exact matching.
 *
 * Three things make it fair without accepting bad grammar:
 *   1. contractions are expanded on both sides ("I'm" == "I am", "he's" == "he is" or "he has");
 *   2. British and American spellings of the same word are treated as one word;
 *   3. a single mistyped long word is a typo, not a wrong answer: it counts as correct
 *      and the misspelling is pointed out.
 * Anything grammatical (wrong tense, missing article, wrong preposition) still fails.
 */

const PUNCTUATION = /[.,!?;:—–"()…]/g

/** Ambiguous forms expand to every reading; the answer matches if any reading matches. */
const CONTRACTIONS: Record<string, string[]> = {
  "i'm": ['i am'],
  "you're": ['you are'], "we're": ['we are'], "they're": ['they are'],
  "isn't": ['is not'], "aren't": ['are not'], "wasn't": ['was not'], "weren't": ['were not'],
  "don't": ['do not'], "doesn't": ['does not'], "didn't": ['did not'],
  "can't": ['cannot', 'can not'], "couldn't": ['could not'], "won't": ['will not'],
  "wouldn't": ['would not'], "shouldn't": ['should not'], "mustn't": ['must not'],
  "haven't": ['have not'], "hasn't": ['has not'], "hadn't": ['had not'],
  "i've": ['i have'], "you've": ['you have'], "we've": ['we have'], "they've": ['they have'],
  "i'll": ['i will'], "you'll": ['you will'], "he'll": ['he will'], "she'll": ['she will'],
  "we'll": ['we will'], "they'll": ['they will'], "it'll": ['it will'],
  "i'd": ['i would', 'i had'], "you'd": ['you would', 'you had'], "he'd": ['he would', 'he had'],
  "she'd": ['she would', 'she had'], "we'd": ['we would', 'we had'], "they'd": ['they would', 'they had'],
  "he's": ['he is', 'he has'], "she's": ['she is', 'she has'], "it's": ['it is', 'it has'],
  "that's": ['that is'], "there's": ['there is', 'there has'], "here's": ['here is'],
  "who's": ['who is'], "what's": ['what is'], "let's": ['let us'],
}

/** British spelling on the left, the form both are folded to on the right. */
const SPELLING: Record<string, string> = {
  colour: 'color', colours: 'colors', favourite: 'favorite', favourites: 'favorites',
  behaviour: 'behavior', neighbour: 'neighbor', neighbours: 'neighbors', humour: 'humor',
  realise: 'realize', realised: 'realized', organise: 'organize', organised: 'organized',
  apologise: 'apologize', apologised: 'apologized', recognise: 'recognize', recognised: 'recognized',
  travelled: 'traveled', travelling: 'traveling', cancelled: 'canceled', cancelling: 'canceling',
  centre: 'center', centres: 'centers', theatre: 'theater', theatres: 'theaters',
  metre: 'meter', metres: 'meters', litre: 'liter', litres: 'liters',
  grey: 'gray', programme: 'program', programmes: 'programs',
  licence: 'license', defence: 'defense', practise: 'practice', practised: 'practiced',
}

/** Grammar carriers: a difference here is never "just a typo". */
const FUNCTION_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'am', 'was', 'were', 'be', 'been', 'being',
  'do', 'does', 'did', 'have', 'has', 'had', 'will', 'would', 'shall', 'should',
  'can', 'could', 'may', 'might', 'must', 'not', 'no', 'to', 'of', 'in', 'on', 'at',
  'for', 'from', 'by', 'with', 'about', 'into', 'over', 'under', 'and', 'or', 'but',
  'he', 'she', 'it', 'they', 'we', 'you', 'i', 'his', 'her', 'its', 'their', 'our', 'your', 'my',
  'this', 'that', 'these', 'those', 'there', 'here', 'some', 'any', 'much', 'many',
])

const MAX_VARIANTS = 12

export function normalize(input: string): string {
  return input
    .toLowerCase()
    .replace(/’/g, "'")
    .replace(PUNCTUATION, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => SPELLING[word] ?? word)
    .join(' ')
}

/** Every reading of a normalized sentence once contractions are expanded. */
export function variants(normalized: string): string[] {
  let results: string[][] = [[]]
  for (const word of normalized.split(' ').filter(Boolean)) {
    const options = CONTRACTIONS[word] ?? [word]
    const next: string[][] = []
    for (const partial of results) {
      for (const option of options) {
        next.push([...partial, ...option.split(' ')])
        if (next.length >= MAX_VARIANTS) break
      }
      if (next.length >= MAX_VARIANTS) break
    }
    results = next
  }
  return [...new Set(results.map((words) => words.map((w) => SPELLING[w] ?? w).join(' ')))]
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  const previous = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = previous[0]
    previous[0] = i
    for (let j = 1; j <= b.length; j += 1) {
      const candidate = Math.min(
        previous[j] + 1,
        previous[j - 1] + 1,
        diagonal + (a[i - 1] === b[j - 1] ? 0 : 1),
      )
      diagonal = previous[j]
      previous[j] = candidate
    }
  }
  return previous[b.length]
}

/** Endings that carry grammar: dropping one is a mistake, never a slip of the finger. */
const INFLECTIONS = ['s', 'es', 'ed', 'd', 'ing', 'er', 'est', 'ly', 'ies']

/** True when the two words differ only by an inflection, e.g. cat / cats, work / worked. */
function isInflection(a: string, b: string): boolean {
  const [shorter, longer] = a.length <= b.length ? [a, b] : [b, a]
  if (!longer.startsWith(shorter)) {
    // cities / city: the stem changes, but it is still morphology.
    const stem = longer.replace(/(ies|ied)$/, '')
    return stem.length > 0 && shorter.startsWith(stem) && longer !== shorter
  }
  return INFLECTIONS.includes(longer.slice(shorter.length))
}

/**
 * A single long content word misspelled by one or two letters. Short words, grammar
 * words and inflections get no tolerance, because "is"/"as", "go"/"goes" and
 * "cat"/"cats" are mistakes, not slips of the finger.
 */
function typoOf(answerWords: string[], expectedWords: string[]): string | null {
  if (answerWords.length !== expectedWords.length) return null
  const differing = answerWords.map((word, i) => [word, expectedWords[i]] as const).filter(([a, b]) => a !== b)
  if (differing.length !== 1) return null
  const [written, expected] = differing[0]
  if (FUNCTION_WORDS.has(written) || FUNCTION_WORDS.has(expected)) return null
  if (expected.length < 4) return null
  if (isInflection(written, expected)) return null
  const distance = levenshtein(written, expected)
  const budget = expected.length >= 8 ? 2 : 1
  return distance > 0 && distance <= budget ? expected : null
}

/** Splits into words for display: punctuation is dropped, but the writing is kept. */
function displayWords(input: string): string[] {
  return input.replace(/’/g, "'").replace(PUNCTUATION, ' ').split(/\s+/).filter(Boolean)
}

/** Word level diff, so feedback can say what is missing rather than just print the answer. */
export function diffWords(answer: string, canonical: string): WordDiff[] {
  const a = normalize(answer).split(' ').filter(Boolean)
  const b = normalize(canonical).split(' ').filter(Boolean)
  // Compared in lower case, shown as written: "не хватает: Monday", not "monday".
  const aShown = displayWords(answer)
  const bShown = displayWords(canonical)
  const table: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0))
  for (let i = a.length - 1; i >= 0; i -= 1) {
    for (let j = b.length - 1; j >= 0; j -= 1) {
      table[i][j] = a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1])
    }
  }
  const diff: WordDiff[] = []
  let i = 0
  let j = 0
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      diff.push({ kind: 'same', text: bShown[j] ?? b[j] })
      i += 1
      j += 1
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      diff.push({ kind: 'extra', text: aShown[i] ?? a[i] })
      i += 1
    } else {
      diff.push({ kind: 'missing', text: bShown[j] ?? b[j] })
      j += 1
    }
  }
  while (i < a.length) { diff.push({ kind: 'extra', text: aShown[i] ?? a[i] }); i += 1 }
  while (j < b.length) { diff.push({ kind: 'missing', text: bShown[j] ?? b[j] }); j += 1 }
  return diff
}

/**
 * What to tell the learner about a wrong answer, or null when the answer is too far
 * off for a word list to help: naming twelve missing words is noise, not feedback.
 */
export function diffSummary(diff: WordDiff[] | undefined): { missing: string[]; extra: string[]; orderOnly: boolean } | null {
  if (!diff || diff.length === 0) return null
  const same = diff.filter((part) => part.kind === 'same').length
  const expected = diff.filter((part) => part.kind !== 'extra').length
  if (expected === 0 || same / expected < 0.5) return null
  const missing = diff.filter((part) => part.kind === 'missing').map((part) => part.text)
  const extra = diff.filter((part) => part.kind === 'extra').map((part) => part.text)
  if (!missing.length && !extra.length) return null
  // Same words, different places: listing them as both missing and extra reads as nonsense.
  const key = (words: string[]) => words.map((word) => word.toLowerCase()).sort().join(' ')
  const orderOnly = missing.length > 0 && key(missing) === key(extra)
  return { missing, extra, orderOnly }
}

export function check(answer: string, canonical: string, accepted: string[] = []): AnswerResult {
  const answerVariants = variants(normalize(answer))
  const expectedVariants = [canonical, ...accepted].flatMap((text) => variants(normalize(text)))

  if (answerVariants.some((variant) => expectedVariants.includes(variant))) {
    return { isCorrect: true, verdict: 'correct', canonical }
  }

  for (const expected of expectedVariants) {
    for (const given of answerVariants) {
      const corrected = typoOf(given.split(' ').filter(Boolean), expected.split(' ').filter(Boolean))
      if (corrected) {
        return { isCorrect: true, verdict: 'typo', canonical, typo: corrected }
      }
    }
  }

  return { isCorrect: false, verdict: 'wrong', canonical, diff: diffWords(answer, canonical) }
}
