import { useEffect, useRef, useState } from 'react'

import { useStore } from './App'
import { plural } from './plural'
import { Icon } from '../kit/Icons'
import { PrimaryButton, SecondaryButton } from '../kit'

/**
 * Контрольный срез: двадцать переводов, которых в курсе нет.
 *
 * Экран нарочно скучный и без наград. Это замер, а не тренировка: ни очков, ни серии,
 * ни «молодец». Подсказок тоже нет — иначе замер перестал бы что-либо значить. Верный
 * ответ показывается после проверки, потому что скрывать его от человека, который уже
 * ответил, незачем.
 */
export function Checkup() {
  const model = useStore()
  const item = model.currentCheckupItem
  const verdict = model.checkupVerdict
  const [answer, setAnswer] = useState('')
  const field = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (verdict) return
    setAnswer('')
    field.current?.focus()
  }, [item?.id, verdict])

  if (model.checkupIsComplete || !item) {
    const share = model.checkupTotal > 0 ? Math.round((model.checkupCorrect / model.checkupTotal) * 100) : 0
    const change = model.checkupChange
    return (
      <div className="center">
        <p className="done-kicker">КОНТРОЛЬНЫЙ СРЕЗ</p>
        <h1>{model.checkupCorrect} из {model.checkupTotal}</h1>
        <p>
          {share}% на предложениях, которых в курсе нет.
          {change === null
            ? ' Это первый замер — сравнивать пока не с чем. Повторите через месяц.'
            : change > 0
              ? ` На ${change} ${plural(change, 'пункт', 'пункта', 'пунктов')} выше прошлого раза.`
              : change < 0
                ? ` На ${Math.abs(change)} ${plural(Math.abs(change), 'пункт', 'пункта', 'пунктов')} ниже прошлого раза.`
                : ' Столько же, сколько в прошлый раз.'}
        </p>
        <div className="stack">
          <PrimaryButton onClick={() => model.closeCheckup()}>Готово</PrimaryButton>
        </div>
      </div>
    )
  }

  const submit = () => {
    if (verdict) { model.nextCheckup(); return }
    if (!answer.trim()) return
    model.answerCheckup(answer)
  }

  return (
    <>
      <header className="player-bar">
        <button className="icon-button" onClick={() => model.closeCheckup()} aria-label="Закрыть">
          <Icon name="close" size={20} />
        </button>
        <span className="player-title">Контрольный срез</span>
        <span className="player-count">{model.checkupIndex + 1} / {model.checkupTotal}</span>
      </header>

      <div className="scroll">
        <p className="checkup-note">Переведите. Подсказок нет — это замер, а не тренировка.</p>
        <div className="checkup-card">
          <span className="checkup-prompt">{item.prompt}</span>
        </div>

        <input
          ref={field}
          className={`verb-input${verdict ? (verdict.correct ? ' ok' : ' bad') : ''}`}
          value={verdict ? verdict.answer : answer}
          onChange={(event) => setAnswer(event.target.value)}
          onKeyDown={(event) => { if (event.key === 'Enter') submit() }}
          disabled={Boolean(verdict)}
          autoCapitalize="none" autoCorrect="off" spellCheck={false}
          lang="en" placeholder="По-английски"
        />

        {verdict && (
          <div className="checkup-verdict">
            <p className={verdict.correct ? 'checkup-ok' : 'checkup-bad'}>
              {verdict.correct ? 'Верно' : 'Неверно'}
            </p>
            {!verdict.correct && <p className="checkup-right" lang="en">{item.canonicalAnswer}</p>}
          </div>
        )}

        <div className="verb-foot">
          <PrimaryButton onClick={submit} disabled={!verdict && !answer.trim()}>
            {verdict ? 'Дальше' : 'Проверить'}
          </PrimaryButton>
          {!verdict && (
            <SecondaryButton onClick={() => model.answerCheckup('')}>Не знаю</SecondaryButton>
          )}
        </div>
      </div>
    </>
  )
}
