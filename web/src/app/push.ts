import { PUSH_ENDPOINT, PUSH_PUBLIC_KEY } from './push-config'

/**
 * Daily reminder on the phone.
 *
 * The browser cannot wake itself, so the reminder is a push from the worker in `server/`.
 * Everything else about the app stays offline: what travels is a subscription endpoint
 * and the hour, never progress or answers.
 *
 * On iOS this only works from the app installed to the Home Screen — Safari refuses
 * notification permission on a plain tab — so the state below says that out loud instead
 * of leaving a toggle that silently does nothing.
 */

export type PushState =
  | 'ready'          // subscribed, reminders will arrive
  | 'off'            // supported, not subscribed
  | 'denied'         // the browser was told no
  | 'needs-install'  // iOS, opened as a tab rather than from the Home Screen
  | 'unsupported'    // no push in this browser at all
  | 'unconfigured'   // the worker URL is not filled in yet

const standalone = (): boolean =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (window.navigator as { standalone?: boolean }).standalone === true

export async function pushState(): Promise<PushState> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    // iOS shows push only to installed apps, so tell the truth about which wall it is.
    return /iPhone|iPad|iPod/.test(navigator.userAgent) && !standalone() ? 'needs-install' : 'unsupported'
  }
  if (!PUSH_ENDPOINT) return 'unconfigured'
  if (Notification.permission === 'denied') return 'denied'
  const registration = await navigator.serviceWorker.getRegistration()
  const subscription = await registration?.pushManager.getSubscription()
  return subscription ? 'ready' : 'off'
}

export async function enablePush(hour: number): Promise<PushState> {
  const state = await pushState()
  if (state !== 'off' && state !== 'ready') return state

  if (Notification.permission !== 'granted') {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return permission === 'denied' ? 'denied' : 'off'
  }

  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()
    ?? await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: decodeKey(PUSH_PUBLIC_KEY),
    })

  await fetch(`${PUSH_ENDPOINT}/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subscription,
      hour,
      // The worker runs on UTC and has no idea where the phone is.
      offsetMinutes: new Date().getTimezoneOffset(),
    }),
  })
  return 'ready'
}

export async function disablePush(): Promise<PushState> {
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
