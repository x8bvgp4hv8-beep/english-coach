import { Choice, ChoiceList } from 'english-coach-web'

/**
 * A picked answer is a state, not a second action: a tint, a firm border and a tick.
 * Solid accent stays reserved for the one button that submits.
 */
export function Picking() {
  return (
    <div style={{ width: 340 }}>
      <ChoiceList>
        <Choice>Hola</Choice>
        <Choice selected>Gracias</Choice>
        <Choice>Adiós</Choice>
      </ChoiceList>
    </div>
  )
}

/** Nothing picked yet. */
export function Untouched() {
  return (
    <div style={{ width: 340 }}>
      <ChoiceList>
        <Choice>soy</Choice>
        <Choice>estoy</Choice>
        <Choice>tengo</Choice>
      </ChoiceList>
    </div>
  )
}

/** Locked after the answer was checked — the whole set dims and stops inviting a tap. */
export function Answered() {
  return (
    <div style={{ width: 340 }}>
      <ChoiceList>
        <Choice disabled>Hola</Choice>
        <Choice selected disabled>Gracias</Choice>
        <Choice disabled>Adiós</Choice>
      </ChoiceList>
    </div>
  )
}

/** A gap-fill, where the options are the forms being told apart. */
export function GapFill() {
  return (
    <div style={{ width: 340 }}>
      <ChoiceList>
        <Choice selected>soy</Choice>
        <Choice>estoy</Choice>
        <Choice>es</Choice>
      </ChoiceList>
    </div>
  )
}
