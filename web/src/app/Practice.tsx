import { useStore } from './App'
import { Header } from './Header'
import { Icon } from '../kit/Icons'
import { EmptyNote, SectionTitle } from '../kit'
import type { ModeID } from '../core'
import type { IconName } from '../kit/Icons'

const MODE_ICON: Record<ModeID, IconName> = {
  shadowing: 'audio', listening: 'audio', dialogue: 'dialogue', verbforms: 'order',
  vocabulary: 'cards', mixed: 'target', flashcard: 'dialogue', translate: 'write',
  word_order: 'order', multiple_choice: 'choice',
}
const MODE_COLOR: Record<ModeID, string> = {
  shadowing: 'var(--coral)', listening: 'var(--blue)', dialogue: 'var(--blue)',
  verbforms: 'var(--amber)', vocabulary: 'var(--violet)', mixed: 'var(--violet)',
  flashcard: 'var(--ink)', translate: 'var(--amber)', word_order: 'var(--mint)',
  multiple_choice: '#c17ce0',
}

/**
 * Drilling, and the places worth drilling first.
 *
 * The counts are gone from the rows on purpose. "Порядок слов · 210" reads as a debt,
 * and a debt is what makes a person close the app. Закрытый режим тоже не показывает
 * нуль: он говорит, чем открывается, — и это решает ядро (`core/modes.ts`), а не вёрстка,
 * потому что правило одно на все режимы, а экранов у него будет больше одного.
 */
export function Practice() {
  const model = useStore()
  const weak = model.weakTopics

  const start = (id: ModeID) => {
    if (id === 'shadowing') return model.startShadowing()
    if (id === 'listening') return model.startListening()
    if (id === 'verbforms') return model.startVerbForms()
    if (id === 'vocabulary') return model.startVocabulary()
    if (id === 'dialogue') return
    model.startPractice(id)
  }

  return (
    <>
      <Header model={model} />
      <div className="scroll">
        <div className="kind-card">
          {model.practiceModes.map((mode) => (
            <button
              key={mode.id}
              className="kind-row"
              disabled={!mode.ready}
              onClick={() => start(mode.id)}
            >
              <span className="kind-tile" style={{ background: MODE_COLOR[mode.id] }}>
                <Icon name={MODE_ICON[mode.id]} size={20} />
              </span>
              <span className="kind-body">
                <span className="kind-name">{mode.title}</span>
                {/* Открыт — что это за режим; закрыт — чем открывается. Строк в обоих
                    случаях две, поэтому высота строки не скачет. */}
                <span className="kind-note">{mode.note}</span>
              </span>
              {mode.ready && <span className="kind-chevron"><Icon name="chevron" size={17} /></span>}
            </button>
          ))}
        </div>

        {!model.practiceIsAvailable && (
          <EmptyNote>
            Тренировки собираются из пройденного: пройди первый урок — и режимы откроются.
          </EmptyNote>
        )}

        {weak.length > 0 && (
          <>
            <div className="gap-22" />
            <SectionTitle hint="Начни отсюда — здесь ошибок больше всего">Слабые темы</SectionTitle>
            {weak.slice(0, 3).map((item) => (
              <button key={item.topic.id} className="topic-card" onClick={() => model.startTopicPractice(item.topic.id)}>
                <span className="topic-head">
                  <span className="topic-title">{item.topic.title}</span>
                  <span className="topic-score" style={{ color: scoreColour(item.accuracy) }}>
                    {Math.round(item.accuracy * 100)}%
                  </span>
                </span>
                <span className="topic-note">{item.topic.summary}</span>
                <span className="topic-foot">
                  <span>{item.correct} из {item.attempts} верно · {item.topic.level}</span>
                  <Icon name="play" size={13} />
                </span>
              </button>
            ))}
          </>
        )}

        {/* Отдельная группа изучения: не уровень курса, а охват частотного ядра. */}
        {model.hasWordlist && (
          <button className="link-button" onClick={() => model.setScreen('wordlist')}>
            <span>3000 частых слов: знаю {model.wordlistCount.known} из {model.wordlistCount.total}</span>
            <span aria-hidden="true">›</span>
          </button>
        )}

        {model.hasTheory && (
          <button className="link-button" onClick={() => model.setScreen('theory')}>
            <span>Разборы тем: правила, формы, ошибки</span>
            <span aria-hidden="true">›</span>
          </button>
        )}

        <button className="link-button" onClick={() => model.setScreen('topics')}>
          <span>Все темы уровня и мои проценты</span>
          <span aria-hidden="true">›</span>
        </button>
      </div>
    </>
  )
}

/** Red under half, amber under four fifths, green above — the prototype's three steps. */
function scoreColour(accuracy: number): string {
  if (accuracy < 0.6) return 'var(--coral)'
  if (accuracy < 0.8) return 'var(--amber)'
  return 'var(--mint)'
}
