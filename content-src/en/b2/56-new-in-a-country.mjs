// B2, блок 56 — New in a country. Новый в стране.
//
// Тематический блок: документы, банк, первые друзья, тоска по дому и вопрос
// «где теперь дом». Пассив, косвенная речь, аккуратные обобщения.

const SO = 'b2-tema-sociedad'
const LE = 'b2-tema-lengua'
const RE = 'b2-tema-relaciones'
const SE = 'b1-tema-servicios'
const LI = 'b2-linkers'

export default {
  slug: 'new-in-a-country',
  title: 'Новый в стране',
  subtitle: 'Документы, первые друзья и дом',
  canDo: [
    'проходить бюрократию по шагам',
    'объяснять свою ситуацию коротко',
    'заводить первые знакомства',
    'говорить о тоске по дому',
    'обсуждать, что теперь считать домом',
  ],
  lessons: [
    {
      title: 'The first appointment',
      summary: 'Первая запись.',
      topics: [SE, SO, LI],
      dialogue: ['Запись', [
        ['Anna', 'The earliest slot was in eleven weeks.', 'Ближайшая запись была через одиннадцать недель.'],
        ['Ben', 'By which time the permit expires.', 'К этому времени разрешение истекает.'],
        ['Anna', 'Which they know, and have a form for.', 'Что они знают, и на это есть бланк.'],
        ['Ben', 'Which nobody mentions at the counter.', 'О котором у стойки не упоминают.'],
        ['Anna', 'Unless you ask the exact question.', 'Если не задать точный вопрос.'],
      ]],
      words: [
        ['The earliest slot', 'ближайшая запись', 'The earliest slot was in eleven weeks.'],
        ['the permit expires', 'разрешение истекает', 'By which time the permit expires.'],
        ['have a form for', 'на это есть бланк', 'Which they know, and have a form for.'],
        ['nobody mentions at the counter', 'у стойки не упоминают', 'Which nobody mentions at the counter.'],
        ['the exact question', 'точный вопрос', 'Unless you ask the exact question.'],
      ],
      rule: ['By which time — связка со сроком', 'By which time the permit expires. Оборот привязывает событие к названному сроку.'],
      quiz: [
        ['«К этому времени разрешение истекает» —', ['By which time the permit expires', 'By which time the permit expire', 'By what time the permit expires'], 0],
        ['«Ближайшая запись была через одиннадцать недель» —', ['The earliest slot was in eleven weeks', 'The earliest slot was on eleven weeks', 'The earlier slot was in eleven weeks'], 0],
        ['«Если не задать точный вопрос» —', ['Unless you ask the exact question', 'Unless you do not ask the exact question', 'Unless you asks the exact question'], 0],
      ],
      order: ['О котором у стойки не упоминают.', 'Which nobody mentions at the counter.'],
      produce: [
        ['Ближайшая запись была через одиннадцать недель.', 'The earliest slot was in eleven weeks.', []],
        ['К этому времени разрешение истекает.', 'By which time the permit expires.', []],
        ['Если не задать точный вопрос.', 'Unless you ask the exact question.', []],
      ],
    },
    {
      title: 'Explaining yourself briefly',
      summary: 'Коротко объяснить себя.',
      topics: [LE, SO, LI],
      dialogue: ['Кто вы', [
        ['Ben', 'Two sentences, and the same two every time.', 'Два предложения, и каждый раз одни и те же.'],
        ['Anna', 'Which saves the energy for the real questions.', 'Что бережёт силы для настоящих вопросов.'],
        ['Ben', 'And stops the story growing legs.', 'И не даёт истории обрасти подробностями.'],
        ['Anna', 'Which it does, when you improvise.', 'Что происходит, когда импровизируешь.'],
        ['Ben', 'Nine times out of ten, at least.', 'Как минимум девять раз из десяти.'],
      ]],
      words: [
        ['the same two every time', 'каждый раз одни и те же', 'Two sentences, and the same two every time.'],
        ['saves the energy', 'бережёт силы', 'Which saves the energy for the real questions.'],
        ['stops the story growing legs', 'не даёт истории обрасти подробностями', 'And stops the story growing legs.'],
        ['when you improvise', 'когда импровизируешь', 'Which it does, when you improvise.'],
        ['Nine times out of ten', 'девять раз из десяти', 'Nine times out of ten, at least.'],
      ],
      rule: ['Stop something doing', 'It stops the story growing legs. После stop идёт объект и форма на -ing.'],
      quiz: [
        ['«И не даёт истории обрасти подробностями» —', ['And stops the story growing legs', 'And stops the story to grow legs', 'And stop the story growing legs'], 0],
        ['«Что бережёт силы для настоящих вопросов» —', ['Which saves the energy for the real questions', 'Which save the energy for the real questions', 'Which saves the energy of the real questions'], 0],
        ['«Как минимум девять раз из десяти» —', ['Nine times out of ten, at least', 'Nine times from ten, at least', 'Nine time out of ten, at least'], 0],
      ],
      order: ['Два предложения, и каждый раз одни и те же.', 'Two sentences, and the same two every time.'],
      produce: [
        ['Два предложения, и каждый раз одни и те же.', 'Two sentences, and the same two every time.', []],
        ['Что бережёт силы для настоящих вопросов.', 'Which saves the energy for the real questions.', []],
        ['И не даёт истории обрасти подробностями.', 'And stops the story growing legs.', []],
      ],
    },
    {
      title: 'The bank that wanted an address',
      summary: 'Банк, которому нужен адрес.',
      topics: [SE, SO, LI],
      dialogue: ['Замкнутый круг', [
        ['Anna', 'The flat needs a bank account.', 'Для квартиры нужен счёт.'],
        ['Ben', 'And the account needs an address.', 'А для счёта нужен адрес.'],
        ['Anna', 'Which is a circle everybody walks once.', 'Круг, который каждый проходит один раз.'],
        ['Ben', 'And which is broken by one friendly landlord.', 'И который ломает один добрый арендодатель.'],
        ['Anna', 'Or by a bank that does not read its own rules.', 'Или банк, который не читает свои правила.'],
      ]],
      words: [
        ['needs a bank account', 'нужен счёт', 'The flat needs a bank account.'],
        ['the account needs an address', 'для счёта нужен адрес', 'And the account needs an address.'],
        ['a circle everybody walks once', 'круг, который каждый проходит один раз', 'Which is a circle everybody walks once.'],
        ['one friendly landlord', 'один добрый арендодатель', 'Broken by one friendly landlord.'],
        ['does not read its own rules', 'не читает свои правила', 'A bank that does not read its own rules.'],
      ],
      rule: ['Its own — принадлежность предмета', 'A bank that does not read its own rules. Форма its без апострофа означает принадлежность.'],
      quiz: [
        ['«Или банк, который не читает свои правила» —', ['A bank that does not read its own rules', 'A bank that does not read it own rules', 'A bank what does not read its own rules'], 0],
        ['«Круг, который каждый проходит один раз» —', ['A circle everybody walks once', 'A circle everybody walk once', 'A circle what everybody walks once'], 0],
        ['«А для счёта нужен адрес» —', ['And the account needs an address', 'And the account need an address', 'And the account needs a address'], 0],
      ],
      order: ['Для квартиры нужен счёт.', 'The flat needs a bank account.'],
      produce: [
        ['Для квартиры нужен счёт.', 'The flat needs a bank account.', []],
        ['Круг, который каждый проходит один раз.', 'Which is a circle everybody walks once.', []],
        ['И который ломает один добрый арендодатель.', 'And which is broken by one friendly landlord.', []],
      ],
    },
    {
      title: 'The first three friends',
      summary: 'Первые трое друзей.',
      topics: [RE, SO, LI],
      dialogue: ['Знакомства', [
        ['Ben', 'They were all foreigners too, at first.', 'Сначала все они тоже были иностранцами.'],
        ['Anna', 'Which everybody warns you about.', 'О чём всех предупреждают.'],
        ['Ben', 'And which nobody manages to avoid.', 'И чего никому не удаётся избежать.'],
        ['Anna', 'Since shared confusion is a strong glue.', 'Ведь общая растерянность — сильный клей.'],
        ['Ben', 'And the locals arrive in year two.', 'А местные появляются на второй год.'],
      ]],
      words: [
        ['all foreigners too', 'все тоже иностранцы', 'They were all foreigners too, at first.'],
        ['everybody warns you about', 'о чём всех предупреждают', 'Which everybody warns you about.'],
        ['nobody manages to avoid', 'никому не удаётся избежать', 'And which nobody manages to avoid.'],
        ['shared confusion', 'общая растерянность', 'Since shared confusion is a strong glue.'],
        ['arrive in year two', 'появляются на второй год', 'And the locals arrive in year two.'],
      ],
      rule: ['Manage to do', 'Nobody manages to avoid it. Глагол manage требует инфинитива с to и значит «суметь».'],
      quiz: [
        ['«И чего никому не удаётся избежать» —', ['And which nobody manages to avoid', 'And which nobody manages avoiding', 'And which nobody manage to avoid'], 0],
        ['«О чём всех предупреждают» —', ['Which everybody warns you about', 'Which everybody warns you', 'Which everybody warn you about'], 0],
        ['«Ведь общая растерянность — сильный клей» —', ['Since shared confusion is a strong glue', 'Since shared confusion are a strong glue', 'Since share confusion is a strong glue'], 0],
      ],
      order: ['А местные появляются на второй год.', 'And the locals arrive in year two.'],
      produce: [
        ['Сначала все они тоже были иностранцами.', 'They were all foreigners too, at first.', []],
        ['И чего никому не удаётся избежать.', 'And which nobody manages to avoid.', []],
        ['Ведь общая растерянность — сильный клей.', 'Since shared confusion is a strong glue.', []],
      ],
    },
    {
      title: 'Homesick on a Tuesday',
      summary: 'Тоска по дому во вторник.',
      topics: [RE, LE, LI],
      dialogue: ['Тоска', [
        ['Anna', 'It arrives over something absurdly small.', 'Она приходит из-за чего-то до нелепости мелкого.'],
        ['Ben', 'A bread, a radio jingle, a smell.', 'Хлеб, радиозаставка, запах.'],
        ['Anna', 'Which is not about the bread.', 'И дело не в хлебе.'],
        ['Ben', 'But about being understood without effort.', 'А в том, чтобы тебя понимали без усилий.'],
        ['Anna', 'Which is what a language costs, honestly.', 'Честно говоря, вот цена чужого языка.'],
      ]],
      words: [
        ['absurdly small', 'до нелепости мелкое', 'It arrives over something absurdly small.'],
        ['a radio jingle', 'радиозаставка', 'A bread, a radio jingle, a smell.'],
        ['not about the bread', 'дело не в хлебе', 'Which is not about the bread.'],
        ['being understood without effort', 'быть понятым без усилий', 'But about being understood without effort.'],
        ['what a language costs', 'цена языка', 'Which is what a language costs, honestly.'],
      ],
      rule: ['Being understood — пассивный герундий', 'About being understood without effort. Форма описывает состояние, а не действие говорящего.'],
      quiz: [
        ['«А в том, чтобы тебя понимали без усилий» —', ['But about being understood without effort', 'But about be understood without effort', 'But about being understand without effort'], 0],
        ['«Она приходит из-за чего-то до нелепости мелкого» —', ['It arrives over something absurdly small', 'It arrives over something absurd small', 'It arrive over something absurdly small'], 0],
        ['«Честно говоря, вот цена чужого языка» —', ['Which is what a language costs, honestly', 'Which is that a language costs, honestly', 'Which is what a language cost, honestly'], 0],
      ],
      order: ['Хлеб, радиозаставка, запах.', 'A bread, a radio jingle, a smell.'],
      produce: [
        ['Она приходит из-за чего-то до нелепости мелкого.', 'It arrives over something absurdly small.', []],
        ['И дело не в хлебе.', 'Which is not about the bread.', []],
        ['А в том, чтобы тебя понимали без усилий.', 'But about being understood without effort.', []],
      ],
    },
    {
      title: 'When they ask where you are from',
      summary: 'Когда спрашивают, откуда вы.',
      topics: [LE, SO, LI],
      dialogue: ['Вопрос', [
        ['Ben', 'I have three answers, depending on who asks.', 'У меня три ответа, смотря кто спрашивает.'],
        ['Anna', 'Which is not dishonesty, but economy.', 'Это не нечестность, а экономия.'],
        ['Ben', 'Since the long one takes four minutes.', 'Ведь длинный занимает четыре минуты.'],
        ['Anna', 'And is only worth it with somebody staying.', 'И стоит того только с тем, кто задержится.'],
        ['Ben', 'Which you can usually tell by then.', 'Что к этому моменту обычно уже понятно.'],
      ]],
      words: [
        ['depending on who asks', 'смотря кто спрашивает', 'I have three answers, depending on who asks.'],
        ['not dishonesty, but economy', 'не нечестность, а экономия', 'Which is not dishonesty, but economy.'],
        ['the long one', 'длинный ответ', 'Since the long one takes four minutes.'],
        ['somebody staying', 'кто-то, кто задержится', 'And is only worth it with somebody staying.'],
        ['you can usually tell', 'обычно уже понятно', 'Which you can usually tell by then.'],
      ],
      rule: ['Depending on who — придаточное после предлога', 'Depending on who asks. Порядок слов прямой, вопросительная форма не нужна.'],
      quiz: [
        ['«У меня три ответа, смотря кто спрашивает» —', ['I have three answers, depending on who asks', 'I have three answers, depending on who does ask', 'I have three answers, depending of who asks'], 0],
        ['«И стоит того только с тем, кто задержится» —', ['And is only worth it with somebody staying', 'And is only worth it with somebody stays', 'And is only worth it with somebody to stay'], 0],
        ['«Что к этому моменту обычно уже понятно» —', ['Which you can usually tell by then', 'Which you can usually tells by then', 'Which you can usual tell by then'], 0],
      ],
      order: ['Это не нечестность, а экономия.', 'Which is not dishonesty, but economy.'],
      produce: [
        ['У меня три ответа, смотря кто спрашивает.', 'I have three answers, depending on who asks.', []],
        ['Ведь длинный занимает четыре минуты.', 'Since the long one takes four minutes.', []],
        ['Что к этому моменту обычно уже понятно.', 'Which you can usually tell by then.', []],
      ],
    },
    {
      title: 'Going back for a week',
      summary: 'Вернуться на неделю.',
      topics: [RE, SO, LI],
      dialogue: ['Возвращение', [
        ['Anna', 'Everything is the same and I am not.', 'Всё то же самое, а я нет.'],
        ['Ben', 'Which nobody at home quite believes.', 'Чему дома не вполне верят.'],
        ['Anna', 'Since they have watched no change happen.', 'Ведь они не видели, как что-то менялось.'],
        ['Ben', 'And I have changed in a place they cannot picture.', 'А я изменилась в месте, которое им не представить.'],
        ['Anna', 'Which is the loneliest part of it.', 'И это самая одинокая часть.'],
      ]],
      words: [
        ['Everything is the same', 'всё то же самое', 'Everything is the same and I am not.'],
        ['nobody at home believes', 'дома не верят', 'Which nobody at home quite believes.'],
        ['watched no change happen', 'не видели, как менялось', 'Since they have watched no change happen.'],
        ['a place they cannot picture', 'место, которое не представить', 'In a place they cannot picture.'],
        ['the loneliest part', 'самая одинокая часть', 'Which is the loneliest part of it.'],
      ],
      rule: ['Watch something happen', 'They have watched no change happen. После watch идёт объект и голый инфинитив.'],
      quiz: [
        ['«Ведь они не видели, как что-то менялось» —', ['Since they have watched no change happen', 'Since they have watched no change to happen', 'Since they have watch no change happen'], 0],
        ['«А я изменилась в месте, которое им не представить» —', ['In a place they cannot picture', 'In a place they cannot pictures', 'In a place what they cannot picture'], 0],
        ['«Чему дома не вполне верят» —', ['Which nobody at home quite believes', 'Which nobody at home quite believe', 'Which nobody in home quite believes'], 0],
      ],
      order: ['Всё то же самое, а я нет.', 'Everything is the same and I am not.'],
      produce: [
        ['Всё то же самое, а я нет.', 'Everything is the same and I am not.', []],
        ['Ведь они не видели, как что-то менялось.', 'Since they have watched no change happen.', []],
        ['И это самая одинокая часть.', 'Which is the loneliest part of it.', []],
      ],
    },
    {
      title: 'Where home is now',
      summary: 'Где теперь дом.',
      topics: [SO, RE, LI],
      dialogue: ['Дом', [
        ['Ben', 'Home is where the paperwork is.', 'Дом там, где документы.'],
        ['Anna', 'Which is a joke that stops being funny.', 'Шутка, которая перестаёт быть смешной.'],
        ['Ben', 'Around the fourth year, usually.', 'Обычно на четвёртый год.'],
        ['Anna', 'When you notice you dream in two languages.', 'Когда замечаешь, что видишь сны на двух языках.'],
        ['Ben', 'And stop needing to choose one.', 'И перестаёшь нуждаться в выборе.'],
      ]],
      words: [
        ['where the paperwork is', 'там, где документы', 'Home is where the paperwork is.'],
        ['stops being funny', 'перестаёт быть смешной', 'Which is a joke that stops being funny.'],
        ['Around the fourth year', 'примерно на четвёртый год', 'Around the fourth year, usually.'],
        ['dream in two languages', 'видеть сны на двух языках', 'When you notice you dream in two languages.'],
        ['stop needing to choose', 'перестать нуждаться в выборе', 'And stop needing to choose one.'],
      ],
      rule: ['Переезд измеряется годами, а не переездом', 'Первый год — бумаги, второй — местные друзья, четвёртый — вопрос о доме перестаёт быть острым.'],
      quiz: [
        ['«Когда замечаешь, что видишь сны на двух языках» —', ['When you notice you dream in two languages', 'When you notice you dream on two languages', 'When you notice do you dream in two languages'], 0],
        ['«Шутка, которая перестаёт быть смешной» —', ['A joke that stops being funny', 'A joke that stops to be funny', 'A joke what stops being funny'], 0],
        ['«И перестаёшь нуждаться в выборе» —', ['And stop needing to choose one', 'And stop need to choose one', 'And stop needing choose one'], 0],
      ],
      order: ['Дом там, где документы.', 'Home is where the paperwork is.'],
      produce: [
        ['Дом там, где документы.', 'Home is where the paperwork is.', []],
        ['Обычно на четвёртый год.', 'Around the fourth year, usually.', []],
        ['Когда замечаешь, что видишь сны на двух языках.', 'When you notice you dream in two languages.', []],
      ],
    },
    {
      checkpoint: true,
      title: 'Проверка: новый в стране',
      summary: 'Шесть фраз без подсказок.',
      topics: [SO, LE, RE, SE],
      produce: [
        ['К этому времени разрешение истекает.', 'By which time the permit expires.', []],
        ['И не даёт истории обрасти подробностями.', 'And stops the story growing legs.', []],
        ['Круг, который каждый проходит один раз.', 'Which is a circle everybody walks once.', []],
        ['И чего никому не удаётся избежать.', 'And which nobody manages to avoid.', []],
        ['А в том, чтобы тебя понимали без усилий.', 'But about being understood without effort.', []],
        ['Ведь они не видели, как что-то менялось.', 'Since they have watched no change happen.', []],
      ],
    },
  ],
}
