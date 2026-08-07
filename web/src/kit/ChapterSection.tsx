import type { ReactNode } from 'react'

export interface ChapterSectionProps {
  /** Position on the route, 1-based. Shown as "БЛОК 3". */
  number: number
  title: string
  /** One line on what the unit is about. Only shown while open. */
  subtitle?: string
  /** What the unit teaches you to do — the reason to walk it. Only shown while open. */
  canDo?: string[]
  /** Lessons finished, out of `total`. Turns mint when they are equal. */
  done: number
  total: number
  open: boolean
  onToggle?: () => void
  /** The unit's `LessonRow`s. Not rendered while collapsed. */
  children?: ReactNode
}

/**
 * A unit on the route, open only when it is the one being walked.
 *
 * With thirty units of seventeen lessons the map became forty screens of mostly locked
 * rows — on a phone that is a wall, not a route. Collapsed units keep the whole level
 * visible at a glance and let the eye land on the one that is actually next.
 */
export function ChapterSection({ number, title, subtitle, canDo, done, total, open, onToggle, children }: ChapterSectionProps) {
  return (
    <section className={`chapter${open ? '' : ' collapsed'}`}>
      <h2 className="chapter-heading">
        <button className="chapter-head" onClick={onToggle} aria-expanded={open}>
          <span className="chapter-number">БЛОК {number}</span>
          <span className="chapter-title">{title}</span>
          <span className={`chapter-count${done === total ? ' done' : ''}`}>
            {done} / {total}
          </span>
          <span className="chapter-caret">{open ? '⌃' : '⌄'}</span>
        </button>
      </h2>

      {open && (
        <>
          {subtitle && <p className="chapter-subtitle">{subtitle}</p>}
          {(canDo ?? []).length > 0 && (
            <ul className="chapter-cando">
              {canDo!.map((item) => <li key={item}>{item}</li>)}
            </ul>
          )}
          <div className="chapter-rule" />
          {children}
        </>
      )}
    </section>
  )
}
