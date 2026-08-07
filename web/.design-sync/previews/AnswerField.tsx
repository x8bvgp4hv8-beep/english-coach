import { AnswerField } from 'english-coach-web'

/** Waiting for a translation. Autocorrect is off — the phone fixing a foreign word answers for you. */
export function Empty() {
  return (
    <div style={{ width: 340 }}>
      <AnswerField value="" placeholder="Напиши перевод…" />
    </div>
  )
}

export function Typed() {
  return (
    <div style={{ width: 340 }}>
      <AnswerField value="¿Dónde está la estación?" placeholder="Напиши перевод…" />
    </div>
  )
}

/**
 * A long answer stays on one line and scrolls inside the field rather than growing it.
 *
 * There is deliberately no `disabled` cell: `.answer-field` carries no disabled styling
 * today, so a locked field renders identically to a live one. See NOTES.md.
 */
export function LongAnswer() {
  return (
    <div style={{ width: 340 }}>
      <AnswerField
        value="Me gustaría reservar una mesa para dos personas"
        placeholder="Напиши перевод…"
      />
    </div>
  )
}
