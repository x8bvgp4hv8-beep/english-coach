import { TopicRow } from 'english-coach-web'

/**
 * The colour is a verdict, not decoration: under 60% coral, under 75% amber,
 * above that mint. Untouched stays grey — no record is not the same as a bad one.
 */
export function Verdicts() {
  return (
    <div style={{ width: 360 }}>
      <TopicRow
        title="Ser и estar"
        summary="Два глагола «быть»: постоянное свойство против состояния и места"
        level="A1" attempts={25} correct={13} accuracy={0.52} exercises={48}
      />
      <TopicRow
        title="Артикли el / la / un / una"
        summary="Определённый и неопределённый артикль, род и число"
        level="A1" attempts={31} correct={22} accuracy={0.71} exercises={36}
      />
      <TopicRow
        title="Настоящее время правильных глаголов"
        summary="Окончания -ar, -er, -ir в настоящем времени"
        level="A1" attempts={64} correct={57} accuracy={0.89} exercises={52}
      />
    </div>
  )
}

/** Never met: the row shows how much is waiting instead of a percentage. */
export function Untouched() {
  return (
    <div style={{ width: 360 }}>
      <TopicRow
        title="Сослагательное наклонение"
        summary="Presente de subjuntivo после выражений желания и сомнения"
        level="B1" attempts={0} correct={0} accuracy={0} exercises={24}
      />
    </div>
  )
}

/** Not yet reached by the lessons: a statement, not a button that does nothing. */
export function Locked() {
  return (
    <div style={{ width: 360 }}>
      <TopicRow
        title="Условные предложения"
        summary="Si + imperfecto de subjuntivo, condicional в главной части"
        level="B2" attempts={0} correct={0} accuracy={0} exercises={0}
      />
    </div>
  )
}
