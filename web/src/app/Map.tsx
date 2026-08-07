import { useState } from 'react'

import { useStore } from './App'
import { plural } from './plural'
import { PRACTICE_KINDS } from '../core'
import {
  AbilityChip, ActionCard, ChapterSection, EmptyNote, KindButton, KindList, LessonRow,
  Meter, PrimaryButton, SecondaryButton, SectionTitle,
} from '../kit'
import type { LessonState } from '../kit'
import type { AppStore } from './store'
import type { Chapter, Lesson } from '../core'

const KIND_ICON: Record<string, string> = {
  mixed: '⚡', flashcard: '🗂', translate: '✍️', word_order: '🧩', multiple_choice: '☑️',
}
const KIND_COLOR: Record<string, string> = {
  mixed: 'var(--violet)', flashcard: 'var(--blue)', translate: 'var(--amber)',
  word_order: 'var(--mint)', multiple_choice: '#c17ce0',
}

export function MapScreen() {
  const model = useStore()
  const chapters = model.selectedCourse?.chapters ?? []
  const next = model.recommendedLesson

  return (
    <>
      <Header model={model} />
      <div className="scroll">
        {model.suggestedNextLevel && <LevelUp model={model} />}

        <SectionTitle>Сегодня</SectionTitle>
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

        <Abilities model={model} />

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

        <SectionTitle hint={model.practiceIsAvailable ? 'Можно тренировать отдельно, сколько угодно раз' : undefined}>
          Виды заданий
        </SectionTitle>
        {/* Nothing has been taught yet, so there is nothing to drill — say so instead of
            showing seven disabled rows of zeros. */}
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

        <SectionTitle hint="Каждый урок: послушай — новые слова — правило — узнай — скажи сам">
          Маршрут {model.selectedLevel}
        </SectionTitle>
        {chapters.map((chapter, index) => (
          <ChapterBlock key={chapter.id} model={model} chapter={chapter} number={index + 1} />
        ))}
      </div>
    </>
  )
}

/**
 * Progress as ability, not as a percentage.
 *
 * "Уровень A1 — 9%" says nothing a learner can act on. This says what they can already
 * say out loud, and what the unit they are inside will add to that list.
 */
function Abilities({ model }: { model: AppStore }) {
  const { earned, next } = model.abilities
  if (earned.length === 0 && next.length === 0) return null

  return (
    <>
      <SectionTitle hint={earned.length === 0 ? 'Появится, когда закроешь первый блок' : undefined}>
        Что ты умеешь
      </SectionTitle>
      <div className="abilities">
        {earned.map((item) => <AbilityChip key={item} state="earned">{item}</AbilityChip>)}
        {next.map((item) => <AbilityChip key={item} state="next">{item}</AbilityChip>)}
      </div>
      {next.length > 0 && <p className="abilities-note">Серым — то, чему учит блок, который ты сейчас проходишь.</p>}
    </>
  )
}

function Header({ model }: { model: AppStore }) {
  return (
    <header className="header">
      <div className="header-top">
        <div>
          {/* The language is the first thing on screen and one tap from being changed. */}
          <button className="lang-chip" onClick={() => model.openLanguages()}>
            <span className="lang-chip-code">{model.currentLanguage.short}</span>
            {model.currentLanguage.title}
            <span className="lang-chip-caret">⌄</span>
          </button>
          <h1 className="brand-title">Твой маршрут</h1>
        </div>
        <div className="header-stats">
          <span className="stat" title="дней подряд">🔥 {model.streak()}</span>
          <span className="stat" title="очков всего">✦ {model.totalPoints}</span>
          <button className="level-chip" onClick={() => model.setScreen('settings')}>{model.selectedLevel}</button>
          <button className="icon-button" onClick={() => model.setScreen('settings')} aria-label="Настройки">⚙︎</button>
        </div>
      </div>
      <div className="meters">
        <Meter
          title={model.unitProgress.title}
          value={model.unitProgress.value}
          caption={model.unitProgress.caption}
          color="var(--violet)"
        />
        <Meter
          title="Цель дня"
          value={model.dailyGoalProgress}
          caption={model.dailyGoalReached ? 'выполнена' : `${model.todayPracticeMinutes} / ${model.dailyGoalMinutes} мин`}
          color={model.dailyGoalReached ? 'var(--mint)' : 'var(--amber)'}
        />
      </div>
    </header>
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

/** Open follows the learner by default; a tap overrides it until they tap again. */
function ChapterBlock({ model, chapter, number }: { model: AppStore; chapter: Chapter; number: number }) {
  const done = chapter.lessons.filter((lesson) => model.completed.has(lesson.id)).length
  const isCurrent = chapter.lessons.some((lesson) => model.recommendedLesson?.id === lesson.id)
  const [override, setOverride] = useState<boolean | null>(null)
  const open = override ?? isCurrent

  return (
    <ChapterSection
      number={number}
      title={chapter.title}
      subtitle={chapter.subtitle}
      canDo={chapter.canDo}
      done={done}
      total={chapter.lessons.length}
      open={open}
      onToggle={() => setOverride(!open)}
    >
      {chapter.lessons.map((lesson, index) => (
        <LessonRow
          key={lesson.id}
          title={lesson.title}
          minutes={lesson.estimatedMinutes}
          state={lessonState(model, lesson)}
          checkpoint={lesson.kind === 'checkpoint'}
          first={index === 0}
          last={index === chapter.lessons.length - 1}
          onStart={() => model.startLesson(lesson)}
        />
      ))}
    </ChapterSection>
  )
}

function lessonState(model: AppStore, lesson: Lesson): LessonState {
  if (model.completed.has(lesson.id)) return 'completed'
  if (model.recommendedLesson?.id === lesson.id) return 'current'
  return model.lessonIsUnlocked(lesson) ? 'available' : 'locked'
}
