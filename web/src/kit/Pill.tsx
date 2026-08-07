import type { ReactNode } from 'react'

export interface PillProps {
  children: ReactNode
  /** Chosen, when the row of pills is a picker rather than a scoreboard. */
  selected?: boolean
}

/** A small standalone figure — a streak, a point total, a chosen option. */
export function Pill({ children, selected }: PillProps) {
  return <span className={`pill${selected ? ' selected' : ''}`}>{children}</span>
}
