import { exportBackup } from '../core'
import type { LanguageCode, UserState } from '../core'

/**
 * Downloads the progress file. Shared by Settings and by the storage-full banner,
 * because the moment saving stops working is exactly when the file matters most.
 */
export function downloadBackup(state: UserState, language: LanguageCode | null): void {
  const url = URL.createObjectURL(exportBackup(state))
  const link = document.createElement('a')
  link.href = url
  // Named after the language, because each one is a separate record.
  link.download = `english-coach-progress-${language ?? 'en'}.json`
  link.click()
  URL.revokeObjectURL(url)
}
