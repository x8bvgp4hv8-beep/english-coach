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


/**
 * Испанские слова с картинкой — размечены руками по словам, которые в курсе есть.
 *
 * Иначе карта была бы мёртвым грузом: написать «el perro → 🐕» легко, но если курс
 * никогда не говорит «perro», картинка не покажется ни разу. Поэтому список собран из
 * 343 одиночных испанских слов курсов A1 и A2 — из них изображается вот столько.
 *
 * Вычитано глазами целиком (82 записи, 15.09.2026): шесть врали и убраны — «cola → 👯
 * люди с ушами», «cuenta → 💸 улетающие деньги», «tostadora → 🍞 хлеб», «brazo → ✋ ладонь»,
 * «norte» и «sur» получали одну и ту же 🧭 (в вопросе с картинками это два верных ответа).
 * Убраны и сомнительные «espacio → 💺», «firma → 📝», «multa → 💸».
 *
 * Русский перевод как мост тоже работает и добавляется автоматически ниже: «el bolso —
 * сумка» находит картинку английского «bag — сумка». Но сам по себе мост даёт мало (3
 * слова на A1, 30 на A2): русские подписи у двух курсов сформулированы по-разному.
 */
const CURATED_ES = {
  abrigo: 'coat',
  accidente: 'collision',
  ajo: 'garlic',
  ambulancia: 'ambulance',
  arroz: 'cooked rice',
  ascensor: 'elevator',
  barrio: 'cityscape',
  'batería': 'battery',
  boda: 'wedding',
  bolso: 'handbag',
  cargador: 'electric plug',
  carretera: 'motorway',
  'caña': 'beer mug',
  cebolla: 'onion',
  cumple: 'birthday cake',
  puesto: 'briefcase',
  resguardo: 'receipt',
  chef: 'cook',
  cita: 'spiral calendar',
  'contraseña': 'locked with key',
  'correo electrónico': 'e-mail',
  cuchillo: 'kitchen knife',
  destornillador: 'screwdriver',
  enlace: 'link',
  ensalada: 'green salad',
  entradas: 'ticket',
  'estación': 'station',
  factura: 'receipt',
  fontanero: 'mechanic',
  gasolinera: 'fuel pump',
  gimnasio: 'person lifting weights',
  herramientas: 'hammer and wrench',
  hierbas: 'herb',
  hora: 'alarm clock',
  lavadora: 'washing machine',
  'librería': 'books',
  libreta: 'notebook',
  llaves: 'key',
  'lámpara': 'light bulb',
  medicamento: 'pill',
  mercado: 'shopping cart',
  mochila: 'backpack',
  noticias: 'newspaper',
  nube: 'cloud',
  'otoño': 'fallen leaf',
  'panadería': 'bread',
  pantalla: 'desktop computer',
  papelera: 'wastebasket',
  papeles: 'page facing up',
  paquete: 'package',
  paracetamol: 'pill',
  paraguas: 'umbrella',
  parque: 'national park',
  pastilla: 'pill',
  pescado: 'fish',
  postre: 'cupcake',
  puente: 'bridge at night',
  puerto: 'anchor',
  'ratón': 'computer mouse',
  'reunión': 'busts in silhouette',
  rodilla: 'leg',
  sal: 'salt',
  'sartén': 'shallow pan of food',
  siesta: 'sleeping face',
  sombrero: 'top hat',
  sonido: 'speaker high volume',
  tarjeta: 'credit card',
  tarta: 'birthday cake',
  tique: 'receipt',
  ventilador: 'wind face',
  vuelo: 'airplane',
  zapatillas: 'running shoe',
  zumo: 'tropical drink',
}

/**
 * Испанские слова, у которых картинка берётся через русское словарное значение.
 *
 * Значение здесь — английское слово, а не код картинки: код берётся из английской карты,
 * и источник правды остаётся один. Список — результат вычитки всех 126 находок моста;
 * выброшены «vez → ⏰», «lugar → 💺 сиденье», «caso → ❓», «equipo → ⚙️», «sitio → 💺»,
 * «dado → 🦴», «voz → 📝», «partido → 🎉», «máquina → 🚗», «brazo → ✋ ладонь» и ещё восемь —
 * все те, где русское значение совпало по второстепенному смыслу. Две записи поправлены
 * руками: «pie» это ступня (не нога), «vestido» — платье (не одежда вообще).
 */
