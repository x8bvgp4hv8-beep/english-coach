import { useStore } from './App'
import { Header } from './Header'
import { LevelBar } from './Today'
import { plural } from './plural'
import { EmptyNote, SectionTitle } from '../kit'
import type { AppStore } from './store'

/**
 * The tab the app never had: what the last week actually looked like.
 *
 * Everything on it was already being recorded — minutes per day, the streak, points,
 * units closed — it simply had nowhere to be seen but a single line in the header.
 */
export function Progress() {
  const model = useStore()
  const streak = model.streak()

  return (
    <>
      <Header model={model} title="Прогресс" />
      <div className="scroll">
        <div className="streak-hero">
          <span className="streak-figure">🔥 {streak}</span>
          <span className="streak-caption">
            {streak === 0
              ? 'Серия начнётся с первого занятия сегодня'
              : `${plural(streak, 'день', 'дня', 'дней')} подряд`}
          </span>
        </div>

        <SectionTitle hint={`Пунктир — твоя цель, ${model.dailyGoalMinutes} мин в день`}>
          Минуты по дням
        </SectionTitle>
        <WeekChart model={model} />

        <LevelBar model={model} />

        <SectionTitle>Всего</SectionTitle>
        <div className="totals">
          <Total value={`✦ ${model.totalPoints}`} caption="очков" />
          <Total value={`${model.levelProgress.done}`} caption={plural(model.levelProgress.done, 'блок закрыт', 'блока закрыто', 'блоков закрыто')} />
          <Total value={`${model.dueCount}`} caption="ждёт повторения" />
        </div>
      </div>
    </>
  )
}

function Total({ value, caption }: { value: string; caption: string }) {
  return (
    <div className="total">
      <span className="total-value">{value}</span>
      <span className="total-caption">{caption}</span>
    </div>
  )
}

/**
 * Seven days of practice as seven bars.
 *
 * One series, so no legend — the section title names it. Whether a day met the goal is
 * drawn as a line across the chart rather than as a colour alone, so the answer survives
 * a screenshot, a colour-blind reader and a black-and-white print; the colour is a
 * second voice saying the same thing.
 *
 * The scale is the taller of the goal and the best day, which keeps the goal line on
 * screen even in a week where nothing reached it.
 */
function WeekChart({ model }: { model: AppStore }) {
  const days = model.recentDays(7)
  const best = Math.max(...days.map((day) => day.minutes))
  const top = Math.max(model.dailyGoalMinutes, best, 1)
  const goalAt = (model.dailyGoalMinutes / top) * 100

  if (best === 0) {
    return <EmptyNote>За последнюю неделю занятий не записано. Первый же урок появится здесь столбиком.</EmptyNote>
  }

  return (
    <div className="week">
      <div className="week-plot">
        <div className="week-goal" style={{ bottom: `${goalAt}%` }} aria-hidden="true" />
        {days.map((day, index) => (
          <div className="week-col" key={day.key}>
            <div
              className={`week-bar${day.goalReached ? ' reached' : ''}`}
              style={{ height: `${(day.minutes / top) * 100}%` }}
              role="img"
              aria-label={`${day.weekday}: ${day.minutes} ${plural(day.minutes, 'минута', 'минуты', 'минут')}${day.goalReached ? ', цель выполнена' : ''}`}
            >
              {/* Only the day being lived gets a number: seven of them is a table, not a chart. */}
              {index === days.length - 1 && day.minutes > 0 && (
                <span className="week-value">{day.minutes}</span>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="week-axis">
        {days.map((day, index) => (
          <span key={day.key} className={index === days.length - 1 ? 'today' : undefined}>{day.weekday}</span>
        ))}
      </div>
    </div>
  )
}
