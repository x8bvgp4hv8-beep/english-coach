import { useStore } from './App'
import { hatFor } from '../mascot/Rhino'
import { LANGUAGES, localProgressStore } from '../core'
import { LanguageCard } from '../kit'
import type { LanguageCode } from '../core'

/**
 * The first screen, and the only place the two halves of the app meet.
 *
 * Each card is painted in its own language's accent, because that accent is what the
 * learner will see for the rest of the session: choosing here is choosing a colour, a
 * voice, a course and a separate record of progress.
 */
export function LanguagePicker({ onBack }: { onBack?: () => void }) {
  const model = useStore()

  return (
    <>
      {onBack && (
        <header className="header">
          <div className="header-top">
            <button className="icon-button" onClick={onBack} aria-label="Назад">‹</button>
            <h1 className="brand-title" style={{ flex: 1, textAlign: 'center' }}>Язык</h1>
            <span style={{ width: 48 }} />
          </div>
        </header>
      )}

      <div className="scroll lang-screen">
        {!onBack && (
          <div className="lang-intro">
            <div className="hero-mark">🗺</div>
            <h1>Что учим?</h1>
            <p>Два независимых курса: свой маршрут, свой прогресс, свой голос. Язык можно поменять в любой момент.</p>
          </div>
        )}

        <div className="lang-grid">
          {LANGUAGES.map((language) => {
            const started = startedAt(language.code)
            const current = model.language === language.code
            return (
              <LanguageCard
                key={language.code}
                code={language.code}
                short={language.short}
                greeting={language.greeting}
                greetingLocale={language.speechLocale}
                title={language.title}
                nativeTitle={language.nativeTitle}
                current={current}
                // One rhino per course, in that course's hat, waving from the card.
                mascot={
                  <span className="lang-rhino" aria-hidden="true">
                    <rhino-mascot state="wave" hat={hatFor(language.code)} />
                  </span>
                }
                // A course already begun says so with its own numbers: on the very first
                // screen after an update, "продолжить · B1 · 320 ✦" is the answer to
                // "а где мой прогресс".
                note={started ? `Уровень ${started.level} · ${started.points} ✦` : language.note}
                state={current ? 'сейчас здесь' : started ? 'продолжить' : 'начать'}
                onChoose={() => model.selectLanguage(language.code)}
              />
            )
          })}
        </div>

        <p className="settings-note" style={{ textAlign: 'center' }}>
          Прогресс у языков раздельный: занятия по испанскому не сбивают английский стрик и наоборот.
          Начатый курс ждёт на своей карточке — выбор языка ничего не сбрасывает.
        </p>
      </div>
    </>
  )
}

interface Started {
  level: string
  points: number
}

/** What is already saved for a language, or null when it has never been opened. */
function startedAt(language: LanguageCode): Started | null {
  const state = localProgressStore(language).load()
  if (!state.profile) return null
  return { level: state.profile.selectedLevel, points: state.points }
}
