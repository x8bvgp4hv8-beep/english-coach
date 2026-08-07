import { Feedback } from 'english-coach-web'

export function Correct() {
  return (
    <div style={{ width: 320 }}>
      <Feedback verdict="correct" />
    </div>
  )
}

/** A misspelling is counted and still corrected — being marked wrong for an accent teaches nothing. */
export function Typo() {
  return (
    <div style={{ width: 320 }}>
      <Feedback verdict="typo" note="Не хватает ударений: правильно «mañana»" />
    </div>
  )
}

export function Wrong() {
  return (
    <div style={{ width: 320 }}>
      <Feedback verdict="wrong" answer="Muchas gracias. ¡Adiós!" />
    </div>
  )
}

/** When the answer was close enough to be worth naming what was missing. */
export function WrongWithDiff() {
  return (
    <div style={{ width: 320 }}>
      <Feedback
        verdict="wrong"
        answer="¿Dónde está la estación?"
        diff="не хватает: dónde  ·  лишнее: cómo"
      />
    </div>
  )
}
