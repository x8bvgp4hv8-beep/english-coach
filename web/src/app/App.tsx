import { useSyncExternalStore } from 'react'

import { MapScreen } from './Map'
import { Onboarding } from './Onboarding'
import { Player } from './Player'
import { Settings } from './Settings'
import { store } from './store'
import type { AppStore } from './store'

export function useStore(): AppStore {
  useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
  return store
}

export function App() {
  const model = useStore()

  if (model.loading) return <div className="center-note">Загружаем уроки…</div>
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
      {model.isOnboarding ? <Onboarding />
        : model.activeLesson ? <Player />
        : model.screen === 'settings' ? <Settings />
        : <MapScreen />}
    </div>
  )
}
