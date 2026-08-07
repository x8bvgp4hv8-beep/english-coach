import type { ReactNode } from 'react'

export interface PrimaryButtonProps {
  children: ReactNode
  /**
   * `accent` — the one thing that submits or moves on.
   * `mint` — a positive verdict: "засчитано", "вспомнил". Semantic, not decorative.
   */
  tone?: 'accent' | 'mint'
  disabled?: boolean
  onClick?: () => void
}

/**
 * The main action. One per screen, full width, at the bottom where the thumb is.
 *
 * It carries a sheen that sweeps once on press, and in the cartoon theme it sinks onto
 * its own bottom edge — the press is physical where the theme is physical.
 */
export function PrimaryButton({ children, tone = 'accent', disabled, onClick }: PrimaryButtonProps) {
  return (
    <button className={`primary${tone === 'mint' ? ' mint' : ''}`} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  )
}
