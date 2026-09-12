import { useStore } from './App'
import { plural } from './plural'
import { Icon } from '../kit/Icons'
import { EmptyNote, PrimaryButton, SecondaryButton, SectionTitle } from '../kit'
import type { StudyPlan, TheorySection, TheoryTopic } from '../core'
import type { AppStore } from './store'

/**
 * Разбор темы и занятие, которое из него вырастает.
 *
 * Экран один на два входа. С «Сегодня» приходят за занятием: тема выбрана сама, и после
 * разбора сразу идёт практика по нему. Из списка тем приходят почитать конкретное
 * правило — и точно так же могут перейти к практике, потому что смысл разбора в том,
 * что за ним что-то следует. Читать теорию, за которой ничего нет, никто не станет.
 */
export function Theory() {
  const model = useStore()
  const topic = model.openTopic

  return (
    <>
      <header className="header">
        <div className="header-top">
          <button
            className="icon-button"
            onClick={() => (topic || model.theoryOverLesson ? model.closeTopic() : model.goBack())}
            aria-label="Назад"
          >
            <Icon name="arrow-left" size={20} />
          </button>
          <h1 className="brand-title" style={{ flex: 1, textAlign: 'center' }}>
            {topic ? 'Разбор' : 'Разборы тем'}
          </h1>
          <span style={{ width: 48 }} />
        </div>
      </header>

      <div className="scroll">
        {topic ? <Reader model={model} topic={topic} plan={model.studyPlan} /> : <TopicList model={model} />}
      </div>
    </>
  )
}

/** Список тем уровня: что разобрано, что проседает, с чего начать. */
function TopicList({ model }: { model: AppStore }) {
  const list = model.theoryList
  if (list.length === 0) {
    return <EmptyNote>Для этого уровня разборов пока нет — они появятся вместе с наполнением уровня.</EmptyNote>
  }
  const unread = list.filter((item) => !item.read).length

  return (
    <>
      <SectionTitle hint="Правило целиком: формы, границы употребления и разбор типичных ошибок.">
        {unread > 0
          ? `${unread} ${plural(unread, 'тема', 'темы', 'тем')} ещё не ${plural(unread, 'разобрана', 'разобраны', 'разобрано')}`
          : 'Все темы разобраны'}
      </SectionTitle>

      {list.map(({ topic, read, progress }) => (
        <button key={topic.topicID} className="theory-row" onClick={() => model.openTheory(topic.topicID)}>
          <span className="theory-row-head">
            <span className="theory-row-title">{topic.title}</span>
            {/* Проценты важнее галочки «прочитано»: прочитать — не значит уметь. */}
            {progress && progress.attempts > 0
              ? <span className="theory-row-score" style={{ color: scoreColour(progress.accuracy) }}>
                  {Math.round(progress.accuracy * 100)}%
                </span>
              : read
                ? <span className="theory-row-read"><Icon name="check" size={15} /></span>
                : null}
          </span>
          <span className="theory-row-idea">{topic.idea}</span>
          <span className="theory-row-foot">
            <span>{read ? 'Разобрано' : 'Не разобрано'} · {topic.minutes} мин чтения</span>
            <Icon name="chevron" size={13} />
          </span>
        </button>
      ))}
    </>
  )
}

