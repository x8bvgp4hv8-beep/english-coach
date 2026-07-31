/**
 * Where the reminder worker lives, and the public half of its signing key.
 *
 * The public key is meant to be public: it is what the browser hands to Apple or Google
 * so the push can be verified as ours. The private half never leaves the worker.
 */
export const PUSH_PUBLIC_KEY = 'BDQPSdX2vtd4E1l3PdiMDI4ml-CsSlCrwWnK2VPSxCcWKDwy8eOalCUH88Ogj4Cw4WydgqAD8-LHFLmuVPZeBM8'

/** Filled in after `npx wrangler deploy` prints the worker URL (see server/README.md). */
export const PUSH_ENDPOINT = ''
