import { Choice, ChoiceList } from 'english-coach-web'

/** The column the answers stand in — gap only, no chrome of its own. */
export function ThreeAnswers() {
  return (
    <div style={{ width: 340 }}>
      <ChoiceList>
        <Choice>Buenos días</Choice>
        <Choice selected>Buenas tardes</Choice>
        <Choice>Buenas noches</Choice>
      </ChoiceList>
    </div>
  )
}

/** Two long answers: the buttons grow in height rather than shrinking the text. */
export function LongAnswers() {
  return (
    <div style={{ width: 340 }}>
      <ChoiceList>
        <Choice>Ser — постоянное свойство</Choice>
        <Choice>Estar — состояние и место</Choice>
      </ChoiceList>
    </div>
  )
}
