import { useEffect, useState } from 'react'

import { useStore } from './App'
import { SLOW_RATE, speak, stopSpeaking } from './speech'
import { diffSummary } from '../core'
import type { WordDiff } from '../core'

/**
 * Hear the sentence, write down what you heard.
 *
 * The English stays hidden until the answer is in — that is the whole point. Reading it
 * first turns the drill back into reading, which is the skill that was never the problem.
 */
export function Listening() {
  const model = useStore()
  const item = model.currentListeningItem
  const feedback = model.feedback
  const [answer, setAnswer] = useState('')
  const [showGloss, setShowGloss] = useState(false)
  const [plays, setPlays] = useState(0)

  const phrase = item?.text
  useEffect(() => {
    setAnswer('')
    setShowGloss(false)
    setPlays(0)
    if (!phrase) return
    // The sentence plays itself on arrival, so the drill is one tap per item rather than
    // two. Safari can refuse the very first utterance outside a gesture; the button is
    // right there, and every later one goes through once speech has been unlocked.
    speak(phrase)
    setPlays(1)
  }, [phrase])
  useEffect(() => () => stopSpeaking(), [])

  const leave = () => { stopSpeaking(); model.closeListening() }

  if (model.listeningIsComplete) {
    return (
      <div className="center">
        <div className="hero-mark" style={{ background: 'var(--blue)' }}>👂</div>
        <h1>Уловил!</h1>
        <p>Речь на слух — то, что не тренируется чтением.</p>
        <div className="pills">
          <span className="pill">✦ {model.totalPoints}</span>
          <span className="pill">🔥 {model.streak()}</span>
        </div>
        <button className="primary" onClick={leave}>Вернуться на маршрут</button>
      </div>
    )
  }
  if (!item) return null

  const total = model.listeningItems.length
  const position = Math.min(model.session.exerciseIndex + 1, total)
  const play = (rate?: number) => { setPlays(plays + 1); speak(item.text, undefined, rate) }

  return (
    <div className="player">
      <div className="player-bar">
        <button className="icon-button" onClick={leave} aria-label="Выйти">✕</button>
        <span className="player-title">На слух</span>
        <span className="player-count">{position} / {total}</span>
      </div>
      <div className="bar" style={{ borderRadius: 0 }}>
        <span style={{ width: `${(model.session.exerciseIndex / total) * 100}%`, background: 'var(--blue)' }} />
      </div>

      <div className="scroll" style={{ paddingTop: 18 }}>
        {/* Keyed by sentence so the card replays its arrival on every step. */}
        <div className="card" key={item.exerciseID}>
          <div className="exercise-kind" style={{ color: 'var(--blue)' }}>ЗАПИШИ, ЧТО УСЛЫШАЛ</div>

          <button className="play-big" onClick={() => play()} aria-label="Прослушать">🔊</button>

          <div className="listen-row">
            <button className="listen blue" onClick={() => play()}>↻ Ещё раз</button>
            <button className="listen blue" onClick={() => play(SLOW_RATE)}>🐢 Медленно</button>
            <button className="listen blue" disabled={!item.gloss || showGloss} onClick={() => setShowGloss(true)}>
              💡 Смысл
            </button>
          </div>

          {showGloss && item.gloss && <p className="exercise-hint">{item.gloss}</p>}

          <input
            className="answer-field"
            value={answer}
            placeholder="Что ты услышал…"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            disabled={feedback !== null}
            onChange={(event) => setAnswer(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Enter' && answer.trim()) model.submitHeard(answer) }}
          />

          {feedback && (
            <div className={`feedback ${feedback.isCorrect ? 'correct' : 'wrong'}`}>
              <div className="feedback-title">
                {feedback.verdict === 'correct' ? plays <= 1 ? 'С первого раза!' : 'Точно!'
                  : feedback.verdict === 'typo' ? 'Услышал верно, написал с опиской'
                  : answer.trim() ? 'Не всё дошло' : 'Вот что там было'}
              </div>
              {feedback.verdict === 'typo' && feedback.typo && (
                <div className="feedback-note">
                  {feedback.typo === feedback.canonical
                    ? `Не хватает ударений: правильно «${feedback.typo}»`
                    : `Правильно пишется «${feedback.typo}»`}
                </div>
              )}
              {/* The sentence with the words that slipped past marked in it: seeing where
                  the ear gave out is the lesson, the score is not. */}
              <div className="heard-line">
                {/* Marking up only helps when something got through. If nothing did — an
                    empty answer, or one that missed entirely — a wall of amber says only
                    what the learner already knows. */}
                {feedback.diff?.some((part) => part.kind === 'same')
                  ? feedback.diff.filter((part) => part.kind !== 'extra').map((part, index, list) => (
                    <span key={index} className={part.kind === 'missing' ? 'missed' : undefined}>
                      {/* The diff is built from stripped words; the sentence gets its full
                          stop back so the line still reads as one. */}
                      {index === list.length - 1 ? part.text + (item.text.match(/[.!?]+$/)?.[0] ?? '') : part.text}
                    </span>
                  ))
                  : <span>{item.text}</span>}
              </div>
              {item.gloss && <div className="feedback-note">{item.gloss}</div>}
              {mistakeHint(feedback.diff) && <div className="feedback-diff">{mistakeHint(feedback.diff)}</div>}
            </div>
          )}
        </div>
      </div>

      <div className="player-actions">
        {!feedback ? (
          <>
            <button className="primary" disabled={!answer.trim()} onClick={() => model.submitHeard(answer)}>Проверить</button>
            <button className="quiet" onClick={() => model.revealHeard()}>Не разобрал — покажи</button>
          </>
        ) : (
          <div className="row">
            <button className="secondary" onClick={() => play(SLOW_RATE)}>🐢 Медленно</button>
            <button className={`primary${feedback.isCorrect ? ' mint' : ''}`} onClick={() => model.advance()}>Дальше</button>
          </div>
        )}
      </div>
    </div>
  )
}

/** Names what the ear missed, but only when the answer was close enough for a list to help. */
function mistakeHint(diff: WordDiff[] | undefined): string | null {
  const summary = diffSummary(diff)
  if (!summary) return null
  if (summary.orderOnly) return 'Слова верные, но порядок другой'
  const parts: string[] = []
  if (summary.missing.length) parts.push(`не расслышал: ${summary.missing.join(', ')}`)
  if (summary.extra.length) parts.push(`послышалось лишнее: ${summary.extra.join(', ')}`)
  return parts.length ? parts.join('  ·  ') : null
}
