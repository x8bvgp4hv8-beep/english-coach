export interface ActionCardProps {
  /** A single glyph, shown white on the accent square. */
  icon: string
  /** The card's accent: tints the icon, the kicker, the chevron and the border. */
  color: string
  /** Small caps above the title — the *kind* of action ("СЛЕДУЮЩИЙ УРОК"). */
  kicker: string
  /** One line, truncated rather than wrapped. */
  title: string
  /** One line of supporting detail, also truncated. */
  subtitle: string
  onClick?: () => void
}

/**
 * The one thing to tap next.
 *
 * Every screen that offers a choice offers it as a stack of these, so "что мне сейчас
 * делать" is answered by the topmost card and never by a paragraph.
 */
export function ActionCard({ icon, color, kicker, title, subtitle, onClick }: ActionCardProps) {
  return (
    <button className="action" onClick={onClick} style={{ borderColor: `color-mix(in srgb, ${color} 22%, transparent)` }}>
      <span className="action-icon" style={{ background: color }}>{icon}</span>
      <span className="action-body">
        <span className="action-kicker" style={{ color }}>{kicker}</span>
        <div className="action-title">{title}</div>
        <div className="action-subtitle">{subtitle}</div>
      </span>
      <span className="action-chevron" style={{ color }}>›</span>
    </button>
  )
}
