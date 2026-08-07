export interface TopicRowProps {
  title: string
  /** What the topic covers, in one line of plain Russian. */
  summary: string
  /** CEFR level the topic belongs to. Only shown once the learner has a record on it. */
  level: string
  /** Answers given on this topic. Zero means it has never been met. */
  attempts: number
  correct: number
  /** Share correct, 0…1. Drives both the figure and the colour. */
  accuracy: number
  /** Exercises the course can offer right now. Zero locks the row: nothing to drill yet. */
  exercises: number
  onClick?: () => void
}

/**
 * A grammar topic with the learner's record on it, and a way straight into drilling it.
 *
 * The colour is a verdict, not decoration: under 60% is coral, under 75% amber, above
 * that mint. An untouched topic stays grey — no record is not the same as a bad one.
 */
export function TopicRow({ title, summary, level, attempts, correct, accuracy, exercises, onClick }: TopicRowProps) {
  const seen = attempts > 0
  const percent = Math.round(accuracy * 100)
  const tone = !seen ? 'var(--ink-soft)' : percent < 60 ? 'var(--coral)' : percent < 75 ? 'var(--amber)' : 'var(--mint)'
  // A topic the course has not reached yet has nothing to drill: the row states that
  // instead of being a button that does nothing when tapped.
  const locked = exercises === 0

  return (
    <button className="topic" disabled={locked} onClick={onClick}>
      <span className="topic-body">
        <span className="topic-head">
          <span className="topic-title">{title}</span>
          <span className="topic-score" style={{ color: tone }}>
            {seen ? `${percent}%` : locked ? 'дальше' : `${exercises} упр.`}
          </span>
        </span>
        <span className="topic-summary">{summary}</span>
        <span className="bar topic-bar">
          <span style={{ width: `${seen ? Math.max(4, percent) : 0}%`, background: tone }} />
        </span>
        {seen && <span className="topic-meta">{correct} из {attempts} верно · {level}</span>}
        {!seen && locked && <span className="topic-meta">откроется, когда до неё дойдут уроки</span>}
      </span>
      <span className="topic-go">{locked ? '·' : '▶'}</span>
    </button>
  )
}
