import { PrimaryButton, SecondaryButton } from 'english-coach-web'

/**
 * The pair at the bottom of the player. Same size and weight, so the second option is
 * not a trap to hit — but only one of them is filled.
 */
export function WithPrimary() {
  return (
    <div style={{ display: 'flex', gap: 10, width: 340 }}>
      <SecondaryButton>Ещё раз</SecondaryButton>
      <PrimaryButton tone="mint">Дальше</PrimaryButton>
    </div>
  )
}

export function Alone() {
  return (
    <div style={{ width: 340 }}>
      <SecondaryButton>Прочитать вслух целиком</SecondaryButton>
    </div>
  )
}

/** Nothing to clear yet. */
export function Disabled() {
  return (
    <div style={{ width: 340 }}>
      <SecondaryButton disabled>Очистить</SecondaryButton>
    </div>
  )
}

/** The two-button row of the word-order exercise. */
export function ClearAndCheck() {
  return (
    <div style={{ display: 'flex', gap: 10, width: 340 }}>
      <SecondaryButton>Очистить</SecondaryButton>
      <PrimaryButton>Проверить</PrimaryButton>
    </div>
  )
}
