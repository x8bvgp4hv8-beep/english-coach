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

/** After the answer is checked nothing moves any more, and the tray says so. */
export function Locked() {
  return (
    <div style={{ width: 340 }}>
      <WordOrderTray tokens={TOKENS} picked={[1, 0, 2, 3]} disabled />
    </div>
  )
}

/** A longer sentence: the pool wraps onto a second line and the tray grows with it. */
export function LongSentence() {
  const tokens = ['una', 'Me', 'reservar', 'gustaría', 'para', 'mesa', 'dos']
  return (
    <div style={{ width: 340 }}>
      <WordOrderTray tokens={tokens} picked={[1, 3, 5, 0, 4, 6]} />
    </div>
  )
}
