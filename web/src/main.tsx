import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './app/App'
import { syncPush } from './app/push'
import { store } from './app/store'
import { initServiceWorker } from './app/sw-update'
import { applyTheme, loadTheme } from './app/theme'
import './styles.css'

// Before the first paint, so the app never flashes another theme's background.
applyTheme(loadTheme())

void store.load().then(() => {
  // What the reminder server knows goes stale on its own: the timezone offset changes
  // twice a year, the language can be switched here, and a browser may replace the
  // subscription without telling anyone. One quiet re-send per launch keeps it true.
  const profile = store.state.profile
  if (profile?.remindersEnabled && store.language) {
    void syncPush(profile.reminderHour, store.language)
  }
})

// A new build installs itself in the background; the store decides when to switch to it.
const updater = initServiceWorker(() => store.onUpdateReady(() => updater.apply()))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
