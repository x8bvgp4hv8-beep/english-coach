// B2, блок 59 — Office politics. Офисная политика.
//
// Тематический блок: чужие заслуги, союзники, повышение, увольнения и как
// говорить о власти на работе. Косвенная речь, осторожные формулы, пассив.

const CA = 'b1-tema-carrera'
const TE = 'b2-tema-equipos'
const PS = 'b2-tema-psicologia'
const NE = 'b2-tema-negociacion'
const LI = 'b2-linkers'

export default {
  slug: 'office-politics',
  title: 'Офисная политика',
  subtitle: 'Заслуги, союзники, повышения и сокращения',
  canDo: [
    'возвращать себе авторство идеи',
    'находить союзников без интриг',
    'говорить о повышении прямо',
    'вести себя во время сокращений',
    'обсуждать власть на работе спокойно',
  ],
  lessons: [
    {
      title: 'Somebody else presented your idea',
      summary: 'Вашу идею представил другой.',
      topics: [CA, TE, LI],
      dialogue: ['Авторство', [
        ['Anna', 'He presented it as his own, on Tuesday.', 'Во вторник он представил это как своё.'],
        ['Ben', 'Which the email thread disproves.', 'Что опровергает переписка.'],
        ['Anna', 'Sent to four people in March.', 'Отправленная четверым в марте.'],
        ['Ben', 'So I said, as I wrote in March.', 'Поэтому я сказала: как я писала в марте.'],
        ['Anna', 'Which ends it, without naming anybody.', 'Что закрывает вопрос, никого не называя.'],
      ]],
      words: [
        ['presented it as his own', 'представил как своё', 'He presented it as his own, on Tuesday.'],
        ['the email thread disproves', 'переписка опровергает', 'Which the email thread disproves.'],
        ['Sent to four people', 'отправленная четверым', 'Sent to four people in March.'],
        ['as I wrote in March', 'как я писала в марте', 'So I said, as I wrote in March.'],
        ['without naming anybody', 'никого не называя', 'Which ends it, without naming anybody.'],
      ],
      rule: ['As I wrote — вежливое возвращение авторства', 'As I wrote in March. Ссылка на дату закрывает спор без обвинения.'],
      quiz: [
        ['«Что опровергает переписка» —', ['Which the email thread disproves', 'Which the email thread disprove', 'Which the email thread disproves it'], 0],
        ['«Отправленная четверым в марте» —', ['Sent to four people in March', 'Sending to four people in March', 'Sent for four people in March'], 0],
        ['«Что закрывает вопрос, никого не называя» —', ['Which ends it, without naming anybody', 'Which ends it, without name anybody', 'Which end it, without naming anybody'], 0],
      ],
      order: ['Во вторник он представил это как своё.', 'He presented it as his own, on Tuesday.'],
      produce: [
        ['Во вторник он представил это как своё.', 'He presented it as his own, on Tuesday.', []],
        ['Отправленная четверым в марте.', 'Sent to four people in March.', []],
        ['Что закрывает вопрос, никого не называя.', 'Which ends it, without naming anybody.', []],
      ],
    },
    {
      title: 'Who decides in reality',
      summary: 'Кто решает на самом деле.',
      topics: [TE, CA, LI],
      dialogue: ['Схема', [
        ['Ben', 'The chart says one thing and the room says another.', 'Схема говорит одно, а комната другое.'],
        ['Anna', 'Which everybody learns in the first month.', 'Что все узнают в первый же месяц.'],
        ['Ben', 'Or in the third year, painfully.', 'Или на третий год, болезненно.'],
        ['Anna', 'Since nobody writes the real map down.', 'Ведь настоящую карту никто не записывает.'],
        ['Ben', 'And it changes when two people leave.', 'И она меняется, когда уходят двое.'],
      ]],
      words: [
        ['The chart says one thing', 'схема говорит одно', 'The chart says one thing and the room says another.'],
        ['the room says another', 'комната говорит другое', 'And the room says another.'],
        ['in the first month', 'в первый месяц', 'Which everybody learns in the first month.'],
        ['the real map', 'настоящая карта', 'Since nobody writes the real map down.'],
        ['when two people leave', 'когда уходят двое', 'And it changes when two people leave.'],
      ],
      rule: ['One thing and another', 'One thing and another. Пара местоимений противопоставляет два утверждения без повтора.'],
      quiz: [
        ['«Схема говорит одно, а комната другое» —', ['The chart says one thing and the room says another', 'The chart says one thing and the room says other', 'The chart say one thing and the room says another'], 0],
        ['«Ведь настоящую карту никто не записывает» —', ['Since nobody writes the real map down', 'Since nobody write the real map down', 'Since nobody writes down the real map of'], 0],
        ['«И она меняется, когда уходят двое» —', ['And it changes when two people leave', 'And it change when two people leave', 'And it changes when two people leaves'], 0],
      ],
      order: ['Или на третий год, болезненно.', 'Or in the third year, painfully.'],
      produce: [
        ['Схема говорит одно, а комната другое.', 'The chart says one thing and the room says another.', []],
        ['Что все узнают в первый же месяц.', 'Which everybody learns in the first month.', []],
        ['Ведь настоящую карту никто не записывает.', 'Since nobody writes the real map down.', []],
      ],
    },
    {
      title: 'Allies, not alliances',
      summary: 'Союзники, а не союзы.',
      topics: [TE, PS, LI],
      dialogue: ['Союзники', [
        ['Anna', 'I help two people whose work I respect.', 'Я помогаю двоим, чью работу уважаю.'],
        ['Ben', 'Which is not a faction, and works better.', 'Это не фракция, и работает лучше.'],
        ['Anna', 'Since factions lose, eventually and together.', 'Ведь фракции в итоге проигрывают, все разом.'],
        ['Ben', 'Whereas a favour is remembered singly.', 'Тогда как услугу помнят поимённо.'],
        ['Anna', 'And is repaid four years later.', 'И возвращают четыре года спустя.'],
      ]],
      words: [
        ['whose work I respect', 'чью работу уважаю', 'I help two people whose work I respect.'],
        ['not a faction', 'не фракция', 'Which is not a faction, and works better.'],
        ['eventually and together', 'в итоге и все разом', 'Since factions lose, eventually and together.'],
        ['remembered singly', 'помнят поимённо', 'Whereas a favour is remembered singly.'],
        ['repaid four years later', 'возвращают четыре года спустя', 'And is repaid four years later.'],
      ],
      rule: ['Whose внутри определения', 'People whose work I respect. Местоимение указывает на принадлежность и стоит перед существительным.'],
      quiz: [
        ['«Я помогаю двоим, чью работу уважаю» —', ['I help two people whose work I respect', 'I help two people which work I respect', 'I help two people whose work I respects'], 0],
        ['«Тогда как услугу помнят поимённо» —', ['Whereas a favour is remembered singly', 'Whereas a favour is remember singly', 'Whereas a favour is remembered single'], 0],
        ['«И возвращают четыре года спустя» —', ['And is repaid four years later', 'And is repay four years later', 'And is repaid four year later'], 0],
      ],
      order: ['Это не фракция, и работает лучше.', 'Which is not a faction, and works better.'],
      produce: [
        ['Я помогаю двоим, чью работу уважаю.', 'I help two people whose work I respect.', []],
        ['Ведь фракции в итоге проигрывают, все разом.', 'Since factions lose, eventually and together.', []],
        ['И возвращают четыре года спустя.', 'And is repaid four years later.', []],
      ],
    },
    {
      title: 'Asking for the promotion',
      summary: 'Попросить повышение.',
      topics: [NE, CA, LI],
      dialogue: ['Повышение', [
        ['Ben', 'I asked what the gap was, exactly.', 'Я спросил, в чём именно разрыв.'],
        ['Anna', 'Which forces a list, or an apology.', 'Что вынуждает дать список или извиниться.'],
        ['Ben', 'And either one is useful.', 'И полезно и то и другое.'],
        ['Anna', 'Since the vague no cannot be worked on.', 'Ведь над размытым «нет» работать нельзя.'],
        ['Ben', 'And is designed to be unanswerable.', 'И оно на то и рассчитано.'],
      ]],
      words: [
        ['what the gap was, exactly', 'в чём именно разрыв', 'I asked what the gap was, exactly.'],
        ['forces a list, or an apology', 'вынуждает список или извинение', 'Which forces a list, or an apology.'],
        ['either one is useful', 'полезно и то и другое', 'And either one is useful.'],
        ['the vague no', 'размытое «нет»', 'Since the vague no cannot be worked on.'],
        ['designed to be unanswerable', 'рассчитано на безответность', 'And is designed to be unanswerable.'],
      ],
      rule: ['Work on something в пассиве', 'It cannot be worked on. Предлог on остаётся после причастия.'],
      quiz: [
        ['«Ведь над размытым «нет» работать нельзя» —', ['Since the vague no cannot be worked on', 'Since the vague no cannot be worked', 'Since the vague no cannot be work on'], 0],
        ['«Я спросил, в чём именно разрыв» —', ['I asked what the gap was, exactly', 'I asked what was the gap, exactly', 'I asked what the gap is, exactly then'], 0],
        ['«Что вынуждает дать список или извиниться» —', ['Which forces a list, or an apology', 'Which force a list, or an apology', 'Which forces a list, or a apology'], 0],
      ],
      order: ['И полезно и то и другое.', 'And either one is useful.'],
      produce: [
        ['Я спросил, в чём именно разрыв.', 'I asked what the gap was, exactly.', []],
        ['Что вынуждает дать список или извиниться.', 'Which forces a list, or an apology.', []],
        ['Ведь над размытым «нет» работать нельзя.', 'Since the vague no cannot be worked on.', []],
      ],
    },
    {
      title: 'The restructure',
      summary: 'Реорганизация.',
      topics: [CA, TE, LI],
      dialogue: ['Сокращения', [
        ['Anna', 'Nine roles are being reviewed, they said.', 'Сказали, что девять позиций пересматриваются.'],
        ['Ben', 'Which is the word used for cut.', 'Слово, которым называют сокращение.'],
        ['Anna', 'And everybody in the room knew it.', 'И все в комнате это знали.'],
        ['Ben', 'Which is why the language matters so little.', 'Поэтому формулировки так мало значат.'],
        ['Anna', 'And the timeline matters so much.', 'А сроки значат так много.'],
      ]],
      words: [
        ['are being reviewed', 'пересматриваются', 'Nine roles are being reviewed, they said.'],
        ['the word used for cut', 'слово вместо «сокращение»', 'Which is the word used for cut.'],
        ['everybody in the room knew', 'все в комнате знали', 'And everybody in the room knew it.'],
        ['the language matters so little', 'формулировки мало значат', 'Which is why the language matters so little.'],
        ['the timeline matters so much', 'сроки значат так много', 'And the timeline matters so much.'],
      ],
      rule: ['Смягчающий пассив в объявлениях', 'Nine roles are being reviewed. Форма прячет исполнителя и смягчает решение, которое уже принято.'],
      quiz: [
        ['«Сказали, что девять позиций пересматриваются» —', ['Nine roles are being reviewed, they said', 'Nine roles are been reviewed, they said', 'Nine roles are being review, they said'], 0],
        ['«Поэтому формулировки так мало значат» —', ['Which is why the language matters so little', 'Which is why the language matter so little', 'Which is why the language matters so few'], 0],
        ['«И все в комнате это знали» —', ['And everybody in the room knew it', 'And everybody in the room know it', 'And everybody in the room knew them'], 0],
      ],
      order: ['А сроки значат так много.', 'And the timeline matters so much.'],
      produce: [
        ['Сказали, что девять позиций пересматриваются.', 'Nine roles are being reviewed, they said.', []],
        ['Слово, которым называют сокращение.', 'Which is the word used for cut.', []],
        ['Поэтому формулировки так мало значат.', 'Which is why the language matters so little.', []],
      ],
    },
    {
      title: 'The colleague who is struggling',
      summary: 'Коллега, которому тяжело.',
      topics: [PS, TE, LI],
      dialogue: ['Помощь', [
        ['Ben', 'He has been late with everything since May.', 'Он со всем опаздывает с мая.'],
        ['Anna', 'Which the team has quietly covered.', 'Что команда тихо покрывала.'],
        ['Ben', 'And which helps him for about a month.', 'И что помогает ему примерно месяц.'],
        ['Anna', 'After which it becomes a trap for both.', 'После чего становится ловушкой для обоих.'],
        ['Ben', 'So somebody has to say it, kindly.', 'Значит, кто-то должен сказать это, по-доброму.'],
      ]],
      words: [
        ['late with everything', 'опаздывает со всем', 'He has been late with everything since May.'],
        ['the team has covered', 'команда покрывала', 'Which the team has quietly covered.'],
        ['helps him for about a month', 'помогает примерно месяц', 'And which helps him for about a month.'],
        ['a trap for both', 'ловушка для обоих', 'After which it becomes a trap for both.'],
        ['say it, kindly', 'сказать по-доброму', 'So somebody has to say it, kindly.'],
      ],
      rule: ['After which — связка событий', 'After which it becomes a trap. Оборот присоединяет следствие к названному сроку.'],
      quiz: [
        ['«После чего становится ловушкой для обоих» —', ['After which it becomes a trap for both', 'After which it become a trap for both', 'After what it becomes a trap for both'], 0],
        ['«Он со всем опаздывает с мая» —', ['He has been late with everything since May', 'He has been late with everything from May', 'He is late with everything since May'], 0],
        ['«Значит, кто-то должен сказать это, по-доброму» —', ['So somebody has to say it, kindly', 'So somebody have to say it, kindly', 'So somebody has to say it, kind'], 0],
      ],
      order: ['Что команда тихо покрывала.', 'Which the team has quietly covered.'],
      produce: [
        ['Он со всем опаздывает с мая.', 'He has been late with everything since May.', []],
        ['Что команда тихо покрывала.', 'Which the team has quietly covered.', []],
        ['После чего становится ловушкой для обоих.', 'After which it becomes a trap for both.', []],
      ],
    },
    {
      title: 'Leaving well',
      summary: 'Уйти достойно.',
      topics: [CA, NE, LI],
      dialogue: ['Уход', [
        ['Anna', 'I said nothing about why, to anybody.', 'Я никому ничего не сказала про причину.'],
        ['Ben', 'Which cost me an evening of relief.', 'Что стоило мне вечера облегчения.'],
        ['Anna', 'And bought a reference for eleven years.', 'И купило рекомендацию на одиннадцать лет.'],
        ['Ben', 'Which is an exchange rate worth knowing.', 'Курс обмена, который стоит знать.'],
        ['Anna', 'Especially in a small industry.', 'Особенно в небольшой отрасли.'],
      ]],
      words: [
        ['said nothing about why', 'ничего не сказала про причину', 'I said nothing about why, to anybody.'],
        ['an evening of relief', 'вечер облегчения', 'Which cost me an evening of relief.'],
        ['bought a reference', 'купило рекомендацию', 'And bought a reference for eleven years.'],
        ['an exchange rate worth knowing', 'курс обмена, который стоит знать', 'Which is an exchange rate worth knowing.'],
        ['in a small industry', 'в небольшой отрасли', 'Especially in a small industry.'],
      ],
      rule: ['Say nothing about', 'I said nothing about why. Предлог about вводит тему, о которой промолчали.'],
      quiz: [
        ['«Я никому ничего не сказала про причину» —', ['I said nothing about why, to anybody', 'I said nothing about why, to nobody', 'I said nothing about why, for anybody'], 0],
        ['«Курс обмена, который стоит знать» —', ['An exchange rate worth knowing', 'An exchange rate worth to know', 'An exchange rate worth know'], 0],
        ['«И купило рекомендацию на одиннадцать лет» —', ['And bought a reference for eleven years', 'And buyed a reference for eleven years', 'And bought a reference during eleven years'], 0],
      ],
      order: ['Особенно в небольшой отрасли.', 'Especially in a small industry.'],
      produce: [
        ['Я никому ничего не сказала про причину.', 'I said nothing about why, to anybody.', []],
        ['И купило рекомендацию на одиннадцать лет.', 'And bought a reference for eleven years.', []],
        ['Курс обмена, который стоит знать.', 'Which is an exchange rate worth knowing.', []],
      ],
    },
    {
      title: 'What politics really is',
      summary: 'Что такое офисная политика.',
      topics: [TE, PS, LI],
      dialogue: ['Итог', [
        ['Ben', 'Politics is what happens where rules run out.', 'Политика — это то, что начинается, где кончаются правила.'],
        ['Anna', 'Which is most of any working week.', 'А это большая часть любой рабочей недели.'],
        ['Ben', 'And is not automatically dirty.', 'И это не обязательно грязно.'],
        ['Anna', 'Only unwritten, which frightens people.', 'Просто неписаное, что людей и пугает.'],
        ['Ben', 'Reasonably, until they learn to read it.', 'И справедливо, пока они не научатся это читать.'],
      ]],
      words: [
        ['where rules run out', 'где кончаются правила', 'Politics is what happens where rules run out.'],
        ['most of any working week', 'большая часть рабочей недели', 'Which is most of any working week.'],
        ['not automatically dirty', 'не обязательно грязно', 'And is not automatically dirty.'],
        ['Only unwritten', 'просто неписаное', 'Only unwritten, which frightens people.'],
        ['learn to read it', 'научиться это читать', 'Until they learn to read it.'],
      ],
      rule: ['Офисная политика — это неписаные правила', 'Дата в переписке и один прямой вопрос делают неписаное видимым и потому управляемым.'],
      quiz: [
        ['«Политика — это то, что начинается, где кончаются правила» —', ['Politics is what happens where rules run out', 'Politics is that happens where rules run out', 'Politics is what happen where rules run out'], 0],
        ['«Просто неписаное, что людей и пугает» —', ['Only unwritten, which frightens people', 'Only unwritten, which frighten people', 'Only unwriting, which frightens people'], 0],
        ['«И справедливо, пока они не научатся это читать» —', ['Until they learn to read it', 'Until they learn reading it', 'Until they will learn to read it'], 0],
      ],
      order: ['А это большая часть любой рабочей недели.', 'Which is most of any working week.'],
      produce: [
        ['Политика — это то, что начинается, где кончаются правила.', 'Politics is what happens where rules run out.', []],
        ['И это не обязательно грязно.', 'And is not automatically dirty.', []],
        ['Просто неписаное, что людей и пугает.', 'Only unwritten, which frightens people.', []],
      ],
    },
    {
      checkpoint: true,
      title: 'Проверка: офисная политика',
      summary: 'Шесть фраз без подсказок.',
      topics: [CA, TE, PS, NE],
      produce: [
        ['Что закрывает вопрос, никого не называя.', 'Which ends it, without naming anybody.', []],
        ['Схема говорит одно, а комната другое.', 'The chart says one thing and the room says another.', []],
        ['Я помогаю двоим, чью работу уважаю.', 'I help two people whose work I respect.', []],
        ['Ведь над размытым «нет» работать нельзя.', 'Since the vague no cannot be worked on.', []],
        ['Сказали, что девять позиций пересматриваются.', 'Nine roles are being reviewed, they said.', []],
        ['После чего становится ловушкой для обоих.', 'After which it becomes a trap for both.', []],
      ],
    },
  ],
}
