import { useCallback, useEffect, useRef, useState } from 'react'

import { useStore } from './App'
import { speak, stopSpeaking } from './speech'

/**
 * Say it out loud, hear yourself next to the model phrase, judge it.
 * Nothing is uploaded and nothing is kept: the take lives in memory until the next
 * phrase replaces it.
 */

type MicState = 'idle' | 'recording' | 'ready' | 'denied' | 'unsupported'

/** A single take is short; a forgotten recorder is stopped for the learner. */
const MAX_TAKE_MS = 20_000

function useRecorder() {
  const [status, setStatus] = useState<MicState>('idle')
  const [takeURL, setTakeURL] = useState<string | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const urlRef = useRef<string | null>(null)
  const timerRef = useRef<number | null>(null)

  const clearTake = useCallback(() => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    urlRef.current = null
    setTakeURL(null)
  }, [])

  const stop = useCallback(() => {
    if (timerRef.current !== null) { window.clearTimeout(timerRef.current); timerRef.current = null }
    const recorder = recorderRef.current
    if (recorder && recorder.state === 'recording') recorder.stop()
  }, [])

  const start = useCallback(async () => {
    if (typeof MediaRecorder === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setStatus('unsupported')
      return
    }
    clearTake()
    stopSpeaking()
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: BlobPart[] = []
      recorder.ondataavailable = (event) => { if (event.data.size > 0) chunks.push(event.data) }
      recorder.onstop = () => {
        // The stream is released with the take: a live mic indicator between phrases
        // looks like the app is still listening.
        stream.getTracks().forEach((track) => track.stop())
        const url = URL.createObjectURL(new Blob(chunks, { type: recorder.mimeType || 'audio/mp4' }))
        urlRef.current = url
        setTakeURL(url)
        setStatus('ready')
      }
      recorderRef.current = recorder
      recorder.start()
      setStatus('recording')
      timerRef.current = window.setTimeout(stop, MAX_TAKE_MS)
    } catch {
      setStatus('denied')
    }
  }, [clearTake, stop])

  /** Between phrases: drop the take but keep a refusal, so the note stays on screen. */
  const reset = useCallback(() => {
    stop()
    clearTake()
    setStatus((current) => (current === 'denied' || current === 'unsupported' ? current : 'idle'))
  }, [clearTake, stop])

  useEffect(() => () => {
    stop()
    if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    recorderRef.current?.stream.getTracks().forEach((track) => track.stop())
  }, [stop])

  return { status, takeURL, start, stop, reset }
}

export function Shadowing() {
  const model = useStore()
  const item = model.currentShadowingItem
  const mic = useRecorder()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { reset } = mic

  useEffect(() => { reset() }, [item?.exerciseID, reset])
  useEffect(() => () => stopSpeaking(), [])

  const leave = () => { mic.stop(); stopSpeaking(); model.closeShadowing() }

  if (model.shadowingIsComplete) {
    return (
      <div className="center">
        <div className="hero-mark" style={{ background: 'var(--coral)' }}>🎙</div>
        <h1>Проговорено!</h1>
        <p>Рот работал — это и есть тот самый сдвиг.</p>
        <div className="pills">
          <span className="pill">✦ {model.totalPoints}</span>
          <span className="pill">🔥 {model.streak()}</span>
        </div>
        <button className="primary" onClick={leave}>Вернуться на маршрут</button>
      </div>
    )
  }
  if (!item) return null

  const total = model.shadowingItems.length
  const position = Math.min(model.session.exerciseIndex + 1, total)

  const playTake = () => {
    const audio = audioRef.current
    if (!audio) return
    stopSpeaking()
    audio.currentTime = 0
    void audio.play()
  }

  /** Model phrase, then your own take, so the difference is heard, not guessed. */
  const playBoth = () => {
    const audio = audioRef.current
    if (!audio) { speak(item.text); return }
    // Safari only starts an audio element from a user gesture, so it is unlocked
    // (muted) inside the tap and rewound before the voice hands over to it.
    audio.muted = true
    void audio.play()
      .then(() => { audio.pause(); audio.currentTime = 0; audio.muted = false })
      .catch(() => { audio.muted = false })

    let handedOver = false
    const playTake = () => {
      if (handedOver) return
      handedOver = true
      audio.currentTime = 0
      void audio.play()
    }
    speak(item.text, playTake)
    // A browser with no installed voice never reports the phrase as finished, and the
    // learner would be left with silence. Hand over on time regardless.
    window.setTimeout(playTake, Math.min(12_000, 1_500 + item.text.length * 90))
  }

  return (
    <div className="player">
      <div className="player-bar">
        <button className="icon-button" onClick={leave} aria-label="Выйти">✕</button>
        <span className="player-title">Вслух за диктором</span>
        <span className="player-count">{position} / {total}</span>
      </div>
      <div className="bar" style={{ borderRadius: 0 }}>
        <span style={{ width: `${(model.session.exerciseIndex / total) * 100}%`, background: 'var(--coral)' }} />
      </div>

      <div className="scroll" style={{ paddingTop: 18 }}>
        {/* Keyed by phrase so the card replays its arrival on every step. */}
        <div className="card" key={item.exerciseID}>
          <div className="exercise-kind" style={{ color: 'var(--coral)' }}>ПОВТОРИ ВСЛУХ</div>
          <div className="exercise-prompt">{item.text}</div>
          {item.gloss && <p className="exercise-explanation muted" style={{ textAlign: 'center' }}>{item.gloss}</p>}

          <div className="listen-row">
            <button className="listen" onClick={() => speak(item.text)}>🔊 Эталон</button>
            <button className="listen" disabled={!mic.takeURL} onClick={playTake}>▶︎ Я</button>
            <button className="listen" disabled={!mic.takeURL} onClick={playBoth}>⇄ Подряд</button>
          </div>

          <div className="take">
            <button
              className={`rec${mic.status === 'recording' ? ' on' : ''}`}
              onClick={() => (mic.status === 'recording' ? mic.stop() : void mic.start())}
              aria-label={mic.status === 'recording' ? 'Остановить запись' : 'Записать себя'}
            >
              {mic.status === 'recording' ? '■' : '●'}
            </button>
            <span className="take-note">
              {mic.status === 'recording' ? 'Говори — потом нажми ещё раз'
                : mic.status === 'denied' ? 'Микрофон не разрешён. Разреши доступ в настройках браузера — или просто говори вслух, разбор всё равно засчитается.'
                : mic.status === 'unsupported' ? 'Этот браузер не умеет записывать звук. Говори вслух и сравнивай на слух.'
                : mic.takeURL ? 'Сравни себя с эталоном и оцени'
                : 'Послушай эталон, повтори вслух и запиши себя'}
            </span>
          </div>

          {mic.takeURL && <audio ref={audioRef} src={mic.takeURL} preload="auto" />}
        </div>
      </div>

      <div className="player-actions">
        <div className="row">
          <button className="secondary" onClick={() => model.shadowingSelfAssess(false)}>Ещё поработать</button>
          <button className="primary mint" onClick={() => model.shadowingSelfAssess(true)}>Получилось</button>
        </div>
        {mic.takeURL && <button className="quiet" onClick={() => void mic.start()}>Записать заново</button>}
      </div>
    </div>
  )
}
