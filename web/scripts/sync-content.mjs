// The course packs live with the macOS app and are the single source of truth.
// This copies them into the web app's static assets, so both clients ship identical content.
//
// On disk every file carries its language as a prefix (`en-a1.json`), because SwiftPM
// flattens a resource folder into the bundle root and two `a1.json` would collide there.
// The web has no such problem, so the prefix is dropped on the way out and the language
// becomes a folder: `content/en/courses/a1.json`.
import { cpSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
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
  const courseFiles = files.filter((file) => !/placement|syllabus/.test(file)).map(plain).sort()

  for (const file of files) {
    const name = plain(file)
    const isCourse = courseFiles.includes(name)
    cpSync(join(from, file), join(to, isCourse ? join('courses', name) : name))
  }

  // A manifest, because a static host cannot be asked to list a directory.
  writeFileSync(join(to, 'index.json'), JSON.stringify({ courses: courseFiles }, null, 2) + '\n')
  summary.push(`${language} — ${courseFiles.length} packs`)
}

// The list of languages themselves, for the same reason.
writeFileSync(join(target, 'index.json'), JSON.stringify({ languages }, null, 2) + '\n')

console.log(`content: ${summary.join(', ')} → public/content`)
