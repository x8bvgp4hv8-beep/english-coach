import { ActionCard } from 'english-coach-web'

/** The stack that opens the app: what to do next, then what is waiting. */
export function Stack() {
  return (
    <div style={{ width: 360 }}>
      <ActionCard
        icon="▶" color="var(--amber)" kicker="СЛЕДУЮЩИЙ УРОК"
        title="El alfabeto"
        subtitle="Первые слова · 6 мин"
      />
      <ActionCard
        icon="↻" color="var(--blue)" kicker="ПОВТОРЕНИЕ"
        title="34 упражнения ждут"
        subtitle="За раз — 20, начиная с самых давних"
      />
      <ActionCard
        icon="◎" color="var(--coral)" kicker="52% ВЕРНЫХ"
        title="Ser и estar"
        subtitle="13 из 25 · нажми, чтобы потренировать"
      />
    </div>
  )
}

/** One card alone — the colour carries the kind of action, nothing else does. */
export function NextLesson() {
  return (
    <div style={{ width: 360 }}>
      <ActionCard
        icon="▶" color="var(--amber)" kicker="СЛЕДУЮЩИЙ УРОК"
        title="¿Dónde está?"
        subtitle="Город и дорога · 8 мин"
      />
    </div>
  )
}

/** A long title is truncated, not wrapped: the card keeps its height in a list. */
export function LongTitle() {
  return (
    <div style={{ width: 360 }}>
      <ActionCard
        icon="◎" color="var(--coral)" kicker="48% ВЕРНЫХ"
        title="Прошедшее время: pretérito indefinido и imperfecto"
        subtitle="19 из 40 · нажми, чтобы потренировать"
      />
    </div>
  )
}
