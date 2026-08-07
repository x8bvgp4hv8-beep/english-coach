import { Meter } from 'english-coach-web'

/** The pair that sits in the app header: where you are in the unit, and today's goal. */
export function HeaderPair() {
  return (
    <div style={{ display: 'flex', gap: 16, width: 320 }}>
      <Meter title="Блок 3 из 30" value={7 / 17} caption="7 / 17" color="var(--violet)" />
      <Meter title="Цель дня" value={0.6} caption="6 / 10 мин" color="var(--amber)" />
    </div>
  )
}

/** Done turns mint — the colour is the verdict, the caption still carries the number. */
export function GoalReached() {
  return (
    <div style={{ width: 200 }}>
      <Meter title="Цель дня" value={1} caption="выполнена" color="var(--mint)" />
    </div>
  )
}

export function JustStarted() {
  return (
    <div style={{ width: 200 }}>
      <Meter title="Блок 1 из 30" value={0} caption="0 / 17" color="var(--violet)" />
    </div>
  )
}
