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

## Closed finding: disabled state for form controls

The render check caught that `.choice`, `.answer-field`, `.secondary` and `.token` had no
`:disabled` rule while `.kind`, `.lesson`, `.primary` and `.topic` did — so a locked
answer, a checked translation field, a dead secondary button and a submitted word tray
all rendered pixel-identical to their live versions, in the app as well as in the cards.
Inherited verbatim from `styles.css`, not introduced by the kit extraction.

Fixed with the owner's approval; the four rules are in `kit.css` next to their component.
`.token:disabled:not(.used)` is deliberately narrow — a word already in the tray keeps its
`used` opacity of 0.25 instead of being lifted to 0.5.

Worth knowing for the future: **this is what the preview pass is for.** The gap had been
in the app for months and was invisible until every state was rendered side by side on
one sheet.

## Re-sync risks

- **The app is now called Coachirinho.** `cfg.globalName` is still `CoachKit` and
  `cfg.pkg` is still `english-coach-web` — both internal, both deliberately left alone.
  If the brand should reach the design agent's code (`window.Coachirinho.ActionCard`),
  change `globalName` and re-run the full build; uploads are idempotent, so it costs one
  rebuild and one re-upload and nothing else.
- **There are two Claude Design projects.** `810d9e9e-…` was created under the old name
  ("English Coach — UI Kit") and fully uploaded before the rename; `faa49f04-…`
  ("Coachirinho") is the live one and the only one `config.json` points at. The old one is
  a duplicate and should be deleted by hand in the UI — the tool has no delete-project
  method. Do not re-sync into it.
- **Previews are hand-authored, all 22.** They live in `.design-sync/previews/` and are
  committed. They hard-code realistic Spanish/Russian course content that mirrors — but is
  not read from — `native/Sources/EnglishCoachCore/Resources/Languages/es/`. If the course
  content is restructured, the previews will still render; they will just stop being
  representative. That is a slow rot, not a build failure.
- **Typewriter needs `speed={1}`** in its preview. The component starts with an empty
  string and types one character per `speed` ms, so at the default 55 ms a headless
  screenshot catches it nearly blank (`[RENDER_BLANK]`, PNG under 5 KB). Do not "fix" this
  by editing the component.
