import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './app/App'
import { store } from './app/store'
import { initServiceWorker } from './app/sw-update'
import { applyTheme, loadTheme } from './app/theme'
import './styles.css'

// Before the first paint, so the app never flashes another theme's background.
applyTheme(loadTheme())
store.load()

// A new build installs itself in the background; the store decides when to switch to it.
const updater = initServiceWorker(() => store.onUpdateReady(() => updater.apply()))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
