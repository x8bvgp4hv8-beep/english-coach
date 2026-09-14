import { useEffect } from 'react'

import { useStore } from './App'
import { HearingRun } from './formats'
import { preloadPhraseVoice, stopSpeaking } from './speech'
import { Icon } from '../kit/Icons'
import { PrimaryButton, SecondaryButton } from '../kit'

/**
 * «Что ты слышишь» отдельным заходом: восемь фраз.
 *
 * Взаимодействие — то же, что внутри урока (`formats.tsx`). Экран отвечает за очередь,
 * счёт и выход, и ещё за одну вещь: подгружает таймкоды уровня заранее, чтобы первая
 * фраза зазвучала без задержки.
 */
export function Hearing() {
  const model = useStore()

  useEffect(() => { void preloadPhraseVoice(model.selectedLevel) }, [model.selectedLevel])
  useEffect(() => () => stopSpeaking(), [])

  const leave = () => { stopSpeaking(); model.closeHearing() }

  if (model.hearingIsComplete || model.hearingQuestions.length === 0) {
    return (
      <div className="center">
        <div className="hero-mark" style={{ background: '#3aa0c8' }}>👂</div>
        <h1>{model.hearingCorrect === model.hearingTotal ? 'Всё на слух' : 'Готово'}</h1>
        <p>
          Узнано {model.hearingCorrect} из {model.hearingTotal}.
          {model.hearingCorrect < model.hearingTotal && ' Что не вышло — вернётся в повторении.'}
        </p>
        <div className="stack">
          <PrimaryButton onClick={() => model.startHearing()}>Ещё набор</PrimaryButton>
          <SecondaryButton onClick={leave}>Закончить</SecondaryButton>
        </div>
      </div>
    )
  }

  return (
    <>
      <header className="player-bar">
        <button className="icon-button" onClick={leave} aria-label="Закрыть">
          <Icon name="close" size={20} />
        </button>
        <span className="player-title">Что ты слышишь</span>
        <span className="player-count">{model.hearingTotal} фраз</span>
      </header>

      <div className="scroll" style={{ paddingTop: 18 }}>
        <HearingRun
          questions={model.hearingQuestions}
          language={model.currentLanguage.code}
          speakLevel={model.selectedLevel}
          onAttempt={(id, correct) => model.recordFormatAttempt(id, correct, 'hearing')}
          onDone={() => model.finishHearing()}
        />
      </div>
    </>
  )
}
