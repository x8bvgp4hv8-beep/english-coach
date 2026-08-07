import type { ReactNode } from 'react'

export interface SecondaryButtonProps {
  children: ReactNode
  disabled?: boolean
  onClick?: () => void
}

/**
 * The other way out: "Ещё раз", "Очистить", "Позже".
 *
 * Same size and weight as the primary so it is not a trap to hit, but unfilled — the
 * page still has exactly one obvious thing to press.
 */
export function SecondaryButton({ children, disabled, onClick }: SecondaryButtonProps) {
  return (
    <button className="secondary" disabled={disabled} onClick={onClick}>
      {children}
    </button>
  )
}
