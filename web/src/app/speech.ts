/**
 * System voice, no network and no assets. Safari needs a user gesture to start it.
 * `onEnd` also fires when speech is unavailable or fails, so callers can chain the
 * learner's own recording after the model phrase without ever getting stuck.
 */
export function speak(text: string, onEnd?: () => void): void {
  if (!('speechSynthesis' in window) || !text) {
    onEnd?.()
    return
  }
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-GB'
  utterance.rate = 0.95
  if (onEnd) {
    let done = false
    const finish = () => { if (!done) { done = true; onEnd() } }
    utterance.onend = finish
    utterance.onerror = finish
  }
  speechSynthesis.cancel()
  speechSynthesis.speak(utterance)
}

export function stopSpeaking(): void {
  if ('speechSynthesis' in window) speechSynthesis.cancel()
}
