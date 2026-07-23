import { useStore } from './App'
import type { AppStore } from './store'
import type { Chapter, Lesson } from '../core'

type LessonState = 'completed' | 'current' | 'available' | 'locked'

export function MapScreen() {
  const model = useStore()
  const chapters = model.selectedCourse?.chapters ?? []
  const next = model.recommendedLesson

  return (
    <>
      <Header model={model} />
      <div className="scroll">
        {next && (
          <ActionCard
            icon="▶" color="var(--amber)" kicker="ПРОДОЛЖИТЬ"
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
        {model.practiceIsAvailable && (
          <ActionCard
            icon="⚡" color="var(--violet)" kicker="ТРЕНИРОВКА"
            title="10 упражнений вперемешку"
            subtitle="Не кончается: сначала сложное, потом новое"
            onClick={() => model.startPractice()}
          />
        )}

        {model.suggestedNextLevel && <LevelUp model={model} />}

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
          <div className="brand-kicker">ENGLISH COACH</div>
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
