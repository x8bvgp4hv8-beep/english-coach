// B2, блок 73 — Books and reading. Книги и чтение.
//
// Тематический блок: непрочитанные книги, библиотеки, перевод, аудиокниги и
// спор о том, что считается чтением. Оценки, уступки, косвенная речь.

const CU = 'b2-tema-cultura'
const ED = 'b2-tema-educacion'
const ME = 'b2-tema-medios'
const LE = 'b2-tema-lengua'
const LI = 'b2-linkers'

export default {
  slug: 'books-and-reading',
  title: 'Книги и чтение',
  subtitle: 'Непрочитанное, библиотеки, перевод и аудио',
  canDo: [
    'обсуждать книги без снобизма',
    'говорить о брошенных книгах',
    'спорить о переводе и оригинале',
    'обсуждать аудиокниги',
    'рекомендовать книгу по делу',
  ],
  lessons: [
    {
      title: 'The shelf of unread books',
      summary: 'Полка непрочитанного.',
      topics: [CU, LI, ED],
      dialogue: ['Полка', [
        ['Anna', 'Forty bought, eleven finished, this year.', 'В этом году: сорок куплено, одиннадцать дочитано.'],
        ['Ben', 'Which sounds like failure and is not.', 'Звучит как провал, но это не он.'],
        ['Anna', 'Since a shelf is a plan, not a record.', 'Ведь полка — это план, а не отчёт.'],
        ['Ben', 'And nobody is ashamed of a long plan.', 'А длинного плана никто не стыдится.'],
        ['Anna', 'Which took me years to accept.', 'На принятие этого у меня ушли годы.'],
      ]],
      words: [
        ['Forty bought, eleven finished', 'сорок куплено, одиннадцать дочитано', 'Forty bought, eleven finished, this year.'],
        ['sounds like failure', 'звучит как провал', 'Which sounds like failure and is not.'],
        ['a plan, not a record', 'план, а не отчёт', 'Since a shelf is a plan, not a record.'],
        ['ashamed of a long plan', 'стыдится длинного плана', 'And nobody is ashamed of a long plan.'],
        ['took me years to accept', 'ушли годы на принятие', 'Which took me years to accept.'],
      ],
      rule: ['Be ashamed of', 'Nobody is ashamed of a long plan. После ashamed идёт предлог of.'],
      quiz: [
        ['«А длинного плана никто не стыдится» —', ['And nobody is ashamed of a long plan', 'And nobody is ashamed from a long plan', 'And nobody are ashamed of a long plan'], 0],
        ['«Ведь полка — это план, а не отчёт» —', ['Since a shelf is a plan, not a record', 'Since a shelf is a plan, no a record', 'Since a shelf are a plan, not a record'], 0],
        ['«На принятие этого у меня ушли годы» —', ['Which took me years to accept', 'Which took me years for accept', 'Which take me years to accept'], 0],
      ],
      order: ['Звучит как провал, но это не он.', 'Which sounds like failure and is not.'],
      produce: [
        ['В этом году: сорок куплено, одиннадцать дочитано.', 'Forty bought, eleven finished, this year.', []],
        ['Ведь полка — это план, а не отчёт.', 'Since a shelf is a plan, not a record.', []],
        ['А длинного плана никто не стыдится.', 'And nobody is ashamed of a long plan.', []],
      ],
    },
    {
      title: 'Giving up on page ninety',
      summary: 'Бросить на девяностой странице.',
      topics: [CU, LI, ED],
      dialogue: ['Бросить', [
        ['Ben', 'I stopped, and did not feel guilty.', 'Я бросил и не почувствовал вины.'],
        ['Anna', 'Which took about twenty years to learn.', 'На что ушло лет двадцать учёбы.'],
        ['Ben', 'Since finishing was drilled into everybody at school.', 'Ведь в школе всем вбивали «дочитывай».'],
        ['Anna', 'Where the choice was never yours.', 'Где выбор никогда не был вашим.'],
        ['Ben', 'And where reading became a duty.', 'И где чтение стало обязанностью.'],
      ]],
      words: [
        ['did not feel guilty', 'не почувствовал вины', 'I stopped, and did not feel guilty.'],
        ['twenty years to learn', 'двадцать лет учёбы', 'Which took about twenty years to learn.'],
        ['was drilled into everybody', 'всем вбивали', 'Since finishing was drilled into everybody at school.'],
        ['the choice was never yours', 'выбор не был вашим', 'Where the choice was never yours.'],
        ['reading became a duty', 'чтение стало обязанностью', 'And where reading became a duty.'],
      ],
      rule: ['Drill something into somebody', 'It was drilled into everybody. Предлог into вводит того, кому вбивали.'],
      quiz: [
        ['«Ведь в школе всем вбивали «дочитывай»» —', ['Finishing was drilled into everybody at school', 'Finishing was drill into everybody at school', 'Finishing was drilled in everybody at school'], 0],
        ['«Где выбор никогда не был вашим» —', ['Where the choice was never yours', 'Where the choice was never your', 'Where the choice were never yours'], 0],
        ['«Я бросил и не почувствовал вины» —', ['I stopped, and did not feel guilty', 'I stopped, and did not felt guilty', 'I stopped, and did not feel guiltily'], 0],
      ],
      order: ['И где чтение стало обязанностью.', 'And where reading became a duty.'],
      produce: [
        ['Я бросил и не почувствовал вины.', 'I stopped, and did not feel guilty.', []],
        ['Ведь в школе всем вбивали «дочитывай».', 'Since finishing was drilled into everybody at school.', []],
        ['И где чтение стало обязанностью.', 'And where reading became a duty.', []],
      ],
    },
    {
      title: 'The library card',
      summary: 'Библиотечный билет.',
      topics: [ED, CU, LI],
      dialogue: ['Библиотека', [
        ['Anna', 'Nine books, for nothing, for three weeks.', 'Девять книг, бесплатно, на три недели.'],
        ['Ben', 'Which most adults have forgotten exists.', 'О чём большинство взрослых забыло, что оно есть.'],
        ['Anna', 'And which the reading habit depends on.', 'И на чём держится привычка читать.'],
        ['Ben', 'Since buying makes every choice expensive.', 'Ведь покупка делает каждый выбор дорогим.'],
        ['Anna', 'And an expensive choice is rarely made.', 'А дорогой выбор делают редко.'],
      ]],
      words: [
        ['for nothing, for three weeks', 'бесплатно, на три недели', 'Nine books, for nothing, for three weeks.'],
        ['have forgotten exists', 'забыли, что оно есть', 'Which most adults have forgotten exists.'],
        ['the reading habit depends on', 'на чём держится привычка читать', 'And which the reading habit depends on.'],
        ['makes every choice expensive', 'делает каждый выбор дорогим', 'Since buying makes every choice expensive.'],
        ['is rarely made', 'делают редко', 'And an expensive choice is rarely made.'],
      ],
      rule: ['Forget + придаточное', 'Most adults have forgotten it exists. Союз that опускается в разговорной речи.'],
      quiz: [
        ['«О чём большинство взрослых забыло, что оно есть» —', ['Which most adults have forgotten exists', 'Which most adults have forgotten exist', 'Which most adults has forgotten exists'], 0],
        ['«Ведь покупка делает каждый выбор дорогим» —', ['Since buying makes every choice expensive', 'Since buying makes every choice expensively', 'Since buy makes every choice expensive'], 0],
        ['«А дорогой выбор делают редко» —', ['And an expensive choice is rarely made', 'And an expensive choice is rarely make', 'And an expensive choice are rarely made'], 0],
      ],
      order: ['Девять книг, бесплатно, на три недели.', 'Nine books, for nothing, for three weeks.'],
      produce: [
        ['Девять книг, бесплатно, на три недели.', 'Nine books, for nothing, for three weeks.', []],
        ['И на чём держится привычка читать.', 'And which the reading habit depends on.', []],
        ['А дорогой выбор делают редко.', 'And an expensive choice is rarely made.', []],
      ],
    },
    {
      title: 'In translation',
      summary: 'В переводе.',
      topics: [LE, CU, LI],
      dialogue: ['Перевод', [
        ['Ben', 'The translator wrote half of that sentence.', 'Половину той фразы написал переводчик.'],
        ['Anna', 'Which is not a criticism, only a fact.', 'Это не упрёк, а факт.'],
        ['Ben', 'And is why two translations read differently.', 'И поэтому два перевода читаются по-разному.'],
        ['Anna', 'Of a book most people call the same.', 'Одной книги, которую все зовут одинаковой.'],
        ['Ben', 'Which is worth remembering in an argument.', 'Это стоит помнить в споре.'],
      ]],
      words: [
        ['wrote half of that sentence', 'написал половину фразы', 'The translator wrote half of that sentence.'],
        ['not a criticism, only a fact', 'не упрёк, а факт', 'Which is not a criticism, only a fact.'],
        ['two translations read differently', 'два перевода читаются по-разному', 'And is why two translations read differently.'],
        ['most people call the same', 'все зовут одинаковой', 'Of a book most people call the same.'],
        ['in an argument', 'в споре', 'Which is worth remembering in an argument.'],
      ],
      rule: ['Read differently — активная форма с пассивным смыслом', 'Two translations read differently. Глагол read описывает свойство текста.'],
      quiz: [
        ['«И поэтому два перевода читаются по-разному» —', ['And is why two translations read differently', 'And is why two translations reads differently', 'And is why two translations are read different'], 0],
        ['«Одной книги, которую все зовут одинаковой» —', ['Of a book most people call the same', 'Of a book most people calls the same', 'Of a book what most people call the same'], 0],
        ['«Половину той фразы написал переводчик» —', ['The translator wrote half of that sentence', 'The translator write half of that sentence', 'The translator wrote a half that sentence'], 0],
      ],
      order: ['Это не упрёк, а факт.', 'Which is not a criticism, only a fact.'],
      produce: [
        ['Половину той фразы написал переводчик.', 'The translator wrote half of that sentence.', []],
        ['И поэтому два перевода читаются по-разному.', 'And is why two translations read differently.', []],
        ['Одной книги, которую все зовут одинаковой.', 'Of a book most people call the same.', []],
      ],
    },
    {
      title: 'Audiobooks count',
      summary: 'Аудиокниги считаются.',
      topics: [ME, CU, LI],
      dialogue: ['Аудио', [
        ['Anna', 'Somebody said listening is not reading.', 'Кто-то сказал, что слушать — не значит читать.'],
        ['Ben', 'Which is true and completely irrelevant.', 'Что верно и совершенно неважно.'],
        ['Anna', 'Since the point was never the eyes.', 'Ведь дело никогда не было в глазах.'],
        ['Ben', 'But the story arriving in your head.', 'А в том, чтобы история попала в голову.'],
        ['Anna', 'Which it does, on a bus, for free.', 'Что и происходит, в автобусе, бесплатно.'],
      ]],
      words: [
        ['listening is not reading', 'слушать — не значит читать', 'Somebody said listening is not reading.'],
        ['true and completely irrelevant', 'верно и совершенно неважно', 'Which is true and completely irrelevant.'],
        ['the point was never the eyes', 'дело было не в глазах', 'Since the point was never the eyes.'],
        ['the story arriving in your head', 'история попадает в голову', 'But the story arriving in your head.'],
        ['on a bus, for free', 'в автобусе, бесплатно', 'Which it does, on a bus, for free.'],
      ],
      rule: ['Герундий в обеих частях сравнения', 'Listening is not reading. Обе формы на -ing работают как существительные.'],
      quiz: [
        ['«Кто-то сказал, что слушать — не значит читать» —', ['Somebody said listening is not reading', 'Somebody said listen is not reading', 'Somebody said listening is not read'], 0],
        ['«А в том, чтобы история попала в голову» —', ['But the story arriving in your head', 'But the story arrive in your head', 'But the story arriving on your head'], 0],
        ['«Что верно и совершенно неважно» —', ['Which is true and completely irrelevant', 'Which is true and complete irrelevant', 'Which is truth and completely irrelevant'], 0],
      ],
      order: ['Что и происходит, в автобусе, бесплатно.', 'Which it does, on a bus, for free.'],
      produce: [
        ['Кто-то сказал, что слушать — не значит читать.', 'Somebody said listening is not reading.', []],
        ['Ведь дело никогда не было в глазах.', 'Since the point was never the eyes.', []],
        ['А в том, чтобы история попала в голову.', 'But the story arriving in your head.', []],
      ],
    },
    {
      title: 'Reading in a second language',
      summary: 'Читать на втором языке.',
      topics: [LE, ED, LI],
      dialogue: ['На чужом', [
        ['Ben', 'The first hundred pages are the whole battle.', 'Первые сто страниц — это вся битва.'],
        ['Anna', 'After which the book teaches you its words.', 'После чего книга сама учит своим словам.'],
        ['Ben', 'Which no dictionary does as well.', 'Чего ни один словарь не делает так же хорошо.'],
        ['Anna', 'Provided you stop looking things up.', 'При условии, что перестаёте лезть в словарь.'],
        ['Ben', 'Which is the hardest instruction to follow.', 'Самая трудная инструкция для исполнения.'],
      ]],
      words: [
        ['the whole battle', 'вся битва', 'The first hundred pages are the whole battle.'],
        ['teaches you its words', 'учит своим словам', 'After which the book teaches you its words.'],
        ['no dictionary does as well', 'ни один словарь так не делает', 'Which no dictionary does as well.'],
        ['stop looking things up', 'перестать лезть в словарь', 'Provided you stop looking things up.'],
        ['the hardest instruction to follow', 'самая трудная инструкция', 'Which is the hardest instruction to follow.'],
      ],
      rule: ['Look something up', 'Stop looking things up. Дополнение стоит между глаголом и up.'],
      quiz: [
        ['«При условии, что перестаёте лезть в словарь» —', ['Provided you stop looking things up', 'Provided you stop to look things up', 'Provided you stop looking up things it'], 0],
        ['«Чего ни один словарь не делает так же хорошо» —', ['Which no dictionary does as well', 'Which no dictionary do as well', 'Which no dictionary does so well as'], 0],
        ['«После чего книга сама учит своим словам» —', ['After which the book teaches you its words', 'After which the book teach you its words', 'After which the book teaches you it words'], 0],
      ],
      order: ['Первые сто страниц — это вся битва.', 'The first hundred pages are the whole battle.'],
      produce: [
        ['Первые сто страниц — это вся битва.', 'The first hundred pages are the whole battle.', []],
        ['После чего книга сама учит своим словам.', 'After which the book teaches you its words.', []],
        ['При условии, что перестаёте лезть в словарь.', 'Provided you stop looking things up.', []],
      ],
    },
    {
      title: 'The book that changed something',
      summary: 'Книга, которая что-то изменила.',
      topics: [CU, ED, LI],
      dialogue: ['Влияние', [
        ['Anna', 'One paragraph rearranged how I work.', 'Один абзац перестроил то, как я работаю.'],
        ['Ben', 'Which is more than most courses manage.', 'Что больше, чем удаётся большинству курсов.'],
        ['Anna', 'And is entirely unpredictable, in advance.', 'И совершенно непредсказуемо заранее.'],
        ['Ben', 'Which is the argument for reading widely.', 'Это и есть довод за широкое чтение.'],
        ['Anna', 'And against reading only what is useful.', 'И против чтения только полезного.'],
      ]],
      words: [
        ['rearranged how I work', 'перестроил то, как я работаю', 'One paragraph rearranged how I work.'],
        ['more than most courses manage', 'больше, чем удаётся курсам', 'Which is more than most courses manage.'],
        ['unpredictable, in advance', 'непредсказуемо заранее', 'And is entirely unpredictable, in advance.'],
        ['reading widely', 'широкое чтение', 'Which is the argument for reading widely.'],
        ['only what is useful', 'только полезное', 'And against reading only what is useful.'],
      ],
      rule: ['For и against с герундием', 'The argument for reading widely, and against reading only what is useful. После обоих предлогов идёт -ing.'],
      quiz: [
        ['«Это и есть довод за широкое чтение» —', ['The argument for reading widely', 'The argument for read widely', 'The argument for reading wide'], 0],
        ['«Один абзац перестроил то, как я работаю» —', ['One paragraph rearranged how I work', 'One paragraph rearranged how do I work', 'One paragraph rearrange how I work'], 0],
        ['«Что больше, чем удаётся большинству курсов» —', ['Which is more than most courses manage', 'Which is more than most courses manages', 'Which is more that most courses manage'], 0],
      ],
      order: ['И против чтения только полезного.', 'And against reading only what is useful.'],
      produce: [
        ['Один абзац перестроил то, как я работаю.', 'One paragraph rearranged how I work.', []],
        ['И совершенно непредсказуемо заранее.', 'And is entirely unpredictable, in advance.', []],
        ['И против чтения только полезного.', 'And against reading only what is useful.', []],
      ],
    },
    {
      title: 'Twenty minutes before sleep',
      summary: 'Двадцать минут перед сном.',
      topics: [ED, CU, LI],
      dialogue: ['Итог', [
        ['Ben', 'Twenty minutes gets you thirty books a year.', 'Двадцать минут дают тридцать книг в год.'],
        ['Anna', 'Which nobody believes until they count.', 'Чему никто не верит, пока не посчитает.'],
        ['Ben', 'And which requires only one decision.', 'И что требует только одного решения.'],
        ['Anna', 'About where the phone spends the night.', 'О том, где телефон проводит ночь.'],
        ['Ben', 'Which is the whole method, again.', 'И снова в этом весь метод.'],
      ]],
      words: [
        ['gets you thirty books a year', 'дают тридцать книг в год', 'Twenty minutes gets you thirty books a year.'],
        ['until they count', 'пока не посчитает', 'Which nobody believes until they count.'],
        ['requires only one decision', 'требует одного решения', 'And which requires only one decision.'],
        ['where the phone spends the night', 'где телефон проводит ночь', 'About where the phone spends the night.'],
        ['the whole method', 'весь метод', 'Which is the whole method, again.'],
      ],
      rule: ['Чтение — вопрос доступа, а не силы воли', 'Библиотечный билет и место телефона на ночь объясняют количество прочитанного лучше любых списков.'],
      quiz: [
        ['«Чему никто не верит, пока не посчитает» —', ['Which nobody believes until they count', 'Which nobody believes until they will count', 'Which nobody believe until they count'], 0],
        ['«О том, где телефон проводит ночь» —', ['About where the phone spends the night', 'About where does the phone spend the night', 'About where the phone spend the night'], 0],
        ['«Двадцать минут дают тридцать книг в год» —', ['Twenty minutes gets you thirty books a year', 'Twenty minutes get you thirty books a year', 'Twenty minutes gets you thirty book a year'], 0],
      ],
      order: ['И что требует только одного решения.', 'And which requires only one decision.'],
      produce: [
        ['Двадцать минут дают тридцать книг в год.', 'Twenty minutes gets you thirty books a year.', []],
        ['Чему никто не верит, пока не посчитает.', 'Which nobody believes until they count.', []],
        ['О том, где телефон проводит ночь.', 'About where the phone spends the night.', []],
      ],
    },
    {
      checkpoint: true,
      title: 'Проверка: книги и чтение',
      summary: 'Шесть фраз без подсказок.',
      topics: [CU, ED, ME, LE],
      produce: [
        ['А длинного плана никто не стыдится.', 'And nobody is ashamed of a long plan.', []],
        ['Ведь в школе всем вбивали «дочитывай».', 'Since finishing was drilled into everybody at school.', []],
        ['И на чём держится привычка читать.', 'And which the reading habit depends on.', []],
        ['И поэтому два перевода читаются по-разному.', 'And is why two translations read differently.', []],
        ['А в том, чтобы история попала в голову.', 'But the story arriving in your head.', []],
        ['При условии, что перестаёте лезть в словарь.', 'Provided you stop looking things up.', []],
      ],
    },
  ],
}
