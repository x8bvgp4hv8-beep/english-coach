/**
 * Картинки к словам: карта «слово → картинка» и сами файлы.
 *
 * Кристиан 14.09.2026, посмотрев Duolingo: «много заданий с визуалами, с карточками».
 * Набор выбран OpenMoji (CC BY-SA 4.0): 4565 цветных SVG, бесплатно, офлайн, юридически
 * чисто — в отличие от иллюстраций, которые пришлось бы генерировать на каждое слово.
 *
 *   node scripts/build-pictures.mjs
 *
 * Результат: `native/.../en/en-pictures.json` (карта — это контент, он живёт там) и
 * `web/public/pictures/<код>.svg` (файлы — это ассеты, они рядом с озвучкой).
 *
 * **Главное правило: неверная картинка хуже отсутствующей.** Она учит не тому слову, и
 * человек этого даже не заметит. Поэтому автоматическое совпадение принимается только
 * точное — имя картинки равно слову, — а всё остальное размечено руками и проверяется
 * по имени: опечатка в имени валит сборку, а не уезжает в приложение.
 *
 * Замеры, на которых правило и стоит. Свободные метки OpenMoji («tags») дают 1117 слов
 * из 3000, но среди них «cancer → 🦀 краб», «pool → 👙 бикини», «jump → 🦘 кенгуру»,
 * «summer → 🍺 кружка пива». Ровно поэтому метки здесь не используются.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const METADATA = 'https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/data/openmoji.json'
const SVG = 'https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/color/svg'

/** Группы, где картинка изображает предмет или действие, а не понятие, флаг или знак. */
const GOOD_GROUPS = new Set(['food-drink', 'animals-nature', 'travel-places', 'objects', 'activities', 'people-body', 'smileys-emotion'])
/** Чьё имя предпочесть, если слово нашлось в двух группах. */
const RANK = ['food-drink', 'animals-nature', 'objects', 'travel-places', 'activities', 'people-body', 'smileys-emotion']

/**
 * Приставки, которые не меняют понятия: «red apple» — всё ещё яблоко.
 *
 * Список закрытый, потому что обратные примеры рядом: «monkey face» — не лицо,
 * «muted speaker» — не колонка, «hot face» — не лицо, а смайл.
 */
const HARMLESS = new Set([
  'red', 'green', 'blue', 'white', 'black', 'yellow', 'brown', 'purple', 'orange', 'grey',
  'gray', 'cold', 'roasted', 'wrapped', 'spiral', 'maple', 'crescent', 'full', 'new',
  'open', 'closed', 'alarm', 'round', 'small', 'large',
])

/**
 * Слова, у которых точное совпадение имени врёт по смыслу.
 *
 * «mate» в наборе — напиток мате, а в списке это «приятель»; «head» рисуется мозгом;
 * «hole» — смайлом с дырой. Совпадения формально точные, поэтому правило их не отличит
 * и приходится называть по одному.
 */
const LIARS = new Set([
  'mate', 'head', 'hole', 'face', 'side', 'line', 'point', 'bit', 'part', 'case',
  'space', 'field', 'ground', 'top', 'back', 'end', 'plant', 'driver',
])

/**
 * Размеченное руками: слово → имя картинки в наборе.
 *
 * Только предметы, которые узнаются без подписи. Слова вроде «freedom» или «reason»
 * здесь отсутствуют не по забывчивости: нарисовать их нельзя, а плохая картинка хуже
 * никакой.
 */
