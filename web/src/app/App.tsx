import { useEffect, useSyncExternalStore } from 'react'

import { downloadBackup } from './backup'
import { LanguagePicker } from './LanguagePicker'
import { Listening } from './Listening'
import { Loading } from './Loading'
import { MapScreen } from './Map'
import { Onboarding } from './Onboarding'
import { Player } from './Player'
import { Settings } from './Settings'
import { Shadowing } from './Shadowing'
import { Topics } from './Topics'
import { store } from './store'
import { AlertBar } from '../kit'
import type { AppStore } from './store'

export function useStore(): AppStore {
  useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
  return store
}

export function App() {
  const model = useStore()

  // A waiting version is applied as soon as the screen is calm — on launch that is
  // immediate, and during an exercise it waits until the exercise is over.
  useEffect(() => { model.applyUpdateIfIdle() })

  if (model.loading) return <Loading />
  // The picker comes before the error: a failed language must still be swappable.
  if (!model.languageChosen) return <div className="app"><LanguagePicker /></div>
  if (model.startupError) {
    return (
      <div className="center">
        <h1>Материалы не загрузились</h1>
        <p>{model.startupError}</p>
        <button className="primary" onClick={() => location.reload()}>Попробовать снова</button>
      </div>
    )
  }

  return (
    <div className="app">
      {/* Only ever seen mid-exercise: anywhere else the update has already applied itself. */}
      {model.updateReady && (
        <button className="update-bar" onClick={() => model.applyUpdateNow()}>
          Готова новая версия — обновится, когда закончишь. Или нажми, чтобы сейчас.
        </button>
      )}
      {/* Saving has stopped working. Silence here costs the learner everything they do
          next, so it is said plainly and the way out is one tap away. */}
      {model.storageFailed && (
        <AlertBar actionLabel="Сохранить файл" onAction={() => downloadBackup(model.state, model.language)}>
          Браузер больше не сохраняет прогресс — кончилось место.
        </AlertBar>
      )}
      {/* The picker outranks everything: it is reachable from onboarding too. */}
      {model.screen === 'language' ? <LanguagePicker onBack={() => model.closeLanguages()} />
        : model.isOnboarding ? <Onboarding />
        : model.shadowingActive ? <Shadowing />
        : model.listeningActive ? <Listening />
        : model.activeLesson ? <Player />
        : model.screen === 'settings' ? <Settings />
        : model.screen === 'topics' ? <Topics />
        : <MapScreen />}
    </div>
  )
}
