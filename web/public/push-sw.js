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
    data: { url: payload.url },
  }))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const target = event.notification.data?.url ?? './'
  event.waitUntil((async () => {
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    // Reuse the open app instead of stacking another copy of it.
    for (const client of clients) {
      if ('focus' in client) return client.focus()
    }
    return self.clients.openWindow(target)
  })())
})
