import type { ReactNode } from 'react'

export interface SectionTitleProps {
  /** The name of the group. Rendered in small caps — keep it to one or two words. */
  children: ReactNode
  /** One line under the heading: what this group *means*, not what it does. */
  hint?: string
}

/**
 * A named group of rows on a long screen.
 *
 * The hint is where a number gets explained ("считается по твоим ответам, а не по
 * пройденным урокам") — without it the learner reads a figure and invents their own
 * rule for it.
 */
export function SectionTitle({ children, hint }: SectionTitleProps) {
  return (
    <div className="section-title">
      <h2>{children}</h2>
      {hint && <p>{hint}</p>}
    </div>
  )
}
