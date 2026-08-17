// B2, блок 69 — What we photograph. Что мы снимаем.
//
// Тематический блок: тысячи фото, чужое лицо в кадре, архив, съёмка вместо
// проживания и что останется. Пассив, условия, оценки.

const CU = 'b2-tema-cultura'
const ME = 'b2-tema-medios'
const DA = 'b2-tema-datos'
const RE = 'b2-tema-relaciones'
const LI = 'b2-linkers'

export default {
  slug: 'what-we-photograph',
  title: 'Что мы снимаем',
  subtitle: 'Архивы, чужие лица и память',
  canDo: [
    'обсуждать личный фотоархив',
    'говорить о съёмке других людей',
    'спорить о фото в публичных местах',
    'обсуждать редактирование и правду',
    'объяснять, зачем снимать меньше',
  ],
  lessons: [
    {
      title: 'Forty thousand pictures',
      summary: 'Сорок тысяч снимков.',
      topics: [DA, CU, LI],
      dialogue: ['Архив', [
        ['Anna', 'Forty thousand, of which I have seen nine hundred.', 'Сорок тысяч, из которых я видела девятьсот.'],
        ['Ben', 'Which is what everybody discovers eventually.', 'Что рано или поздно обнаруживает каждый.'],
        ['Anna', 'And which makes the archive a warehouse.', 'И что превращает архив в склад.'],
        ['Ben', 'Rather than anything anybody looks at.', 'А не в то, на что кто-то смотрит.'],
        ['Anna', 'Which twenty printed photographs would fix.', 'Что починили бы двадцать напечатанных фотографий.'],
      ]],
      words: [
        ['of which I have seen', 'из которых я видела', 'Forty thousand, of which I have seen nine hundred.'],
        ['everybody discovers eventually', 'каждый обнаруживает', 'Which is what everybody discovers eventually.'],
        ['makes the archive a warehouse', 'превращает архив в склад', 'And which makes the archive a warehouse.'],
        ['anything anybody looks at', 'то, на что кто-то смотрит', 'Rather than anything anybody looks at.'],
        ['twenty printed photographs', 'двадцать напечатанных фотографий', 'Which twenty printed photographs would fix.'],
      ],
      rule: ['Make something a thing', 'It makes the archive a warehouse. После make идут два существительных без предлога.'],
      quiz: [
        ['«И что превращает архив в склад» —', ['And which makes the archive a warehouse', 'And which makes the archive to a warehouse', 'And which make the archive a warehouse'], 0],
        ['«Сорок тысяч, из которых я видела девятьсот» —', ['Forty thousand, of which I have seen nine hundred', 'Forty thousand, from which I have seen nine hundred', 'Forty thousand, of which I have saw nine hundred'], 0],
        ['«А не в то, на что кто-то смотрит» —', ['Rather than anything anybody looks at', 'Rather than anything anybody looks', 'Rather than anything anybody look at'], 0],
      ],
      order: ['Что рано или поздно обнаруживает каждый.', 'Which is what everybody discovers eventually.'],
      produce: [
        ['Сорок тысяч, из которых я видела девятьсот.', 'Forty thousand, of which I have seen nine hundred.', []],
        ['И что превращает архив в склад.', 'And which makes the archive a warehouse.', []],
        ['Что починили бы двадцать напечатанных фотографий.', 'Which twenty printed photographs would fix.', []],
      ],
    },
    {
      title: 'Somebody else in the frame',
      summary: 'Чужой человек в кадре.',
      topics: [ME, RE, LI],
      dialogue: ['Чужие лица', [
        ['Ben', 'Three strangers are in most of my holiday photos.', 'На большинстве моих отпускных фото трое чужих.'],
        ['Anna', 'Which was never a question until they were posted.', 'Что не было вопросом, пока их не выкладывали.'],
        ['Ben', 'And is now a small legal one, in some countries.', 'А теперь в некоторых странах это маленький юридический вопрос.'],
        ['Anna', 'And a courtesy question everywhere.', 'И вопрос вежливости везде.'],
        ['Ben', 'Which one glance usually answers.', 'На который обычно отвечает один взгляд.'],
      ]],
      words: [
        ['Three strangers are in', 'трое чужих на', 'Three strangers are in most of my holiday photos.'],
        ['until they were posted', 'пока их не выкладывали', 'Which was never a question until they were posted.'],
        ['a small legal one', 'маленький юридический', 'And is now a small legal one, in some countries.'],
        ['a courtesy question', 'вопрос вежливости', 'And a courtesy question everywhere.'],
        ['one glance usually answers', 'отвечает один взгляд', 'Which one glance usually answers.'],
      ],
      rule: ['One как замена существительного', 'A small legal one. Слово one заменяет уже названное существительное.'],
      quiz: [
        ['«А теперь в некоторых странах это маленький юридический вопрос» —', ['And is now a small legal one, in some countries', 'And is now a small legal, in some countries', 'And is now a small legal ones, in some countries'], 0],
        ['«Что не было вопросом, пока их не выкладывали» —', ['Which was never a question until they were posted', 'Which was never a question until they were post', 'Which were never a question until they were posted'], 0],
        ['«На который обычно отвечает один взгляд» —', ['Which one glance usually answers', 'Which one glance usually answer', 'Which one glance usually answers it'], 0],
      ],
      order: ['И вопрос вежливости везде.', 'And a courtesy question everywhere.'],
      produce: [
        ['На большинстве моих отпускных фото трое чужих.', 'Three strangers are in most of my holiday photos.', []],
        ['Что не было вопросом, пока их не выкладывали.', 'Which was never a question until they were posted.', []],
        ['На который обычно отвечает один взгляд.', 'Which one glance usually answers.', []],
      ],
    },
    {
      title: 'Photographing a child',
      summary: 'Снимать ребёнка.',
      topics: [RE, ME, LI],
      dialogue: ['Дети', [
        ['Anna', 'We stopped posting his face at four.', 'Мы перестали выкладывать его лицо в четыре года.'],
        ['Ben', 'Which he could not have consented to.', 'На что он не мог дать согласия.'],
        ['Anna', 'And may object to at seventeen.', 'И против чего может возразить в семнадцать.'],
        ['Ben', 'By which point it cannot be taken back.', 'К этому времени вернуть уже нельзя.'],
        ['Anna', 'Which is the whole reason for the rule.', 'В этом и вся причина правила.'],
      ]],
      words: [
        ['stopped posting his face', 'перестали выкладывать лицо', 'We stopped posting his face at four.'],
        ['could not have consented to', 'не мог дать согласия', 'Which he could not have consented to.'],
        ['may object to at seventeen', 'может возразить в семнадцать', 'And may object to at seventeen.'],
        ['cannot be taken back', 'вернуть нельзя', 'By which point it cannot be taken back.'],
        ['the whole reason for the rule', 'вся причина правила', 'Which is the whole reason for the rule.'],
      ],
      rule: ['Could not have + причастие', 'He could not have consented to it. Форма отрицает возможность в прошлом.'],
      quiz: [
        ['«На что он не мог дать согласия» —', ['Which he could not have consented to', 'Which he could not has consented to', 'Which he could not have consent to'], 0],
        ['«К этому времени вернуть уже нельзя» —', ['By which point it cannot be taken back', 'By which point it cannot be take back', 'By which point it cannot being taken back'], 0],
        ['«Мы перестали выкладывать его лицо в четыре года» —', ['We stopped posting his face at four', 'We stopped to post his face at four', 'We stopped posting his face in four'], 0],
      ],
      order: ['В этом и вся причина правила.', 'Which is the whole reason for the rule.'],
      produce: [
        ['Мы перестали выкладывать его лицо в четыре года.', 'We stopped posting his face at four.', []],
        ['На что он не мог дать согласия.', 'Which he could not have consented to.', []],
        ['К этому времени вернуть уже нельзя.', 'By which point it cannot be taken back.', []],
      ],
    },
    {
      title: 'Editing and honesty',
      summary: 'Обработка и честность.',
      topics: [ME, CU, LI],
      dialogue: ['Обработка', [
        ['Ben', 'The sky was never that colour.', 'Небо никогда не было такого цвета.'],
        ['Anna', 'Which nobody minds in a landscape.', 'На пейзаже это никого не смущает.'],
        ['Ben', 'And everybody minds in a news photograph.', 'И всех смущает на новостном снимке.'],
        ['Anna', 'Which is a line drawn by purpose, not by tools.', 'Границу проводит цель, а не инструменты.'],
        ['Ben', 'And which every editor has to explain, eventually.', 'И которую каждому редактору рано или поздно приходится объяснять.'],
      ]],
      words: [
        ['never that colour', 'никогда такого цвета', 'The sky was never that colour.'],
        ['nobody minds in a landscape', 'на пейзаже никого не смущает', 'Which nobody minds in a landscape.'],
        ['in a news photograph', 'на новостном снимке', 'And everybody minds in a news photograph.'],
        ['drawn by purpose, not by tools', 'проводится целью, а не инструментами', 'A line drawn by purpose, not by tools.'],
        ['has to explain, eventually', 'приходится объяснять', 'Which every editor has to explain, eventually.'],
      ],
      rule: ['Mind без предлога', 'Nobody minds it in a landscape. Глагол mind не требует предлога перед дополнением.'],
      quiz: [
        ['«На пейзаже это никого не смущает» —', ['Which nobody minds in a landscape', 'Which nobody minds about in a landscape', 'Which nobody mind in a landscape'], 0],
        ['«Границу проводит цель, а не инструменты» —', ['A line drawn by purpose, not by tools', 'A line drawing by purpose, not by tools', 'A line drawn from purpose, not by tools'], 0],
        ['«И которую каждому редактору рано или поздно приходится объяснять» —', ['Which every editor has to explain, eventually', 'Which every editor have to explain, eventually', 'Which every editors has to explain, eventually'], 0],
      ],
      order: ['Небо никогда не было такого цвета.', 'The sky was never that colour.'],
      produce: [
        ['Небо никогда не было такого цвета.', 'The sky was never that colour.', []],
        ['И всех смущает на новостном снимке.', 'And everybody minds in a news photograph.', []],
        ['Границу проводит цель, а не инструменты.', 'A line drawn by purpose, not by tools.', []],
      ],
    },
    {
      title: 'Watching through a screen',
      summary: 'Смотреть через экран.',
      topics: [CU, RE, LI],
      dialogue: ['Концерт', [
        ['Anna', 'Half the room watched it on their phones.', 'Ползала смотрели это в телефонах.'],
        ['Ben', 'Which the research says weakens the memory.', 'Что, по исследованиям, ослабляет память.'],
        ['Anna', 'Of the very thing they were recording.', 'Именно о том, что они снимали.'],
        ['Ben', 'Which is either ironic or tragic.', 'Это либо иронично, либо трагично.'],
        ['Anna', 'Depending on how the evening ended.', 'В зависимости от того, чем кончился вечер.'],
      ]],
      words: [
        ['watched it on their phones', 'смотрели в телефонах', 'Half the room watched it on their phones.'],
        ['weakens the memory', 'ослабляет память', 'Which the research says weakens the memory.'],
        ['the very thing', 'именно то', 'Of the very thing they were recording.'],
        ['either ironic or tragic', 'либо иронично, либо трагично', 'Which is either ironic or tragic.'],
        ['how the evening ended', 'чем кончился вечер', 'Depending on how the evening ended.'],
      ],
      rule: ['The very thing — усиление', 'The very thing they were recording. Слово very перед существительным значит «именно тот».'],
      quiz: [
        ['«Именно о том, что они снимали» —', ['Of the very thing they were recording', 'Of the very thing they was recording', 'Of the very thing what they were recording'], 0],
        ['«Что, по исследованиям, ослабляет память» —', ['Which the research says weakens the memory', 'Which the research says weaken the memory', 'Which the research say weakens the memory'], 0],
        ['«В зависимости от того, чем кончился вечер» —', ['Depending on how the evening ended', 'Depending on how did the evening end', 'Depending of how the evening ended'], 0],
      ],
      order: ['Ползала смотрели это в телефонах.', 'Half the room watched it on their phones.'],
      produce: [
        ['Ползала смотрели это в телефонах.', 'Half the room watched it on their phones.', []],
        ['Именно о том, что они снимали.', 'Of the very thing they were recording.', []],
        ['В зависимости от того, чем кончился вечер.', 'Depending on how the evening ended.', []],
      ],
    },
    {
      title: 'The box in the cupboard',
      summary: 'Коробка в шкафу.',
      topics: [RE, CU, LI],
      dialogue: ['Старые фото', [
        ['Ben', 'Two hundred photographs, in one shoebox.', 'Двести фотографий, в одной обувной коробке.'],
        ['Anna', 'Which is everything my grandmother kept.', 'Всё, что сохранила моя бабушка.'],
        ['Ben', 'And which we have looked at every year.', 'И что мы пересматриваем каждый год.'],
        ['Anna', 'Because two hundred can be finished.', 'Потому что двести можно досмотреть до конца.'],
        ['Ben', 'Which forty thousand never can.', 'Чего с сорока тысячами не выйдет.'],
      ]],
      words: [
        ['in one shoebox', 'в одной обувной коробке', 'Two hundred photographs, in one shoebox.'],
        ['everything my grandmother kept', 'всё, что сохранила бабушка', 'Which is everything my grandmother kept.'],
        ['we have looked at every year', 'мы пересматриваем каждый год', 'And which we have looked at every year.'],
        ['can be finished', 'можно досмотреть', 'Because two hundred can be finished.'],
        ['forty thousand never can', 'с сорока тысячами не выйдет', 'Which forty thousand never can.'],
      ],
      rule: ['Модальный пассив в возможности', 'Two hundred can be finished. Форма показывает, что действие выполнимо.'],
      quiz: [
        ['«Потому что двести можно досмотреть до конца» —', ['Because two hundred can be finished', 'Because two hundred can be finish', 'Because two hundreds can be finished'], 0],
        ['«И что мы пересматриваем каждый год» —', ['And which we have looked at every year', 'And which we have looked every year', 'And which we have look at every year'], 0],
        ['«Всё, что сохранила моя бабушка» —', ['Everything my grandmother kept', 'Everything my grandmother keep', 'Everything what my grandmother kept'], 0],
      ],
      order: ['Двести фотографий, в одной обувной коробке.', 'Two hundred photographs, in one shoebox.'],
      produce: [
        ['Двести фотографий, в одной обувной коробке.', 'Two hundred photographs, in one shoebox.', []],
        ['Потому что двести можно досмотреть до конца.', 'Because two hundred can be finished.', []],
        ['Чего с сорока тысячами не выйдет.', 'Which forty thousand never can.', []],
      ],
    },
    {
      title: 'The picture you did not take',
      summary: 'Снимок, который вы не сделали.',
      topics: [CU, RE, LI],
      dialogue: ['Не снял', [
        ['Anna', 'I put the camera down and just watched.', 'Я опустила камеру и просто смотрела.'],
        ['Ben', 'Which I remember better than any photograph.', 'Что я помню лучше любой фотографии.'],
        ['Anna', 'And cannot show to anybody, ever.', 'И никому и никогда не смогу показать.'],
        ['Ben', 'Which is the trade, stated plainly.', 'Вот обмен, если сказать прямо.'],
        ['Anna', 'And is worth making, about half the time.', 'И примерно в половине случаев его стоит совершать.'],
      ]],
      words: [
        ['put the camera down', 'опустила камеру', 'I put the camera down and just watched.'],
        ['better than any photograph', 'лучше любой фотографии', 'Which I remember better than any photograph.'],
        ['cannot show to anybody', 'никому не смогу показать', 'And cannot show to anybody, ever.'],
        ['the trade, stated plainly', 'обмен, если сказать прямо', 'Which is the trade, stated plainly.'],
        ['worth making', 'стоит совершать', 'And is worth making, about half the time.'],
      ],
      rule: ['Put something down', 'I put the camera down. Наречие down стоит после дополнения.'],
      quiz: [
        ['«Я опустила камеру и просто смотрела» —', ['I put the camera down and just watched', 'I put down the camera and just watch', 'I putted the camera down and just watched'], 0],
        ['«И примерно в половине случаев его стоит совершать» —', ['And is worth making, about half the time', 'And is worth to make, about half the time', 'And is worth make, about half the time'], 0],
        ['«Что я помню лучше любой фотографии» —', ['Which I remember better than any photograph', 'Which I remember better that any photograph', 'Which I remembers better than any photograph'], 0],
      ],
      order: ['Вот обмен, если сказать прямо.', 'Which is the trade, stated plainly.'],
      produce: [
        ['Я опустила камеру и просто смотрела.', 'I put the camera down and just watched.', []],
        ['Что я помню лучше любой фотографии.', 'Which I remember better than any photograph.', []],
        ['И примерно в половине случаев его стоит совершать.', 'And is worth making, about half the time.', []],
      ],
    },
    {
      title: 'What survives you',
      summary: 'Что останется после.',
      topics: [DA, RE, LI],
      dialogue: ['Итог', [
        ['Ben', 'Nobody inherits a password, in practice.', 'На практике пароль по наследству не переходит.'],
        ['Anna', 'Which makes the print the durable format.', 'Что делает отпечаток долговечным форматом.'],
        ['Ben', 'Absurdly, in twenty twenty six.', 'До абсурда, в две тысячи двадцать шестом.'],
        ['Anna', 'And is why I print twenty a year.', 'Поэтому я и печатаю двадцать в год.'],
        ['Ben', 'Which takes an hour and outlives everything.', 'На это уходит час, и это переживёт всё.'],
      ]],
      words: [
        ['inherits a password', 'наследует пароль', 'Nobody inherits a password, in practice.'],
        ['the durable format', 'долговечный формат', 'Which makes the print the durable format.'],
        ['Absurdly', 'до абсурда', 'Absurdly, in twenty twenty six.'],
        ['print twenty a year', 'печатаю двадцать в год', 'And is why I print twenty a year.'],
        ['outlives everything', 'переживёт всё', 'Which takes an hour and outlives everything.'],
      ],
      rule: ['Снимок хранится там, где его видно', 'Двадцать напечатанных фотографий в год делают для памяти больше, чем сорок тысяч в облаке.'],
      quiz: [
        ['«Что делает отпечаток долговечным форматом» —', ['Which makes the print the durable format', 'Which makes the print to the durable format', 'Which make the print the durable format'], 0],
        ['«На практике пароль по наследству не переходит» —', ['Nobody inherits a password, in practice', 'Nobody inherit a password, in practice', 'Nobody inherits a password, on practice'], 0],
        ['«На это уходит час, и это переживёт всё» —', ['Which takes an hour and outlives everything', 'Which take an hour and outlives everything', 'Which takes an hour and outlive everything'], 0],
      ],
      order: ['Поэтому я и печатаю двадцать в год.', 'And is why I print twenty a year.'],
      produce: [
        ['На практике пароль по наследству не переходит.', 'Nobody inherits a password, in practice.', []],
        ['Что делает отпечаток долговечным форматом.', 'Which makes the print the durable format.', []],
        ['На это уходит час, и это переживёт всё.', 'Which takes an hour and outlives everything.', []],
      ],
    },
    {
      checkpoint: true,
      title: 'Проверка: что мы снимаем',
      summary: 'Шесть фраз без подсказок.',
      topics: [CU, ME, DA, RE],
      produce: [
        ['И что превращает архив в склад.', 'And which makes the archive a warehouse.', []],
        ['Что не было вопросом, пока их не выкладывали.', 'Which was never a question until they were posted.', []],
        ['На что он не мог дать согласия.', 'Which he could not have consented to.', []],
        ['Границу проводит цель, а не инструменты.', 'A line drawn by purpose, not by tools.', []],
        ['Именно о том, что они снимали.', 'Of the very thing they were recording.', []],
        ['Потому что двести можно досмотреть до конца.', 'Because two hundred can be finished.', []],
      ],
    },
  ],
}
