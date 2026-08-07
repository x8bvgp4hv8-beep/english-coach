import type { ReactNode } from 'react'

export interface ChoiceListProps {
  /** A stack of `Choice`s. */
  children: ReactNode
}

/** The column the answers stand in. */
export function ChoiceList({ children }: ChoiceListProps) {
  return <div className="choices">{children}</div>
}
