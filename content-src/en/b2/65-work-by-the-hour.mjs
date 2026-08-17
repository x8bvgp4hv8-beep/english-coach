// B2, блок 65 — Work by the hour. Работа по часам.
//
// Тематический блок: подработка, курьеры, рейтинги, отсутствие договора и
// алгоритм вместо начальника. Пассив, условия, точная лексика о занятости.

const CA = 'b1-tema-carrera'
const RI = 'b2-tema-riesgo'
const SO = 'b2-tema-sociedad'
const ET = 'b2-tema-etica'
const LI = 'b2-linkers'

export default {
  slug: 'work-by-the-hour',
  title: 'Работа по часам',
  subtitle: 'Подработка, рейтинги и алгоритм вместо начальника',
  canDo: [
    'обсуждать почасовую работу и её цену',
    'говорить о рейтингах и отзывах',
    'спорить о статусе занятости',
    'обсуждать нестабильный график',
    'объяснять, почему люди в это идут',
  ],
  lessons: [
    {
      title: 'Paid for the ride, not the wait',
      summary: 'Платят за поездку, не за ожидание.',
      topics: [RI, CA, LI],
      dialogue: ['Оплата', [
        ['Anna', 'Eleven pounds an hour, on the app.', 'Одиннадцать фунтов в час, по приложению.'],
        ['Ben', 'Which counts only the moving part.', 'Что считает только ту часть, когда едешь.'],
        ['Anna', 'And ignores an hour of standing about.', 'И не учитывает час стояния.'],
        ['Ben', 'Which is where the real rate lives.', 'Именно там и живёт настоящая ставка.'],
        ['Anna', 'And is never printed anywhere.', 'И её нигде не печатают.'],
      ]],
      words: [
        ['Eleven pounds an hour', 'одиннадцать фунтов в час', 'Eleven pounds an hour, on the app.'],
        ['counts only the moving part', 'считает только движение', 'Which counts only the moving part.'],
        ['an hour of standing about', 'час стояния', 'And ignores an hour of standing about.'],
        ['where the real rate lives', 'где живёт настоящая ставка', 'Which is where the real rate lives.'],
        ['never printed anywhere', 'нигде не печатают', 'And is never printed anywhere.'],
      ],
      rule: ['Standing about — герундий с наречием', 'An hour of standing about. Форма на -ing после предлога сохраняет наречие.'],
      quiz: [
        ['«И не учитывает час стояния» —', ['And ignores an hour of standing about', 'And ignores an hour of stand about', 'And ignore an hour of standing about'], 0],
        ['«Что считает только ту часть, когда едешь» —', ['Which counts only the moving part', 'Which count only the moving part', 'Which counts only the move part'], 0],
        ['«И её нигде не печатают» —', ['And is never printed anywhere', 'And is never printed nowhere', 'And is never print anywhere'], 0],
      ],
      order: ['Именно там и живёт настоящая ставка.', 'Which is where the real rate lives.'],
      produce: [
        ['Одиннадцать фунтов в час, по приложению.', 'Eleven pounds an hour, on the app.', []],
        ['И не учитывает час стояния.', 'And ignores an hour of standing about.', []],
        ['Именно там и живёт настоящая ставка.', 'Which is where the real rate lives.', []],
      ],
    },
    {
      title: 'The rating',
      summary: 'Рейтинг.',
      topics: [ET, RI, LI],
      dialogue: ['Оценка', [
        ['Ben', 'Below four point seven and the work stops.', 'Ниже четырёх и семи — и работа кончается.'],
        ['Anna', 'Which nobody calls being sacked.', 'Что никто не называет увольнением.'],
        ['Ben', 'Since there is nothing to be sacked from.', 'Ведь увольняться формально неоткуда.'],
        ['Anna', 'Only an account, quietly deprioritised.', 'Только аккаунт, тихо задвинутый в конец.'],
        ['Ben', 'Which is the same thing with better lawyers.', 'То же самое, но с юристами получше.'],
      ]],
      words: [
        ['Below four point seven', 'ниже четырёх и семи', 'Below four point seven and the work stops.'],
        ['being sacked', 'увольнение', 'Which nobody calls being sacked.'],
        ['nothing to be sacked from', 'неоткуда увольняться', 'Since there is nothing to be sacked from.'],
        ['quietly deprioritised', 'тихо задвинутый в конец', 'Only an account, quietly deprioritised.'],
        ['with better lawyers', 'с юристами получше', 'Which is the same thing with better lawyers.'],
      ],
      rule: ['Nothing to be done from', 'Nothing to be sacked from. Пассивный инфинитив сохраняет предлог в конце.'],
      quiz: [
        ['«Ведь увольняться формально неоткуда» —', ['Since there is nothing to be sacked from', 'Since there is nothing to be sacked', 'Since there are nothing to be sacked from'], 0],
        ['«Что никто не называет увольнением» —', ['Which nobody calls being sacked', 'Which nobody calls be sacked', 'Which nobody call being sacked'], 0],
        ['«Только аккаунт, тихо задвинутый в конец» —', ['Only an account, quietly deprioritised', 'Only an account, quiet deprioritised', 'Only an account, quietly deprioritise'], 0],
      ],
      order: ['То же самое, но с юристами получше.', 'Which is the same thing with better lawyers.'],
      produce: [
        ['Ниже четырёх и семи — и работа кончается.', 'Below four point seven and the work stops.', []],
        ['Ведь увольняться формально неоткуда.', 'Since there is nothing to be sacked from.', []],
        ['То же самое, но с юристами получше.', 'Which is the same thing with better lawyers.', []],
      ],
    },
    {
      title: 'Self employed, in name',
      summary: 'Самозанятый, по названию.',
      topics: [SO, CA, LI],
      dialogue: ['Статус', [
        ['Anna', 'I cannot set my price or my hours.', 'Я не могу назначить ни цену, ни часы.'],
        ['Ben', 'Which is the test the courts apply.', 'Именно эту проверку применяют суды.'],
        ['Anna', 'And which the contract calls freedom.', 'И что договор называет свободой.'],
        ['Ben', 'Whatever the contract calls it.', 'Как бы договор это ни называл.'],
        ['Anna', 'Which is why the cases keep being won.', 'Поэтому дела и продолжают выигрывать.'],
      ]],
      words: [
        ['set my price or my hours', 'назначить цену или часы', 'I cannot set my price or my hours.'],
        ['the test the courts apply', 'проверка, которую применяют суды', 'Which is the test the courts apply.'],
        ['the contract calls freedom', 'договор называет свободой', 'And which the contract calls freedom.'],
        ['Whatever the contract calls it', 'как бы договор это ни называл', 'Whatever the contract calls it.'],
        ['keep being won', 'продолжают выигрывать', 'Which is why the cases keep being won.'],
      ],
      rule: ['Keep being done — пассив после keep', 'The cases keep being won. Форма описывает повторяющийся результат.'],
      quiz: [
        ['«Поэтому дела и продолжают выигрывать» —', ['Which is why the cases keep being won', 'Which is why the cases keep to be won', 'Which is why the cases keeps being won'], 0],
        ['«Я не могу назначить ни цену, ни часы» —', ['I cannot set my price or my hours', 'I cannot set my price nor my hours neither', 'I cannot to set my price or my hours'], 0],
        ['«Как бы договор это ни называл» —', ['Whatever the contract calls it', 'Whatever does the contract call it', 'Whatever the contract call it'], 0],
      ],
      order: ['Именно эту проверку применяют суды.', 'Which is the test the courts apply.'],
      produce: [
        ['Я не могу назначить ни цену, ни часы.', 'I cannot set my price or my hours.', []],
        ['И что договор называет свободой.', 'And which the contract calls freedom.', []],
        ['Поэтому дела и продолжают выигрывать.', 'Which is why the cases keep being won.', []],
      ],
    },
    {
      title: 'The week with no shifts',
      summary: 'Неделя без смен.',
      topics: [RI, CA, LI],
      dialogue: ['Ноль часов', [
        ['Ben', 'The rota came out with nothing on it.', 'График вышел пустым.'],
        ['Anna', 'Which is not a dismissal, technically.', 'Формально это не увольнение.'],
        ['Ben', 'And leaves the rent due, actually.', 'А аренду платить всё равно.'],
        ['Anna', 'Which is the gap the law has not closed.', 'Эту дыру закон не закрыл.'],
        ['Ben', 'In most countries, and in most decades.', 'В большинстве стран и в большинстве десятилетий.'],
      ]],
      words: [
        ['The rota came out', 'график вышел', 'The rota came out with nothing on it.'],
        ['not a dismissal, technically', 'формально не увольнение', 'Which is not a dismissal, technically.'],
        ['leaves the rent due', 'аренду платить всё равно', 'And leaves the rent due, actually.'],
        ['the gap the law has not closed', 'дыра, которую закон не закрыл', 'Which is the gap the law has not closed.'],
        ['in most decades', 'в большинстве десятилетий', 'In most countries, and in most decades.'],
      ],
      rule: ['Leave something due', 'It leaves the rent due. После leave идёт объект и прилагательное состояния.'],
      quiz: [
        ['«А аренду платить всё равно» —', ['And leaves the rent due, actually', 'And leave the rent due, actually', 'And leaves the rent due, actual'], 0],
        ['«График вышел пустым» —', ['The rota came out with nothing on it', 'The rota came out with anything on it', 'The rota come out with nothing on it'], 0],
        ['«Эту дыру закон не закрыл» —', ['The gap the law has not closed', 'The gap the law has not close', 'The gap what the law has not closed'], 0],
      ],
      order: ['Формально это не увольнение.', 'Which is not a dismissal, technically.'],
      produce: [
        ['График вышел пустым.', 'The rota came out with nothing on it.', []],
        ['А аренду платить всё равно.', 'And leaves the rent due, actually.', []],
        ['Эту дыру закон не закрыл.', 'Which is the gap the law has not closed.', []],
      ],
    },
    {
      title: 'Why people take it',
      summary: 'Почему люди на это идут.',
      topics: [SO, CA, LI],
      dialogue: ['Причины', [
        ['Anna', 'It starts on Monday, with no interview.', 'Начинается в понедельник, без собеседования.'],
        ['Ben', 'Which no ordinary job can offer.', 'Чего обычная работа предложить не может.'],
        ['Anna', 'To somebody with a gap in their record.', 'Тому, у кого пробел в биографии.'],
        ['Ben', 'Or a language they are still learning.', 'Или язык, который он ещё учит.'],
        ['Anna', 'Which is the whole business model, honestly.', 'Честно говоря, в этом вся бизнес-модель.'],
      ]],
      words: [
        ['with no interview', 'без собеседования', 'It starts on Monday, with no interview.'],
        ['no ordinary job can offer', 'обычная работа не может предложить', 'Which no ordinary job can offer.'],
        ['a gap in their record', 'пробел в биографии', 'To somebody with a gap in their record.'],
        ['still learning', 'ещё учит', 'Or a language they are still learning.'],
        ['the whole business model', 'вся бизнес-модель', 'Which is the whole business model, honestly.'],
      ],
      rule: ['Their как нейтральное местоимение', 'Somebody with a gap in their record. Форма their используется, когда пол не указан.'],
      quiz: [
        ['«Тому, у кого пробел в биографии» —', ['To somebody with a gap in their record', 'To somebody with a gap in his record only', 'To somebody with a gap in theirs record'], 0],
        ['«Чего обычная работа предложить не может» —', ['Which no ordinary job can offer', 'Which no ordinary job can offers', 'Which not ordinary job can offer'], 0],
        ['«Или язык, который он ещё учит» —', ['Or a language they are still learning', 'Or a language they are still learn', 'Or a language what they are still learning'], 0],
      ],
      order: ['Начинается в понедельник, без собеседования.', 'It starts on Monday, with no interview.'],
      produce: [
        ['Начинается в понедельник, без собеседования.', 'It starts on Monday, with no interview.', []],
        ['Чего обычная работа предложить не может.', 'Which no ordinary job can offer.', []],
        ['Тому, у кого пробел в биографии.', 'To somebody with a gap in their record.', []],
      ],
    },
    {
      title: 'Being your own accountant',
      summary: 'Сам себе бухгалтер.',
      topics: [RI, CA, LI],
      dialogue: ['Налоги', [
        ['Ben', 'Nobody takes the tax off for you.', 'Никто не удерживает за вас налог.'],
        ['Anna', 'Which is a fifth of everything, put aside.', 'А это пятая часть всего, отложенная в сторону.'],
        ['Ben', 'And is the thing that ruins the first year.', 'И именно это ломает первый год.'],
        ['Anna', 'Since the money arrives before the bill.', 'Ведь деньги приходят раньше счёта.'],
        ['Ben', 'And has usually gone by the time it comes.', 'И обычно кончаются к его приходу.'],
      ]],
      words: [
        ['takes the tax off', 'удерживает налог', 'Nobody takes the tax off for you.'],
        ['a fifth of everything', 'пятая часть всего', 'Which is a fifth of everything, put aside.'],
        ['ruins the first year', 'ломает первый год', 'And is the thing that ruins the first year.'],
        ['before the bill', 'раньше счёта', 'Since the money arrives before the bill.'],
        ['has usually gone', 'обычно кончаются', 'And has usually gone by the time it comes.'],
      ],
      rule: ['By the time с перфектом', 'It has gone by the time the bill comes. Оборот показывает завершённость к моменту.'],
      quiz: [
        ['«И обычно кончаются к его приходу» —', ['And has usually gone by the time it comes', 'And has usually gone by the time it will come', 'And have usually gone by the time it comes'], 0],
        ['«Никто не удерживает за вас налог» —', ['Nobody takes the tax off for you', 'Nobody take the tax off for you', 'Nobody takes off the tax you for'], 0],
        ['«И именно это ломает первый год» —', ['And is the thing that ruins the first year', 'And is the thing that ruin the first year', 'And is the thing what ruins the first year'], 0],
      ],
      order: ['Ведь деньги приходят раньше счёта.', 'Since the money arrives before the bill.'],
      produce: [
        ['Никто не удерживает за вас налог.', 'Nobody takes the tax off for you.', []],
        ['А это пятая часть всего, отложенная в сторону.', 'Which is a fifth of everything, put aside.', []],
        ['И обычно кончаются к его приходу.', 'And has usually gone by the time it comes.', []],
      ],
    },
    {
      title: 'The customer who complains',
      summary: 'Клиент, который жалуется.',
      topics: [ET, SO, LI],
      dialogue: ['Жалоба', [
        ['Anna', 'One complaint outweighs forty deliveries.', 'Одна жалоба весит больше сорока доставок.'],
        ['Ben', 'Which is not a rule anybody wrote.', 'И это правило никто не писал.'],
        ['Anna', 'But an effect of how the average works.', 'А следствие того, как считается среднее.'],
        ['Ben', 'And which two words in the app could fix.', 'И что чинится двумя словами в приложении.'],
        ['Anna', 'Which nobody has any reason to add.', 'Которые никому нет резона добавлять.'],
      ]],
      words: [
        ['outweighs forty deliveries', 'весит больше сорока доставок', 'One complaint outweighs forty deliveries.'],
        ['not a rule anybody wrote', 'правило, которое никто не писал', 'Which is not a rule anybody wrote.'],
        ['how the average works', 'как считается среднее', 'But an effect of how the average works.'],
        ['two words in the app', 'два слова в приложении', 'And which two words in the app could fix.'],
        ['no reason to add', 'нет резона добавлять', 'Which nobody has any reason to add.'],
      ],
      rule: ['Have any reason to do', 'Nobody has any reason to add them. Слово any появляется в отрицательном контексте.'],
      quiz: [
        ['«Которые никому нет резона добавлять» —', ['Which nobody has any reason to add', 'Which nobody has some reason to add', 'Which nobody have any reason to add'], 0],
        ['«Одна жалоба весит больше сорока доставок» —', ['One complaint outweighs forty deliveries', 'One complaint outweigh forty deliveries', 'One complaint outweighs forty delivery'], 0],
        ['«А следствие того, как считается среднее» —', ['But an effect of how the average works', 'But an effect of how does the average work', 'But an effect of how the average work'], 0],
      ],
      order: ['И это правило никто не писал.', 'Which is not a rule anybody wrote.'],
      produce: [
        ['Одна жалоба весит больше сорока доставок.', 'One complaint outweighs forty deliveries.', []],
        ['А следствие того, как считается среднее.', 'But an effect of how the average works.', []],
        ['Которые никому нет резона добавлять.', 'Which nobody has any reason to add.', []],
      ],
    },
    {
      title: 'What would actually help',
      summary: 'Что реально помогло бы.',
      topics: [SO, RI, LI],
      dialogue: ['Итог', [
        ['Ben', 'A floor on the hourly rate, including waiting.', 'Нижняя граница ставки, с учётом ожидания.'],
        ['Anna', 'Which four cities have already introduced.', 'Что четыре города уже ввели.'],
        ['Ben', 'And where the apps did not leave.', 'И откуда приложения не ушли.'],
        ['Anna', 'Despite having said they would.', 'Хотя и говорили, что уйдут.'],
        ['Ben', 'Which is worth remembering next time.', 'Это стоит помнить в следующий раз.'],
      ]],
      words: [
        ['A floor on the hourly rate', 'нижняя граница ставки', 'A floor on the hourly rate, including waiting.'],
        ['including waiting', 'с учётом ожидания', 'Including waiting, not only driving.'],
        ['four cities have introduced', 'четыре города ввели', 'Which four cities have already introduced.'],
        ['the apps did not leave', 'приложения не ушли', 'And where the apps did not leave.'],
        ['Despite having said', 'хотя и говорили', 'Despite having said they would.'],
      ],
      rule: ['Despite having said — уступка', 'Despite having said they would. После despite идёт герундий, не придаточное с though.'],
      quiz: [
        ['«Хотя и говорили, что уйдут» —', ['Despite having said they would', 'Despite have said they would', 'Despite of having said they would'], 0],
        ['«Что четыре города уже ввели» —', ['Which four cities have already introduced', 'Which four cities has already introduced', 'Which four cities have already introduce'], 0],
        ['«И откуда приложения не ушли» —', ['And where the apps did not leave', 'And where the apps did not left', 'And where the apps do not left'], 0],
      ],
      order: ['Это стоит помнить в следующий раз.', 'Which is worth remembering next time.'],
      produce: [
        ['Нижняя граница ставки, с учётом ожидания.', 'A floor on the hourly rate, including waiting.', []],
        ['Что четыре города уже ввели.', 'Which four cities have already introduced.', []],
        ['Хотя и говорили, что уйдут.', 'Despite having said they would.', []],
      ],
    },
    {
      checkpoint: true,
      title: 'Проверка: работа по часам',
      summary: 'Шесть фраз без подсказок.',
      topics: [CA, RI, SO, ET],
      produce: [
        ['И не учитывает час стояния.', 'And ignores an hour of standing about.', []],
        ['Ведь увольняться формально неоткуда.', 'Since there is nothing to be sacked from.', []],
        ['Поэтому дела и продолжают выигрывать.', 'Which is why the cases keep being won.', []],
        ['А аренду платить всё равно.', 'And leaves the rent due, actually.', []],
        ['Тому, у кого пробел в биографии.', 'To somebody with a gap in their record.', []],
        ['И обычно кончаются к его приходу.', 'And has usually gone by the time it comes.', []],
      ],
    },
  ],
}
