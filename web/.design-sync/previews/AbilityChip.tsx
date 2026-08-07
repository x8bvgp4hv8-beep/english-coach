import { AbilityChip } from 'english-coach-web'

/**
 * Progress as ability instead of a percentage. Ticked chips are proven; grey ones are
 * what the unit currently being walked will add.
 */
export function EarnedAndNext() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, width: 360 }}>
      <AbilityChip state="earned">поздороваться и попрощаться</AbilityChip>
      <AbilityChip state="earned">назвать своё имя</AbilityChip>
      <AbilityChip state="earned">сказать, откуда ты</AbilityChip>
      <AbilityChip state="next">заказать кофе</AbilityChip>
      <AbilityChip state="next">спросить, сколько стоит</AbilityChip>
    </div>
  )
}

/** Nothing proven yet — the whole list is grey until the first unit closes. */
export function NothingEarnedYet() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, width: 360 }}>
      <AbilityChip state="next">поздороваться и попрощаться</AbilityChip>
      <AbilityChip state="next">назвать своё имя</AbilityChip>
      <AbilityChip state="next">спросить, кто это</AbilityChip>
    </div>
  )
}

/** A long ability wraps inside its own chip rather than stretching the row. */
export function LongAbility() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, width: 300 }}>
      <AbilityChip state="earned">рассказать о своём дне в прошедшем времени</AbilityChip>
    </div>
  )
}
