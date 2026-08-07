import { PrimaryButton } from 'english-coach-web'

/** Accent submits and moves on; mint is a positive verdict, not a second colour choice. */
export function Tones() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 300 }}>
      <PrimaryButton>Проверить</PrimaryButton>
      <PrimaryButton tone="mint">Вспомнил</PrimaryButton>
      <PrimaryButton disabled>Проверить</PrimaryButton>
    </div>
  )
}

/** Nothing typed yet, so there is nothing to check. */
export function Disabled() {
  return (
    <div style={{ width: 300 }}>
      <PrimaryButton disabled>Проверить</PrimaryButton>
    </div>
  )
}

/** The labels it actually carries across the app. */
export function RealLabels() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 300 }}>
      <PrimaryButton>Дальше</PrimaryButton>
      <PrimaryButton>Понятно</PrimaryButton>
      <PrimaryButton>Запомнил</PrimaryButton>
      <PrimaryButton tone="mint">Перейти на A2</PrimaryButton>
    </div>
  )
}
