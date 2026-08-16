// B2, блок 40 — Money nobody talks about. Деньги, о которых молчат.
//
// Тематический блок: зарплаты друзей, долги, займы близким, наследство и
// стыд. Условные, осторожные формулы и умение задать прямой вопрос мягко.

const RI = 'b2-tema-riesgo'
const RE = 'b2-tema-relaciones'
const SO = 'b2-tema-sociedad'
const CA = 'b1-tema-carrera'
const PS = 'b2-tema-psicologia'
const LI = 'b2-linkers'

export default {
  slug: 'money-nobody-talks-about',
  title: 'Деньги, о которых молчат',
  subtitle: 'Зарплаты, долги, займы близким',
  canDo: [
    'спрашивать про зарплату, не переходя границ',
    'говорить о долге без стыда',
    'отказывать в займе близкому',
    'обсуждать неравенство в семье',
    'договариваться о совместных тратах',
  ],
  lessons: [
    {
      title: 'What everyone earns',
      summary: 'Кто сколько зарабатывает.',
      topics: [CA, SO, LI],
      dialogue: ['Зарплаты', [
        ['Anna', 'Nobody here knows what anybody earns.', 'Здесь никто не знает, кто сколько получает.'],
        ['Ben', 'Which only helps one side of the table.', 'Что помогает только одной стороне стола.'],
        ['Anna', 'And is presented as good manners.', 'И подаётся как хорошие манеры.'],
        ['Ben', 'Whereas in some countries it is public.', 'Тогда как в некоторых странах это публично.'],
        ['Anna', 'Where the gaps are measurably smaller.', 'И разрывы там измеримо меньше.'],
      ]],
      words: [
        ['what anybody earns', 'кто сколько получает', 'Nobody here knows what anybody earns.'],
        ['one side of the table', 'одна сторона стола', 'Which only helps one side of the table.'],
        ['presented as good manners', 'подаётся как хорошие манеры', 'And is presented as good manners.'],
        ['in some countries it is public', 'в некоторых странах публично', 'Whereas in some countries it is public.'],
        ['the gaps are smaller', 'разрывы меньше', 'Where the gaps are measurably smaller.'],
      ],
      rule: ['Косвенный вопрос внутри отрицания', 'Nobody knows what anybody earns. Порядок слов прямой, вспомогательный глагол не нужен.'],
      quiz: [
        ['«Здесь никто не знает, кто сколько получает» —', ['Nobody here knows what anybody earns', 'Nobody here knows what does anybody earn', 'Nobody here know what anybody earns'], 0],
        ['«И подаётся как хорошие манеры» —', ['And is presented as good manners', 'And is present as good manners', 'And is presented like good manners of'], 0],
        ['«И разрывы там измеримо меньше» —', ['Where the gaps are measurably smaller', 'Where the gaps are measurable smaller', 'Where the gaps is measurably smaller'], 0],
      ],
      order: ['Что помогает только одной стороне стола.', 'Which only helps one side of the table.'],
      produce: [
        ['Здесь никто не знает, кто сколько получает.', 'Nobody here knows what anybody earns.', []],
        ['И подаётся как хорошие манеры.', 'And is presented as good manners.', []],
        ['Тогда как в некоторых странах это публично.', 'Whereas in some countries it is public.', []],
      ],
    },
    {
      title: 'Asking a friend',
      summary: 'Спросить друга.',
      topics: [RE, CA, LI],
      dialogue: ['Вопрос другу', [
        ['Ben', 'Would you mind telling me your range?', 'Не подскажешь свою вилку?'],
        ['Anna', 'Which is easier than asking the number.', 'Это легче, чем спрашивать точную цифру.'],
        ['Ben', 'And gives me everything I needed.', 'И даёт мне всё, что было нужно.'],
        ['Anna', 'Since the range is where the offer sits.', 'Ведь оффер лежит внутри вилки.'],
        ['Ben', 'And nobody feels examined.', 'И никто не чувствует себя под допросом.'],
      ]],
      words: [
        ['Would you mind telling me', 'не подскажешь', 'Would you mind telling me your range?'],
        ['easier than asking the number', 'легче, чем спрашивать цифру', 'Which is easier than asking the number.'],
        ['everything I needed', 'всё, что было нужно', 'And gives me everything I needed.'],
        ['where the offer sits', 'где лежит оффер', 'Since the range is where the offer sits.'],
        ['feels examined', 'чувствует себя под допросом', 'And nobody feels examined.'],
      ],
      rule: ['Would you mind + герундий', 'Would you mind telling me. Вежливая просьба требует формы на -ing, а не инфинитива.'],
      quiz: [
        ['«Не подскажешь свою вилку?» —', ['Would you mind telling me your range?', 'Would you mind to tell me your range?', 'Would you mind tell me your range?'], 0],
        ['«Это легче, чем спрашивать точную цифру» —', ['Which is easier than asking the number', 'Which is easier than ask the number', 'Which is more easy than asking the number'], 0],
        ['«И никто не чувствует себя под допросом» —', ['And nobody feels examined', 'And nobody feel examined', 'And nobody feels examining'], 0],
      ],
      order: ['И даёт мне всё, что было нужно.', 'And gives me everything I needed.'],
      produce: [
        ['Не подскажешь свою вилку?', 'Would you mind telling me your range?', []],
        ['Это легче, чем спрашивать точную цифру.', 'Which is easier than asking the number.', []],
        ['И никто не чувствует себя под допросом.', 'And nobody feels examined.', []],
      ],
    },
    {
      title: 'The debt',
      summary: 'Долг.',
      topics: [RI, PS, LI],
      dialogue: ['Долг', [
        ['Anna', 'I owed eleven thousand at one point.', 'В какой-то момент я была должна одиннадцать тысяч.'],
        ['Ben', 'Which you told nobody for two years.', 'О чём вы два года никому не говорили.'],
        ['Anna', 'Because debt is treated as a character flaw.', 'Потому что долг считают изъяном характера.'],
        ['Ben', 'Rather than a cash flow problem.', 'А не проблемой денежного потока.'],
        ['Anna', 'Which is what it actually is.', 'Чем он на самом деле и является.'],
      ]],
      words: [
        ['owed eleven thousand', 'была должна одиннадцать тысяч', 'I owed eleven thousand at one point.'],
        ['told nobody for two years', 'два года никому не говорили', 'Which you told nobody for two years.'],
        ['treated as a character flaw', 'считают изъяном характера', 'Because debt is treated as a character flaw.'],
        ['a cash flow problem', 'проблема денежного потока', 'Rather than a cash flow problem.'],
        ['what it actually is', 'чем оно на самом деле является', 'Which is what it actually is.'],
      ],
      rule: ['Treat as — пассивная оценка', 'Debt is treated as a flaw. Предлог as вводит то, за что нечто принимают.'],
      quiz: [
        ['«Потому что долг считают изъяном характера» —', ['Because debt is treated as a character flaw', 'Because debt is treat as a character flaw', 'Because debt is treated like a character flaw of'], 0],
        ['«В какой-то момент я была должна одиннадцать тысяч» —', ['I owed eleven thousand at one point', 'I owed eleven thousands at one point', 'I owe eleven thousand at one point'], 0],
        ['«Чем он на самом деле и является» —', ['Which is what it actually is', 'Which is that it actually is', 'Which is what it actually be'], 0],
      ],
      order: ['А не проблемой денежного потока.', 'Rather than a cash flow problem.'],
      produce: [
        ['В какой-то момент я была должна одиннадцать тысяч.', 'I owed eleven thousand at one point.', []],
        ['Потому что долг считают изъяном характера.', 'Because debt is treated as a character flaw.', []],
        ['Чем он на самом деле и является.', 'Which is what it actually is.', []],
      ],
    },
    {
      title: 'Lending to family',
      summary: 'Одолжить родне.',
      topics: [RE, RI, LI],
      dialogue: ['Займ', [
        ['Ben', 'If I lend it, I treat it as a gift.', 'Если я даю в долг, я считаю это подарком.'],
        ['Anna', 'Which is the only version that survives.', 'Единственный вариант, который выживает.'],
        ['Ben', 'Since chasing a brother costs more than the money.', 'Ведь выбивать долг с брата дороже самих денег.'],
        ['Anna', 'And is never fully paid back anyway.', 'И всё равно никогда полностью не возвращается.'],
        ['Ben', 'In money or in Christmases.', 'Ни деньгами, ни рождествами.'],
      ]],
      words: [
        ['If I lend it', 'если я даю в долг', 'If I lend it, I treat it as a gift.'],
        ['treat it as a gift', 'считаю это подарком', 'I treat it as a gift from the start.'],
        ['chasing a brother', 'выбивать долг с брата', 'Since chasing a brother costs more than the money.'],
        ['never fully paid back', 'никогда полностью не возвращается', 'And is never fully paid back anyway.'],
        ['In money or in Christmases', 'ни деньгами, ни рождествами', 'In money or in Christmases.'],
      ],
      rule: ['Первое условие как личное правило', 'If I lend it, I treat it as a gift. Настоящее в обеих частях описывает постоянную политику, а не один случай.'],
      quiz: [
        ['«Если я даю в долг, я считаю это подарком» —', ['If I lend it, I treat it as a gift', 'If I will lend it, I treat it as a gift', 'If I lend it, I will treated it as a gift'], 0],
        ['«Ведь выбивать долг с брата дороже самих денег» —', ['Since chasing a brother costs more than the money', 'Since chase a brother costs more than the money', 'Since chasing a brother cost more than the money'], 0],
        ['«И всё равно никогда полностью не возвращается» —', ['And is never fully paid back anyway', 'And is never fully pay back anyway', 'And is never full paid back anyway'], 0],
      ],
      order: ['Единственный вариант, который выживает.', 'Which is the only version that survives.'],
      produce: [
        ['Если я даю в долг, я считаю это подарком.', 'If I lend it, I treat it as a gift.', []],
        ['Ведь выбивать долг с брата дороже самих денег.', 'Since chasing a brother costs more than the money.', []],
        ['И всё равно никогда полностью не возвращается.', 'And is never fully paid back anyway.', []],
      ],
    },
    {
      title: 'Saying no',
      summary: 'Сказать нет.',
      topics: [RE, RI, LI],
      dialogue: ['Отказ', [
        ['Anna', 'I would help if I could, and I cannot.', 'Я бы помогла, если бы могла, а я не могу.'],
        ['Ben', 'Which is one sentence, and enough.', 'Одно предложение, и этого хватает.'],
        ['Anna', 'Since explaining invites negotiation.', 'Ведь объяснение приглашает к торгу.'],
        ['Ben', 'And an amount always follows.', 'И за ним всегда следует сумма.'],
        ['Anna', 'Which is why I stopped explaining.', 'Поэтому я перестала объяснять.'],
      ]],
      words: [
        ['I would help if I could', 'я бы помогла, если бы могла', 'I would help if I could, and I cannot.'],
        ['one sentence, and enough', 'одно предложение, и хватает', 'Which is one sentence, and enough.'],
        ['explaining invites negotiation', 'объяснение приглашает к торгу', 'Since explaining invites negotiation.'],
        ['an amount always follows', 'сумма всегда следует', 'And an amount always follows.'],
        ['stopped explaining', 'перестала объяснять', 'Which is why I stopped explaining.'],
      ],
      rule: ['Второе условие в вежливом отказе', 'I would help if I could. Форма делает отказ мягким, не оставляя щели для торга.'],
      quiz: [
        ['«Я бы помогла, если бы могла, а я не могу» —', ['I would help if I could, and I cannot', 'I would help if I can, and I cannot', 'I will help if I could, and I cannot'], 0],
        ['«Ведь объяснение приглашает к торгу» —', ['Since explaining invites negotiation', 'Since explain invites negotiation', 'Since explaining invite negotiation'], 0],
        ['«Поэтому я перестала объяснять» —', ['Which is why I stopped explaining', 'Which is why I stopped to explain', 'Which is why I stop explaining'], 0],
      ],
      order: ['И за ним всегда следует сумма.', 'And an amount always follows.'],
      produce: [
        ['Я бы помогла, если бы могла, а я не могу.', 'I would help if I could, and I cannot.', []],
        ['Ведь объяснение приглашает к торгу.', 'Since explaining invites negotiation.', []],
        ['Поэтому я перестала объяснять.', 'Which is why I stopped explaining.', []],
      ],
    },
    {
      title: 'Splitting the bill',
      summary: 'Делить счёт.',
      topics: [RE, SO, LI],
      dialogue: ['Счёт', [
        ['Ben', 'Splitting evenly punishes whoever ate least.', 'Делить поровну наказывает того, кто съел меньше всех.'],
        ['Anna', 'Which is usually the person with least money.', 'Обычно это человек с наименьшими деньгами.'],
        ['Ben', 'And who says nothing, twice over.', 'И который вдвойне молчит.'],
        ['Anna', 'Whereas paying separately takes one minute.', 'Тогда как заплатить раздельно занимает минуту.'],
        ['Ben', 'Which everybody claims is awkward.', 'Что все объявляют неловким.'],
      ]],
      words: [
        ['Splitting evenly', 'делить поровну', 'Splitting evenly punishes whoever ate least.'],
        ['whoever ate least', 'тот, кто съел меньше всех', 'It punishes whoever ate least.'],
        ['with least money', 'с наименьшими деньгами', 'Usually the person with least money.'],
        ['says nothing, twice over', 'вдвойне молчит', 'And who says nothing, twice over.'],
        ['paying separately', 'заплатить раздельно', 'Whereas paying separately takes one minute.'],
      ],
      rule: ['Whoever — «тот, кто бы ни»', 'It punishes whoever ate least. Местоимение объединяет придаточное и его подлежащее.'],
      quiz: [
        ['«Делить поровну наказывает того, кто съел меньше всех» —', ['Splitting evenly punishes whoever ate least', 'Splitting evenly punish whoever ate least', 'Split evenly punishes whoever ate least'], 0],
        ['«Тогда как заплатить раздельно занимает минуту» —', ['Whereas paying separately takes one minute', 'Whereas pay separately takes one minute', 'Whereas paying separately take one minute'], 0],
        ['«Что все объявляют неловким» —', ['Which everybody claims is awkward', 'Which everybody claim is awkward', 'Which everybody claims is awkwardly'], 0],
      ],
      order: ['И который вдвойне молчит.', 'And who says nothing, twice over.'],
      produce: [
        ['Делить поровну наказывает того, кто съел меньше всех.', 'Splitting evenly punishes whoever ate least.', []],
        ['Обычно это человек с наименьшими деньгами.', 'Which is usually the person with least money.', []],
        ['Тогда как заплатить раздельно занимает минуту.', 'Whereas paying separately takes one minute.', []],
      ],
    },
    {
      title: 'Unequal siblings',
      summary: 'Неравные братья и сёстры.',
      topics: [RE, RI, LI],
      dialogue: ['Неравенство', [
        ['Anna', 'One of us earns four times the other.', 'Один из нас зарабатывает вчетверо больше другого.'],
        ['Ben', 'Which shows up at every family dinner.', 'Это вылезает на каждом семейном ужине.'],
        ['Anna', 'In who chooses the restaurant.', 'В том, кто выбирает ресторан.'],
        ['Ben', 'And who pretends not to mind.', 'И кто делает вид, что не против.'],
        ['Anna', 'Which is more expensive than the bill.', 'Что дороже самого счёта.'],
      ]],
      words: [
        ['four times the other', 'вчетверо больше другого', 'One of us earns four times the other.'],
        ['shows up at every family dinner', 'вылезает на каждом ужине', 'Which shows up at every family dinner.'],
        ['who chooses the restaurant', 'кто выбирает ресторан', 'In who chooses the restaurant.'],
        ['pretends not to mind', 'делает вид, что не против', 'And who pretends not to mind.'],
        ['more expensive than the bill', 'дороже самого счёта', 'Which is more expensive than the bill.'],
      ],
      rule: ['Pretend not to do', 'He pretends not to mind. Отрицание стоит перед инфинитивом, а не при глаголе pretend.'],
      quiz: [
        ['«И кто делает вид, что не против» —', ['And who pretends not to mind', 'And who does not pretend to mind', 'And who pretends to not minding'], 0],
        ['«Один из нас зарабатывает вчетверо больше другого» —', ['One of us earns four times the other', 'One of us earn four times the other', 'One of us earns four time the other'], 0],
        ['«Это вылезает на каждом семейном ужине» —', ['Which shows up at every family dinner', 'Which show up at every family dinner', 'Which shows up in every family dinners'], 0],
      ],
      order: ['В том, кто выбирает ресторан.', 'In who chooses the restaurant.'],
      produce: [
        ['Один из нас зарабатывает вчетверо больше другого.', 'One of us earns four times the other.', []],
        ['И кто делает вид, что не против.', 'And who pretends not to mind.', []],
        ['Что дороже самого счёта.', 'Which is more expensive than the bill.', []],
      ],
    },
    {
      title: 'Talking about it anyway',
      summary: 'Всё-таки заговорить.',
      topics: [RE, SO, LI],
      dialogue: ['Разговор', [
        ['Ben', 'We agreed a number for gifts, in January.', 'В январе мы договорились о сумме на подарки.'],
        ['Anna', 'Which took nine minutes and ended ten years of guessing.', 'Это заняло девять минут и закончило десять лет догадок.'],
        ['Ben', 'And nobody has felt short since.', 'И с тех пор никто не чувствовал себя обделённым.'],
        ['Anna', 'Which is what naming a number does.', 'Вот что делает названная цифра.'],
        ['Ben', 'And why silence is the expensive option.', 'И почему молчание — дорогой вариант.'],
      ]],
      words: [
        ['agreed a number for gifts', 'договорились о сумме на подарки', 'We agreed a number for gifts, in January.'],
        ['ended ten years of guessing', 'закончило десять лет догадок', 'And ended ten years of guessing.'],
        ['nobody has felt short', 'никто не чувствовал себя обделённым', 'And nobody has felt short since.'],
        ['naming a number', 'назвать цифру', 'Which is what naming a number does.'],
        ['silence is the expensive option', 'молчание — дорогой вариант', 'And why silence is the expensive option.'],
      ],
      rule: ['Про деньги договариваются цифрой', 'Названная сумма закрывает спор быстрее любых объяснений, потому что её можно повторить дословно.'],
      quiz: [
        ['«И с тех пор никто не чувствовал себя обделённым» —', ['And nobody has felt short since', 'And nobody has feel short since', 'And nobody have felt short since'], 0],
        ['«Вот что делает названная цифра» —', ['Which is what naming a number does', 'Which is what name a number does', 'Which is what naming a number do'], 0],
        ['«В январе мы договорились о сумме на подарки» —', ['We agreed a number for gifts, in January', 'We agreed a number for gifts, in the January', 'We agree a number for gifts, in January'], 0],
      ],
      order: ['И почему молчание — дорогой вариант.', 'And why silence is the expensive option.'],
      produce: [
        ['В январе мы договорились о сумме на подарки.', 'We agreed a number for gifts, in January.', []],
        ['И с тех пор никто не чувствовал себя обделённым.', 'And nobody has felt short since.', []],
        ['И почему молчание — дорогой вариант.', 'And why silence is the expensive option.', []],
      ],
    },
    {
      checkpoint: true,
      title: 'Проверка: деньги, о которых молчат',
      summary: 'Шесть фраз без подсказок.',
      topics: [RI, RE, SO, CA],
      produce: [
        ['Здесь никто не знает, кто сколько получает.', 'Nobody here knows what anybody earns.', []],
        ['Не подскажешь свою вилку?', 'Would you mind telling me your range?', []],
        ['Потому что долг считают изъяном характера.', 'Because debt is treated as a character flaw.', []],
        ['Если я даю в долг, я считаю это подарком.', 'If I lend it, I treat it as a gift.', []],
        ['Я бы помогла, если бы могла, а я не могу.', 'I would help if I could, and I cannot.', []],
        ['Делить поровну наказывает того, кто съел меньше всех.', 'Splitting evenly punishes whoever ate least.', []],
      ],
    },
  ],
}
