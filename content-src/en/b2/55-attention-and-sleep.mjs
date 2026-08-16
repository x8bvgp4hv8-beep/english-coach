// B2, блок 55 — Attention and sleep. Внимание и сон.
//
// Тематический блок: бессонница, телефон в кровати, концентрация, «я стал
// хуже читать». Модальные, сравнения, осторожные обобщения о данных.

const PS = 'b2-tema-psicologia'
const SA = 'b2-tema-sanidad'
const DA = 'b2-tema-datos'
const CA = 'b1-tema-carrera'
const LI = 'b2-linkers'

export default {
  slug: 'attention-and-sleep',
  title: 'Внимание и сон',
  subtitle: 'Бессонница, телефон и способность читать',
  canDo: [
    'описывать проблемы со сном',
    'обсуждать концентрацию и её потерю',
    'спорить о вреде телефона по существу',
    'договариваться о тишине с другими',
    'говорить о режиме без морали',
  ],
  lessons: [
    {
      title: 'Awake at three',
      summary: 'Проснуться в три.',
      topics: [SA, PS, LI],
      dialogue: ['Ночь', [
        ['Anna', 'I wake at three and stay awake.', 'Я просыпаюсь в три и больше не сплю.'],
        ['Ben', 'Which is the classic pattern, apparently.', 'Судя по всему, классическая картина.'],
        ['Anna', 'And is made worse by checking the time.', 'И становится хуже, если смотреть на часы.'],
        ['Ben', 'Since the arithmetic starts immediately.', 'Ведь арифметика начинается сразу.'],
        ['Anna', 'Four hours left, if I fall asleep now.', 'Четыре часа осталось, если засну сейчас.'],
      ]],
      words: [
        ['wake at three', 'просыпаюсь в три', 'I wake at three and stay awake.'],
        ['stay awake', 'больше не сплю', 'I wake at three and stay awake.'],
        ['made worse by checking the time', 'хуже, если смотреть на часы', 'And is made worse by checking the time.'],
        ['the arithmetic starts', 'арифметика начинается', 'Since the arithmetic starts immediately.'],
        ['if I fall asleep now', 'если засну сейчас', 'Four hours left, if I fall asleep now.'],
      ],
      rule: ['Be made worse by + герундий', 'It is made worse by checking the time. Предлог by вводит причину ухудшения.'],
      quiz: [
        ['«И становится хуже, если смотреть на часы» —', ['And is made worse by checking the time', 'And is made worse by check the time', 'And is make worse by checking the time'], 0],
        ['«Я просыпаюсь в три и больше не сплю» —', ['I wake at three and stay awake', 'I wake in three and stay awake', 'I wake at three and stay awaken'], 0],
        ['«Четыре часа осталось, если засну сейчас» —', ['Four hours left, if I fall asleep now', 'Four hours left, if I will fall asleep now', 'Four hour left, if I fall asleep now'], 0],
      ],
      order: ['Ведь арифметика начинается сразу.', 'Since the arithmetic starts immediately.'],
      produce: [
        ['Я просыпаюсь в три и больше не сплю.', 'I wake at three and stay awake.', []],
        ['И становится хуже, если смотреть на часы.', 'And is made worse by checking the time.', []],
        ['Четыре часа осталось, если засну сейчас.', 'Four hours left, if I fall asleep now.', []],
      ],
    },
    {
      title: 'The phone by the bed',
      summary: 'Телефон у кровати.',
      topics: [PS, SA, LI],
      dialogue: ['Телефон', [
        ['Ben', 'It is charged in the kitchen now.', 'Теперь он заряжается на кухне.'],
        ['Anna', 'Which sounds like a small change.', 'Звучит как небольшая перемена.'],
        ['Ben', 'And removes about forty minutes of it.', 'И убирает примерно сорок минут этого.'],
        ['Anna', 'Since the decision is made once, at eight.', 'Ведь решение принимается один раз, в восемь.'],
        ['Ben', 'Rather than nine times, at midnight.', 'А не девять раз, в полночь.'],
      ]],
      words: [
        ['is charged in the kitchen', 'заряжается на кухне', 'It is charged in the kitchen now.'],
        ['a small change', 'небольшая перемена', 'Which sounds like a small change.'],
        ['removes about forty minutes', 'убирает сорок минут', 'And removes about forty minutes of it.'],
        ['made once, at eight', 'принимается один раз, в восемь', 'Since the decision is made once, at eight.'],
        ['nine times, at midnight', 'девять раз, в полночь', 'Rather than nine times, at midnight.'],
      ],
      rule: ['Решение переносят на раннее время', 'The decision is made once, at eight. Одно решение вечером заменяет девять решений ночью.'],
      quiz: [
        ['«Ведь решение принимается один раз, в восемь» —', ['Since the decision is made once, at eight', 'Since the decision is make once, at eight', 'Since the decision is made once, in eight'], 0],
        ['«Теперь он заряжается на кухне» —', ['It is charged in the kitchen now', 'It is charge in the kitchen now', 'It is charged on the kitchen now'], 0],
        ['«И убирает примерно сорок минут этого» —', ['And removes about forty minutes of it', 'And remove about forty minutes of it', 'And removes about forty minute of it'], 0],
      ],
      order: ['Звучит как небольшая перемена.', 'Which sounds like a small change.'],
      produce: [
        ['Теперь он заряжается на кухне.', 'It is charged in the kitchen now.', []],
        ['Ведь решение принимается один раз, в восемь.', 'Since the decision is made once, at eight.', []],
        ['А не девять раз, в полночь.', 'Rather than nine times, at midnight.', []],
      ],
    },
    {
      title: 'I cannot read a book any more',
      summary: 'Я больше не могу читать книгу.',
      topics: [PS, DA, LI],
      dialogue: ['Чтение', [
        ['Anna', 'I read four pages and reach for something.', 'Я читаю четыре страницы и тянусь за чем-нибудь.'],
        ['Ben', 'Which is a habit, not a diagnosis.', 'Это привычка, а не диагноз.'],
        ['Anna', 'And is reversible, in about three weeks.', 'И обратима, примерно за три недели.'],
        ['Ben', 'Provided the something is not in the room.', 'При условии, что «чего-нибудь» нет в комнате.'],
        ['Anna', 'Which is the entire method, sadly.', 'К сожалению, в этом весь метод.'],
      ]],
      words: [
        ['reach for something', 'тянусь за чем-нибудь', 'I read four pages and reach for something.'],
        ['a habit, not a diagnosis', 'привычка, а не диагноз', 'Which is a habit, not a diagnosis.'],
        ['reversible, in about three weeks', 'обратима за три недели', 'And is reversible, in about three weeks.'],
        ['not in the room', 'нет в комнате', 'Provided the something is not in the room.'],
        ['the entire method', 'весь метод', 'Which is the entire method, sadly.'],
      ],
      rule: ['Reach for — тянуться за', 'I reach for something. Предлог for обязателен и не заменяется на to.'],
      quiz: [
        ['«Я читаю четыре страницы и тянусь за чем-нибудь» —', ['I read four pages and reach for something', 'I read four pages and reach to something', 'I read four pages and reach for anything'], 0],
        ['«И обратима, примерно за три недели» —', ['And is reversible, in about three weeks', 'And is reversible, on about three weeks', 'And is reversable, in about three weeks'], 0],
        ['«При условии, что «чего-нибудь» нет в комнате» —', ['Provided the something is not in the room', 'Provided the something is not on the room', 'Provided the something are not in the room'], 0],
      ],
      order: ['Это привычка, а не диагноз.', 'Which is a habit, not a diagnosis.'],
      produce: [
        ['Я читаю четыре страницы и тянусь за чем-нибудь.', 'I read four pages and reach for something.', []],
        ['Это привычка, а не диагноз.', 'Which is a habit, not a diagnosis.', []],
        ['При условии, что «чего-нибудь» нет в комнате.', 'Provided the something is not in the room.', []],
      ],
    },
    {
      title: 'Deep work at the office',
      summary: 'Сосредоточенная работа в офисе.',
      topics: [CA, PS, LI],
      dialogue: ['Работа', [
        ['Ben', 'I get two uninterrupted hours a week.', 'У меня два непрерывных часа в неделю.'],
        ['Anna', 'Which is not a personal failing.', 'И это не личный недостаток.'],
        ['Ben', 'But a calendar anybody can fill.', 'А календарь, который каждый может заполнить.'],
        ['Anna', 'So I block Tuesday mornings, publicly.', 'Поэтому я публично блокирую утро вторника.'],
        ['Ben', 'Which nobody has ever challenged.', 'Что ни разу никто не оспорил.'],
      ]],
      words: [
        ['two uninterrupted hours', 'два непрерывных часа', 'I get two uninterrupted hours a week.'],
        ['not a personal failing', 'не личный недостаток', 'Which is not a personal failing.'],
        ['anybody can fill', 'каждый может заполнить', 'But a calendar anybody can fill.'],
        ['block Tuesday mornings', 'блокирую утро вторника', 'So I block Tuesday mornings, publicly.'],
        ['nobody has challenged', 'никто не оспорил', 'Which nobody has ever challenged.'],
      ],
      rule: ['Определительное придаточное без союза', 'A calendar anybody can fill. Слово that опускается, когда оно дополнение.'],
      quiz: [
        ['«А календарь, который каждый может заполнить» —', ['But a calendar anybody can fill', 'But a calendar anybody can fills', 'But a calendar what anybody can fill'], 0],
        ['«Что ни разу никто не оспорил» —', ['Which nobody has ever challenged', 'Which nobody has ever challenge', 'Which nobody have ever challenged'], 0],
        ['«У меня два непрерывных часа в неделю» —', ['I get two uninterrupted hours a week', 'I get two uninterrupted hours in week', 'I get two uninterrupted hour a week'], 0],
      ],
      order: ['И это не личный недостаток.', 'Which is not a personal failing.'],
      produce: [
        ['У меня два непрерывных часа в неделю.', 'I get two uninterrupted hours a week.', []],
        ['А календарь, который каждый может заполнить.', 'But a calendar anybody can fill.', []],
        ['Поэтому я публично блокирую утро вторника.', 'So I block Tuesday mornings, publicly.', []],
      ],
    },
    {
      title: 'What the studies actually say',
      summary: 'Что на самом деле говорят исследования.',
      topics: [DA, PS, LI],
      dialogue: ['Данные', [
        ['Anna', 'Screens are blamed for everything.', 'Экраны винят во всём.'],
        ['Ben', 'Which makes the real effects harder to see.', 'Что затрудняет разглядеть настоящие эффекты.'],
        ['Anna', 'Since a claim that explains everything explains nothing.', 'Ведь утверждение, объясняющее всё, не объясняет ничего.'],
        ['Ben', 'Whereas late light and lost sleep are measured.', 'Тогда как поздний свет и потерянный сон измерены.'],
        ['Anna', 'And are enough to act on.', 'И этого хватает, чтобы действовать.'],
      ]],
      words: [
        ['are blamed for everything', 'винят во всём', 'Screens are blamed for everything.'],
        ['harder to see', 'труднее разглядеть', 'Which makes the real effects harder to see.'],
        ['explains everything explains nothing', 'объясняет всё — не объясняет ничего', 'A claim that explains everything explains nothing.'],
        ['late light and lost sleep', 'поздний свет и потерянный сон', 'Whereas late light and lost sleep are measured.'],
        ['enough to act on', 'достаточно, чтобы действовать', 'And are enough to act on.'],
      ],
      rule: ['Blame for something', 'Screens are blamed for everything. Предлог for вводит то, в чём винят.'],
      quiz: [
        ['«Экраны винят во всём» —', ['Screens are blamed for everything', 'Screens are blamed in everything', 'Screens are blame for everything'], 0],
        ['«И этого хватает, чтобы действовать» —', ['And are enough to act on', 'And are enough to act', 'And are enough for act on'], 0],
        ['«Что затрудняет разглядеть настоящие эффекты» —', ['Which makes the real effects harder to see', 'Which makes the real effects harder seeing', 'Which make the real effects harder to see'], 0],
      ],
      order: ['Тогда как поздний свет и потерянный сон измерены.', 'Whereas late light and lost sleep are measured.'],
      produce: [
        ['Экраны винят во всём.', 'Screens are blamed for everything.', []],
        ['Ведь утверждение, объясняющее всё, не объясняет ничего.', 'A claim that explains everything explains nothing.', []],
        ['И этого хватает, чтобы действовать.', 'And are enough to act on.', []],
      ],
    },
    {
      title: 'Sharing a flat with a night owl',
      summary: 'Жить с совой.',
      topics: [PS, LI, CA],
      dialogue: ['Соседство', [
        ['Ben', 'He is loudest when I am asleep.', 'Он громче всего, когда я сплю.'],
        ['Anna', 'Which is nobody fault, and still a problem.', 'Ничьей вины нет, а проблема есть.'],
        ['Ben', 'So we agreed on hours, not on volume.', 'Поэтому мы договорились о часах, а не о громкости.'],
        ['Anna', 'Which can be checked without arguing.', 'Что можно проверить без споров.'],
        ['Ben', 'Since a clock does not take sides.', 'Ведь часы ничью сторону не занимают.'],
      ]],
      words: [
        ['loudest when I am asleep', 'громче всего, когда я сплю', 'He is loudest when I am asleep.'],
        ['nobody fault', 'ничьей вины', 'Which is nobody fault, and still a problem.'],
        ['agreed on hours', 'договорились о часах', 'So we agreed on hours, not on volume.'],
        ['checked without arguing', 'проверить без споров', 'Which can be checked without arguing.'],
        ['does not take sides', 'не занимают сторону', 'Since a clock does not take sides.'],
      ],
      rule: ['Agree on something', 'We agreed on hours. Предлог on вводит предмет договорённости.'],
      quiz: [
        ['«Поэтому мы договорились о часах, а не о громкости» —', ['So we agreed on hours, not on volume', 'So we agreed hours, not on volume', 'So we agreed about hours, not on volume of'], 0],
        ['«Что можно проверить без споров» —', ['Which can be checked without arguing', 'Which can be check without arguing', 'Which can be checked without argue'], 0],
        ['«Ведь часы ничью сторону не занимают» —', ['Since a clock does not take sides', 'Since a clock do not take sides', 'Since a clock does not takes sides'], 0],
      ],
      order: ['Он громче всего, когда я сплю.', 'He is loudest when I am asleep.'],
      produce: [
        ['Он громче всего, когда я сплю.', 'He is loudest when I am asleep.', []],
        ['Поэтому мы договорились о часах, а не о громкости.', 'So we agreed on hours, not on volume.', []],
        ['Ведь часы ничью сторону не занимают.', 'Since a clock does not take sides.', []],
      ],
    },
    {
      title: 'The morning after a bad night',
      summary: 'Утро после плохой ночи.',
      topics: [SA, CA, LI],
      dialogue: ['Утро', [
        ['Anna', 'I should not make decisions before eleven.', 'До одиннадцати мне не стоит принимать решения.'],
        ['Ben', 'Which you learned by making three bad ones.', 'Вы выучили это, приняв три плохих.'],
        ['Anna', 'And which the calendar now protects.', 'И что теперь защищает календарь.'],
        ['Ben', 'Since willpower is the thing that is missing.', 'Ведь не хватает именно силы воли.'],
        ['Anna', 'On exactly those mornings, obviously.', 'Ровно в такие утра, разумеется.'],
      ]],
      words: [
        ['should not make decisions', 'не стоит принимать решения', 'I should not make decisions before eleven.'],
        ['by making three bad ones', 'приняв три плохих', 'Which you learned by making three bad ones.'],
        ['the calendar now protects', 'календарь теперь защищает', 'And which the calendar now protects.'],
        ['the thing that is missing', 'то, чего не хватает', 'Since willpower is the thing that is missing.'],
        ['On exactly those mornings', 'ровно в такие утра', 'On exactly those mornings, obviously.'],
      ],
      rule: ['Learn by doing', 'You learned it by making three bad ones. Предлог by вводит способ обучения.'],
      quiz: [
        ['«Вы выучили это, приняв три плохих» —', ['Which you learned by making three bad ones', 'Which you learned by make three bad ones', 'Which you learned for making three bad ones'], 0],
        ['«До одиннадцати мне не стоит принимать решения» —', ['I should not make decisions before eleven', 'I should not to make decisions before eleven', 'I should not making decisions before eleven'], 0],
        ['«Ведь не хватает именно силы воли» —', ['Since willpower is the thing that is missing', 'Since willpower is the thing what is missing', 'Since willpower are the thing that is missing'], 0],
      ],
      order: ['Ровно в такие утра, разумеется.', 'On exactly those mornings, obviously.'],
      produce: [
        ['До одиннадцати мне не стоит принимать решения.', 'I should not make decisions before eleven.', []],
        ['Вы выучили это, приняв три плохих.', 'Which you learned by making three bad ones.', []],
        ['Ведь не хватает именно силы воли.', 'Since willpower is the thing that is missing.', []],
      ],
    },
    {
      title: 'A sane routine',
      summary: 'Разумный режим.',
      topics: [SA, PS, LI],
      dialogue: ['Режим', [
        ['Ben', 'Same wake up time, most days.', 'Один и тот же подъём, почти всегда.'],
        ['Anna', 'Which matters more than the bedtime.', 'Что важнее времени отбоя.'],
        ['Ben', 'And is the only part you control.', 'И это единственная часть, которой вы управляете.'],
        ['Anna', 'Since falling asleep cannot be forced.', 'Ведь заснуть по приказу нельзя.'],
        ['Ben', 'Which every insomniac has proved, nightly.', 'Что каждый страдающий бессонницей доказывает еженощно.'],
      ]],
      words: [
        ['Same wake up time', 'один и тот же подъём', 'Same wake up time, most days.'],
        ['matters more than the bedtime', 'важнее времени отбоя', 'Which matters more than the bedtime.'],
        ['the only part you control', 'единственная часть, которой управляете', 'And is the only part you control.'],
        ['cannot be forced', 'нельзя заставить', 'Since falling asleep cannot be forced.'],
        ['every insomniac', 'каждый страдающий бессонницей', 'Which every insomniac has proved, nightly.'],
      ],
      rule: ['Внимание и сон чинятся расстановкой предметов', 'Телефон на кухне и один и тот же подъём работают лучше любых обещаний себе.'],
      quiz: [
        ['«Ведь заснуть по приказу нельзя» —', ['Since falling asleep cannot be forced', 'Since fall asleep cannot be forced', 'Since falling asleep cannot be force'], 0],
        ['«Что важнее времени отбоя» —', ['Which matters more than the bedtime', 'Which matter more than the bedtime', 'Which matters more that the bedtime'], 0],
        ['«Что каждый страдающий бессонницей доказывает еженощно» —', ['Which every insomniac has proved, nightly', 'Which every insomniac have proved, nightly', 'Which every insomniacs has proved, nightly'], 0],
      ],
      order: ['Один и тот же подъём, почти всегда.', 'Same wake up time, most days.'],
      produce: [
        ['Один и тот же подъём, почти всегда.', 'Same wake up time, most days.', []],
        ['И это единственная часть, которой вы управляете.', 'And is the only part you control.', []],
        ['Ведь заснуть по приказу нельзя.', 'Since falling asleep cannot be forced.', []],
      ],
    },
    {
      checkpoint: true,
      title: 'Проверка: внимание и сон',
      summary: 'Шесть фраз без подсказок.',
      topics: [PS, SA, DA, CA],
      produce: [
        ['И становится хуже, если смотреть на часы.', 'And is made worse by checking the time.', []],
        ['Ведь решение принимается один раз, в восемь.', 'Since the decision is made once, at eight.', []],
        ['Я читаю четыре страницы и тянусь за чем-нибудь.', 'I read four pages and reach for something.', []],
        ['А календарь, который каждый может заполнить.', 'But a calendar anybody can fill.', []],
        ['Экраны винят во всём.', 'Screens are blamed for everything.', []],
        ['Поэтому мы договорились о часах, а не о громкости.', 'So we agreed on hours, not on volume.', []],
      ],
    },
  ],
}
