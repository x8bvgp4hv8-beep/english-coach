import { useEffect, useState } from 'react'

import { Typewriter } from './Typewriter'

/**
 * The only real wait in this app is the first launch on a phone, before the service
 * worker has the courses. On every later launch the content is already cached, so the
 * screen is held back for a moment: a splash that flashes for 80 ms reads as a glitch.
 */

const LINES = [
  'Раскладываем карточки',
  'Смотрим, что пора повторить',
  'Готовим фразы для повторения вслух',
  'Считаем, сколько осталось до цели дня',
]

export function Loading({ after = 250 }: { after?: number }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), after)
    return () => clearTimeout(timer)
  }, [after])

  if (!visible) return null

  return (
    <div className="loading" role="status" aria-live="polite">
      <div className="loading-mark">EC</div>
      <div className="loading-title">English Coach</div>
      <div className="loading-line"><Typewriter lines={LINES} /></div>
    </div>
  )
}
