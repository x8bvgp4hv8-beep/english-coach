import { Pill } from 'english-coach-web'

/** The scoreboard on the finish screen: points and streak, side by side. */
export function Score() {
  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', width: 300 }}>
      <Pill>✦ 320</Pill>
      <Pill>🔥 12</Pill>
    </div>
  )
}

/** As a picker: one of the row is chosen and says so. */
export function AsPicker() {
  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', width: 340 }}>
      <Pill>5 мин</Pill>
      <Pill selected>10 мин</Pill>
      <Pill>15 мин</Pill>
    </div>
  )
}

/** The level picker from onboarding. */
export function Levels() {
  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', width: 360 }}>
      <Pill selected>A1</Pill>
      <Pill>A2</Pill>
      <Pill>B1</Pill>
      <Pill>B2</Pill>
      <Pill>C1</Pill>
    </div>
  )
}
