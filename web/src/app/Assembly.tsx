import { useEffect } from 'react'

import { useStore } from './App'
import { AssemblyRun } from './formats'
import { preloadPhraseVoice, stopSpeaking } from './speech'
import { Icon } from '../kit/Icons'
import { PrimaryButton, SecondaryButton } from '../kit'

/**
 * «Собери, что слышишь» отдельным заходом: шесть фраз.
 *
 * Взаимодействие — то же, что внутри урока (`formats.tsx`), включая банк слов из
 * упражнений курса. Экран отвечает за очередь, счёт и выход.
 */
export function Assembly() {
  const model = useStore()

  useEffect(() => { void preloadPhraseVoice(model.selectedLevel) }, [model.selectedLevel])
  useEffect(() => () => stopSpeaking(), [])

  const leave = () => { stopSpeaking(); model.closeAssembly() }

  if (model.assemblyIsComplete || model.assemblyQuestions.length === 0) {
    return (
      <div className="center">
        <div className="hero-mark" style={{ background: '#5b8def' }}>🧩</div>
        <h1>{model.assemblyCorrect === model.assemblyTotal ? 'Все собраны' : 'Готово'}</h1>
        <p>
          Собрано {model.assemblyCorrect} из {model.assemblyTotal}.
          {model.assemblyCorrect < model.assemblyTotal && ' Что не вышло — вернётся в повторении.'}
        </p>
        <div className="stack">
          <PrimaryButton onClick={() => model.startAssembly()}>Ещё набор</PrimaryButton>
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
        <span className="player-title">Собери, что слышишь</span>
        <span className="player-count">{model.assemblyTotal} фраз</span>
      </header>

      <div className="scroll" style={{ paddingTop: 18 }}>
        <AssemblyRun
          questions={model.assemblyQuestions}
          language={model.currentLanguage.code}
          speakLevel={model.selectedLevel}
          onAttempt={(id, correct) => model.recordFormatAttempt(id, correct, 'assembly')}
          onDone={() => model.finishAssembly()}
        />
      </div>
    </>
  )
}
