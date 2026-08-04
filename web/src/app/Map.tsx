import type { ReactNode } from 'react'

import { useStore } from './App'
import { PRACTICE_KINDS } from '../core'
import type { AppStore } from './store'
import type { Chapter, Lesson } from '../core'

type LessonState = 'completed' | 'current' | 'available' | 'locked'

const KIND_ICON: Record<string, string> = {
  mixed: '⚡', flashcard: '🗂', translate: '✍️', word_order: '🧩', multiple_choice: '☑️',
}
const KIND_COLOR: Record<string, string> = {
  mixed: 'var(--violet)', flashcard: 'var(--blue)', translate: 'var(--amber)',
  word_order: 'var(--mint)', multiple_choice: '#c17ce0',
}

/** Named groups, so the screen answers "что тут вообще можно делать". */
function SectionTitle({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="section-title">
      <h2>{children}</h2>
      {hint && <p>{hint}</p>}
    </div>
  )
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
            subtitle="Ошибки возвращаются, пока не закрепятся"
            onClick={() => model.startReview()}
          />
        )}

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

        <SectionTitle hint="Можно тренировать отдельно, сколько угодно раз">Виды заданий</SectionTitle>
        <div className="kinds">
          {/* Speaking comes first: it is the only exercise that gets the mouth moving. */}
          <button className="kind" disabled={model.shadowingCount === 0} onClick={() => model.startShadowing()}>
            <span className="kind-icon" style={{ background: 'var(--coral)' }}>🎙</span>
            <span className="kind-body">
              <span className="kind-title">Вслух за диктором</span>
              <span className="kind-subtitle">Слушай, повторяй, сравнивай себя с эталоном</span>
            </span>
            <span className="kind-count">{model.shadowingCount}</span>
          </button>
          {/* And listening second: it is the only one where the English is not on screen. */}
          <button className="kind" disabled={model.listeningCount === 0} onClick={() => model.startListening()}>
            <span className="kind-icon" style={{ background: 'var(--blue)' }}>👂</span>
            <span className="kind-body">
              <span className="kind-title">На слух</span>
              <span className="kind-subtitle">Фразу говорят, текста нет — запиши, что услышал</span>
            </span>
            <span className="kind-count">{model.listeningCount}</span>
          </button>
          {PRACTICE_KINDS.map((kind) => (
            <button
              key={kind.id}
              className="kind"
              disabled={(model.practiceCounts[kind.id] ?? 0) === 0}
              onClick={() => model.startPractice(kind.id)}
            >
              <span className="kind-icon" style={{ background: KIND_COLOR[kind.id] }}>{KIND_ICON[kind.id]}</span>
              <span className="kind-body">
                <span className="kind-title">{kind.title}</span>
                <span className="kind-subtitle">{kind.subtitle}</span>
              </span>
              <span className="kind-count">{model.practiceCounts[kind.id] ?? 0}</span>
            </button>
          ))}
        </div>

        <button className="link-button" onClick={() => model.setScreen('topics')} style={{ marginTop: 14 }}>
          Вся грамматика уровня и мои проценты ›
        </button>

        <SectionTitle hint="Уроки идут по порядку: правило, новые фразы, упражнения">
          Маршрут {model.selectedLevel}
        </SectionTitle>
        {chapters.map((chapter, index) => (
          <ChapterSection key={chapter.id} model={model} chapter={chapter} number={index + 1} />
        ))}
      </div>
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
          title={`Уровень ${model.selectedLevel}`}
          value={model.currentLevelProgress}
          caption={`${Math.round(model.currentLevelProgress * 100)}%`}
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

function Meter({ title, value, caption, color }: { title: string; value: number; caption: string; color: string }) {
  return (
    <div className="meter">
      <div className="meter-row">
        <span>{title}</span>
        <span className="meter-value" style={{ color }}>{caption}</span>
      </div>
      <div className="bar"><span style={{ width: `${Math.min(1, value) * 100}%`, background: color }} /></div>
    </div>
  )
}

