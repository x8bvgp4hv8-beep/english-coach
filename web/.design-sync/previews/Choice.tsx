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

/**
 * A gap-fill, where the options are the two words being told apart.
 *
 * There is deliberately no `disabled` cell: `.choice` carries no disabled styling today,
 * so a locked answer renders identically to a live one and a card claiming otherwise
 * would be lying. See NOTES.md.
 */
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
