import { useStore } from './App'
import { say } from './speech'
import { Icon } from '../kit/Icons'
import { PrimaryButton, SecondaryButton } from '../kit'

/**
 * «Найди пару»: шесть слов слева, шесть переводов справа.
 *
 * Два нажатия вместо перетаскивания. Перетаскивание на телефоне требует точности,
 * которой нет у человека в метро, и ломается на первом же промахе пальцем; нажал слово,
 * нажал перевод — работает одинаково на любом экране и не мешает думать.
 *
 * Слово вслух читается при нажатии: звук у нас уже есть на все фразы, и связка «вижу —
 * слышу — знаю смысл» тут собирается бесплатно.
 */
export function Pairs() {
  const model = useStore()
  const round = model.currentPairsRound

  if (model.pairsIsComplete || round.length === 0) {
    const total = model.pairsRoundsTotal * 6
    return (
      <div className="center">
        <p className="done-kicker">НАЙДИ ПАРУ</p>
        <h1>{model.pairsMistakes === 0 ? 'Все пары без промаха' : 'Пары собраны'}</h1>
        <p>
          {model.pairsDone} из {total} — {model.pairsMistakes === 0
            ? 'ни одного промаха.'
            : `промахов ${model.pairsMistakes}, они вернутся в повторении.`}
        </p>
        <div className="pills">
          <span className="pill">✦ {model.totalPoints}</span>
          <span className="pill">🔥 {model.streak()}</span>
        </div>
        <div className="stack">
          <PrimaryButton onClick={() => model.startPairs()}>Ещё набор</PrimaryButton>
          <SecondaryButton onClick={() => model.closePairs()}>Закончить</SecondaryButton>
        </div>
      </div>
    )
  }

  const matched = new Set(model.pairsMatched)
  const matchedMeanings = new Set(round.filter((pair) => matched.has(pair.term)).map((pair) => pair.meaning))

  const termClass = (term: string) => {
    if (matched.has(term)) return 'pair-cell done'
    if (model.pairsPicked === term) return 'pair-cell picked'
    if (model.pairsMiss?.term === term) return 'pair-cell miss'
    return 'pair-cell'
  }
  const meaningClass = (meaning: string) => {
    if (matchedMeanings.has(meaning)) return 'pair-cell done'
    if (model.pairsMiss?.meaning === meaning) return 'pair-cell miss'
    return 'pair-cell'
  }

  return (
    <>
      <header className="player-bar">
        <button className="icon-button" onClick={() => model.closePairs()} aria-label="Закрыть">
          <Icon name="close" size={20} />
        </button>
        <span className="player-title">Найди пару</span>
        <span className="player-count">{model.pairsRound + 1} / {model.pairsRoundsTotal}</span>
      </header>
      <div className="bar" style={{ borderRadius: 0 }}>
        <span style={{ width: `${(matched.size / round.length) * 100}%`, background: 'var(--mint)' }} />
      </div>

      <div className="scroll" style={{ paddingTop: 18 }}>
        <p className="pair-hint">
          {model.pairsPicked ? 'Теперь перевод' : 'Нажми слово, потом его перевод'}
        </p>

        <div className="pair-grid">
          <div className="pair-column">
            {round.map((pair) => (
              <button
                key={pair.term}
                className={termClass(pair.term)}
                lang={model.currentLanguage.code}
                disabled={matched.has(pair.term)}
                onClick={() => { model.pickPairTerm(pair.term); say(pair.term, model.selectedLevel) }}
              >
                {pair.term}
              </button>
            ))}
          </div>
          <div className="pair-column">
            {model.pairsMeanings.map((meaning) => (
              <button
                key={meaning}
                className={meaningClass(meaning)}
                disabled={matchedMeanings.has(meaning) || !model.pairsPicked}
                onClick={() => model.pickPairMeaning(meaning)}
              >
                {meaning}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
