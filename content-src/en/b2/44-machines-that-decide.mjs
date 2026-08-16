// B2, блок 44 — Machines that decide. Машины, которые решают.
//
// Тематический блок: алгоритмы в найме, кредитах, пособиях и модерации.
// Пассив, безличные формулы, требование назвать ответственного.

const ET = 'b2-tema-etica'
const DA = 'b2-tema-datos'
const DE = 'b2-tema-derecho'
const CA = 'b1-tema-carrera'
const LI = 'b2-linkers'

export default {
  slug: 'machines-that-decide',
  title: 'Машины, которые решают',
  subtitle: 'Найм, кредиты, пособия и модерация',
  canDo: [
    'обсуждать автоматические решения',
    'требовать объяснения отказа',
    'говорить о предвзятости данных',
    'спорить об ответственности',
    'просить пересмотра человеком',
  ],
  lessons: [
    {
      title: 'The application that never reached a person',
      summary: 'Заявка, не дошедшая до человека.',
      topics: [CA, ET, LI],
      dialogue: ['Отбор', [
        ['Anna', 'The rejection arrived in four minutes.', 'Отказ пришёл через четыре минуты.'],
        ['Ben', 'Which no human being produced.', 'Ни один человек его не составлял.'],
        ['Anna', 'And which nobody can therefore explain.', 'И поэтому никто не может его объяснить.'],
        ['Ben', 'Beyond the word criteria.', 'Кроме слова «критерии».'],
        ['Anna', 'Which is doing a great deal of work there.', 'Слово там тянет на себе очень многое.'],
      ]],
      words: [
        ['The rejection arrived', 'отказ пришёл', 'The rejection arrived in four minutes.'],
        ['no human being produced', 'ни один человек не составлял', 'Which no human being produced.'],
        ['nobody can explain', 'никто не может объяснить', 'And which nobody can therefore explain.'],
        ['Beyond the word criteria', 'кроме слова «критерии»', 'Beyond the word criteria.'],
        ['doing a great deal of work', 'тянет на себе многое', 'Which is doing a great deal of work there.'],
      ],
      rule: ['Therefore внутри придаточного', 'Which nobody can therefore explain. Наречие стоит после модального глагола и связывает вывод с причиной.'],
      quiz: [
        ['«И поэтому никто не может его объяснить» —', ['And which nobody can therefore explain', 'And which nobody can therefore explains', 'And which nobody therefore can to explain'], 0],
        ['«Отказ пришёл через четыре минуты» —', ['The rejection arrived in four minutes', 'The rejection arrived on four minutes', 'The rejection arrive in four minutes'], 0],
        ['«Ни один человек его не составлял» —', ['Which no human being produced', 'Which no human being produce', 'Which not human being produced'], 0],
      ],
      order: ['Кроме слова «критерии».', 'Beyond the word criteria.'],
      produce: [
        ['Отказ пришёл через четыре минуты.', 'The rejection arrived in four minutes.', []],
        ['Ни один человек его не составлял.', 'Which no human being produced.', []],
        ['И поэтому никто не может его объяснить.', 'And which nobody can therefore explain.', []],
      ],
    },
    {
      title: 'Bias in the training data',
      summary: 'Предвзятость в данных.',
      topics: [DA, ET, LI],
      dialogue: ['Данные', [
        ['Ben', 'It learned from ten years of our hiring.', 'Он учился на десяти годах нашего найма.'],
        ['Anna', 'Which was not fair, as we now admit.', 'Который был несправедлив, как мы теперь признаём.'],
        ['Ben', 'So it reproduced the pattern, faithfully.', 'И он воспроизвёл схему, добросовестно.'],
        ['Anna', 'Which is exactly what it was asked to do.', 'Именно это его и просили сделать.'],
        ['Ben', 'And is nobody fault, apparently.', 'И, судя по всему, ничья вина.'],
      ]],
      words: [
        ['learned from ten years', 'учился на десяти годах', 'It learned from ten years of our hiring.'],
        ['as we now admit', 'как мы теперь признаём', 'Which was not fair, as we now admit.'],
        ['reproduced the pattern', 'воспроизвёл схему', 'So it reproduced the pattern, faithfully.'],
        ['what it was asked to do', 'что его просили сделать', 'Which is exactly what it was asked to do.'],
        ['nobody fault, apparently', 'ничья вина, судя по всему', 'And is nobody fault, apparently.'],
      ],
      rule: ['Was asked to do — пассив с инфинитивом', 'What it was asked to do. Форма называет задачу, не называя заказчика.'],
      quiz: [
        ['«Именно это его и просили сделать» —', ['Which is exactly what it was asked to do', 'Which is exactly what it was ask to do', 'Which is exactly that it was asked to do'], 0],
        ['«И он воспроизвёл схему, добросовестно» —', ['So it reproduced the pattern, faithfully', 'So it reproduce the pattern, faithfully', 'So it reproduced the pattern, faithful'], 0],
        ['«Который был несправедлив, как мы теперь признаём» —', ['Which was not fair, as we now admit', 'Which was not fair, how we now admit', 'Which were not fair, as we now admit'], 0],
      ],
      order: ['Он учился на десяти годах нашего найма.', 'It learned from ten years of our hiring.'],
      produce: [
        ['Он учился на десяти годах нашего найма.', 'It learned from ten years of our hiring.', []],
        ['И он воспроизвёл схему, добросовестно.', 'So it reproduced the pattern, faithfully.', []],
        ['Именно это его и просили сделать.', 'Which is exactly what it was asked to do.', []],
      ],
    },
    {
      title: 'The right to an explanation',
      summary: 'Право на объяснение.',
      topics: [DE, ET, LI],
      dialogue: ['Объяснение', [
        ['Anna', 'You are entitled to a reason in writing.', 'Вы имеете право на письменную причину.'],
        ['Ben', 'Which most people never ask for.', 'О чём большинство никогда не просит.'],
        ['Anna', 'And which is rarely offered unprompted.', 'И что редко предлагают без запроса.'],
        ['Ben', 'Though the law has said so for years.', 'Хотя закон говорит это уже годами.'],
        ['Anna', 'Which only helps those who read it.', 'Что помогает только тем, кто его читал.'],
      ]],
      words: [
        ['are entitled to a reason', 'имеете право на причину', 'You are entitled to a reason in writing.'],
        ['never ask for', 'никогда не просит', 'Which most people never ask for.'],
        ['rarely offered unprompted', 'редко предлагают без запроса', 'And which is rarely offered unprompted.'],
        ['the law has said so', 'закон говорит это', 'Though the law has said so for years.'],
        ['those who read it', 'те, кто его читал', 'Which only helps those who read it.'],
      ],
      rule: ['Be entitled to something', 'You are entitled to a reason. После entitled идёт предлог to и существительное.'],
      quiz: [
        ['«Вы имеете право на письменную причину» —', ['You are entitled to a reason in writing', 'You are entitled for a reason in writing', 'You are entitle to a reason in writing'], 0],
        ['«И что редко предлагают без запроса» —', ['And which is rarely offered unprompted', 'And which is rarely offer unprompted', 'And which is rare offered unprompted'], 0],
        ['«Что помогает только тем, кто его читал» —', ['Which only helps those who read it', 'Which only help those who read it', 'Which only helps those what read it'], 0],
      ],
      order: ['Хотя закон говорит это уже годами.', 'Though the law has said so for years.'],
      produce: [
        ['Вы имеете право на письменную причину.', 'You are entitled to a reason in writing.', []],
        ['О чём большинство никогда не просит.', 'Which most people never ask for.', []],
        ['Что помогает только тем, кто его читал.', 'Which only helps those who read it.', []],
      ],
    },
    {
      title: 'Credit scored',
      summary: 'Кредитный балл.',
      topics: [DA, DE, LI],
      dialogue: ['Скоринг', [
        ['Ben', 'The score fell because of the postcode.', 'Балл упал из-за индекса.'],
        ['Anna', 'Which is not supposed to be a factor.', 'Который не должен быть фактором.'],
        ['Ben', 'And is not, officially, in the model.', 'И официально в модели его нет.'],
        ['Anna', 'Though four other fields carry it.', 'Хотя его несут четыре других поля.'],
        ['Ben', 'Which is the oldest trick in the file.', 'Старейший фокус в этом деле.'],
      ]],
      words: [
        ['The score fell', 'балл упал', 'The score fell because of the postcode.'],
        ['not supposed to be a factor', 'не должен быть фактором', 'Which is not supposed to be a factor.'],
        ['officially, in the model', 'официально в модели', 'And is not, officially, in the model.'],
        ['four other fields carry it', 'четыре других поля несут его', 'Though four other fields carry it.'],
        ['the oldest trick', 'старейший фокус', 'Which is the oldest trick in the file.'],
      ],
      rule: ['Be supposed to — норма и ожидание', 'It is not supposed to be a factor. Оборот говорит о том, как должно быть по правилам.'],
      quiz: [
        ['«Который не должен быть фактором» —', ['Which is not supposed to be a factor', 'Which is not suppose to be a factor', 'Which is not supposed being a factor'], 0],
        ['«Хотя его несут четыре других поля» —', ['Though four other fields carry it', 'Though four other fields carries it', 'Though four others fields carry it'], 0],
        ['«Балл упал из-за индекса» —', ['The score fell because of the postcode', 'The score fell because the postcode', 'The score fall because of the postcode'], 0],
      ],
      order: ['Старейший фокус в этом деле.', 'Which is the oldest trick in the file.'],
      produce: [
        ['Балл упал из-за индекса.', 'The score fell because of the postcode.', []],
        ['Который не должен быть фактором.', 'Which is not supposed to be a factor.', []],
        ['Хотя его несут четыре других поля.', 'Though four other fields carry it.', []],
      ],
    },
    {
      title: 'Benefits stopped by software',
      summary: 'Пособие остановила программа.',
      topics: [ET, DE, LI],
      dialogue: ['Пособие', [
        ['Anna', 'Her payments were suspended automatically.', 'Её выплаты приостановили автоматически.'],
        ['Ben', 'Pending a review that took eleven weeks.', 'До проверки, которая заняла одиннадцать недель.'],
        ['Anna', 'During which she was told to wait.', 'В течение которых ей велели ждать.'],
        ['Ben', 'By a letter with no name on it.', 'Письмом без единого имени.'],
        ['Anna', 'Which is the part I cannot accept.', 'Именно с этим я не могу смириться.'],
      ]],
      words: [
        ['were suspended automatically', 'приостановили автоматически', 'Her payments were suspended automatically.'],
        ['Pending a review', 'до проверки', 'Pending a review that took eleven weeks.'],
        ['During which', 'в течение которых', 'During which she was told to wait.'],
        ['with no name on it', 'без единого имени', 'By a letter with no name on it.'],
        ['I cannot accept', 'не могу смириться', 'Which is the part I cannot accept.'],
      ],
      rule: ['During which — предлог перед which', 'During which she was told to wait. Оборот связывает срок с тем, что в нём происходило.'],
      quiz: [
        ['«В течение которых ей велели ждать» —', ['During which she was told to wait', 'During which she was told wait', 'During what she was told to wait'], 0],
        ['«Её выплаты приостановили автоматически» —', ['Her payments were suspended automatically', 'Her payments was suspended automatically', 'Her payments were suspend automatically'], 0],
        ['«Письмом без единого имени» —', ['By a letter with no name on it', 'By a letter with not name on it', 'By a letter without no name on it'], 0],
      ],
      order: ['До проверки, которая заняла одиннадцать недель.', 'Pending a review that took eleven weeks.'],
      produce: [
        ['Её выплаты приостановили автоматически.', 'Her payments were suspended automatically.', []],
        ['В течение которых ей велели ждать.', 'During which she was told to wait.', []],
        ['Именно с этим я не могу смириться.', 'Which is the part I cannot accept.', []],
      ],
    },
    {
      title: 'Asking for a human',
      summary: 'Попросить человека.',
      topics: [DE, ET, LI],
      dialogue: ['Человек', [
        ['Ben', 'I requested a review by a person.', 'Я запросил пересмотр человеком.'],
        ['Anna', 'Which is the sentence that unlocks it.', 'Фраза, которая всё открывает.'],
        ['Ben', 'And which support staff rarely volunteer.', 'И которую поддержка редко предлагает сама.'],
        ['Anna', 'Since it costs them twenty minutes.', 'Ведь она стоит им двадцати минут.'],
        ['Ben', 'And costs me nothing to say.', 'А мне не стоит ничего.'],
      ]],
      words: [
        ['requested a review by a person', 'запросил пересмотр человеком', 'I requested a review by a person.'],
        ['the sentence that unlocks it', 'фраза, которая всё открывает', 'Which is the sentence that unlocks it.'],
        ['rarely volunteer', 'редко предлагают сами', 'And which support staff rarely volunteer.'],
        ['costs them twenty minutes', 'стоит им двадцати минут', 'Since it costs them twenty minutes.'],
        ['costs me nothing to say', 'мне не стоит ничего', 'And costs me nothing to say.'],
      ],
      rule: ['Request как формальный глагол', 'I requested a review. Глагол не требует for и звучит официальнее, чем ask.'],
      quiz: [
        ['«Я запросил пересмотр человеком» —', ['I requested a review by a person', 'I requested for a review by a person', 'I request a review by a person'], 0],
        ['«И которую поддержка редко предлагает сама» —', ['And which support staff rarely volunteer', 'And which support staff rarely volunteers it', 'And which support staff rare volunteer'], 0],
        ['«Ведь она стоит им двадцати минут» —', ['Since it costs them twenty minutes', 'Since it cost them twenty minutes', 'Since it costs to them twenty minutes'], 0],
      ],
      order: ['А мне не стоит ничего.', 'And costs me nothing to say.'],
      produce: [
        ['Я запросил пересмотр человеком.', 'I requested a review by a person.', []],
        ['Фраза, которая всё открывает.', 'Which is the sentence that unlocks it.', []],
        ['Ведь она стоит им двадцати минут.', 'Since it costs them twenty minutes.', []],
      ],
    },
    {
      title: 'Moderation at scale',
      summary: 'Модерация в масштабе.',
      topics: [ET, DA, LI],
      dialogue: ['Модерация', [
        ['Anna', 'A million posts an hour cannot be read.', 'Миллион постов в час прочитать нельзя.'],
        ['Ben', 'Which is an argument for machines.', 'Это аргумент в пользу машин.'],
        ['Anna', 'And not an argument against appeals.', 'И не аргумент против апелляций.'],
        ['Ben', 'Which is where the two get confused.', 'Именно тут эти два и путают.'],
        ['Anna', 'Usually on purpose, in the press release.', 'Обычно нарочно, в пресс-релизе.'],
      ]],
      words: [
        ['A million posts an hour', 'миллион постов в час', 'A million posts an hour cannot be read.'],
        ['an argument for machines', 'аргумент в пользу машин', 'Which is an argument for machines.'],
        ['an argument against appeals', 'аргумент против апелляций', 'And not an argument against appeals.'],
        ['the two get confused', 'эти два путают', 'Which is where the two get confused.'],
        ['on purpose', 'нарочно', 'Usually on purpose, in the press release.'],
      ],
      rule: ['Argument for и against', 'An argument for machines, not against appeals. Предлоги задают направление довода.'],
      quiz: [
        ['«И не аргумент против апелляций» —', ['And not an argument against appeals', 'And not an argument for against appeals', 'And not an argument against of appeals'], 0],
        ['«Миллион постов в час прочитать нельзя» —', ['A million posts an hour cannot be read', 'A million posts an hour cannot be readed', 'A million post an hour cannot be read'], 0],
        ['«Обычно нарочно, в пресс-релизе» —', ['Usually on purpose, in the press release', 'Usually in purpose, in the press release', 'Usually on purpose, on the press release'], 0],
      ],
      order: ['Это аргумент в пользу машин.', 'Which is an argument for machines.'],
      produce: [
        ['Миллион постов в час прочитать нельзя.', 'A million posts an hour cannot be read.', []],
        ['И не аргумент против апелляций.', 'And not an argument against appeals.', []],
        ['Обычно нарочно, в пресс-релизе.', 'Usually on purpose, in the press release.', []],
      ],
    },
    {
      title: 'Who signs it',
      summary: 'Кто подписывает.',
      topics: [ET, DE, LI],
      dialogue: ['Подпись', [
        ['Ben', 'Every decision should carry a name.', 'Под каждым решением должно стоять имя.'],
        ['Anna', 'Which changes the decisions themselves.', 'Это меняет и сами решения.'],
        ['Ben', 'As anybody who has signed one knows.', 'Как знает всякий, кто хоть раз подписывал.'],
        ['Anna', 'And which no system objects to.', 'И против чего ни одна система не возражает.'],
        ['Ben', 'Only the people running it.', 'Возражают только те, кто ею управляет.'],
      ]],
      words: [
        ['should carry a name', 'должно нести имя', 'Every decision should carry a name.'],
        ['the decisions themselves', 'сами решения', 'Which changes the decisions themselves.'],
        ['anybody who has signed one', 'всякий, кто подписывал', 'As anybody who has signed one knows.'],
        ['no system objects to', 'ни одна система не возражает', 'And which no system objects to.'],
        ['the people running it', 'те, кто ею управляет', 'Only the people running it.'],
      ],
      rule: ['Автоматическое решение всё равно чьё-то', 'Требование имени под решением возвращает разговор из пассива в ответственность.'],
      quiz: [
        ['«И против чего ни одна система не возражает» —', ['And which no system objects to', 'And which no system objects', 'And which no system object to'], 0],
        ['«Как знает всякий, кто хоть раз подписывал» —', ['As anybody who has signed one knows', 'As anybody who has signed one know', 'As anybody what has signed one knows'], 0],
        ['«Это меняет и сами решения» —', ['Which changes the decisions themselves', 'Which changes the decisions itself', 'Which change the decisions themselves'], 0],
      ],
      order: ['Возражают только те, кто ею управляет.', 'Only the people running it.'],
      produce: [
        ['Под каждым решением должно стоять имя.', 'Every decision should carry a name.', []],
        ['Это меняет и сами решения.', 'Which changes the decisions themselves.', []],
        ['И против чего ни одна система не возражает.', 'And which no system objects to.', []],
      ],
    },
    {
      checkpoint: true,
      title: 'Проверка: машины, которые решают',
      summary: 'Шесть фраз без подсказок.',
      topics: [ET, DA, DE, CA],
      produce: [
        ['И поэтому никто не может его объяснить.', 'And which nobody can therefore explain.', []],
        ['Именно это его и просили сделать.', 'Which is exactly what it was asked to do.', []],
        ['Вы имеете право на письменную причину.', 'You are entitled to a reason in writing.', []],
        ['Который не должен быть фактором.', 'Which is not supposed to be a factor.', []],
        ['В течение которых ей велели ждать.', 'During which she was told to wait.', []],
        ['Я запросил пересмотр человеком.', 'I requested a review by a person.', []],
      ],
    },
  ],
}
