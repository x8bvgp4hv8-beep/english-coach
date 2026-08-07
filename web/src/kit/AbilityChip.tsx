export interface AbilityChipProps {
  /** Something the learner can say out loud, phrased as a deed: "спросить дорогу". */
  children: string
  /**
   * `earned` — already proven, ticked and in full ink.
   * `next` — what the unit currently being walked will add; greyed, no tick.
   */
  state: 'earned' | 'next'
}

/**
 * One ability, earned or promised.
 *
 * Progress as ability instead of as a percentage: "A1 — 9%" is not something a learner
 * can act on, "✓ представиться" is.
 */
export function AbilityChip({ children, state }: AbilityChipProps) {
  return state === 'earned'
    ? <span className="ability done">✓ {children}</span>
    : <span className="ability next">{children}</span>
}
