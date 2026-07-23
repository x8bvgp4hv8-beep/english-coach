import type { AnswerResult } from './types'

/**
 * Mirrors EnglishCoachCore/AnswerChecker.swift.
 * Punctuation is dropped so word-order tokens (joined with spaces, "However ,")
 * match a canonical answer where it is attached ("However,"), and a learner who
 * forgets a comma or a final period still passes.
 */
const PUNCTUATION = /[.,!?;:—–"()]/g

export function normalize(input: string): string {
  return input
    .toLowerCase()
    .replace(/’/g, "'")
    .replace(PUNCTUATION, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .join(' ')
}

export function check(answer: string, canonical: string, accepted: string[] = []): AnswerResult {
  const expected = [canonical, ...accepted].map(normalize)
  return { isCorrect: expected.includes(normalize(answer)), canonical }
}