const CURATED = {
  water: 'droplet', book: 'open book', car: 'automobile', house: 'house', home: 'house',
  phone: 'mobile phone', tree: 'deciduous tree', sun: 'sun', rain: 'cloud with rain',
  snow: 'snowflake', wind: 'wind face', cloud: 'cloud', sky: 'sun behind cloud',
  sea: 'water wave', river: 'water wave', beach: 'beach with umbrella', island: 'desert island',
  city: 'cityscape', street: 'motorway', road: 'motorway', bridge: 'bridge at night',
  train: 'train', bus: 'bus', plane: 'airplane', airplane: 'airplane', ship: 'ship',
  boat: 'sailboat', bicycle: 'bicycle', bike: 'bicycle', taxi: 'taxi', truck: 'delivery truck',
  key: 'key', door: 'door', bed: 'bed', chair: 'chair',
  kitchen: 'cooking', bathroom: 'shower', toilet: 'toilet', shower: 'shower', soap: 'soap',
  money: 'money bag', coin: 'coin', card: 'credit card', bank: 'bank', shop: 'convenience store',
  store: 'convenience store', market: 'shopping cart', bag: 'shopping bags', box: 'package',
  letter: 'envelope', mail: 'envelope', email: 'e-mail', newspaper: 'newspaper', map: 'world map',
  ticket: 'ticket', passport: 'passport control', camera: 'camera', computer: 'laptop',
  laptop: 'laptop', keyboard: 'keyboard', screen: 'desktop computer', watch: 'watch',
  lamp: 'light bulb', light: 'light bulb', candle: 'candle', mirror: 'mirror', clothes: 't-shirt',
  shirt: 't-shirt', dress: 'dress', shoe: 'running shoe', shoes: 'running shoe', hat: 'top hat',
  coat: 'coat', glasses: 'glasses', ring: 'ring', umbrella: 'umbrella', bread: 'bread',
  milk: 'glass of milk', cheese: 'cheese wedge', meat: 'cut of meat', chicken: 'poultry leg',
  rice: 'cooked rice', soup: 'pot of food', salt: 'salt', sugar: 'candy', coffee: 'hot beverage',
  tea: 'teacup without handle', juice: 'tropical drink', wine: 'wine glass', beer: 'beer mug',
  fruit: 'red apple', banana: 'banana', orange: 'tangerine', lemon: 'lemon', grape: 'grapes',
  potato: 'potato', tomato: 'tomato', carrot: 'carrot', onion: 'onion', salad: 'green salad',
  cake: 'birthday cake', chocolate: 'chocolate bar', ice: 'ice', flower: 'cherry blossom',
  grass: 'sheaf of rice', leaf: 'maple leaf', forest: 'evergreen tree', garden: 'potted plant',
  animal: 'paw prints', bird: 'bird', cow: 'cow', sheep: 'ewe', bear: 'bear', lion: 'lion',
  monkey: 'monkey', elephant: 'elephant', rabbit: 'rabbit', insect: 'bug', bee: 'honeybee',
  hand: 'raised hand', foot: 'foot', leg: 'leg', tooth: 'tooth',
  heart: 'red heart', bone: 'bone', blood: 'drop of blood', doctor: 'health worker',
  nurse: 'health worker', hospital: 'hospital', medicine: 'pill', teacher: 'teacher',
  student: 'student', school: 'school', university: 'graduation cap', police: 'police officer',
  firefighter: 'firefighter', cook: 'cook', worker: 'factory worker',
  family: 'family', friend: 'people holding hands', child: 'child', boy: 'boy', girl: 'girl',
  birthday: 'birthday cake', party: 'party popper', music: 'musical notes', guitar: 'guitar',
  piano: 'musical keyboard', song: 'musical note', film: 'clapper board', game: 'video game',
  ball: 'soccer ball', football: 'soccer ball', sport: 'person running', gym: 'person lifting weights',
  swimming: 'person swimming', dance: 'woman dancing', run: 'person running', sleep: 'sleeping face',
  work: 'briefcase', office: 'office building', meeting: 'busts in silhouette', job: 'briefcase',
  time: 'alarm clock', hour: 'one o’clock', minute: 'stopwatch', day: 'sun', night: 'night with stars',
  week: 'calendar', month: 'calendar', year: 'calendar', winter: 'snowflake', autumn: 'fallen leaf',
  gift: 'wrapped gift', question: 'red question mark', answer: 'check mark button',
  problem: 'warning', idea: 'light bulb', word: 'memo', page: 'page facing up', pen: 'pen',
  pencil: 'pencil', paper: 'page facing up', note: 'memo', list: 'clipboard', number: 'input numbers',
  language: 'speech balloon', name: 'identification card',
}

