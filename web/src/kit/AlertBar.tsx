export interface AlertBarProps {
  /** What has broken, in one sentence, in the words the learner would use. */
  children: string
  /** The way out. Omit both this and `onAction` when there is nothing to do about it. */
  actionLabel?: string
  onAction?: () => void
}

/**
 * Something is wrong and it costs the learner something. Loud on purpose.
 *
 * Reserved for state the app cannot recover from on its own — storage that has stopped
 * accepting writes, for instance. Silence there costs everything done next, so it is
 * said plainly and the way out is one tap away.
 */
export function AlertBar({ children, actionLabel, onAction }: AlertBarProps) {
  return (
    <div className="alert-bar">
      <span>{children}</span>
      {actionLabel && <button onClick={onAction}>{actionLabel}</button>}
    </div>
  )
}
