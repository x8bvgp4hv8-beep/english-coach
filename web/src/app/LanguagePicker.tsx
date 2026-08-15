import { useState } from 'react'

import { useStore } from './App'
import { plural } from './plural'
import { hatFor } from '../mascot/Rhino'
import { LANGUAGES, localProgressStore } from '../core'
import { PrimaryButton } from '../kit'
import type { LanguageCode, UserState } from '../core'

/**
 * The first screen, and the only place the two halves of the app meet.
 *
 * One course at a time, the whole screen given to it: its own name, its own flag, its
 * own city behind it and its own rhino waving in its own hat. The two-card list this
 * replaced asked the learner to compare; this one asks them to arrive. The other course
 * is one arrow away and says its own name under the arrow, so nothing is hidden.
 *
 * The chips are the real record of the course on screen — the level actually being
 * studied and the streak actually running — because a course already begun should say
 * so before it asks to be chosen again. A course never opened has no numbers to show,
 * so it says what it is instead.
 */
export function LanguagePicker({ onBack }: { onBack?: () => void }) {
  const model = useStore()
  const [shown, setShown] = useState<LanguageCode>(model.language ?? LANGUAGES[0].code)
  /** Which way the panel is arriving from, so the swap reads as a step sideways. */
  const [from, setFrom] = useState<'left' | 'right' | null>(null)

  const index = LANGUAGES.findIndex((item) => item.code === shown)
  const language = LANGUAGES[index]
  const other = LANGUAGES[(index + 1) % LANGUAGES.length]
  const saved = savedState(language.code)
  const started = saved?.profile != null

  const swap = (direction: 'left' | 'right') => { setFrom(direction); setShown(other.code) }

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

      {/* The city behind the course is set in the stylesheet off this attribute, the same
          way each tab's sky is — the drawings never enter the component tree. */}
      <div className="lang-screen" data-course={language.code}>
        <p className="lang-kicker">Выбор языка</p>

        <div className="lang-panel" key={language.code} data-from={from ?? undefined}>
          <Arrow
            direction="left"
            label={index > 0 ? other.nativeTitle : undefined}
            onClick={() => swap('left')}
          />

          <div className="lang-stage">
            <h1 className="lang-name">{language.nativeTitle}</h1>
            <span className={`lang-flag ${language.code}`} role="img" aria-label={`Флаг: ${language.title}`} />
          </div>

          <Arrow
            direction="right"
            label={index === 0 ? other.nativeTitle : undefined}
            onClick={() => swap('right')}
          />
        </div>

        {/* Outside the panel, and pinned to the ground drawn in the city rather than to
            the flow: the drawing has a pavement in it, and a rhino floating a hundred
            pixels above it is the first thing the eye catches. The balloon travels with
            him so it stays tied to his head. */}
        <div className="lang-figure" key={`figure-${language.code}`}>
          <Cloud word={language.greeting} />
          <span className="lang-mascot" aria-hidden="true">
            <rhino-mascot state="wave" hat={hatFor(language.code)} />
          </span>
        </div>

        <div className="lang-foot">
          {started
            ? (
              <div className="lang-chips">
                <span className="lang-stat level">
                  <span className="lang-stat-key">Уровень</span>
                  <span className="lang-stat-value">{saved!.profile!.selectedLevel}</span>
                </span>
                <span className="lang-stat streak">
                  <span className="lang-stat-flame">🔥</span>
                  <span className="lang-stat-value">{model.streak(saved!)}</span>
                  <span className="lang-stat-key">
                    {plural(model.streak(saved!), 'день', 'дня', 'дней')}
                  </span>
                </span>
              </div>
            )
            : <p className="lang-note">{language.note}</p>}

          <PrimaryButton tone="mint" onClick={() => model.selectLanguage(language.code)}>
            {started ? `Продолжить ${language.title.toLowerCase()}` : `Начать ${language.title.toLowerCase()}`}
          </PrimaryButton>
        </div>
      </div>
    </>
  )
}

/** One of the two arrows. The one pointing at the other course carries its name. */
function Arrow(
  { direction, label, onClick }: { direction: 'left' | 'right'; label?: string; onClick: () => void },
) {
  return (
    <button className="lang-arrow" onClick={onClick} aria-label={label ? `Показать ${label}` : 'Другой курс'}>
      <span className="lang-arrow-mark">{direction === 'left' ? '←' : '→'}</span>
      {label && <span className="lang-arrow-label">{label}</span>}
    </button>
  )
}

/**
 * The greeting, in the language's own words, in a hand-drawn speech balloon.
 *
 * Drawn twice: once offset as its own flat shadow, once in white with the outline. The
 * flat shadow is the same trick the map nodes use — no blur anywhere in this app.
 */
function Cloud({ word }: { word: string }) {
  const shape = 'M30 118A30 30 0 0 1 62 68A36 36 0 0 1 122 40A34 34 0 0 1 186 34A32 32 0 0 1 244 56A30 30 0 0 1 290 96A28 28 0 0 1 292 150A30 30 0 0 1 244 184A30 30 0 0 1 186 196A28 28 0 0 1 172 194L166 200L144 272L128 190A26 26 0 0 1 86 186A30 30 0 0 1 52 168A30 30 0 0 1 30 118Z'
  return (
    <div className="lang-cloud">
      <svg viewBox="0 0 320 280" aria-hidden="true">
        <path d={shape} transform="translate(8,9)" fill="var(--accent)" />
        <path d={shape} fill="var(--surface-solid)" stroke="var(--accent)" strokeWidth="4" strokeLinejoin="round" />
      </svg>
      <span className="lang-cloud-word">{word}</span>
    </div>
  )
}

/** What is saved for a language, or null when it has never been opened. */
function savedState(language: LanguageCode): UserState | null {
  const state = localProgressStore(language).load()
  return state.profile ? state : null
}
