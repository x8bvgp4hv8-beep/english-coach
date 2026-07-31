/**
 * Daily reminders for the phone client.
 *
 * The whole app is offline; this is its only networked part, and it exists for one
 * reason: a browser cannot wake itself up. A push has to arrive from outside, so
 * something has to be awake at the right hour and send it.
 *
 * It stores browser subscriptions and nothing else. No progress, no answers, no account:
 * a subscription is an opaque endpoint plus two keys, and it is deleted the moment the
 * push service says the browser is gone.
 */

const LINES = [
  'Десять минут английского — и день засчитан.',
  'Повторения ждут: то, что забывается, возвращается сегодня.',
  'Пара фраз вслух — это больше, чем ноль.',
  'Займёмся? Урок короче, чем очередь за кофе.',
]

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') ?? ''
    const cors = {
      'Access-Control-Allow-Origin': allowed(origin, env) ? origin : 'null',
      'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors })
    if (!allowed(origin, env)) return json({ error: 'origin' }, 403, cors)

    const url = new URL(request.url)
    if (url.pathname !== '/subscribe') return json({ error: 'not found' }, 404, cors)

    if (request.method === 'POST') {
      const body = await request.json().catch(() => null)
      if (!body?.subscription?.endpoint) return json({ error: 'subscription' }, 400, cors)
      // The hour is the learner's local one; the worker runs hourly and matches it.
      const hour = Number.isInteger(body.hour) ? Math.min(23, Math.max(0, body.hour)) : 19
      await env.SUBSCRIPTIONS.put(key(body.subscription.endpoint), JSON.stringify({
        subscription: body.subscription,
        hour,
        offsetMinutes: Number.isInteger(body.offsetMinutes) ? body.offsetMinutes : 0,
      }))
      return json({ ok: true }, 200, cors)
    }

    if (request.method === 'DELETE') {
      const body = await request.json().catch(() => null)
      if (!body?.endpoint) return json({ error: 'endpoint' }, 400, cors)
      await env.SUBSCRIPTIONS.delete(key(body.endpoint))
      return json({ ok: true }, 200, cors)
    }

    return json({ error: 'method' }, 405, cors)
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(sendDue(env, new Date(event.scheduledTime)))
  },
}

const allowed = (origin, env) => Boolean(origin) && (env.ALLOWED_ORIGINS ?? '').split(',').includes(origin)
const key = (endpoint) => `sub:${endpoint}`
const json = (body, status, headers) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } })

async function sendDue(env, now) {
  const list = await env.SUBSCRIPTIONS.list({ prefix: 'sub:' })
  const line = LINES[Math.floor(now.getTime() / 86_400_000) % LINES.length]

  for (const entry of list.keys) {
    const raw = await env.SUBSCRIPTIONS.get(entry.name)
    if (!raw) continue
    const record = JSON.parse(raw)
    // The learner picked an hour in their own timezone, so the worker shifts UTC by the
    // offset the browser reported instead of guessing.
    const local = new Date(now.getTime() - (record.offsetMinutes ?? 0) * 60_000)
    if (local.getUTCHours() !== record.hour) continue

    const status = await push(record.subscription, {
      title: 'English Coach',
      body: line,
      url: env.APP_URL ?? '/',
    }, env)
    // 404 and 410 mean the browser threw the subscription away; keeping it is spam.
    if (status === 404 || status === 410) await env.SUBSCRIPTIONS.delete(entry.name)
  }
}

// MARK: - Web Push (RFC 8291 / 8292) without a library

async function push(subscription, payload, env) {
  const body = await encrypt(JSON.stringify(payload), subscription.keys)
  const endpoint = new URL(subscription.endpoint)
  const jwt = await vapidToken(endpoint.origin, env)

  const response = await fetch(subscription.endpoint, {
    method: 'POST',
    headers: {
      TTL: '86400',
      'Content-Encoding': 'aes128gcm',
      'Content-Type': 'application/octet-stream',
      Authorization: `vapid t=${jwt}, k=${env.VAPID_PUBLIC_KEY}`,
    },
    body,
  })
  return response.status
}

/** Signed proof that the push came from this application, per VAPID. */
async function vapidToken(audience, env) {
  const header = b64url(new TextEncoder().encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })))
  const claims = b64url(new TextEncoder().encode(JSON.stringify({
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 3600,
    sub: env.VAPID_SUBJECT ?? 'mailto:noreply@example.com',
  })))
  const data = new TextEncoder().encode(`${header}.${claims}`)
  const key = await crypto.subtle.importKey('jwk', privateJwk(env), { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign'])
  const signature = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, data)
  return `${header}.${claims}.${b64url(new Uint8Array(signature))}`
}

function privateJwk(env) {
  const publicKey = decode(env.VAPID_PUBLIC_KEY)
  return {
    kty: 'EC',
    crv: 'P-256',
    d: env.VAPID_PRIVATE_KEY,
    x: b64url(publicKey.slice(1, 33)),
    y: b64url(publicKey.slice(33, 65)),
    ext: true,
  }
}

/**
 * aes128gcm content encoding: a fresh key agreement per message, so the push service
 * relays a payload it cannot read.
 */
async function encrypt(plaintext, keys) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const local = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits'])
  const localPublic = new Uint8Array(await crypto.subtle.exportKey('raw', local.publicKey))

  const clientPublic = decode(keys.p256dh)
  const auth = decode(keys.auth)
  const shared = new Uint8Array(await crypto.subtle.deriveBits(
    { name: 'ECDH', public: await crypto.subtle.importKey('raw', clientPublic, { name: 'ECDH', namedCurve: 'P-256' }, false, []) },
    local.privateKey,
    256,
  ))

  const info = concat(new TextEncoder().encode('WebPush: info\0'), clientPublic, localPublic)
  const prk = await hkdf(auth, shared, info, 32)
  const contentKey = await hkdf(salt, prk, new TextEncoder().encode('Content-Encoding: aes128gcm\0'), 16)
  const nonce = await hkdf(salt, prk, new TextEncoder().encode('Content-Encoding: nonce\0'), 12)

  const key = await crypto.subtle.importKey('raw', contentKey, 'AES-GCM', false, ['encrypt'])
  const padded = concat(new TextEncoder().encode(plaintext), new Uint8Array([2]))
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, key, padded))

  const header = new Uint8Array(21)
  header.set(salt, 0)
  new DataView(header.buffer).setUint32(16, 4096)
  header[20] = localPublic.length
  return concat(header, localPublic, ciphertext)
}

async function hkdf(salt, ikm, info, length) {
  const key = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits'])
  return new Uint8Array(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info }, key, length * 8))
}

function concat(...parts) {
  const total = parts.reduce((sum, part) => sum + part.length, 0)
  const out = new Uint8Array(total)
  let offset = 0
  for (const part of parts) { out.set(part, offset); offset += part.length }
  return out
}

function decode(value) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4))
  return Uint8Array.from(binary, (c) => c.charCodeAt(0))
}

function b64url(bytes) {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}
