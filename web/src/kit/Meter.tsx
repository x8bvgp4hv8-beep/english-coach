export interface MeterProps {
  /** What is being measured, e.g. "Блок 3 из 30". */
  title: string
  /** Fill, 0…1. Anything above 1 is clamped rather than overflowing the track. */
  value: number
  /** The figure itself, right-aligned above the bar: "7 / 17", "выполнена". */
  caption: string
  /** Bar and caption colour — a CSS colour or a token, e.g. `var(--mint)`. */
  color: string
}

/**
 * A labelled progress bar, used in pairs in the header.
 *
 * The caption carries the real number and the bar only echoes it: a learner who wants
 * "сколько осталось" gets a count, not a percentage they have to translate back.
 */
export function Meter({ title, value, caption, color }: MeterProps) {
  return (
    <div className="meter">
      <div className="meter-row">
        <span>{title}</span>
        <span className="meter-value" style={{ color }}>{caption}</span>
      </div>
      <div className="bar"><span style={{ width: `${Math.min(1, value) * 100}%`, background: color }} /></div>
    </div>
  )
}
