import { useStore } from './App'
import { pictureFor, pictureURL } from '../core'
import { speak, speakBuiltIn } from './speech'
import { plural } from './plural'
import { Icon } from '../kit/Icons'
import { EmptyNote, PrimaryButton, SecondaryButton, SectionTitle } from '../kit'
import type { AppStore } from './store'

/**
 * Список частых слов: охват частотного ядра и работа с ним.
 *
 * Название и объём — из пакета: у английского это 3000 слов (Oxford 3000 по частотности
 * субтитров), у испанского 826 (Русский Викисловарь по той же частотности). Поэтому в
 * заголовке и на «Тренировке» стоит `title` пакета, а не вбитое число.
 *
 * Экран отвечает на один вопрос — «сколько из этого списка я уже знаю», — и даёт два
 * способа двигать эту цифру. Просеивание: слово и две кнопки, человек отделяет знакомое
 * от незнакомого пачками по тридцать. Изучение: только то, что он сам отметил как
 * незнакомое, и слово закрывается после трёх правильных вспоминаний подряд.
 *
 * Порядок именно такой, потому что иначе список бесполезен: прощёлкивать три тысячи
 * карточек, половину из которых знаешь, никто не станет.
 */
export function Wordlist() {
  const model = useStore()

  if (model.wordlistActive) return <Runner model={model} />

  const { known, total } = model.wordlistCount
  const exact = total > 0 ? (known / total) * 100 : 0
  // «0% частотного ядра» при десяти отмеченных словах читается как поломка, хотя это
  // честное округление 0,33%. Пока доля меньше процента, так и говорим.
  const share = exact > 0 && exact < 1 ? 'меньше 1%' : `${Math.round(exact)}%`

  return (
    <>
      <header className="header">
        <div className="header-top">
          <button className="icon-button" onClick={() => model.goBack()} aria-label="Назад">
            <Icon name="arrow-left" size={20} />
          </button>
          <h1 className="brand-title" style={{ flex: 1, textAlign: 'center' }}>{model.wordlist?.title ?? 'Частые слова'}</h1>
          <span style={{ width: 48 }} />
        </div>
      </header>

      <div className="scroll">
        {total === 0 ? (
          <EmptyNote>Для этого языка списка частых слов пока нет.</EmptyNote>
        ) : (
          <>
            <div className="wl-total">
              <span className="wl-total-value">{known}</span>
              <span className="wl-total-of">из {total}</span>
              <span className="wl-total-bar"><span style={{ width: `${Math.max(exact, known > 0 ? 1 : 0)}%` }} /></span>
              <span className="wl-total-note">
                {share} частотного ядра. Знать их — понимать большую часть обычной речи.
              </span>
            </div>

            <SectionTitle hint="Слова идут по частоте: первая тысяча встречается чаще всего">
              По тысячам
            </SectionTitle>
            {model.wordlistThousands.map((chunk) => (
              <div className="wl-chunk" key={chunk.from}>
                <span className="wl-chunk-head">
                  <span className="wl-chunk-name">{chunk.from}–{chunk.to}</span>
                  <span className="wl-chunk-value">{chunk.known} / {chunk.total}</span>
                </span>
                <span className="wl-chunk-bar">
                  <span style={{ width: `${(chunk.known / chunk.total) * 100}%` }} />
                </span>
              </div>
            ))}

            <div className="gap-22" />
            <div className="wl-actions">
              {model.wordlistUnsorted > 0 ? (
                <>
                  <PrimaryButton onClick={() => model.startWordlistSieve()}>
                    Просеять слова
                  </PrimaryButton>
                  <p className="wl-hint">
                    Пачка из тридцати: отмечаешь, что знаешь, а что нет. Не разобрано ещё{' '}
                    {model.wordlistUnsorted} {plural(model.wordlistUnsorted, 'слово', 'слова', 'слов')}.
                  </p>
                </>
              ) : (
                <p className="wl-hint">Все слова разобраны — осталось только учить отмеченные.</p>
              )}

              {model.wordlistLearning > 0 && (
                <>
                  <SecondaryButton onClick={() => model.startWordlistStudy()}>
                    Учить незнакомые ({model.wordlistLearning})
                  </SecondaryButton>
                  <p className="wl-hint">
                    Слово закрывается после трёх правильных вспоминаний подряд.
                  </p>
                </>
              )}
            </div>

            <p className="wl-source">{model.wordlist?.source}</p>
          </>
        )}
      </div>
    </>
  )
}

