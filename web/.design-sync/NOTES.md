# design-sync notes — english-coach

Repo-specific things a future sync should know before it starts debugging.

## Layout

- The design system is `web/src/kit/` — 22 presentational components, plain props, no
  store. It is **not** a separate package: it lives inside the app (`english-coach-web`,
  private) and is built by a second, kit-only build.
- `npm run build:kit` (from `web/`) = `rm -rf dist-kit && tsc -p tsconfig.kit.json &&
  vite build -c vite.config.kit.ts`. It emits `dist-kit/index.es.js` plus a flat `.d.ts`
  tree. The app's own `npm run build` does NOT produce it — always run `build:kit` first.
- `vite.config.kit.ts` sets `copyPublicDir: false` on purpose. Without it the app's
  `public/` (course JSON, icons, push-sw.js) lands in `dist-kit/` and the converter has
  to wade through it.
- The converter is run from `web/`, not from the repo root:
  `node .ds-sync/package-build.mjs --config .design-sync/config.json
   --node-modules ./node_modules --entry ./dist-kit/index.es.js --out ./ds-bundle`

## Styling

- `cfg.cssEntry` is `src/kit/kit.css` — tokens plus one rule set per component, default
  theme only. The app's `src/styles.css` `@import`s it and adds screen layout and the two
  alternative themes (`cartoon`, `night`) on top. **Those two themes are deliberately out
  of the kit**: the design system ships one theme, done well.
- Because of that split, a rule that belongs to a reusable part belongs in `kit.css`, and
  anything screen-shaped stays in `styles.css`. Moving a component rule the wrong way
  silently changes what designs built in Claude Design look like.

## Known render warns

These are triaged and expected — a warn NOT on this list is new and worth looking at.

- `[FONT_MISSING] "SF Pro Text"` — resolved via `cfg.runtimeFontPrefixes`. The DS uses the
  OS system-font stack by design (`-apple-system, BlinkMacSystemFont, 'SF Pro Text',
  'Segoe UI', system-ui`); there is no brand webfont to ship and never was. The prefixes
  suppress a warning about fonts the operating system provides.
- `[GRID_OVERFLOW]` fired on 18 of the 22 components and is resolved by
  `cfg.overrides.<Name>.cardMode: "column"`. The previews wrap their component in a
  300–380 px box because that is the width the app actually renders at (`.app` is
  `max-width: 560px` minus 18 px of padding either side), and that is wider than a
  multi-column card cell. Column mode is the right answer here, not narrower previews:
  shrinking them would show the components at a width the app never uses.

## Open finding: no disabled state for form controls

`:disabled` styling exists for `.kind`, `.lesson`, `.primary` and `.topic`, and is
**missing** for `.choice`, `.answer-field`, `.secondary` and `.token`. A locked answer,
a checked translation field, a dead secondary button and a submitted word tray all render
pixel-identical to their live versions — in the app as well as in the previews.

This predates the kit extraction; it was inherited verbatim from `styles.css`. It is
reported to the owner and **deliberately not fixed**, because it changes how the app
looks and that call is his. Four preview cells that would have advertised the state
(`Choice/Answered`, `AnswerField/Checked`, `SecondaryButton/Disabled`,
`WordOrderTray/Locked`) were replaced with honest ones rather than shipping cards that
promise a state the design system does not render.

The fix, if it is ever wanted, is four lines in `src/kit/kit.css`:

```css
.choice:disabled       { opacity: 0.5; }
.answer-field:disabled { opacity: 0.6; }
.secondary:disabled    { opacity: 0.45; box-shadow: none; }
.token:disabled        { opacity: 0.5; }
```

After that, restore the four cells and re-grade them.

## Re-sync risks

- **The app is being renamed.** `cfg.globalName` is `CoachKit`, chosen to survive that
  rename; `cfg.pkg` is `english-coach-web` and stays, because the npm package name is
  internal and renaming it buys nothing. If the brand should reach the design agent's
  code (`window.CoachKit.ActionCard`), change `globalName` and re-run the full build —
  uploads are idempotent, so it costs one rebuild and one re-upload, nothing else.
- **`projectId` is not yet recorded.** No Claude Design project exists for this repo yet;
  the target was deferred until the app's new name is settled. The first run to create one
  must write its id into `config.json` immediately, before uploading anything.
- **Previews are hand-authored, all 22.** They live in `.design-sync/previews/` and are
  committed. They hard-code realistic Spanish/Russian course content that mirrors — but is
  not read from — `native/Sources/EnglishCoachCore/Resources/Languages/es/`. If the course
  content is restructured, the previews will still render; they will just stop being
  representative. That is a slow rot, not a build failure.
- **Typewriter needs `speed={1}`** in its preview. The component starts with an empty
  string and types one character per `speed` ms, so at the default 55 ms a headless
  screenshot catches it nearly blank (`[RENDER_BLANK]`, PNG under 5 KB). Do not "fix" this
  by editing the component.
