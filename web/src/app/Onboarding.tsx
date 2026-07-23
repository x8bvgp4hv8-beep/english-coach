import { useState } from 'react'

import { useStore } from './App'
import { PlacementTest } from './Placement'
import { LEVELS } from '../core'
import type { CEFRLevel } from '../core'

type Stage = 'intro' | 'placement' | 'result' | 'level' | 'goal'

export function Onboarding() {
  const model = useStore()
  const [stage, setStage] = useState<Stage>('intro')
  const [level, setLevel] = useState<CEFRLevel>('A1')
  const [goal, setGoal] = useState(10)

  if (stage === 'placement') {
    return (
      <PlacementTest
        onFinish={(recommended) => { setLevel(recommended); setStage('result') }}
        onSkip={() => setStage('level')}
      />
    )
  }

  return (
    <div className="center">
      <div className="hero-mark">💬</div>

      {stage === 'intro' && (
        <>
          <h1>Привет! Настроим уровень</h1>
          <p>Короткий тест подберёт, с чего начать. Или выбери уровень сам.</p>
          <div className="stack">
            {model.hasPlacementTest && (
              <button className="primary" onClick={() => { model.startPlacement(); setStage('placement') }}>
                Пройти тест на уровень
              </button>
            )}
            <button className="secondary" onClick={() => setStage('level')}>Выбрать уровень сам</button>
          </div>
        </>
      )}

      {stage === 'result' && (
        <>
          <h1>Твой уровень — {level}</h1>
          <div className="big-level">{level}</div>
          <p>Начнём отсюда. Когда станет легко, приложение само предложит перейти выше.</p>
          <div className="stack">
            <button className="primary" onClick={() => setStage('goal')}>Продолжить</button>
            <button className="secondary" onClick={() => setStage('level')}>Выбрать другой уровень</button>
          </div>
        </>
      )}

      {stage === 'level' && (
        <>
          <h1>Выбери уровень</h1>
          <p>A1 — с нуля, C1 — свободно. Уровень можно поменять в любой момент.</p>
          <div className="pills">
            {LEVELS.map((item) => (
              <button key={item} className={`pill${item === level ? ' selected' : ''}`} onClick={() => setLevel(item)}>
                {item}
              </button>
            ))}
          </div>
          <button className="primary" onClick={() => setStage('goal')}>Продолжить</button>
        </>
      )}

      {stage === 'goal' && (
        <>
          <h1>Сколько минут в день?</h1>
          <p>Небольшие регулярные шаги работают лучше марафонов.</p>
          <div className="pills">
            {[5, 10, 15].map((minutes) => (
              <button key={minutes} className={`pill${goal === minutes ? ' selected' : ''}`} onClick={() => setGoal(minutes)}>
                {minutes} мин
              </button>
            ))}
          </div>
          <button className="primary" onClick={() => model.completeOnboarding(level, goal)}>Открыть маршрут</button>
        </>
      )}

      <p style={{ fontSize: 12 }}>Без аккаунта · Без подписки · Работает офлайн</p>
    </div>
  )
}
