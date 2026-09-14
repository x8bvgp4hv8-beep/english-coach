import { useEffect, useMemo, useState } from 'react'

import { SLOW_RATE, say, stopSpeaking } from './speech'
import { Icon } from '../kit/Icons'
import { PrimaryButton } from '../kit'
import { pictureURL } from '../core'
import type { HearingQuestion, PairItem, PictureQuestion } from '../core'

/**
 * Сами взаимодействия трёх новых форматов — по одному определению на всё приложение.
 *
 * Каждый формат живёт в двух местах: отдельным режимом на «Тренировке» и шагом внутри
 * урока. Если разметку и состояние держать в обоих экранах, они разъедутся на первой же
 * правке — в этом проекте так уже случалось со списком фраз для озвучки. Поэтому здесь
 * лежит поведение, а экраны вокруг только дают материал и решают, что делать по концу.
 *
 * Состояние выбора — местное, в компоненте. В хранилище ему не место: оно про очередь и
 * прогресс, а не про то, какую клетку человек держит нажатой.
 */

/** Перестановка Фишера — Йетса: порядок правой колонки не должен повторять левую. */
function shuffled<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export interface FormatCallbacks {
  /** Попытка по настоящему упражнению: отсюда учится повторение. */
  onAttempt: (exerciseID: string, correct: boolean) => void
  /** Формат закончился — дальше решает экран или урок. */
  onDone: () => void
}

/**
 * «Найди пару»: слова слева, переводы справа, два нажатия.
 *
 * Перетаскивание не используется намеренно: на телефоне оно требует точности, которой
 * нет у человека в метро, и ломается на первом промахе пальцем.
 */