const BRIDGE_ES = {
  agua: 'water',
  amigo: 'friend',
  'avión': 'plane',
  'año': 'year',
  banco: 'bank',
  barco: 'ship',
  'bebé': 'child',
  boca: 'mouth',
  boda: 'wedding',
  bolsa: 'bag',
  bomba: 'bomb',
  bosque: 'forest',
  caballo: 'horse',
  'café': 'coffee',
  caja: 'box',
  calle: 'street',
  cama: 'bed',
  camino: 'road',
  'camión': 'truck',
  'canción': 'song',
  carne: 'meat',
  carta: 'letter',
  casa: 'home',
  cerebro: 'brain',
  cerveza: 'beer',
  chica: 'girl',
  chico: 'boy',
  cielo: 'sky',
  ciudad: 'city',
  coche: 'car',
  cocina: 'kitchen',
  colegio: 'school',
  'corazón': 'heart',
  'cuestión': 'question',
  'cumpleaños': 'birthday',
  dinero: 'money',
  doctor: 'doctor',
  'día': 'day',
  encuentro: 'meeting',
  escuela: 'school',
  estrella: 'star',
  familia: 'family',
  fuego: 'fire',
  gato: 'cat',
  hielo: 'ice',
  hogar: 'home',
  hombre: 'man',
  hora: 'hour',
  hospital: 'hospital',
  hotel: 'hotel',
  idea: 'idea',
  iglesia: 'church',
  isla: 'island',
  leche: 'milk',
  libro: 'book',
  lista: 'list',
  llave: 'key',
  luz: 'light',
  maestro: 'teacher',
  mano: 'hand',
  matrimonio: 'wedding',
  mes: 'month',
  muchacho: 'boy',
  mujer: 'woman',
  'médico': 'doctor',
  'música': 'music',
  nave: 'ship',
  nena: 'girl',
  'niña': 'girl',
  'niño': 'boy',
  noche: 'night',
  nombre: 'name',
  'número': 'number',
  oficina: 'office',
  ojo: 'eye',
  'oído': 'ear',
  palabra: 'word',
  pan: 'bread',
  papel: 'paper',
  perro: 'dog',
  pie: 'foot',
  playa: 'beach',
  problema: 'problem',
  profesor: 'teacher',
  puerta: 'door',
  radio: 'radio',
  regalo: 'gift',
  reloj: 'clock',
  respuesta: 'answer',
  ropa: 'clothes',
  'río': 'river',
  sal: 'salt',
  sangre: 'blood',
  semana: 'week',
  'señorita': 'girl',
  silla: 'chair',
  sol: 'sun',
  taxi: 'taxi',
  'televisión': 'television',
  'teléfono': 'phone',
  tiempo: 'time',
  tienda: 'store',
  trabajo: 'job',
  tren: 'train',
  'té': 'tea',
  universidad: 'university',
  ventana: 'window',
  vestido: 'dress',
}

const wordlistPath = join(
  root, '..', 'native', 'Sources', 'EnglishCoachCore', 'Resources', 'Languages', 'en',
  'en-wordlist-3000.json',
)
const mapPathFor = (language) => join(
  root, '..', 'native', 'Sources', 'EnglishCoachCore', 'Resources', 'Languages', language,
  `${language}-pictures.json`,
)
const contentDir = join(root, 'public', 'content')
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
  await writeFile(mapPathFor('en'), `${JSON.stringify({
    schemaVersion: 1,
    language: 'en',
    source: 'OpenMoji (CC BY-SA 4.0), openmoji.org',
    items: kept.map(({ w, hex }) => ({ w, hex })),
  }, null, 2)}\n`, 'utf8')

  const nouns = pack.items.filter((entry) => entry.p === 'сущ.').length
  console.log(
    `английских слов с картинкой ${kept.length} из ${nouns} существительных `
    + `(${Math.round(kept.length / nouns * 100)}%), скачано файлов ${downloaded}`
    + `${missing.length ? `, без файла ${missing.length}` : ''}`,
  )
  console.log(`карта → ${mapPathFor('en')}`)

  await buildSpanish({ byAnnotation, pack, english: kept })
}

/**
 * Испанская карта: размеченное руками плюс мост через русский перевод.
 *
 * Перевод у двух курсов общий язык, поэтому «el bolso — сумка» может взять картинку
 * английского «bag — сумка». Мост даёт мало (русские подписи сформулированы по-разному),
 * но то, что даёт, — бесплатно и точно: совпадение полное, а не по догадке.
 */
