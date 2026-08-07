import { KindButton, KindList } from 'english-coach-web'

/**
 * The whole practice menu as the map screen builds it. Speaking comes first — it is the
 * only exercise that gets the mouth moving — and listening second, the only one where
 * the foreign language is not on screen.
 */
export function PracticeMenu() {
  return (
    <div style={{ width: 360 }}>
      <KindList>
        <KindButton icon="🎙" color="var(--coral)" title="Вслух за диктором"
          subtitle="Слушай, повторяй, сравнивай себя с эталоном" count={128} />
        <KindButton icon="👂" color="var(--blue)" title="На слух"
          subtitle="Фразу говорят, текста нет — запиши, что услышал" count={96} />
        <KindButton icon="⚡" color="var(--violet)" title="Всё вперемешку"
          subtitle="Как в уроке, только без объяснений" count={412} />
        <KindButton icon="🗂" color="var(--blue)" title="Карточки"
          subtitle="Фраза и перевод, проверяешь себя сам" count={180} />
        <KindButton icon="✍️" color="var(--amber)" title="Перевод"
          subtitle="Напиши фразу целиком, с ударениями" count={143} />
        <KindButton icon="🧩" color="var(--mint)" title="Собрать фразу"
          subtitle="Слова даны, порядок — нет" count={71} />
      </KindList>
    </div>
  )
}

/** Nothing has been taught yet, so the rows are dimmed and the counts are zero. */
export function NothingUnlocked() {
  return (
    <div style={{ width: 360 }}>
      <KindList>
        <KindButton icon="🎙" color="var(--coral)" title="Вслух за диктором"
          subtitle="Слушай, повторяй, сравнивай себя с эталоном" count={0} disabled />
        <KindButton icon="👂" color="var(--blue)" title="На слух"
          subtitle="Фразу говорят, текста нет — запиши, что услышал" count={0} disabled />
      </KindList>
    </div>
  )
}
