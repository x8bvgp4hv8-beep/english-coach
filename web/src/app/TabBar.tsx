import { Icon } from '../kit/Icons'
import { TABS } from './store'
import type { IconName } from '../kit/Icons'
import type { AppStore, Tab } from './store'

const LABEL: Record<Tab, string> = {
  today: 'Сегодня',
  course: 'Курс',
  practice: 'Тренировка',
  progress: 'Прогресс',
}

const ICON: Record<Tab, IconName> = {
  today: 'home',
  course: 'route',
  practice: 'practice',
  progress: 'chart',
}

/**
 * The four peers, always in the same order and always in reach.
 *
 * Drawn the way the prototype drew it: a line icon, the label under it, and a dot under
 * the label that only the current tab shows. The dot is the whole indicator — no pill,
 * no underline, no filled icon — and it is what makes the bar read as quiet.
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
            <Icon name={ICON[tab]} />
            <span>{LABEL[tab]}</span>
            <span className="tabbar-dot" aria-hidden="true" />
          </button>
        )
      })}
    </nav>
  )
}
