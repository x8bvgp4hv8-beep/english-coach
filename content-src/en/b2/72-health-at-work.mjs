// B2, блок 72 — Health at work. Здоровье и работа.
//
// Тематический блок: больничный, выгорание, разговор с начальником, возврат
// после болезни и границы. Модальные, пассив, осторожные формулы.

const SA = 'b2-tema-sanidad'
const CA = 'b1-tema-carrera'
const PS = 'b2-tema-psicologia'
const DE = 'b2-tema-derecho'
const LI = 'b2-linkers'

export default {
  slug: 'health-at-work',
  title: 'Здоровье и работа',
  subtitle: 'Больничный, выгорание и возвращение',
  canDo: [
    'брать больничный и говорить об этом',
    'обсуждать нагрузку с начальником',
    'описывать выгорание точно',
    'договариваться о возвращении',
    'ставить границы без конфликта',
  ],
  lessons: [
    {
      title: 'Working while ill',
      summary: 'Работать больным.',
      topics: [SA, CA, LI],
      dialogue: ['Больной на работе', [
        ['Anna', 'He came in with a fever, again.', 'Он снова пришёл с температурой.'],
        ['Ben', 'Which the company quietly rewards.', 'Что компания тихо поощряет.'],
        ['Anna', 'And which infected four people last winter.', 'И что прошлой зимой заразило четверых.'],
        ['Ben', 'Costing more than the day it saved.', 'Обойдясь дороже сэкономленного дня.'],
        ['Anna', 'Which somebody should put in a spreadsheet.', 'Кому-то стоило бы занести это в таблицу.'],
      ]],
      words: [
        ['came in with a fever', 'пришёл с температурой', 'He came in with a fever, again.'],
        ['the company quietly rewards', 'компания тихо поощряет', 'Which the company quietly rewards.'],
        ['infected four people', 'заразило четверых', 'And which infected four people last winter.'],
        ['Costing more than the day it saved', 'обойдясь дороже сэкономленного дня', 'Costing more than the day it saved.'],
        ['put in a spreadsheet', 'занести в таблицу', 'Which somebody should put in a spreadsheet.'],
      ],
      rule: ['Costing — причастие следствия', 'Costing more than the day it saved. Форма на -ing присоединяет последствие к действию.'],
      quiz: [
        ['«Обойдясь дороже сэкономленного дня» —', ['Costing more than the day it saved', 'Cost more than the day it saved', 'Costing more that the day it saved'], 0],
        ['«Что компания тихо поощряет» —', ['Which the company quietly rewards', 'Which the company quietly reward', 'Which the company quiet rewards'], 0],
        ['«Кому-то стоило бы занести это в таблицу» —', ['Which somebody should put in a spreadsheet', 'Which somebody should puts in a spreadsheet', 'Which somebody should to put in a spreadsheet'], 0],
      ],
      order: ['Он снова пришёл с температурой.', 'He came in with a fever, again.'],
      produce: [
        ['Он снова пришёл с температурой.', 'He came in with a fever, again.', []],
        ['И что прошлой зимой заразило четверых.', 'And which infected four people last winter.', []],
        ['Обойдясь дороже сэкономленного дня.', 'Costing more than the day it saved.', []],
      ],
    },
    {
      title: 'Telling them you are ill',
      summary: 'Сообщить, что вы болеете.',
      topics: [CA, LI, DE],
      dialogue: ['Сообщение', [
        ['Ben', 'Two lines: unwell, back Thursday, sorry.', 'Две строки: болею, вернусь в четверг, извините.'],
        ['Anna', 'Which is all anybody is entitled to.', 'Больше никто и не вправе требовать.'],
        ['Ben', 'And more than most people give.', 'И больше, чем даёт большинство.'],
        ['Anna', 'Since the details invite negotiation.', 'Ведь подробности приглашают к торгу.'],
        ['Ben', 'Which nobody wants, at thirty nine degrees.', 'Чего никому не хочется при тридцати девяти.'],
      ]],
      words: [
        ['unwell, back Thursday', 'болею, вернусь в четверг', 'Two lines: unwell, back Thursday, sorry.'],
        ['anybody is entitled to', 'вправе требовать', 'Which is all anybody is entitled to.'],
        ['more than most people give', 'больше, чем даёт большинство', 'And more than most people give.'],
        ['the details invite negotiation', 'подробности приглашают к торгу', 'Since the details invite negotiation.'],
        ['at thirty nine degrees', 'при тридцати девяти', 'Which nobody wants, at thirty nine degrees.'],
      ],
      rule: ['All + придаточное', 'All anybody is entitled to. Слово that опускается, предлог остаётся в конце.'],
      quiz: [
        ['«Больше никто и не вправе требовать» —', ['All anybody is entitled to', 'All anybody is entitled', 'All anybody is entitled for'], 0],
        ['«Ведь подробности приглашают к торгу» —', ['Since the details invite negotiation', 'Since the details invites negotiation', 'Since the details invite to negotiation'], 0],
        ['«Чего никому не хочется при тридцати девяти» —', ['Which nobody wants, at thirty nine degrees', 'Which nobody want, at thirty nine degrees', 'Which nobody wants, on thirty nine degrees'], 0],
      ],
      order: ['И больше, чем даёт большинство.', 'And more than most people give.'],
      produce: [
        ['Две строки: болею, вернусь в четверг, извините.', 'Two lines: unwell, back Thursday, sorry.', []],
        ['Больше никто и не вправе требовать.', 'Which is all anybody is entitled to.', []],
        ['Ведь подробности приглашают к торгу.', 'Since the details invite negotiation.', []],
      ],
    },
    {
      title: 'Naming burnout precisely',
      summary: 'Назвать выгорание точно.',
      topics: [PS, CA, LI],
      dialogue: ['Выгорание', [
        ['Anna', 'I have not been able to start anything since March.', 'С марта я не могу ничего начать.'],
        ['Ben', 'Which is a symptom, not a mood.', 'Это симптом, а не настроение.'],
        ['Anna', 'And is what a doctor can act on.', 'И с этим врач может что-то сделать.'],
        ['Ben', 'Unlike being tired, which everybody is.', 'В отличие от усталости, которая у всех.'],
        ['Anna', 'And which therefore persuades nobody.', 'И которая поэтому никого не убеждает.'],
      ]],
      words: [
        ['have not been able to start', 'не могу ничего начать', 'I have not been able to start anything since March.'],
        ['a symptom, not a mood', 'симптом, а не настроение', 'Which is a symptom, not a mood.'],
        ['a doctor can act on', 'врач может что-то сделать', 'And is what a doctor can act on.'],
        ['Unlike being tired', 'в отличие от усталости', 'Unlike being tired, which everybody is.'],
        ['persuades nobody', 'никого не убеждает', 'And which therefore persuades nobody.'],
      ],
      rule: ['Act on — предлог в конце', 'What a doctor can act on. Предлог остаётся в хвосте придаточного.'],
      quiz: [
        ['«И с этим врач может что-то сделать» —', ['And is what a doctor can act on', 'And is what a doctor can act', 'And is that a doctor can act on'], 0],
        ['«С марта я не могу ничего начать» —', ['I have not been able to start anything since March', 'I have not been able start anything since March', 'I am not been able to start anything since March'], 0],
        ['«В отличие от усталости, которая у всех» —', ['Unlike being tired, which everybody is', 'Unlike be tired, which everybody is', 'Unlike being tired, which everybody are'], 0],
      ],
      order: ['Это симптом, а не настроение.', 'Which is a symptom, not a mood.'],
      produce: [
        ['С марта я не могу ничего начать.', 'I have not been able to start anything since March.', []],
        ['И с этим врач может что-то сделать.', 'And is what a doctor can act on.', []],
        ['И которая поэтому никого не убеждает.', 'And which therefore persuades nobody.', []],
      ],
    },
    {
      title: 'The conversation with the manager',
      summary: 'Разговор с начальником.',
      topics: [CA, PS, LI],
      dialogue: ['Разговор', [
        ['Ben', 'I brought a list of what I would drop.', 'Я принёс список того, что сниму с себя.'],
        ['Anna', 'Rather than a description of how I feel.', 'А не описание того, как я себя чувствую.'],
        ['Ben', 'Which managers can do nothing with.', 'С чем менеджер ничего сделать не может.'],
        ['Anna', 'And which most conversations consist of.', 'И из чего состоит большинство разговоров.'],
        ['Ben', 'Which is why they end in nothing.', 'Поэтому они ничем и кончаются.'],
      ]],
      words: [
        ['a list of what I would drop', 'список того, что сниму с себя', 'I brought a list of what I would drop.'],
        ['a description of how I feel', 'описание того, как я себя чувствую', 'Rather than a description of how I feel.'],
        ['can do nothing with', 'ничего не может сделать с', 'Which managers can do nothing with.'],
        ['most conversations consist of', 'из чего состоит большинство разговоров', 'And which most conversations consist of.'],
        ['end in nothing', 'кончаются ничем', 'Which is why they end in nothing.'],
      ],
      rule: ['Consist of — предлог в конце', 'What most conversations consist of. Предлог сохраняется и уходит в хвост.'],
      quiz: [
        ['«И из чего состоит большинство разговоров» —', ['And which most conversations consist of', 'And which most conversations consist', 'And which most conversations consists of'], 0],
        ['«А не описание того, как я себя чувствую» —', ['Rather than a description of how I feel', 'Rather than a description of how do I feel', 'Rather than a description of how I feels'], 0],
        ['«Поэтому они ничем и кончаются» —', ['Which is why they end in nothing', 'Which is why they ends in nothing', 'Which is why they end in anything'], 0],
      ],
      order: ['Я принёс список того, что сниму с себя.', 'I brought a list of what I would drop.'],
      produce: [
        ['Я принёс список того, что сниму с себя.', 'I brought a list of what I would drop.', []],
        ['С чем менеджер ничего сделать не может.', 'Which managers can do nothing with.', []],
        ['И из чего состоит большинство разговоров.', 'And which most conversations consist of.', []],
      ],
    },
    {
      title: 'Coming back part time',
      summary: 'Вернуться на неполный день.',
      topics: [DE, CA, LI],
      dialogue: ['Возвращение', [
        ['Anna', 'Three days, for the first eight weeks.', 'Три дня, первые восемь недель.'],
        ['Ben', 'Which is written down and dated.', 'Что записано и датировано.'],
        ['Anna', 'And reviewed, rather than assumed.', 'И пересматривается, а не подразумевается.'],
        ['Ben', 'Since a vague return becomes full time by Friday.', 'Ведь размытое возвращение к пятнице становится полным.'],
        ['Anna', 'Which everybody has watched happen.', 'Что все видели своими глазами.'],
      ]],
      words: [
        ['for the first eight weeks', 'первые восемь недель', 'Three days, for the first eight weeks.'],
        ['written down and dated', 'записано и датировано', 'Which is written down and dated.'],
        ['reviewed, rather than assumed', 'пересматривается, а не подразумевается', 'And reviewed, rather than assumed.'],
        ['a vague return', 'размытое возвращение', 'Since a vague return becomes full time by Friday.'],
        ['has watched happen', 'видел, как это происходит', 'Which everybody has watched happen.'],
      ],
      rule: ['Watch something happen', 'Everybody has watched it happen. После watch идёт голый инфинитив.'],
      quiz: [
        ['«Что все видели своими глазами» —', ['Which everybody has watched happen', 'Which everybody has watched to happen', 'Which everybody have watched happen'], 0],
        ['«И пересматривается, а не подразумевается» —', ['And reviewed, rather than assumed', 'And reviewed, rather than assuming', 'And review, rather than assumed'], 0],
        ['«Ведь размытое возвращение к пятнице становится полным» —', ['Since a vague return becomes full time by Friday', 'Since a vague return become full time by Friday', 'Since a vague return becomes full time until Friday'], 0],
      ],
      order: ['Три дня, первые восемь недель.', 'Three days, for the first eight weeks.'],
      produce: [
        ['Три дня, первые восемь недель.', 'Three days, for the first eight weeks.', []],
        ['Что записано и датировано.', 'Which is written down and dated.', []],
        ['Что все видели своими глазами.', 'Which everybody has watched happen.', []],
      ],
    },
    {
      title: 'What you are allowed',
      summary: 'На что вы имеете право.',
      topics: [DE, SA, LI],
      dialogue: ['Права', [
        ['Ben', 'The policy allows six days without a note.', 'Правила разрешают шесть дней без справки.'],
        ['Anna', 'Which almost nobody in the office knows.', 'О чём в офисе почти никто не знает.'],
        ['Ben', 'And which is on page eleven, unread.', 'И что лежит на одиннадцатой странице, непрочитанным.'],
        ['Anna', 'Where every useful sentence lives.', 'Там и живёт каждая полезная фраза.'],
        ['Ben', 'Which is worth one evening, once.', 'Что стоит одного вечера, однажды.'],
      ]],
      words: [
        ['allows six days without a note', 'разрешают шесть дней без справки', 'The policy allows six days without a note.'],
        ['almost nobody knows', 'почти никто не знает', 'Which almost nobody in the office knows.'],
        ['on page eleven, unread', 'на одиннадцатой странице, непрочитанным', 'And which is on page eleven, unread.'],
        ['every useful sentence lives', 'живёт каждая полезная фраза', 'Where every useful sentence lives.'],
        ['worth one evening, once', 'стоит одного вечера однажды', 'Which is worth one evening, once.'],
      ],
      rule: ['Allow + существительное без to', 'The policy allows six days. После allow идёт прямое дополнение без предлога.'],
      quiz: [
        ['«Правила разрешают шесть дней без справки» —', ['The policy allows six days without a note', 'The policy allow six days without a note', 'The policy allows six days without note'], 0],
        ['«Там и живёт каждая полезная фраза» —', ['Where every useful sentence lives', 'Where every useful sentence live', 'Where every useful sentences lives'], 0],
        ['«О чём в офисе почти никто не знает» —', ['Which almost nobody in the office knows', 'Which almost nobody in the office know', 'Which almost nobody on the office knows'], 0],
      ],
      order: ['Что стоит одного вечера, однажды.', 'Which is worth one evening, once.'],
      produce: [
        ['Правила разрешают шесть дней без справки.', 'The policy allows six days without a note.', []],
        ['О чём в офисе почти никто не знает.', 'Which almost nobody in the office knows.', []],
        ['Там и живёт каждая полезная фраза.', 'Where every useful sentence lives.', []],
      ],
    },
    {
      title: 'The colleague who covers',
      summary: 'Коллега, который прикрывает.',
      topics: [CA, PS, LI],
      dialogue: ['Прикрытие', [
        ['Anna', 'Somebody did my job for nine days.', 'Кто-то делал мою работу девять дней.'],
        ['Ben', 'Which was noticed by nobody above.', 'Чего наверху никто не заметил.'],
        ['Anna', 'And which I said out loud, in the meeting.', 'И о чём я сказала вслух, на встрече.'],
        ['Ben', 'Which costs nothing and is remembered for years.', 'Что ничего не стоит и помнится годами.'],
        ['Anna', 'By the only person who matters here.', 'Тем единственным человеком, который тут важен.'],
      ]],
      words: [
        ['did my job for nine days', 'делал мою работу девять дней', 'Somebody did my job for nine days.'],
        ['noticed by nobody above', 'наверху никто не заметил', 'Which was noticed by nobody above.'],
        ['I said out loud', 'я сказала вслух', 'And which I said out loud, in the meeting.'],
        ['is remembered for years', 'помнится годами', 'Which costs nothing and is remembered for years.'],
        ['the only person who matters', 'единственный, кто важен', 'By the only person who matters here.'],
      ],
      rule: ['By nobody — исполнитель в пассиве', 'It was noticed by nobody above. Отрицательное местоимение может стоять после by.'],
      quiz: [
        ['«Чего наверху никто не заметил» —', ['Which was noticed by nobody above', 'Which was not noticed by nobody above', 'Which were noticed by nobody above'], 0],
        ['«Что ничего не стоит и помнится годами» —', ['Which costs nothing and is remembered for years', 'Which cost nothing and is remembered for years', 'Which costs nothing and is remember for years'], 0],
        ['«Тем единственным человеком, который тут важен» —', ['By the only person who matters here', 'By the only person who matter here', 'By the only person what matters here'], 0],
      ],
      order: ['Кто-то делал мою работу девять дней.', 'Somebody did my job for nine days.'],
      produce: [
        ['Кто-то делал мою работу девять дней.', 'Somebody did my job for nine days.', []],
        ['Чего наверху никто не заметил.', 'Which was noticed by nobody above.', []],
        ['Что ничего не стоит и помнится годами.', 'Which costs nothing and is remembered for years.', []],
      ],
    },
    {
      title: 'The line you hold',
      summary: 'Граница, которую держишь.',
      topics: [PS, CA, LI],
      dialogue: ['Итог', [
        ['Ben', 'I answer nothing after seven, and say so.', 'После семи я не отвечаю и говорю об этом.'],
        ['Anna', 'Which cost me one difficult month.', 'Что стоило мне одного трудного месяца.'],
        ['Ben', 'And has cost me nothing since.', 'И с тех пор не стоило ничего.'],
        ['Anna', 'Since a stated line is easier to respect.', 'Ведь заявленную границу уважать легче.'],
        ['Ben', 'Than one everybody has to guess at.', 'Чем ту, о которой все должны догадываться.'],
      ]],
      words: [
        ['answer nothing after seven', 'после семи не отвечаю', 'I answer nothing after seven, and say so.'],
        ['one difficult month', 'один трудный месяц', 'Which cost me one difficult month.'],
        ['has cost me nothing since', 'с тех пор не стоило ничего', 'And has cost me nothing since.'],
        ['a stated line', 'заявленная граница', 'Since a stated line is easier to respect.'],
        ['guess at', 'догадываться о', 'Than one everybody has to guess at.'],
      ],
      rule: ['Здоровье на работе — это список и дата', 'Что снимаю, к какому сроку и на каких условиях возвращаюсь — три пункта, которые заменяют весь разговор о самочувствии.'],
      quiz: [
        ['«Чем ту, о которой все должны догадываться» —', ['Than one everybody has to guess at', 'Than one everybody has to guess', 'Than one everybody have to guess at'], 0],
        ['«Ведь заявленную границу уважать легче» —', ['Since a stated line is easier to respect', 'Since a stated line is easier to respecting', 'Since a stated line is more easy to respect'], 0],
        ['«И с тех пор не стоило ничего» —', ['And has cost me nothing since', 'And has cost me anything since', 'And have cost me nothing since'], 0],
      ],
      order: ['После семи я не отвечаю и говорю об этом.', 'I answer nothing after seven, and say so.'],
      produce: [
        ['После семи я не отвечаю и говорю об этом.', 'I answer nothing after seven, and say so.', []],
        ['Что стоило мне одного трудного месяца.', 'Which cost me one difficult month.', []],
        ['Ведь заявленную границу уважать легче.', 'Since a stated line is easier to respect.', []],
      ],
    },
    {
      checkpoint: true,
      title: 'Проверка: здоровье и работа',
      summary: 'Шесть фраз без подсказок.',
      topics: [SA, CA, PS, DE],
      produce: [
        ['Обойдясь дороже сэкономленного дня.', 'Costing more than the day it saved.', []],
        ['Больше никто и не вправе требовать.', 'Which is all anybody is entitled to.', []],
        ['И с этим врач может что-то сделать.', 'And is what a doctor can act on.', []],
        ['И из чего состоит большинство разговоров.', 'And which most conversations consist of.', []],
        ['Что все видели своими глазами.', 'Which everybody has watched happen.', []],
        ['Правила разрешают шесть дней без справки.', 'The policy allows six days without a note.', []],
      ],
    },
  ],
}
