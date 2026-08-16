// B2, блок 39 — The body you have. Тело, которое есть.
//
// Тематический блок: травмы, зал, восстановление, стыд и предел возможного.
// Много модальных догадок, сравнений и осторожных советов.

const DP = 'b2-tema-deporte'
const SA = 'b2-tema-sanidad'
const PS = 'b2-tema-psicologia'
const DA = 'b2-tema-datos'
const LI = 'b2-linkers'

export default {
  slug: 'the-body-you-have',
  title: 'Тело, которое есть',
  subtitle: 'Травмы, залы, восстановление и предел',
  canDo: [
    'описывать травму и её историю',
    'обсуждать нагрузку и восстановление',
    'говорить о стыде в зале',
    'спорить о трекерах и цифрах',
    'давать совет, не навязывая',
  ],
  lessons: [
    {
      title: 'The knee',
      summary: 'Колено.',
      topics: [DP, SA, LI],
      dialogue: ['Травма', [
        ['Anna', 'It has been going since February.', 'Это тянется с февраля.'],
        ['Ben', 'Which means it is not going to pass.', 'Значит, само не пройдёт.'],
        ['Anna', 'And should have been looked at in March.', 'И надо было показать его в марте.'],
        ['Ben', 'When it would have been a small thing.', 'Когда это было бы мелочью.'],
        ['Anna', 'Which is how small things become surgery.', 'Так мелочи и превращаются в операцию.'],
      ]],
      words: [
        ['has been going since February', 'тянется с февраля', 'It has been going since February.'],
        ['is not going to pass', 'само не пройдёт', 'Which means it is not going to pass.'],
        ['should have been looked at', 'надо было показать', 'And should have been looked at in March.'],
        ['a small thing', 'мелочь', 'When it would have been a small thing.'],
        ['become surgery', 'превращаются в операцию', 'Which is how small things become surgery.'],
      ],
      rule: ['Should have been done — упрёк в пассиве', 'It should have been looked at. Форма называет несделанное, не указывая виноватого.'],
      quiz: [
        ['«И надо было показать его в марте» —', ['And should have been looked at in March', 'And should have been look at in March', 'And should be looked at in March then'], 0],
        ['«Это тянется с февраля» —', ['It has been going since February', 'It has been going from February', 'It is going since February'], 0],
        ['«Так мелочи и превращаются в операцию» —', ['Which is how small things become surgery', 'Which is how small things becomes surgery', 'Which is what small things become surgery'], 0],
      ],
      order: ['Когда это было бы мелочью.', 'When it would have been a small thing.'],
      produce: [
        ['Это тянется с февраля.', 'It has been going since February.', []],
        ['И надо было показать его в марте.', 'And should have been looked at in March.', []],
        ['Так мелочи и превращаются в операцию.', 'Which is how small things become surgery.', []],
      ],
    },
    {
      title: 'Rest is training',
      summary: 'Отдых — это тренировка.',
      topics: [DP, SA, LI],
      dialogue: ['Отдых', [
        ['Ben', 'The gains happen while you sleep.', 'Рост происходит, пока вы спите.'],
        ['Anna', 'Which every coach says and nobody hears.', 'Это говорит каждый тренер, и никто не слышит.'],
        ['Ben', 'Because rest looks like doing nothing.', 'Потому что отдых выглядит как безделье.'],
        ['Anna', 'Whereas it is half the programme.', 'Тогда как это половина программы.'],
        ['Ben', 'And the half people skip first.', 'И та половина, которую пропускают первой.'],
      ]],
      words: [
        ['The gains happen', 'рост происходит', 'The gains happen while you sleep.'],
        ['nobody hears', 'никто не слышит', 'Which every coach says and nobody hears.'],
        ['looks like doing nothing', 'выглядит как безделье', 'Because rest looks like doing nothing.'],
        ['half the programme', 'половина программы', 'Whereas it is half the programme.'],
        ['people skip first', 'пропускают первой', 'And the half people skip first.'],
      ],
      rule: ['Look like + герундий', 'Rest looks like doing nothing. После look like идёт существительное или -ing, а не голый глагол.'],
      quiz: [
        ['«Потому что отдых выглядит как безделье» —', ['Because rest looks like doing nothing', 'Because rest looks like do nothing', 'Because rest look like doing nothing'], 0],
        ['«Тогда как это половина программы» —', ['Whereas it is half the programme', 'Whereas it is a half the programme', 'Whereas it is half of programme'], 0],
        ['«Это говорит каждый тренер, и никто не слышит» —', ['Which every coach says and nobody hears', 'Which every coach say and nobody hears', 'Which every coach says and nobody hear'], 0],
      ],
      order: ['И та половина, которую пропускают первой.', 'And the half people skip first.'],
      produce: [
        ['Рост происходит, пока вы спите.', 'The gains happen while you sleep.', []],
        ['Потому что отдых выглядит как безделье.', 'Because rest looks like doing nothing.', []],
        ['Тогда как это половина программы.', 'Whereas it is half the programme.', []],
      ],
    },
    {
      title: 'The first month in a gym',
      summary: 'Первый месяц в зале.',
      topics: [PS, DP, LI],
      dialogue: ['Зал', [
        ['Anna', 'Everybody thinks they are being watched.', 'Всем кажется, что на них смотрят.'],
        ['Ben', 'Which is true for about four seconds.', 'Это верно примерно четыре секунды.'],
        ['Anna', 'After which nobody looks up again.', 'После чего никто больше не поднимает глаз.'],
        ['Ben', 'Being busy counting their own sets.', 'Занятые счётом собственных подходов.'],
        ['Anna', 'Which is a comforting piece of maths.', 'Утешительная арифметика.'],
      ]],
      words: [
        ['they are being watched', 'на них смотрят', 'Everybody thinks they are being watched.'],
        ['for about four seconds', 'примерно четыре секунды', 'Which is true for about four seconds.'],
        ['nobody looks up again', 'никто больше не поднимает глаз', 'After which nobody looks up again.'],
        ['Being busy counting', 'занятые счётом', 'Being busy counting their own sets.'],
        ['a comforting piece of maths', 'утешительная арифметика', 'Which is a comforting piece of maths.'],
      ],
      rule: ['Be busy doing', 'They are busy counting their sets. После busy идёт форма на -ing без предлога.'],
      quiz: [
        ['«Занятые счётом собственных подходов» —', ['Being busy counting their own sets', 'Being busy to count their own sets', 'Being busy count their own sets'], 0],
        ['«Всем кажется, что на них смотрят» —', ['Everybody thinks they are being watched', 'Everybody thinks they are been watched', 'Everybody think they are being watched'], 0],
        ['«После чего никто больше не поднимает глаз» —', ['After which nobody looks up again', 'After which nobody look up again', 'After what nobody looks up again'], 0],
      ],
      order: ['Это верно примерно четыре секунды.', 'Which is true for about four seconds.'],
      produce: [
        ['Всем кажется, что на них смотрят.', 'Everybody thinks they are being watched.', []],
        ['После чего никто больше не поднимает глаз.', 'After which nobody looks up again.', []],
        ['Занятые счётом собственных подходов.', 'Being busy counting their own sets.', []],
      ],
    },
    {
      title: 'Numbers on the wrist',
      summary: 'Цифры на запястье.',
      topics: [DA, DP, LI],
      dialogue: ['Трекер', [
        ['Ben', 'It says I slept four hours and twelve minutes.', 'Он говорит, что я спал четыре часа двенадцать минут.'],
        ['Anna', 'Which it cannot actually measure.', 'Чего он на самом деле измерить не может.'],
        ['Ben', 'Only movement, and a heart rate.', 'Только движение и пульс.'],
        ['Anna', 'From which the rest is guessed.', 'Из чего остальное угадывается.'],
        ['Ben', 'And believed, because it has a decimal.', 'И принимается на веру, потому что там дробь.'],
      ]],
      words: [
        ['four hours and twelve minutes', 'четыре часа двенадцать минут', 'It says I slept four hours and twelve minutes.'],
        ['it cannot actually measure', 'на самом деле не может измерить', 'Which it cannot actually measure.'],
        ['Only movement, and a heart rate', 'только движение и пульс', 'Only movement, and a heart rate.'],
        ['the rest is guessed', 'остальное угадывается', 'From which the rest is guessed.'],
        ['because it has a decimal', 'потому что там дробь', 'And believed, because it has a decimal.'],
      ],
      rule: ['From which — предлог перед which', 'From which the rest is guessed. В книжном стиле предлог ставится перед which, а не в конце.'],
      quiz: [
        ['«Из чего остальное угадывается» —', ['From which the rest is guessed', 'From which the rest is guess', 'From what the rest is guessed'], 0],
        ['«Чего он на самом деле измерить не может» —', ['Which it cannot actually measure', 'Which it cannot actually measures', 'Which it can not actually to measure'], 0],
        ['«И принимается на веру, потому что там дробь» —', ['And believed, because it has a decimal', 'And believed, because it have a decimal', 'And believe, because it has a decimal'], 0],
      ],
      order: ['Только движение и пульс.', 'Only movement, and a heart rate.'],
      produce: [
        ['Он говорит, что я спал четыре часа двенадцать минут.', 'It says I slept four hours and twelve minutes.', []],
        ['Чего он на самом деле измерить не может.', 'Which it cannot actually measure.', []],
        ['И принимается на веру, потому что там дробь.', 'And believed, because it has a decimal.', []],
      ],
    },
    {
      title: 'Coming back after a year off',
      summary: 'Возвращение после года перерыва.',
      topics: [DP, PS, LI],
      dialogue: ['Возвращение', [
        ['Anna', 'I am starting at half of what I lifted.', 'Я начинаю с половины того, что поднимала.'],
        ['Ben', 'Which is the hardest part, mentally.', 'Психологически это самое трудное.'],
        ['Anna', 'Since the body forgets faster than the memory.', 'Ведь тело забывает быстрее, чем память.'],
        ['Ben', 'And returns faster than it built.', 'И возвращается быстрее, чем строилось.'],
        ['Anna', 'Which is the only comforting fact here.', 'Единственный утешительный факт.'],
      ]],
      words: [
        ['half of what I lifted', 'половина того, что поднимала', 'I am starting at half of what I lifted.'],
        ['the hardest part, mentally', 'самое трудное психологически', 'Which is the hardest part, mentally.'],
        ['forgets faster than the memory', 'забывает быстрее, чем память', 'Since the body forgets faster than the memory.'],
        ['returns faster than it built', 'возвращается быстрее, чем строилось', 'And returns faster than it built.'],
        ['the only comforting fact', 'единственный утешительный факт', 'Which is the only comforting fact here.'],
      ],
      rule: ['What в значении «то, что»', 'Half of what I lifted. Слово what вводит придаточное без предшествующего существительного.'],
      quiz: [
        ['«Я начинаю с половины того, что поднимала» —', ['I am starting at half of what I lifted', 'I am starting at half of that I lifted', 'I am starting at half of what I lift'], 0],
        ['«Ведь тело забывает быстрее, чем память» —', ['Since the body forgets faster than the memory', 'Since the body forget faster than the memory', 'Since the body forgets faster that the memory'], 0],
        ['«Психологически это самое трудное» —', ['Which is the hardest part, mentally', 'Which is the most hard part, mentally', 'Which is the hardest part, mental'], 0],
      ],
      order: ['И возвращается быстрее, чем строилось.', 'And returns faster than it built.'],
      produce: [
        ['Я начинаю с половины того, что поднимала.', 'I am starting at half of what I lifted.', []],
        ['Ведь тело забывает быстрее, чем память.', 'Since the body forgets faster than the memory.', []],
        ['Единственный утешительный факт.', 'Which is the only comforting fact here.', []],
      ],
    },
    {
      title: 'Advice you did not ask for',
      summary: 'Совет, о котором не просили.',
      topics: [PS, DP, LI],
      dialogue: ['Совет', [
        ['Ben', 'A stranger corrected my form yesterday.', 'Вчера незнакомец поправил мою технику.'],
        ['Anna', 'Which was right, and still unwelcome.', 'Он был прав, и это всё равно было лишним.'],
        ['Ben', 'Since being right is not permission.', 'Ведь правота — это не разрешение.'],
        ['Anna', 'Whereas asking first costs one sentence.', 'Тогда как спросить сначала стоит одного предложения.'],
        ['Ben', 'Which almost nobody spends.', 'Которое почти никто не тратит.'],
      ]],
      words: [
        ['corrected my form', 'поправил мою технику', 'A stranger corrected my form yesterday.'],
        ['right, and still unwelcome', 'прав и всё равно лишний', 'Which was right, and still unwelcome.'],
        ['being right is not permission', 'правота не разрешение', 'Since being right is not permission.'],
        ['asking first', 'сначала спросить', 'Whereas asking first costs one sentence.'],
        ['almost nobody spends', 'почти никто не тратит', 'Which almost nobody spends.'],
      ],
      rule: ['Герундий в роли подлежащего и дополнения', 'Being right is not permission. Форма на -ing ведёт себя как существительное в обеих позициях.'],
      quiz: [
        ['«Ведь правота — это не разрешение» —', ['Since being right is not permission', 'Since be right is not permission', 'Since being right is not a permission of'], 0],
        ['«Тогда как спросить сначала стоит одного предложения» —', ['Whereas asking first costs one sentence', 'Whereas ask first costs one sentence', 'Whereas asking first cost one sentence'], 0],
        ['«Он был прав, и это всё равно было лишним» —', ['Which was right, and still unwelcome', 'Which was right, and still unwelcomed', 'Which were right, and still unwelcome'], 0],
      ],
      order: ['Вчера незнакомец поправил мою технику.', 'A stranger corrected my form yesterday.'],
      produce: [
        ['Вчера незнакомец поправил мою технику.', 'A stranger corrected my form yesterday.', []],
        ['Ведь правота — это не разрешение.', 'Since being right is not permission.', []],
        ['Тогда как спросить сначала стоит одного предложения.', 'Whereas asking first costs one sentence.', []],
      ],
    },
    {
      title: 'Sport and other people',
      summary: 'Спорт и другие люди.',
      topics: [DP, PS, LI],
      dialogue: ['Вместе', [
        ['Anna', 'I only run if somebody is waiting.', 'Я бегаю, только если кто-то ждёт.'],
        ['Ben', 'Which is not weakness, but design.', 'Это не слабость, а конструкция.'],
        ['Anna', 'Since willpower runs out by Wednesday.', 'Ведь сила воли кончается к среде.'],
        ['Ben', 'Whereas an appointment does not.', 'А договорённость — нет.'],
        ['Anna', 'Which is the whole trick of it.', 'В этом весь фокус.'],
      ]],
      words: [
        ['only run if somebody is waiting', 'бегаю, только если кто-то ждёт', 'I only run if somebody is waiting.'],
        ['not weakness, but design', 'не слабость, а конструкция', 'Which is not weakness, but design.'],
        ['willpower runs out', 'сила воли кончается', 'Since willpower runs out by Wednesday.'],
        ['an appointment does not', 'договорённость нет', 'Whereas an appointment does not.'],
        ['the whole trick of it', 'весь фокус', 'Which is the whole trick of it.'],
      ],
      rule: ['Run out — заканчиваться', 'Willpower runs out by Wednesday. Фразовый глагол без дополнения значит «иссякать».'],
      quiz: [
        ['«Ведь сила воли кончается к среде» —', ['Since willpower runs out by Wednesday', 'Since willpower run out by Wednesday', 'Since willpower runs out until Wednesday'], 0],
        ['«А договорённость — нет» —', ['Whereas an appointment does not', 'Whereas an appointment is not', 'Whereas an appointment do not'], 0],
        ['«Я бегаю, только если кто-то ждёт» —', ['I only run if somebody is waiting', 'I only run if somebody will wait', 'I only run if somebody waits for me to'], 0],
      ],
      order: ['Это не слабость, а конструкция.', 'Which is not weakness, but design.'],
      produce: [
        ['Я бегаю, только если кто-то ждёт.', 'I only run if somebody is waiting.', []],
        ['Ведь сила воли кончается к среде.', 'Since willpower runs out by Wednesday.', []],
        ['А договорённость — нет.', 'Whereas an appointment does not.', []],
      ],
    },
    {
      title: 'The limit',
      summary: 'Предел.',
      topics: [DP, SA, LI],
      dialogue: ['Предел', [
        ['Ben', 'I will never run under three hours.', 'Я никогда не выбегу из трёх часов.'],
        ['Anna', 'Which took eight years to accept.', 'На принятие этого ушло восемь лет.'],
        ['Ben', 'And changed nothing about Sunday mornings.', 'И ничего не изменило в воскресных утрах.'],
        ['Anna', 'Which is when it stopped being a problem.', 'Тогда это и перестало быть проблемой.'],
        ['Ben', 'And started being a hobby again.', 'И снова стало увлечением.'],
      ]],
      words: [
        ['run under three hours', 'выбежать из трёх часов', 'I will never run under three hours.'],
        ['took eight years to accept', 'на принятие ушло восемь лет', 'Which took eight years to accept.'],
        ['changed nothing about', 'ничего не изменило в', 'And changed nothing about Sunday mornings.'],
        ['stopped being a problem', 'перестало быть проблемой', 'Which is when it stopped being a problem.'],
        ['started being a hobby', 'стало увлечением', 'And started being a hobby again.'],
      ],
      rule: ['Тело — это долгий проект', 'Восстановление и предел обсуждаются теми же формами, что и любой другой план: модальный глагол плюс срок.'],
      quiz: [
        ['«Тогда это и перестало быть проблемой» —', ['Which is when it stopped being a problem', 'Which is when it stopped to be a problem', 'Which is when it stop being a problem'], 0],
        ['«На принятие этого ушло восемь лет» —', ['Which took eight years to accept', 'Which took eight years for accept', 'Which take eight years to accept'], 0],
        ['«И ничего не изменило в воскресных утрах» —', ['And changed nothing about Sunday mornings', 'And changed anything about Sunday mornings', 'And change nothing about Sunday mornings'], 0],
      ],
      order: ['И снова стало увлечением.', 'And started being a hobby again.'],
      produce: [
        ['Я никогда не выбегу из трёх часов.', 'I will never run under three hours.', []],
        ['На принятие этого ушло восемь лет.', 'Which took eight years to accept.', []],
        ['Тогда это и перестало быть проблемой.', 'Which is when it stopped being a problem.', []],
      ],
    },
    {
      checkpoint: true,
      title: 'Проверка: тело, которое есть',
      summary: 'Шесть фраз без подсказок.',
      topics: [DP, SA, PS, DA],
      produce: [
        ['И надо было показать его в марте.', 'And should have been looked at in March.', []],
        ['Потому что отдых выглядит как безделье.', 'Because rest looks like doing nothing.', []],
        ['Занятые счётом собственных подходов.', 'Being busy counting their own sets.', []],
        ['Из чего остальное угадывается.', 'From which the rest is guessed.', []],
        ['Ведь правота — это не разрешение.', 'Since being right is not permission.', []],
        ['Ведь сила воли кончается к среде.', 'Since willpower runs out by Wednesday.', []],
      ],
    },
  ],
}