/** Сам разбор, сверху вниз, и переход к практике в конце. */
function Reader({ model, topic, plan }: { model: AppStore; topic: TheoryTopic; plan: StudyPlan | null }) {
  const exercises = plan?.exercises.length ?? 0

  return (
    <>
      <p className="theory-kicker">{reasonLine(plan)}</p>
      <h1 className="theory-title">{topic.title}</h1>
      <p className="theory-idea">{topic.idea}</p>

      {topic.sections.map((section, index) => (
        <Section key={`${topic.topicID}-${index}`} section={section} />
      ))}

      <div className="theory-foot">
        {model.theoryOverLesson ? (
          /* Пришли из урока: практику предлагать незачем — человек уже внутри занятия. */
          <PrimaryButton onClick={() => { model.markTheoryRead(topic.topicID); model.closeTopic() }}>
            Вернуться в урок
          </PrimaryButton>
        ) : exercises > 0 ? (
          <>
            <PrimaryButton onClick={() => model.startStudyPractice()}>
              Дальше — практика по теме
            </PrimaryButton>
            <p className="theory-foot-note">
              {exercises} {plural(exercises, 'упражнение', 'упражнения', 'упражнений')} по этому правилу:
              сначала узнать в готовых вариантах, потом сказать самому.
            </p>
          </>
        ) : (
          <EmptyNote>Упражнений по этой теме в курсе пока нет — разбор есть, практики ещё нет.</EmptyNote>
        )}
        {!model.theoryOverLesson && (
          <SecondaryButton
            onClick={() => { model.markTheoryRead(topic.topicID); model.closeTopic() }}
          >
            К списку тем
          </SecondaryButton>
        )}
      </div>
    </>
  )
}

function Section({ section }: { section: TheorySection }) {
  return (
    <section className="theory-section">
      <h2 className="theory-heading">{section.heading}</h2>
      {section.body && <p className="theory-body">{section.body}</p>}

      {section.table && (
        /* Таблица форм шире экрана телефона — значит она и должна прокручиваться
           сама, а не растягивать страницу. */
        <div className="theory-table-wrap">
          <table className="theory-table">
            {section.table.caption && <caption>{section.table.caption}</caption>}
            <thead>
              <tr>{section.table.head.map((cell, i) => <th key={i}>{cell}</th>)}</tr>
            </thead>
            <tbody>
              {section.table.rows.map((row, i) => (
                <tr key={i}>{row.map((cell, j) => <td key={j} lang={langOf(cell)}>{cell}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {section.cases && section.cases.length > 0 && (
        <ul className="theory-cases">
          {section.cases.map((item, i) => (
            <li key={i}>
              <span className="theory-case-use">{item.use}</span>
              <span className="theory-case-example" lang="en">{item.example}</span>
              <span className="theory-case-translation">{item.translation}</span>
            </li>
          ))}
        </ul>
      )}

      {section.mistakes && section.mistakes.length > 0 && (
        <ul className="theory-mistakes">
          {section.mistakes.map((item, i) => (
            <li key={i}>
              <span className="theory-wrong" lang="en">
                <span className="theory-mark" aria-hidden="true">✗</span>
                {item.wrong}
              </span>
              <span className="theory-right" lang="en">
                <span className="theory-mark" aria-hidden="true">✓</span>
                {item.right}
              </span>
              <span className="theory-why">{item.why}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/** Почему занятие именно про это — сказано словами, а не оставлено на догадки. */
function reasonLine(plan: StudyPlan | null): string {
  switch (plan?.reason) {
    case 'weak': return 'ЗДЕСЬ БОЛЬШЕ ВСЕГО ОШИБОК'
    case 'unread': return 'ЕЩЁ НЕ РАЗОБРАНО'
    default: return 'РАЗБОР ТЕМЫ'
  }
}

/** Тот же порог, что на «Тренировке»: красный, жёлтый, зелёный. */
function scoreColour(accuracy: number): string {
  if (accuracy < 0.6) return 'var(--coral)'
  if (accuracy < 0.8) return 'var(--amber)'
  return 'var(--mint)'
}

/**
 * Ячейка таблицы бывает и английской формой, и русским объяснением.
 *
 * Помечать язык нужно ради переносов и шрифта: строка «begin — began — begun» с русским
 * атрибутом переносится по другим правилам. Признак простой — есть ли в ячейке кириллица.
 */
function langOf(cell: string): string {
  return /[А-Яа-яЁё]/.test(cell) ? 'ru' : 'en'
}
