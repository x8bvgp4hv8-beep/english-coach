# How this design system is meant to be used

A language trainer for one learner: short daily sessions, a route of units, spaced
repetition. Every component below comes from that app and carries its assumptions.

## The rules that matter

**One obvious action per screen.** `PrimaryButton` is filled and there is never more than
one of it in view. `SecondaryButton` is the same size and weight but unfilled — it is a way
out, not a competing offer. A selected `Choice` is a *state* (tint, border, tick), never a
filled button: filling it would make it weigh the same as the thing that submits, and the
eye would not know which to press.

**Colour is a verdict, not decoration.** Mint means counted, amber means not yet, coral
means this needs attention. `TopicRow` picks its colour from the score — under 60% coral,
under 75% amber, above that mint — and grey means *no record*, which is not the same as a
bad one. Do not use these five accents to brighten a layout; they mean something.

**Say the number, not the percentage.** `Meter` puts the real count in the caption ("7 / 17",
"6 / 10 мин") and lets the bar merely echo it. "62%" is not something a learner can act on.

**Explain an empty section instead of showing zeros.** `EmptyNote` exists because seven
disabled rows of zeros reads as a broken screen. Say what fills it.

**Disabled means visibly disabled.** Every interactive component dims when it stops
accepting input. If you add one, give it a `:disabled` rule.

## Composing

- `KindButton` belongs inside `KindList`; `Choice` inside `ChoiceList`. The containers carry
  the card chrome and the dividers — a lone row outside them looks unfinished.
- `LessonRow` is strung on a rail: pass `first` on the first and `last` on the last of a run,
  or the connecting line will not terminate.
- `ChapterSection` takes its lessons as children and hides them when `open` is false.
  Collapsed is the normal state; only the unit being walked is open.
- `Dialogue` drops its speaker buttons when `onSpeak` is omitted — that is the read-only
  variant, not a broken one.

## Language

The interface is Russian; the material being learned is Spanish or English. Component text
is Russian, informal, second person singular ("нажми", "скажи сам"). Foreign phrases keep
their diacritics — они несут смысл, а не украшают.

## Tokens

One theme, defined in `styles.css`. Radii, borders and shadows all come from tokens
(`--radius`, `--border-w`, `--shadow-card`), so a second theme is a set of values rather
than a second stylesheet. `--tap` is 48px and never changes: it is the smallest thing a
thumb is asked to hit.
