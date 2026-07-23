import { useRef, useState } from 'react'

import { useStore } from './App'
import { PlacementTest } from './Placement'
import { LEVELS, exportBackup, importBackup } from '../core'
import type { CEFRLevel } from '../core'

export function Settings() {
  const model = useStore()
  const [placement, setPlacement] = useState<'closed' | 'running' | CEFRLevel>('closed')
  const [message, setMessage] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  if (placement === 'running') {
    return (
      <div className="sheet">
        <PlacementTest
          onFinish={(level) => setPlacement(level)}
          onSkip={() => setPlacement('closed')}
          skipTitle="Отменить тест"
        />
      </div>
    )
  }

  if (placement !== 'closed') {
    const level = placement
    return (
      <div className="sheet">
        <div className="center">
          <h1>Твой уровень — {level}</h1>
          <div className="big-level">{level}</div>
          <p>Маршрут переключится на этот уровень. Пройденные уроки останутся отмеченными.</p>
          <div className="stack">
            <button className="primary" onClick={() => { model.selectLevel(level); setPlacement('closed') }}>
              Перейти на {level}
            </button>
            <button className="secondary" onClick={() => setPlacement('closed')}>Оставить {model.selectedLevel}</button>
          </div>
        </div>
      </div>
    )
  }

  const saveBackup = () => {
    const url = URL.createObjectURL(exportBackup(model.state))
    const link = document.createElement('a')
    link.href = url
    link.download = 'english-coach-progress.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  const loadBackup = async (file: File) => {
    try {
      model.replaceState(importBackup(await file.text()))
      setMessage('Прогресс восстановлен.')
    } catch {
      setMessage('Не получилось прочитать файл.')
    }
  }

  return (
    <>
      <header className="header">
        <div className="header-top">
          <button className="icon-button" onClick={() => model.setScreen('map')} aria-label="Назад">‹</button>
          <h1 className="brand-title" style={{ flex: 1, textAlign: 'center' }}>Настройки</h1>
          <span style={{ width: 48 }} />
        </div>
      </header>

      <div className="scroll">
        <div className="settings-group">
          <div className="settings-row">
            <span className="label">Уровень</span>
            <div className="pills">
              {LEVELS.map((level) => (
                <button
                  key={level}
                  className={`pill${level === model.selectedLevel ? ' selected' : ''}`}
                  style={{ minWidth: 44, minHeight: 36 }}
                  onClick={() => model.selectLevel(level)}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
          {model.hasPlacementTest && (
            <button className="settings-row" onClick={() => { model.startPlacement(); setPlacement('running') }}>
              <span className="label">Тест на уровень</span>
              <span className="value">пройти заново ›</span>
            </button>
          )}
        </div>

        <div className="settings-group">
          <div className="settings-row">
            <span className="label">Цель в день</span>
            <div className="pills">
              {[5, 10, 15].map((minutes) => (
                <button
                  key={minutes}
                  className={`pill${minutes === model.dailyGoalMinutes ? ' selected' : ''}`}
                  style={{ minWidth: 44, minHeight: 36 }}
                  onClick={() => model.updateGoal(minutes)}
                >
                  {minutes}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="settings-group">
          <button className="settings-row" onClick={saveBackup}>
            <span className="label">Сохранить копию прогресса</span>
            <span className="value">файлом ›</span>
          </button>
          <button className="settings-row" onClick={() => fileInput.current?.click()}>
            <span className="label">Восстановить из копии</span>
            <span className="value">выбрать файл ›</span>
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) loadBackup(file)
              event.target.value = ''
            }}
          />
        </div>
        {message && <p className="settings-note">{message}</p>}
        <p className="settings-note">
          Safari может очистить данные сайтов, которыми давно не пользовались, поэтому копию стоит
          сохранять время от времени.
        </p>

        <div className="settings-group">
          <div className="settings-row">
            <span className="label">Всего очков</span>
            <span className="value">{model.totalPoints}</span>
          </div>
        </div>
      </div>
    </>
  )
}
