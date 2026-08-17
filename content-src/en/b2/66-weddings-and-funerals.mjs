// B2, блок 66 — Weddings and funerals. Свадьбы и похороны.
//
// Тематический блок: обряды, гости, речи, деньги на праздник и как вести
// себя в чужой традиции. Осторожные формулы, косвенная речь, вежливость.

const CU = 'b2-tema-cultura'
const RE = 'b2-tema-relaciones'
const SO = 'b2-tema-sociedad'
const RI = 'b2-tema-riesgo'
const LI = 'b2-linkers'

export default {
  slug: 'weddings-and-funerals',
  title: 'Свадьбы и похороны',
  subtitle: 'Обряды, гости, речи и деньги',
  canDo: [
    'вести себя в чужом обряде',
    'говорить слова соболезнования',
    'обсуждать бюджет праздника',
    'произносить короткую речь',
    'объяснять свои традиции другим',
  ],
  lessons: [
    {
      title: 'What to do with your hands',
      summary: 'Что делать с руками.',
      topics: [CU, LI, SO],
      dialogue: ['Обряд', [
        ['Anna', 'I copied the person next to me.', 'Я повторяла за соседом.'],
        ['Ben', 'Which is the whole strategy, everywhere.', 'Везде это и есть вся стратегия.'],
        ['Anna', 'And is never considered rude.', 'И это никогда не считается невежливым.'],
        ['Ben', 'Provided you copy half a second late.', 'При условии, что повторяешь на полсекунды позже.'],
        ['Anna', 'Which reads as respect, not mockery.', 'Что читается как уважение, а не насмешка.'],
      ]],
      words: [
        ['copied the person next to me', 'повторяла за соседом', 'I copied the person next to me.'],
        ['the whole strategy', 'вся стратегия', 'Which is the whole strategy, everywhere.'],
        ['never considered rude', 'не считается невежливым', 'And is never considered rude.'],
        ['half a second late', 'на полсекунды позже', 'Provided you copy half a second late.'],
        ['reads as respect', 'читается как уважение', 'Which reads as respect, not mockery.'],
      ],
      rule: ['Be considered + прилагательное', 'It is never considered rude. После consider в пассиве прилагательное идёт без as.'],
      quiz: [
        ['«И это никогда не считается невежливым» —', ['And is never considered rude', 'And is never considered as rude', 'And is never consider rude'], 0],
        ['«При условии, что повторяешь на полсекунды позже» —', ['Provided you copy half a second late', 'Provided you copy half a second lately', 'Provided you will copy half a second late'], 0],
        ['«Что читается как уважение, а не насмешка» —', ['Which reads as respect, not mockery', 'Which read as respect, not mockery', 'Which reads like respect of, not mockery'], 0],
      ],
      order: ['Я повторяла за соседом.', 'I copied the person next to me.'],
      produce: [
        ['Я повторяла за соседом.', 'I copied the person next to me.', []],
        ['И это никогда не считается невежливым.', 'And is never considered rude.', []],
        ['Что читается как уважение, а не насмешка.', 'Which reads as respect, not mockery.', []],
      ],
    },
    {
      title: 'The cost of a wedding',
      summary: 'Цена свадьбы.',
      topics: [RI, RE, LI],
      dialogue: ['Бюджет', [
        ['Ben', 'A year of savings, for one afternoon.', 'Год накоплений, ради одного дня.'],
        ['Anna', 'Which is either mad or exactly right.', 'Это либо безумие, либо ровно то, что нужно.'],
        ['Ben', 'Depending on who is paying for it.', 'В зависимости от того, кто платит.'],
        ['Anna', 'And on whether they expect anything back.', 'И ждут ли они чего-то взамен.'],
        ['Ben', 'Which is the part nobody negotiates.', 'Именно об этом никто не договаривается.'],
      ]],
      words: [
        ['A year of savings', 'год накоплений', 'A year of savings, for one afternoon.'],
        ['either mad or exactly right', 'либо безумие, либо ровно то, что нужно', 'Which is either mad or exactly right.'],
        ['who is paying for it', 'кто платит', 'Depending on who is paying for it.'],
        ['expect anything back', 'ждут чего-то взамен', 'And on whether they expect anything back.'],
        ['nobody negotiates', 'никто не договаривается', 'Which is the part nobody negotiates.'],
      ],
      rule: ['On whether — предлог перед придаточным', 'And on whether they expect anything back. Предлог сохраняется перед whether.'],
      quiz: [
        ['«И ждут ли они чего-то взамен» —', ['And on whether they expect anything back', 'And on whether do they expect anything back', 'And on if they expect anything back'], 0],
        ['«В зависимости от того, кто платит» —', ['Depending on who is paying for it', 'Depending on who is paying it', 'Depending of who is paying for it'], 0],
        ['«Именно об этом никто не договаривается» —', ['Which is the part nobody negotiates', 'Which is the part nobody negotiate', 'Which is the part what nobody negotiates'], 0],
      ],
      order: ['Год накоплений, ради одного дня.', 'A year of savings, for one afternoon.'],
      produce: [
        ['Год накоплений, ради одного дня.', 'A year of savings, for one afternoon.', []],
        ['В зависимости от того, кто платит.', 'Depending on who is paying for it.', []],
        ['И ждут ли они чего-то взамен.', 'And on whether they expect anything back.', []],
      ],
    },
    {
      title: 'The guest list',
      summary: 'Список гостей.',
      topics: [RE, SO, LI],
      dialogue: ['Гости', [
        ['Anna', 'Two names caused four months of trouble.', 'Два имени стоили четырёх месяцев мучений.'],
        ['Ben', 'Which every wedding has, in some form.', 'Что в той или иной форме есть на каждой свадьбе.'],
        ['Anna', 'And which is never about the wedding.', 'И что никогда не про свадьбу.'],
        ['Ben', 'But about something from nineteen ninety four.', 'А про что-то из девяносто четвёртого.'],
        ['Anna', 'Which nobody involved will explain.', 'Чего никто из причастных не объяснит.'],
      ]],
      words: [
        ['caused four months of trouble', 'стоили четырёх месяцев мучений', 'Two names caused four months of trouble.'],
        ['in some form', 'в той или иной форме', 'Which every wedding has, in some form.'],
        ['never about the wedding', 'никогда не про свадьбу', 'And which is never about the wedding.'],
        ['from nineteen ninety four', 'из девяносто четвёртого', 'But about something from nineteen ninety four.'],
        ['nobody involved will explain', 'никто из причастных не объяснит', 'Which nobody involved will explain.'],
      ],
      rule: ['Nobody involved — определение после местоимения', 'Nobody involved will explain it. Причастие стоит после неопределённого местоимения.'],
      quiz: [
        ['«Чего никто из причастных не объяснит» —', ['Which nobody involved will explain', 'Which nobody involving will explain', 'Which nobody involved will explains'], 0],
        ['«Два имени стоили четырёх месяцев мучений» —', ['Two names caused four months of trouble', 'Two names caused four month of trouble', 'Two names cause four months of trouble'], 0],
        ['«Что в той или иной форме есть на каждой свадьбе» —', ['Which every wedding has, in some form', 'Which every wedding have, in some form', 'Which every weddings has, in some form'], 0],
      ],
      order: ['А про что-то из девяносто четвёртого.', 'But about something from nineteen ninety four.'],
      produce: [
        ['Два имени стоили четырёх месяцев мучений.', 'Two names caused four months of trouble.', []],
        ['И что никогда не про свадьбу.', 'And which is never about the wedding.', []],
        ['Чего никто из причастных не объяснит.', 'Which nobody involved will explain.', []],
      ],
    },
    {
      title: 'Two minutes on your feet',
      summary: 'Две минуты стоя.',
      topics: [CU, RE, LI],
      dialogue: ['Речь', [
        ['Ben', 'One story, one thank you, one sentence about them.', 'Одна история, одно спасибо, одна фраза о них.'],
        ['Anna', 'Which is the shape of every good speech.', 'Форма любой хорошей речи.'],
        ['Ben', 'And is ruined by trying to be funny.', 'И рушится попытками пошутить.'],
        ['Anna', 'Which the room forgives, if it is short.', 'Что зал прощает, если коротко.'],
        ['Ben', 'And never forgives, at nine minutes.', 'И никогда не прощает на девятой минуте.'],
      ]],
      words: [
        ['One story, one thank you', 'одна история, одно спасибо', 'One story, one thank you, one sentence about them.'],
        ['the shape of every good speech', 'форма хорошей речи', 'Which is the shape of every good speech.'],
        ['ruined by trying to be funny', 'рушится попытками пошутить', 'And is ruined by trying to be funny.'],
        ['the room forgives', 'зал прощает', 'Which the room forgives, if it is short.'],
        ['at nine minutes', 'на девятой минуте', 'And never forgives, at nine minutes.'],
      ],
      rule: ['Ruined by + герундий', 'It is ruined by trying to be funny. Предлог by вводит причину неудачи.'],
      quiz: [
        ['«И рушится попытками пошутить» —', ['And is ruined by trying to be funny', 'And is ruined by try to be funny', 'And is ruin by trying to be funny'], 0],
        ['«Что зал прощает, если коротко» —', ['Which the room forgives, if it is short', 'Which the room forgive, if it is short', 'Which the room forgives, if it will be short'], 0],
        ['«Форма любой хорошей речи» —', ['The shape of every good speech', 'The shape of every good speeches', 'The shape from every good speech'], 0],
      ],
      order: ['И никогда не прощает на девятой минуте.', 'And never forgives, at nine minutes.'],
      produce: [
        ['Одна история, одно спасибо, одна фраза о них.', 'One story, one thank you, one sentence about them.', []],
        ['И рушится попытками пошутить.', 'And is ruined by trying to be funny.', []],
        ['Что зал прощает, если коротко.', 'Which the room forgives, if it is short.', []],
      ],
    },
    {
      title: 'What to say to somebody grieving',
      summary: 'Что сказать горюющему.',
      topics: [RE, CU, LI],
      dialogue: ['Соболезнование', [
        ['Anna', 'I am so sorry, and I remember him.', 'Мне очень жаль, и я его помню.'],
        ['Ben', 'Which is two sentences and enough.', 'Два предложения, и этого хватает.'],
        ['Anna', 'Since nobody needs a theory about loss.', 'Ведь теория о потере никому не нужна.'],
        ['Ben', 'Or a comparison with your own.', 'И сравнение со своей потерей тоже.'],
        ['Anna', 'Which is the most common mistake.', 'Самая частая ошибка.'],
      ]],
      words: [
        ['I am so sorry', 'мне очень жаль', 'I am so sorry, and I remember him.'],
        ['two sentences and enough', 'два предложения, и хватает', 'Which is two sentences and enough.'],
        ['a theory about loss', 'теория о потере', 'Since nobody needs a theory about loss.'],
        ['a comparison with your own', 'сравнение со своей', 'Or a comparison with your own.'],
        ['the most common mistake', 'самая частая ошибка', 'Which is the most common mistake.'],
      ],
      rule: ['Your own без существительного', 'A comparison with your own. Местоимение заменяет уже названное существительное.'],
      quiz: [
        ['«И сравнение со своей потерей тоже» —', ['Or a comparison with your own', 'Or a comparison with your owns', 'Or a comparison with yours own'], 0],
        ['«Ведь теория о потере никому не нужна» —', ['Since nobody needs a theory about loss', 'Since nobody need a theory about loss', 'Since nobody needs a theory about the loss of'], 0],
        ['«Мне очень жаль, и я его помню» —', ['I am so sorry, and I remember him', 'I am so sorry, and I remember he', 'I am so sorry, and I remembers him'], 0],
      ],
      order: ['Два предложения, и этого хватает.', 'Which is two sentences and enough.'],
      produce: [
        ['Мне очень жаль, и я его помню.', 'I am so sorry, and I remember him.', []],
        ['Ведь теория о потере никому не нужна.', 'Since nobody needs a theory about loss.', []],
        ['И сравнение со своей потерей тоже.', 'Or a comparison with your own.', []],
      ],
    },
    {
      title: 'The funeral abroad',
      summary: 'Похороны за границей.',
      topics: [CU, SO, LI],
      dialogue: ['Чужой обряд', [
        ['Ben', 'I asked what would be expected of me.', 'Я спросил, чего от меня будут ждать.'],
        ['Anna', 'Which is the right question, asked early.', 'Правильный вопрос, заданный заранее.'],
        ['Ben', 'And is always answered kindly.', 'И на него всегда отвечают по-доброму.'],
        ['Anna', 'Since being asked is itself a courtesy.', 'Ведь сам вопрос уже вежливость.'],
        ['Ben', 'Which nobody has ever taken badly.', 'Что никто ни разу не воспринял плохо.'],
      ]],
      words: [
        ['what would be expected of me', 'чего от меня будут ждать', 'I asked what would be expected of me.'],
        ['asked early', 'заданный заранее', 'Which is the right question, asked early.'],
        ['always answered kindly', 'всегда отвечают по-доброму', 'And is always answered kindly.'],
        ['being asked is a courtesy', 'сам вопрос уже вежливость', 'Since being asked is itself a courtesy.'],
        ['taken badly', 'воспринял плохо', 'Which nobody has ever taken badly.'],
      ],
      rule: ['Be expected of somebody', 'What would be expected of me. Предлог of вводит того, от кого ждут.'],
      quiz: [
        ['«Я спросил, чего от меня будут ждать» —', ['I asked what would be expected of me', 'I asked what would be expected from me', 'I asked what would be expect of me'], 0],
        ['«Ведь сам вопрос уже вежливость» —', ['Since being asked is itself a courtesy', 'Since be asked is itself a courtesy', 'Since being asked is himself a courtesy'], 0],
        ['«Что никто ни разу не воспринял плохо» —', ['Which nobody has ever taken badly', 'Which nobody has ever took badly', 'Which nobody have ever taken badly'], 0],
      ],
      order: ['Правильный вопрос, заданный заранее.', 'Which is the right question, asked early.'],
      produce: [
        ['Я спросил, чего от меня будут ждать.', 'I asked what would be expected of me.', []],
        ['И на него всегда отвечают по-доброму.', 'And is always answered kindly.', []],
        ['Ведь сам вопрос уже вежливость.', 'Since being asked is itself a courtesy.', []],
      ],
    },
    {
      title: 'The ritual that surprised you',
      summary: 'Обряд, который удивил.',
      topics: [CU, LI, SO],
      dialogue: ['Удивление', [
        ['Anna', 'People laughed, loudly, at the wake.', 'На поминках громко смеялись.'],
        ['Ben', 'Which shocked me, and then made sense.', 'Что меня потрясло, а потом стало понятно.'],
        ['Anna', 'Since grief has more than one shape.', 'Ведь у горя не одна форма.'],
        ['Ben', 'And silence is only ours, not the only one.', 'А молчание — только наша, не единственная.'],
        ['Anna', 'Which took me a decade to learn.', 'На то, чтобы это понять, ушло десять лет.'],
      ]],
      words: [
        ['laughed, loudly, at the wake', 'громко смеялись на поминках', 'People laughed, loudly, at the wake.'],
        ['shocked me, and then made sense', 'потрясло, а потом стало понятно', 'Which shocked me, and then made sense.'],
        ['more than one shape', 'не одна форма', 'Since grief has more than one shape.'],
        ['only ours, not the only one', 'только наша, не единственная', 'And silence is only ours, not the only one.'],
        ['took me a decade', 'ушло десять лет', 'Which took me a decade to learn.'],
      ],
      rule: ['Ours как самостоятельное местоимение', 'Silence is only ours. Форма ours стоит без существительного после него.'],
      quiz: [
        ['«А молчание — только наша, не единственная» —', ['And silence is only ours, not the only one', 'And silence is only our, not the only one', 'And silence is only ours, not the only'], 0],
        ['«Ведь у горя не одна форма» —', ['Since grief has more than one shape', 'Since grief have more than one shape', 'Since grief has more that one shape'], 0],
        ['«На то, чтобы это понять, ушло десять лет» —', ['Which took me a decade to learn', 'Which took me a decade for learn', 'Which take me a decade to learn'], 0],
      ],
      order: ['На поминках громко смеялись.', 'People laughed, loudly, at the wake.'],
      produce: [
        ['На поминках громко смеялись.', 'People laughed, loudly, at the wake.', []],
        ['Ведь у горя не одна форма.', 'Since grief has more than one shape.', []],
        ['На то, чтобы это понять, ушло десять лет.', 'Which took me a decade to learn.', []],
      ],
    },
    {
      title: 'Why we keep doing this',
      summary: 'Зачем мы это продолжаем.',
      topics: [CU, RE, LI],
      dialogue: ['Итог', [
        ['Ben', 'A day everybody has to come to.', 'День, на который все обязаны прийти.'],
        ['Anna', 'Which is the only reason it works.', 'Только поэтому это и работает.'],
        ['Ben', 'Since nobody would organise it otherwise.', 'Ведь иначе никто бы этого не устроил.'],
        ['Anna', 'And nine relatives would never meet.', 'И девять родственников никогда бы не встретились.'],
        ['Ben', 'Which is the whole function, under the cake.', 'Вот вся функция, под слоем торта.'],
      ]],
      words: [
        ['everybody has to come to', 'на который все обязаны прийти', 'A day everybody has to come to.'],
        ['the only reason it works', 'единственная причина, почему работает', 'Which is the only reason it works.'],
        ['would organise it otherwise', 'иначе бы устроил', 'Since nobody would organise it otherwise.'],
        ['nine relatives', 'девять родственников', 'And nine relatives would never meet.'],
        ['under the cake', 'под слоем торта', 'Which is the whole function, under the cake.'],
      ],
      rule: ['Обряд — это принудительная встреча', 'Свадьба и похороны собирают тех, кто иначе не встретился бы, и в этом их главная работа.'],
      quiz: [
        ['«День, на который все обязаны прийти» —', ['A day everybody has to come to', 'A day everybody has to come', 'A day everybody have to come to'], 0],
        ['«Ведь иначе никто бы этого не устроил» —', ['Since nobody would organise it otherwise', 'Since nobody would organised it otherwise', 'Since nobody will organise it otherwise'], 0],
        ['«И девять родственников никогда бы не встретились» —', ['And nine relatives would never meet', 'And nine relatives would never met', 'And nine relatives will never meet'], 0],
      ],
      order: ['Вот вся функция, под слоем торта.', 'Which is the whole function, under the cake.'],
      produce: [
        ['День, на который все обязаны прийти.', 'A day everybody has to come to.', []],
        ['Ведь иначе никто бы этого не устроил.', 'Since nobody would organise it otherwise.', []],
        ['И девять родственников никогда бы не встретились.', 'And nine relatives would never meet.', []],
      ],
    },
    {
      checkpoint: true,
      title: 'Проверка: свадьбы и похороны',
      summary: 'Шесть фраз без подсказок.',
      topics: [CU, RE, SO, RI],
      produce: [
        ['И это никогда не считается невежливым.', 'And is never considered rude.', []],
        ['И ждут ли они чего-то взамен.', 'And on whether they expect anything back.', []],
        ['Чего никто из причастных не объяснит.', 'Which nobody involved will explain.', []],
        ['И рушится попытками пошутить.', 'And is ruined by trying to be funny.', []],
        ['Я спросил, чего от меня будут ждать.', 'I asked what would be expected of me.', []],
        ['А молчание — только наша, не единственная.', 'And silence is only ours, not the only one.', []],
      ],
    },
  ],
}
