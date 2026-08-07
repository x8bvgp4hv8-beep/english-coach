import type { ReactNode } from 'react'

export interface EmptyNoteProps {
  /** Why this section is empty and what fills it. Two sentences at most. */
  children: ReactNode
}

/**
 * A section that has nothing in it yet, saying why.
 *
 * The alternative — seven disabled rows of zeros — looks like a broken screen. This
 * says what to do to make the rows appear.
 */
export function EmptyNote({ children }: EmptyNoteProps) {
  return <p className="empty-note">{children}</p>
}
