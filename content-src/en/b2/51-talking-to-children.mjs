// B2, блок 51 — Talking to children. Разговор с детьми.
//
// Тематический блок: трудные вопросы, границы, школа, экраны и что делать
// со своим раздражением. Модальные, косвенная речь, мягкие формулы.

const RE = 'b2-tema-relaciones'
const ED = 'b2-tema-educacion'
const PS = 'b2-tema-psicologia'
const SO = 'b2-tema-sociedad'
const LI = 'b2-linkers'

export default {
  slug: 'talking-to-children',
  title: 'Разговор с детьми',
  subtitle: 'Трудные вопросы, границы и школа',
  canDo: [
    'отвечать на трудный детский вопрос',
    'ставить границу без крика',
    'обсуждать школу с учителем',
    'говорить об экранах и правилах',
    'извиняться перед ребёнком',
  ],
  lessons: [
    {
      title: 'The question at bedtime',
      summary: 'Вопрос перед сном.',
      topics: [RE, PS, LI],
      dialogue: ['Вопрос', [
        ['Anna', 'She asked whether we were going to die.', 'Она спросила, умрём ли мы.'],
        ['Ben', 'Which nobody is ready for at nine at night.', 'К чему в девять вечера никто не готов.'],
        ['Anna', 'And which deserves a true short answer.', 'И что заслуживает правдивого короткого ответа.'],
        ['Ben', 'Rather than a long one about heaven.', 'А не длинного, про небеса.'],
        ['Anna', 'Which she will check against the school.', 'Который она сверит со школой.'],
      ]],
      words: [
        ['asked whether we were going to die', 'спросила, умрём ли мы', 'She asked whether we were going to die.'],
        ['nobody is ready for', 'к чему никто не готов', 'Which nobody is ready for at nine at night.'],
        ['a true short answer', 'правдивый короткий ответ', 'And which deserves a true short answer.'],
        ['a long one about heaven', 'длинный про небеса', 'Rather than a long one about heaven.'],
        ['check against the school', 'сверит со школой', 'Which she will check against the school.'],
      ],
      rule: ['Whether в косвенном вопросе о будущем', 'She asked whether we were going to die. Будущее в прошедшем передаётся через were going to.'],
      quiz: [
        ['«Она спросила, умрём ли мы» —', ['She asked whether we were going to die', 'She asked whether were we going to die', 'She asked whether we are going to die then'], 0],
        ['«И что заслуживает правдивого короткого ответа» —', ['And which deserves a true short answer', 'And which deserve a true short answer', 'And which deserves a truly short answer'], 0],
        ['«К чему в девять вечера никто не готов» —', ['Which nobody is ready for at nine at night', 'Which nobody is ready at nine at night', 'Which nobody is ready for on nine at night'], 0],
      ],
      order: ['А не длинного, про небеса.', 'Rather than a long one about heaven.'],
      produce: [
        ['Она спросила, умрём ли мы.', 'She asked whether we were going to die.', []],
        ['И что заслуживает правдивого короткого ответа.', 'And which deserves a true short answer.', []],
        ['Который она сверит со школой.', 'Which she will check against the school.', []],
      ],
    },
    {
      title: 'Saying no calmly',
      summary: 'Спокойное «нет».',
      topics: [RE, PS, LI],
      dialogue: ['Граница', [
        ['Ben', 'The answer is no, and it stays no.', 'Ответ — нет, и он остаётся нет.'],
        ['Anna', 'Which is easier said than held.', 'Сказать легче, чем удержать.'],
        ['Ben', 'Since the tenth ask sounds reasonable.', 'Ведь десятая просьба звучит разумно.'],
        ['Anna', 'By which point you are simply tired.', 'К этому моменту вы просто устали.'],
        ['Ben', 'Which children read faster than adults.', 'Что дети считывают быстрее взрослых.'],
      ]],
      words: [
        ['it stays no', 'он остаётся нет', 'The answer is no, and it stays no.'],
        ['easier said than held', 'сказать легче, чем удержать', 'Which is easier said than held.'],
        ['the tenth ask', 'десятая просьба', 'Since the tenth ask sounds reasonable.'],
        ['you are simply tired', 'вы просто устали', 'By which point you are simply tired.'],
        ['read faster than adults', 'считывают быстрее взрослых', 'Which children read faster than adults.'],
      ],
      rule: ['Easier said than done', 'Easier said than held. Идиома сравнивает слово и дело, вторая часть меняется по смыслу.'],
      quiz: [
        ['«Сказать легче, чем удержать» —', ['Which is easier said than held', 'Which is easier say than held', 'Which is more easy said than held'], 0],
        ['«Ведь десятая просьба звучит разумно» —', ['Since the tenth ask sounds reasonable', 'Since the tenth ask sound reasonable', 'Since the tenth ask sounds reasonably'], 0],
        ['«Что дети считывают быстрее взрослых» —', ['Which children read faster than adults', 'Which children reads faster than adults', 'Which children read faster that adults'], 0],
      ],
      order: ['К этому моменту вы просто устали.', 'By which point you are simply tired.'],
      produce: [
        ['Ответ — нет, и он остаётся нет.', 'The answer is no, and it stays no.', []],
        ['Сказать легче, чем удержать.', 'Which is easier said than held.', []],
        ['Ведь десятая просьба звучит разумно.', 'Since the tenth ask sounds reasonable.', []],
      ],
    },
    {
      title: 'The parents evening',
      summary: 'Родительское собрание.',
      topics: [ED, RE, LI],
      dialogue: ['Школа', [
        ['Anna', 'Six minutes with the teacher, by appointment.', 'Шесть минут с учителем, по записи.'],
        ['Ben', 'Which is enough for two questions.', 'Хватает на два вопроса.'],
        ['Anna', 'So I ask what he is like in a group.', 'Поэтому я спрашиваю, какой он в группе.'],
        ['Ben', 'Which no report card can tell you.', 'Чего не расскажет ни один табель.'],
        ['Anna', 'And which decides most of the next year.', 'И что решает большую часть следующего года.'],
      ]],
      words: [
        ['by appointment', 'по записи', 'Six minutes with the teacher, by appointment.'],
        ['enough for two questions', 'хватает на два вопроса', 'Which is enough for two questions.'],
        ['what he is like in a group', 'какой он в группе', 'So I ask what he is like in a group.'],
        ['no report card can tell you', 'не расскажет ни один табель', 'Which no report card can tell you.'],
        ['decides most of the next year', 'решает большую часть года', 'And which decides most of the next year.'],
      ],
      rule: ['What somebody is like', 'What he is like in a group. Вопрос спрашивает о характере, а не о внешности.'],
      quiz: [
        ['«Поэтому я спрашиваю, какой он в группе» —', ['So I ask what he is like in a group', 'So I ask what is he like in a group', 'So I ask how he is like in a group'], 0],
        ['«Чего не расскажет ни один табель» —', ['Which no report card can tell you', 'Which no report card can tells you', 'Which no report card can to tell you'], 0],
        ['«И что решает большую часть следующего года» —', ['And which decides most of the next year', 'And which decide most of the next year', 'And which decides most from the next year'], 0],
      ],
      order: ['Хватает на два вопроса.', 'Which is enough for two questions.'],
      produce: [
        ['Шесть минут с учителем, по записи.', 'Six minutes with the teacher, by appointment.', []],
        ['Поэтому я спрашиваю, какой он в группе.', 'So I ask what he is like in a group.', []],
        ['Чего не расскажет ни один табель.', 'Which no report card can tell you.', []],
      ],
    },
    {
      title: 'Screens',
      summary: 'Экраны.',
      topics: [PS, ED, LI],
      dialogue: ['Экраны', [
        ['Ben', 'The rule is the same for everybody here.', 'Правило здесь одинаково для всех.'],
        ['Anna', 'Which includes the adults, painfully.', 'Что мучительно включает и взрослых.'],
        ['Ben', 'Since a rule you break is not a rule.', 'Ведь правило, которое вы нарушаете, — не правило.'],
        ['Anna', 'And is instantly named as unfair.', 'И его мгновенно объявляют несправедливым.'],
        ['Ben', 'Correctly, by somebody aged seven.', 'И справедливо, семилетним человеком.'],
      ]],
      words: [
        ['the same for everybody', 'одинаково для всех', 'The rule is the same for everybody here.'],
        ['includes the adults', 'включает взрослых', 'Which includes the adults, painfully.'],
        ['a rule you break', 'правило, которое вы нарушаете', 'Since a rule you break is not a rule.'],
        ['named as unfair', 'объявляют несправедливым', 'And is instantly named as unfair.'],
        ['somebody aged seven', 'семилетний человек', 'Correctly, by somebody aged seven.'],
      ],
      rule: ['Aged — возраст как определение', 'Somebody aged seven. Форма стоит после существительного и заменяет who is seven.'],
      quiz: [
        ['«И справедливо, семилетним человеком» —', ['Correctly, by somebody aged seven', 'Correctly, by somebody age seven', 'Correct, by somebody aged seven'], 0],
        ['«Ведь правило, которое вы нарушаете, — не правило» —', ['Since a rule you break is not a rule', 'Since a rule what you break is not a rule', 'Since a rule you breaks is not a rule'], 0],
        ['«И его мгновенно объявляют несправедливым» —', ['And is instantly named as unfair', 'And is instantly name as unfair', 'And is instant named as unfair'], 0],
      ],
      order: ['Что мучительно включает и взрослых.', 'Which includes the adults, painfully.'],
      produce: [
        ['Правило здесь одинаково для всех.', 'The rule is the same for everybody here.', []],
        ['Ведь правило, которое вы нарушаете, — не правило.', 'Since a rule you break is not a rule.', []],
        ['И справедливо, семилетним человеком.', 'Correctly, by somebody aged seven.', []],
      ],
    },
    {
      title: 'When you lose your temper',
      summary: 'Когда сорвался.',
      topics: [PS, RE, LI],
      dialogue: ['Срыв', [
        ['Anna', 'I shouted, and he went quiet.', 'Я накричала, и он замолчал.'],
        ['Ben', 'Which is the worst possible result.', 'Худший из возможных результатов.'],
        ['Anna', 'So I apologised, naming what I did.', 'Поэтому я извинилась, назвав, что сделала.'],
        ['Ben', 'Rather than saying I was tired.', 'А не сказав, что устала.'],
        ['Anna', 'Which is an explanation, not an apology.', 'Это объяснение, а не извинение.'],
      ]],
      words: [
        ['I shouted', 'я накричала', 'I shouted, and he went quiet.'],
        ['he went quiet', 'он замолчал', 'And he went quiet, immediately.'],
        ['naming what I did', 'назвав, что сделала', 'So I apologised, naming what I did.'],
        ['saying I was tired', 'сказав, что устала', 'Rather than saying I was tired.'],
        ['an explanation, not an apology', 'объяснение, а не извинение', 'Which is an explanation, not an apology.'],
      ],
      rule: ['Go + прилагательное', 'He went quiet. Глагол go описывает переход в новое состояние.'],
      quiz: [
        ['«Я накричала, и он замолчал» —', ['I shouted, and he went quiet', 'I shouted, and he went quietly', 'I shouted, and he goes quiet'], 0],
        ['«Поэтому я извинилась, назвав, что сделала» —', ['So I apologised, naming what I did', 'So I apologised, naming that I did', 'So I apologised, name what I did'], 0],
        ['«Это объяснение, а не извинение» —', ['Which is an explanation, not an apology', 'Which is a explanation, not an apology', 'Which is an explanation, not a apology'], 0],
      ],
      order: ['А не сказав, что устала.', 'Rather than saying I was tired.'],
      produce: [
        ['Я накричала, и он замолчал.', 'I shouted, and he went quiet.', []],
        ['Поэтому я извинилась, назвав, что сделала.', 'So I apologised, naming what I did.', []],
        ['Это объяснение, а не извинение.', 'Which is an explanation, not an apology.', []],
      ],
    },
    {
      title: 'Money and children',
      summary: 'Деньги и дети.',
      topics: [RE, SO, LI],
      dialogue: ['Деньги', [
        ['Ben', 'We cannot afford it, and that is the reason.', 'Мы не можем себе этого позволить, и это причина.'],
        ['Anna', 'Which is better than inventing one.', 'Что лучше, чем выдумывать другую.'],
        ['Ben', 'Since children compare notes at school.', 'Ведь дети сверяют версии в школе.'],
        ['Anna', 'And find out what things cost anyway.', 'И всё равно узнают, сколько что стоит.'],
        ['Ben', 'Which is easier if nobody lied first.', 'И это легче, если никто не соврал сначала.'],
      ]],
      words: [
        ['cannot afford it', 'не можем позволить', 'We cannot afford it, and that is the reason.'],
        ['inventing one', 'выдумывать другую', 'Which is better than inventing one.'],
        ['compare notes at school', 'сверяют версии в школе', 'Since children compare notes at school.'],
        ['what things cost', 'сколько что стоит', 'And find out what things cost anyway.'],
        ['if nobody lied first', 'если никто не соврал сначала', 'Which is easier if nobody lied first.'],
      ],
      rule: ['Compare notes — идиома', 'Children compare notes at school. Оборот значит «обмениваться сведениями», а не сравнивать записи.'],
      quiz: [
        ['«Ведь дети сверяют версии в школе» —', ['Since children compare notes at school', 'Since children compares notes at school', 'Since children compare notes in school of'], 0],
        ['«И всё равно узнают, сколько что стоит» —', ['And find out what things cost anyway', 'And find out what do things cost anyway', 'And finds out what things cost anyway'], 0],
        ['«Что лучше, чем выдумывать другую» —', ['Which is better than inventing one', 'Which is better than invent one', 'Which is better that inventing one'], 0],
      ],
      order: ['И это легче, если никто не соврал сначала.', 'Which is easier if nobody lied first.'],
      produce: [
        ['Мы не можем себе этого позволить, и это причина.', 'We cannot afford it, and that is the reason.', []],
        ['Ведь дети сверяют версии в школе.', 'Since children compare notes at school.', []],
        ['И всё равно узнают, сколько что стоит.', 'And find out what things cost anyway.', []],
      ],
    },
    {
      title: 'Reading the silence',
      summary: 'Прочитать молчание.',
      topics: [PS, RE, LI],
      dialogue: ['Молчание', [
        ['Anna', 'He has not mentioned football for a month.', 'Он месяц не заговаривал о футболе.'],
        ['Ben', 'Which is louder than anything he said.', 'Что громче всего, что он говорил.'],
        ['Anna', 'So we drove somewhere, side by side.', 'Поэтому мы куда-то поехали, рядом, не лицом к лицу.'],
        ['Ben', 'Which is when boys that age talk.', 'Именно тогда мальчики этого возраста и говорят.'],
        ['Anna', 'And never across a kitchen table.', 'И никогда через кухонный стол.'],
      ]],
      words: [
        ['has not mentioned football', 'не заговаривал о футболе', 'He has not mentioned football for a month.'],
        ['louder than anything he said', 'громче всего сказанного', 'Which is louder than anything he said.'],
        ['side by side', 'рядом, не лицом к лицу', 'So we drove somewhere, side by side.'],
        ['boys that age', 'мальчики этого возраста', 'Which is when boys that age talk.'],
        ['across a kitchen table', 'через кухонный стол', 'And never across a kitchen table.'],
      ],
      rule: ['Boys that age — разговорное определение', 'Boys that age talk. Оборот заменяет of that age и звучит естественно в речи.'],
      quiz: [
        ['«Он месяц не заговаривал о футболе» —', ['He has not mentioned football for a month', 'He has not mention football for a month', 'He has not mentioned football since a month'], 0],
        ['«Что громче всего, что он говорил» —', ['Which is louder than anything he said', 'Which is louder than anything he says', 'Which is more loud than anything he said'], 0],
        ['«Именно тогда мальчики этого возраста и говорят» —', ['Which is when boys that age talk', 'Which is when boys that age talks', 'Which is what boys that age talk'], 0],
      ],
      order: ['И никогда через кухонный стол.', 'And never across a kitchen table.'],
      produce: [
        ['Он месяц не заговаривал о футболе.', 'He has not mentioned football for a month.', []],
        ['Поэтому мы куда-то поехали, рядом, не лицом к лицу.', 'So we drove somewhere, side by side.', []],
        ['И никогда через кухонный стол.', 'And never across a kitchen table.', []],
      ],
    },
    {
      title: 'What they will remember',
      summary: 'Что они запомнят.',
      topics: [RE, PS, LI],
      dialogue: ['Память', [
        ['Ben', 'They remember tone, not sentences.', 'Они помнят тон, а не предложения.'],
        ['Anna', 'Which is unfair to everybody who prepares.', 'Что несправедливо ко всем, кто готовится.'],
        ['Ben', 'And which no argument can override.', 'И чего никакой довод не перебьёт.'],
        ['Anna', 'So the useful work is being calm.', 'Значит, полезная работа — быть спокойным.'],
        ['Ben', 'Which is harder than being right.', 'Что труднее, чем быть правым.'],
      ]],
      words: [
        ['remember tone, not sentences', 'помнят тон, а не предложения', 'They remember tone, not sentences.'],
        ['unfair to everybody who prepares', 'несправедливо к тем, кто готовится', 'Which is unfair to everybody who prepares.'],
        ['no argument can override', 'никакой довод не перебьёт', 'And which no argument can override.'],
        ['being calm', 'быть спокойным', 'So the useful work is being calm.'],
        ['harder than being right', 'труднее, чем быть правым', 'Which is harder than being right.'],
      ],
      rule: ['С детьми решает тон и повтор', 'Короткий честный ответ и одинаковое правило для всех работают вернее длинных объяснений.'],
      quiz: [
        ['«Значит, полезная работа — быть спокойным» —', ['So the useful work is being calm', 'So the useful work is be calm', 'So the useful work is being calmly'], 0],
        ['«Что несправедливо ко всем, кто готовится» —', ['Which is unfair to everybody who prepares', 'Which is unfair to everybody who prepare', 'Which is unfair for everybody who prepares'], 0],
        ['«Что труднее, чем быть правым» —', ['Which is harder than being right', 'Which is harder than be right', 'Which is harder that being right'], 0],
      ],
      order: ['Они помнят тон, а не предложения.', 'They remember tone, not sentences.'],
      produce: [
        ['Они помнят тон, а не предложения.', 'They remember tone, not sentences.', []],
        ['И чего никакой довод не перебьёт.', 'And which no argument can override.', []],
        ['Что труднее, чем быть правым.', 'Which is harder than being right.', []],
      ],
    },
    {
      checkpoint: true,
      title: 'Проверка: разговор с детьми',
      summary: 'Шесть фраз без подсказок.',
      topics: [RE, ED, PS, SO],
      produce: [
        ['Она спросила, умрём ли мы.', 'She asked whether we were going to die.', []],
        ['Сказать легче, чем удержать.', 'Which is easier said than held.', []],
        ['Поэтому я спрашиваю, какой он в группе.', 'So I ask what he is like in a group.', []],
        ['Ведь правило, которое вы нарушаете, — не правило.', 'Since a rule you break is not a rule.', []],
        ['Поэтому я извинилась, назвав, что сделала.', 'So I apologised, naming what I did.', []],
        ['Ведь дети сверяют версии в школе.', 'Since children compare notes at school.', []],
      ],
    },
  ],
}
