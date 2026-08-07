import { WordOrderTray } from 'english-coach-web'

const TOKENS = ['está', '¿Dónde', 'la', 'estación?']

/** Nothing picked yet: the tray says what to do with itself. */
export function Empty() {
  return (
    <div style={{ width: 340 }}>
      <WordOrderTray tokens={TOKENS} picked={[]} />
    </div>
  )
}

/** Half built. Used words dim in the pool, so what is left is what is unplaced. */
export function HalfBuilt() {
  return (
    <div style={{ width: 340 }}>
      <WordOrderTray tokens={TOKENS} picked={[1, 0]} />
    </div>
  )
}

/** Finished sentence, waiting to be checked. */
export function Complete() {
  return (
    <div style={{ width: 340 }}>
      <WordOrderTray tokens={TOKENS} picked={[1, 0, 2, 3]} />
    </div>
  )
}

/**
 * A longer sentence: the pool wraps onto a second line and the tray grows with it.
 *
 * There is deliberately no `disabled` cell: `.token` carries no disabled styling today,
 * so a checked tray renders identically to a live one. See NOTES.md.
 */
export function LongSentence() {
  const tokens = ['una', 'Me', 'reservar', 'gustaría', 'para', 'mesa', 'dos']
  return (
    <div style={{ width: 340 }}>
      <WordOrderTray tokens={tokens} picked={[1, 3, 5, 0, 4, 6]} />
    </div>
  )
}
