// B2, блок 60 — How we move. Как мы передвигаемся.
//
// Тематический блок: машина против транспорта, парковка, велосипед, риск на
// дороге и что город решает за нас. Условия, сравнения, цифры.

const CD = 'b1-tema-conducir'
const CI = 'b2-tema-ciudad'
const RI = 'b2-tema-riesgo'
const DA = 'b2-tema-datos'
const LI = 'b2-linkers'

export default {
  slug: 'how-we-move',
  title: 'Как мы передвигаемся',
  subtitle: 'Машина, транспорт, велосипед и риск',
  canDo: [
    'сравнивать способы добраться',
    'обсуждать парковку и её цену',
    'говорить о риске на дороге',
    'спорить о полосах и приоритетах',
    'объяснять свой выбор транспорта',
  ],
  lessons: [
    {
      title: 'The car that is never used',
      summary: 'Машина, которой не пользуются.',
      topics: [CD, RI, LI],
      dialogue: ['Машина', [
        ['Anna', 'It moves twice a week, at most.', 'Она ездит дважды в неделю, максимум.'],
        ['Ben', 'And costs three hundred a month, regardless.', 'И стоит триста в месяц, независимо от этого.'],
        ['Anna', 'Which nobody calculates until they sell it.', 'Что никто не считает, пока не продаст.'],
        ['Ben', 'And almost nobody regrets afterwards.', 'И почти никто потом не жалеет.'],
        ['Anna', 'Which surprises everybody except the sellers.', 'Что удивляет всех, кроме продавших.'],
      ]],
      words: [
        ['moves twice a week', 'ездит дважды в неделю', 'It moves twice a week, at most.'],
        ['regardless', 'независимо от этого', 'And costs three hundred a month, regardless.'],
        ['until they sell it', 'пока не продаст', 'Which nobody calculates until they sell it.'],
        ['almost nobody regrets', 'почти никто не жалеет', 'And almost nobody regrets afterwards.'],
        ['except the sellers', 'кроме продавших', 'Which surprises everybody except the sellers.'],
      ],
      rule: ['Until с настоящим временем', 'Until they sell it. После until будущее выражается настоящим временем.'],
      quiz: [
        ['«Что никто не считает, пока не продаст» —', ['Which nobody calculates until they sell it', 'Which nobody calculates until they will sell it', 'Which nobody calculate until they sell it'], 0],
        ['«И стоит триста в месяц, независимо от этого» —', ['And costs three hundred a month, regardless', 'And cost three hundred a month, regardless', 'And costs three hundreds a month, regardless'], 0],
        ['«Что удивляет всех, кроме продавших» —', ['Which surprises everybody except the sellers', 'Which surprise everybody except the sellers', 'Which surprises everybody except of the sellers'], 0],
      ],
      order: ['Она ездит дважды в неделю, максимум.', 'It moves twice a week, at most.'],
      produce: [
        ['Она ездит дважды в неделю, максимум.', 'It moves twice a week, at most.', []],
        ['И стоит триста в месяц, независимо от этого.', 'And costs three hundred a month, regardless.', []],
        ['Что никто не считает, пока не продаст.', 'Which nobody calculates until they sell it.', []],
      ],
    },
    {
      title: 'Free parking is not free',
      summary: 'Бесплатная парковка не бесплатна.',
      topics: [CI, RI, LI],
      dialogue: ['Парковка', [
        ['Ben', 'Every free space costs somebody rent.', 'Каждое бесплатное место стоит кому-то аренды.'],
        ['Anna', 'Which is spread across the whole street.', 'Что размазано по всей улице.'],
        ['Ben', 'Including everybody without a car.', 'Включая всех, у кого машины нет.'],
        ['Anna', 'Which is about half the city here.', 'А это примерно половина города.'],
        ['Ben', 'And is never mentioned in the debate.', 'И об этом в споре никогда не говорят.'],
      ]],
      words: [
        ['Every free space', 'каждое бесплатное место', 'Every free space costs somebody rent.'],
        ['spread across the whole street', 'размазано по всей улице', 'Which is spread across the whole street.'],
        ['everybody without a car', 'все, у кого нет машины', 'Including everybody without a car.'],
        ['about half the city', 'примерно половина города', 'Which is about half the city here.'],
        ['never mentioned in the debate', 'в споре не упоминают', 'And is never mentioned in the debate.'],
      ],
      rule: ['Spread — неизменяемая форма', 'It is spread across the street. Причастие совпадает с инфинитивом.'],
      quiz: [
        ['«Что размазано по всей улице» —', ['Which is spread across the whole street', 'Which is spreaded across the whole street', 'Which is spread across whole street'], 0],
        ['«Каждое бесплатное место стоит кому-то аренды» —', ['Every free space costs somebody rent', 'Every free space cost somebody rent', 'Every free spaces costs somebody rent'], 0],
        ['«И об этом в споре никогда не говорят» —', ['And is never mentioned in the debate', 'And is never mention in the debate', 'And is never mentioned on the debate'], 0],
      ],
      order: ['Включая всех, у кого машины нет.', 'Including everybody without a car.'],
      produce: [
        ['Каждое бесплатное место стоит кому-то аренды.', 'Every free space costs somebody rent.', []],
        ['Что размазано по всей улице.', 'Which is spread across the whole street.', []],
        ['А это примерно половина города.', 'Which is about half the city here.', []],
      ],
    },
    {
      title: 'Cycling in traffic',
      summary: 'Велосипед в потоке.',
      topics: [RI, CI, LI],
      dialogue: ['Велосипед', [
        ['Anna', 'I would cycle if the lane were separated.', 'Я бы ездила, будь полоса отделена.'],
        ['Ben', 'Which is what every survey finds.', 'Это находит любой опрос.'],
        ['Anna', 'And what paint on the road does not do.', 'И чего краска на асфальте не даёт.'],
        ['Ben', 'Since paint stops nothing, physically.', 'Ведь краска физически ничего не останавливает.'],
        ['Anna', 'Which the numbers show, every year.', 'Что цифры показывают каждый год.'],
      ]],
      words: [
        ['if the lane were separated', 'будь полоса отделена', 'I would cycle if the lane were separated.'],
        ['what every survey finds', 'что находит любой опрос', 'Which is what every survey finds.'],
        ['paint on the road', 'краска на асфальте', 'And what paint on the road does not do.'],
        ['stops nothing, physically', 'физически ничего не останавливает', 'Since paint stops nothing, physically.'],
        ['the numbers show', 'цифры показывают', 'Which the numbers show, every year.'],
      ],
      rule: ['Were в сослагательном', 'If the lane were separated. Форма were используется для всех лиц во втором условии.'],
      quiz: [
        ['«Я бы ездила, будь полоса отделена» —', ['I would cycle if the lane were separated', 'I would cycle if the lane was separate', 'I will cycle if the lane were separated'], 0],
        ['«Ведь краска физически ничего не останавливает» —', ['Since paint stops nothing, physically', 'Since paint stop nothing, physically', 'Since paint stops anything, physically'], 0],
        ['«Что цифры показывают каждый год» —', ['Which the numbers show, every year', 'Which the numbers shows, every year', 'Which the number show, every year'], 0],
      ],
      order: ['Это находит любой опрос.', 'Which is what every survey finds.'],
      produce: [
        ['Я бы ездила, будь полоса отделена.', 'I would cycle if the lane were separated.', []],
        ['И чего краска на асфальте не даёт.', 'And what paint on the road does not do.', []],
        ['Что цифры показывают каждый год.', 'Which the numbers show, every year.', []],
      ],
    },
    {
      title: 'The bus that comes when it likes',
      summary: 'Автобус, который ходит как хочет.',
      topics: [CI, DA, LI],
      dialogue: ['Автобус', [
        ['Ben', 'Every twelve minutes, in theory.', 'Каждые двенадцать минут, теоретически.'],
        ['Anna', 'Which means twenty five, in the rain.', 'Что означает двадцать пять, под дождём.'],
        ['Ben', 'Since the timetable ignores the traffic.', 'Ведь расписание не учитывает пробки.'],
        ['Anna', 'Which the same council also creates.', 'Которые создаёт та же мэрия.'],
        ['Ben', 'By deciding where the cars go.', 'Решая, где ездят машины.'],
      ]],
      words: [
        ['Every twelve minutes', 'каждые двенадцать минут', 'Every twelve minutes, in theory.'],
        ['twenty five, in the rain', 'двадцать пять под дождём', 'Which means twenty five, in the rain.'],
        ['the timetable ignores the traffic', 'расписание не учитывает пробки', 'Since the timetable ignores the traffic.'],
        ['the same council', 'та же мэрия', 'Which the same council also creates.'],
        ['By deciding where the cars go', 'решая, где ездят машины', 'By deciding where the cars go.'],
      ],
      rule: ['By deciding where — способ и косвенный вопрос', 'By deciding where the cars go. Порядок слов после where прямой.'],
      quiz: [
        ['«Решая, где ездят машины» —', ['By deciding where the cars go', 'By deciding where do the cars go', 'By decide where the cars go'], 0],
        ['«Ведь расписание не учитывает пробки» —', ['Since the timetable ignores the traffic', 'Since the timetable ignore the traffic', 'Since the timetable ignores the traffics'], 0],
        ['«Что означает двадцать пять, под дождём» —', ['Which means twenty five, in the rain', 'Which mean twenty five, in the rain', 'Which means twenty five, on the rain'], 0],
      ],
      order: ['Каждые двенадцать минут, теоретически.', 'Every twelve minutes, in theory.'],
      produce: [
        ['Каждые двенадцать минут, теоретически.', 'Every twelve minutes, in theory.', []],
        ['Ведь расписание не учитывает пробки.', 'Since the timetable ignores the traffic.', []],
        ['Решая, где ездят машины.', 'By deciding where the cars go.', []],
      ],
    },
    {
      title: 'Twenty is plenty',
      summary: 'Двадцать — уже достаточно.',
      topics: [DA, CI, LI],
      dialogue: ['Скорость', [
        ['Anna', 'At thirty, a child is likely to die.', 'На тридцати ребёнок скорее всего погибнет.'],
        ['Ben', 'At twenty, likely to walk away.', 'На двадцати — скорее всего уйдёт своими ногами.'],
        ['Anna', 'Which is the entire argument, in two lines.', 'Весь аргумент в двух строках.'],
        ['Ben', 'And costs each driver ninety seconds.', 'И стоит каждому водителю девяноста секунд.'],
        ['Anna', 'Which is why the shouting is so strange.', 'Поэтому крики вокруг так и странны.'],
      ]],
      words: [
        ['likely to die', 'скорее всего погибнет', 'At thirty, a child is likely to die.'],
        ['likely to walk away', 'скорее всего уйдёт своими ногами', 'At twenty, likely to walk away.'],
        ['the entire argument', 'весь аргумент', 'Which is the entire argument, in two lines.'],
        ['costs each driver ninety seconds', 'стоит девяноста секунд', 'And costs each driver ninety seconds.'],
        ['the shouting is so strange', 'крики так странны', 'Which is why the shouting is so strange.'],
      ],
      rule: ['Be likely to do', 'A child is likely to die. Оборот выражает вероятность и требует инфинитива с to.'],
      quiz: [
        ['«На тридцати ребёнок скорее всего погибнет» —', ['At thirty, a child is likely to die', 'At thirty, a child is likely dying', 'At thirty, a child is likely die'], 0],
        ['«И стоит каждому водителю девяноста секунд» —', ['And costs each driver ninety seconds', 'And cost each driver ninety seconds', 'And costs each drivers ninety seconds'], 0],
        ['«Поэтому крики вокруг так и странны» —', ['Which is why the shouting is so strange', 'Which is why the shouting are so strange', 'What is why the shouting is so strange'], 0],
      ],
      order: ['Весь аргумент в двух строках.', 'Which is the entire argument, in two lines.'],
      produce: [
        ['На тридцати ребёнок скорее всего погибнет.', 'At thirty, a child is likely to die.', []],
        ['Весь аргумент в двух строках.', 'Which is the entire argument, in two lines.', []],
        ['И стоит каждому водителю девяноста секунд.', 'And costs each driver ninety seconds.', []],
      ],
    },
    {
      title: 'The near miss',
      summary: 'Чуть не сбил.',
      topics: [RI, CD, LI],
      dialogue: ['Случай', [
        ['Ben', 'I did not see her until the last second.', 'Я не видел её до последней секунды.'],
        ['Anna', 'Which happens to everybody, eventually.', 'Что рано или поздно случается со всеми.'],
        ['Ben', 'And is used as proof by both sides.', 'И обе стороны приводят это как доказательство.'],
        ['Anna', 'Of whichever thing they already believed.', 'Того, во что они и так верили.'],
        ['Ben', 'Which is worth noticing in yourself.', 'Это стоит замечать в себе.'],
      ]],
      words: [
        ['until the last second', 'до последней секунды', 'I did not see her until the last second.'],
        ['happens to everybody', 'случается со всеми', 'Which happens to everybody, eventually.'],
        ['used as proof by both sides', 'обе стороны приводят как доказательство', 'And is used as proof by both sides.'],
        ['whichever thing they believed', 'то, во что они верили', 'Of whichever thing they already believed.'],
        ['noticing in yourself', 'замечать в себе', 'Which is worth noticing in yourself.'],
      ],
      rule: ['Whichever — «какой бы ни»', 'Whichever thing they already believed. Слово выбирает один из вариантов без их перечисления.'],
      quiz: [
        ['«Того, во что они и так верили» —', ['Of whichever thing they already believed', 'Of whichever thing they already believe it', 'Of whatever thing do they already believe'], 0],
        ['«Я не видел её до последней секунды» —', ['I did not see her until the last second', 'I did not saw her until the last second', 'I did not see her till the last second of'], 0],
        ['«И обе стороны приводят это как доказательство» —', ['And is used as proof by both sides', 'And is use as proof by both sides', 'And is used like proof by both sides of'], 0],
      ],
      order: ['Это стоит замечать в себе.', 'Which is worth noticing in yourself.'],
      produce: [
        ['Я не видел её до последней секунды.', 'I did not see her until the last second.', []],
        ['Что рано или поздно случается со всеми.', 'Which happens to everybody, eventually.', []],
        ['Того, во что они и так верили.', 'Of whichever thing they already believed.', []],
      ],
    },
    {
      title: 'Giving up the licence',
      summary: 'Отдать права.',
      topics: [CD, RI, LI],
      dialogue: ['Права', [
        ['Anna', 'She handed the keys in herself, at eighty one.', 'Она сама сдала ключи, в восемьдесят один.'],
        ['Ben', 'Which is rarer than it should be.', 'Что случается реже, чем стоило бы.'],
        ['Anna', 'And needs a bus that actually runs.', 'И требует автобуса, который правда ходит.'],
        ['Ben', 'Which most villages no longer have.', 'Которого в большинстве деревень уже нет.'],
        ['Anna', 'Which is why so many keep driving.', 'Поэтому так многие и продолжают ездить.'],
      ]],
      words: [
        ['handed the keys in herself', 'сама сдала ключи', 'She handed the keys in herself, at eighty one.'],
        ['rarer than it should be', 'реже, чем стоило бы', 'Which is rarer than it should be.'],
        ['a bus that actually runs', 'автобус, который правда ходит', 'And needs a bus that actually runs.'],
        ['most villages no longer have', 'в большинстве деревень уже нет', 'Which most villages no longer have.'],
        ['so many keep driving', 'многие продолжают ездить', 'Which is why so many keep driving.'],
      ],
      rule: ['Keep doing — продолжать', 'So many keep driving. После keep идёт форма на -ing.'],
      quiz: [
        ['«Поэтому так многие и продолжают ездить» —', ['Which is why so many keep driving', 'Which is why so many keep to drive', 'Which is why so many keeps driving'], 0],
        ['«Она сама сдала ключи, в восемьдесят один» —', ['She handed the keys in herself, at eighty one', 'She handed the keys in himself, at eighty one', 'She hand the keys in herself, at eighty one'], 0],
        ['«Что случается реже, чем стоило бы» —', ['Which is rarer than it should be', 'Which is rarer than it should', 'Which is more rare than it should be'], 0],
      ],
      order: ['И требует автобуса, который правда ходит.', 'And needs a bus that actually runs.'],
      produce: [
        ['Она сама сдала ключи, в восемьдесят один.', 'She handed the keys in herself, at eighty one.', []],
        ['И требует автобуса, который правда ходит.', 'And needs a bus that actually runs.', []],
        ['Поэтому так многие и продолжают ездить.', 'Which is why so many keep driving.', []],
      ],
    },
    {
      title: 'What a street is for',
      summary: 'Для чего улица.',
      topics: [CI, DA, LI],
      dialogue: ['Итог', [
        ['Ben', 'A street is storage, or it is a place.', 'Улица — это склад или это место.'],
        ['Anna', 'Which is a choice, made every twenty years.', 'Это выбор, который делают раз в двадцать лет.'],
        ['Ben', 'And is usually made by not choosing.', 'И обычно его делают, не выбирая.'],
        ['Anna', 'Which keeps whatever was there in nineteen seventy.', 'Что сохраняет то, что стояло там в семидесятом.'],
        ['Ben', 'Including the decisions nobody would repeat.', 'Включая решения, которые никто бы не повторил.'],
      ]],
      words: [
        ['A street is storage', 'улица — это склад', 'A street is storage, or it is a place.'],
        ['a choice, made every twenty years', 'выбор раз в двадцать лет', 'Which is a choice, made every twenty years.'],
        ['made by not choosing', 'делают, не выбирая', 'And is usually made by not choosing.'],
        ['whatever was there', 'что бы там ни стояло', 'Which keeps whatever was there in nineteen seventy.'],
        ['nobody would repeat', 'никто бы не повторил', 'Including the decisions nobody would repeat.'],
      ],
      rule: ['Передвижение — это про цену и время', 'Стоимость машины в месяц и девяносто секунд на скорости решают спор быстрее, чем принципы.'],
      quiz: [
        ['«Что сохраняет то, что стояло там в семидесятом» —', ['Which keeps whatever was there in nineteen seventy', 'Which keep whatever was there in nineteen seventy', 'Which keeps whatever were there in nineteen seventy'], 0],
        ['«И обычно его делают, не выбирая» —', ['And is usually made by not choosing', 'And is usually made by not choose', 'And is usually make by not choosing'], 0],
        ['«Включая решения, которые никто бы не повторил» —', ['Including the decisions nobody would repeat', 'Including the decisions nobody would repeated', 'Including the decisions nobody will repeat'], 0],
      ],
      order: ['Улица — это склад или это место.', 'A street is storage, or it is a place.'],
      produce: [
        ['Улица — это склад или это место.', 'A street is storage, or it is a place.', []],
        ['Это выбор, который делают раз в двадцать лет.', 'Which is a choice, made every twenty years.', []],
        ['И обычно его делают, не выбирая.', 'And is usually made by not choosing.', []],
      ],
    },
    {
      checkpoint: true,
      title: 'Проверка: как мы передвигаемся',
      summary: 'Шесть фраз без подсказок.',
      topics: [CD, CI, RI, DA],
      produce: [
        ['Что никто не считает, пока не продаст.', 'Which nobody calculates until they sell it.', []],
        ['Что размазано по всей улице.', 'Which is spread across the whole street.', []],
        ['Я бы ездила, будь полоса отделена.', 'I would cycle if the lane were separated.', []],
        ['Решая, где ездят машины.', 'By deciding where the cars go.', []],
        ['На тридцати ребёнок скорее всего погибнет.', 'At thirty, a child is likely to die.', []],
        ['Того, во что они и так верили.', 'Of whichever thing they already believed.', []],
      ],
    },
  ],
}
