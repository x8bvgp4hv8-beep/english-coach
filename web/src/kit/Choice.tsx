import type { ReactNode } from 'react'

export interface ChoiceProps {
  /** The answer as the learner reads it. */
  children: ReactNode
  /** Picked, but not yet submitted. */
  selected?: boolean
  /** Locked after the answer has been checked. */
  disabled?: boolean
  onSelect?: () => void
}

/**
 * One answer to pick from.
 *
 * A picked answer is a state, not a second action. Filling it with the accent made it
 * weigh the same as the button that submits, and the eye could not tell which one to
 * press — so selection is a tint, a firm border and a tick, and solid accent is
 * reserved for the one thing that actually submits.
 */
export function Choice({ children, selected, disabled, onSelect }: ChoiceProps) {
  return (
    <button className={`choice${selected ? ' selected' : ''}`} disabled={disabled} onClick={onSelect}>
      {children}
    </button>
  )
}
