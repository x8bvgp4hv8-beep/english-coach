import { useStore } from './App'
import { ENOUGH_ATTEMPTS } from '../core'
import type { TopicProgress } from '../core'

/**
 * Every grammar topic of the level, with the learner's record on it and a way straight
 * into practising the weak one. The data was already there — attempts carry an exercise
 * id, exercises carry topics — it just had nowhere to be seen.
 */
export function Topics() {
  const model = useStore()
  const all = model.topicProgress
  const weak = model.weakTopics
  // By id, not by reference: the two engine calls build separate objects for one topic.
  const weakIDs = new Set(weak.map((item) => item.topic.id))
  const untouched = all.filter((item) => item.attempts === 0)
  // One or two answers are not a verdict: a topic with 0 of 1 is not "holding up".
  const early = all.filter((item) => item.attempts > 0 && item.attempts < ENOUGH_ATTEMPTS)
  const known = all.filter((item) => item.attempts >= ENOUGH_ATTEMPTS && !weakIDs.has(item.topic.id))

  return (
    <>
      <header className="header">
        <div className="header-top">
          <button className="icon-button" onClick={() => model.setScreen('map')} aria-label="Назад">‹</button>
          <h1 className="brand-title" style={{ flex: 1, textAlign: 'center' }}>Грамматика</h1>
          <span style={{ width: 48 }} />
        </div>
      </header>

      <div className="scroll">
        {weak.length > 0 && (
          <>
            <div className="section-title" style={{ marginTop: 18 }}>
              <h2>Проседает</h2>
              <p>Считается по твоим ответам: тема попадает сюда после {ENOUGH_ATTEMPTS} попыток.</p>
            </div>
            {weak.map((item) => <TopicRow key={item.topic.id} item={item} />)}
          </>
        )}

        {known.length > 0 && (
          <>
            <div className="section-title"><h2>Держится</h2></div>
            {known.map((item) => <TopicRow key={item.topic.id} item={item} />)}
          </>
        )}

        {early.length > 0 && (
          <>
            <div className="section-title">
              <h2>Мало попыток</h2>
              <p>Пара ответов ещё ничего не доказывает, вывода по ним нет.</p>
            </div>
            {early.map((item) => <TopicRow key={item.topic.id} item={item} />)}
          </>
        )}

        {untouched.length > 0 && (
          <>
            <div className="section-title">
              <h2>Ещё не трогал</h2>
              <p>{untouched.length} тем ждут первого захода.</p>
            </div>
            {untouched.map((item) => <TopicRow key={item.topic.id} item={item} />)}
          </>
        )}
      </div>
    </>
  )
}

function TopicRow({ item }: { item: TopicProgress }) {
  const model = useStore()
  const seen = item.attempts > 0
  const percent = Math.round(item.accuracy * 100)
  const tone = !seen ? 'var(--ink-soft)' : percent < 60 ? 'var(--coral)' : percent < 75 ? 'var(--amber)' : 'var(--mint)'
  // A topic the course has not reached yet has nothing to drill: the row states that
  // instead of being a button that does nothing when tapped.
  const locked = item.exercises === 0

  return (
    <button className="topic" disabled={locked} onClick={() => model.startTopicPractice(item.topic.id)}>
      <span className="topic-body">
        <span className="topic-head">
          <span className="topic-title">{item.topic.title}</span>
          <span className="topic-score" style={{ color: tone }}>
            {seen ? `${percent}%` : locked ? 'дальше' : `${item.exercises} упр.`}
          </span>
        </span>
        <span className="topic-summary">{item.topic.summary}</span>
        <span className="bar topic-bar">
          <span style={{ width: `${seen ? Math.max(4, percent) : 0}%`, background: tone }} />
        </span>
        {seen && <span className="topic-meta">{item.correct} из {item.attempts} верно · {item.topic.level}</span>}
        {!seen && locked && <span className="topic-meta">откроется, когда до неё дойдут уроки</span>}
      </span>
      <span className="topic-go">{locked ? '·' : '▶'}</span>
    </button>
  )
}