export function PairsBoard({ pairs, onAttempt, onDone, speakLevel, language }: FormatCallbacks & {
  pairs: PairItem[]
  speakLevel?: string
  language?: string
}) {
  const [matched, setMatched] = useState<string[]>([])
  const [picked, setPicked] = useState<string | null>(null)
  const [miss, setMiss] = useState<{ term: string; meaning: string } | null>(null)
  // Порядок правой колонки берётся один раз: перестановка на каждом нажатии сбивала бы
  // глаз, которому и так нужно держать двенадцать строк.
  const meanings = useMemo(() => shuffled(pairs.map((pair) => pair.meaning)), [pairs])

  useEffect(() => { setMatched([]); setPicked(null); setMiss(null) }, [pairs])
  // Ноль пар — не экран, а тупик: шаг сразу отдаётся дальше.
  useEffect(() => { if (pairs.length === 0) onDone() }, [pairs])

  const done = new Set(matched)
  const doneMeanings = new Set(pairs.filter((pair) => done.has(pair.term)).map((pair) => pair.meaning))

  const pickMeaning = (meaning: string) => {
    const pair = pairs.find((item) => item.term === picked)
    if (!pair) return
    const correct = pair.meaning === meaning
    onAttempt(pair.exerciseID, correct)
    setPicked(null)
    if (!correct) { setMiss({ term: pair.term, meaning }); return }
    setMiss(null)
    const next = [...matched, pair.term]
    setMatched(next)
    // Пауза, чтобы человек увидел последнюю пару зелёной, а не провал экрана.
    if (next.length >= pairs.length) setTimeout(onDone, 550)
  }

  const termClass = (term: string) =>
    done.has(term) ? 'pair-cell done'
      : picked === term ? 'pair-cell picked'
      : miss?.term === term ? 'pair-cell miss'
      : 'pair-cell'
  const meaningClass = (meaning: string) =>
    doneMeanings.has(meaning) ? 'pair-cell done'
      : miss?.meaning === meaning ? 'pair-cell miss'
      : 'pair-cell'

  return (
    <>
      <p className="pair-hint">{picked ? 'Теперь перевод' : 'Нажми слово, потом его перевод'}</p>
      <div className="pair-grid">
        <div className="pair-column">
          {pairs.map((pair) => (
            <button
              key={pair.term}
              className={termClass(pair.term)}
              lang={language}
              disabled={done.has(pair.term)}
              onClick={() => {
                setMiss(null)
                setPicked(picked === pair.term ? null : pair.term)
                say(pair.term, speakLevel)
              }}
            >
              {pair.term}
            </button>
          ))}
        </div>
        <div className="pair-column">
          {meanings.map((meaning) => (
            <button
              key={meaning}
              className={meaningClass(meaning)}
              disabled={doneMeanings.has(meaning) || !picked}
              onClick={() => pickMeaning(meaning)}
            >
              {meaning}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

/**
 * Общий счётчик для форматов, которые идут вопрос за вопросом.
 *
 * Пустой набор сразу отдаёт шаг дальше, а не показывает пустоту. Внутри урока это
 * важно до дрожи: шаг без вопросов был бы тупиком — ни кнопки, ни выхода, урок не
 * продолжить. Материал может не собраться по причинам, которых не видно снаружи
 * (например, карта картинок не загрузилась), и падать в тупик приложение не должно.
 */
function useQueue<T>(items: T[], onDone: () => void) {
  const [index, setIndex] = useState(0)
  useEffect(() => { setIndex(0) }, [items])
  useEffect(() => { if (items.length === 0) onDone() }, [items])
  const next = () => {
    if (index + 1 >= items.length) { onDone(); return }
    setIndex(index + 1)
  }
  return { current: items[index] as T | undefined, index, next }
}

/** «Выбери картинку»: слово и четыре картинки, сетка два на два. */
export function PictureRun({ questions, onAttempt, onDone, speakLevel, language }: FormatCallbacks & {
  questions: PictureQuestion[]
  speakLevel?: string
  language?: string
}) {
  const { current, index, next } = useQueue(questions, onDone)
  const [picked, setPicked] = useState<string | null>(null)
  useEffect(() => { setPicked(null) }, [current])

  if (!current) return null

  const tileClass = (hex: string) =>
    !picked ? 'picture-tile'
      : hex === current.hex ? 'picture-tile right'
      : hex === picked ? 'picture-tile wrong'
      : 'picture-tile dim'

  return (
    <>
      <div className="picture-word">
        <span lang={language}>{current.word}</span>
        <button className="verb-speak" onClick={() => say(current.word, speakLevel)} aria-label="Послушать">
          <Icon name="audio" size={16} />
        </button>
      </div>
      <div className="picture-grid">
        {current.options.map((hex) => (
          <button
            key={hex}
            className={tileClass(hex)}
            disabled={Boolean(picked)}
            onClick={() => { setPicked(hex); onAttempt(current.exerciseID, hex === current.hex) }}
          >
            <img src={pictureURL(hex)} alt="" />
          </button>
        ))}
      </div>
      {/* Перевод — только после ответа: до него он сделал бы картинку ненужной. */}
      {picked && current.translation && <p className="exercise-hint">{current.translation}</p>}
      {picked && (
        <div className="format-next">
          <PrimaryButton onClick={next}>{index + 1 >= questions.length ? 'Готово' : 'Дальше'}</PrimaryButton>
        </div>
      )}
    </>
  )
}

/** «Что ты слышишь»: фраза звучит, на экране четыре варианта. */
export function HearingRun({ questions, onAttempt, onDone, speakLevel, language }: FormatCallbacks & {
  questions: HearingQuestion[]
  speakLevel?: string
  language?: string
}) {
  const { current, index, next } = useQueue(questions, onDone)
  const [picked, setPicked] = useState<string | null>(null)

  const text = current?.text
  useEffect(() => {
    setPicked(null)
    if (text) say(text, speakLevel)
  }, [text])
  useEffect(() => () => stopSpeaking(), [])

  if (!current) return null

  const optionClass = (option: string) =>
    !picked ? 'hear-option'
      : option === current.text ? 'hear-option right'
      : option === picked ? 'hear-option wrong'
      : 'hear-option dim'

  return (
    <>
      <button className="play-big" onClick={() => say(current.text, speakLevel)} aria-label="Прослушать">🔊</button>
      <div className="listen-row">
        <button className="listen blue" onClick={() => say(current.text, speakLevel)}>↻ Ещё раз</button>
        <button className="listen blue" onClick={() => say(current.text, speakLevel, undefined, SLOW_RATE)}>🐢 Медленно</button>
      </div>
      <div className="hear-options">
        {current.options.map((option) => (
          <button
            key={option}
            className={optionClass(option)}
            lang={language}
            disabled={Boolean(picked)}
            onClick={() => { setPicked(option); onAttempt(current.exerciseID, option === current.text) }}
          >
            {option}
          </button>
        ))}
      </div>
      {picked && current.gloss && <p className="exercise-hint">{current.gloss}</p>}
      {picked && (
        <div className="format-next">
          <PrimaryButton onClick={next}>{index + 1 >= questions.length ? 'Готово' : 'Дальше'}</PrimaryButton>
        </div>
      )}
    </>
  )
}
