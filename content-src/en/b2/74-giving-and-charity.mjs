// B2, блок 74 — Giving and charity. Помощь и пожертвования.
//
// Тематический блок: кому и как помогать, эффективность, сборы, волонтёрская
// вина и просьба о помощи. Пассив, условия, осторожные оценки.

const SO = 'b2-tema-sociedad'
const ET = 'b2-tema-etica'
const RI = 'b2-tema-riesgo'
const DA = 'b2-tema-datos'
const LI = 'b2-linkers'

export default {
  slug: 'giving-and-charity',
  title: 'Помощь и пожертвования',
  subtitle: 'Кому давать, сколько и зачем',
  canDo: [
    'обсуждать благотворительность по существу',
    'оценивать сбор и его прозрачность',
    'говорить о регулярных пожертвованиях',
    'отказывать на улице вежливо',
    'просить помощь для себя',
  ],
  lessons: [
    {
      title: 'The photograph in the appeal',
      summary: 'Фотография в объявлении сбора.',
      topics: [ET, SO, LI],
      dialogue: ['Сбор', [
        ['Anna', 'The saddest picture raises the most money.', 'Самая грустная фотография собирает больше всего.'],
        ['Ben', 'Which is measured, and deeply uncomfortable.', 'Это измерено и крайне неуютно.'],
        ['Anna', 'Since the person in it did not choose the frame.', 'Ведь человек на ней кадр не выбирал.'],
        ['Ben', 'And is rarely shown the final version.', 'И финальную версию ему редко показывают.'],
        ['Anna', 'Which some organisations have started fixing.', 'Что некоторые организации начали исправлять.'],
      ]],
      words: [
        ['The saddest picture', 'самая грустная фотография', 'The saddest picture raises the most money.'],
        ['measured, and deeply uncomfortable', 'измерено и крайне неуютно', 'Which is measured, and deeply uncomfortable.'],
        ['did not choose the frame', 'кадр не выбирал', 'Since the person in it did not choose the frame.'],
        ['is rarely shown', 'редко показывают', 'And is rarely shown the final version.'],
        ['have started fixing', 'начали исправлять', 'Which some organisations have started fixing.'],
      ],
      rule: ['Be shown something — пассив с двумя дополнениями', 'He is rarely shown the final version. Человек становится подлежащим.'],
      quiz: [
        ['«И финальную версию ему редко показывают» —', ['And is rarely shown the final version', 'And is rarely show the final version', 'And is rarely shown to the final version'], 0],
        ['«Самая грустная фотография собирает больше всего» —', ['The saddest picture raises the most money', 'The saddest picture raise the most money', 'The saddest picture rises the most money'], 0],
        ['«Что некоторые организации начали исправлять» —', ['Which some organisations have started fixing', 'Which some organisations has started fixing', 'Which some organisations have started fix'], 0],
      ],
      order: ['Ведь человек на ней кадр не выбирал.', 'Since the person in it did not choose the frame.'],
      produce: [
        ['Самая грустная фотография собирает больше всего.', 'The saddest picture raises the most money.', []],
        ['И финальную версию ему редко показывают.', 'And is rarely shown the final version.', []],
        ['Что некоторые организации начали исправлять.', 'Which some organisations have started fixing.', []],
      ],
    },
    {
      title: 'Where the money goes',
      summary: 'Куда уходят деньги.',
      topics: [DA, RI, LI],
      dialogue: ['Расходы', [
        ['Ben', 'Nine per cent goes on administration.', 'Девять процентов уходит на администрирование.'],
        ['Anna', 'Which people treat as a scandal.', 'Что люди воспринимают как скандал.'],
        ['Ben', 'And which zero per cent would guarantee.', 'А ноль процентов гарантировал бы.'],
        ['Anna', 'An organisation that cannot pay anybody.', 'Организацию, которая никому не может платить.'],
        ['Ben', 'Which helps nobody, however pure it sounds.', 'И которая никому не помогает, как бы чисто это ни звучало.'],
      ]],
      words: [
        ['goes on administration', 'уходит на администрирование', 'Nine per cent goes on administration.'],
        ['treat as a scandal', 'воспринимают как скандал', 'Which people treat as a scandal.'],
        ['zero per cent would guarantee', 'ноль процентов гарантировал бы', 'And which zero per cent would guarantee.'],
        ['cannot pay anybody', 'никому не может платить', 'An organisation that cannot pay anybody.'],
        ['however pure it sounds', 'как бы чисто ни звучало', 'Which helps nobody, however pure it sounds.'],
      ],
      rule: ['Go on something — тратиться на', 'Nine per cent goes on administration. Предлог on вводит статью расхода.'],
      quiz: [
        ['«Девять процентов уходит на администрирование» —', ['Nine per cent goes on administration', 'Nine per cent go on administration', 'Nine per cent goes in administration'], 0],
        ['«И которая никому не помогает, как бы чисто это ни звучало» —', ['Which helps nobody, however pure it sounds', 'Which helps nobody, however pure does it sound', 'Which help nobody, however pure it sounds'], 0],
        ['«Организацию, которая никому не может платить» —', ['An organisation that cannot pay anybody', 'An organisation that cannot pay nobody', 'An organisation what cannot pay anybody'], 0],
      ],
      order: ['Что люди воспринимают как скандал.', 'Which people treat as a scandal.'],
      produce: [
        ['Девять процентов уходит на администрирование.', 'Nine per cent goes on administration.', []],
        ['Что люди воспринимают как скандал.', 'Which people treat as a scandal.', []],
        ['И которая никому не помогает, как бы чисто это ни звучало.', 'Which helps nobody, however pure it sounds.', []],
      ],
    },
    {
      title: 'A standing order',
      summary: 'Регулярный платёж.',
      topics: [RI, SO, LI],
      dialogue: ['Регулярно', [
        ['Anna', 'Four pounds a month, for eleven years.', 'Четыре фунта в месяц, одиннадцать лет.'],
        ['Ben', 'Which is worth more to them than forty once.', 'Что для них дороже сорока однажды.'],
        ['Anna', 'Since a budget can be built on it.', 'Ведь на этом можно строить бюджет.'],
        ['Ben', 'And cannot be built on a good week.', 'И нельзя строить на удачной неделе.'],
        ['Anna', 'Which every fundraiser will tell you.', 'Что вам скажет любой сборщик средств.'],
      ]],
      words: [
        ['Four pounds a month', 'четыре фунта в месяц', 'Four pounds a month, for eleven years.'],
        ['worth more to them', 'для них дороже', 'Which is worth more to them than forty once.'],
        ['a budget can be built on it', 'на этом можно строить бюджет', 'Since a budget can be built on it.'],
        ['on a good week', 'на удачной неделе', 'And cannot be built on a good week.'],
        ['every fundraiser will tell you', 'скажет любой сборщик средств', 'Which every fundraiser will tell you.'],
      ],
      rule: ['Be built on — пассив с предлогом', 'A budget can be built on it. Предлог on остаётся после причастия.'],
      quiz: [
        ['«Ведь на этом можно строить бюджет» —', ['Since a budget can be built on it', 'Since a budget can be built it', 'Since a budget can be build on it'], 0],
        ['«Что для них дороже сорока однажды» —', ['Which is worth more to them than forty once', 'Which is worth more for them than forty once', 'Which is worth more to them that forty once'], 0],
        ['«Что вам скажет любой сборщик средств» —', ['Which every fundraiser will tell you', 'Which every fundraiser will tells you', 'Which every fundraisers will tell you'], 0],
      ],
      order: ['Четыре фунта в месяц, одиннадцать лет.', 'Four pounds a month, for eleven years.'],
      produce: [
        ['Четыре фунта в месяц, одиннадцать лет.', 'Four pounds a month, for eleven years.', []],
        ['Ведь на этом можно строить бюджет.', 'Since a budget can be built on it.', []],
        ['И нельзя строить на удачной неделе.', 'And cannot be built on a good week.', []],
      ],
    },
    {
      title: 'Saying no on the street',
      summary: 'Отказать на улице.',
      topics: [SO, ET, LI],
      dialogue: ['Отказ', [
        ['Ben', 'No thank you, without slowing down.', 'Спасибо, нет, не сбавляя шага.'],
        ['Anna', 'Which is kinder than a long explanation.', 'Что добрее длинного объяснения.'],
        ['Ben', 'Since their time is paid by the minute.', 'Ведь их время оплачивается поминутно.'],
        ['Anna', 'And a polite conversation costs them money.', 'И вежливый разговор стоит им денег.'],
        ['Ben', 'Which almost nobody realises.', 'Чего почти никто не осознаёт.'],
      ]],
      words: [
        ['without slowing down', 'не сбавляя шага', 'No thank you, without slowing down.'],
        ['kinder than a long explanation', 'добрее длинного объяснения', 'Which is kinder than a long explanation.'],
        ['paid by the minute', 'оплачивается поминутно', 'Since their time is paid by the minute.'],
        ['costs them money', 'стоит им денег', 'And a polite conversation costs them money.'],
        ['almost nobody realises', 'почти никто не осознаёт', 'Which almost nobody realises.'],
      ],
      rule: ['By the minute — единица оплаты', 'Paid by the minute. Артикль the обязателен в этой конструкции.'],
      quiz: [
        ['«Ведь их время оплачивается поминутно» —', ['Since their time is paid by the minute', 'Since their time is paid by minute', 'Since their time is pay by the minute'], 0],
        ['«Спасибо, нет, не сбавляя шага» —', ['No thank you, without slowing down', 'No thank you, without slow down', 'No thank you, without to slow down'], 0],
        ['«И вежливый разговор стоит им денег» —', ['And a polite conversation costs them money', 'And a polite conversation cost them money', 'And a polite conversation costs to them money'], 0],
      ],
      order: ['Чего почти никто не осознаёт.', 'Which almost nobody realises.'],
      produce: [
        ['Спасибо, нет, не сбавляя шага.', 'No thank you, without slowing down.', []],
        ['Ведь их время оплачивается поминутно.', 'Since their time is paid by the minute.', []],
        ['И вежливый разговор стоит им денег.', 'And a polite conversation costs them money.', []],
      ],
    },
    {
      title: 'Close to home or far away',
      summary: 'Рядом или далеко.',
      topics: [ET, DA, LI],
      dialogue: ['Куда', [
        ['Anna', 'The same money does more, four countries away.', 'Те же деньги делают больше за четыре страны отсюда.'],
        ['Ben', 'Which is arithmetically true and emotionally impossible.', 'Что арифметически верно и эмоционально невозможно.'],
        ['Anna', 'Since people give where they can see.', 'Ведь люди дают там, где видят.'],
        ['Ben', 'And which no argument has ever changed.', 'И чего не изменил ни один довод.'],
        ['Anna', 'So the sensible answer is both.', 'Поэтому разумный ответ — и то и другое.'],
      ]],
      words: [
        ['four countries away', 'за четыре страны отсюда', 'The same money does more, four countries away.'],
        ['arithmetically true', 'арифметически верно', 'Which is arithmetically true and emotionally impossible.'],
        ['give where they can see', 'дают там, где видят', 'Since people give where they can see.'],
        ['no argument has changed', 'ни один довод не изменил', 'And which no argument has ever changed.'],
        ['the sensible answer is both', 'разумный ответ — и то и другое', 'So the sensible answer is both.'],
      ],
      rule: ['Four countries away — мера расстояния', 'Four countries away. Существительное меры стоит перед away.'],
      quiz: [
        ['«Те же деньги делают больше за четыре страны отсюда» —', ['The same money does more, four countries away', 'The same money do more, four countries away', 'The same money does more, four country away'], 0],
        ['«Ведь люди дают там, где видят» —', ['Since people give where they can see', 'Since people gives where they can see', 'Since people give where they can sees'], 0],
        ['«И чего не изменил ни один довод» —', ['And which no argument has ever changed', 'And which no argument has ever change', 'And which no argument have ever changed'], 0],
      ],
      order: ['Поэтому разумный ответ — и то и другое.', 'So the sensible answer is both.'],
      produce: [
        ['Те же деньги делают больше за четыре страны отсюда.', 'The same money does more, four countries away.', []],
        ['Ведь люди дают там, где видят.', 'Since people give where they can see.', []],
        ['Поэтому разумный ответ — и то и другое.', 'So the sensible answer is both.', []],
      ],
    },
    {
      title: 'Time instead of money',
      summary: 'Время вместо денег.',
      topics: [SO, RI, LI],
      dialogue: ['Волонтёрство', [
        ['Ben', 'Four hours of my work pays for eleven of theirs.', 'Четыре часа моей работы оплачивают одиннадцать их.'],
        ['Anna', 'Which is the calculation nobody likes making.', 'Расчёт, который никому не нравится делать.'],
        ['Ben', 'And which charities cannot say aloud.', 'И который благотворительные организации не могут произнести вслух.'],
        ['Anna', 'Since volunteers are also donors, eventually.', 'Ведь волонтёры со временем становятся и жертвователями.'],
        ['Ben', 'Which is the honest reason they are welcomed.', 'Вот честная причина, почему им рады.'],
      ]],
      words: [
        ['pays for eleven of theirs', 'оплачивают одиннадцать их', 'Four hours of my work pays for eleven of theirs.'],
        ['nobody likes making', 'никому не нравится делать', 'Which is the calculation nobody likes making.'],
        ['cannot say aloud', 'не могут произнести вслух', 'And which charities cannot say aloud.'],
        ['are also donors', 'становятся и жертвователями', 'Since volunteers are also donors, eventually.'],
        ['the honest reason', 'честная причина', 'Which is the honest reason they are welcomed.'],
      ],
      rule: ['Like + герундий', 'Nobody likes making it. После like форма на -ing описывает процесс.'],
      quiz: [
        ['«Расчёт, который никому не нравится делать» —', ['The calculation nobody likes making', 'The calculation nobody like making', 'The calculation what nobody likes making'], 0],
        ['«Четыре часа моей работы оплачивают одиннадцать их» —', ['Four hours of my work pays for eleven of theirs', 'Four hours of my work pays for eleven of their', 'Four hours of my work pay for eleven of theirs'], 0],
        ['«Вот честная причина, почему им рады» —', ['The honest reason they are welcomed', 'The honest reason they are welcome', 'The honest reason they are welcomed it'], 0],
      ],
      order: ['И который благотворительные организации не могут произнести вслух.', 'And which charities cannot say aloud.'],
      produce: [
        ['Четыре часа моей работы оплачивают одиннадцать их.', 'Four hours of my work pays for eleven of theirs.', []],
        ['Расчёт, который никому не нравится делать.', 'Which is the calculation nobody likes making.', []],
        ['Ведь волонтёры со временем становятся и жертвователями.', 'Since volunteers are also donors, eventually.', []],
      ],
    },
    {
      title: 'Asking for help yourself',
      summary: 'Просить помощи самому.',
      topics: [SO, ET, LI],
      dialogue: ['Просьба', [
        ['Anna', 'She could not bring herself to apply.', 'Она не могла заставить себя подать заявление.'],
        ['Ben', 'Which the system counts as not needing it.', 'Что система считает отсутствием нужды.'],
        ['Anna', 'And which the forms are designed to produce.', 'И на что формы, собственно, и рассчитаны.'],
        ['Ben', 'By everybody who has read the questions.', 'По мнению всех, кто читал вопросы.'],
        ['Anna', 'Which is a design choice, not an accident.', 'Это решение дизайна, а не случайность.'],
      ]],
      words: [
        ['could not bring herself to apply', 'не могла заставить себя подать', 'She could not bring herself to apply.'],
        ['counts as not needing it', 'считает отсутствием нужды', 'Which the system counts as not needing it.'],
        ['the forms are designed to produce', 'на что рассчитаны формы', 'And which the forms are designed to produce.'],
        ['who has read the questions', 'кто читал вопросы', 'By everybody who has read the questions.'],
        ['a design choice', 'решение дизайна', 'Which is a design choice, not an accident.'],
      ],
      rule: ['Bring oneself to do', 'She could not bring herself to apply. Оборот значит «заставить себя» и требует инфинитива.'],
      quiz: [
        ['«Она не могла заставить себя подать заявление» —', ['She could not bring herself to apply', 'She could not bring her to apply', 'She could not bring herself applying'], 0],
        ['«Что система считает отсутствием нужды» —', ['Which the system counts as not needing it', 'Which the system counts as not need it', 'Which the system count as not needing it'], 0],
        ['«По мнению всех, кто читал вопросы» —', ['By everybody who has read the questions', 'By everybody who have read the questions', 'By everybody what has read the questions'], 0],
      ],
      order: ['Это решение дизайна, а не случайность.', 'Which is a design choice, not an accident.'],
      produce: [
        ['Она не могла заставить себя подать заявление.', 'She could not bring herself to apply.', []],
        ['Что система считает отсутствием нужды.', 'Which the system counts as not needing it.', []],
        ['И на что формы, собственно, и рассчитаны.', 'And which the forms are designed to produce.', []],
      ],
    },
    {
      title: 'A rule that survives',
      summary: 'Правило, которое держится.',
      topics: [RI, SO, LI],
      dialogue: ['Итог', [
        ['Ben', 'One per cent, decided once a year.', 'Один процент, решённый раз в год.'],
        ['Anna', 'Which removes the decision from every appeal.', 'Что убирает решение из каждого сбора.'],
        ['Ben', 'And therefore removes the guilt as well.', 'И заодно убирает вину.'],
        ['Anna', 'Which is what stops most people giving.', 'А именно она чаще всего и мешает давать.'],
        ['Ben', 'Rather than the money, which is small.', 'А не деньги, которых немного.'],
      ]],
      words: [
        ['decided once a year', 'решённый раз в год', 'One per cent, decided once a year.'],
        ['removes the decision', 'убирает решение', 'Which removes the decision from every appeal.'],
        ['removes the guilt', 'убирает вину', 'And therefore removes the guilt as well.'],
        ['stops most people giving', 'мешает людям давать', 'Which is what stops most people giving.'],
        ['which is small', 'которых немного', 'Rather than the money, which is small.'],
      ],
      rule: ['Помощь держится на правиле, а не на порыве', 'Один процент раз в год и регулярный платёж работают лучше, чем реакция на каждую фотографию.'],
      quiz: [
        ['«А именно она чаще всего и мешает давать» —', ['Which is what stops most people giving', 'Which is what stops most people to give', 'Which is what stop most people giving'], 0],
        ['«Что убирает решение из каждого сбора» —', ['Which removes the decision from every appeal', 'Which remove the decision from every appeal', 'Which removes the decision of every appeal'], 0],
        ['«Один процент, решённый раз в год» —', ['One per cent, decided once a year', 'One per cent, deciding once a year', 'One per cent, decided once in year'], 0],
      ],
      order: ['И заодно убирает вину.', 'And therefore removes the guilt as well.'],
      produce: [
        ['Один процент, решённый раз в год.', 'One per cent, decided once a year.', []],
        ['Что убирает решение из каждого сбора.', 'Which removes the decision from every appeal.', []],
        ['А именно она чаще всего и мешает давать.', 'Which is what stops most people giving.', []],
      ],
    },
    {
      checkpoint: true,
      title: 'Проверка: помощь и пожертвования',
      summary: 'Шесть фраз без подсказок.',
      topics: [SO, ET, RI, DA],
      produce: [
        ['И финальную версию ему редко показывают.', 'And is rarely shown the final version.', []],
        ['Девять процентов уходит на администрирование.', 'Nine per cent goes on administration.', []],
        ['Ведь на этом можно строить бюджет.', 'Since a budget can be built on it.', []],
        ['Ведь их время оплачивается поминутно.', 'Since their time is paid by the minute.', []],
        ['Ведь люди дают там, где видят.', 'Since people give where they can see.', []],
        ['Она не могла заставить себя подать заявление.', 'She could not bring herself to apply.', []],
      ],
    },
  ],
}
