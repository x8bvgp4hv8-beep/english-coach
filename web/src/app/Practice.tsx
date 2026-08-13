import { useStore } from './App'
import { Header } from './Header'
import { PRACTICE_KINDS } from '../core'
import { EmptyNote, KindButton, KindList, SectionTitle } from '../kit'

const KIND_ICON: Record<string, string> = {
  mixed: '⚡', flashcard: '🗂', translate: '✍️', word_order: '🧩', multiple_choice: '☑️',
}
const KIND_COLOR: Record<string, string> = {
  mixed: 'var(--violet)', flashcard: 'var(--blue)', translate: 'var(--amber)',
  word_order: 'var(--mint)', multiple_choice: '#c17ce0',
}

/**
 * Drilling, separated from the course by a tab of its own.
 *
 * Nothing here teaches anything new: every kind is built out of what the learner has
 * already been through, which is why the whole tab says so plainly while the course is
 * still untouched rather than showing seven rows of zeros.
 */
export function Practice() {
  const model = useStore()

  return (
    <>
      <Header model={model} title="Тренировка" />
      <div className="scroll">
        <SectionTitle hint={model.practiceIsAvailable ? 'Можно тренировать отдельно, сколько угодно раз' : undefined}>
          Виды заданий
        </SectionTitle>
        {!model.practiceIsAvailable ? (
          <EmptyNote>
            Тренировки собираются из пройденного. Пройди первый урок — и здесь появятся
            карточки, перевод, аудирование и речь вслух.
          </EmptyNote>
        ) : (
          <KindList>
            {/* Speaking comes first: it is the only exercise that gets the mouth moving. */}
            <KindButton
              icon="🎙" color="var(--coral)"
              title="Вслух за диктором"
              subtitle="Слушай, повторяй, сравнивай себя с эталоном"
              count={model.shadowingCount}
              disabled={model.shadowingCount === 0}
              onClick={() => model.startShadowing()}
            />
            {/* And listening second: it is the only one where the English is not on screen. */}
            <KindButton
              icon="👂" color="var(--blue)"
              title="На слух"
              subtitle="Фразу говорят, текста нет — запиши, что услышал"
              count={model.listeningCount}
              disabled={model.listeningCount === 0}
              onClick={() => model.startListening()}
            />
            {PRACTICE_KINDS.map((kind) => (
              <KindButton
                key={kind.id}
                icon={KIND_ICON[kind.id]}
                color={KIND_COLOR[kind.id]}
                title={kind.title}
                subtitle={kind.subtitle}
                count={model.practiceCounts[kind.id] ?? 0}
                disabled={(model.practiceCounts[kind.id] ?? 0) === 0}
                onClick={() => model.startPractice(kind.id)}
              />
            ))}
          </KindList>
        )}

        <button className="link-button" onClick={() => model.setScreen('topics')} style={{ marginTop: 14 }}>
          Все темы уровня и мои проценты ›
        </button>
      </div>
    </>
  )
}
