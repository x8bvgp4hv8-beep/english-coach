import { LessonRow } from 'english-coach-web'

/** Every state on one rail, in the order a learner meets them. */
export function Rail() {
  return (
    <div style={{ width: 340 }}>
      <LessonRow title="¡Hola!" minutes={9} state="completed" first />
      <LessonRow title="Me llamo…" minutes={7} state="completed" />
      <LessonRow title="Buenos días" minutes={8} state="current" />
      <LessonRow title="El alfabeto" minutes={6} state="available" />
      <LessonRow title="Perdón y de nada" minutes={7} state="locked" last />
    </div>
  )
}

/**
 * The checkpoint that closes a unit: production only, no hints. It announces itself,
 * because meeting it unannounced reads as a bug rather than as the point of the unit.
 */
export function Checkpoint() {
  return (
    <div style={{ width: 340 }}>
      <LessonRow title="Проверка: первые слова" minutes={5} state="available" checkpoint first />
      <LessonRow title="Проверка: знакомство" minutes={5} state="locked" checkpoint last />
    </div>
  )
}

/** The one being walked, alone — the node grows and the badge names it. */
export function Current() {
  return (
    <div style={{ width: 340 }}>
      <LessonRow title="Números y precios" minutes={8} state="current" first last />
    </div>
  )
}
