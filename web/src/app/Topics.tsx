import { useStore } from './App'
import { ENOUGH_ATTEMPTS } from '../core'
import { SectionTitle, TopicRow } from '../kit'
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

  const row = (item: TopicProgress) => (
    <TopicRow
      key={item.topic.id}
      title={item.topic.title}
      summary={item.topic.summary}
      level={item.topic.level}
      attempts={item.attempts}
      correct={item.correct}
      accuracy={item.accuracy}
      exercises={item.exercises}
      onClick={() => model.startTopicPractice(item.topic.id)}
    />
  )

  return (
    <>
      <header className="header">
        <div className="header-top">
          <button className="icon-button" onClick={() => model.setScreen('map')} aria-label="Назад">‹</button>
          <h1 className="brand-title" style={{ flex: 1, textAlign: 'center' }}>Темы</h1>
          <span style={{ width: 48 }} />
        </div>
      </header>

      <div className="scroll">
        {weak.length > 0 && (
          <>
            <SectionTitle hint={`Считается по твоим ответам: тема попадает сюда после ${ENOUGH_ATTEMPTS} попыток.`}>
              Проседает
            </SectionTitle>
            {weak.map(row)}
          </>
        )}

        {known.length > 0 && (
          <>
            <SectionTitle>Держится</SectionTitle>
            {known.map(row)}
          </>
        )}

        {early.length > 0 && (
          <>
            <SectionTitle hint="Пара ответов ещё ничего не доказывает, вывода по ним нет.">
              Мало попыток
            </SectionTitle>
            {early.map(row)}
          </>
        )}

        {untouched.length > 0 && (
          <>
            <SectionTitle hint={`${untouched.length} тем ждут первого захода.`}>
              Ещё не трогал
            </SectionTitle>
            {untouched.map(row)}
          </>
        )}
      </div>
    </>
  )
}
