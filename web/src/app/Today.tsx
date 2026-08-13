import { useStore } from './App'
import { Header } from './Header'
import { plural, spell } from './plural'
import { Icon } from '../kit/Icons'
import { PrimaryButton, SecondaryButton, SectionTitle } from '../kit'
import type { AppStore } from './store'

/**
 * What to do right now — and nothing else.
 *
 * Laid out the way the prototype settled it: the two numbers that matter as pills, the
 * day named in a sentence, one lesson, whatever is due, and the week as seven squares.
 * No counts of exercises anywhere on it — a pile of 143 waiting items is what pushes a
 * person out of the app, and the pile is not what the next five minutes are about.
 */
export function Today() {
  const model = useStore()
  const next = model.recommendedLesson
  const place = model.nextPlace
  const streak = model.streak()

  return (
    <>
      <Header model={model} />
      <div className="scroll">
        {model.suggestedNextLevel && <LevelUp model={model} />}

        <div className="pills-row">
          <span className="pill-streak">
            <Icon name="flame" size={15} />
            <b>{streak}</b>
            <span>{plural(streak, 'день', 'дня', 'дней')}</span>
          </span>
          <span className="pill-goal">
            <Icon name="clock" size={15} />
            <b>{model.todayPracticeMinutes} / {model.dailyGoalMinutes} мин</b>
          </span>
        </div>

        <h1 className="day-title">Сегодня</h1>
        <p className="day-line">{dayLine(model)}</p>

        {next && (
          <button className="next-card" onClick={() => model.startLesson(next)}>
            <span className="next-head">
              <span className="next-play"><Icon name="play" size={24} /></span>
              <span className="next-body">
                <span className="next-kicker">Следующий урок · {next.estimatedMinutes} мин</span>
                <span className="next-title">{next.title}</span>
                {place && <span className="next-block">Блок {place.number} · {place.chapter}</span>}
              </span>
            </span>
            {place && (
              <>
                <span className="next-bar">
                  <span style={{ width: `${((place.position - 1) / place.total) * 100}%` }} />
                </span>
                <span className="next-in-block">Урок {place.position} из {place.total} в блоке</span>
              </>
            )}
          </button>
        )}

        {model.dueCount > 0 && (
          <button className="review-card" onClick={() => model.startReview()}>
            <span className="review-icon"><Icon name="repeat" size={21} /></span>
            <span className="review-body">
              <span className="review-title">Повторить пройденное</span>
              <span className="review-note">Пять минут, начиная с самых давних</span>
            </span>
            <span className="review-chevron"><Icon name="chevron" size={18} /></span>
          </button>
        )}

        <div className="gap-22" />
        <SectionTitle hint="День засчитан, если в нём есть хотя бы один урок">Эта неделя</SectionTitle>
        <Week model={model} />
        <p className="week-line">{weekLine(model)}</p>
      </div>
    </>
  )
}

/**
 * The week as seven squares: closed, today, and not yet.
 *
 * A finished day carries a tick, not just a colour, and today is a ring with a dot in
 * it — so the strip still reads with the colour taken away.
 */
function Week({ model }: { model: AppStore }) {
  return (
    <div className="week-strip">
      {model.recentDaysDone().map((day) => (
        <div className="week-day" key={day.key}>
          <span className={`week-label${day.today ? ' today' : ''}`}>{day.weekday}</span>
          <span
            className={`week-cell${day.done ? ' done' : day.today ? ' now' : ''}`}
            role="img"
            aria-label={`${day.weekday}: ${day.done ? 'занимался' : day.today ? 'сегодня' : 'пропуск'}`}
          >
            {day.done ? <Icon name="check" size={17} /> : day.today ? <span className="week-dot" /> : null}
          </span>
        </div>
      ))}
    </div>
  )
}

/** The sentence under the title: what today asks for, in words rather than counters. */
function dayLine(model: AppStore): string {
  if (model.dailyGoalReached) return 'Цель дня выполнена. Дальше — сколько захочешь.'
  const left = model.dailyGoalMinutes - model.todayPracticeMinutes
  const minutes = `${spell(left, true)} ${plural(left, 'минута', 'минуты', 'минут')}`
  return model.todayPracticeMinutes === 0
    ? `${capitalise(minutes)} до дневной цели — это один урок.`
    : `Осталось ${minutes} до дневной цели — это один урок.`
}

/** And under the week strip: how the week is going, and what a miss costs. */
function weekLine(model: AppStore): string {
  const days = model.recentDaysDone()
  const done = days.filter((day) => day.done).length
  if (done === 0) return 'Пока пусто. Один урок сегодня — и первый день закрыт.'
  const closed = `${spell(done)} ${plural(done, 'день закрыт', 'дня закрыты', 'дней закрыты')}`
  if (model.dailyGoalReached) return `${capitalise(closed)}, сегодня цель взята. Так и держи.`
  const left = model.dailyGoalMinutes - model.todayPracticeMinutes
  return `${capitalise(closed)}, сегодня осталось ${spell(left, true)} ${plural(left, 'минута', 'минуты', 'минут')}. Пропуск обнулит серию — один урок её спасает.`
}

const capitalise = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1)

function LevelUp({ model }: { model: AppStore }) {
  const next = model.suggestedNextLevel!
  return (
    <div className="levelup">
      <div className="levelup-title">Уровень {model.selectedLevel} пройден</div>
      <p className="levelup-note">Дальше — {next}. Пройденное останется отмеченным.</p>
      <div className="stack">
        <PrimaryButton tone="mint" onClick={() => model.advanceToSuggestedLevel()}>Перейти на {next}</PrimaryButton>
        <SecondaryButton onClick={() => model.dismissLevelUp()}>Позже</SecondaryButton>
      </div>
    </div>
  )
}
