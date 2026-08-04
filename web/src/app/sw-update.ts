import { registerSW } from 'virtual:pwa-register'

/**
 * Keeping the installed app up to date.
 *
 * What was wrong: `registerType: 'autoUpdate'` sounds like it updates by itself, but all
 * it does is put `skipWaiting` and `clientsClaim` into the service worker. The script the
 * plugin injected into the page was one line — `register()` on the `load` event — with no
 * update check and no reload. So a new build was fetched and activated, and the open page
 * went on running the JavaScript it had already parsed.
 *
 * On a phone that is worse than it sounds. An app opened from the Home Screen almost never
 * fires `load` again: iOS resumes it from a snapshot, so the registration code never runs
 * and no update is even looked for. That is how a build from two days earlier survived
 * three deploys.
 *
 * The fix is the two things that were missing: ask for an update whenever the app comes
 * back to the foreground, and actually reload once the new worker is ready.
 */

const HOUR = 60 * 60 * 1000

export interface UpdateHandle {
  /** Applies the waiting version and reloads the page. */
  apply: () => Promise<void>
}

export function initServiceWorker(onUpdateReady: () => void): UpdateHandle {
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh: onUpdateReady,
    onRegisteredSW(_url, registration) {
      if (!registration) return
      // `load` cannot be relied on, but coming back to the foreground can: iOS fires
      // `pageshow` when the snapshot is restored and `visibilitychange` on every switch
      // back to the app. Offline the check is pointless and only burns battery.
      const check = () => {
        if (document.visibilityState === 'visible' && navigator.onLine) void registration.update()
      }
      document.addEventListener('visibilitychange', check)
      window.addEventListener('pageshow', check)
      // For the case of an app left open all day.
      setInterval(check, HOUR)
      check()
    },
  })

  return { apply: () => updateSW(true) }
}
