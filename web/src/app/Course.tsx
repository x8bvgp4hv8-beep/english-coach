import { useEffect, useRef } from 'react'

import { useStore } from './App'
import { Header } from './Header'
import { plural } from './plural'
import { Icon } from '../kit/Icons'
import { PrimaryButton } from '../kit'
import type { IconName } from '../kit/Icons'
import type { AppStore } from './store'
import type { Lesson } from '../core'

/**
 * The level as a road: every unit a banner, every lesson a stop on the way.
 *
 * The list this replaced was honest and unreadable — thirty collapsed rows of "0 / 2".
 * A road answers the question the list could not: where am I, and how much of it is
 * behind me. The current stop is the only large thing on the screen and the page scrolls
 * to it on arrival, so opening the tab never starts with hunting.
 */
export function Course() {
  const model = useStore()
  const chapters = model.selectedCourse?.chapters ?? []
  const next = model.recommendedLesson
  const place = model.nextPlace
  const currentRef = useRef<HTMLDivElement>(null)

  // The road is long; land on the stop the learner is at rather than at the trailhead.
  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: 'center' })
  }, [next?.id])

  return (
    <>
      <Header model={model} />
      <div className="scroll route-scroll">
        {next && (
          <div className="here-card">
            <p className="here-kicker">Сейчас здесь</p>
            <p className="here-title">{next.title}</p>
            {place && <p className="here-where">Блок {place.number} · {place.chapter}</p>}
            <PrimaryButton onClick={() => model.startLesson(next)}>Продолжить</PrimaryButton>
          </div>
        )}
        <p className="route-caption">{routeCaption(model)}</p>

        <div className="route-map">
          {chapters.map((chapter, chapterIndex) => {
            const done = chapter.lessons.filter((lesson) => model.completed.has(lesson.id)).length
            return (
              <div className="route-chapter" key={chapter.id}>
                <div className="route-banner">
                  <div className="route-banner-body">
                    <p className="route-banner-kicker">Блок {chapterIndex + 1}</p>
                    <p className="route-banner-title">{chapter.title}</p>
                    {chapter.subtitle && <p className="route-banner-note">{chapter.subtitle}</p>}
                  </div>
                  <span className="route-banner-count">{done} / {chapter.lessons.length}</span>
                </div>
                {chapter.lessons.map((lesson, index) => (
                  <Node
                    key={lesson.id}
                    model={model}
                    lesson={lesson}
                    offset={WAVE[index % WAVE.length]}
                    currentRef={model.recommendedLesson?.id === lesson.id ? currentRef : undefined}
                  />
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

/**
 * The zig-zag, in pixels of horizontal offset.
 *
 * Copied from the prototype rather than generated: a sine would put stops at heights a
 * thumb has to hunt for, and this shape was drawn against the map so the road bends
 * where the drawing has room for it.
 */
const WAVE = [0, 52, 74, 52, 0, -52, -74, -52]

function Node(
  { model, lesson, offset, currentRef }:
  { model: AppStore; lesson: Lesson; offset: number; currentRef?: React.RefObject<HTMLDivElement> },
) {
  const done = model.completed.has(lesson.id)
  const current = model.recommendedLesson?.id === lesson.id
  const open = model.lessonIsUnlocked(lesson)
  const state = done ? 'done' : current ? 'current' : open ? 'open' : 'locked'
  const icon: IconName = done ? 'check' : lesson.kind === 'checkpoint' ? 'target' : open || current ? 'play' : 'lock'

  return (
    <div className="route-stop" style={{ transform: `translateX(${offset}px)` }} ref={currentRef}>
      {current && <span className="route-badge">Старт</span>}
      <button
        className={`route-node ${state}`}
        disabled={state === 'locked'}
        onClick={() => model.startLesson(lesson)}
      >
        <Icon name={icon} size={current ? 30 : 25} />
      </button>
      <span className="route-name">{lesson.title}</span>
      <span className="route-minutes">{lesson.estimatedMinutes} мин</span>
    </div>
  )
}

/** One line over the road: how much of the level is already behind. */
function routeCaption(model: AppStore): string {
  const { done, total } = model.levelProgress
  if (total === 0) return ''
  if (done === 0) return `Уровень ${model.selectedLevel} · ${total} ${plural(total, 'блок', 'блока', 'блоков')} впереди`
  return `Уровень ${model.selectedLevel} · ${done} из ${total} ${plural(total, 'блока', 'блоков', 'блоков')} позади`
}
