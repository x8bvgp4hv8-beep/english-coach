import { useState } from 'react'

import { useStore } from './App'
import { Header } from './Header'
import { ChapterSection, LessonRow, SectionTitle } from '../kit'
import type { LessonState } from '../kit'
import type { AppStore } from './store'
import type { Chapter, Lesson } from '../core'

/**
 * The whole level as a route: every unit, every lesson, in the order they unlock.
 *
 * This is the part of the old map screen worth keeping whole. It is long by nature —
 * thirty units is what a level is — which is exactly why it now has a tab to itself
 * instead of sitting three screens below the thing you opened the app to do.
 */
export function Course() {
  const model = useStore()
  const chapters = model.selectedCourse?.chapters ?? []

  return (
    <>
      <Header model={model} title="Курс" />
      <div className="scroll course-scroll">
        <SectionTitle hint="Каждый урок: послушай — новые слова — правило — узнай — скажи сам">
          Маршрут {model.selectedLevel}
        </SectionTitle>
        {chapters.map((chapter, index) => (
          <ChapterBlock key={chapter.id} model={model} chapter={chapter} number={index + 1} />
        ))}
      </div>
    </>
  )
}

/** Open follows the learner by default; a tap overrides it until they tap again. */
function ChapterBlock({ model, chapter, number }: { model: AppStore; chapter: Chapter; number: number }) {
  const done = chapter.lessons.filter((lesson) => model.completed.has(lesson.id)).length
  const isCurrent = chapter.lessons.some((lesson) => model.recommendedLesson?.id === lesson.id)
  const [override, setOverride] = useState<boolean | null>(null)
  const open = override ?? isCurrent

  return (
    <ChapterSection
      number={number}
      title={chapter.title}
      subtitle={chapter.subtitle}
      canDo={chapter.canDo}
      done={done}
      total={chapter.lessons.length}
      open={open}
      onToggle={() => setOverride(!open)}
    >
      {chapter.lessons.map((lesson, index) => (
        <LessonRow
          key={lesson.id}
          title={lesson.title}
          minutes={lesson.estimatedMinutes}
          state={lessonState(model, lesson)}
          checkpoint={lesson.kind === 'checkpoint'}
          first={index === 0}
          last={index === chapter.lessons.length - 1}
          onStart={() => model.startLesson(lesson)}
        />
      ))}
    </ChapterSection>
  )
}

function lessonState(model: AppStore, lesson: Lesson): LessonState {
  if (model.completed.has(lesson.id)) return 'completed'
  if (model.recommendedLesson?.id === lesson.id) return 'current'
  return model.lessonIsUnlocked(lesson) ? 'available' : 'locked'
}
