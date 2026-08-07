import type { ReactNode } from 'react'

export interface KindListProps {
  /** A run of `KindButton`s. Dividers are drawn between them, not around them. */
  children: ReactNode
}

/** The card that holds the practice kinds: one border around the whole list, hairlines inside. */
export function KindList({ children }: KindListProps) {
  return <div className="kinds">{children}</div>
}
