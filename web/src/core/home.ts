/**
 * Откуда учащийся — и почему это часть курса, а не анкета.
 *
 * Фразы «я из России», «я живу в Москве» — первое, что человек говорит о себе на любом
 * языке. Курс, написанный с одной биографией, даёт эту фразу всем одинаковой: житель
 * Вильнюса заучивает, что он из Москвы, и потом в разговоре подставляет своё слово
 * впервые в жизни — в тот момент, когда думать некогда.
 *
 * Поэтому в содержании стоят подстановки `{country}` и `{city}`, а сюда приходит то,
 * что человек указал о себе. Замена делается один раз при загрузке курса, до сессии:
 * дальше упражнение обычное, и проверка ответа ничего не знает о подстановках.
 */

export interface LearnerHome {
  /** Страна по-английски, как её называют в речи: Russia, Lithuania, Kazakhstan. */
  country: string
  /** Город по-английски. Пустая строка — если человек не захотел называть. */
  city: string
  /** Страна по-русски — для условия задания: «Я из Литвы». */
  title?: string
  /** Город по-русски, там же. */
  cityTitle?: string
}

/**
 * Пока человек не сказал, откуда он.
 *
 * Это заведомо чужая страна, и так и задумано: пусть пример читается как пример, а не
 * как утверждение о самом учащемся. Как только он назовёт свою — все упражнения станут
 * говорить о нём.
 */
export const DEFAULT_HOME: LearnerHome = { country: 'Spain', city: 'Madrid', title: 'Испании', cityTitle: 'Мадрида' }

/** Страны, которые предлагаются списком; всё остальное человек вписывает сам. */
/**
 * Список для выбора одним касанием. `title` и `cityTitle` стоят в родительном падеже:
 * условие задания читается «Я из Литвы», а не «Я из Литва».
 */
export const COMMON_COUNTRIES: ReadonlyArray<LearnerHome & { label: string }> = [
  { label: 'Россия', country: 'Russia', city: 'Moscow', title: 'России', cityTitle: 'Москвы' },
  { label: 'Литва', country: 'Lithuania', city: 'Vilnius', title: 'Литвы', cityTitle: 'Вильнюса' },
  { label: 'Латвия', country: 'Latvia', city: 'Riga', title: 'Латвии', cityTitle: 'Риги' },
  { label: 'Эстония', country: 'Estonia', city: 'Tallinn', title: 'Эстонии', cityTitle: 'Таллина' },
  { label: 'Казахстан', country: 'Kazakhstan', city: 'Almaty', title: 'Казахстана', cityTitle: 'Алматы' },
  { label: 'Грузия', country: 'Georgia', city: 'Tbilisi', title: 'Грузии', cityTitle: 'Тбилиси' },
  { label: 'Армения', country: 'Armenia', city: 'Yerevan', title: 'Армении', cityTitle: 'Еревана' },
  { label: 'Беларусь', country: 'Belarus', city: 'Minsk', title: 'Беларуси', cityTitle: 'Минска' },
  { label: 'Украина', country: 'Ukraine', city: 'Kyiv', title: 'Украины', cityTitle: 'Киева' },
  { label: 'Израиль', country: 'Israel', city: 'Tel Aviv', title: 'Израиля', cityTitle: 'Тель-Авива' },
  { label: 'Германия', country: 'Germany', city: 'Berlin', title: 'Германии', cityTitle: 'Берлина' },
  { label: 'Сербия', country: 'Serbia', city: 'Belgrade', title: 'Сербии', cityTitle: 'Белграда' },
]

const FIELDS = ['prompt', 'translation', 'example', 'title', 'explanation', 'canonicalAnswer', 'hint', 'summary'] as const

/** Одна строка с подставленными значениями. */
export function fill(text: string, home: LearnerHome): string {
  const city = home.city.trim() || home.country
  // Английские подстановки идут в изучаемый язык, русские — в условие задания.
  return text
    .replace(/\{country\}/g, home.country)
    .replace(/\{city\}/g, city)
    .replace(/\{страна\}/g, home.title ?? home.country)
    .replace(/\{город\}/g, home.cityTitle ?? city)
}

/**
 * Курс, в котором подстановки заменены на данные учащегося.
 *
 * Возвращается новая структура: исходный разбор остаётся нетронутым, чтобы смена
 * страны в настройках пересобирала курс из того же сырья, а не из уже подставленного.
 */
export function personalise<T>(courses: T, home: LearnerHome): T {
  const walk = (value: unknown): unknown => {
    if (typeof value === 'string') return fill(value, home)
    if (Array.isArray(value)) return value.map(walk)
    if (value && typeof value === 'object') {
      const out: Record<string, unknown> = {}
      for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
        // Идентификаторы и служебные поля не трогаем: подстановка в id развалила бы
        // и прогресс, и повторения — они привязаны именно к строке идентификатора.
        out[key] = key === 'id' || !isFillable(key, item) ? item : walk(item)
      }
      return out
    }
    return value
  }
  return walk(courses) as T
}

/** Строки подставляем только там, где это текст для человека. */
function isFillable(key: string, value: unknown): boolean {
  if (typeof value !== 'string') return true
  return (FIELDS as readonly string[]).includes(key) || key === 'text' || key === 'speaker'
}

/** Есть ли в курсе подстановки — чтобы не пересобирать его зря. */
export function hasPlaceholders(text: string): boolean {
  return /\{(country|city|страна|город)\}/.test(text)
}
