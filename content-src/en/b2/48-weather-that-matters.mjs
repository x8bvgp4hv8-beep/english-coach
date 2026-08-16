// B2, блок 48 — Weather that matters. Погода, которая не мелочь.
//
// Тематический блок: наводнение, жара, страховка, адаптация города и спор
// о том, кто платит. Условия, прогнозы, вероятность.

const CL = 'b2-tema-clima'
const CI = 'b2-tema-ciudad'
const RI = 'b2-tema-riesgo'
const DA = 'b2-tema-datos'
const LI = 'b2-linkers'

export default {
  slug: 'weather-that-matters',
  title: 'Погода, которая не мелочь',
  subtitle: 'Наводнение, жара, страховка и кто платит',
  canDo: [
    'говорить о прогнозе и вероятности',
    'обсуждать наводнение и последствия',
    'спорить о страховке и рисках',
    'обсуждать жару в городе',
    'говорить о том, кто платит за адаптацию',
  ],
  lessons: [
    {
      title: 'The forecast',
      summary: 'Прогноз.',
      topics: [DA, CL, LI],
      dialogue: ['Прогноз', [
        ['Anna', 'A seventy per cent chance of flooding.', 'Семьдесят процентов вероятности подтопления.'],
        ['Ben', 'Which most people read as probably not.', 'Что большинство читает как «скорее всего нет».'],
        ['Anna', 'Since seventy sounds like a school mark.', 'Ведь семьдесят звучит как школьная оценка.'],
        ['Ben', 'Rather than seven times out of ten.', 'А не как семь раз из десяти.'],
        ['Anna', 'Which is the phrasing that moves people.', 'Именно эта формулировка людей и двигает.'],
      ]],
      words: [
        ['A seventy per cent chance', 'семьдесят процентов вероятности', 'A seventy per cent chance of flooding.'],
        ['read as probably not', 'читают как «скорее всего нет»', 'Which most people read as probably not.'],
        ['sounds like a school mark', 'звучит как школьная оценка', 'Since seventy sounds like a school mark.'],
        ['seven times out of ten', 'семь раз из десяти', 'Rather than seven times out of ten.'],
        ['the phrasing that moves people', 'формулировка, которая двигает людей', 'Which is the phrasing that moves people.'],
      ],
      rule: ['Chance of + существительное', 'A chance of flooding. После chance идёт of и существительное или герундий.'],
      quiz: [
        ['«Семьдесят процентов вероятности подтопления» —', ['A seventy per cent chance of flooding', 'A seventy per cent chance for flooding', 'A seventy per cent chance of flood to'], 0],
        ['«А не как семь раз из десяти» —', ['Rather than seven times out of ten', 'Rather than seven times from ten', 'Rather than seven time out of ten'], 0],
        ['«Именно эта формулировка людей и двигает» —', ['Which is the phrasing that moves people', 'Which is the phrasing that move people', 'Which is the phrasing what moves people'], 0],
      ],
      order: ['Ведь семьдесят звучит как школьная оценка.', 'Since seventy sounds like a school mark.'],
      produce: [
        ['Семьдесят процентов вероятности подтопления.', 'A seventy per cent chance of flooding.', []],
        ['Что большинство читает как «скорее всего нет».', 'Which most people read as probably not.', []],
        ['А не как семь раз из десяти.', 'Rather than seven times out of ten.', []],
      ],
    },
    {
      title: 'The water came in',
      summary: 'Вода зашла.',
      topics: [CL, CI, LI],
      dialogue: ['Наводнение', [
        ['Ben', 'It rose to the second step by midnight.', 'К полуночи вода дошла до второй ступени.'],
        ['Anna', 'Which nobody had seen since eighty three.', 'Чего не видели с восемьдесят третьего.'],
        ['Ben', 'And which is now expected twice a decade.', 'И чего теперь ждут дважды за десять лет.'],
        ['Anna', 'Had the drains been cleared, it would have helped.', 'Прочисти они стоки, это бы помогло.'],
        ['Ben', 'Though not enough, on that night.', 'Хотя в ту ночь и этого было бы мало.'],
      ]],
      words: [
        ['rose to the second step', 'дошла до второй ступени', 'It rose to the second step by midnight.'],
        ['since eighty three', 'с восемьдесят третьего', 'Which nobody had seen since eighty three.'],
        ['expected twice a decade', 'ждут дважды за десять лет', 'And which is now expected twice a decade.'],
        ['Had the drains been cleared', 'прочисти они стоки', 'Had the drains been cleared, it would have helped.'],
        ['not enough, on that night', 'в ту ночь мало', 'Though not enough, on that night.'],
      ],
      rule: ['Инверсия в третьем условии с пассивом', 'Had the drains been cleared. Форма заменяет if they had been cleared и звучит формально.'],
      quiz: [
        ['«Прочисти они стоки, это бы помогло» —', ['Had the drains been cleared, it would have helped', 'Had the drains be cleared, it would have helped', 'Have the drains been cleared, it would have helped'], 0],
        ['«И чего теперь ждут дважды за десять лет» —', ['And which is now expected twice a decade', 'And which is now expect twice a decade', 'And which is now expected two times a decade of'], 0],
        ['«К полуночи вода дошла до второй ступени» —', ['It rose to the second step by midnight', 'It rised to the second step by midnight', 'It rose to the second step until midnight'], 0],
      ],
      order: ['Чего не видели с восемьдесят третьего.', 'Which nobody had seen since eighty three.'],
      produce: [
        ['К полуночи вода дошла до второй ступени.', 'It rose to the second step by midnight.', []],
        ['И чего теперь ждут дважды за десять лет.', 'And which is now expected twice a decade.', []],
        ['Прочисти они стоки, это бы помогло.', 'Had the drains been cleared, it would have helped.', []],
      ],
    },
    {
      title: 'Uninsurable',
      summary: 'Не подлежит страхованию.',
      topics: [RI, CL, LI],
      dialogue: ['Страховка', [
        ['Anna', 'The street can no longer be insured.', 'Улицу больше нельзя застраховать.'],
        ['Ben', 'Which is a market saying what politics will not.', 'Рынок говорит то, чего не скажет политика.'],
        ['Anna', 'And which halves the value of every house.', 'И это вдвое снижает цену каждого дома.'],
        ['Ben', 'Whose owners were told it was safe.', 'Чьим владельцам говорили, что тут безопасно.'],
        ['Anna', 'In writing, by the people selling them.', 'Письменно, теми, кто им и продавал.'],
      ]],
      words: [
        ['can no longer be insured', 'больше нельзя застраховать', 'The street can no longer be insured.'],
        ['a market saying', 'рынок говорит', 'Which is a market saying what politics will not.'],
        ['halves the value', 'вдвое снижает цену', 'And which halves the value of every house.'],
        ['Whose owners were told', 'чьим владельцам говорили', 'Whose owners were told it was safe.'],
        ['the people selling them', 'те, кто продавал', 'By the people selling them.'],
      ],
      rule: ['Whose в придаточном', 'Whose owners were told it was safe. Местоимение указывает на принадлежность и не требует предлога.'],
      quiz: [
        ['«Чьим владельцам говорили, что тут безопасно» —', ['Whose owners were told it was safe', 'Which owners were told it was safe', 'Whose owners were tell it was safe'], 0],
        ['«Улицу больше нельзя застраховать» —', ['The street can no longer be insured', 'The street can no longer be insure', 'The street can not longer be insured'], 0],
        ['«И это вдвое снижает цену каждого дома» —', ['And which halves the value of every house', 'And which halve the value of every house', 'And which halves the value of every houses'], 0],
      ],
      order: ['Письменно, теми, кто им и продавал.', 'In writing, by the people selling them.'],
      produce: [
        ['Улицу больше нельзя застраховать.', 'The street can no longer be insured.', []],
        ['И это вдвое снижает цену каждого дома.', 'And which halves the value of every house.', []],
        ['Чьим владельцам говорили, что тут безопасно.', 'Whose owners were told it was safe.', []],
      ],
    },
    {
      title: 'Forty degrees in the city',
      summary: 'Сорок градусов в городе.',
      topics: [CI, CL, LI],
      dialogue: ['Жара', [
        ['Ben', 'The centre runs eight degrees hotter.', 'В центре на восемь градусов жарче.'],
        ['Anna', 'Which is asphalt, not weather.', 'Это асфальт, а не погода.'],
        ['Ben', 'And is fixable, with trees and paint.', 'И это лечится деревьями и краской.'],
        ['Anna', 'Neither of which needs a summit.', 'Ни то, ни другое не требует саммита.'],
        ['Ben', 'Only a budget line and four years.', 'Только строки в бюджете и четырёх лет.'],
      ]],
      words: [
        ['runs eight degrees hotter', 'на восемь градусов жарче', 'The centre runs eight degrees hotter.'],
        ['asphalt, not weather', 'асфальт, а не погода', 'Which is asphalt, not weather.'],
        ['fixable, with trees and paint', 'лечится деревьями и краской', 'And is fixable, with trees and paint.'],
        ['Neither of which', 'ни то, ни другое', 'Neither of which needs a summit.'],
        ['a budget line', 'строка в бюджете', 'Only a budget line and four years.'],
      ],
      rule: ['Neither of which — согласование', 'Neither of which needs a summit. Глагол стоит в единственном числе.'],
      quiz: [
        ['«Ни то, ни другое не требует саммита» —', ['Neither of which needs a summit', 'Neither of which need a summit', 'Neither of which does not need a summit'], 0],
        ['«В центре на восемь градусов жарче» —', ['The centre runs eight degrees hotter', 'The centre run eight degrees hotter', 'The centre runs eight degrees more hot'], 0],
        ['«И это лечится деревьями и краской» —', ['And is fixable, with trees and paint', 'And is fixable, with trees and paints', 'And is fixible, with trees and paint'], 0],
      ],
      order: ['Только строки в бюджете и четырёх лет.', 'Only a budget line and four years.'],
      produce: [
        ['В центре на восемь градусов жарче.', 'The centre runs eight degrees hotter.', []],
        ['Это асфальт, а не погода.', 'Which is asphalt, not weather.', []],
        ['Ни то, ни другое не требует саммита.', 'Neither of which needs a summit.', []],
      ],
    },
    {
      title: 'Who pays for the wall',
      summary: 'Кто платит за дамбу.',
      topics: [RI, CI, LI],
      dialogue: ['Дамба', [
        ['Anna', 'The wall protects two hundred houses.', 'Дамба защищает двести домов.'],
        ['Ben', 'And is paid for by four thousand.', 'А платят за неё четыре тысячи.'],
        ['Anna', 'Which is either solidarity or a subsidy.', 'Это либо солидарность, либо субсидия.'],
        ['Ben', 'Depending on whether you live behind it.', 'В зависимости от того, живёте ли вы за ней.'],
        ['Anna', 'Which is the honest version of the debate.', 'Вот честная версия этого спора.'],
      ]],
      words: [
        ['protects two hundred houses', 'защищает двести домов', 'The wall protects two hundred houses.'],
        ['is paid for by four thousand', 'платят четыре тысячи', 'And is paid for by four thousand.'],
        ['solidarity or a subsidy', 'солидарность или субсидия', 'Which is either solidarity or a subsidy.'],
        ['whether you live behind it', 'живёте ли вы за ней', 'Depending on whether you live behind it.'],
        ['the honest version', 'честная версия', 'Which is the honest version of the debate.'],
      ],
      rule: ['Pay for в пассиве', 'It is paid for by four thousand. Предлог for остаётся при глаголе, by вводит плательщика.'],
      quiz: [
        ['«А платят за неё четыре тысячи» —', ['And is paid for by four thousand', 'And is paid by four thousand for', 'And is pay for by four thousand'], 0],
        ['«В зависимости от того, живёте ли вы за ней» —', ['Depending on whether you live behind it', 'Depending on whether do you live behind it', 'Depending of whether you live behind it'], 0],
        ['«Это либо солидарность, либо субсидия» —', ['Which is either solidarity or a subsidy', 'Which is either solidarity nor a subsidy', 'Which is either solidarity or subsidy a'], 0],
      ],
      order: ['Дамба защищает двести домов.', 'The wall protects two hundred houses.'],
      produce: [
        ['Дамба защищает двести домов.', 'The wall protects two hundred houses.', []],
        ['А платят за неё четыре тысячи.', 'And is paid for by four thousand.', []],
        ['В зависимости от того, живёте ли вы за ней.', 'Depending on whether you live behind it.', []],
      ],
    },
    {
      title: 'Moving away from water',
      summary: 'Уехать от воды.',
      topics: [CL, RI, LI],
      dialogue: ['Переезд', [
        ['Ben', 'Some villages are being bought out.', 'Некоторые деревни выкупают.'],
        ['Anna', 'Which sounds brutal and is often kinder.', 'Звучит жестоко и часто добрее.'],
        ['Ben', 'Than a third flood in six years.', 'Чем третье наводнение за шесть лет.'],
        ['Anna', 'Provided the price reflects the old value.', 'При условии, что цена отражает прежнюю стоимость.'],
        ['Ben', 'Which is where every such scheme fails.', 'Именно на этом такие схемы и рушатся.'],
      ]],
      words: [
        ['are being bought out', 'выкупают', 'Some villages are being bought out.'],
        ['sounds brutal', 'звучит жестоко', 'Which sounds brutal and is often kinder.'],
        ['a third flood in six years', 'третье наводнение за шесть лет', 'Than a third flood in six years.'],
        ['reflects the old value', 'отражает прежнюю стоимость', 'Provided the price reflects the old value.'],
        ['every such scheme fails', 'такие схемы рушатся', 'Which is where every such scheme fails.'],
      ],
      rule: ['Buy out в длящемся пассиве', 'Villages are being bought out. Форма описывает процесс, идущий сейчас.'],
      quiz: [
        ['«Некоторые деревни выкупают» —', ['Some villages are being bought out', 'Some villages are been bought out', 'Some villages are being buy out'], 0],
        ['«При условии, что цена отражает прежнюю стоимость» —', ['Provided the price reflects the old value', 'Provided the price reflect the old value', 'Provided the price will reflect the old value'], 0],
        ['«Именно на этом такие схемы и рушатся» —', ['Which is where every such scheme fails', 'Which is where every such scheme fail', 'Which is where every such schemes fails'], 0],
      ],
      order: ['Чем третье наводнение за шесть лет.', 'Than a third flood in six years.'],
      produce: [
        ['Некоторые деревни выкупают.', 'Some villages are being bought out.', []],
        ['Звучит жестоко и часто добрее.', 'Which sounds brutal and is often kinder.', []],
        ['При условии, что цена отражает прежнюю стоимость.', 'Provided the price reflects the old value.', []],
      ],
    },
    {
      title: 'What one household can do',
      summary: 'Что может одна семья.',
      topics: [CL, RI, LI],
      dialogue: ['Дома', [
        ['Anna', 'Our meter and our flights are the whole story.', 'Счётчик и перелёты — вот и вся история.'],
        ['Ben', 'Which is a small story, honestly.', 'Честно говоря, история небольшая.'],
        ['Anna', 'And is the only one we control.', 'И единственная, которой мы управляем.'],
        ['Ben', 'While voting controls the large one.', 'Тогда как большой управляет голосование.'],
        ['Anna', 'Which people forget when arguing about straws.', 'О чём забывают, споря о трубочках.'],
      ]],
      words: [
        ['Our meter and our flights', 'счётчик и перелёты', 'Our meter and our flights are the whole story.'],
        ['a small story, honestly', 'честно говоря, небольшая история', 'Which is a small story, honestly.'],
        ['the only one we control', 'единственная, которой мы управляем', 'And is the only one we control.'],
        ['voting controls the large one', 'большой управляет голосование', 'While voting controls the large one.'],
        ['arguing about straws', 'споря о трубочках', 'Which people forget when arguing about straws.'],
      ],
      rule: ['When + герундий', 'When arguing about straws. Оборот сокращает придаточное с тем же подлежащим.'],
      quiz: [
        ['«О чём забывают, споря о трубочках» —', ['Which people forget when arguing about straws', 'Which people forget when argue about straws', 'Which people forgets when arguing about straws'], 0],
        ['«И единственная, которой мы управляем» —', ['And is the only one we control', 'And is the only one we controls', 'And is only one we control'], 0],
        ['«Тогда как большой управляет голосование» —', ['While voting controls the large one', 'While voting control the large one', 'While vote controls the large one'], 0],
      ],
      order: ['Честно говоря, история небольшая.', 'Which is a small story, honestly.'],
      produce: [
        ['Счётчик и перелёты — вот и вся история.', 'Our meter and our flights are the whole story.', []],
        ['И единственная, которой мы управляем.', 'And is the only one we control.', []],
        ['О чём забывают, споря о трубочках.', 'Which people forget when arguing about straws.', []],
      ],
    },
    {
      title: 'Talking about it without despair',
      summary: 'Говорить об этом без отчаяния.',
      topics: [CL, LI, DA],
      dialogue: ['Тон', [
        ['Ben', 'Despair and denial do the same work.', 'Отчаяние и отрицание делают одну работу.'],
        ['Anna', 'Which is to excuse doing nothing.', 'А именно оправдывают бездействие.'],
        ['Ben', 'Whereas a number and a date do not.', 'Тогда как цифра и срок — нет.'],
        ['Anna', 'Which is why I always ask for both.', 'Поэтому я всегда прошу и то и другое.'],
        ['Ben', 'In any conversation about the weather.', 'В любом разговоре о погоде.'],
      ]],
      words: [
        ['Despair and denial', 'отчаяние и отрицание', 'Despair and denial do the same work.'],
        ['excuse doing nothing', 'оправдывать бездействие', 'Which is to excuse doing nothing.'],
        ['a number and a date', 'цифра и срок', 'Whereas a number and a date do not.'],
        ['I always ask for both', 'всегда прошу и то и другое', 'Which is why I always ask for both.'],
        ['about the weather', 'о погоде', 'In any conversation about the weather.'],
      ],
      rule: ['Погода на B2 — это цифры и сроки', 'Вероятность, дата и стоимость превращают разговор о климате из спора о вере в спор о плане.'],
      quiz: [
        ['«А именно оправдывают бездействие» —', ['Which is to excuse doing nothing', 'Which is to excuse do nothing', 'Which is to excuse doing anything'], 0],
        ['«Тогда как цифра и срок — нет» —', ['Whereas a number and a date do not', 'Whereas a number and a date does not', 'Whereas a number and a date not'], 0],
        ['«Поэтому я всегда прошу и то и другое» —', ['Which is why I always ask for both', 'Which is why I always ask both', 'What is why I always ask for both'], 0],
      ],
      order: ['В любом разговоре о погоде.', 'In any conversation about the weather.'],
      produce: [
        ['Отчаяние и отрицание делают одну работу.', 'Despair and denial do the same work.', []],
        ['А именно оправдывают бездействие.', 'Which is to excuse doing nothing.', []],
        ['Тогда как цифра и срок — нет.', 'Whereas a number and a date do not.', []],
      ],
    },
    {
      checkpoint: true,
      title: 'Проверка: погода, которая не мелочь',
      summary: 'Шесть фраз без подсказок.',
      topics: [CL, CI, RI, DA],
      produce: [
        ['Семьдесят процентов вероятности подтопления.', 'A seventy per cent chance of flooding.', []],
        ['Прочисти они стоки, это бы помогло.', 'Had the drains been cleared, it would have helped.', []],
        ['Чьим владельцам говорили, что тут безопасно.', 'Whose owners were told it was safe.', []],
        ['Ни то, ни другое не требует саммита.', 'Neither of which needs a summit.', []],
        ['А платят за неё четыре тысячи.', 'And is paid for by four thousand.', []],
        ['Некоторые деревни выкупают.', 'Some villages are being bought out.', []],
      ],
    },
  ],
}
