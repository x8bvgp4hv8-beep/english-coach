import { useEffect, useState } from 'react'

import './rhino-mascot.js'
import type { LanguageCode } from '../core'

/**
 * The mascot the app is named after.
 *
 * `rhino-mascot.js` is the custom element straight out of the Claude Design prototype, kept as
 * it was: one file, shadow DOM, inline SVG, and every movement done in CSS keyframes.
 * It reaches for nothing over the network, which is the only reason it could come across
 * unchanged — the prototype's animation library could not have.
 *
 * Importing this module registers `<rhino-mascot>`; the React pieces below are the only
 * new code, and they exist to decide *when* he speaks rather than how he is drawn.
 */

export type RhinoState = 'idle' | 'wave' | 'talk' | 'celebrate' | 'loading' | 'think' | 'sleep'
export type RhinoHat = 'uk' | 'es'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'rhino-mascot': { state?: RhinoState; hat?: RhinoHat; style?: React.CSSProperties; class?: string }
    }
  }
}

/** The hat is the course, so a language maps straight onto one. */
export const hatFor = (language: LanguageCode): RhinoHat => (language === 'es' ? 'es' : 'uk')

export function Rhino({ state = 'idle', hat, size = 96 }: { state?: RhinoState; hat?: RhinoHat; size?: number }) {
  return (
    <div className="rhino" style={{ width: size, height: size }} aria-hidden="true">
      <rhino-mascot state={state} hat={hat} />
    </div>
  )
}

export interface RhinoLine {
  state: RhinoState
  text: string
  /** Bumped per pop so the same line twice in a row still replays the entrance. */
  id: number
}

/**
 * What he says about an answer.
 *
 * A correct answer only gets a reaction every other time. The prototype made that call
 * and it is the right one: praise on all of them is wallpaper, and wallpaper is what
 * people stop seeing.
 */
export function lineForVerdict(verdict: 'correct' | 'typo' | 'wrong', step: number): Omit<RhinoLine, 'id'> | null {
  if (verdict === 'correct') {
    return step % 2 === 0 ? { state: 'celebrate', text: 'Вот так!' } : null
  }
  if (verdict === 'typo') return { state: 'talk', text: 'Почти — опечатка' }
  return { state: 'think', text: 'Бывает. Разберём.' }
}

/**
 * He comes up from the bottom, says his line and leaves on his own after a few seconds.
 *
 * Pinned above the button rather than over it: in the prototype he covered "Дальше" and
 * got in the way of the very tap he was congratulating.
 */
export function RhinoPop({ line, hat }: { line: RhinoLine | null; hat?: RhinoHat }) {
  const [shown, setShown] = useState<RhinoLine | null>(null)

  useEffect(() => {
    if (!line) return
    setShown(line)
    const timer = setTimeout(() => setShown(null), 2600)
    return () => clearTimeout(timer)
  }, [line])

  if (!shown) return null

  return (
    <div className="rhino-pop" key={shown.id} role="status">
      <div className="rhino-pop-figure" aria-hidden="true">
        <rhino-mascot state={shown.state} hat={hat} />
      </div>
      <span className="rhino-pop-line">{shown.text}</span>
    </div>
  )
}
