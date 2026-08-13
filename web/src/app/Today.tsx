import { useStore } from './App'
import { Header } from './Header'
import { plural } from './plural'
import { ActionCard, Meter, PrimaryButton, SecondaryButton, SectionTitle } from '../kit'
import type { AppStore } from './store'

/**
 * What to do right now — and nothing else.
 *
 * The map used to open with this and then keep going for another three screens. Pulling
 * it out is the point of the tabs: the first thing after launch is one lesson, whatever
 * is due, and the weak spots — a screen that can be finished.
 */
export function Today() {
  const model = useStore()
  const next = model.recommendedLesson

  return (
    <>
      <Header model={model} title="Сегодня" />
      <div className="scroll">
        {model.suggestedNextLevel && <LevelUp model={model} />}

        <SectionTitle>Ближайшее</SectionTitle>
        {next && (
          <ActionCard
            icon="▶" color="var(--amber)" kicker="СЛЕДУЮЩИЙ УРОК"
            title={next.title}
            subtitle={[model.chapterTitle(next), `${next.estimatedMinutes} мин`].filter(Boolean).join(' · ')}
            onClick={() => model.startLesson(next)}
          />
        )}
        {model.dueCount > 0 && (
          <ActionCard
            icon="↻" color="var(--blue)" kicker="ПОВТОРЕНИЕ"
            title={`${model.dueCount} ${plural(model.dueCount, 'упражнение', 'упражнения', 'упражнений')} ${plural(model.dueCount, 'ждёт', 'ждут', 'ждут')}`}
            subtitle={model.dueCount > model.reviewSessionSize
              ? `За раз — ${model.reviewSessionSize}, начиная с самых давних`
              : 'Пройденное возвращается, пока не осядет'}
            onClick={() => model.startReview()}
          />
        )}

        <LevelBar model={model} />

        {model.weakTopics.length > 0 && (
          <>
            <SectionTitle hint="Считается по твоим ответам, а не по пройденным урокам">Что проседает</SectionTitle>
            {model.weakTopics.slice(0, 3).map((item) => (
              <ActionCard
                key={item.topic.id}
                icon="◎" color="var(--coral)"
                kicker={`${Math.round(item.accuracy * 100)}% ВЕРНЫХ`}
                title={item.topic.title}
                subtitle={`${item.correct} из ${item.attempts} · нажми, чтобы потренировать`}
                onClick={() => model.startTopicPractice(item.topic.id)}
              />
            ))}
          </>
        )}
      </div>
    </>
  )
}

/**
 * The level as one bar.
 *
 * This is what stands where the chips of abilities used to. A chip could only speak for
 * the unit that earned it, and the row of them grew until it said nothing; a bar says
 * how much of the level is behind you and how much is not, in the same words every time.
 */
export function LevelBar({ model }: { model: AppStore }) {
  const { done, total, value } = model.levelProgress
  if (total === 0) return null

  return (
    <>
      <SectionTitle>Уровень {model.selectedLevel}</SectionTitle>
      <div className="level-bar">
        <Meter
          title={`${model.currentLanguage.title} ${model.selectedLevel}`}
          value={value}
          caption={`пройдено ${done} из ${total} ${plural(total, 'блока', 'блоков', 'блоков')}`}
          color="var(--violet)"
        />
      </div>
    </>
  )
}

function LevelUp({ model }: { model: AppStore }) {
  const next = model.suggestedNextLevel!
  return (
    <div className="action" style={{ display: 'block', background: 'rgba(84, 199, 151, 0.13)', borderColor: 'rgba(84, 199, 151, 0.4)', boxShadow: 'none' }}>
      <div style={{ fontWeight: 700 }}>Уровень {model.selectedLevel} пройден</div>
      <p className="action-subtitle" style={{ whiteSpace: 'normal', marginTop: 4 }}>
        Дальше — {next}. Пройденное останется отмеченным.
      </p>
      <div className="stack" style={{ marginTop: 12 }}>
        <PrimaryButton tone="mint" onClick={() => model.advanceToSuggestedLevel()}>Перейти на {next}</PrimaryButton>
        <SecondaryButton onClick={() => model.dismissLevelUp()}>Позже</SecondaryButton>
      </div>
    </div>
  )
}
