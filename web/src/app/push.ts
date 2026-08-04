import { PUSH_ENDPOINT, PUSH_PUBLIC_KEY } from './push-config'
import type { LanguageCode } from '../core'

/**
 * Daily reminder on the phone.
 *
 * The browser cannot wake itself, so the reminder is a push from the worker in `server/`.
 * Everything else about the app stays offline: what travels is a subscription endpoint,
 * the hour and which language is being learnt — never progress or answers.
 *
 * On iOS this only works from the app installed to the Home Screen — Safari refuses
 * notification permission on a plain tab — so the state below says that out loud instead
 * of leaving a toggle that silently does nothing.
 *
 * The rule everything here follows: "включено" has to mean the server holds the
 * subscription. The browser-side subscription is created before the server is told about
 * it, so trusting that alone would report success for a request that never arrived.
 */

export type PushState =
  | 'ready'          // subscribed, and the server confirmed it
  | 'off'            // supported, not subscribed
  | 'failed'         // subscribed in the browser, but the server never confirmed
  | 'denied'         // the browser was told no
  | 'needs-install'  // iOS, opened as a tab rather than from the Home Screen
  | 'unsupported'    // no push in this browser at all
  | 'unconfigured'   // the worker URL is not filled in yet

/** The endpoint the worker answered 2xx for. Without it "включено" is a guess. */
const CONFIRMED = 'english-coach.push-confirmed'

const confirmed = (): string | null => {
  try { return localStorage.getItem(CONFIRMED) } catch { return null }
}

const remember = (endpoint: string | null): void => {
  try {
    if (endpoint) localStorage.setItem(CONFIRMED, endpoint)
    else localStorage.removeItem(CONFIRMED)
  } catch {
    // A blocked storage costs the badge, not the subscription.
  }
}

const standalone = (): boolean =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (window.navigator as { standalone?: boolean }).standalone === true

/** iPadOS calls itself "Macintosh", so it is told apart by touch rather than by name. */
const isIOS = (): boolean =>
  /iPhone|iPad|iPod/.test(navigator.userAgent) ||
  (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1)

export async function pushState(): Promise<PushState> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    // iOS shows push only to installed apps, so tell the truth about which wall it is.
    return isIOS() && !standalone() ? 'needs-install' : 'unsupported'
  }
  if (!PUSH_ENDPOINT) return 'unconfigured'
  if (Notification.permission === 'denied') return 'denied'
  const registration = await navigator.serviceWorker.getRegistration()
  const subscription = await registration?.pushManager.getSubscription()
  if (!subscription) return 'off'
  return confirmed() === subscription.endpoint ? 'ready' : 'failed'
}

/**
 * `navigator.serviceWorker.ready` never rejects. If the worker failed to install — a
 * dropped connection while precaching the courses, a private window — waiting on it
 * would hang the button forever with nothing on screen to explain why.
 */
async function activeRegistration(): Promise<ServiceWorkerRegistration | null> {
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise<null>((resolve) => { setTimeout(() => resolve(null), 10_000) }),
  ])
}

export async function enablePush(hour: number, language: LanguageCode): Promise<PushState> {
  // Permission is asked before any await: WebKit accepts the request only while the tap
  // that caused it is still fresh, and an await spends that window.
  if ('Notification' in window && Notification.permission === 'default') {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return permission === 'denied' ? 'denied' : 'off'
  }

  const state = await pushState()
  if (state !== 'off' && state !== 'ready' && state !== 'failed') return state
  if (Notification.permission !== 'granted') return 'denied'

  const registration = await activeRegistration()
  if (!registration) return 'failed'

  const subscription = await registration.pushManager.getSubscription()
    ?? await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: decodeKey(PUSH_PUBLIC_KEY),
    })

  try {
    const response = await fetch(`${PUSH_ENDPOINT}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription,
        hour,
        language,
        // The worker runs on UTC and has no idea where the phone is.
        offsetMinutes: new Date().getTimezoneOffset(),
      }),
    })
    if (!response.ok) {
      remember(null)
      return 'failed'
    }
  } catch {
    // A refused CORS request rejects rather than answering; either way the server did
    // not take the subscription, and reporting "включено" would be a lie.
    remember(null)
    return 'failed'
  }

  remember(subscription.endpoint)
  return 'ready'
}

/**
 * Once per launch, and only when permission has already been given, so it can never pop
 * a dialog. This is what keeps the server honest about the three things that drift: the
 * timezone offset (it changes twice a year), the language, and a subscription the browser
 * has quietly replaced.
 */
export async function syncPush(hour: number, language: LanguageCode): Promise<PushState> {
  const state = await pushState()
  if (state !== 'ready' && state !== 'failed' && state !== 'off') return state
  if (Notification.permission !== 'granted') return state
  return enablePush(hour, language)
}

export async function disablePush(): Promise<PushState> {
  remember(null)
  const registration = await navigator.serviceWorker.getRegistration()
  const subscription = await registration?.pushManager.getSubscription()
  if (!subscription) return 'off'
  await fetch(`${PUSH_ENDPOINT}/subscribe`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint: subscription.endpoint }),
  }).catch(() => {
    // Losing the server copy is not a reason to keep the browser subscribed.
  })
  await subscription.unsubscribe()
  return 'off'
}

/**
 * The subscribe call wants the key as raw bytes, not as the base64url string we ship.
 * Typed as ArrayBuffer because a `Uint8Array` over a `SharedArrayBuffer` is not a
 * `BufferSource` as far as the DOM types are concerned.
 */
function decodeKey(value: string): ArrayBuffer {
  const padded = (value + '='.repeat((4 - (value.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}
