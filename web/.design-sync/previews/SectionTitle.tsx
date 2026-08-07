import { SectionTitle } from 'english-coach-web'

/** Bare heading — used where the group needs no defending. */
export function Plain() {
  return (
    <div style={{ width: 360 }}>
      <SectionTitle>Сегодня</SectionTitle>
    </div>
  )
}

/**
 * The hint is where a number gets explained. Without it the learner reads a figure and
 * invents their own rule for it.
 */
export function WithHint() {
  return (
    <div style={{ width: 360 }}>
      <SectionTitle hint="Считается по твоим ответам, а не по пройденным урокам">
        Что проседает
      </SectionTitle>
    </div>
  )
}

/** How a screen actually reads: several groups down one column. */
export function Sequence() {
  return (
    <div style={{ width: 360 }}>
      <SectionTitle>Сегодня</SectionTitle>
      <SectionTitle hint="Появится, когда закроешь первый блок">Что ты умеешь</SectionTitle>
      <SectionTitle hint="Каждый урок: послушай — новые слова — правило — узнай — скажи сам">
        Маршрут A1
      </SectionTitle>
    </div>
  )
}
