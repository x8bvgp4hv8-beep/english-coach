import { useEffect, useRef, useState } from 'react'

import { useStore } from './App'
import { PlacementTest } from './Placement'
import { disablePush, enablePush, pushState } from './push'
import { chooseVoice, chosenVoiceName, speak, voicesFor } from './speech'
import { THEMES, applyTheme, loadTheme } from './theme'
import type { PushState } from './push'
import { COMMON_COUNTRIES, LEVELS, importBackup } from '../core'
import { downloadBackup } from './backup'
import type { CEFRLevel, LanguageCode } from '../core'
import type { ThemeID } from './theme'

/**
 * Three fills apiece: background, card, accent. Enough to choose by eye — which means
 * the accent has to be the one the language actually paints with, or the swatch would
 * promise indigo and hand back terracotta.
 */
const SWATCH: Record<LanguageCode, Record<ThemeID, string[]>> = {
  en: {
    cartoon: ['#f7ecdd', '#fffdf9', '#f26a3d'],
    minimal: ['#f1f1f5', '#ffffff', '#14121f'],
    night: ['#16123a', '#2a2555', '#7b6ff0'],
  },
  es: {
    cartoon: ['#fdf1e2', '#fffdf9', '#d2431f'],
    minimal: ['#f1f1f5', '#ffffff', '#b8482a'],
    night: ['#2a1220', '#3a1f2a', '#f0894a'],
  },
}

