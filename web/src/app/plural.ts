/**
 * Число словом: «четыре минуты», а не «4 минуты».
 *
 * Прототип говорит с человеком прописью — так фраза читается как речь, а не как
 * показание счётчика. Дальше двадцати цифра уже уместна, и там мы к ней и возвращаемся.
 */
const SPELLED = [
  'ноль', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять',
  'десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать', 'пятнадцать',
  'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать', 'двадцать',
]

/** Only the first two words carry gender in Russian; the rest are the same either way. */
const FEMININE: Record<number, string> = { 1: 'одна', 2: 'две' }

export function spell(count: number, feminine = false): string {
  if (feminine && FEMININE[count]) return FEMININE[count]
  return SPELLED[count] ?? String(count)
}

/** Русское склонение по числу: 1 час, 2 часа, 5 часов. */
export function plural(count: number, one: string, few: string, many: string): string {
  const mod100 = count % 100
  const mod10 = count % 10
  if (mod100 >= 11 && mod100 <= 14) return many
  if (mod10 === 1) return one
  if (mod10 >= 2 && mod10 <= 4) return few
  return many
}
