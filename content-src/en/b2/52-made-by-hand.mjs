// B2, блок 52 — Made by hand. Сделано руками.
//
// Тематический блок: ремёсла, ремонт вещей, обучение мастерству и спор о
// том, почему чинить дороже, чем купить. Пассив, сравнения, оценки.

const CU = 'b2-tema-cultura'
const CA = 'b1-tema-carrera'
const ED = 'b2-tema-educacion'
const RI = 'b2-tema-riesgo'
const LI = 'b2-linkers'

export default {
  slug: 'made-by-hand',
  title: 'Сделано руками',
  subtitle: 'Ремёсла, ремонт и мастерство',
  canDo: [
    'обсуждать ремонт вместо покупки',
    'говорить о ремесле и обучении ему',
    'объяснять, почему ручная работа дорога',
    'спорить о ценности вещей',
    'описывать процесс работы',
  ],
  lessons: [
    {
      title: 'Repair or replace',
      summary: 'Починить или заменить.',
      topics: [RI, CU, LI],
      dialogue: ['Выбор', [
        ['Anna', 'The repair costs more than the machine.', 'Ремонт дороже самой машины.'],
        ['Ben', 'Which is arranged, not natural.', 'Это устроено, а не естественно.'],
        ['Anna', 'Since the labour is here and the parts are not.', 'Ведь труд здесь, а детали нет.'],
        ['Ben', 'And the design assumes one owner.', 'И конструкция рассчитана на одного владельца.'],
        ['Anna', 'Which shows in every glued seam.', 'Что видно в каждом проклеенном шве.'],
      ]],
      words: [
        ['The repair costs more', 'ремонт дороже', 'The repair costs more than the machine.'],
        ['arranged, not natural', 'устроено, а не естественно', 'Which is arranged, not natural.'],
        ['the labour is here', 'труд здесь', 'Since the labour is here and the parts are not.'],
        ['assumes one owner', 'рассчитана на одного владельца', 'And the design assumes one owner.'],
        ['every glued seam', 'каждый проклеенный шов', 'Which shows in every glued seam.'],
      ],
      rule: ['Причастие как определение к предмету', 'Every glued seam. Форма на -ed стоит перед существительным и заменяет which is glued.'],
      quiz: [
        ['«Ведь труд здесь, а детали нет» —', ['Since the labour is here and the parts are not', 'Since the labour is here and the parts is not', 'Since the labour are here and the parts are not'], 0],
        ['«Ремонт дороже самой машины» —', ['The repair costs more than the machine', 'The repair cost more than the machine', 'The repair costs more that the machine'], 0],
        ['«Что видно в каждом проклеенном шве» —', ['Which shows in every glued seam', 'Which show in every glued seam', 'Which shows in every gluing seam'], 0],
      ],
      order: ['Это устроено, а не естественно.', 'Which is arranged, not natural.'],
      produce: [
        ['Ремонт дороже самой машины.', 'The repair costs more than the machine.', []],
        ['Ведь труд здесь, а детали нет.', 'Since the labour is here and the parts are not.', []],
        ['И конструкция рассчитана на одного владельца.', 'And the design assumes one owner.', []],
      ],
    },
    {
      title: 'The repair cafe',
      summary: 'Мастерская выходного дня.',
      topics: [CU, ED, LI],
      dialogue: ['Мастерская', [
        ['Ben', 'Six volunteers, forty broken things.', 'Шесть волонтёров, сорок сломанных вещей.'],
        ['Anna', 'Of which about half get fixed.', 'Из которых чинится примерно половина.'],
        ['Ben', 'And the rest get understood, at least.', 'А остальное хотя бы становится понятным.'],
        ['Anna', 'Which is worth the Saturday on its own.', 'Ради этого уже стоит потратить субботу.'],
        ['Ben', 'Since knowing why is half of not repeating it.', 'Ведь знать почему — половина того, чтобы не повторить.'],
      ]],
      words: [
        ['forty broken things', 'сорок сломанных вещей', 'Six volunteers, forty broken things.'],
        ['Of which about half', 'из которых примерно половина', 'Of which about half get fixed.'],
        ['get understood', 'становятся понятными', 'And the rest get understood, at least.'],
        ['worth the Saturday', 'стоит субботы', 'Which is worth the Saturday on its own.'],
        ['half of not repeating it', 'половина того, чтобы не повторить', 'Knowing why is half of not repeating it.'],
      ],
      rule: ['Of which — часть от целого', 'Of which about half get fixed. Оборот присоединяет долю к названному множеству.'],
      quiz: [
        ['«Из которых чинится примерно половина» —', ['Of which about half get fixed', 'Of which about half gets fix', 'From which about half get fixed'], 0],
        ['«Ведь знать почему — половина того, чтобы не повторить» —', ['Knowing why is half of not repeating it', 'Know why is half of not repeating it', 'Knowing why is half of not repeat it'], 0],
        ['«Ради этого уже стоит потратить субботу» —', ['Which is worth the Saturday on its own', 'Which is worth the Saturday on his own', 'Which is worth the Saturday in its own'], 0],
      ],
      order: ['Шесть волонтёров, сорок сломанных вещей.', 'Six volunteers, forty broken things.'],
      produce: [
        ['Шесть волонтёров, сорок сломанных вещей.', 'Six volunteers, forty broken things.', []],
        ['Из которых чинится примерно половина.', 'Of which about half get fixed.', []],
        ['А остальное хотя бы становится понятным.', 'And the rest get understood, at least.', []],
      ],
    },
    {
      title: 'Learning a trade',
      summary: 'Учиться ремеслу.',
      topics: [ED, CA, LI],
      dialogue: ['Ученик', [
        ['Anna', 'He was taught by watching, for two years.', 'Его два года учили наблюдением.'],
        ['Ben', 'Which sounds slow and is not.', 'Звучит медленно, а это не так.'],
        ['Anna', 'Since the hands learn before the words do.', 'Ведь руки учатся раньше слов.'],
        ['Ben', 'Which every trade knows and few schools use.', 'Это знает любое ремесло и мало какая школа применяет.'],
        ['Anna', 'Though it is coming back, slowly.', 'Хотя это медленно возвращается.'],
      ]],
      words: [
        ['was taught by watching', 'учили наблюдением', 'He was taught by watching, for two years.'],
        ['sounds slow and is not', 'звучит медленно, а это не так', 'Which sounds slow and is not.'],
        ['the hands learn before the words', 'руки учатся раньше слов', 'Since the hands learn before the words do.'],
        ['few schools use', 'мало какая школа применяет', 'Which every trade knows and few schools use.'],
        ['coming back, slowly', 'медленно возвращается', 'Though it is coming back, slowly.'],
      ],
      rule: ['By + герундий — способ', 'He was taught by watching. Предлог by вводит способ действия.'],
      quiz: [
        ['«Его два года учили наблюдением» —', ['He was taught by watching, for two years', 'He was taught by watch, for two years', 'He was teached by watching, for two years'], 0],
        ['«Ведь руки учатся раньше слов» —', ['Since the hands learn before the words do', 'Since the hands learns before the words do', 'Since the hands learn before the words does'], 0],
        ['«Хотя это медленно возвращается» —', ['Though it is coming back, slowly', 'Though it is come back, slowly', 'Though it is coming back, slow'], 0],
      ],
      order: ['Звучит медленно, а это не так.', 'Which sounds slow and is not.'],
      produce: [
        ['Его два года учили наблюдением.', 'He was taught by watching, for two years.', []],
        ['Ведь руки учатся раньше слов.', 'Since the hands learn before the words do.', []],
        ['Хотя это медленно возвращается.', 'Though it is coming back, slowly.', []],
      ],
    },
    {
      title: 'Why it costs that',
      summary: 'Почему столько стоит.',
      topics: [CA, RI, LI],
      dialogue: ['Цена работы', [
        ['Ben', 'Eleven hours, plus the wood.', 'Одиннадцать часов, плюс дерево.'],
        ['Anna', 'Which is where the number comes from.', 'Отсюда цифра и берётся.'],
        ['Ben', 'And is never what people picture.', 'И это не то, что люди себе представляют.'],
        ['Anna', 'Since a shelf looks like an afternoon.', 'Ведь полка выглядит как дело на полдня.'],
        ['Ben', 'Until you have made one, badly.', 'Пока не сделаешь одну, плохо.'],
      ]],
      words: [
        ['plus the wood', 'плюс дерево', 'Eleven hours, plus the wood.'],
        ['where the number comes from', 'откуда берётся цифра', 'Which is where the number comes from.'],
        ['what people picture', 'что люди себе представляют', 'And is never what people picture.'],
        ['looks like an afternoon', 'выглядит как дело на полдня', 'Since a shelf looks like an afternoon.'],
        ['Until you have made one', 'пока не сделаешь одну', 'Until you have made one, badly.'],
      ],
      rule: ['Until + перфект', 'Until you have made one. Форма показывает завершённость до момента в будущем.'],
      quiz: [
        ['«Пока не сделаешь одну, плохо» —', ['Until you have made one, badly', 'Until you will have made one, badly', 'Until you have make one, badly'], 0],
        ['«Отсюда цифра и берётся» —', ['Which is where the number comes from', 'Which is where the number come from', 'Which is what the number comes from'], 0],
        ['«Ведь полка выглядит как дело на полдня» —', ['Since a shelf looks like an afternoon', 'Since a shelf look like an afternoon', 'Since a shelf looks as an afternoon'], 0],
      ],
      order: ['Одиннадцать часов, плюс дерево.', 'Eleven hours, plus the wood.'],
      produce: [
        ['Одиннадцать часов, плюс дерево.', 'Eleven hours, plus the wood.', []],
        ['Отсюда цифра и берётся.', 'Which is where the number comes from.', []],
        ['Пока не сделаешь одну, плохо.', 'Until you have made one, badly.', []],
      ],
    },
    {
      title: 'The first one you made',
      summary: 'Первая своя вещь.',
      topics: [CU, ED, LI],
      dialogue: ['Первая', [
        ['Anna', 'It is crooked and I still have it.', 'Она кривая, и она у меня до сих пор.'],
        ['Ben', 'Which everybody who makes things says.', 'Так говорит каждый, кто что-то делает.'],
        ['Anna', 'Since the object records the learning.', 'Ведь предмет хранит запись учёбы.'],
        ['Ben', 'In a way a certificate never does.', 'Так, как никогда не хранит диплом.'],
        ['Anna', 'And is why I keep the bad ones.', 'Поэтому я и храню неудачные.'],
      ]],
      words: [
        ['It is crooked', 'она кривая', 'It is crooked and I still have it.'],
        ['everybody who makes things', 'каждый, кто что-то делает', 'Which everybody who makes things says.'],
        ['records the learning', 'хранит запись учёбы', 'Since the object records the learning.'],
        ['In a way a certificate never does', 'так, как не хранит диплом', 'In a way a certificate never does.'],
        ['I keep the bad ones', 'храню неудачные', 'And is why I keep the bad ones.'],
      ],
      rule: ['In a way — способ действия', 'In a way a certificate never does. Оборот вводит сравнение способов.'],
      quiz: [
        ['«Так, как никогда не хранит диплом» —', ['In a way a certificate never does', 'In a way a certificate never do', 'On a way a certificate never does'], 0],
        ['«Так говорит каждый, кто что-то делает» —', ['Which everybody who makes things says', 'Which everybody who make things says', 'Which everybody who makes things say'], 0],
        ['«Ведь предмет хранит запись учёбы» —', ['Since the object records the learning', 'Since the object record the learning', 'Since the object records the learn'], 0],
      ],
      order: ['Поэтому я и храню неудачные.', 'And is why I keep the bad ones.'],
      produce: [
        ['Она кривая, и она у меня до сих пор.', 'It is crooked and I still have it.', []],
        ['Ведь предмет хранит запись учёбы.', 'Since the object records the learning.', []],
        ['Так, как никогда не хранит диплом.', 'In a way a certificate never does.', []],
      ],
    },
    {
      title: 'Handmade as a label',
      summary: '«Ручная работа» как ярлык.',
      topics: [CU, RI, LI],
      dialogue: ['Ярлык', [
        ['Ben', 'Handmade is not a regulated word either.', '«Ручная работа» — тоже слово нерегулируемое.'],
        ['Anna', 'Which is why the photo shows a hand.', 'Поэтому на фото и рука.'],
        ['Ben', 'Holding a thing made by a machine.', 'Держащая предмет, сделанный машиной.'],
        ['Anna', 'Which is not illegal, and is not honest.', 'Не незаконно, и не честно.'],
        ['Ben', 'And is easy to check, by asking where.', 'И легко проверяется вопросом «где».'],
      ]],
      words: [
        ['not a regulated word either', 'тоже нерегулируемое слово', 'Handmade is not a regulated word either.'],
        ['the photo shows a hand', 'на фото рука', 'Which is why the photo shows a hand.'],
        ['made by a machine', 'сделанный машиной', 'Holding a thing made by a machine.'],
        ['not illegal, and not honest', 'не незаконно и не честно', 'Which is not illegal, and is not honest.'],
        ['by asking where', 'вопросом «где»', 'And is easy to check, by asking where.'],
      ],
      rule: ['Either в отрицательном предложении', 'It is not a regulated word either. Слово either заменяет too в отрицании.'],
      quiz: [
        ['«"Ручная работа" — тоже слово нерегулируемое» —', ['Handmade is not a regulated word either', 'Handmade is not a regulated word too', 'Handmade is not a regulated word also'], 0],
        ['«Держащая предмет, сделанный машиной» —', ['Holding a thing made by a machine', 'Holding a thing made from a machine', 'Hold a thing made by a machine'], 0],
        ['«И легко проверяется вопросом «где»» —', ['And is easy to check, by asking where', 'And is easy to check, by ask where', 'And is easy to checking, by asking where'], 0],
      ],
      order: ['Поэтому на фото и рука.', 'Which is why the photo shows a hand.'],
      produce: [
        ['«Ручная работа» — тоже слово нерегулируемое.', 'Handmade is not a regulated word either.', []],
        ['Держащая предмет, сделанный машиной.', 'Holding a thing made by a machine.', []],
        ['Не незаконно, и не честно.', 'Which is not illegal, and is not honest.', []],
      ],
    },
    {
      title: 'Working alone all day',
      summary: 'Целый день один.',
      topics: [CA, CU, LI],
      dialogue: ['Один', [
        ['Anna', 'Nine hours without speaking to anybody.', 'Девять часов, не сказав никому ни слова.'],
        ['Ben', 'Which suits about one person in five.', 'Что подходит примерно одному из пяти.'],
        ['Anna', 'And is sold to everybody as freedom.', 'А продаётся всем как свобода.'],
        ['Ben', 'Along with the invoices nobody mentions.', 'Вместе со счетами, о которых не говорят.'],
        ['Anna', 'Which are the actual job, some months.', 'В иные месяцы они и есть работа.'],
      ]],
      words: [
        ['without speaking to anybody', 'не сказав никому ни слова', 'Nine hours without speaking to anybody.'],
        ['suits about one person in five', 'подходит одному из пяти', 'Which suits about one person in five.'],
        ['sold to everybody as freedom', 'продаётся всем как свобода', 'And is sold to everybody as freedom.'],
        ['the invoices nobody mentions', 'счета, о которых не говорят', 'Along with the invoices nobody mentions.'],
        ['the actual job', 'настоящая работа', 'Which are the actual job, some months.'],
      ],
      rule: ['Without + герундий', 'Without speaking to anybody. После предлога идёт форма на -ing, не инфинитив.'],
      quiz: [
        ['«Девять часов, не сказав никому ни слова» —', ['Nine hours without speaking to anybody', 'Nine hours without speak to anybody', 'Nine hours without to speak to anybody'], 0],
        ['«Что подходит примерно одному из пяти» —', ['Which suits about one person in five', 'Which suit about one person in five', 'Which suits about one person of five'], 0],
        ['«А продаётся всем как свобода» —', ['And is sold to everybody as freedom', 'And is sell to everybody as freedom', 'And is sold to everybody like freedom of'], 0],
      ],
      order: ['Вместе со счетами, о которых не говорят.', 'Along with the invoices nobody mentions.'],
      produce: [
        ['Девять часов, не сказав никому ни слова.', 'Nine hours without speaking to anybody.', []],
        ['А продаётся всем как свобода.', 'And is sold to everybody as freedom.', []],
        ['В иные месяцы они и есть работа.', 'Which are the actual job, some months.', []],
      ],
    },
    {
      title: 'What survives',
      summary: 'Что переживает нас.',
      topics: [CU, LI, ED],
      dialogue: ['Итог', [
        ['Ben', 'The table has been in use since nineteen forty.', 'Стол в ходу с сорокового года.'],
        ['Anna', 'Having been repaired four times.', 'Пройдя четыре ремонта.'],
        ['Ben', 'Which is the whole argument for making well.', 'Вот и весь довод в пользу хорошей работы.'],
        ['Anna', 'And the reason it was never cheap.', 'И причина, по которой он никогда не был дешёвым.'],
        ['Ben', 'Which somebody decided, eighty years ago.', 'Что кто-то решил восемьдесят лет назад.'],
      ]],
      words: [
        ['has been in use', 'в ходу', 'The table has been in use since nineteen forty.'],
        ['Having been repaired', 'пройдя ремонт', 'Having been repaired four times.'],
        ['the argument for making well', 'довод за хорошую работу', 'Which is the whole argument for making well.'],
        ['never cheap', 'никогда не дешёвым', 'And the reason it was never cheap.'],
        ['eighty years ago', 'восемьдесят лет назад', 'Which somebody decided, eighty years ago.'],
      ],
      rule: ['Ручная работа считается часами', 'Одиннадцать часов и материал объясняют цену лучше любого слова «эксклюзив».'],
      quiz: [
        ['«Пройдя четыре ремонта» —', ['Having been repaired four times', 'Have been repaired four times', 'Having be repaired four times'], 0],
        ['«Стол в ходу с сорокового года» —', ['The table has been in use since nineteen forty', 'The table has been in use from nineteen forty', 'The table have been in use since nineteen forty'], 0],
        ['«Вот и весь довод в пользу хорошей работы» —', ['The whole argument for making well', 'The whole argument for make well', 'The whole argument of making well'], 0],
      ],
      order: ['И причина, по которой он никогда не был дешёвым.', 'And the reason it was never cheap.'],
      produce: [
        ['Стол в ходу с сорокового года.', 'The table has been in use since nineteen forty.', []],
        ['Пройдя четыре ремонта.', 'Having been repaired four times.', []],
        ['Что кто-то решил восемьдесят лет назад.', 'Which somebody decided, eighty years ago.', []],
      ],
    },
    {
      checkpoint: true,
      title: 'Проверка: сделано руками',
      summary: 'Шесть фраз без подсказок.',
      topics: [CU, CA, ED, RI],
      produce: [
        ['Ведь труд здесь, а детали нет.', 'Since the labour is here and the parts are not.', []],
        ['Из которых чинится примерно половина.', 'Of which about half get fixed.', []],
        ['Его два года учили наблюдением.', 'He was taught by watching, for two years.', []],
        ['Пока не сделаешь одну, плохо.', 'Until you have made one, badly.', []],
        ['«Ручная работа» — тоже слово нерегулируемое.', 'Handmade is not a regulated word either.', []],
        ['Девять часов, не сказав никому ни слова.', 'Nine hours without speaking to anybody.', []],
      ],
    },
  ],
}
