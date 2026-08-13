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
 * Tapping the name opens settings, which is also where the language is changed; the
 * course label beside it says which one is open.
 */
export function Header({ model }: { model: AppStore }) {
  return (
    <header className="brandbar">
      <BrandMark />
      <button className="brandbar-name" onClick={() => model.setScreen('settings')}>
        <span className="brandbar-word">Coachirinho</span>
        <span className="brandbar-course">{model.currentLanguage.short} · {model.selectedLevel}</span>
      </button>
    </header>
  )
}
