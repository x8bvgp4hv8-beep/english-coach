import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './app/App'
import { store } from './app/store'
import { applyTheme, loadTheme } from './app/theme'
import './styles.css'

// Before the first paint, so the app never flashes another theme's background.
applyTheme(loadTheme())
store.load()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
