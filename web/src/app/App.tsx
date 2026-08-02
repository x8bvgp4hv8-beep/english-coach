import { useSyncExternalStore } from 'react'

import { Listening } from './Listening'
import { Loading } from './Loading'
import { MapScreen } from './Map'
import { Onboarding } from './Onboarding'
import { Player } from './Player'
import { Settings } from './Settings'
import { Shadowing } from './Shadowing'
import { Topics } from './Topics'
import { store } from './store'
import type { AppStore } from './store'

export function useStore(): AppStore {
  useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
  return store
}

export function App() {
  const model = useStore()

  if (model.loading) return <Loading />
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
        : model.shadowingActive ? <Shadowing />
        : model.listeningActive ? <Listening />
        : model.activeLesson ? <Player />
        : model.screen === 'settings' ? <Settings />
        : model.screen === 'topics' ? <Topics />
        : <MapScreen />}
    </div>
  )
}
