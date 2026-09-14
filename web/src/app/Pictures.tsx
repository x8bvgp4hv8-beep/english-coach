import { useStore } from './App'
import { PictureRun } from './formats'
import { Icon } from '../kit/Icons'
import { PrimaryButton, SecondaryButton } from '../kit'

/**
 * «Выбери картинку» отдельным заходом: десять слов.
 *
 * Взаимодействие — то же, что внутри урока (`formats.tsx`); экран отвечает за очередь,
 * счёт и выход.
 */
export function Pictures() {
  const model = useStore()

  if (model.pictureIsComplete || model.pictureQuestions.length === 0) {
    return (
      <div className="center">
        <div className="hero-mark" style={{ background: '#e8913a' }}>🖼️</div>
        <h1>{model.pictureCorrect === model.pictureTotal ? 'Все узнаны' : 'Готово'}</h1>
        <p>
          Узнано {model.pictureCorrect} из {model.pictureTotal}.
          {model.pictureCorrect < model.pictureTotal && ' Что не вышло — вернётся в повторении.'}
        </p>
        <div className="stack">
          <PrimaryButton onClick={() => model.startPictures()}>Ещё набор</PrimaryButton>
          <SecondaryButton onClick={() => model.closePictures()}>Закончить</SecondaryButton>
        </div>
      </div>
    )
  }

  return (
    <>
      <header className="player-bar">
        <button className="icon-button" onClick={() => model.closePictures()} aria-label="Закрыть">
          <Icon name="close" size={20} />
        </button>
        <span className="player-title">Выбери картинку</span>
        <span className="player-count">{model.pictureTotal} слов</span>
      </header>

      <div className="scroll" style={{ paddingTop: 18 }}>
        <PictureRun
          questions={model.pictureQuestions}
          language={model.currentLanguage.code}
          speakLevel={model.selectedLevel}
          onAttempt={(id, correct) => model.recordFormatAttempt(id, correct, 'pictures')}
          onDone={() => model.finishPictures()}
        />
      </div>
    </>
  )
}
