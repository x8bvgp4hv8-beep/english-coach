import { Dialogue } from 'english-coach-web'

const CAFE = [
  { speaker: 'Pedro', text: '¡Hola!', translation: 'Привет!' },
  { speaker: 'Ana', text: '¡Hola! ¿Un café?', translation: 'Привет! Кофе?' },
  { speaker: 'Pedro', text: 'Sí, por favor.', translation: 'Да, пожалуйста.' },
  { speaker: 'Ana', text: 'Aquí está.', translation: 'Вот, держи.' },
  { speaker: 'Pedro', text: 'Muchas gracias. ¡Adiós!', translation: 'Большое спасибо. Пока!' },
]

/** The first step of every unit: the language heard whole before it is taken apart. */
export function Cafe() {
  return (
    <div style={{ width: 340 }}>
      <Dialogue lines={CAFE} onSpeak={() => {}} onPlayAll={() => {}} />
    </div>
  )
}

/** Mid-playback: the button names what it is doing and refuses a second tap. */
export function Playing() {
  return (
    <div style={{ width: 340 }}>
      <Dialogue lines={CAFE.slice(0, 3)} onSpeak={() => {}} onPlayAll={() => {}} playing />
    </div>
  )
}

/** Without `onSpeak` the speaker buttons drop out — a dialogue that is read, not heard. */
export function TextOnly() {
  return (
    <div style={{ width: 340 }}>
      <Dialogue lines={CAFE.slice(0, 3)} />
    </div>
  )
}
