import { useEffect } from 'react'

import { useStore } from './App'
import { SLOW_RATE, preloadPhraseVoice, say, stopSpeaking } from './speech'
import { Icon } from '../kit/Icons'
import { PrimaryButton, SecondaryButton } from '../kit'

/**
 * «Что ты слышишь»: фраза звучит, на экране четыре варианта.
 *
 * Ступенька между «повтори вслух» и «запиши, что услышал». Первое не требует понимания,
 * второе требует сразу всего — расслышать, понять и написать без описок, — и человек,
 * который не справляется, просто перестаёт открывать аудирование. Здесь понимать надо,
 * а писать не надо.
 *
 * Фраза читается сама при появлении и повторяется кнопкой: приманки подобраны похожими
 * по длине и общим словам, поэтому выбор решается слухом, а не догадкой по виду строки.
 */
export function Hearing() {
  const model = useStore()
  const question = model.currentHearingQuestion
  const picked = model.hearingPicked

  const text = question?.text
  useEffect(() => {
    if (!text) return
    void preloadPhraseVoice(model.selectedLevel)
    say(text, model.selectedLevel)
  }, [text])
  useEffect(() => () => stopSpeaking(), [])

  const leave = () => { stopSpeaking(); model.closeHearing() }

  if (model.hearingIsComplete || !question) {
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

  const optionClass = (option: string) => {
    if (!picked) return 'hear-option'
    if (option === question.text) return 'hear-option right'
    if (option === picked) return 'hear-option wrong'
    return 'hear-option dim'
  }

  return (
    <>
      <header className="player-bar">
        <button className="icon-button" onClick={leave} aria-label="Закрыть">
          <Icon name="close" size={20} />
        </button>
        <span className="player-title">Что ты слышишь</span>
        <span className="player-count">{model.hearingIndex + 1} / {model.hearingTotal}</span>
      </header>
      <div className="bar" style={{ borderRadius: 0 }}>
        <span style={{ width: `${(model.hearingIndex / model.hearingTotal) * 100}%`, background: '#3aa0c8' }} />
      </div>

      <div className="scroll" style={{ paddingTop: 18 }}>
        <button className="play-big" onClick={() => say(question.text, model.selectedLevel)} aria-label="Прослушать">🔊</button>
        <div className="listen-row">
          <button className="listen blue" onClick={() => say(question.text, model.selectedLevel)}>↻ Ещё раз</button>
          <button className="listen blue" onClick={() => say(question.text, model.selectedLevel, undefined, SLOW_RATE)}>🐢 Медленно</button>
        </div>

        <div className="hear-options">
          {question.options.map((option) => (
            <button
              key={option}
              className={optionClass(option)}
              lang={model.currentLanguage.code}
              disabled={Boolean(picked)}
              onClick={() => model.answerHearing(option)}
            >
              {option}
            </button>
          ))}
        </div>

        {picked && question.gloss && <p className="exercise-hint">{question.gloss}</p>}
      </div>

      {picked && (
        <div className="player-actions">
          <PrimaryButton onClick={() => model.nextHearing()}>Дальше</PrimaryButton>
        </div>
      )}
    </>
  )
}
