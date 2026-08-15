import { useEffect, useState } from 'react'

import { useStore } from './App'
import { plural, spell } from './plural'
import { speak } from './speech'
import { hatFor, lineForVerdict, Rhino, RhinoPop } from '../mascot/Rhino'
import { diffSummary } from '../core'
import { Icon } from '../kit/Icons'
import type { RhinoLine } from '../mascot/Rhino'
import {
  AnswerField, Choice, ChoiceList, Dialogue, Feedback, Pill, PrimaryButton, SecondaryButton, WordOrderTray,
} from '../kit'
import type { AnswerResult, DialogueLine, Exercise, ExerciseType, LearningLanguage, WordDiff } from '../core'

/**
 * One answered step, frozen the way the learner left it.
 *
 * The session itself only ever holds the step it is on, so looking back has to be
 * remembered here: what was typed, what was tapped, and the verdict that came out of it.
 */
type Step = {
  index: number
  answer: string
  picked: number[]
  option: string | null
  feedback: AnswerResult | null
  /** Whether the card was being recalled — the kicker said so, and it still should. */
  recall: boolean
}

const capitalise = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1)

/** A card the learner marked themselves, written down the way a checked answer would be. */
const selfVerdict = (correct: boolean, exercise: Exercise): AnswerResult => ({
  isCorrect: correct,
  verdict: correct ? 'correct' : 'wrong',
  canonical: exercise.canonicalAnswer ?? exercise.prompt ?? '',
})

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
  const [rhino, setRhino] = useState<RhinoLine | null>(null)

  /**
   * Looking back at what has already been answered.
   *
   * `history` holds every step that has been left behind, and `peekAt` is the one being
   * looked at right now. Nothing about the session moves while it is set: the step the
   * learner is really on stays where it was, the live answer stays in the fields above,
   * and going back is therefore reading rather than editing — there is no way to answer
   * a past exercise a second time, because nothing on that screen is wired to submit.
   */
  const [history, setHistory] = useState<Step[]>([])
  const [peekAt, setPeekAt] = useState<number | null>(null)

  useEffect(() => { setAnswer(''); setPicked([]); setOption(null); setRevealed(false) }, [exercise?.id])

  // A new set starts with an empty history. Keyed on the session rather than on the
  // lesson id: a practice set is handed the same synthetic id every time, so "Ещё раз"
  // would otherwise walk back into the previous run's answers.
  useEffect(() => { setHistory([]); setPeekAt(null) }, [model.session])

  /**
   * The mascot answers the verdict, not the tap: it is driven off the feedback the
   * session produced, so every route into an answer — typing, tapping an option,
   * assembling the words — gets the same reaction without being wired one by one.
   */
  const step = model.session.exerciseIndex
  const verdict = feedback?.verdict
  useEffect(() => {
    if (!verdict) return
    const line = lineForVerdict(verdict, step)
    if (line) setRhino({ ...line, id: Date.now() })
  }, [verdict, step])

  if (!lesson) return null

  /**
   * The summary, which says which of the four doors this set came through.
   *
   * "Готово!" on its own left a drill and a lesson looking identical, and the way out
   * always led to the route — so finishing a weak-topic set dropped the learner two taps
   * away from the tab they had started in.
   */
  if (model.session.isComplete) {
    const mistakes = model.sessionMistakes
    const drilling = model.sessionMode === 'drill' || model.sessionMode === 'topic'
    return (
      <div className="center">
        <p className="done-kicker">{model.sessionKicker}</p>
        <div className="done-figure" aria-hidden="true">
          <Rhino state="celebrate" hat={hatFor(model.currentLanguage.code)} size={132} />
        </div>
        <h1>{mistakes === 0 ? 'Готово, ни одной ошибки' : 'Готово'}</h1>
        <p>
          {/* Spelled out and agreeing with the number, the way the rest of the app counts. */}
          {mistakes === 0
            ? `Ещё один реальный шаг в ${model.currentLanguage.locative}.`
            : mistakes === 1
              ? 'Одна ошибка — она вернётся в повторении, пока не уляжется.'
              : `${capitalise(spell(mistakes, true))} ${plural(mistakes, 'ошибка', 'ошибки', 'ошибок')} — они вернутся в повторении, пока не улягутся.`}
        </p>
        <div className="pills">
          <Pill>✦ {model.totalPoints}</Pill>
          <Pill>🔥 {model.streak()}</Pill>
        </div>
        <div className="stack">
          <PrimaryButton tone="mint" onClick={() => model.repeatSession()}>Ещё раз</PrimaryButton>
          <SecondaryButton onClick={() => model.exitSession()}>
            {drilling ? 'К тренировкам' : 'На сегодня'}
          </SecondaryButton>
        </div>
      </div>
    )
  }
  if (!exercise) return null

  /** The step being looked at, when the learner has walked back into the history. */
  const past = peekAt === null ? null : history.find((item) => item.index === peekAt) ?? null
  /** Everything below renders this pair: the exercise on screen and the answer on it. */
  const shown = past ? lesson.exercises[past.index] : exercise
  const view: Omit<Step, 'index'> = past ?? { answer, picked, option, feedback, recall: model.currentIsRecall }

  const total = lesson.exercises.length
  const position = Math.min((past ? past.index : model.session.exerciseIndex) + 1, total)
  const tokens = shown.tokens ?? []
  const canOverrule = shown.type === 'translate' || shown.type === 'word_order'
  const recall = model.currentIsRecall
  /**
   * The target side: the question on a first meeting, the answer on every one after.
   * A step already behind us is never hidden — it was answered, so it is shown answered.
   */
  const answerHidden = !past && recall && !revealed
  /** Inputs stop taking anything once an answer is in — and always while looking back. */
  const locked = past !== null || view.feedback !== null
  /** The verdict on the step being shown: the live one, or the one that was recorded. */
  const result = view.feedback

  /** Freeze the step the way it is being left, so the arrow back can show it again. */
  const remember = (verdict: AnswerResult | null = feedback): void => {
    const item: Step = { index: model.session.exerciseIndex, answer, picked, option, feedback: verdict, recall }
    setHistory((items) => [...items.filter((one) => one.index !== item.index), item])
  }

  const behind = (from: number): number[] => history.filter((item) => item.index < from).map((item) => item.index)
  const stepShown = past ? past.index : model.session.exerciseIndex
  const canGoBack = behind(stepShown).length > 0

  const goBack = (): void => {
    const previous = behind(stepShown)
    if (previous.length > 0) setPeekAt(Math.max(...previous))
  }

  /** Forward walks the history back up and then hands the screen to the live step. */
  const goForward = (): void => {
    if (!past) return
    const ahead = history.filter((item) => item.index > past.index).map((item) => item.index)
    setPeekAt(ahead.length === 0 ? null : Math.min(...ahead))
  }

  return (
    <div className="player">
      <div className="player-bar">
        <button className="icon-button" onClick={() => model.closeLesson()} aria-label="Выйти">✕</button>
        {/* Back is only offered once there is something behind: an arrow that does
            nothing is worse than no arrow. */}
        <button
          className="icon-button"
          disabled={!canGoBack}
          onClick={goBack}
          aria-label="Показать прошлый ответ"
        >
          <Icon name="arrow-left" size={19} />
        </button>
        <span className="player-title">{lesson.title}</span>
        <span className="player-count">{position} / {total}</span>
      </div>
      <div className="bar" style={{ borderRadius: 0 }}>
        <span style={{ width: `${(model.session.exerciseIndex / total) * 100}%`, background: 'var(--violet)' }} />
      </div>

      <div className="scroll" style={{ paddingTop: 18 }}>
        {/* Said out loud, because the screen otherwise looks like an exercise waiting
            for an answer that will not be taken. */}
        {past && <p className="peek-note">Это уже отвеченный шаг — ответ показан так, как ты его дал.</p>}
        {/* Keyed by exercise so the card replays its arrival on every step. */}
        <div className="card" key={shown.id}>
          <div className="exercise-kind">{kindLabel(shown.type, model.currentLanguage, view.recall)}</div>
          {shown.title && <h2 className="exercise-title">{shown.title}</h2>}
          {shown.prompt && !answerHidden && (
            /* A flashcard prompt is the word itself; every other kind asks its question
               in Russian, so only this one is handed to the second face. */
            <div className={`exercise-prompt${shown.type === 'flashcard' ? ' learn' : ''}`}>
              {shown.prompt}
              {shown.type === 'flashcard' && (
                <button className="speak" style={{ marginLeft: 8 }} onClick={() => speak(shown.prompt!)} aria-label="Произнести">🔊</button>
              )}
            </div>
          )}

          {shown.type === 'dialogue' && <DialoguePlayer lines={shown.lines ?? []} />}

          {shown.type === 'info' && <p className="exercise-explanation">{shown.explanation}</p>}

          {shown.type === 'flashcard' && (
            <>
              {/* On a repeat the Russian is the question, so it leads instead of trailing. */}
              <p
                className={answerHidden ? 'exercise-prompt' : 'exercise-explanation muted'}
                style={{ textAlign: 'center' }}
              >
                {shown.translation}
              </p>
              {answerHidden && (
                <p className="exercise-hint">Скажи про себя, как это будет {model.currentLanguage.adverb}</p>
              )}
              {shown.example && !answerHidden && <p className="exercise-hint learn"><em>{shown.example}</em></p>}
            </>
          )}

          {shown.type === 'translate' && (
            <AnswerField
              value={view.answer}
              placeholder="Напиши перевод…"
              disabled={locked}
              onChange={setAnswer}
              onSubmit={(value) => model.submitText(value)}
            />
          )}

          {shown.type === 'word_order' && (
            <WordOrderTray
              tokens={tokens}
              picked={view.picked}
              disabled={locked}
              onPick={(index) => setPicked([...picked, index])}
              onUnpick={(position) => setPicked(picked.filter((_, i) => i !== position))}
            />
          )}

          {shown.type === 'multiple_choice' && (
            <div style={{ marginTop: 14 }}>
              <ChoiceList>
                {(shown.options ?? []).map((value) => (
                  <Choice
                    key={value}
                    selected={view.option === value}
                    disabled={locked}
                    onSelect={() => setOption(value)}
                  >
                    {value}
                  </Choice>
                ))}
              </ChoiceList>
            </div>
          )}

          {shown.hint && !view.feedback && !past && <p className="exercise-hint">💡 {shown.hint}</p>}

          {result && (
            <Feedback
              verdict={result.verdict}
              note={result.verdict === 'typo' && result.typo
                ? result.typo === result.canonical
                  ? `Не хватает ударений: правильно «${result.typo}»`
                  : `Опечатка: правильно пишется «${result.typo}»`
                : undefined}
              answer={result.canonical}
              diff={mistakeHint(result.diff) ?? undefined}
            />
          )}
        </div>
      </div>

      {/* Between the card and the buttons on purpose: in the prototype he stood over
          "Дальше" and blocked the very tap he had just congratulated. */}
      <RhinoPop line={rhino} hat={hatFor(model.currentLanguage.code)} />

      {/* While a past step is up, the only thing on offer is the way back to the live
          one: nothing here submits, so the answer that was given cannot be given again. */}
      <div className="player-actions">
        {past && <PrimaryButton onClick={goForward}>Вперёд</PrimaryButton>}

        {!past && !feedback && exercise.type === 'dialogue' && (
          <PrimaryButton onClick={() => { remember(null); model.completePassive() }}>Дальше</PrimaryButton>
        )}
        {!past && !feedback && exercise.type === 'info' && (
          <PrimaryButton onClick={() => { remember(null); model.completePassive() }}>Понятно</PrimaryButton>
        )}
        {!past && !feedback && exercise.type === 'flashcard' && !recall && (
          <PrimaryButton onClick={() => { remember(null); model.completePassive() }}>Запомнил</PrimaryButton>
        )}
        {!past && !feedback && exercise.type === 'flashcard' && recall && !revealed && (
          <PrimaryButton onClick={() => { setRevealed(true); if (exercise.prompt) speak(exercise.prompt) }}>
            Показать
          </PrimaryButton>
        )}
        {/* Nobody but the learner knows whether the word actually came to mind, and an
            honest "нет" is what puts the card back into tomorrow's queue. */}
        {!past && !feedback && exercise.type === 'flashcard' && recall && revealed && (
          /* Self-assessment advances the session on the spot, which clears the feedback
             the mascot normally listens to — so this one calls him by hand. And it is the
             learner's own verdict that goes into the history, for the same reason. */
          <div className="row">
            <SecondaryButton onClick={() => { remember(selfVerdict(false, exercise)); model.selfAssess(false) }}>
              Не вспомнил
            </SecondaryButton>
            <PrimaryButton
              tone="mint"
              onClick={() => {
                remember(selfVerdict(true, exercise))
                model.selfAssess(true)
                setRhino({ state: 'celebrate', text: 'Помнишь!', id: Date.now() })
              }}
            >
              Вспомнил
            </PrimaryButton>
          </div>
        )}
        {!past && !feedback && exercise.type === 'translate' && (
          <PrimaryButton disabled={!answer.trim()} onClick={() => model.submitText(answer)}>Проверить</PrimaryButton>
        )}
        {!past && !feedback && exercise.type === 'word_order' && (
          <div className="row">
            <SecondaryButton disabled={picked.length === 0} onClick={() => setPicked([])}>Очистить</SecondaryButton>
            <PrimaryButton disabled={picked.length === 0} onClick={() => model.submitText(picked.map((i) => tokens[i]).join(' '))}>
              Проверить
            </PrimaryButton>
          </div>
        )}
        {!past && !feedback && exercise.type === 'multiple_choice' && (
          <PrimaryButton disabled={option === null} onClick={() => model.submitChoice(option!)}>Проверить</PrimaryButton>
        )}

        {!past && feedback && (
          <>
            <div className="row">
              {!feedback.isCorrect && !model.session.retryUsed && (
                <SecondaryButton onClick={() => { setAnswer(''); setPicked([]); setOption(null); model.retry() }}>
                  Ещё раз
                </SecondaryButton>
              )}
              <PrimaryButton
                tone={feedback.isCorrect ? 'mint' : 'accent'}
                onClick={() => { remember(); model.advance() }}
              >
                Дальше
              </PrimaryButton>
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
