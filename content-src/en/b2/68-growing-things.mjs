// B2, блок 68 — Growing things. Что-то выращивать.
//
// Тематический блок: огород, балкон, фермеры, цена продуктов и сезонность.
// Условия, пассив, сравнения и разговор о земле.

const CO = 'b2-tema-comida'
const CL = 'b2-tema-clima'
const CI = 'b2-tema-ciudad'
const RI = 'b2-tema-riesgo'
const LI = 'b2-linkers'

export default {
  slug: 'growing-things',
  title: 'Что-то выращивать',
  subtitle: 'Огород, балкон, фермеры и цена еды',
  canDo: [
    'обсуждать огород и участок',
    'говорить о сезонности продуктов',
    'спорить о цене на еду',
    'обсуждать труд фермеров',
    'объяснять, зачем выращивать самому',
  ],
  lessons: [
    {
      title: 'Four tomatoes and a lesson',
      summary: 'Четыре помидора и урок.',
      topics: [CO, LI, CI],
      dialogue: ['Балкон', [
        ['Anna', 'I grew four tomatoes, at enormous expense.', 'Я вырастила четыре помидора, за огромные деньги.'],
        ['Ben', 'Which is what the first year always costs.', 'Столько всегда и стоит первый год.'],
        ['Anna', 'And is not why anybody does it.', 'И делают это не ради этого.'],
        ['Ben', 'Since the point is watching something work.', 'Ведь смысл — видеть, как что-то работает.'],
        ['Anna', 'Which almost nothing else in a flat does.', 'Чего в квартире почти ничто больше не делает.'],
      ]],
      words: [
        ['at enormous expense', 'за огромные деньги', 'I grew four tomatoes, at enormous expense.'],
        ['what the first year costs', 'сколько стоит первый год', 'Which is what the first year always costs.'],
        ['is not why anybody does it', 'делают это не ради этого', 'And is not why anybody does it.'],
        ['watching something work', 'видеть, как что-то работает', 'Since the point is watching something work.'],
        ['almost nothing else', 'почти ничто больше', 'Which almost nothing else in a flat does.'],
      ],
      rule: ['Watch something work', 'Watching something work. После watch идёт объект и голый инфинитив.'],
      quiz: [
        ['«Ведь смысл — видеть, как что-то работает» —', ['Since the point is watching something work', 'Since the point is watching something to work', 'Since the point is watch something work'], 0],
        ['«Столько всегда и стоит первый год» —', ['Which is what the first year always costs', 'Which is what the first year always cost', 'Which is that the first year always costs'], 0],
        ['«Чего в квартире почти ничто больше не делает» —', ['Which almost nothing else in a flat does', 'Which almost nothing else in a flat do', 'Which almost nothing other in a flat does'], 0],
      ],
      order: ['И делают это не ради этого.', 'And is not why anybody does it.'],
      produce: [
        ['Я вырастила четыре помидора, за огромные деньги.', 'I grew four tomatoes, at enormous expense.', []],
        ['Ведь смысл — видеть, как что-то работает.', 'Since the point is watching something work.', []],
        ['Чего в квартире почти ничто больше не делает.', 'Which almost nothing else in a flat does.', []],
      ],
    },
    {
      title: 'The allotment waiting list',
      summary: 'Очередь на участок.',
      topics: [CI, CO, LI],
      dialogue: ['Очередь', [
        ['Ben', 'Nine years, in this part of town.', 'Девять лет, в этой части города.'],
        ['Anna', 'Which tells you how much land is left.', 'Что говорит, сколько земли осталось.'],
        ['Ben', 'And how many people want to use it.', 'И сколько людей хотят ею пользоваться.'],
        ['Anna', 'Which no council has planned for since the war.', 'Чего мэрия не планировала со времён войны.'],
        ['Ben', 'And which returns every time food gets dear.', 'И что возвращается каждый раз, когда еда дорожает.'],
      ]],
      words: [
        ['Nine years, in this part of town', 'девять лет в этой части города', 'Nine years, in this part of town.'],
        ['how much land is left', 'сколько земли осталось', 'Which tells you how much land is left.'],
        ['want to use it', 'хотят ею пользоваться', 'And how many people want to use it.'],
        ['has planned for since the war', 'не планировала со времён войны', 'Which no council has planned for since the war.'],
        ['every time food gets dear', 'каждый раз, когда еда дорожает', 'And which returns every time food gets dear.'],
      ],
      rule: ['How much и how many', 'How much land and how many people. Much для неисчисляемого, many для исчисляемого.'],
      quiz: [
        ['«Что говорит, сколько земли осталось» —', ['Which tells you how much land is left', 'Which tells you how many land is left', 'Which tells you how much land are left'], 0],
        ['«И что возвращается каждый раз, когда еда дорожает» —', ['And which returns every time food gets dear', 'And which return every time food gets dear', 'And which returns every time food get dear'], 0],
        ['«Чего мэрия не планировала со времён войны» —', ['Which no council has planned for since the war', 'Which no council has planned since the war for it', 'Which no council have planned for since the war'], 0],
      ],
      order: ['Девять лет, в этой части города.', 'Nine years, in this part of town.'],
      produce: [
        ['Девять лет, в этой части города.', 'Nine years, in this part of town.', []],
        ['Что говорит, сколько земли осталось.', 'Which tells you how much land is left.', []],
        ['И что возвращается каждый раз, когда еда дорожает.', 'And which returns every time food gets dear.', []],
      ],
    },
    {
      title: 'Out of season',
      summary: 'Не в сезон.',
      topics: [CO, CL, LI],
      dialogue: ['Сезон', [
        ['Anna', 'Strawberries in January, flown in overnight.', 'Клубника в январе, привезённая самолётом за ночь.'],
        ['Ben', 'Which taste of nothing, as everybody notices.', 'Со вкусом ничего, как все и замечают.'],
        ['Anna', 'And are bought anyway, in enormous numbers.', 'И которую всё равно покупают, в огромных количествах.'],
        ['Ben', 'Since a strawberry in winter is not about taste.', 'Ведь клубника зимой не про вкус.'],
        ['Anna', 'But about it being January.', 'А про то, что сейчас январь.'],
      ]],
      words: [
        ['flown in overnight', 'привезённая самолётом за ночь', 'Strawberries in January, flown in overnight.'],
        ['taste of nothing', 'со вкусом ничего', 'Which taste of nothing, as everybody notices.'],
        ['in enormous numbers', 'в огромных количествах', 'And are bought anyway, in enormous numbers.'],
        ['not about taste', 'не про вкус', 'Since a strawberry in winter is not about taste.'],
        ['it being January', 'что сейчас январь', 'But about it being January.'],
      ],
      rule: ['It being January — герундий с подлежащим', 'About it being January. Оборот присоединяет обстоятельство к предлогу.'],
      quiz: [
        ['«А про то, что сейчас январь» —', ['But about it being January', 'But about it be January', 'But about that it being January'], 0],
        ['«Клубника в январе, привезённая самолётом за ночь» —', ['Strawberries in January, flown in overnight', 'Strawberries in January, flew in overnight', 'Strawberries in January, flying in overnight'], 0],
        ['«Со вкусом ничего, как все и замечают» —', ['Which taste of nothing, as everybody notices', 'Which tastes of nothing, as everybody notice', 'Which taste of nothing, how everybody notices'], 0],
      ],
      order: ['И которую всё равно покупают, в огромных количествах.', 'And are bought anyway, in enormous numbers.'],
      produce: [
        ['Клубника в январе, привезённая самолётом за ночь.', 'Strawberries in January, flown in overnight.', []],
        ['Ведь клубника зимой не про вкус.', 'Since a strawberry in winter is not about taste.', []],
        ['А про то, что сейчас январь.', 'But about it being January.', []],
      ],
    },
    {
      title: 'What the farmer gets',
      summary: 'Что достаётся фермеру.',
      topics: [CO, RI, LI],
      dialogue: ['Цена', [
        ['Ben', 'Eight pence of the pound reaches the farm.', 'До фермы доходит восемь пенсов с фунта.'],
        ['Anna', 'Which is the number that ends most arguments.', 'Цифра, которая заканчивает большинство споров.'],
        ['Ben', 'About whether food is too cheap or too dear.', 'О том, дешева еда или дорога.'],
        ['Anna', 'Since it is both, at different points.', 'Ведь она и то и другое, в разных точках.'],
        ['Ben', 'Which is what a supply chain does.', 'Так и работает цепочка поставок.'],
      ]],
      words: [
        ['Eight pence of the pound', 'восемь пенсов с фунта', 'Eight pence of the pound reaches the farm.'],
        ['ends most arguments', 'заканчивает большинство споров', 'Which is the number that ends most arguments.'],
        ['too cheap or too dear', 'слишком дёшево или дорого', 'About whether food is too cheap or too dear.'],
        ['at different points', 'в разных точках', 'Since it is both, at different points.'],
        ['a supply chain', 'цепочка поставок', 'Which is what a supply chain does.'],
      ],
      rule: ['Whether… or в косвенном вопросе', 'Whether food is too cheap or too dear. Оборот соединяет два варианта одного вопроса.'],
      quiz: [
        ['«О том, дешева еда или дорога» —', ['About whether food is too cheap or too dear', 'About whether is food too cheap or too dear', 'About if food is too cheap or too dear it'], 0],
        ['«До фермы доходит восемь пенсов с фунта» —', ['Eight pence of the pound reaches the farm', 'Eight pence of the pound reach the farm', 'Eight pences of the pound reaches the farm'], 0],
        ['«Так и работает цепочка поставок» —', ['Which is what a supply chain does', 'Which is what a supply chain do', 'Which is that a supply chain does'], 0],
      ],
      order: ['Ведь она и то и другое, в разных точках.', 'Since it is both, at different points.'],
      produce: [
        ['До фермы доходит восемь пенсов с фунта.', 'Eight pence of the pound reaches the farm.', []],
        ['О том, дешева еда или дорога.', 'About whether food is too cheap or too dear.', []],
        ['Так и работает цепочка поставок.', 'Which is what a supply chain does.', []],
      ],
    },
    {
      title: 'A bad summer',
      summary: 'Плохое лето.',
      topics: [CL, CO, LI],
      dialogue: ['Урожай', [
        ['Anna', 'The whole crop was lost in one week.', 'Весь урожай погиб за неделю.'],
        ['Ben', 'Which insurance covers, at a price.', 'Что страховка покрывает, за свою цену.'],
        ['Anna', 'Rising every year, for obvious reasons.', 'Растущую каждый год, по понятным причинам.'],
        ['Ben', 'Which will end some farms entirely.', 'Что просто прикончит некоторые хозяйства.'],
        ['Anna', 'And is already being priced into the land.', 'И это уже заложено в цену земли.'],
      ]],
      words: [
        ['The whole crop was lost', 'весь урожай погиб', 'The whole crop was lost in one week.'],
        ['insurance covers, at a price', 'страховка покрывает за свою цену', 'Which insurance covers, at a price.'],
        ['Rising every year', 'растущую каждый год', 'Rising every year, for obvious reasons.'],
        ['will end some farms', 'прикончит некоторые хозяйства', 'Which will end some farms entirely.'],
        ['priced into the land', 'заложено в цену земли', 'And is already being priced into the land.'],
      ],
      rule: ['Is being priced — длящийся пассив', 'It is already being priced into the land. Форма описывает идущий процесс.'],
      quiz: [
        ['«И это уже заложено в цену земли» —', ['And is already being priced into the land', 'And is already been priced into the land', 'And is already being price into the land'], 0],
        ['«Весь урожай погиб за неделю» —', ['The whole crop was lost in one week', 'The whole crop was lose in one week', 'The whole crop were lost in one week'], 0],
        ['«Растущую каждый год, по понятным причинам» —', ['Rising every year, for obvious reasons', 'Rise every year, for obvious reasons', 'Rising every year, for obvious reason'], 0],
      ],
      order: ['Что просто прикончит некоторые хозяйства.', 'Which will end some farms entirely.'],
      produce: [
        ['Весь урожай погиб за неделю.', 'The whole crop was lost in one week.', []],
        ['Что страховка покрывает, за свою цену.', 'Which insurance covers, at a price.', []],
        ['И это уже заложено в цену земли.', 'And is already being priced into the land.', []],
      ],
    },
    {
      title: 'Who wants to farm',
      summary: 'Кто хочет быть фермером.',
      topics: [CO, RI, LI],
      dialogue: ['Смена', [
        ['Ben', 'The average farmer here is fifty nine.', 'Средний фермер здесь — пятьдесят девять лет.'],
        ['Anna', 'Which is a number nobody can argue with.', 'Цифра, с которой не поспоришь.'],
        ['Ben', 'And which no policy has moved in thirty years.', 'И которую никакая политика не сдвинула за тридцать лет.'],
        ['Anna', 'Since land costs more than farming earns.', 'Ведь земля стоит больше, чем приносит хозяйство.'],
        ['Ben', 'Which is the whole problem, arithmetically.', 'Арифметически в этом вся проблема.'],
      ]],
      words: [
        ['The average farmer', 'средний фермер', 'The average farmer here is fifty nine.'],
        ['nobody can argue with', 'с чем не поспоришь', 'Which is a number nobody can argue with.'],
        ['no policy has moved', 'никакая политика не сдвинула', 'And which no policy has moved in thirty years.'],
        ['land costs more than farming earns', 'земля дороже, чем приносит хозяйство', 'Since land costs more than farming earns.'],
        ['arithmetically', 'арифметически', 'Which is the whole problem, arithmetically.'],
      ],
      rule: ['Argue with — предлог в конце', 'A number nobody can argue with. Предлог остаётся в хвосте определения.'],
      quiz: [
        ['«Цифра, с которой не поспоришь» —', ['A number nobody can argue with', 'A number nobody can argue', 'A number what nobody can argue with'], 0],
        ['«Ведь земля стоит больше, чем приносит хозяйство» —', ['Since land costs more than farming earns', 'Since land cost more than farming earns', 'Since land costs more that farming earns'], 0],
        ['«И которую никакая политика не сдвинула за тридцать лет» —', ['Which no policy has moved in thirty years', 'Which no policy has move in thirty years', 'Which no policy have moved in thirty years'], 0],
      ],
      order: ['Средний фермер здесь — пятьдесят девять лет.', 'The average farmer here is fifty nine.'],
      produce: [
        ['Средний фермер здесь — пятьдесят девять лет.', 'The average farmer here is fifty nine.', []],
        ['Цифра, с которой не поспоришь.', 'Which is a number nobody can argue with.', []],
        ['Ведь земля стоит больше, чем приносит хозяйство.', 'Since land costs more than farming earns.', []],
      ],
    },
    {
      title: 'Sharing a harvest',
      summary: 'Делиться урожаем.',
      topics: [CI, CO, LI],
      dialogue: ['Соседи', [
        ['Anna', 'Nobody can eat forty courgettes.', 'Сорок кабачков съесть невозможно.'],
        ['Ben', 'Which is why the street gets them.', 'Поэтому они и достаются улице.'],
        ['Anna', 'Left in a box, with a note.', 'Оставленные в коробке, с запиской.'],
        ['Ben', 'Which has started more conversations than anything.', 'Что завязало больше разговоров, чем что угодно.'],
        ['Anna', 'In eleven years of living here.', 'За одиннадцать лет жизни здесь.'],
      ]],
      words: [
        ['forty courgettes', 'сорок кабачков', 'Nobody can eat forty courgettes.'],
        ['the street gets them', 'достаются улице', 'Which is why the street gets them.'],
        ['Left in a box, with a note', 'оставленные в коробке с запиской', 'Left in a box, with a note.'],
        ['started more conversations', 'завязало больше разговоров', 'Which has started more conversations than anything.'],
        ['eleven years of living here', 'одиннадцать лет жизни здесь', 'In eleven years of living here.'],
      ],
      rule: ['Of + герундий как определение', 'Eleven years of living here. Форма на -ing после of уточняет период.'],
      quiz: [
        ['«За одиннадцать лет жизни здесь» —', ['In eleven years of living here', 'In eleven years of live here', 'In eleven years of to live here'], 0],
        ['«Оставленные в коробке, с запиской» —', ['Left in a box, with a note', 'Leaving in a box, with a note', 'Left on a box, with a note'], 0],
        ['«Что завязало больше разговоров, чем что угодно» —', ['Which has started more conversations than anything', 'Which has started more conversations than nothing', 'Which have started more conversations than anything'], 0],
      ],
      order: ['Сорок кабачков съесть невозможно.', 'Nobody can eat forty courgettes.'],
      produce: [
        ['Сорок кабачков съесть невозможно.', 'Nobody can eat forty courgettes.', []],
        ['Оставленные в коробке, с запиской.', 'Left in a box, with a note.', []],
        ['За одиннадцать лет жизни здесь.', 'In eleven years of living here.', []],
      ],
    },
    {
      title: 'Why it is worth it',
      summary: 'Почему это стоит того.',
      topics: [CO, CL, LI],
      dialogue: ['Итог', [
        ['Ben', 'You learn what a month tastes like.', 'Узнаёшь, каков на вкус месяц.'],
        ['Anna', 'Which no shop can sell you.', 'Чего ни один магазин продать не может.'],
        ['Ben', 'And which changes how you buy the rest.', 'И что меняет то, как покупаешь всё остальное.'],
        ['Anna', 'Quietly, over about three seasons.', 'Тихо, примерно за три сезона.'],
        ['Ben', 'Which is the only conversion that lasts.', 'Единственное обращение, которое держится.'],
      ]],
      words: [
        ['what a month tastes like', 'каков на вкус месяц', 'You learn what a month tastes like.'],
        ['no shop can sell you', 'ни один магазин не продаст', 'Which no shop can sell you.'],
        ['how you buy the rest', 'как покупаешь остальное', 'And which changes how you buy the rest.'],
        ['over about three seasons', 'примерно за три сезона', 'Quietly, over about three seasons.'],
        ['the only conversion that lasts', 'единственное обращение, которое держится', 'Which is the only conversion that lasts.'],
      ],
      rule: ['Еда объясняется сезоном и цепочкой', 'Сколько доходит до фермы и что растёт в этом месяце — два факта, которые меняют весь разговор о цене.'],
      quiz: [
        ['«Узнаёшь, каков на вкус месяц» —', ['You learn what a month tastes like', 'You learn what does a month taste like', 'You learn how a month tastes like'], 0],
        ['«И что меняет то, как покупаешь всё остальное» —', ['And which changes how you buy the rest', 'And which changes how do you buy the rest', 'And which change how you buy the rest'], 0],
        ['«Единственное обращение, которое держится» —', ['The only conversion that lasts', 'The only conversion that last', 'The only conversion what lasts'], 0],
      ],
      order: ['Тихо, примерно за три сезона.', 'Quietly, over about three seasons.'],
      produce: [
        ['Узнаёшь, каков на вкус месяц.', 'You learn what a month tastes like.', []],
        ['Чего ни один магазин продать не может.', 'Which no shop can sell you.', []],
        ['И что меняет то, как покупаешь всё остальное.', 'And which changes how you buy the rest.', []],
      ],
    },
    {
      checkpoint: true,
      title: 'Проверка: что-то выращивать',
      summary: 'Шесть фраз без подсказок.',
      topics: [CO, CL, CI, RI],
      produce: [
        ['Ведь смысл — видеть, как что-то работает.', 'Since the point is watching something work.', []],
        ['Что говорит, сколько земли осталось.', 'Which tells you how much land is left.', []],
        ['А про то, что сейчас январь.', 'But about it being January.', []],
        ['О том, дешева еда или дорога.', 'About whether food is too cheap or too dear.', []],
        ['И это уже заложено в цену земли.', 'And is already being priced into the land.', []],
        ['Цифра, с которой не поспоришь.', 'Which is a number nobody can argue with.', []],
      ],
    },
  ],
}
