export type Verdict = 'correct' | 'typo' | 'wrong'

export interface FeedbackProps {
  /** `typo` is counted as correct — a misspelling is not a wrong answer. */
  verdict: Verdict
  /** What was almost right, spelled out: «правильно пишется “mañana”». */
  note?: string
  /** The canonical answer. Only shown on a wrong verdict. */
  answer?: string
  /** What was missing or extra, when the answer was close enough to be worth naming. */
  diff?: string
}

const TITLES: Record<Verdict, string> = {
  correct: 'Отлично!', typo: 'Почти! Засчитано', wrong: 'Пока не так',
}

/**
 * The verdict on an answer, risen in under the exercise.
 *
 * Three outcomes, not two: a typo is counted and still corrected, because being marked
 * wrong for an accent teaches nothing except to stop trying.
 */
export function Feedback({ verdict, note, answer, diff }: FeedbackProps) {
  return (
    <div className={`feedback ${verdict === 'wrong' ? 'wrong' : 'correct'}`}>
      <div className="feedback-title">{TITLES[verdict]}</div>
      {note && <div className="feedback-note">{note}</div>}
      {verdict === 'wrong' && (
        <>
          {answer && <div className="feedback-answer">{answer}</div>}
          {diff && <div className="feedback-diff">{diff}</div>}
        </>
      )}
    </div>
  )
}
