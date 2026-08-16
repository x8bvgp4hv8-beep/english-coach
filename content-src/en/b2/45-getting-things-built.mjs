// B2, блок 45 — Getting things built. Как что-то строится.
//
// Тематический блок: разрешения, слушания, соседи против стройки, сроки и
// сметы. Условия, пассив, вежливое возражение на публике.

const CI = 'b2-tema-ciudad'
const SO = 'b2-tema-sociedad'
const NE = 'b2-tema-negociacion'
const RI = 'b2-tema-riesgo'
const LI = 'b2-linkers'

export default {
  slug: 'getting-things-built',
  title: 'Как что-то строится',
  subtitle: 'Разрешения, слушания, сроки и сметы',
  canDo: [
    'обсуждать стройку рядом с домом',
    'выступать на общественных слушаниях',
    'разбираться в сроках и смете',
    'возражать по существу, а не эмоциями',
    'договариваться с застройщиком',
  ],
  lessons: [
    {
      title: 'The notice on the lamp post',
      summary: 'Объявление на фонарном столбе.',
      topics: [CI, SO, LI],
      dialogue: ['Объявление', [
        ['Anna', 'The plans were posted in February.', 'Планы вывесили в феврале.'],
        ['Ben', 'On a lamp post, at knee height.', 'На фонарном столбе, на уровне колена.'],
        ['Anna', 'Which counts as consultation, legally.', 'Юридически это считается общественным обсуждением.'],
        ['Ben', 'And is why nobody objected in time.', 'И поэтому никто не возразил вовремя.'],
        ['Anna', 'Which the developer relied on.', 'На что застройщик и рассчитывал.'],
      ]],
      words: [
        ['The plans were posted', 'планы вывесили', 'The plans were posted in February.'],
        ['at knee height', 'на уровне колена', 'On a lamp post, at knee height.'],
        ['counts as consultation', 'считается обсуждением', 'Which counts as consultation, legally.'],
        ['nobody objected in time', 'никто не возразил вовремя', 'And is why nobody objected in time.'],
        ['the developer relied on', 'застройщик рассчитывал на', 'Which the developer relied on.'],
      ],
      rule: ['Count as — считаться чем-то', 'It counts as consultation. Предлог as вводит то, за что нечто засчитывается.'],
      quiz: [
        ['«Юридически это считается общественным обсуждением» —', ['Which counts as consultation, legally', 'Which counts like consultation, legally', 'Which count as consultation, legally'], 0],
        ['«Планы вывесили в феврале» —', ['The plans were posted in February', 'The plans was posted in February', 'The plans were post in February'], 0],
        ['«На что застройщик и рассчитывал» —', ['Which the developer relied on', 'Which the developer relied', 'Which the developer rely on'], 0],
      ],
      order: ['На фонарном столбе, на уровне колена.', 'On a lamp post, at knee height.'],
      produce: [
        ['Планы вывесили в феврале.', 'The plans were posted in February.', []],
        ['Юридически это считается общественным обсуждением.', 'Which counts as consultation, legally.', []],
        ['И поэтому никто не возразил вовремя.', 'And is why nobody objected in time.', []],
      ],
    },
    {
      title: 'At the hearing',
      summary: 'На слушаниях.',
      topics: [SO, CI, LI],
      dialogue: ['Слушания', [
        ['Ben', 'Two minutes each, in speaking order.', 'По две минуты каждому, в порядке записи.'],
        ['Anna', 'Which rewards whoever prepared.', 'Что вознаграждает того, кто подготовился.'],
        ['Ben', 'And punishes whoever is angriest.', 'И наказывает того, кто злее всех.'],
        ['Anna', 'Since anger reads as noise, from a panel.', 'Ведь с трибуны злость читается как шум.'],
        ['Ben', 'Whereas a shadow diagram reads as work.', 'Тогда как схема теней читается как работа.'],
      ]],
      words: [
        ['Two minutes each', 'по две минуты каждому', 'Two minutes each, in speaking order.'],
        ['rewards whoever prepared', 'вознаграждает того, кто подготовился', 'Which rewards whoever prepared.'],
        ['punishes whoever is angriest', 'наказывает самого злого', 'And punishes whoever is angriest.'],
        ['anger reads as noise', 'злость читается как шум', 'Since anger reads as noise, from a panel.'],
        ['a shadow diagram', 'схема теней', 'Whereas a shadow diagram reads as work.'],
      ],
      rule: ['Whoever как дополнение', 'It rewards whoever prepared. Местоимение вводит придаточное и служит его подлежащим.'],
      quiz: [
        ['«Что вознаграждает того, кто подготовился» —', ['Which rewards whoever prepared', 'Which rewards whomever prepared it to', 'Which reward whoever prepared'], 0],
        ['«Ведь с трибуны злость читается как шум» —', ['Since anger reads as noise, from a panel', 'Since anger read as noise, from a panel', 'Since anger reads like noise, from a panel of'], 0],
        ['«По две минуты каждому, в порядке записи» —', ['Two minutes each, in speaking order', 'Two minutes each, on speaking order', 'Two minute each, in speaking order'], 0],
      ],
      order: ['И наказывает того, кто злее всех.', 'And punishes whoever is angriest.'],
      produce: [
        ['По две минуты каждому, в порядке записи.', 'Two minutes each, in speaking order.', []],
        ['Что вознаграждает того, кто подготовился.', 'Which rewards whoever prepared.', []],
        ['Ведь с трибуны злость читается как шум.', 'Since anger reads as noise, from a panel.', []],
      ],
    },
    {
      title: 'Not in my back garden',
      summary: 'Только не у меня во дворе.',
      topics: [SO, CI, LI],
      dialogue: ['Возражение', [
        ['Anna', 'Everybody wants housing built somewhere else.', 'Все хотят, чтобы жильё строили где-нибудь ещё.'],
        ['Ben', 'Which is honest, if rarely said aloud.', 'Честно, хотя вслух так говорят редко.'],
        ['Anna', 'And is why nothing gets built at all.', 'И поэтому не строится вообще ничего.'],
        ['Ben', 'Except where nobody has the time to object.', 'Кроме тех мест, где возражать некому.'],
        ['Anna', 'Which is a policy, by accident.', 'Это политика, получившаяся случайно.'],
      ]],
      words: [
        ['wants housing built', 'хочет, чтобы жильё строили', 'Everybody wants housing built somewhere else.'],
        ['if rarely said aloud', 'хотя вслух говорят редко', 'Which is honest, if rarely said aloud.'],
        ['nothing gets built', 'ничего не строится', 'And is why nothing gets built at all.'],
        ['nobody has the time to object', 'некому возражать', 'Except where nobody has the time to object.'],
        ['a policy, by accident', 'случайная политика', 'Which is a policy, by accident.'],
      ],
      rule: ['Want something done', 'Everybody wants housing built. Каузатив с want требует причастия, а не инфинитива.'],
      quiz: [
        ['«Все хотят, чтобы жильё строили где-нибудь ещё» —', ['Everybody wants housing built somewhere else', 'Everybody wants housing to build somewhere else', 'Everybody want housing built somewhere else'], 0],
        ['«И поэтому не строится вообще ничего» —', ['And is why nothing gets built at all', 'And is why nothing get built at all', 'And is why nothing gets build at all'], 0],
        ['«Кроме тех мест, где возражать некому» —', ['Except where nobody has the time to object', 'Except where nobody have the time to object', 'Except where nobody has the time objecting'], 0],
      ],
      order: ['Это политика, получившаяся случайно.', 'Which is a policy, by accident.'],
      produce: [
        ['Все хотят, чтобы жильё строили где-нибудь ещё.', 'Everybody wants housing built somewhere else.', []],
        ['И поэтому не строится вообще ничего.', 'And is why nothing gets built at all.', []],
        ['Кроме тех мест, где возражать некому.', 'Except where nobody has the time to object.', []],
      ],
    },
    {
      title: 'The objection that worked',
      summary: 'Возражение, которое сработало.',
      topics: [CI, NE, LI],
      dialogue: ['Сработало', [
        ['Ben', 'We objected on drainage, not on looks.', 'Мы возразили по дренажу, а не по внешнему виду.'],
        ['Anna', 'Which is the only ground that binds them.', 'Единственное основание, которое их связывает.'],
        ['Ben', 'Since taste is not a planning matter.', 'Ведь вкус — не предмет градостроительства.'],
        ['Anna', 'Whereas water is, expensively.', 'Тогда как вода — предмет, и дорогой.'],
        ['Ben', 'Which took one afternoon to learn.', 'На это ушло полдня учёбы.'],
      ]],
      words: [
        ['objected on drainage', 'возразили по дренажу', 'We objected on drainage, not on looks.'],
        ['the only ground that binds them', 'единственное связывающее основание', 'Which is the only ground that binds them.'],
        ['not a planning matter', 'не предмет градостроительства', 'Since taste is not a planning matter.'],
        ['water is, expensively', 'вода — да, и дорого', 'Whereas water is, expensively.'],
        ['one afternoon to learn', 'полдня учёбы', 'Which took one afternoon to learn.'],
      ],
      rule: ['Object on grounds', 'We objected on drainage. Предлог on вводит основание возражения.'],
      quiz: [
        ['«Мы возразили по дренажу, а не по внешнему виду» —', ['We objected on drainage, not on looks', 'We objected for drainage, not on looks', 'We object on drainage, not on looks'], 0],
        ['«Единственное основание, которое их связывает» —', ['The only ground that binds them', 'The only ground that bind them', 'The only ground what binds them'], 0],
        ['«На это ушло полдня учёбы» —', ['Which took one afternoon to learn', 'Which took one afternoon for learn', 'Which take one afternoon to learn'], 0],
      ],
      order: ['Тогда как вода — предмет, и дорогой.', 'Whereas water is, expensively.'],
      produce: [
        ['Мы возразили по дренажу, а не по внешнему виду.', 'We objected on drainage, not on looks.', []],
        ['Ведь вкус — не предмет градостроительства.', 'Since taste is not a planning matter.', []],
        ['На это ушло полдня учёбы.', 'Which took one afternoon to learn.', []],
      ],
    },
    {
      title: 'Late and over budget',
      summary: 'Позже и дороже.',
      topics: [RI, CI, LI],
      dialogue: ['Смета', [
        ['Anna', 'It opened two years late, at double the price.', 'Он открылся на два года позже и вдвое дороже.'],
        ['Ben', 'Which was predicted at the start.', 'Что предсказывали с самого начала.'],
        ['Anna', 'By everybody except the people signing.', 'Всеми, кроме тех, кто подписывал.'],
        ['Ben', 'Who had to believe the low number.', 'Кому приходилось верить в низкую цифру.'],
        ['Anna', 'Or the project would not have started.', 'Иначе проект бы и не начался.'],
      ]],
      words: [
        ['two years late', 'на два года позже', 'It opened two years late, at double the price.'],
        ['at double the price', 'вдвое дороже', 'It opened at double the price.'],
        ['was predicted at the start', 'предсказывали с начала', 'Which was predicted at the start.'],
        ['except the people signing', 'кроме тех, кто подписывал', 'By everybody except the people signing.'],
        ['would not have started', 'бы не начался', 'Or the project would not have started.'],
      ],
      rule: ['Третье условие с or', 'Or the project would not have started. Союз or заменяет if not и вводит несбывшееся следствие.'],
      quiz: [
        ['«Иначе проект бы и не начался» —', ['Or the project would not have started', 'Or the project would not started', 'Or the project will not have started'], 0],
        ['«Он открылся на два года позже и вдвое дороже» —', ['It opened two years late, at double the price', 'It opened two years lately, at double the price', 'It opened two year late, at double the price'], 0],
        ['«Кому приходилось верить в низкую цифру» —', ['Who had to believe the low number', 'Who had to believed the low number', 'Who has to believe the low number then'], 0],
      ],
      order: ['Всеми, кроме тех, кто подписывал.', 'By everybody except the people signing.'],
      produce: [
        ['Он открылся на два года позже и вдвое дороже.', 'It opened two years late, at double the price.', []],
        ['Что предсказывали с самого начала.', 'Which was predicted at the start.', []],
        ['Иначе проект бы и не начался.', 'Or the project would not have started.', []],
      ],
    },
    {
      title: 'What the neighbours got',
      summary: 'Что получили соседи.',
      topics: [NE, CI, LI],
      dialogue: ['Условия', [
        ['Ben', 'They agreed to fund the crossing.', 'Они согласились оплатить переход.'],
        ['Anna', 'Which cost less than one flat.', 'Что дешевле одной квартиры.'],
        ['Ben', 'And bought four years of quiet.', 'И купило четыре года покоя.'],
        ['Anna', 'Which is the trade, stated plainly.', 'Вот и весь обмен, если сказать прямо.'],
        ['Ben', 'And is better than nothing, by a crossing.', 'И лучше, чем ничего, ровно на один переход.'],
      ]],
      words: [
        ['agreed to fund the crossing', 'согласились оплатить переход', 'They agreed to fund the crossing.'],
        ['cost less than one flat', 'дешевле одной квартиры', 'Which cost less than one flat.'],
        ['bought four years of quiet', 'купило четыре года покоя', 'And bought four years of quiet.'],
        ['stated plainly', 'если сказать прямо', 'Which is the trade, stated plainly.'],
        ['better than nothing', 'лучше, чем ничего', 'And is better than nothing, by a crossing.'],
      ],
      rule: ['Agree to do', 'They agreed to fund it. После agree идёт инфинитив с to, а не герундий.'],
      quiz: [
        ['«Они согласились оплатить переход» —', ['They agreed to fund the crossing', 'They agreed funding the crossing', 'They agreed fund the crossing'], 0],
        ['«Что дешевле одной квартиры» —', ['Which cost less than one flat', 'Which cost less that one flat', 'Which costs less than one flats'], 0],
        ['«Вот и весь обмен, если сказать прямо» —', ['Which is the trade, stated plainly', 'Which is the trade, stating plainly', 'Which is the trade, stated plain'], 0],
      ],
      order: ['И купило четыре года покоя.', 'And bought four years of quiet.'],
      produce: [
        ['Они согласились оплатить переход.', 'They agreed to fund the crossing.', []],
        ['И купило четыре года покоя.', 'And bought four years of quiet.', []],
        ['И лучше, чем ничего, ровно на один переход.', 'And is better than nothing, by a crossing.', []],
      ],
    },
    {
      title: 'Living beside a site',
      summary: 'Жить рядом со стройкой.',
      topics: [CI, LI, SO],
      dialogue: ['Стройка', [
        ['Anna', 'The drilling starts at seven, legally.', 'Бурение начинается в семь, по закону.'],
        ['Ben', 'Which is early for anybody working nights.', 'Что рано для всех, кто работает ночами.'],
        ['Anna', 'And who are never in the room.', 'И кого никогда нет в зале.'],
        ['Ben', 'When the hours are being agreed.', 'Когда согласуют часы работ.'],
        ['Anna', 'Which is the whole problem, in one detail.', 'Вся проблема в одной детали.'],
      ]],
      words: [
        ['The drilling starts at seven', 'бурение начинается в семь', 'The drilling starts at seven, legally.'],
        ['anybody working nights', 'все, кто работает ночами', 'Which is early for anybody working nights.'],
        ['never in the room', 'никогда нет в зале', 'And who are never in the room.'],
        ['are being agreed', 'согласуются', 'When the hours are being agreed.'],
        ['in one detail', 'в одной детали', 'Which is the whole problem, in one detail.'],
      ],
      rule: ['Are being agreed — длящийся пассив', 'When the hours are being agreed. Форма описывает процесс согласования в момент речи.'],
      quiz: [
        ['«Когда согласуют часы работ» —', ['When the hours are being agreed', 'When the hours are been agreed', 'When the hours are being agree'], 0],
        ['«Что рано для всех, кто работает ночами» —', ['Which is early for anybody working nights', 'Which is early for anybody work nights', 'Which is early for anybody working night'], 0],
        ['«Бурение начинается в семь, по закону» —', ['The drilling starts at seven, legally', 'The drilling start at seven, legally', 'The drilling starts in seven, legally'], 0],
      ],
      order: ['И кого никогда нет в зале.', 'And who are never in the room.'],
      produce: [
        ['Бурение начинается в семь, по закону.', 'The drilling starts at seven, legally.', []],
        ['Что рано для всех, кто работает ночами.', 'Which is early for anybody working nights.', []],
        ['Когда согласуют часы работ.', 'When the hours are being agreed.', []],
      ],
    },
    {
      title: 'Ten years later',
      summary: 'Десять лет спустя.',
      topics: [CI, SO, LI],
      dialogue: ['Потом', [
        ['Ben', 'Nobody remembers opposing the library.', 'Никто не помнит, что был против библиотеки.'],
        ['Anna', 'Which four hundred people signed against.', 'Против которой подписались четыреста человек.'],
        ['Ben', 'And which everybody now calls the best thing here.', 'И которую теперь все зовут лучшим, что тут есть.'],
        ['Anna', 'Which is worth remembering next time.', 'Это стоит помнить в следующий раз.'],
        ['Ben', 'When the next thing is proposed.', 'Когда предложат следующее.'],
      ]],
      words: [
        ['remembers opposing', 'помнит, что был против', 'Nobody remembers opposing the library.'],
        ['four hundred people signed against', 'четыреста подписались против', 'Which four hundred people signed against.'],
        ['calls the best thing here', 'зовёт лучшим, что тут есть', 'And which everybody now calls the best thing here.'],
        ['worth remembering next time', 'стоит помнить в следующий раз', 'Which is worth remembering next time.'],
        ['the next thing is proposed', 'предложат следующее', 'When the next thing is proposed.'],
      ],
      rule: ['Строится то, о чём договорились письменно', 'Возражение по существу и обещание на бумаге меняют проект, а эмоции на слушаниях — нет.'],
      quiz: [
        ['«Никто не помнит, что был против библиотеки» —', ['Nobody remembers opposing the library', 'Nobody remembers to oppose the library', 'Nobody remember opposing the library'], 0],
        ['«Против которой подписались четыреста человек» —', ['Which four hundred people signed against', 'Which four hundred people signed', 'Which four hundreds people signed against'], 0],
        ['«Когда предложат следующее» —', ['When the next thing is proposed', 'When the next thing is propose', 'When the next thing will be proposed'], 0],
      ],
      order: ['Это стоит помнить в следующий раз.', 'Which is worth remembering next time.'],
      produce: [
        ['Никто не помнит, что был против библиотеки.', 'Nobody remembers opposing the library.', []],
        ['И которую теперь все зовут лучшим, что тут есть.', 'And which everybody now calls the best thing here.', []],
        ['Когда предложат следующее.', 'When the next thing is proposed.', []],
      ],
    },
    {
      checkpoint: true,
      title: 'Проверка: как что-то строится',
      summary: 'Шесть фраз без подсказок.',
      topics: [CI, SO, NE, RI],
      produce: [
        ['Юридически это считается общественным обсуждением.', 'Which counts as consultation, legally.', []],
        ['Что вознаграждает того, кто подготовился.', 'Which rewards whoever prepared.', []],
        ['Все хотят, чтобы жильё строили где-нибудь ещё.', 'Everybody wants housing built somewhere else.', []],
        ['Мы возразили по дренажу, а не по внешнему виду.', 'We objected on drainage, not on looks.', []],
        ['Иначе проект бы и не начался.', 'Or the project would not have started.', []],
        ['Когда согласуют часы работ.', 'When the hours are being agreed.', []],
      ],
    },
  ],
}