/** Проход по пачке: просеивание или изучение. */
function Runner({ model }: { model: AppStore }) {
  const word = model.currentWord
  const sieving = model.wordlistMode === 'sieve'
  const picture = word ? pictureFor(word.w, model.pictures) : null

  if (model.wordlistIsComplete || !word) {
    return (
      <div className="center">
        <p className="done-kicker">{sieving ? 'ПРОСЕИВАНИЕ' : 'ИЗУЧЕНИЕ'}</p>
        <h1>Пачка разобрана</h1>
        <p>
          {sieving
            ? `Знакомых ${model.wordlistDone} из ${model.wordlistQueue.length}. Остальные ушли в изучение.`
            : `Вспомнил ${model.wordlistDone} из ${model.wordlistQueue.length}.`}
        </p>
        <div className="stack">
          <PrimaryButton onClick={() => (sieving ? model.startWordlistSieve() : model.startWordlistStudy())}>
            Ещё пачку
          </PrimaryButton>
          <SecondaryButton onClick={() => model.closeWordlist()}>Закончить</SecondaryButton>
        </div>
      </div>
    )
  }

  return (
    <>
      <header className="player-bar">
        <button className="icon-button" onClick={() => model.closeWordlist()} aria-label="Закрыть">
          <Icon name="close" size={20} />
        </button>
        <span className="player-title">{sieving ? 'Просеивание' : 'Изучение слов'}</span>
        <span className="player-count">осталось {model.wordlistLeft}</span>
      </header>

      <div className="scroll">
        <div className="wl-card">
          <span className="wl-card-rank">{word.r}-е по частоте · {word.p}</span>
          {/* Картинка, если она есть у слова: на просеивании это ускоряет решение
              «знаю / не знаю» — предмет узнаётся быстрее, чем читается перевод.
              Где картинки нет, не рисуется ничего: пустая рамка хуже её отсутствия. */}
          {picture && <img className="wl-card-picture" src={pictureURL(picture)} alt="" />}
          <span className="wl-card-word" lang="en">
            {word.w}
            {/* Слова озвучены заранее и лежат в приложении: системный синтез нужен
                только если файла нет. */}
            <button
              className="verb-speak"
              onClick={() => { if (!speakBuiltIn(word.w)) speak(word.w) }}
              aria-label="Послушать"
            >
              <Icon name="audio" size={16} />
            </button>
          </span>
          {/* На просеивании перевод виден сразу: человек решает, знакомо ли слово, а не
              вспоминает его. В изучении — только после попытки. */}
          {(sieving || model.wordlistRevealed) && <span className="wl-card-translation">{word.t}</span>}
        </div>

        <div className="wl-foot">
          {sieving ? (
            <>
              <PrimaryButton onClick={() => model.answerWord(true)}>Знаю</PrimaryButton>
              <SecondaryButton onClick={() => model.answerWord(false)}>Не знаю</SecondaryButton>
            </>
          ) : model.wordlistRevealed ? (
            <>
              <PrimaryButton onClick={() => model.answerWord(true)}>Вспомнил</PrimaryButton>
              <SecondaryButton onClick={() => model.answerWord(false)}>Ещё раз</SecondaryButton>
            </>
          ) : (
            <PrimaryButton onClick={() => model.revealWord()}>Показать перевод</PrimaryButton>
          )}
        </div>
      </div>
    </>
  )
}
