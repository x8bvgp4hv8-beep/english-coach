import { useEffect, useState } from 'react'

import { useStore } from './App'
import { diffSummary } from '../core'
import type { ExerciseType, WordDiff } from '../core'

const KIND_LABEL: Record<ExerciseType, string> = {
  info: 'КОРОТКОЕ ПРАВИЛО',
  flashcard: 'НОВАЯ ФРАЗА',
  translate: 'ПЕРЕВЕДИ НА АНГЛИЙСКИЙ',
  word_order: 'СОБЕРИ ПРЕДЛОЖЕНИЕ',
  multiple_choice: 'ВЫБЕРИ ОТВЕТ',
}

/** System voice, no network and no assets. Safari needs a user gesture to start it. */
function speak(text: string): void {
  if (!('speechSynthesis' in window) || !text) return
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-GB'
  utterance.rate = 0.95
  speechSynthesis.cancel()
  speechSynthesis.speak(utterance)
}

export function Player() {
  const model = useStore()
  const exercise = model.currentExercise
  const lesson = model.activeLesson
  const feedback = model.feedback

  const [answer, setAnswer] = useState('')
  const [picked, setPicked] = useState<number[]>([])
  const [option, setOption] = useState<string | null>(null)

  useEffect(() => { setAnswer(''); setPicked([]); setOption(null) }, [exercise?.id])

  if (!lesson) return null

  if (model.session.isComplete) {
    return (
      <div className="center">
        <div className="hero-mark">⭐️</div>
        <h1>Готово!</h1>
        <p>Ещё один реальный шаг в английском.</p>
        <div className="pills">
          <span className="pill">✦ {model.totalPoints}</span>
          <span className="pill">🔥 {model.streak()}</span>
        </div>
        <button className="primary" onClick={() => model.closeLesson()}>Вернуться на маршрут</button>
      </div>
    )
  }
  if (!exercise) return null

  const total = lesson.exercises.length
  const position = Math.min(model.session.exerciseIndex + 1, total)
  const tokens = exercise.tokens ?? []
  const canOverrule = exercise.type === 'translate' || exercise.type === 'word_order'

  return (
    <div className="player">
      <div className="player-bar">
        <button className="icon-button" onClick={() => model.closeLesson()} aria-label="Выйти">✕</button>
        <span className="player-title">{lesson.title}</span>
        <span className="player-count">{position} / {total}</span>
      </div>
      <div className="bar" style={{ borderRadius: 0 }}>
        <span style={{ width: `${(model.session.exerciseIndex / total) * 100}%`, background: 'var(--violet)' }} />
      </div>

      <div className="scroll" style={{ paddingTop: 18 }}>
        <div className="card">
          <div className="exercise-kind">{KIND_LABEL[exercise.type]}</div>
          {exercise.title && <h2 className="exercise-title">{exercise.title}</h2>}
          {exercise.prompt && (
            <div className="exercise-prompt">
              {exercise.prompt}
              {exercise.type === 'flashcard' && (
                <button className="speak" style={{ marginLeft: 8 }} onClick={() => speak(exercise.prompt!)} aria-label="Произнести">🔊</button>
              )}
            </div>
          )}

          {exercise.type === 'info' && <p className="exercise-explanation">{exercise.explanation}</p>}

          {exercise.type === 'flashcard' && (
            <>
              <p className="exercise-explanation muted" style={{ textAlign: 'center' }}>{exercise.translation}</p>
              {exercise.example && <p className="exercise-hint"><em>{exercise.example}</em></p>}
            </>
          )}

          {exercise.type === 'translate' && (
            <input
              className="answer-field"
              value={answer}
              placeholder="Напиши перевод…"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              disabled={feedback !== null}
              onChange={(event) => setAnswer(event.target.value)}
              onKeyDown={(event) => { if (event.key === 'Enter' && answer.trim()) model.submitText(answer) }}
            />
          )}

          {exercise.type === 'word_order' && (
            <>
              <div className="token-tray">
                {picked.length === 0 && <span className="placeholder">Нажимай на слова, чтобы собрать фразу</span>}
                {picked.map((index, position) => (
                  <button
                    key={`${index}-${position}`}
                    className="token picked"
                    disabled={feedback !== null}
                    onClick={() => setPicked(picked.filter((_, i) => i !== position))}
                  >
                    {tokens[index]}
                  </button>
                ))}
              </div>
              <div className="tokens">
                {tokens.map((token, index) => (
                  <button
                    key={`${token}-${index}`}
                    className={`token${picked.includes(index) ? ' used' : ''}`}
                    disabled={picked.includes(index) || feedback !== null}
                    onClick={() => setPicked([...picked, index])}
                  >
                    {token}
                  </button>
                ))}
              </div>
            </>
          )}

          {exercise.type === 'multiple_choice' && (
            <div className="choices" style={{ marginTop: 14 }}>
              {(exercise.options ?? []).map((value) => (
                <button
                  key={value}
                  className={`choice${option === value ? ' selected' : ''}`}
                  disabled={feedback !== null}
                  onClick={() => setOption(value)}
                >
                  {value}
                </button>
              ))}
            </div>
          )}

          {exercise.hint && !feedback && <p className="exercise-hint">💡 {exercise.hint}</p>}

          {feedback && (
            <div className={`feedback ${feedback.isCorrect ? 'correct' : 'wrong'}`}>
              <div className="feedback-title">
                {feedback.verdict === 'correct' ? 'Отлично!' : feedback.verdict === 'typo' ? 'Почти! Засчитано' : 'Пока не так'}
              </div>
              {feedback.verdict === 'typo' && feedback.typo && (
                <div className="feedback-note">Опечатка: правильно пишется «{feedback.typo}»</div>
              )}
              {feedback.verdict === 'wrong' && (
                <>
                  <div className="feedback-answer">{feedback.canonical}</div>
                  {mistakeHint(feedback.diff) && <div className="feedback-diff">{mistakeHint(feedback.diff)}</div>}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="player-actions">
        {!feedback && exercise.type === 'info' && (
          <button className="primary" onClick={() => model.completePassive()}>Понятно</button>
        )}
        {!feedback && exercise.type === 'flashcard' && (
          <button className="primary" onClick={() => model.completePassive()}>Запомнил</button>
        )}
        {!feedback && exercise.type === 'translate' && (
          <button className="primary" disabled={!answer.trim()} onClick={() => model.submitText(answer)}>Проверить</button>
        )}
        {!feedback && exercise.type === 'word_order' && (
          <div className="row">
            <button className="secondary" disabled={picked.length === 0} onClick={() => setPicked([])}>Очистить</button>
            <button className="primary" disabled={picked.length === 0} onClick={() => model.submitText(picked.map((i) => tokens[i]).join(' '))}>
              Проверить
            </button>
          </div>
        )}
        {!feedback && exercise.type === 'multiple_choice' && (
          <button className="primary" disabled={option === null} onClick={() => model.submitChoice(option!)}>Проверить</button>
        )}

        {feedback && (
          <>
            <div className="row">
              {!feedback.isCorrect && !model.session.retryUsed && (
                <button className="secondary" onClick={() => { setAnswer(''); setPicked([]); setOption(null); model.retry() }}>
                  Ещё раз
                </button>
              )}
              <button className={`primary${feedback.isCorrect ? ' mint' : ''}`} onClick={() => model.advance()}>Дальше</button>
            </div>
            {feedback.verdict === 'wrong' && canOverrule && (
              <button className="quiet" onClick={() => model.markLastAnswerCorrect()}>Мой ответ тоже верный</button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

/** Names what is missing or extra, but only when the answer was close enough to fix. */
function mistakeHint(diff: WordDiff[] | undefined): string | null {
  const summary = diffSummary(diff)
  if (!summary) return null
  const parts: string[] = []
  if (summary.missing.length) parts.push(`не хватает: ${summary.missing.join(', ')}`)
  if (summary.extra.length) parts.push(`лишнее: ${summary.extra.join(', ')}`)
  return parts.length ? parts.join('  ·  ') : null
}
