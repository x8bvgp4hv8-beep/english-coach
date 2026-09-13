/**
 * Режимы тренировки и одно правило на всех: чем режим открывается.
 *
 * До этого правила было два, и они противоречили друг другу на одном экране. «Фразы»,
 * «Слова» и «Формы глагола» на свежем уровне работали, потому что берут карточки — а
 * карточки доступны и в непройденных уроках. «Перевод», «Тесты» и «Собрать предложение»
 * молчали, потому что производство открывается только по пройденному. Обе половины верны,
 * но на экране это выглядело так: одиннадцать строк, три из них серые с подписью «пока
 * нечего» — и ни слова о том, чем они открываются. Человек читает это как поломку, а не
 * как замысел, тем более что материал на уровне есть: на B1 2 790 тестов и 3 216 переводов.
 *
 * Тексты короткие намеренно: подпись в два ряда делает строку выше соседних, а «строчки
 * слишком высокие, типа в два ряда» — это дословная жалоба, с которой началось выравнивание
 * интерфейса. Объяснение «почему производство закрыто» живёт одной сноской под списком, а не
 * десятью разными строками.
 *
 * Поэтому закрытый режим обязан сказать не «пока нечего», а что именно его откроет. Разница
 * между «ещё не пройдено» и «на уровне такого нет» считается, а не угадывается: счётчик
 * режима берётся дважды — по пройденному и по всему уровню, — и подпись выбирается по
 * второму. Второй счёт ленивый: он нужен только для закрытых режимов, а их немного.
 */
import { ListeningEngine } from './listening'
import { PRACTICE_KINDS, PracticeEngine } from './practice'
import { ShadowingEngine } from './shadowing'
import { VerbFormsEngine } from './verbforms'
import { VocabularyEngine } from './vocabulary'
import type { LanguageCode } from './language'
import type { TheoryPack } from './theory'
import type { CEFRLevel, CoursePack } from './types'

export type ModeID =
  | 'shadowing' | 'listening' | 'dialogue' | 'verbforms' | 'vocabulary'
  | 'mixed' | 'flashcard' | 'translate' | 'word_order' | 'multiple_choice'

export type ModeDefinition = {
  id: ModeID
  title: string
  /** Что это за режим — видно, когда он открыт. */
  note: string
  /** Что откроет режим, когда материал на уровне есть, но его ещё не проходили. */
  unlock: string
  /** Что сказать, когда такого материала на уровне нет вовсе. */
  missing: string
  /** Режима ещё нет в приложении — тогда ни то, ни другое не врут. */
  soon?: string
}

/**
 * Порядок тот же, что на экране, и он не случайный: сначала речь (единственное, где
 * работает рот), потом слух (единственное, где текста нет), потом всё остальное.
 */
export const PRACTICE_MODES: ModeDefinition[] = [
  {
    id: 'shadowing',
    title: 'Вслух за диктором',
    note: 'Слушай и повторяй за эталоном',
    unlock: 'Откроется после первого урока',
    missing: 'На этом уровне фраз ещё нет',
  },
  {
    id: 'listening',
    title: 'Аудирование',
    note: 'Слушай и записывай без текста',
    unlock: 'Откроется после первого урока',
    missing: 'На этом уровне фраз ещё нет',
  },
  {
    id: 'dialogue',
    title: 'Диалог',
    note: 'Сначала целиком, потом по репликам',
    unlock: '',
    missing: '',
    // Режима нет, и это честнее, чем «пока нечего»: услышать разговор заново — это
    // знакомство, а не тренировка, поэтому диалоги в пул практики не попадают.
    soon: 'Ещё не сделано',
  },
  {
    id: 'verbforms',
    title: 'Формы глагола',
    note: 'Дана первая — введи остальные',
    unlock: 'Нужен урок или разбор с таблицей',
    missing: 'Неправильных глаголов здесь нет',
  },
  {
    id: 'vocabulary',
    title: 'Слова',
    note: 'Слово, перевод и пример',
    unlock: 'Набираются из пройденных уроков',
    missing: 'Отдельных слов здесь не набралось',
  },
  {
    id: 'mixed',
    title: 'Всё вперемешку',
    note: 'Сначала сложное, потом новое',
    unlock: 'Откроется после первого урока',
    missing: 'На этом уровне упражнений нет',
  },
  {
    id: 'flashcard',
    title: 'Фразы',
    note: 'Куски реплик: узнать и вспомнить',
    unlock: 'Откроется после первого урока',
    missing: 'Карточек на этом уровне нет',
  },
  {
    id: 'translate',
    title: 'Перевод',
    note: 'С русского, письменно',
    unlock: 'Откроется после первого урока',
    missing: 'Перевода на этом уровне нет',
  },
  {
    id: 'word_order',
    title: 'Собрать предложение',
    note: 'Слова даны, нужен порядок',
    unlock: 'Откроется после первого урока',
    missing: 'Сборки на этом уровне нет',
  },
  {
    id: 'multiple_choice',
    title: 'Тесты',
    note: 'Выбрать правильный вариант',
    unlock: 'Откроется после первого урока',
    missing: 'Тестов на этом уровне нет',
  },
]

export type ModeState = {
  id: ModeID
  title: string
  ready: boolean
  /** Строка под названием: что это за режим, а у закрытого — чем он открывается. */
  note: string
  /** Сколько доступно из пройденного. Наружу не показывается — долг в цифрах отпугивает. */
  count: number
}

export type ModeStatesInput = {
  /** Весь курс: по нему видно, есть ли материал на уровне вообще. */
  courses: CoursePack[]
  /** То, чему уже учили (`taughtCourses`): из этого собирается практика. */
  taught: CoursePack[]
  level: CEFRLevel
  language: LanguageCode
  theory: TheoryPack | null
}

/** Счётчик режима по любому набору курсов — один и тот же для обоих замеров. */
function countIn(id: ModeID, courses: CoursePack[], input: ModeStatesInput): number {
  const { level, language, theory } = input
  switch (id) {
    case 'shadowing': return ShadowingEngine.count(courses, level)
    case 'listening': return ListeningEngine.count(courses, level, language)
    case 'dialogue': return 0
    case 'verbforms': return VerbFormsEngine.count(courses, level, theory)
    case 'vocabulary': return VocabularyEngine.count(courses, level, language)
    default: {
      const kind = PRACTICE_KINDS.find((item) => item.id === id)
      return kind ? PracticeEngine.pool(courses, level, kind.types).length : 0
    }
  }
}

/**
 * Состояние каждого режима: открыт или закрыт, и если закрыт — чем открывается.
 *
 * Возвращается весь список, включая закрытые: экран практики — это карта того, чем
 * тренажёр вообще бывает, а не только того, что доступно сегодня.
 */
export function modeStates(input: ModeStatesInput): ModeState[] {
  return PRACTICE_MODES.map((mode) => {
    const count = countIn(mode.id, input.taught, input)
    if (count > 0) return { id: mode.id, title: mode.title, ready: true, note: mode.note, count }
    if (mode.soon) return { id: mode.id, title: mode.title, ready: false, note: mode.soon, count: 0 }
    // Второй счёт только здесь: для открытого режима он не нужен, а на полном уровне
    // это обход тринадцати тысяч упражнений.
    const onLevel = countIn(mode.id, input.courses, input)
    return {
      id: mode.id,
      title: mode.title,
      ready: false,
      note: onLevel > 0 ? mode.unlock : mode.missing,
      count: 0,
    }
  })
}
