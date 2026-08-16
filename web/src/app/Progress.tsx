import { useStore } from './App'
import { Header } from './Header'
import { plural, spell } from './plural'
import { AbilityChip, EmptyNote, SectionTitle } from '../kit'
import type { AppStore } from './store'

/**
 * The week, the level and what the answers add up to.
 *
 * Everything on it was already being recorded — minutes per day, units closed, the
 * accuracy behind the weak topics — it simply had nowhere to be seen but one line of
 * header. The two meters that used to sit on every screen live here now, where they are
 * the subject rather than decoration.
 */
export function Progress() {
  const model = useStore()
  const level = model.levelProgress
  const unit = model.unitProgress
  const answers = model.recentAccuracy

  return (
    <>
      <Header model={model} />
      <div className="scroll">
        <div className="twin-bars">
          <div className="twin">
            <span className="twin-track"><span style={{ width: `${level.value * 100}%`, background: 'var(--mint)' }} /></span>
            <span className="twin-row">
              <span className="twin-label">Блок {unit.title.match(/\d+/)?.[0] ?? 1} из {level.total}</span>
              <span className="twin-value" style={{ color: 'var(--amber)' }}>{unit.caption}</span>
            </span>
          </div>
          <div className="twin">
            <span className="twin-track"><span style={{ width: `${answers.share * 100}%`, background: 'var(--ink)' }} /></span>
            <span className="twin-row">
              <span className="twin-label">Верных ответов</span>
              <span className="twin-value" style={{ color: 'var(--blue)' }}>{answers.correct} из {answers.total}</span>
            </span>
          </div>
        </div>

        <SectionTitle hint="Не слова, а то, что ты можешь ими сделать">Умения</SectionTitle>
        <Abilities model={model} />

        <SectionTitle>Произношение</SectionTitle>
        <Pronunciation model={model} />

        <SectionTitle>Минуты по дням</SectionTitle>
        <p className="chart-goal">Цель — {model.dailyGoalMinutes} минут в день</p>
        <WeekChart model={model} />

        <PaceCheck model={model} />
      </div>
    </>
  )
}

/**
 * Сколько урок стоит на самом деле.
 *
 * Объём курса посчитан из нормы Cambridge через оценку в одиннадцать минут на урок.
 * Оценка проверяется единственным способом, который вообще возможен, — замером на
 * живом прохождении. Пока замеров меньше пяти, блок не показывается вовсе: цифра по
 * двум урокам была бы не проверкой, а видимостью проверки.
 */
function PaceCheck({ model }: { model: AppStore }) {
  const pace = model.paceCheck
  if (!pace) return null
  const drift = Math.round(Math.abs(pace.ratio - 1) * 100)
  const verdict = drift <= 10
    ? 'оценка сходится'
    : pace.ratio > 1
      ? `дольше оценки на ${drift}%`
      : `быстрее оценки на ${drift}%`
  return (
    <>
      <SectionTitle hint="Из этой цифры посчитан объём всего курса">Длина урока</SectionTitle>
      <p className="chart-line">
        {pace.actualMinutes} мин против {pace.estimateMinutes} — {verdict}.
        {' '}Замеров: {pace.samples}.
      </p>
    </>
  )
}

/**
 * What the level has actually bought you, said as things you can do.
 *
 * Kept out of Сегодня, where it competed with the one lesson that screen exists for,
 * and kept here, where looking back is the whole point.
 */
function Abilities({ model }: { model: AppStore }) {
  const { earned, next } = model.abilities
  if (earned.length === 0 && next.length === 0) {
    return <EmptyNote>Появится, когда закроешь первый блок.</EmptyNote>
  }
  return (
    <div className="abilities">
      {earned.map((item) => <AbilityChip key={item} state="earned">{item}</AbilityChip>)}
      {next.map((item) => <AbilityChip key={item} state="next">{item}</AbilityChip>)}
    </div>
  )
}

/**
 * Speaking, reported only as far as the app can hear.
 *
 * The prototype's placeholder promised a breakdown by sound. Nothing in this app listens
 * to a voice, so that breakdown would be a promise it cannot keep; what it can say is
 * which phrases were said out loud and which of them you marked as not having come out.
 */
function Pronunciation({ model }: { model: AppStore }) {
  const { count, hard } = model.spoken
  if (count < SPOKEN_ENOUGH) {
    const left = SPOKEN_ENOUGH - count
    return (
      <EmptyNote>
        Здесь появятся фразы, которые даются тяжелее других. Нужно проговорить вслух
        хотя бы {SPOKEN_ENOUGH} — {count === 0 ? 'пока ни одной' : `пока ${count}, осталось ${left}`}.
      </EmptyNote>
    )
  }
  if (hard.length === 0) {
    return <EmptyNote>Проговорено {count}, и все вышли. Тут пока не за что зацепиться.</EmptyNote>
  }
  return (
    <ul className="spoken">
      {hard.map((phrase) => <li key={phrase} className="learn">{phrase}</li>)}
    </ul>
  )
}

/** Below this a list of "hard phrases" is noise rather than a finding. */
const SPOKEN_ENOUGH = 10

/**
 * Seven days of practice as seven bars, each with its own number above it.
 *
 * One series, so no legend — the heading names it, and the goal is spelled out in words
 * under the heading rather than drawn as a second thing to decode. A day that reached
 * the goal is ink; a day that fell short is the track colour, which is the same contrast
 * the rest of the app uses for "not yet".
 */
function WeekChart({ model }: { model: AppStore }) {
  const days = model.recentDays()
  const best = Math.max(...days.map((day) => day.minutes))
  const top = Math.max(model.dailyGoalMinutes, best, 1)
  const total = days.reduce((sum, day) => sum + day.minutes, 0)

  if (best === 0) {
    return <EmptyNote>За последнюю неделю занятий не записано. Первый же урок появится здесь столбиком.</EmptyNote>
  }

  return (
    <>
      <div className="chart">
        <div className="chart-values">
          {days.map((day) => (
            <span key={day.key}>{day.minutes > 0 ? day.minutes : ''}</span>
          ))}
        </div>
        <div className="chart-plot">
          {days.map((day) => (
            <div className="chart-col" key={day.key}>
              <div
                className={`chart-bar${day.goalReached ? ' reached' : ''}`}
                style={{ height: `${(day.minutes / top) * 100}%` }}
                role="img"
                aria-label={`${day.weekday}: ${day.minutes} ${plural(day.minutes, 'минута', 'минуты', 'минут')}`}
              />
            </div>
          ))}
        </div>
        <div className="chart-axis">
          {days.map((day) => (
            <span key={day.key} className={day.today ? 'today' : undefined}>{day.weekday.toUpperCase()}</span>
          ))}
        </div>
      </div>
      <p className="chart-line">{chartLine(total, days.filter((d) => d.goalReached).length)}</p>
    </>
  )
}

function chartLine(total: number, reached: number): string {
  const minutes = `${total} ${plural(total, 'минута', 'минуты', 'минут')} за неделю`
  if (reached === 0) return `${capitalise(minutes)}. Цель пока не взята ни в одном дне.`
  const days = `${spell(reached)} ${plural(reached, 'дне', 'днях', 'днях')}`
  return `${capitalise(minutes)}. Цель взята в ${days} из семи.`
}

const capitalise = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1)
