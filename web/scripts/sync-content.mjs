// The course packs live with the macOS app and are the single source of truth.
// This copies them into the web app's static assets, so both clients ship identical content.
import { cpSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..', '..')
const source = join(repoRoot, 'native', 'Sources', 'EnglishCoachCore', 'Resources')
const target = join(here, '..', 'public', 'content')

rmSync(target, { recursive: true, force: true })
mkdirSync(join(target, 'courses'), { recursive: true })

const courseFiles = readdirSync(join(source, 'Courses')).filter((f) => f.endsWith('.json')).sort()
for (const file of courseFiles) {
  cpSync(join(source, 'Courses', file), join(target, 'courses', file))
}
cpSync(join(source, 'Placement', 'placement.json'), join(target, 'placement.json'))
cpSync(join(source, 'Syllabus', 'syllabus.json'), join(target, 'syllabus.json'))

// A manifest, because a static host cannot be asked to list a directory.
writeFileSync(join(target, 'index.json'), JSON.stringify({ courses: courseFiles }, null, 2) + '\n')

console.log(`content: ${courseFiles.length} course packs + placement bank + syllabus → public/content`)
