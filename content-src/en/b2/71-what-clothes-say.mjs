// B2, блок 71 — What clothes say. Что говорит одежда.
//
// Тематический блок: дресс-код, дешёвая мода, форма, вторые руки и как
// одежда читается другими. Пассив, уступки, точные оценки.

const RO = 'b1-tema-ropa'
const CU = 'b2-tema-cultura'
const SO = 'b2-tema-sociedad'
const RI = 'b2-tema-riesgo'
const LI = 'b2-linkers'

export default {
  slug: 'what-clothes-say',
  title: 'Что говорит одежда',
  subtitle: 'Дресс-код, дешёвая мода и вторые руки',
  canDo: [
    'обсуждать дресс-код на работе',
    'говорить о цене и качестве одежды',
    'спорить о быстрой моде',
    'обсуждать секонд-хенд',
    'объяснять свой стиль без оправданий',
  ],
  lessons: [
    {
      title: 'The unwritten dress code',
      summary: 'Неписаный дресс-код.',
      topics: [SO, RO, LI],
      dialogue: ['Код', [
        ['Anna', 'Nothing is required, and everything is noticed.', 'Ничего не требуется, и всё замечается.'],
        ['Ben', 'Which is harder than a uniform.', 'Что труднее формы.'],
        ['Anna', 'Since a uniform can be bought once.', 'Ведь форму можно купить один раз.'],
        ['Ben', 'And a code has to be read weekly.', 'А код приходится считывать еженедельно.'],
        ['Anna', 'By everybody who was not raised in it.', 'Всеми, кто не вырос внутри него.'],
      ]],
      words: [
        ['Nothing is required', 'ничего не требуется', 'Nothing is required, and everything is noticed.'],
        ['everything is noticed', 'всё замечается', 'And everything is noticed, quietly.'],
        ['can be bought once', 'можно купить один раз', 'Since a uniform can be bought once.'],
        ['has to be read weekly', 'приходится считывать еженедельно', 'And a code has to be read weekly.'],
        ['who was not raised in it', 'кто не вырос внутри него', 'By everybody who was not raised in it.'],
      ],
      rule: ['Have to be read — необходимость в пассиве', 'A code has to be read weekly. Форма соединяет необходимость и пассив.'],
      quiz: [
        ['«А код приходится считывать еженедельно» —', ['And a code has to be read weekly', 'And a code has to be readed weekly', 'And a code have to be read weekly'], 0],
        ['«Ничего не требуется, и всё замечается» —', ['Nothing is required, and everything is noticed', 'Nothing is require, and everything is noticed', 'Nothing are required, and everything is noticed'], 0],
        ['«Всеми, кто не вырос внутри него» —', ['By everybody who was not raised in it', 'By everybody who was not raise in it', 'By everybody what was not raised in it'], 0],
      ],
      order: ['Что труднее формы.', 'Which is harder than a uniform.'],
      produce: [
        ['Ничего не требуется, и всё замечается.', 'Nothing is required, and everything is noticed.', []],
        ['Ведь форму можно купить один раз.', 'Since a uniform can be bought once.', []],
        ['А код приходится считывать еженедельно.', 'And a code has to be read weekly.', []],
      ],
    },
    {
      title: 'Four pounds for a shirt',
      summary: 'Четыре фунта за рубашку.',
      topics: [RI, RO, LI],
      dialogue: ['Цена', [
        ['Ben', 'Somebody has paid for the difference.', 'За разницу кто-то заплатил.'],
        ['Anna', 'Which is the whole argument, in one line.', 'Весь довод в одной строке.'],
        ['Ben', 'And is usually somebody far away.', 'И обычно это кто-то далеко.'],
        ['Anna', 'Whose wages are the reason for the price.', 'Чья зарплата и есть причина этой цены.'],
        ['Ben', 'Which no label has ever mentioned.', 'Чего не упоминала ни одна этикетка.'],
      ]],
      words: [
        ['has paid for the difference', 'заплатил за разницу', 'Somebody has paid for the difference.'],
        ['in one line', 'в одной строке', 'Which is the whole argument, in one line.'],
        ['somebody far away', 'кто-то далеко', 'And is usually somebody far away.'],
        ['Whose wages', 'чья зарплата', 'Whose wages are the reason for the price.'],
        ['no label has mentioned', 'ни одна этикетка не упоминала', 'Which no label has ever mentioned.'],
      ],
      rule: ['Whose о людях в придаточном', 'Somebody whose wages are the reason. Местоимение указывает на принадлежность.'],
      quiz: [
        ['«Чья зарплата и есть причина этой цены» —', ['Whose wages are the reason for the price', 'Which wages are the reason for the price', 'Whose wages is the reason for the price'], 0],
        ['«За разницу кто-то заплатил» —', ['Somebody has paid for the difference', 'Somebody has pay for the difference', 'Somebody have paid for the difference'], 0],
        ['«Чего не упоминала ни одна этикетка» —', ['Which no label has ever mentioned', 'Which no label has ever mention', 'Which not label has ever mentioned'], 0],
      ],
      order: ['И обычно это кто-то далеко.', 'And is usually somebody far away.'],
      produce: [
        ['За разницу кто-то заплатил.', 'Somebody has paid for the difference.', []],
        ['Чья зарплата и есть причина этой цены.', 'Whose wages are the reason for the price.', []],
        ['Чего не упоминала ни одна этикетка.', 'Which no label has ever mentioned.', []],
      ],
    },
    {
      title: 'Thirty wears',
      summary: 'Тридцать носок.',
      topics: [RO, RI, LI],
      dialogue: ['Правило', [
        ['Anna', 'I ask whether I will wear it thirty times.', 'Я спрашиваю, надену ли я это тридцать раз.'],
        ['Ben', 'Which kills about half of the basket.', 'Что убивает примерно половину корзины.'],
        ['Anna', 'And is honest, unlike the word investment.', 'И это честно, в отличие от слова «вложение».'],
        ['Ben', 'Which is used for anything expensive.', 'Которым называют всё дорогое.'],
        ['Anna', 'And explains nothing about the wardrobe.', 'И которое ничего не объясняет про гардероб.'],
      ]],
      words: [
        ['wear it thirty times', 'надену тридцать раз', 'I ask whether I will wear it thirty times.'],
        ['kills about half of the basket', 'убивает половину корзины', 'Which kills about half of the basket.'],
        ['unlike the word investment', 'в отличие от слова «вложение»', 'And is honest, unlike the word investment.'],
        ['used for anything expensive', 'называют всё дорогое', 'Which is used for anything expensive.'],
        ['explains nothing about', 'ничего не объясняет про', 'And explains nothing about the wardrobe.'],
      ],
      rule: ['Whether о будущем', 'I ask whether I will wear it. После whether будущее время допустимо, в отличие от if в условии.'],
      quiz: [
        ['«Я спрашиваю, надену ли я это тридцать раз» —', ['I ask whether I will wear it thirty times', 'I ask whether will I wear it thirty times', 'I ask whether I will wearing it thirty times'], 0],
        ['«Которым называют всё дорогое» —', ['Which is used for anything expensive', 'Which is use for anything expensive', 'Which is used for anything expensively'], 0],
        ['«И которое ничего не объясняет про гардероб» —', ['And explains nothing about the wardrobe', 'And explain nothing about the wardrobe', 'And explains anything about the wardrobe'], 0],
      ],
      order: ['Что убивает примерно половину корзины.', 'Which kills about half of the basket.'],
      produce: [
        ['Я спрашиваю, надену ли я это тридцать раз.', 'I ask whether I will wear it thirty times.', []],
        ['И это честно, в отличие от слова «вложение».', 'And is honest, unlike the word investment.', []],
        ['И которое ничего не объясняет про гардероб.', 'And explains nothing about the wardrobe.', []],
      ],
    },
    {
      title: 'Second hand',
      summary: 'Секонд-хенд.',
      topics: [RO, SO, LI],
      dialogue: ['Вторые руки', [
        ['Ben', 'Half of my coat is older than I am.', 'Половина моего пальто старше меня.'],
        ['Anna', 'Which used to be embarrassing here.', 'Что здесь раньше было стыдно.'],
        ['Ben', 'And has become expensive, in the same shops.', 'И стало дорого, в тех же самых магазинах.'],
        ['Anna', 'Which the people who need them have noticed.', 'Что заметили те, кому они нужны.'],
        ['Ben', 'And nobody writing about it mentions.', 'И о чём не пишет никто из пишущих.'],
      ]],
      words: [
        ['older than I am', 'старше меня', 'Half of my coat is older than I am.'],
        ['used to be embarrassing', 'раньше было стыдно', 'Which used to be embarrassing here.'],
        ['has become expensive', 'стало дорого', 'And has become expensive, in the same shops.'],
        ['the people who need them', 'те, кому они нужны', 'Which the people who need them have noticed.'],
        ['nobody writing about it', 'никто из пишущих', 'And nobody writing about it mentions.'],
      ],
      rule: ['Used to be — прошлая норма', 'It used to be embarrassing. Оборот описывает прежнее положение дел.'],
      quiz: [
        ['«Что здесь раньше было стыдно» —', ['Which used to be embarrassing here', 'Which used to being embarrassing here', 'Which use to be embarrassing here'], 0],
        ['«Половина моего пальто старше меня» —', ['Half of my coat is older than I am', 'Half of my coat is older than me am', 'Half of my coat are older than I am'], 0],
        ['«И о чём не пишет никто из пишущих» —', ['And nobody writing about it mentions', 'And nobody writing about it mention', 'And nobody write about it mentions'], 0],
      ],
      order: ['И стало дорого, в тех же самых магазинах.', 'And has become expensive, in the same shops.'],
      produce: [
        ['Половина моего пальто старше меня.', 'Half of my coat is older than I am.', []],
        ['Что здесь раньше было стыдно.', 'Which used to be embarrassing here.', []],
        ['Что заметили те, кому они нужны.', 'Which the people who need them have noticed.', []],
      ],
    },
    {
      title: 'Being read wrongly',
      summary: 'Когда читают неправильно.',
      topics: [SO, CU, LI],
      dialogue: ['Восприятие', [
        ['Anna', 'The same jacket means two things in two rooms.', 'Один и тот же пиджак значит разное в двух комнатах.'],
        ['Ben', 'Which nobody can control entirely.', 'Что полностью проконтролировать нельзя.'],
        ['Anna', 'And which is worth knowing before the interview.', 'И что стоит знать до собеседования.'],
        ['Ben', 'Since the first ten seconds are visual.', 'Ведь первые десять секунд — визуальные.'],
        ['Anna', 'However unfair anybody finds that.', 'Каким бы несправедливым это ни казалось.'],
      ]],
      words: [
        ['means two things in two rooms', 'значит разное в двух комнатах', 'The same jacket means two things in two rooms.'],
        ['control entirely', 'полностью проконтролировать', 'Which nobody can control entirely.'],
        ['before the interview', 'до собеседования', 'And which is worth knowing before the interview.'],
        ['the first ten seconds', 'первые десять секунд', 'Since the first ten seconds are visual.'],
        ['However unfair', 'каким бы несправедливым', 'However unfair anybody finds that.'],
      ],
      rule: ['However + прилагательное', 'However unfair anybody finds that. После however идёт прилагательное и прямой порядок слов.'],
      quiz: [
        ['«Каким бы несправедливым это ни казалось» —', ['However unfair anybody finds that', 'However unfair does anybody find that', 'However unfair anybody find that'], 0],
        ['«Ведь первые десять секунд — визуальные» —', ['Since the first ten seconds are visual', 'Since the first ten seconds is visual', 'Since the first ten second are visual'], 0],
        ['«Один и тот же пиджак значит разное в двух комнатах» —', ['The same jacket means two things in two rooms', 'The same jacket mean two things in two rooms', 'The same jacket means two thing in two rooms'], 0],
      ],
      order: ['Что полностью проконтролировать нельзя.', 'Which nobody can control entirely.'],
      produce: [
        ['Один и тот же пиджак значит разное в двух комнатах.', 'The same jacket means two things in two rooms.', []],
        ['И что стоит знать до собеседования.', 'And which is worth knowing before the interview.', []],
        ['Каким бы несправедливым это ни казалось.', 'However unfair anybody finds that.', []],
      ],
    },
    {
      title: 'A uniform, by choice',
      summary: 'Форма по своей воле.',
      topics: [CU, RO, LI],
      dialogue: ['Свой набор', [
        ['Ben', 'Five identical shirts, and no decisions.', 'Пять одинаковых рубашек и никаких решений.'],
        ['Anna', 'Which sounds joyless and frees a morning.', 'Звучит безрадостно и освобождает утро.'],
        ['Ben', 'And is copied from people who are famous for it.', 'И скопировано у тех, кто этим известен.'],
        ['Anna', 'Who had rather more decisions to make.', 'У кого решений было куда больше.'],
        ['Ben', 'Which is the part everybody skips.', 'Именно эту часть все и пропускают.'],
      ]],
      words: [
        ['Five identical shirts', 'пять одинаковых рубашек', 'Five identical shirts, and no decisions.'],
        ['sounds joyless', 'звучит безрадостно', 'Which sounds joyless and frees a morning.'],
        ['copied from people', 'скопировано у людей', 'And is copied from people who are famous for it.'],
        ['rather more decisions', 'куда больше решений', 'Who had rather more decisions to make.'],
        ['everybody skips', 'все пропускают', 'Which is the part everybody skips.'],
      ],
      rule: ['Rather more — усиление сравнения', 'Rather more decisions to make. Наречие rather смягчает и одновременно усиливает степень.'],
      quiz: [
        ['«У кого решений было куда больше» —', ['Who had rather more decisions to make', 'Who had rather more decisions for make', 'Who had rather more decisions making'], 0],
        ['«И скопировано у тех, кто этим известен» —', ['And is copied from people who are famous for it', 'And is copy from people who are famous for it', 'And is copied from people who is famous for it'], 0],
        ['«Звучит безрадостно и освобождает утро» —', ['Which sounds joyless and frees a morning', 'Which sounds joylessly and frees a morning', 'Which sound joyless and free a morning'], 0],
      ],
      order: ['Именно эту часть все и пропускают.', 'Which is the part everybody skips.'],
      produce: [
        ['Пять одинаковых рубашек и никаких решений.', 'Five identical shirts, and no decisions.', []],
        ['Звучит безрадостно и освобождает утро.', 'Which sounds joyless and frees a morning.', []],
        ['У кого решений было куда больше.', 'Who had rather more decisions to make.', []],
      ],
    },
    {
      title: 'Repairing instead of replacing',
      summary: 'Починить вместо замены.',
      topics: [RO, RI, LI],
      dialogue: ['Починка', [
        ['Anna', 'The zip was replaced for eleven pounds.', 'Молнию поменяли за одиннадцать фунтов.'],
        ['Ben', 'Which saved a coat worth two hundred.', 'Что спасло пальто за двести.'],
        ['Anna', 'And took one visit and four days.', 'И заняло один визит и четыре дня.'],
        ['Ben', 'Which most people have never tried.', 'Чего большинство ни разу не пробовало.'],
        ['Anna', 'Since nobody was ever shown where to go.', 'Ведь никому не показали, куда идти.'],
      ]],
      words: [
        ['The zip was replaced', 'молнию поменяли', 'The zip was replaced for eleven pounds.'],
        ['saved a coat worth two hundred', 'спасло пальто за двести', 'Which saved a coat worth two hundred.'],
        ['one visit and four days', 'один визит и четыре дня', 'And took one visit and four days.'],
        ['have never tried', 'ни разу не пробовали', 'Which most people have never tried.'],
        ['was ever shown where to go', 'показали, куда идти', 'Since nobody was ever shown where to go.'],
      ],
      rule: ['Be shown where to go', 'Nobody was shown where to go. Пассив соединяется с вопросительным словом и инфинитивом.'],
      quiz: [
        ['«Ведь никому не показали, куда идти» —', ['Since nobody was ever shown where to go', 'Since nobody was ever shown where go', 'Since nobody was ever show where to go'], 0],
        ['«Что спасло пальто за двести» —', ['Which saved a coat worth two hundred', 'Which saved a coat worthy two hundred', 'Which save a coat worth two hundred'], 0],
        ['«Чего большинство ни разу не пробовало» —', ['Which most people have never tried', 'Which most people has never tried', 'Which most people have never try'], 0],
      ],
      order: ['И заняло один визит и четыре дня.', 'And took one visit and four days.'],
      produce: [
        ['Молнию поменяли за одиннадцать фунтов.', 'The zip was replaced for eleven pounds.', []],
        ['Что спасло пальто за двести.', 'Which saved a coat worth two hundred.', []],
        ['Ведь никому не показали, куда идти.', 'Since nobody was ever shown where to go.', []],
      ],
    },
    {
      title: 'Dressing for yourself',
      summary: 'Одеваться для себя.',
      topics: [CU, SO, LI],
      dialogue: ['Итог', [
        ['Ben', 'Nobody dresses only for themselves.', 'Никто не одевается только для себя.'],
        ['Anna', 'Which is not a defeat, only a fact.', 'Это не поражение, а просто факт.'],
        ['Ben', 'Since clothes are read, like any language.', 'Ведь одежду читают, как любой язык.'],
        ['Anna', 'And can be spoken well or badly.', 'И на ней можно говорить хорошо или плохо.'],
        ['Ben', 'Which is worth ten minutes of thought.', 'Что стоит десяти минут размышления.'],
      ]],
      words: [
        ['dresses only for themselves', 'одевается только для себя', 'Nobody dresses only for themselves.'],
        ['not a defeat, only a fact', 'не поражение, а факт', 'Which is not a defeat, only a fact.'],
        ['clothes are read', 'одежду читают', 'Since clothes are read, like any language.'],
        ['spoken well or badly', 'говорить хорошо или плохо', 'And can be spoken well or badly.'],
        ['ten minutes of thought', 'десять минут размышления', 'Which is worth ten minutes of thought.'],
      ],
      rule: ['Одежда читается как язык', 'Правило тридцати носок и вопрос «в какой комнате» объясняют выбор лучше любых слов о стиле.'],
      quiz: [
        ['«Ведь одежду читают, как любой язык» —', ['Since clothes are read, like any language', 'Since clothes is read, like any language', 'Since clothes are readed, like any language'], 0],
        ['«Никто не одевается только для себя» —', ['Nobody dresses only for themselves', 'Nobody dress only for themselves', 'Nobody dresses only for theirselves'], 0],
        ['«И на ней можно говорить хорошо или плохо» —', ['And can be spoken well or badly', 'And can be speak well or badly', 'And can be spoken good or badly'], 0],
      ],
      order: ['Что стоит десяти минут размышления.', 'Which is worth ten minutes of thought.'],
      produce: [
        ['Никто не одевается только для себя.', 'Nobody dresses only for themselves.', []],
        ['Ведь одежду читают, как любой язык.', 'Since clothes are read, like any language.', []],
        ['И на ней можно говорить хорошо или плохо.', 'And can be spoken well or badly.', []],
      ],
    },
    {
      checkpoint: true,
      title: 'Проверка: что говорит одежда',
      summary: 'Шесть фраз без подсказок.',
      topics: [RO, CU, SO, RI],
      produce: [
        ['А код приходится считывать еженедельно.', 'And a code has to be read weekly.', []],
        ['Чья зарплата и есть причина этой цены.', 'Whose wages are the reason for the price.', []],
        ['Я спрашиваю, надену ли я это тридцать раз.', 'I ask whether I will wear it thirty times.', []],
        ['Что здесь раньше было стыдно.', 'Which used to be embarrassing here.', []],
        ['Каким бы несправедливым это ни казалось.', 'However unfair anybody finds that.', []],
        ['Ведь никому не показали, куда идти.', 'Since nobody was ever shown where to go.', []],
      ],
    },
  ],
}
