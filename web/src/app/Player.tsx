import { useEffect, useState } from 'react'

import { useStore } from './App'
import { speak } from './speech'
import { diffSummary } from '../core'
import {
  AnswerField, Choice, ChoiceList, Dialogue, Feedback, Pill, PrimaryButton, SecondaryButton, WordOrderTray,
} from '../kit'
import type { DialogueLine, ExerciseType, LearningLanguage, WordDiff } from '../core'

/** The translate label names the target language, so it is built per language. */
const kindLabel = (type: ExerciseType, language: LearningLanguage, recall: boolean): string => {
  if (type === 'flashcard' && recall) return 'ВСПОМНИ ФРАЗУ'
  return {
    dialogue: 'ПОСЛУШАЙ',
    info: 'КОРОТКОЕ ПРАВИЛО',
    flashcard: 'НОВАЯ ФРАЗА',
    translate: `ПЕРЕВЕДИ НА ${language.title.toUpperCase()}`,
    word_order: 'СОБЕРИ ПРЕДЛОЖЕНИЕ',
    multiple_choice: 'ВЫБЕРИ ОТВЕТ',
  }[type]
}

/** Reads the exchange line by line, waiting for each one to finish before the next. */
function DialoguePlayer({ lines }: { lines: DialogueLine[] }) {
  const [playing, setPlaying] = useState(false)

  const playAll = () => {
    setPlaying(true)
    const next = (index: number) => {
      if (index >= lines.length) { setPlaying(false); return }
      speak(lines[index].text, () => next(index + 1))
    }
    next(0)
  }

  return <Dialogue lines={lines} onSpeak={(text) => speak(text)} onPlayAll={playAll} playing={playing} />
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
          <Pill>✦ {model.totalPoints}</Pill>
          <Pill>🔥 {model.streak()}</Pill>
        </div>
        <PrimaryButton onClick={() => model.closeLesson()}>Вернуться на маршрут</PrimaryButton>
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

          {exercise.type === 'dialogue' && <DialoguePlayer lines={exercise.lines ?? []} />}

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
            <AnswerField
              value={answer}
              placeholder="Напиши перевод…"
              disabled={feedback !== null}
              onChange={setAnswer}
              onSubmit={(value) => model.submitText(value)}
            />
          )}

          {exercise.type === 'word_order' && (
            <WordOrderTray
              tokens={tokens}
              picked={picked}
              disabled={feedback !== null}
              onPick={(index) => setPicked([...picked, index])}
              onUnpick={(position) => setPicked(picked.filter((_, i) => i !== position))}
            />
          )}

          {exercise.type === 'multiple_choice' && (
            <div style={{ marginTop: 14 }}>
              <ChoiceList>
                {(exercise.options ?? []).map((value) => (
                  <Choice
                    key={value}
                    selected={option === value}
                    disabled={feedback !== null}
                    onSelect={() => setOption(value)}
                  >
                    {value}
                  </Choice>
                ))}
              </ChoiceList>
            </div>
          )}

          {exercise.hint && !feedback && <p className="exercise-hint">💡 {exercise.hint}</p>}

          {feedback && (
            <Feedback
              verdict={feedback.verdict}
              note={feedback.verdict === 'typo' && feedback.typo
                ? feedback.typo === feedback.canonical
                  ? `Не хватает ударений: правильно «${feedback.typo}»`
                  : `Опечатка: правильно пишется «${feedback.typo}»`
                : undefined}
              answer={feedback.canonical}
              diff={mistakeHint(feedback.diff) ?? undefined}
            />
          )}
        </div>
      </div>

      <div className="player-actions">
        {!feedback && exercise.type === 'dialogue' && (
          <PrimaryButton onClick={() => model.completePassive()}>Дальше</PrimaryButton>
        )}
        {!feedback && exercise.type === 'info' && (
          <PrimaryButton onClick={() => model.completePassive()}>Понятно</PrimaryButton>
        )}
        {!feedback && exercise.type === 'flashcard' && !recall && (
          <PrimaryButton onClick={() => model.completePassive()}>Запомнил</PrimaryButton>
        )}
        {!feedback && exercise.type === 'flashcard' && recall && !revealed && (
          <PrimaryButton onClick={() => { setRevealed(true); if (exercise.prompt) speak(exercise.prompt) }}>
            Показать
          </PrimaryButton>
        )}
        {/* Nobody but the learner knows whether the word actually came to mind, and an
            honest "нет" is what puts the card back into tomorrow's queue. */}
        {!feedback && exercise.type === 'flashcard' && recall && revealed && (
          <div className="row">
            <SecondaryButton onClick={() => model.selfAssess(false)}>Не вспомнил</SecondaryButton>
            <PrimaryButton tone="mint" onClick={() => model.selfAssess(true)}>Вспомнил</PrimaryButton>
          </div>
        )}
        {!feedback && exercise.type === 'translate' && (
          <PrimaryButton disabled={!answer.trim()} onClick={() => model.submitText(answer)}>Проверить</PrimaryButton>
        )}
        {!feedback && exercise.type === 'word_order' && (
          <div className="row">
            <SecondaryButton disabled={picked.length === 0} onClick={() => setPicked([])}>Очистить</SecondaryButton>
            <PrimaryButton disabled={picked.length === 0} onClick={() => model.submitText(picked.map((i) => tokens[i]).join(' '))}>
              Проверить
            </PrimaryButton>
          </div>
        )}
        {!feedback && exercise.type === 'multiple_choice' && (
          <PrimaryButton disabled={option === null} onClick={() => model.submitChoice(option!)}>Проверить</PrimaryButton>
        )}

        {feedback && (
          <>
            <div className="row">
              {!feedback.isCorrect && !model.session.retryUsed && (
                <SecondaryButton onClick={() => { setAnswer(''); setPicked([]); setOption(null); model.retry() }}>
                  Ещё раз
                </SecondaryButton>
              )}
              <PrimaryButton tone={feedback.isCorrect ? 'mint' : 'accent'} onClick={() => model.advance()}>Дальше</PrimaryButton>
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
