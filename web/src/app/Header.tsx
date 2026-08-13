import { Meter } from '../kit'
import type { AppStore } from './store'

/**
 * The strip every tab wears.
 *
 * It used to live inside the map, because the map was the whole app. Now that four tabs
 * share it, the only thing that changes between them is the title — the language, the
 * streak, the level and the way into settings stay put, so switching tabs never moves
 * the controls out from under a thumb.
 */
export function Header({ model, title }: { model: AppStore; title: string }) {
  return (
    <header className="header">
      <div className="header-top">
        <div>
          {/* The language is the first thing on screen and one tap from being changed. */}
          <button className="lang-chip" onClick={() => model.openLanguages()}>
            <span className="lang-chip-code">{model.currentLanguage.short}</span>
            {model.currentLanguage.title}
            <span className="lang-chip-caret">⌄</span>
          </button>
          <h1 className="brand-title">{title}</h1>
        </div>
        <div className="header-stats">
          <span className="stat" title="дней подряд">🔥 {model.streak()}</span>
          <span className="stat" title="очков всего">✦ {model.totalPoints}</span>
          <button className="level-chip" onClick={() => model.setScreen('settings')}>{model.selectedLevel}</button>
          <button className="icon-button" onClick={() => model.setScreen('settings')} aria-label="Настройки">⚙︎</button>
        </div>
      </div>
      <div className="meters">
        <Meter
          title={model.unitProgress.title}
          value={model.unitProgress.value}
          caption={model.unitProgress.caption}
          color="var(--violet)"
        />
        <Meter
          title="Цель дня"
          value={model.dailyGoalProgress}
          caption={model.dailyGoalReached ? 'выполнена' : `${model.todayPracticeMinutes} / ${model.dailyGoalMinutes} мин`}
          color={model.dailyGoalReached ? 'var(--mint)' : 'var(--amber)'}
        />
      </div>
    </header>
  )
}
