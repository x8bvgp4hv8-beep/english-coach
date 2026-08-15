import { useEffect, useState } from 'react'

import { useStore } from './App'
import { PlacementTest } from './Placement'
import { hatFor } from '../mascot/Rhino'
import { LEVELS } from '../core'
import { ActionCard, Pill, PrimaryButton, SecondaryButton, SectionTitle } from '../kit'
import type { CEFRLevel } from '../core'

type Stage = 'levelchoice' | 'placement' | 'result' | 'setup' | 'ready'

/**
 * How a level feels from the inside, so the pill is chosen honestly.
 *
 * The prototype wrote these for A0–B2; the courses here run A1–C1, so the ladder is the
 * app's and the wording is the prototype's. A level nobody can study yet has no business
 * being offered, however good the line under it would read.
 */
const LEVEL_LINE: Record<CEFRLevel, string> = {
  A1: 'A1 — отдельные фразы',
  A2: 'A2 — читаю, но говорю с трудом',
  B1: 'B1 — держусь в разговоре',
  B2: 'B2 — хочу шлифовать',
  C1: 'C1 — свободно, ловлю оттенки',
}

/** The three answers to "сколько времени в день", and what each one really means. */
const GOALS = [
  { minutes: 5, label: '5 минут', note: 'Коротко, но каждый день — этого хватает, чтобы не откатываться назад.' },
  { minutes: 10, label: '10 минут', note: 'Один урок в день плюс повторение старого — рабочий темп.' },
  { minutes: 20, label: '20 минут', note: 'Быстро, но требует режима. Если пропустишь два дня — темп сползёт.' },
]

/** Exercises a session of that length holds — the prototype's 4 / 8 / 16. */
const perDay = (minutes: number): number => Math.round(minutes * 0.8)

export function Onboarding() {
  const model = useStore()
  const [stage, setStage] = useState<Stage>('levelchoice')
  const [level, setLevel] = useState<CEFRLevel>('A1')
  const [goal, setGoal] = useState(10)

  // The last beat before the map: the rhino says it is ready, and then it is.
  useEffect(() => {
    if (stage !== 'ready') return
    const timer = setTimeout(() => model.completeOnboarding(level, goal), 680)
    return () => clearTimeout(timer)
  }, [stage, level, goal, model])

  if (stage === 'placement') {
    return (
      <PlacementTest
        onFinish={(recommended) => { setLevel(recommended); setStage('result') }}
        onSkip={() => setStage('setup')}
      />
    )
  }

  if (stage === 'ready') {
    return (
      <div className="center">
        <div className="onboarding-rhino tall" aria-hidden="true">
          <rhino-mascot state="celebrate" hat={hatFor(model.currentLanguage.code)} />
        </div>
        <h1>Маршрут готов</h1>
      </div>
    )
  }

  if (stage === 'result') {
    return (
      <div className="center">
        <h1>Твой уровень — {level}</h1>
        <div className="big-level">{level}</div>
        <p>Начнём отсюда. Когда станет легко, приложение само предложит перейти выше.</p>
        <div className="stack">
          <PrimaryButton onClick={() => setStage('setup')}>Продолжить</PrimaryButton>
          <SecondaryButton onClick={() => setStage('setup')}>Выбрать другой уровень</SecondaryButton>
        </div>
      </div>
    )
  }

  if (stage === 'levelchoice') {
    return (
      <div className="scroll onboarding">
        <h1 className="onboarding-title">Начнём с уровня</h1>
        <p className="onboarding-lead">
          От него зависит первый месяц занятий. Можно проверить за пять минут — или выбрать самому,
          если и так знаешь.
        </p>
        <div className="onboarding-rhino" aria-hidden="true">
          <rhino-mascot state="think" hat={hatFor(model.currentLanguage.code)} />
        </div>
        {model.hasPlacementTest && (
          <ActionCard
            icon="◎"
            color="var(--violet)"
            kicker="5 МИНУТ · 12 ВОПРОСОВ"
            title="Проверить уровень"
            subtitle="Короткий тест: чтение, грамматика, на слух"
            onClick={() => { model.startPlacement(); setStage('placement') }}
          />
        )}
        <ActionCard
          icon="✎"
          color="var(--amber)"
          kicker="БЫСТРО"
          title="Выбрать самому"
          subtitle="От A1 до C1 — поправим после первого урока"
          onClick={() => setStage('setup')}
        />
        <div className="gap-18" />
        <SecondaryButton onClick={() => model.openLanguages()}>Назад к курсам</SecondaryButton>
      </div>
    )
  }

  const note = GOALS.find((item) => item.minutes === goal)?.note ?? ''

  return (
    <div className="scroll onboarding">
      <h1 className="onboarding-title">С чего начнём?</h1>
      <p className="onboarding-lead">
        Два ответа — и я соберу маршрут. Ошибёшься с уровнем — поправим после первого урока.
      </p>

      <SectionTitle hint="Честно, а не как хотелось бы">Уровень</SectionTitle>
      <div className="pill-row">
        {LEVELS.map((item) => (
          <button key={item} className="pill-button" onClick={() => setLevel(item)}>
            <Pill selected={item === level}>{LEVEL_LINE[item]}</Pill>
          </button>
        ))}
      </div>

      <SectionTitle hint="Столько времени в день ты правда найдёшь">Цель</SectionTitle>
      <div className="pill-row">
        {GOALS.map((item) => (
          <button key={item.minutes} className="pill-button" onClick={() => setGoal(item.minutes)}>
            <Pill selected={item.minutes === goal}>{item.label}</Pill>
          </button>
        ))}
      </div>

      {/* Keyed by the pair, so the card blinks when either answer changes. */}
      <div className="plan-card" key={`${level}-${goal}`}>
        <p className="plan-kicker">Что получится</p>
        <div className="plan-columns">
          <div>
            <p className="plan-figure">{perDay(goal)}</p>
            <p className="plan-label">упражнений в день</p>
          </div>
          <span className="plan-rule" />
          <div>
            {/* Counted off the material this course actually holds rather than off the
                prototype's fixed fourteen weeks: Spanish A1 alone is ninety-two hours,
                and a promise of a month would be a lie told on the first screen. */}
            <p className="plan-figure">{model.levelPace(level, goal)}</p>
            <p className="plan-label">до конца уровня</p>
          </div>
        </div>
        <p className="plan-note">Уровень {level} · {note}</p>
      </div>

      <PrimaryButton onClick={() => setStage('ready')}>Собрать маршрут</PrimaryButton>
      <div className="gap-10" />
      <SecondaryButton onClick={() => model.openLanguages()}>Назад к курсам</SecondaryButton>
    </div>
  )
}
