export interface WordOrderTrayProps {
  /** Every word on offer, in scrambled order. */
  tokens: string[]
  /** Indices into `tokens`, in the order they were tapped. */
  picked: number[]
  /** Shown in the empty tray. */
  placeholder?: string
  /** Locked once the sentence has been checked. */
  disabled?: boolean
  /** A word from the pool was tapped — append its index. */
  onPick?: (index: number) => void
  /** A word already in the tray was tapped — remove it at that position. */
  onUnpick?: (position: number) => void
}

/**
 * Building a sentence out of the words you are given.
 *
 * The tray on top is the answer being written; the pool below dims each word as it is
 * used, so what is left says what is still unplaced. Tapping a word in the tray takes
 * it back — nothing here needs a delete key.
 */
export function WordOrderTray({
  tokens, picked, placeholder = 'Нажимай на слова, чтобы собрать фразу', disabled, onPick, onUnpick,
}: WordOrderTrayProps) {
  return (
    <>
      <div className="token-tray">
        {picked.length === 0 && <span className="placeholder">{placeholder}</span>}
        {picked.map((index, position) => (
          <button
            key={`${index}-${position}`}
            className="token picked"
            disabled={disabled}
            onClick={() => onUnpick?.(position)}
          >
            {tokens[index]}
          </button>
        ))}
      </div>
      <div className="tokens">
        {tokens.map((token, index) => (
          <button
            key={`${token}-${index}`}
            className={`token${picked.includes(index) ? ' used' : ''}`}
            disabled={picked.includes(index) || disabled}
            onClick={() => onPick?.(index)}
          >
            {token}
          </button>
        ))}
      </div>
    </>
  )
}