function ActionCard({ icon, color, kicker, title, subtitle, onClick }: {
  icon: string; color: string; kicker: string; title: string; subtitle: string; onClick: () => void
}) {
  return (
    <button className="action" onClick={onClick} style={{ borderColor: `color-mix(in srgb, ${color} 22%, transparent)` }}>
      <span className="action-icon" style={{ background: color }}>{icon}</span>
      <span className="action-body">
        <span className="action-kicker" style={{ color }}>{kicker}</span>
        <div className="action-title">{title}</div>
        <div className="action-subtitle">{subtitle}</div>
      </span>
      <span className="action-chevron" style={{ color }}>›</span>
    </button>
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
        <button className="primary mint" onClick={() => model.advanceToSuggestedLevel()}>Перейти на {next}</button>
        <button className="secondary" onClick={() => model.dismissLevelUp()}>Позже</button>
      </div>
    </div>
  )
}

function ChapterSection({ model, chapter, number }: { model: AppStore; chapter: Chapter; number: number }) {
  const done = chapter.lessons.filter((lesson) => model.completed.has(lesson.id)).length
  return (
    <section className="chapter">
      <div className="chapter-head">
        <span className="chapter-number">ГЛАВА {number}</span>
        <h2 className="chapter-title">{chapter.title}</h2>
        <span className={`chapter-count${done === chapter.lessons.length ? ' done' : ''}`}>{done} / {chapter.lessons.length}</span>
      </div>
      {chapter.subtitle && <p className="chapter-subtitle">{chapter.subtitle}</p>}
      <div className="chapter-rule" />
      {chapter.lessons.map((lesson, index) => (
        <LessonRow
          key={lesson.id}
          model={model}
          lesson={lesson}
          first={index === 0}
          last={index === chapter.lessons.length - 1}
        />
      ))}
    </section>
  )
}

function LessonRow({ model, lesson, first, last }: { model: AppStore; lesson: Lesson; first: boolean; last: boolean }) {
  const state = lessonState(model, lesson)
  const locked = state === 'locked'
  const colors: Record<LessonState, string> = {
    completed: 'var(--violet)', current: 'var(--amber)', available: 'var(--blue)', locked: 'rgba(31,28,64,0.28)',
  }
  const icons: Record<LessonState, string> = { completed: '✓', current: '▶', available: '📖', locked: '🔒' }
  const status: Record<LessonState, string> = {
    completed: 'пройден', current: 'продолжить', available: 'доступен', locked: 'откроется после предыдущего',
  }

  return (
    <button
      className="lesson"
      disabled={locked}
      onClick={() => model.startLesson(lesson)}
    >
      <span className={`rail${first ? ' first' : ''}${last ? ' last' : ''}${state === 'completed' ? ' done' : ''}`}>
        <span className={`node${state === 'current' ? ' current' : ''}`} style={{ background: colors[state] }}>
          {icons[state]}
        </span>
      </span>
      <span className="lesson-body">
        <div className="lesson-title">{lesson.title}</div>
        <div className="lesson-meta">{lesson.estimatedMinutes} мин · {status[state]}</div>
      </span>
      {state === 'current' && <span className="badge-now">СЕЙЧАС</span>}
    </button>
  )
}

function lessonState(model: AppStore, lesson: Lesson): LessonState {
  if (model.completed.has(lesson.id)) return 'completed'
  if (model.recommendedLesson?.id === lesson.id) return 'current'
  return model.lessonIsUnlocked(lesson) ? 'available' : 'locked'
}

function plural(count: number, one: string, few: string, many: string): string {
  const mod100 = count % 100
  const mod10 = count % 10
  if (mod100 >= 11 && mod100 <= 14) return many
  if (mod10 === 1) return one
  if (mod10 >= 2 && mod10 <= 4) return few
  return many
}
