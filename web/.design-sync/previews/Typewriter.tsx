import { Typewriter } from 'english-coach-web'

/**
 * The splash line.
 *
 * `speed={1}` on purpose: the component starts from an empty string and types one
 * character per `speed` ms, so at the real 55 ms a static screenshot catches an almost
 * blank card. A large `hold` keeps the finished line on screen instead of deleting it.
 */
export function Line() {
  return (
    <div style={{ width: 320, fontSize: 14, color: 'var(--ink-soft)' }}>
      <Typewriter lines={['Раскладываем карточки']} speed={1} hold={999999} />
    </div>
  )
}

/** The real rotation from the loading screen, one line at a time. */
export function Rotation() {
  return (
    <div style={{ width: 320, fontSize: 14, color: 'var(--ink-soft)' }}>
      <Typewriter
        lines={[
          'Смотрим, что пора повторить',
          'Готовим фразы для повторения вслух',
          'Считаем, сколько осталось до цели дня',
        ]}
        speed={1}
        hold={999999}
      />
    </div>
  )
}
