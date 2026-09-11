import { useEffect, useRef, useState } from 'react'

import { useStore } from './App'
import { speak } from './speech'
import { plural } from './plural'
import { Icon } from '../kit/Icons'
import { PrimaryButton, SecondaryButton } from '../kit'

/**
 * Формы неправильного глагола: показана первая, спрашиваются вторая и третья.
 *
 * Два поля, а не два экрана: вторая и третья форма запоминаются парой, и разносить их
 * значило бы спрашивать половину того, что человек держит в голове. Ответ проверяется
 * целиком, но разбор показывается по полям — видно, какая именно форма не вышла.
 *
 * Промах не закрывает глагол: он уходит в конец очереди и вернётся в этом же заходе.
 * Поэтому счётчик снизу говорит «осталось», а не «вопрос N из M» — с возвратами второе
 * было бы неправдой.
 */
export function VerbForms() {
  const model = useStore()
  const verb = model.currentVerb
  const verdict = model.verbFormsVerdict
  const [past, setPast] = useState('')
  const [participle, setParticiple] = useState('')
  const pastField = useRef<HTMLInputElement>(null)

  // Новый глагол — чистые поля и курсор в первом: дрилл идёт с клавиатуры, без мыши.
  useEffect(() => {
    if (verdict) return
    setPast('')
    setParticiple('')
    pastField.current?.focus()
  }, [verb?.infinitive, verdict])

  if (model.verbFormsIsComplete || !verb) {
    return (
      <div className="center">
        <p className="done-kicker">ФОРМЫ ГЛАГОЛОВ</p>
        <h1>{model.verbFormsDone === model.verbFormsTotal ? 'Готово, все с первого раза' : 'Готово'}</h1>
        <p>
          {model.verbFormsDone} из {model.verbFormsTotal}{' '}
          {plural(model.verbFormsTotal, 'глагола', 'глаголов', 'глаголов')} с первого раза.
          {model.verbFormsDone < model.verbFormsTotal && ' Остальные вернулись и вышли со второго.'}
        </p>
        <div className="stack">
          <PrimaryButton onClick={() => model.startVerbForms()}>Ещё пачку</PrimaryButton>
          <SecondaryButton onClick={() => model.closeVerbForms()}>Закончить</SecondaryButton>
        </div>
      </div>
    )
  }

  const submit = () => {
    if (verdict) { model.nextVerb(); return }
    if (!past.trim() || !participle.trim()) return
    model.answerVerbForms(past, participle)
  }

  return (
    <>
      <header className="player-bar">
        <button className="icon-button" onClick={() => model.closeVerbForms()} aria-label="Закрыть">
          <Icon name="close" size={20} />
        </button>
        <span className="player-title">Формы глагола</span>
        <span className="player-count">осталось {model.verbFormsLeft}</span>
      </header>

      <div className="scroll">
        <div className="verb-card">
          <span className="verb-kicker">ВТОРАЯ И ТРЕТЬЯ ФОРМА</span>
          <span className="verb-infinitive" lang="en">
            {verb.infinitive}
            <button
              className="verb-speak"
              onClick={() => speak(verb.infinitive)}
              aria-label="Послушать"
            >
              <Icon name="audio" size={16} />
            </button>
          </span>
          {verb.meaning && <span className="verb-meaning">{verb.meaning}</span>}
        </div>

        <div className="verb-fields">
          <label className="verb-field">
            <span className="verb-label">Вторая (Past Simple)</span>
            <input
              ref={pastField}
              className={fieldClass(verdict?.past)}
              value={past}
              onChange={(event) => setPast(event.target.value)}
              onKeyDown={(event) => { if (event.key === 'Enter') submit() }}
              disabled={Boolean(verdict)}
              autoCapitalize="none" autoCorrect="off" spellCheck={false}
              lang="en" placeholder="went"
            />
            {verdict && !verdict.past && <span className="verb-right" lang="en">{verb.past}</span>}
          </label>

          <label className="verb-field">
            <span className="verb-label">Третья (Past Participle)</span>
            <input
              className={fieldClass(verdict?.participle)}
              value={participle}
              onChange={(event) => setParticiple(event.target.value)}
              onKeyDown={(event) => { if (event.key === 'Enter') submit() }}
              disabled={Boolean(verdict)}
              autoCapitalize="none" autoCorrect="off" spellCheck={false}
              lang="en" placeholder="gone"
            />
            {verdict && !verdict.participle && <span className="verb-right" lang="en">{verb.participle}</span>}
          </label>
        </div>

        {verdict && (
          <p className={`verb-verdict${verdict.past && verdict.participle ? ' ok' : ''}`}>
            {verdict.past && verdict.participle
              ? 'Верно.'
              : 'Не вышло — глагол вернётся в конце пачки.'}
          </p>
        )}

        <div className="verb-foot">
          <PrimaryButton onClick={submit} disabled={!verdict && (!past.trim() || !participle.trim())}>
            {verdict ? 'Дальше' : 'Проверить'}
          </PrimaryButton>
        </div>
      </div>
    </>
  )
}

/** Поле красится только после проверки: до неё раскраска — это подсказка. */
function fieldClass(correct: boolean | undefined): string {
  if (correct === undefined) return 'verb-input'
  return `verb-input ${correct ? 'ok' : 'bad'}`
}
