/**
 * Where the reminder worker lives, and the public half of its signing key.
 *
 * The public key is meant to be public: it is what the browser hands to Apple or Google
 * so the push can be verified as ours. The private half never leaves the worker — it is
 * set once with `wrangler secret put VAPID_PRIVATE_KEY` and exists nowhere else.
 *
 * The two halves are a pair. Replace one without the other and every push comes back 403
 * while the app still says "включено", so if this key ever changes, the secret has to
 * change with it.
 */
export const PUSH_PUBLIC_KEY = 'BDSGV7GzYFi8Rxvkg0Zzzt4PNPt1HWn9sBn_wOCLQ_nUXeFXpzP0BHAcEY9BJyj0OW7zW9UwW7NOJ1t9nCaG0z0'

/** Filled in after `npx wrangler deploy` prints the worker URL (see server/README.md). */
export const PUSH_ENDPOINT = ''