const wordlistPath = join(
  root, '..', 'native', 'Sources', 'EnglishCoachCore', 'Resources', 'Languages', 'en',
  'en-wordlist-3000.json',
)
const mapPath = join(
  root, '..', 'native', 'Sources', 'EnglishCoachCore', 'Resources', 'Languages', 'en',
  'en-pictures.json',
)
const outDir = join(root, 'public', 'pictures')

async function main() {
  const emoji = await (await fetch(METADATA)).json()
  const pack = JSON.parse(await readFile(wordlistPath, 'utf8'))

  const byWord = new Map()
  const byAnnotation = new Map()
  for (const item of emoji) {
    if (item.skintone) continue
    const annotation = item.annotation.toLowerCase()
    if (!byAnnotation.has(annotation)) byAnnotation.set(annotation, item)
    if (!GOOD_GROUPS.has(item.group)) continue

    const put = (word, score) => {
      const current = byWord.get(word)
      const rank = RANK.indexOf(item.group)
      if (!current || score > current.score || (score === current.score && rank < current.rank)) {
        byWord.set(word, { hexcode: item.hexcode, annotation, score, rank })
      }
    }
    put(annotation, 100)
    const parts = annotation.split(/\s+/)
    if (parts.length === 2 && HARMLESS.has(parts[0])) put(parts[1], 80)
  }

  // Ручная разметка идёт впереди автоматической и проверяется по имени.
  const broken = []
  for (const [word, annotation] of Object.entries(CURATED)) {
    const hit = byAnnotation.get(annotation.toLowerCase())
    if (!hit) { broken.push(`${word} → «${annotation}»`); continue }
    byWord.set(word, { hexcode: hit.hexcode, annotation: hit.annotation.toLowerCase(), score: 120, rank: 0 })
  }
  if (broken.length) {
    console.error(`В наборе нет таких имён (${broken.length}):`)
    for (const line of broken) console.error('   ', line)
    process.exit(1)
  }
  for (const word of LIARS) byWord.delete(word)

  // Только существительные: у глагола и прилагательного картинка почти всегда врёт
  // («serious → 👔 галстук», «twisted → 🥨 крендель»), у предмета — почти всегда верна.
  const items = []
  for (const entry of pack.items) {
    if (entry.p !== 'сущ.') continue
    const hit = byWord.get(entry.w.toLowerCase())
    if (hit) items.push({ w: entry.w, hex: hit.hexcode, a: hit.annotation })
  }

  await mkdir(outDir, { recursive: true })
  let downloaded = 0
  const missing = []
  for (const item of items) {
    const file = join(outDir, `${item.hex}.svg`)
    if (existsSync(file)) continue
    const response = await fetch(`${SVG}/${item.hex}.svg`)
    if (!response.ok) { missing.push(item.w); continue }
    await writeFile(file, await response.text(), 'utf8')
    downloaded += 1
  }

  const kept = items.filter((item) => !missing.includes(item.w))
  await writeFile(mapPath, `${JSON.stringify({
    schemaVersion: 1,
    language: 'en',
    source: 'OpenMoji (CC BY-SA 4.0), openmoji.org',
    items: kept.map(({ w, hex }) => ({ w, hex })),
  }, null, 2)}\n`, 'utf8')

  const nouns = pack.items.filter((entry) => entry.p === 'сущ.').length
  console.log(
    `слов с картинкой ${kept.length} из ${nouns} существительных `
    + `(${Math.round(kept.length / nouns * 100)}%), скачано файлов ${downloaded}`
    + `${missing.length ? `, без файла ${missing.length}` : ''}`,
  )
  console.log(`карта → ${mapPath}`)
}

main().catch((error) => { console.error(error); process.exit(1) })
