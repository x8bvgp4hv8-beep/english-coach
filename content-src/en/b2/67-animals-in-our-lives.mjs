// B2, блок 67 — Animals in our lives. Животные рядом с нами.
//
// Тематический блок: питомцы и их цена, ветеринар, ответственность, дикие
// животные в городе и разговор о потере. Условия, пассив, оценки.

const AN = 'b1-tema-animales'
const RE = 'b2-tema-relaciones'
const RI = 'b2-tema-riesgo'
const ET = 'b2-tema-etica'
const LI = 'b2-linkers'

export default {
  slug: 'animals-in-our-lives',
  title: 'Животные рядом с нами',
  subtitle: 'Питомцы, ветеринар, город и потеря',
  canDo: [
    'обсуждать содержание животного',
    'говорить о счетах ветеринара',
    'спорить об ответственности хозяина',
    'обсуждать животных в городе',
    'говорить о потере питомца',
  ],
  lessons: [
    {
      title: 'What a dog actually costs',
      summary: 'Во что на самом деле обходится собака.',
      topics: [RI, AN, LI],
      dialogue: ['Цена', [
        ['Anna', 'Eleven thousand, over the whole life.', 'Одиннадцать тысяч, за всю жизнь.'],
        ['Ben', 'Which nobody is told at the shelter.', 'О чём в приюте никому не говорят.'],
        ['Anna', 'And which would change some decisions.', 'И что изменило бы некоторые решения.'],
        ['Ben', 'Though probably not the good ones.', 'Хотя, вероятно, не самые верные.'],
        ['Anna', 'Which is why nobody says it aloud.', 'Поэтому вслух этого и не говорят.'],
      ]],
      words: [
        ['over the whole life', 'за всю жизнь', 'Eleven thousand, over the whole life.'],
        ['nobody is told at the shelter', 'в приюте не говорят', 'Which nobody is told at the shelter.'],
        ['would change some decisions', 'изменило бы некоторые решения', 'And which would change some decisions.'],
        ['probably not the good ones', 'вероятно, не самые верные', 'Though probably not the good ones.'],
        ['nobody says it aloud', 'вслух не говорят', 'Which is why nobody says it aloud.'],
      ],
      rule: ['Be told — пассив с людьми', 'Nobody is told at the shelter. Подлежащим становится тот, кому сообщают.'],
      quiz: [
        ['«О чём в приюте никому не говорят» —', ['Which nobody is told at the shelter', 'Which nobody is tell at the shelter', 'Which nobody are told at the shelter'], 0],
        ['«И что изменило бы некоторые решения» —', ['And which would change some decisions', 'And which would changed some decisions', 'And which will change some decisions'], 0],
        ['«Поэтому вслух этого и не говорят» —', ['Which is why nobody says it aloud', 'Which is why nobody say it aloud', 'What is why nobody says it aloud'], 0],
      ],
      order: ['Одиннадцать тысяч, за всю жизнь.', 'Eleven thousand, over the whole life.'],
      produce: [
        ['Одиннадцать тысяч, за всю жизнь.', 'Eleven thousand, over the whole life.', []],
        ['О чём в приюте никому не говорят.', 'Which nobody is told at the shelter.', []],
        ['И что изменило бы некоторые решения.', 'And which would change some decisions.', []],
      ],
    },
    {
      title: 'The vet bill',
      summary: 'Счёт ветеринара.',
      topics: [RI, AN, LI],
      dialogue: ['Ветеринар', [
        ['Ben', 'Two thousand for an operation at nine years old.', 'Две тысячи за операцию в девять лет.'],
        ['Anna', 'Which is a medical and a financial question.', 'Это вопрос и медицинский, и финансовый.'],
        ['Ben', 'Asked at the worst possible moment.', 'Заданный в худший из моментов.'],
        ['Anna', 'By people who love the animal.', 'Людьми, которые любят это животное.'],
        ['Ben', 'Which is why insurance exists, badly.', 'Поэтому и существует страховка, плохая.'],
      ]],
      words: [
        ['at nine years old', 'в девять лет', 'Two thousand for an operation at nine years old.'],
        ['a medical and a financial question', 'вопрос медицинский и финансовый', 'Which is a medical and a financial question.'],
        ['Asked at the worst possible moment', 'заданный в худший момент', 'Asked at the worst possible moment.'],
        ['who love the animal', 'которые любят животное', 'By people who love the animal.'],
        ['insurance exists', 'существует страховка', 'Which is why insurance exists, badly.'],
      ],
      rule: ['Причастный оборот с asked', 'Asked at the worst possible moment. Форма на -ed присоединяет обстоятельство к вопросу.'],
      quiz: [
        ['«Заданный в худший из моментов» —', ['Asked at the worst possible moment', 'Asking at the worst possible moment', 'Asked in the worst possible moment'], 0],
        ['«Людьми, которые любят это животное» —', ['By people who love the animal', 'By people who loves the animal', 'By people what love the animal'], 0],
        ['«Это вопрос и медицинский, и финансовый» —', ['Which is a medical and a financial question', 'Which is a medical and a financial questions', 'Which is a medical and financial a question'], 0],
      ],
      order: ['Поэтому и существует страховка, плохая.', 'Which is why insurance exists, badly.'],
      produce: [
        ['Две тысячи за операцию в девять лет.', 'Two thousand for an operation at nine years old.', []],
        ['Заданный в худший из моментов.', 'Asked at the worst possible moment.', []],
        ['Людьми, которые любят это животное.', 'By people who love the animal.', []],
      ],
    },
    {
      title: 'The dog that was never walked',
      summary: 'Собака, которую не выгуливали.',
      topics: [ET, AN, LI],
      dialogue: ['Ответственность', [
        ['Anna', 'It barks all day because nobody is there.', 'Она лает весь день, потому что никого нет.'],
        ['Ben', 'Which the neighbours hear and nobody reports.', 'Что соседи слышат и никто не сообщает.'],
        ['Anna', 'Since reporting feels like an accusation.', 'Ведь сообщить — как обвинить.'],
        ['Ben', 'And usually is one, in the end.', 'И в итоге обычно им и является.'],
        ['Anna', 'Which the animal cannot make itself.', 'Чего само животное сделать не может.'],
      ]],
      words: [
        ['barks all day', 'лает весь день', 'It barks all day because nobody is there.'],
        ['the neighbours hear', 'соседи слышат', 'Which the neighbours hear and nobody reports.'],
        ['reporting feels like an accusation', 'сообщить как обвинить', 'Since reporting feels like an accusation.'],
        ['usually is one', 'обычно им и является', 'And usually is one, in the end.'],
        ['cannot make itself', 'сам сделать не может', 'Which the animal cannot make itself.'],
      ],
      rule: ['Feel like + существительное', 'Reporting feels like an accusation. После feel like идёт существительное или -ing.'],
      quiz: [
        ['«Ведь сообщить — как обвинить» —', ['Since reporting feels like an accusation', 'Since report feels like an accusation', 'Since reporting feel like an accusation'], 0],
        ['«Чего само животное сделать не может» —', ['Which the animal cannot make itself', 'Which the animal cannot make himself', 'Which the animal cannot makes itself'], 0],
        ['«Что соседи слышат и никто не сообщает» —', ['Which the neighbours hear and nobody reports', 'Which the neighbours hears and nobody reports', 'Which the neighbours hear and nobody report'], 0],
      ],
      order: ['И в итоге обычно им и является.', 'And usually is one, in the end.'],
      produce: [
        ['Она лает весь день, потому что никого нет.', 'It barks all day because nobody is there.', []],
        ['Ведь сообщить — как обвинить.', 'Since reporting feels like an accusation.', []],
        ['Чего само животное сделать не может.', 'Which the animal cannot make itself.', []],
      ],
    },
    {
      title: 'Foxes, gulls and rats',
      summary: 'Лисы, чайки и крысы.',
      topics: [AN, ET, LI],
      dialogue: ['Город', [
        ['Ben', 'They live on what we throw away.', 'Они живут тем, что мы выбрасываем.'],
        ['Anna', 'Which makes them our animals, in effect.', 'Что по сути делает их нашими животными.'],
        ['Ben', 'And makes the bins the only real policy.', 'И делает мусорные баки единственной настоящей политикой.'],
        ['Anna', 'Which every city discovers eventually.', 'Что каждый город рано или поздно обнаруживает.'],
        ['Ben', 'After trying everything more dramatic.', 'Перепробовав всё более драматичное.'],
      ]],
      words: [
        ['live on what we throw away', 'живут тем, что мы выбрасываем', 'They live on what we throw away.'],
        ['our animals, in effect', 'по сути наши животные', 'Which makes them our animals, in effect.'],
        ['the only real policy', 'единственная настоящая политика', 'And makes the bins the only real policy.'],
        ['every city discovers', 'каждый город обнаруживает', 'Which every city discovers eventually.'],
        ['everything more dramatic', 'всё более драматичное', 'After trying everything more dramatic.'],
      ],
      rule: ['Live on something', 'They live on what we throw away. Предлог on значит «питаться чем-то».'],
      quiz: [
        ['«Они живут тем, что мы выбрасываем» —', ['They live on what we throw away', 'They live of what we throw away', 'They live on that we throw away'], 0],
        ['«Что каждый город рано или поздно обнаруживает» —', ['Which every city discovers eventually', 'Which every city discover eventually', 'Which every cities discovers eventually'], 0],
        ['«Перепробовав всё более драматичное» —', ['After trying everything more dramatic', 'After try everything more dramatic', 'After trying everything more dramatical'], 0],
      ],
      order: ['И делает мусорные баки единственной настоящей политикой.', 'And makes the bins the only real policy.'],
      produce: [
        ['Они живут тем, что мы выбрасываем.', 'They live on what we throw away.', []],
        ['Что по сути делает их нашими животными.', 'Which makes them our animals, in effect.', []],
        ['Перепробовав всё более драматичное.', 'After trying everything more dramatic.', []],
      ],
    },
    {
      title: 'Working animals',
      summary: 'Рабочие животные.',
      topics: [AN, ET, LI],
      dialogue: ['Работа', [
        ['Anna', 'The dog has a job and knows it.', 'У собаки есть работа, и она это знает.'],
        ['Ben', 'Which changes everything about how it lives.', 'Что меняет всё в том, как она живёт.'],
        ['Anna', 'And is what most pet dogs are missing.', 'И чего большинству домашних собак не хватает.'],
        ['Ben', 'Rather than another toy from the shop.', 'А не очередной игрушки из магазина.'],
        ['Anna', 'Which the trainers say and nobody hears.', 'Что кинологи говорят, а никто не слышит.'],
      ]],
      words: [
        ['has a job and knows it', 'есть работа, и она знает', 'The dog has a job and knows it.'],
        ['how it lives', 'как она живёт', 'Which changes everything about how it lives.'],
        ['what most pet dogs are missing', 'чего не хватает домашним собакам', 'And is what most pet dogs are missing.'],
        ['another toy from the shop', 'очередная игрушка из магазина', 'Rather than another toy from the shop.'],
        ['the trainers say', 'кинологи говорят', 'Which the trainers say and nobody hears.'],
      ],
      rule: ['About how — предлог перед косвенным вопросом', 'Everything about how it lives. Порядок слов после how прямой.'],
      quiz: [
        ['«Что меняет всё в том, как она живёт» —', ['Which changes everything about how it lives', 'Which changes everything about how does it live', 'Which change everything about how it lives'], 0],
        ['«И чего большинству домашних собак не хватает» —', ['And is what most pet dogs are missing', 'And is that most pet dogs are missing', 'And is what most pet dogs is missing'], 0],
        ['«У собаки есть работа, и она это знает» —', ['The dog has a job and knows it', 'The dog have a job and knows it', 'The dog has a job and know it'], 0],
      ],
      order: ['А не очередной игрушки из магазина.', 'Rather than another toy from the shop.'],
      produce: [
        ['У собаки есть работа, и она это знает.', 'The dog has a job and knows it.', []],
        ['И чего большинству домашних собак не хватает.', 'And is what most pet dogs are missing.', []],
        ['Что кинологи говорят, а никто не слышит.', 'Which the trainers say and nobody hears.', []],
      ],
    },
    {
      title: 'The decision at the end',
      summary: 'Решение в конце.',
      topics: [RE, AN, LI],
      dialogue: ['Конец', [
        ['Ben', 'The vet said it was time, gently.', 'Ветеринар мягко сказал, что пора.'],
        ['Anna', 'Which somebody has to say out loud.', 'Кто-то должен произнести это вслух.'],
        ['Ben', 'And which the family usually cannot.', 'И семья обычно не может.'],
        ['Anna', 'Having waited two weeks too long.', 'Прождав на две недели дольше нужного.'],
        ['Ben', 'Which almost everybody regrets, afterwards.', 'О чём потом жалеют почти все.'],
      ]],
      words: [
        ['said it was time', 'сказал, что пора', 'The vet said it was time, gently.'],
        ['has to say out loud', 'должен произнести вслух', 'Which somebody has to say out loud.'],
        ['the family usually cannot', 'семья обычно не может', 'And which the family usually cannot.'],
        ['Having waited two weeks too long', 'прождав на две недели дольше', 'Having waited two weeks too long.'],
        ['almost everybody regrets', 'почти все жалеют', 'Which almost everybody regrets, afterwards.'],
      ],
      rule: ['Two weeks too long', 'Having waited two weeks too long. Мера ставится перед too и уточняет избыток.'],
      quiz: [
        ['«Прождав на две недели дольше нужного» —', ['Having waited two weeks too long', 'Have waited two weeks too long', 'Having waited two weeks very long'], 0],
        ['«Ветеринар мягко сказал, что пора» —', ['The vet said it was time, gently', 'The vet said it is time, gently then', 'The vet said it was time, gentle'], 0],
        ['«О чём потом жалеют почти все» —', ['Which almost everybody regrets, afterwards', 'Which almost everybody regret, afterwards', 'Which almost everybody regrets, after wards of'], 0],
      ],
      order: ['И семья обычно не может.', 'And which the family usually cannot.'],
      produce: [
        ['Ветеринар мягко сказал, что пора.', 'The vet said it was time, gently.', []],
        ['Кто-то должен произнести это вслух.', 'Which somebody has to say out loud.', []],
        ['Прождав на две недели дольше нужного.', 'Having waited two weeks too long.', []],
      ],
    },
    {
      title: 'Grief that people dismiss',
      summary: 'Горе, которое обесценивают.',
      topics: [RE, ET, LI],
      dialogue: ['Потеря', [
        ['Anna', 'Somebody said it was only a cat.', 'Кто-то сказал, что это всего лишь кошка.'],
        ['Ben', 'Which is true and entirely beside the point.', 'Что верно и совершенно не по делу.'],
        ['Anna', 'Since the loss is of a daily routine.', 'Ведь потеря — это потеря ежедневного распорядка.'],
        ['Ben', 'Repeated four times a day, for twelve years.', 'Повторявшегося четыре раза в день, двенадцать лет.'],
        ['Anna', 'Which is more contact than with most people.', 'А это больше общения, чем с большинством людей.'],
      ]],
      words: [
        ['it was only a cat', 'это всего лишь кошка', 'Somebody said it was only a cat.'],
        ['beside the point', 'не по делу', 'Which is true and entirely beside the point.'],
        ['a daily routine', 'ежедневный распорядок', 'Since the loss is of a daily routine.'],
        ['four times a day', 'четыре раза в день', 'Repeated four times a day, for twelve years.'],
        ['more contact than with most people', 'больше общения, чем с людьми', 'Which is more contact than with most people.'],
      ],
      rule: ['Beside the point — идиома', 'Entirely beside the point. Оборот значит «не относится к делу», а не «рядом».'],
      quiz: [
        ['«Что верно и совершенно не по делу» —', ['Which is true and entirely beside the point', 'Which is true and entirely besides the point', 'Which is true and entire beside the point'], 0],
        ['«Кто-то сказал, что это всего лишь кошка» —', ['Somebody said it was only a cat', 'Somebody said it is only a cat then', 'Somebody said it were only a cat'], 0],
        ['«Повторявшегося четыре раза в день, двенадцать лет» —', ['Repeated four times a day, for twelve years', 'Repeating four times a day, for twelve years', 'Repeated four time a day, for twelve years'], 0],
      ],
      order: ['Ведь потеря — это потеря ежедневного распорядка.', 'Since the loss is of a daily routine.'],
      produce: [
        ['Кто-то сказал, что это всего лишь кошка.', 'Somebody said it was only a cat.', []],
        ['Что верно и совершенно не по делу.', 'Which is true and entirely beside the point.', []],
        ['А это больше общения, чем с большинством людей.', 'Which is more contact than with most people.', []],
      ],
    },
    {
      title: 'Getting another one',
      summary: 'Завести следующего.',
      topics: [RE, AN, LI],
      dialogue: ['Снова', [
        ['Ben', 'We said never again, for two years.', 'Мы два года говорили «больше никогда».'],
        ['Anna', 'Which everybody says, and few keep.', 'Так говорят все, и немногие держатся.'],
        ['Ben', 'Since the house is measurably quieter.', 'Ведь дом становится ощутимо тише.'],
        ['Anna', 'And nobody built these habits for silence.', 'А эти привычки никто не заводил ради тишины.'],
        ['Ben', 'Which is how the next one arrives.', 'Так и появляется следующий.'],
      ]],
      words: [
        ['said never again', 'говорили «больше никогда»', 'We said never again, for two years.'],
        ['few keep', 'немногие держатся', 'Which everybody says, and few keep.'],
        ['measurably quieter', 'ощутимо тише', 'Since the house is measurably quieter.'],
        ['built these habits', 'заводил эти привычки', 'And nobody built these habits for silence.'],
        ['how the next one arrives', 'как появляется следующий', 'Which is how the next one arrives.'],
      ],
      rule: ['Животное — это распорядок, а не только чувство', 'Счёт ветеринара и ежедневный ритуал объясняют и цену, и потерю точнее любых слов о любви.'],
      quiz: [
        ['«Так говорят все, и немногие держатся» —', ['Which everybody says, and few keep', 'Which everybody say, and few keep', 'Which everybody says, and a few keeps'], 0],
        ['«Ведь дом становится ощутимо тише» —', ['Since the house is measurably quieter', 'Since the house is measurable quieter', 'Since the house is measurably more quiet'], 0],
        ['«Так и появляется следующий» —', ['Which is how the next one arrives', 'Which is how the next one arrive', 'Which is what the next one arrives'], 0],
      ],
      order: ['Мы два года говорили «больше никогда».', 'We said never again, for two years.'],
      produce: [
        ['Мы два года говорили «больше никогда».', 'We said never again, for two years.', []],
        ['Ведь дом становится ощутимо тише.', 'Since the house is measurably quieter.', []],
        ['А эти привычки никто не заводил ради тишины.', 'And nobody built these habits for silence.', []],
      ],
    },
    {
      checkpoint: true,
      title: 'Проверка: животные рядом с нами',
      summary: 'Шесть фраз без подсказок.',
      topics: [AN, RE, RI, ET],
      produce: [
        ['О чём в приюте никому не говорят.', 'Which nobody is told at the shelter.', []],
        ['Заданный в худший из моментов.', 'Asked at the worst possible moment.', []],
        ['Ведь сообщить — как обвинить.', 'Since reporting feels like an accusation.', []],
        ['Они живут тем, что мы выбрасываем.', 'They live on what we throw away.', []],
        ['Прождав на две недели дольше нужного.', 'Having waited two weeks too long.', []],
        ['Что верно и совершенно не по делу.', 'Which is true and entirely beside the point.', []],
      ],
    },
  ],
}
