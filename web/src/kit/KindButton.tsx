export interface KindButtonProps {
  /** A single glyph on a coloured tile. */
  icon: string
  /** Tile colour — one per kind of practice, stable across the app. */
  color: string
  title: string
  /** What the drill actually asks of you, in one line. */
  subtitle: string
  /** How many exercises are available. Zero reads as "нечего тренировать". */
  count: number
  disabled?: boolean
  onClick?: () => void
}

/**
 * One row in the list of practice kinds.
 *
 * The count is the point: it is the difference between an empty menu item and a drill
 * worth opening, so it sits at the end of the row where the eye lands last.
 */
export function KindButton({ icon, color, title, subtitle, count, disabled, onClick }: KindButtonProps) {
  return (
    <button className="kind" disabled={disabled} onClick={onClick}>
      <span className="kind-icon" style={{ background: color }}>{icon}</span>
      <span className="kind-body">
        <span className="kind-title">{title}</span>
        <span className="kind-subtitle">{subtitle}</span>
      </span>
      <span className="kind-count">{count}</span>
    </button>
  )
}
