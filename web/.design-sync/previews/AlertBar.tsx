import { AlertBar } from 'english-coach-web'

/**
 * Reserved for state the app cannot recover from on its own. Silence here costs the
 * learner everything they do next, so it is said plainly and the way out is one tap away.
 */
export function StorageFull() {
  return (
    <div style={{ width: 380 }}>
      <AlertBar actionLabel="Сохранить файл">
        Браузер больше не сохраняет прогресс — кончилось место.
      </AlertBar>
    </div>
  )
}

/** Nothing to be done about it: the bar states the fact and offers no false button. */
export function WithoutAction() {
  return (
    <div style={{ width: 380 }}>
      <AlertBar>Микрофон недоступен — речь вслух в этом браузере не работает.</AlertBar>
    </div>
  )
}
