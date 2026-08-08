/**
 * The Coachirinho component kit.
 *
 * Every component here is presentational: props in, markup out, no store, no speech
 * synthesis, no knowledge of a course. The screens in `src/app/` hold the state and
 * hand these components strings and callbacks — which is also what makes the kit
 * something a design tool can render on its own.
 *
 * The look lives in `kit.css`, which the app's `styles.css` imports: tokens first,
 * then one rule set per component. Nothing here carries inline styling that a token
 * could carry instead.
 */

export { AbilityChip } from './AbilityChip'
export type { AbilityChipProps } from './AbilityChip'
export { ActionCard } from './ActionCard'
export type { ActionCardProps } from './ActionCard'
export { AlertBar } from './AlertBar'
export type { AlertBarProps } from './AlertBar'
export { AnswerField } from './AnswerField'
export type { AnswerFieldProps } from './AnswerField'
export { ChapterSection } from './ChapterSection'
export type { ChapterSectionProps } from './ChapterSection'
export { Choice } from './Choice'
export type { ChoiceProps } from './Choice'
export { ChoiceList } from './ChoiceList'
export type { ChoiceListProps } from './ChoiceList'
export { Dialogue } from './Dialogue'
export type { DialogueLineData, DialogueProps } from './Dialogue'
export { EmptyNote } from './EmptyNote'
export type { EmptyNoteProps } from './EmptyNote'
export { Feedback } from './Feedback'
export type { FeedbackProps, Verdict } from './Feedback'
export { KindButton } from './KindButton'
export type { KindButtonProps } from './KindButton'
export { KindList } from './KindList'
export type { KindListProps } from './KindList'
export { LanguageCard } from './LanguageCard'
export type { LanguageCardProps } from './LanguageCard'
export { LessonRow } from './LessonRow'
export type { LessonRowProps, LessonState } from './LessonRow'
export { Meter } from './Meter'
export type { MeterProps } from './Meter'
export { Pill } from './Pill'
export type { PillProps } from './Pill'
export { PrimaryButton } from './PrimaryButton'
export type { PrimaryButtonProps } from './PrimaryButton'
export { SecondaryButton } from './SecondaryButton'
export type { SecondaryButtonProps } from './SecondaryButton'
export { SectionTitle } from './SectionTitle'
export type { SectionTitleProps } from './SectionTitle'
export { TopicRow } from './TopicRow'
export type { TopicRowProps } from './TopicRow'
export { Typewriter } from './Typewriter'
export type { TypewriterProps } from './Typewriter'
export { WordOrderTray } from './WordOrderTray'
export type { WordOrderTrayProps } from './WordOrderTray'
