import { ChapterSection, LessonRow } from 'english-coach-web'

/** The unit being walked: open, with its promise listed above the lessons. */
export function Open() {
  return (
    <div style={{ width: 360 }}>
      <ChapterSection
        number={1}
        title="Первые слова"
        subtitle="Поздороваться, попрощаться, назвать себя"
        canDo={['поздороваться и попрощаться', 'назвать своё имя', 'спросить, кто это']}
        done={3}
        total={5}
        open
      >
        <LessonRow title="¡Hola!" minutes={9} state="completed" first />
        <LessonRow title="Me llamo…" minutes={7} state="completed" />
        <LessonRow title="Buenos días" minutes={8} state="completed" />
        <LessonRow title="El alfabeto" minutes={6} state="current" />
        <LessonRow title="Проверка блока" minutes={5} state="locked" checkpoint last />
      </ChapterSection>
    </div>
  )
}

/**
 * Collapsed is the default for every unit except the one being walked.
 * Thirty open units is a wall; thirty collapsed ones is a table of contents.
 */
export function Collapsed() {
  return (
    <div style={{ width: 360 }}>
      <ChapterSection number={7} title="Числа и цены" done={0} total={17} open={false} />
      <ChapterSection number={8} title="Семья" done={0} total={17} open={false} />
      <ChapterSection number={9} title="Время и дни" done={0} total={16} open={false} />
    </div>
  )
}

/** Finished: the count turns mint. */
export function Completed() {
  return (
    <div style={{ width: 360 }}>
      <ChapterSection number={2} title="Знакомство" done={17} total={17} open={false} />
    </div>
  )
}
