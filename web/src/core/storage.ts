import { DEFAULT_LANGUAGE } from './language'
import { freshState, trimAttempts } from './types'
import type { LanguageCode } from './language'
import type { UserState } from './types'

/**
 * Mirrors EnglishCoachCore/ProgressStore.swift, but on localStorage.
 * Dates are stored as ISO strings, exactly like the macOS state.json, so a profile
 * can be moved between the two clients by hand if it ever matters.
 *
 * Each language keeps its own record: level, streak, points and spaced repetition are
 * about one language and would be nonsense pooled. English stays on the original key so
 * that adding Spanish does not cost anyone their English progress.
 */
const KEY = 'english-coach.state.v1'

export function storageKey(language: LanguageCode): string {
  return language === DEFAULT_LANGUAGE ? KEY : `${KEY}.${language}`
}

export interface ProgressStore {
  load(): UserState
  save(state: UserState): void
}

interface StoredState extends Omit<UserState, 'attempts' | 'reviews'> {
  attempts: Array<{ id: string; exerciseID: string; correct: boolean; date: string }>
  reviews: Array<{ id: string; exerciseID: string; due: string; intervalDays: number; ease: number; repetitions: number }>
}

export function serialize(state: UserState): string {
  const stored: StoredState = {
    ...state,
    attempts: state.attempts.map((a) => ({ ...a, date: a.date.toISOString() })),
    reviews: state.reviews.map((r) => ({ ...r, due: r.due.toISOString() })),
  }
  return JSON.stringify(stored)
}

export function deserialize(raw: string): UserState {
  const stored = JSON.parse(raw) as StoredState
  return {
    ...stored,
    completedLessonIDs: stored.completedLessonIDs ?? [],
    // Profiles written before the log was bounded get cut down on the way in.
    attempts: trimAttempts((stored.attempts ?? []).map((a) => ({ ...a, date: new Date(a.date) }))),
    reviews: (stored.reviews ?? []).map((r) => ({ ...r, due: new Date(r.due) })),
    points: stored.points ?? 0,
  }
}

export function localProgressStore(language: LanguageCode = DEFAULT_LANGUAGE): ProgressStore {
  const key = storageKey(language)
  return {
    load(): UserState {
      try {
        const raw = localStorage.getItem(key)
        return raw ? deserialize(raw) : freshState()
      } catch {
        // A corrupted or unreadable profile must not brick the app.
        return freshState()
      }
    },

    save(state: UserState): void {
      localStorage.setItem(key, serialize(state))
    },
  }
}

/**
 * Safari can clear site storage, and a relative losing three weeks of progress is
 * the kind of thing that ends usage. These two make a manual backup possible.
 */
export function exportBackup(state: UserState): Blob {
  return new Blob([serialize(state)], { type: 'application/json' })
}

export function importBackup(raw: string): UserState {
  const state = deserialize(raw)
  if (!Array.isArray(state.completedLessonIDs)) throw new Error('Это не файл прогресса English Coach')
  return state
}
