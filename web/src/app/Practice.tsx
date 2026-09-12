import { useStore } from './App'
import { Header } from './Header'
import { PRACTICE_KINDS } from '../core'
import { Icon } from '../kit/Icons'
import { EmptyNote, SectionTitle } from '../kit'
import type { IconName } from '../kit/Icons'

const KIND_ICON: Record<string, IconName> = {
  mixed: 'target', flashcard: 'dialogue', translate: 'write', word_order: 'order',
  multiple_choice: 'choice',
}
const KIND_COLOR: Record<string, string> = {
  mixed: 'var(--violet)', flashcard: 'var(--ink)', translate: 'var(--amber)',
  word_order: 'var(--mint)', multiple_choice: '#c17ce0',
}

/**
 * Drilling, and the places worth drilling first.
 *
 * The counts are gone from the rows on purpose. "Порядок слов · 210" reads as a debt,
 * and a debt is what makes a person close the app; a kind that has nothing in it yet
 * says "пока нечего" instead of showing a zero.
 */
export function Practice() {
  const model = useStore()
  const weak = model.weakTopics

  return (
    <>
      <Header model={model} />
      <div className="scroll">
        <div className="kind-card">
          {/* Speaking comes first: it is the only exercise that gets the mouth moving. */}
          <KindRow
            icon="audio" color="var(--coral)"
            title="Вслух за диктором"
            note="Слушай, повторяй, сравнивай себя с эталоном"
            ready={model.shadowingCount > 0}
            onClick={() => model.startShadowing()}
          />
          {/* And listening second: it is the only one where the English is not on screen. */}
          <KindRow
            icon="audio" color="var(--blue)"
            title="Аудирование"
            note="Слушай и записывай, текста на экране нет"
            ready={model.listeningCount > 0}
            onClick={() => model.startListening()}
          />
          {/* Dialogue drills are not built yet: the pool deliberately excludes dialogues,
              because hearing an exchange again is exposure rather than practice. The row
              stands anyway, dimmed and saying so — the same way an empty kind does — so
              the list is the whole map of what practice will be, not just what it is. */}
          <KindRow
            icon="dialogue" color="var(--blue)"
            title="Диалог"
            note="Сначала целиком, потом по репликам"
            ready={false}
            onClick={() => {}}
          />
          {/* Формы глагола — единственный вид, где спрашивают не смысл, а память на форму. */}
          <KindRow
            icon="order" color="var(--amber)"
            title="Формы глагола"
            note="Показана первая — введи вторую и третью"
            ready={model.verbFormsCount > 0}
            onClick={() => model.startVerbForms()}
          />
          {/* Слова впереди остальных видов: «хочу поучить слова» — самый частый запрос к
              тренажёру, и до этого режима приложение отвечало на него куском реплики. */}
          <KindRow
            icon="cards" color="var(--violet)"
            title="Слова"
            note="Слово, перевод и пример — без обрывков фраз"
            ready={model.vocabularyCount > 0}
            onClick={() => model.startVocabulary()}
          />
          {PRACTICE_KINDS.map((kind) => (
            <KindRow
              key={kind.id}
              icon={KIND_ICON[kind.id] ?? 'target'}
              color={KIND_COLOR[kind.id] ?? 'var(--violet)'}
              title={kind.title}
              note={kind.subtitle}
              ready={(model.practiceCounts[kind.id] ?? 0) > 0}
              onClick={() => model.startPractice(kind.id)}
            />
          ))}
        </div>

        {!model.practiceIsAvailable ? (
          <EmptyNote>
            Тренировки собираются из пройденного. Пройди первый урок — и здесь появятся
            карточки, перевод, аудирование и речь вслух.
          </EmptyNote>
        ) : model.productionIsLocked && (
          /* Три серых строки подряд выглядят как пустое приложение, если не сказать, от
             чего они открываются. Сказать честно: производить можно то, что объяснили. */
          <EmptyNote>
            Перевод, сборка и тесты открываются по пройденному: просить сказать самому по
            теме, которую ещё не объясняли, — это стена, а не упражнение. Пройди урок или
            разбери тему — и они появятся.
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
            3000 частых слов: знаю {model.wordlistCount.known} из {model.wordlistCount.total} ›
          </button>
        )}

        {model.hasTheory && (
          <button className="link-button" onClick={() => model.setScreen('theory')}>
            Разборы тем: правила, формы, ошибки ›
          </button>
        )}

        <button className="link-button" onClick={() => model.setScreen('topics')}>
          Все темы уровня и мои проценты ›
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

function KindRow(
  { icon, color, title, note, ready, onClick }:
  { icon: IconName; color: string; title: string; note: string; ready: boolean; onClick: () => void },
) {
  return (
    <button className="kind-row" disabled={!ready} onClick={onClick}>
      <span className="kind-tile" style={{ background: color }}><Icon name={icon} size={20} /></span>
      <span className="kind-body">
        <span className="kind-name">{title}</span>
        <span className="kind-note">{note}</span>
      </span>
      {ready
        ? <span className="kind-chevron"><Icon name="chevron" size={17} /></span>
        : <span className="kind-empty">пока нечего</span>}
    </button>
  )
}