export function Settings() {
  const model = useStore()
  const [own, setOwn] = useState('')
  const [placement, setPlacement] = useState<'closed' | 'running' | CEFRLevel>('closed')
  const [message, setMessage] = useState<string | null>(null)
  const [theme, setTheme] = useState(loadTheme)
  const [push, setPush] = useState<PushState | null>(null)
  const reminderHour = model.state.profile?.reminderHour ?? 19
  const [updateNote, setUpdateNote] = useState<string | null>(null)
  // Голоса подгружаются асинхронно, поэтому список приходится дождаться.
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [voiceName, setVoiceName] = useState<string | null>(null)

  /** The manual escape hatch: the app checks on every foreground, but this says so out loud. */
  const checkForUpdate = async () => {
    if (model.updateReady) { model.applyUpdateNow(); return }
    setUpdateNote('проверяю…')
    const registration = await navigator.serviceWorker?.getRegistration()
    await registration?.update()
    // A found update arrives through onNeedRefresh, which flips `updateReady`.
    setTimeout(() => setUpdateNote(model.updateReady ? 'есть новая версия' : 'установлена последняя'), 1500)
  }

  useEffect(() => { pushState().then(setPush) }, [])
  useEffect(() => {
    const load = () => { setVoices(voicesFor()); setVoiceName(chosenVoiceName()) }
    load()
    if ('speechSynthesis' in window) speechSynthesis.addEventListener('voiceschanged', load)
    return () => { if ('speechSynthesis' in window) speechSynthesis.removeEventListener('voiceschanged', load) }
  }, [model.language])
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

  const saveBackup = () => downloadBackup(model.state, model.language)

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
          <button className="icon-button" onClick={() => model.goBack()} aria-label="Назад">‹</button>
          <h1 className="brand-title" style={{ flex: 1, textAlign: 'center' }}>Настройки</h1>
          <span style={{ width: 48 }} />
        </div>
      </header>

      <div className="scroll">
        <div className="settings-group" style={{ marginTop: 18 }}>
          <button className="settings-row" onClick={() => model.openLanguages()}>
            <span className="label">Язык</span>
            <span className="value">{model.currentLanguage.title} ›</span>
          </button>
        </div>

        {voices.length > 0 && (
          <>
            <div className="section-title">
              <h2>Голос</h2>
              <p>Им читаются карточки и упражнения на слух. Нажми, чтобы послушать и выбрать.</p>
            </div>
            <div className="settings-group">
              {voices.map((item) => (
                <button
                  key={item.name}
                  className="settings-row"
                  onClick={() => {
                    chooseVoice(item.name)
                    setVoiceName(item.name)
                    speak(model.currentLanguage.greeting)
                  }}
                >
                  <span className="label">{item.name.split(' (')[0]}</span>
                  <span className="value">{item.name === voiceName ? 'выбран ✓' : 'послушать ›'}</span>
                </button>
              ))}
            </div>
            <p className="settings-note">
              Все голоса на этом устройстве — облегчённые, поэтому звучат механически. Живой голос
              скачивается отдельно и один раз: на iPhone — Настройки → Универсальный доступ →
              Устный контент → Голоса, на Маке — Системные настройки → Универсальный доступ →
              Устная речь → Системный голос → «Управление голосами». Там у нужного языка выбери
              вариант с пометкой Enhanced или Premium.
            </p>
          </>
        )}

        <div className="section-title">
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
                {SWATCH[model.language ?? 'en'][item.id].map((fill) => <i key={fill} style={{ background: fill }} />)}
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
          <p className="level-size">{model.levelSize(model.selectedLevel)}</p>
          {model.hasPlacementTest && (
            <button className="settings-row" onClick={() => { model.startPlacement(); setPlacement('running') }}>
              <span className="label">Тест на уровень</span>
              <span className="value">пройти заново ›</span>
            </button>
          )}
        </div>

        {/* Курс говорит «я из …» словами того, кто его проходит. Пока страна не выбрана,
            в упражнениях стоит чужая для примера — и это видно по подписи. */}
        <div className="settings-group">
          <div className="settings-row" style={{ display: 'block', paddingTop: 12, paddingBottom: 12 }}>
            <span className="label">Откуда ты</span>
            <div className="pills" style={{ marginTop: 10 }}>
              {COMMON_COUNTRIES.map((item) => (
                <button
                  key={item.country}
                  className={`pill${model.home.country === item.country ? ' selected' : ''}`}
                  style={{ minHeight: 36 }}
                  onClick={() => model.setHome(item)}
                >
                  {item.title}
                </button>
              ))}
            </div>
            <input
              className="answer-field home-input"
              value={own}
              placeholder="Другая страна — по-английски"
              onChange={(event) => setOwn(event.target.value)}
              onBlur={() => { if (own.trim()) model.setHome({ country: own.trim(), city: '' }) }}
            />
          </div>
        </div>
        <p className="settings-note">
          {model.homeIsSet
            ? `Упражнения про себя говорят «${model.home.country}» — так, как сказал бы ты.`
            : 'Пока страна не выбрана, в упражнениях стоит чужая для примера.'}
        </p>

        <div className="settings-group">
          <div className="settings-row">
            <span className="label">Цель в день</span>
            <div className="pills">
              {/* The same three the route was built from, so a goal picked at the start
                  can still be picked here. */}
              {[5, 10, 20].map((minutes) => (
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
                : push === 'failed' ? 'сервер не принял — попробуй ещё раз'
                : push === null ? '…' : 'не поддерживается'}
            </span>
          </div>
          {(push === 'ready' || push === 'off' || push === 'failed') && (
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
                        model.updateReminder(hour, push === 'ready')
                        if (push === 'ready') setPush(await enablePush(hour, model.language ?? 'en'))
                      }}
                    >
                      {hour}
                    </button>
                  ))}
                </div>
              </div>
              <button
                className="settings-row"
                onClick={async () => {
                  const next = push === 'ready'
                    ? await disablePush()
                    : await enablePush(reminderHour, model.language ?? 'en')
                  // The switch follows what the server actually accepted, not the tap.
                  model.updateReminder(reminderHour, next === 'ready')
                  setPush(next)
                }}
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
        {push === 'failed' && (
          <p className="settings-note">
            Браузер подписался, а сервер напоминаний не ответил. Уведомления не придут, пока
            это не получится — нажми «Включить напоминание» ещё раз.
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
          Копия относится к текущему языку ({model.currentLanguage.title.toLowerCase()}): у второго языка
          свой прогресс и своя копия. Safari может очистить данные сайтов, которыми давно не пользовались,
          поэтому копию стоит сохранять время от времени.
        </p>

        <div className="settings-group">
          <div className="settings-row">
            <span className="label">Всего очков</span>
            <span className="value">{model.totalPoints}</span>
          </div>
          {/* So "какая у меня версия и почему старая" is one look, not an investigation. */}
          <div className="settings-row">
            <span className="label">Версия сборки</span>
            <span className="value">{__BUILD_ID__}</span>
          </div>
          <button className="settings-row" onClick={checkForUpdate}>
            <span className="label">Проверить обновление</span>
            <span className="value">{updateNote ?? '›'}</span>
          </button>
        </div>
      </div>
    </>
  )
}
