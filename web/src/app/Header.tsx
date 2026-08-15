import { BrandMark } from '../kit/Icons'
import type { AppStore } from './store'

/**
 * The strip every tab wears — the prototype's, which is almost nothing.
 *
 * A mark, the name, and the course in six characters. What used to live here — the
 * language chip, the streak, the points, two progress meters — is not gone but moved to
 * where each belongs: the streak and the daily goal are pills on Сегодня, the meters are
 * the top of Прогресс. The header stopped being a dashboard.
 *
 * Two targets, not one. The name opens settings; the course beside it opens the course
 * itself — the screen with the rhino on it. That is the only way back to a screen the
 * app otherwise shows once, on the very first launch, and burying it under settings
 * made the app look as though it had lost it.
 */
export function Header({ model }: { model: AppStore }) {
  return (
    <header className="brandbar">
      <BrandMark />
      <button className="brandbar-name" onClick={() => model.setScreen('settings')}>
        <span className="brandbar-word">Coachirinho</span>
      </button>
      <button className="brandbar-course" onClick={() => model.openLanguages()}>
        {model.currentLanguage.short} · {model.selectedLevel}
      </button>
    </header>
  )
}
