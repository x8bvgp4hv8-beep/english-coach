// Imported into the generated service worker (see workbox.importScripts in vite.config.ts).
// Workbox owns caching; this file owns the two events it does not handle.

self.addEventListener('push', (event) => {
  let payload = { title: 'English Coach', body: 'Пора заниматься.', url: './' }
  try {
    if (event.data) payload = { ...payload, ...event.data.json() }
  } catch {
    // A push without a readable body is still worth showing.
  }
  event.waitUntil(self.registration.showNotification(payload.title, {
    body: payload.body,
    icon: './icons/icon-192.png',
    badge: './icons/icon-192.png',
    tag: 'daily-practice',
    // The tag makes each day replace the day before instead of piling up; without
    // renotify that replacement is silent, so a reminder left unread in the shade
    // would swallow every following one.
    renotify: true,
    data: { url: payload.url },
  }))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  // The address arrives from the server, so it is not allowed outside our own scope:
  // the app lives in a subfolder, and a bare '/' would land on someone else's root.
  const scope = self.registration.scope
  let target = scope
  try {
    const asked = new URL(event.notification.data?.url ?? './', scope).href
    if (asked.startsWith(scope)) target = asked
  } catch {
    // Keep the scope root.
  }
  event.waitUntil((async () => {
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    // Reuse the open app instead of stacking another copy of it.
    for (const client of clients) {
      if (client.url.startsWith(scope) && 'focus' in client) return client.focus()
    }
    return self.clients.openWindow(target)
  })())
})
