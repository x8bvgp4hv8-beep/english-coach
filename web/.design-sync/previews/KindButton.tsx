import { KindButton, KindList } from 'english-coach-web'

/** One row. The count at the end is the difference between a dead menu item and a drill. */
export function Speaking() {
  return (
    <div style={{ width: 360 }}>
      <KindList>
        <KindButton icon="🎙" color="var(--coral)" title="Вслух за диктором"
          subtitle="Слушай, повторяй, сравнивай себя с эталоном" count={128} />
      </KindList>
    </div>
  )
}

/** Zero available: the row states it rather than pretending to be tappable. */
export function Empty() {
  return (
    <div style={{ width: 360 }}>
      <KindList>
        <KindButton icon="🧩" color="var(--mint)" title="Собрать фразу"
          subtitle="Слова даны, порядок — нет" count={0} disabled />
      </KindList>
    </div>
  )
}

/** The colour is stable per kind of practice, so the row is recognised before it is read. */
export function Colours() {
  return (
    <div style={{ width: 360 }}>
      <KindList>
        <KindButton icon="⚡" color="var(--violet)" title="Всё вперемешку" subtitle="Как в уроке, только без объяснений" count={412} />
        <KindButton icon="🗂" color="var(--blue)" title="Карточки" subtitle="Фраза и перевод, проверяешь себя сам" count={180} />
        <KindButton icon="✍️" color="var(--amber)" title="Перевод" subtitle="Напиши фразу целиком, с ударениями" count={143} />
      </KindList>
    </div>
  )
}
