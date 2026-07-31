import { useEffect, useRef, useState } from 'react'

import { useStore } from './App'
import { PlacementTest } from './Placement'
import { disablePush, enablePush, pushState } from './push'
import { THEMES, applyTheme, loadTheme } from './theme'
import type { PushState } from './push'
import { LEVELS, exportBackup, importBackup } from '../core'
import type { CEFRLevel } from '../core'
import type { ThemeID } from './theme'

/** Three fills apiece: background, card, accent. Enough to choose by eye. */
const SWATCH: Record<ThemeID, string[]> = {
  cartoon: ['#f7ecdd', '#fffdf9', '#f26a3d'],
  minimal: ['#f1f1f5', '#ffffff', '#14121f'],
  night: ['#16123a', '#2a2555', '#7b6ff0'],
}

export function Settings() {
  const model = useStore()
  const [placement, setPlacement] = useState<'closed' | 'running' | CEFRLevel>('closed')
  const [message, setMessage] = useState<string | null>(null)
  const [theme, setTheme] = useState(loadTheme)
  const [push, setPush] = useState<PushState | null>(null)
  const [reminderHour, setReminderHour] = useState(model.state.profile?.reminderHour ?? 19)

  useEffect(() => { pushState().then(setPush) }, [])
  const fileInput = useRef<HTMLInputElement>(null)

  const chooseTheme = (id: ThemeID) => { applyTheme(id); setTheme(id) }

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
        <div className="section-title" style={{ marginTop: 18 }}>
          <h2>Оформление</h2>
          <p>Меняется вид, а не содержание: уроки, прогресс и повторения остаются те же.</p>
        </div>
        <div className="themes">
          {THEMES.map((item) => (
            <button
              key={item.id}
              className={`theme-card${theme === item.id ? ' selected' : ''}`}
              onClick={() => chooseTheme(item.id)}
            >
              <span className="theme-swatch">
                {SWATCH[item.id].map((fill) => <i key={fill} style={{ background: fill }} />)}
              </span>
              <span className="theme-name">{item.title}</span>
              <span className="theme-note">{item.note}</span>
            </button>
          ))}
        </div>

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

        <div className="section-title"><h2>Напоминание</h2></div>
        <div className="settings-group">
          <div className="settings-row">
            <span className="label">Каждый день в {String(reminderHour).padStart(2, '0')}:00</span>
            <span className="value">
              {push === 'ready' ? 'включено' : push === 'off' ? 'выключено'
                : push === 'denied' ? 'запрещено браузером'
                : push === 'needs-install' ? 'нужен ярлык на экране «Домой»'
                : push === 'unconfigured' ? 'сервер не подключён'
                : push === null ? '…' : 'не поддерживается'}
            </span>
          </div>
          {(push === 'ready' || push === 'off') && (
            <>
              <div className="settings-row">
                <span className="label">Час</span>
                <div className="pills">
                  {[8, 13, 19, 21].map((hour) => (
                    <button
                      key={hour}
                      className={`pill${hour === reminderHour ? ' selected' : ''}`}
                      style={{ minWidth: 44, minHeight: 36 }}
                      onClick={async () => {
                        setReminderHour(hour)
                        if (push === 'ready') setPush(await enablePush(hour))
                      }}
                    >
                      {hour}
                    </button>
                  ))}
                </div>
              </div>
              <button
                className="settings-row"
                onClick={async () => setPush(push === 'ready' ? await disablePush() : await enablePush(reminderHour))}
              >
                <span className="label">{push === 'ready' ? 'Выключить напоминание' : 'Включить напоминание'}</span>
                <span className="value">›</span>
              </button>
            </>
          )}
        </div>
        {push === 'needs-install' && (
          <p className="settings-note">
            На iPhone уведомления работают только у приложения с экрана «Домой»: открой сайт в Safari,
            «Поделиться» → «На экран „Домой“», и запусти с иконки.
          </p>
        )}
        {push === 'denied' && (
          <p className="settings-note">
            Браузер запомнил отказ. Разрешить снова можно в настройках сайта или приложения.
          </p>
        )}

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
