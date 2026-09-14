import { useStore } from './App'
import { PairsBoard } from './formats'
import { Icon } from '../kit/Icons'
import { PrimaryButton, SecondaryButton } from '../kit'

/**
 * «Найди пару» отдельным заходом: три набора по шесть.
 *
 * Само взаимодействие лежит в `formats.tsx` и то же самое, что внутри урока: экран здесь
 * отвечает только за очередь наборов, счёт и выход. Две копии поведения разъехались бы на
 * первой правке — в этом проекте так уже было со списком фраз для озвучки.
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
        <span style={{ width: `${(model.pairsRound / model.pairsRoundsTotal) * 100}%`, background: 'var(--mint)' }} />
      </div>

      <div className="scroll" style={{ paddingTop: 18 }}>
        <PairsBoard
          key={model.pairsRound}
          pairs={round}
          language={model.currentLanguage.code}
          speakLevel={model.selectedLevel}
          onAttempt={(id, correct) => model.recordFormatAttempt(id, correct, 'pairs')}
          onDone={() => model.nextPairsRound()}
        />
      </div>
    </>
  )
}