async function buildSpanish({ byAnnotation, pack, english }) {
  const clean = (text) => text.trim().toLowerCase()
    .replace(/[¿¡]/g, '')
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .replace(/[.!?]+$/, '')
    .replace(/\s+/g, ' ')
    .trim()
  const meanings = (text) => clean(text).split(/[,;]|\sили\s/).map((part) => part.trim()).filter(Boolean)

  // Русский перевод → картинка, из английского списка и уже построенной карты.
  const hexByRussian = new Map()
  const hexByEnglish = new Map(english.map((item) => [item.w.toLowerCase(), item.hex]))
  for (const item of pack.items) {
    const hex = hexByEnglish.get(item.w.toLowerCase())
    if (!hex) continue
    for (const key of meanings(item.t)) if (!hexByRussian.has(key)) hexByRussian.set(key, hex)
  }

  // Слова, которые в испанском курсе действительно есть: карта не должна быть мёртвой.
  const index = JSON.parse(await readFile(join(contentDir, 'es', 'index.json'), 'utf8'))
  const ARTICLE = /^(el|la|los|las|un|una|unos|unas)\s+/
  const courseWords = new Map()
  for (const file of index.courses) {
    const course = JSON.parse(await readFile(join(contentDir, 'es', 'courses', file), 'utf8'))
    for (const chapter of course.chapters) {
      for (const lesson of chapter.lessons) {
        for (const exercise of lesson.exercises) {
          if (exercise.type !== 'flashcard' || !exercise.prompt || !exercise.translation) continue
          const bare = clean(exercise.prompt).replace(ARTICLE, '')
          // Одно или два слова: «correo electrónico» — один предмет, «un café con leche» — нет.
          if (!bare || bare.split(/\s+/).length > 2) continue
          if (!courseWords.has(bare)) courseWords.set(bare, exercise.translation)
        }
      }
    }
  }

  const byWord = new Map()
  const broken = []
  for (const [word, annotation] of Object.entries(CURATED_ES)) {
    const hit = byAnnotation.get(annotation.toLowerCase())
    if (!hit) { broken.push(`${word} → «${annotation}»`); continue }
    if (!courseWords.has(word)) { broken.push(`${word}: в испанском курсе такого слова нет`); continue }
    byWord.set(word, hit.hexcode)
  }
  if (broken.length) {
    console.error(`Испанская разметка не сходится (${broken.length}):`)
    for (const line of broken) console.error('   ', line)
    process.exit(1)
  }

  /**
   * Мост через русский перевод: испанское слово → русское значение → картинка.
   *
   * 14.09 он не работал, и причина была не в идее, а в том, что сравнивать было нечего:
   * с одной стороны стояло словарное значение английского слова, с другой — подпись
   * испанской карточки («Пришлю расписание»). Совпадений почти не находилось, а два из
   * пяти найденных соврали.
   *
   * 15.09 у испанского появился свой частотный список со словарными значениями, и мост
   * сразу дал 126 находок. Все 126 вычитаны, 108 оставлены; выброшены те, где русское
   * значение совпало по второстепенному смыслу.
   *
   * Автоматический поиск по `hexByRussian` при этом остаётся выключенным: он и находит
   * те же слова, но без вычитки, а неверная картинка хуже отсутствующей.
   */
  let bridged = 0
  for (const [word, english] of Object.entries(BRIDGE_ES)) {
    if (byWord.has(word)) continue
    const hex = hexByEnglish.get(english.toLowerCase())
    if (!hex) { broken.push(`${word}: у английского «${english}» нет картинки`); continue }
    byWord.set(word, hex)
    bridged += 1
  }
  if (broken.length) {
    console.error(`Мост не сходится (${broken.length}):`)
    for (const line of broken) console.error('   ', line)
    process.exit(1)
  }
  void hexByRussian

  let downloaded = 0
  for (const hex of new Set(byWord.values())) {
    const file = join(outDir, `${hex}.svg`)
    if (existsSync(file)) continue
    const response = await fetch(`${SVG}/${hex}.svg`)
    if (!response.ok) { byWord.forEach((value, key) => { if (value === hex) byWord.delete(key) }); continue }
    await writeFile(file, await response.text(), 'utf8')
    downloaded += 1
  }

  await writeFile(mapPathFor('es'), `${JSON.stringify({
    schemaVersion: 1,
    language: 'es',
    source: 'OpenMoji (CC BY-SA 4.0), openmoji.org',
    items: [...byWord].map(([w, hex]) => ({ w, hex })),
  }, null, 2)}\n`, 'utf8')
  console.log(
    `испанских слов с картинкой ${byWord.size} из ${courseWords.size} одиночных слов курса`
    + ` (руками ${byWord.size - bridged}, через русский перевод ${bridged}), скачано файлов ${downloaded}`,
  )
  console.log(`карта → ${mapPathFor('es')}`)
}

main().catch((error) => { console.error(error); process.exit(1) })
