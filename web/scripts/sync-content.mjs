// The course packs live with the macOS app and are the single source of truth.
// This copies them into the web app's static assets, so both clients ship identical content.
//
// On disk every file carries its language as a prefix (`en-a1.json`), because SwiftPM
// flattens a resource folder into the bundle root and two `a1.json` would collide there.
// The web has no such problem, so the prefix is dropped on the way out and the language
// becomes a folder: `content/en/courses/a1.json`.
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..', '..')
const source = join(repoRoot, 'native', 'Sources', 'EnglishCoachCore', 'Resources', 'Languages')
const target = join(here, '..', 'public', 'content')

rmSync(target, { recursive: true, force: true })

const languages = readdirSync(source, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort()

const summary = []
for (const language of languages) {
  const from = join(source, language)
  const to = join(target, language)
  mkdirSync(join(to, 'courses'), { recursive: true })

  const files = readdirSync(from).filter((file) => file.endsWith('.json'))
  const plain = (file) => file.replace(`${language}-`, '')
  const isTheory = (file) => /^theory-/.test(plain(file))
  const courseFiles = files.filter((file) => !/placement|syllabus/.test(file) && !isTheory(file)).map(plain).sort()
  // Разборы тем едут отдельной папкой и своим списком: это не курс, декодер у них свой,
  // и в `courses/` такой файл уронил бы загрузку целиком.
  const theoryFiles = files.filter(isTheory).map((file) => plain(file).replace('theory-', '')).sort()
  if (theoryFiles.length > 0) mkdirSync(join(to, 'theory'), { recursive: true })

  for (const file of files) {
    const name = plain(file)
    const target = isTheory(file)
      ? join('theory', name.replace('theory-', ''))
      : courseFiles.includes(name) ? join('courses', name) : name
    // Re-emitted without the authoring indentation: the Spanish A1 pack is 3.4 MB
    // pretty-printed and the phone downloads it before the first lesson.
    const json = JSON.parse(readFileSync(join(from, file), 'utf8'))
    writeFileSync(join(to, target), JSON.stringify(json))
  }

  // A manifest, because a static host cannot be asked to list a directory.
  writeFileSync(join(to, 'index.json'), JSON.stringify({ courses: courseFiles, theory: theoryFiles }, null, 2) + '\n')
  summary.push(`${language} — ${courseFiles.length} packs, ${theoryFiles.length} разборов`)
}

// The list of languages themselves, for the same reason.
writeFileSync(join(target, 'index.json'), JSON.stringify({ languages }, null, 2) + '\n')

console.log(`content: ${summary.join(', ')} → public/content`)
