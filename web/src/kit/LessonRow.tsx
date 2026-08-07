export type LessonState = 'completed' | 'current' | 'available' | 'locked'

export interface LessonRowProps {
  title: string
  /** Shown before the status: "6 мин · продолжить". */
  minutes: number
  state: LessonState
  /**
   * The lesson that closes a unit: production only, no hints. It says so in the row,
   * because meeting it unannounced reads as a bug rather than as the point of the unit.
   */
  checkpoint?: boolean
  /** First/last in its unit — trims the connecting rail so the track has ends. */
  first?: boolean
  last?: boolean
  onStart?: () => void
}

const COLORS: Record<LessonState, string> = {
  completed: 'var(--violet)', current: 'var(--amber)', available: 'var(--blue)', locked: 'rgba(31,28,64,0.28)',
}
const ICONS: Record<LessonState, string> = { completed: '✓', current: '▶', available: '📖', locked: '🔒' }
const STATUS: Record<LessonState, string> = {
  completed: 'пройден', current: 'продолжить', available: 'доступен', locked: 'откроется после предыдущего',
}

/**
 * One stop on the route, strung on a vertical rail.
 *
 * The rail is what makes a list of lessons read as a path: it runs through the node,
 * darkens behind what is done, and stops at the ends of the unit.
 */
export function LessonRow({ title, minutes, state, checkpoint, first, last, onStart }: LessonRowProps) {
  const locked = state === 'locked'
  const icon = checkpoint && state !== 'completed' && !locked ? '🎯' : ICONS[state]
  const meta = checkpoint && !locked ? 'проверка блока, без подсказок' : STATUS[state]

  return (
    <button className={`lesson${checkpoint ? ' checkpoint' : ''}`} disabled={locked} onClick={onStart}>
      <span className={`rail${first ? ' first' : ''}${last ? ' last' : ''}${state === 'completed' ? ' done' : ''}`}>
        <span className={`node${state === 'current' ? ' current' : ''}`} style={{ background: COLORS[state] }}>
          {icon}
        </span>
      </span>
      <span className="lesson-body">
        <div className="lesson-title">{title}</div>
        <div className="lesson-meta">{minutes} мин · {meta}</div>
      </span>
      {state === 'current' && <span className="badge-now">СЕЙЧАС</span>}
    </button>
  )
}
