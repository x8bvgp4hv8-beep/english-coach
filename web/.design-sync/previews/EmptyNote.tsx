import { EmptyNote, SectionTitle } from 'english-coach-web'

/**
 * A section with nothing in it, saying why. The alternative — seven disabled rows of
 * zeros — looks like a broken screen.
 */
export function NoPracticeYet() {
  return (
    <div style={{ width: 360 }}>
      <SectionTitle>Виды заданий</SectionTitle>
      <EmptyNote>
        Тренировки собираются из пройденного. Пройди первый урок — и здесь появятся
        карточки, перевод, аудирование и речь вслух.
      </EmptyNote>
    </div>
  )
}

export function NothingDue() {
  return (
    <div style={{ width: 360 }}>
      <EmptyNote>
        На сегодня повторений нет. Карточки вернутся сами, когда придёт их срок.
      </EmptyNote>
    </div>
  )
}
