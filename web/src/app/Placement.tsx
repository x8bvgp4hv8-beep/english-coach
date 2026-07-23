import { useState } from 'react'

import { useStore } from './App'
import type { CEFRLevel } from '../core'

/**
 * The placement questions themselves. Used by onboarding and by "пройти заново"
 * in settings, so the question bank is not a first-run-only resource.
 */
export function PlacementTest({ onFinish, onSkip, skipTitle = 'Пропустить и выбрать уровень' }: {
  onFinish: (level: CEFRLevel) => void
  onSkip: () => void
  skipTitle?: string
}) {
  const model = useStore()
  const [picked, setPicked] = useState<string | null>(null)
  const question = model.currentPlacementQuestion
  if (!question) return null

  const answer = () => {
    if (picked === null) return
    model.answerPlacement(picked)
    setPicked(null)
    if (model.placementFinished) onFinish(model.placementRecommendedLevel)
  }

  return (
    <div className="center">
      <div>
        <div className="brand-kicker">ВОПРОС {model.placementIndex + 1}</div>
        <div className="bar" style={{ margin: '10px 0 8px' }}>
          <span style={{ width: `${model.placementProgress * 100}%`, background: 'var(--violet)' }} />
        </div>
        <p style={{ fontSize: 12 }}>Вопросы усложняются. Тест закончится, как только уровень станет ясен.</p>
      </div>
      <h1>{question.prompt}</h1>
      <div className="choices">
        {question.options.map((option) => (
          <button
            key={option}
            className={`choice${picked === option ? ' selected' : ''}`}
            onClick={() => setPicked(option)}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="stack">
        <button className="primary" disabled={picked === null} onClick={answer}>Ответить</button>
        <button className="quiet" onClick={() => { model.cancelPlacement(); onSkip() }}>{skipTitle}</button>
      </div>
    </div>
  )
}
