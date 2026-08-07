export interface AnswerFieldProps {
  value: string
  placeholder?: string
  /** Locked once the answer has been checked. */
  disabled?: boolean
  onChange?: (value: string) => void
  /** Enter with a non-empty field. The same thing the check button does. */
  onSubmit?: (value: string) => void
}

/**
 * Where a translation gets typed.
 *
 * Autocorrect, autocapitalise and spellcheck are all off: the phone helpfully fixing a
 * foreign word is the phone answering the exercise.
 */
export function AnswerField({ value, placeholder, disabled, onChange, onSubmit }: AnswerFieldProps) {
  return (
    <input
      className="answer-field"
      value={value}
      placeholder={placeholder}
      autoCapitalize="off"
      autoCorrect="off"
      spellCheck={false}
      disabled={disabled}
      onChange={(event) => onChange?.(event.target.value)}
      onKeyDown={(event) => { if (event.key === 'Enter' && value.trim()) onSubmit?.(value) }}
    />
  )
}
