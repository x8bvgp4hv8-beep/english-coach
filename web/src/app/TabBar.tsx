import { TABS } from './store'
import type { AppStore, Tab } from './store'

const LABEL: Record<Tab, string> = {
  today: 'Сегодня',
  course: 'Курс',
  practice: 'Тренировка',
  progress: 'Прогресс',
}

const ICON: Record<Tab, string> = {
  today: '☀️',
  course: '🗺',
  practice: '🎯',
  progress: '📈',
}

/**
 * The four peers, always in the same order and always in reach.
 *
 * The bar is only drawn over a tab. A lesson, the placement test and the language picker
 * take the whole screen on purpose: leaving a way out mid-exercise is how a session gets
 * abandoned one tap before it ends.
 */
export function TabBar({ model }: { model: AppStore }) {
  return (
    <nav className="tabbar" aria-label="Разделы">
      {TABS.map((tab) => {
        const current = model.screen === tab
        return (
          <button
            key={tab}
            className={`tabbar-item${current ? ' current' : ''}`}
            aria-current={current ? 'page' : undefined}
            onClick={() => model.setScreen(tab)}
          >
            <span className="tabbar-icon" aria-hidden="true">{ICON[tab]}</span>
            {LABEL[tab]}
          </button>
        )
      })}
    </nav>
  )
}
