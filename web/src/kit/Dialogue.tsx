export interface DialogueLineData {
  /** Who says it. Rendered in small caps above the line. */
  speaker: string
  /** The line in the language being learned. */
  text: string
  /** The same line in Russian, under it and quieter. */
  translation: string
}

export interface DialogueProps {
  lines: DialogueLineData[]
  /** Called with a single line's text when its speaker button is tapped. */
  onSpeak?: (text: string) => void
  /** Called to read the whole exchange top to bottom. Omit to hide the button. */
  onPlayAll?: () => void
  /** True while `onPlayAll` is still reading — disables the button and renames it. */
  playing?: boolean
}

/**
 * Two people talking, heard whole before it is taken apart.
 *
 * Every other exercise in the course is a standalone sentence; this is the only place
 * where the language appears as an exchange, which is where it actually lives. It is
 * the first step of every unit.
 */
export function Dialogue({ lines, onSpeak, onPlayAll, playing }: DialogueProps) {
  return (
    <>
      <div className="dialogue">
        {lines.map((line, index) => (
          <div className="dialogue-line" key={index}>
            <span className="dialogue-speaker">{line.speaker}</span>
            <div className="dialogue-text">
              {line.text}
              {onSpeak && (
                <button className="speak small" onClick={() => onSpeak(line.text)} aria-label="Произнести">🔊</button>
              )}
            </div>
            <div className="dialogue-translation">{line.translation}</div>
          </div>
        ))}
      </div>
      {onPlayAll && (
        <button className="secondary" disabled={playing} onClick={onPlayAll} style={{ marginTop: 14 }}>
          {playing ? 'Читаю…' : 'Прочитать вслух целиком'}
        </button>
      )}
    </>
  )
}
