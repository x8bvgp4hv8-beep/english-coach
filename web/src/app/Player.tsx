import { useEffect, useState } from 'react'

import { useStore } from './App'
import { speak } from './speech'
import { diffSummary } from '../core'
import type { ExerciseType, LearningLanguage, WordDiff } from '../core'

/** The translate label names the target language, so it is built per language. */
const kindLabel = (type: ExerciseType, language: LearningLanguage, recall: boolean): string => {
  if (type === 'flashcard' && recall) return 'ВСПОМНИ ФРАЗУ'
  return {
    info: 'КОРОТКОЕ ПРАВИЛО',
    flashcard: 'НОВАЯ ФРАЗА',
    translate: `ПЕРЕВЕДИ НА ${language.title.toUpperCase()}`,
    word_order: 'СОБЕРИ ПРЕДЛОЖЕНИЕ',
    multiple_choice: 'ВЫБЕРИ ОТВЕТ',
  }[type]
}

export function Player() {
  const model = useStore()
  const exercise = model.currentExercise
  const lesson = model.activeLesson
  const feedback = model.feedback

  const [answer, setAnswer] = useState('')
  const [picked, setPicked] = useState<number[]>([])
  const [option, setOption] = useState<string | null>(null)
  /** A card being recalled keeps its answer hidden until the learner has tried. */
  const [revealed, setRevealed] = useState(false)

  useEffect(() => { setAnswer(''); setPicked([]); setOption(null); setRevealed(false) }, [exercise?.id])

  if (!lesson) return null

  if (model.session.isComplete) {
    return (
      <div className="center">
        <div className="hero-mark">⭐️</div>
        <h1>Готово!</h1>
        <p>Ещё один реальный шаг в {model.currentLanguage.locative}.</p>
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
  const recall = model.currentIsRecall
  /** The target side: the question on a first meeting, the answer on every one after. */
  const answerHidden = recall && !revealed

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
        {/* Keyed by exercise so the card replays its arrival on every step. */}
        <div className="card" key={exercise.id}>
          <div className="exercise-kind">{kindLabel(exercise.type, model.currentLanguage, recall)}</div>
          {exercise.title && <h2 className="exercise-title">{exercise.title}</h2>}
          {exercise.prompt && !answerHidden && (
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
              {/* On a repeat the Russian is the question, so it leads instead of trailing. */}
              <p
                className={answerHidden ? 'exercise-prompt' : 'exercise-explanation muted'}
                style={{ textAlign: 'center' }}
              >
                {exercise.translation}
              </p>
              {answerHidden && (
                <p className="exercise-hint">Скажи про себя, как это будет {model.currentLanguage.adverb}</p>
              )}
              {exercise.example && !answerHidden && <p className="exercise-hint"><em>{exercise.example}</em></p>}
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
                <div className="feedback-note">
                  {feedback.typo === feedback.canonical
                    ? `Не хватает ударений: правильно «${feedback.typo}»`
                    : `Опечатка: правильно пишется «${feedback.typo}»`}
                </div>
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
        {!feedback && exercise.type === 'flashcard' && !recall && (
          <button className="primary" onClick={() => model.completePassive()}>Запомнил</button>
        )}
        {!feedback && exercise.type === 'flashcard' && recall && !revealed && (
          <button
            className="primary"
            onClick={() => { setRevealed(true); if (exercise.prompt) speak(exercise.prompt) }}
          >
            Показать
          </button>
        )}
        {/* Nobody but the learner knows whether the word actually came to mind, and an
            honest "нет" is what puts the card back into tomorrow's queue. */}
        {!feedback && exercise.type === 'flashcard' && recall && revealed && (
          <div className="row">
            <button className="secondary" onClick={() => model.selfAssess(false)}>Не вспомнил</button>
            <button className="primary mint" onClick={() => model.selfAssess(true)}>Вспомнил</button>
          </div>
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
  if (summary.orderOnly) return 'Слова верные, но порядок другой'
  const parts: string[] = []
  if (summary.missing.length) parts.push(`не хватает: ${summary.missing.join(', ')}`)
  if (summary.extra.length) parts.push(`лишнее: ${summary.extra.join(', ')}`)
  return parts.length ? parts.join('  ·  ') : null
}
