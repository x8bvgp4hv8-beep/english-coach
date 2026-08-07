import { useEffect, useState } from 'react'

export interface TypewriterProps {
  /** Cycled forever, in order. */
  lines: string[]
  /** Milliseconds per typed character. */
  speed?: number
  deleteSpeed?: number
  /** How long a finished line stays on screen. */
  hold?: number
}

const prefersReducedMotion = (): boolean =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Types a line out, holds it, deletes it, moves to the next one.
 *
 * Written by hand rather than pulled in as a dependency: the effect is a timer and
 * a substring, and this client stays small enough to precache for offline use.
 * With reduced motion the first line is simply shown — it still has to be readable.
 */
export function Typewriter({ lines, speed = 55, deleteSpeed = 28, hold = 1500 }: TypewriterProps) {
  const [index, setIndex] = useState(0)
  const [length, setLength] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const still = prefersReducedMotion()

  useEffect(() => {
    if (still || lines.length === 0) return
    const line = lines[index % lines.length]

    if (!deleting && length === line.length) {
      const timer = setTimeout(() => setDeleting(true), hold)
      return () => clearTimeout(timer)
    }
    if (deleting && length === 0) {
      setDeleting(false)
      setIndex((current) => (current + 1) % lines.length)
      return
    }
    const timer = setTimeout(() => setLength((current) => current + (deleting ? -1 : 1)), deleting ? deleteSpeed : speed)
    return () => clearTimeout(timer)
  }, [lines, index, length, deleting, speed, deleteSpeed, hold, still])

  if (still) return <span className="typewriter">{lines[0] ?? ''}</span>

  return (
    <span className="typewriter">
      {(lines[index % lines.length] ?? '').slice(0, length)}
      <span className="caret" aria-hidden="true" />
    </span>
  )
}
