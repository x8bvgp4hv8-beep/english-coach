import { useEffect, useSyncExternalStore } from 'react'

import { downloadBackup } from './backup'
import { Course } from './Course'
import { LanguagePicker } from './LanguagePicker'
import { Listening } from './Listening'
import { Loading } from './Loading'
import { Onboarding } from './Onboarding'
import { Player } from './Player'
import { Practice } from './Practice'
import { Progress } from './Progress'
import { Settings } from './Settings'
import { Shadowing } from './Shadowing'
import { TabBar } from './TabBar'
import { Today } from './Today'
import { Topics } from './Topics'
import { isTab, store } from './store'
import { AlertBar } from '../kit'
import { IconSprite } from '../kit/Icons'
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
    /* The tab is on the shell so the stylesheet can put that tab's sky behind it. */
    <div className="app" data-tab={isTab(model.screen) ? model.screen : undefined}>
      {/* Twenty-one line icons, defined once and referenced by everything below. */}
      <IconSprite />
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
        : model.screen === 'course' ? <Course />
        : model.screen === 'practice' ? <Practice />
        : model.screen === 'progress' ? <Progress />
        : <Today />}

      {/* Only over the four peers. A lesson keeps the screen to itself so that leaving
          one is a decision rather than a mis-tap near the bottom edge. */}
      {isTab(model.screen) && !model.isOnboarding && !model.isBusy && <TabBar model={model} />}
    </div>
  )
}
