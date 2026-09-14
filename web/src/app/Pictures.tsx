import { useStore } from './App'
import { say } from './speech'
import { Icon } from '../kit/Icons'
import { PrimaryButton, SecondaryButton } from '../kit'
import { pictureURL } from '../core'

/**
 * «Выбери картинку»: слово и четыре картинки.
 *
 * Слово, выученное через перевод, всегда идёт через перевод: «apple → яблоко → 🍎».
 * Картинка убирает середину — слово встаёт прямо на предмет. Поэтому здесь нет русского
 * текста до ответа: он бы вернул ту самую середину.
 *
 * Слово читается вслух при появлении: связка «вижу — слышу — узнаю предмет» собирается
 * сразу, и звук для этого уже есть.
 */
export function Pictures() {
  const model = useStore()
  const question = model.currentPictureQuestion
  const picked = model.picturePicked

  if (model.pictureIsComplete || !question) {
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

  const tileClass = (hex: string) => {
    if (!picked) return 'picture-tile'
    if (hex === question.hex) return 'picture-tile right'
    if (hex === picked) return 'picture-tile wrong'
    return 'picture-tile dim'
  }

  return (
    <>
      <header className="player-bar">
        <button className="icon-button" onClick={() => model.closePictures()} aria-label="Закрыть">
          <Icon name="close" size={20} />
        </button>
        <span className="player-title">Выбери картинку</span>
        <span className="player-count">{model.pictureIndex + 1} / {model.pictureTotal}</span>
      </header>
      <div className="bar" style={{ borderRadius: 0 }}>
        <span style={{ width: `${(model.pictureIndex / model.pictureTotal) * 100}%`, background: '#e8913a' }} />
      </div>

      <div className="scroll" style={{ paddingTop: 18 }}>
        <div className="picture-word">
          <span lang={model.currentLanguage.code}>{question.word}</span>
          <button
            className="verb-speak"
            onClick={() => say(question.word, model.selectedLevel)}
            aria-label="Послушать"
          >
            <Icon name="audio" size={16} />
          </button>
        </div>

        <div className="picture-grid">
          {question.options.map((hex) => (
            <button
              key={hex}
              className={tileClass(hex)}
              disabled={Boolean(picked)}
              onClick={() => model.answerPicture(hex)}
              aria-label={hex === question.hex ? question.word : 'вариант'}
            >
              <img src={pictureURL(hex)} alt="" />
            </button>
          ))}
        </div>

        {/* Перевод — только после ответа: до него он сделал бы картинку ненужной. */}
        {picked && question.translation && <p className="exercise-hint">{question.translation}</p>}
      </div>

      {picked && (
        <div className="player-actions">
          <PrimaryButton onClick={() => model.nextPicture()}>Дальше</PrimaryButton>
        </div>
      )}
    </>
  )
}
