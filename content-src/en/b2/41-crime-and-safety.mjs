// B2, блок 41 — Crime and safety. Преступление, наказание и безопасность.
//
// Тематический блок: страх, статистика, суд, полиция, второй шанс.
// Пассив без исполнителя, осторожные обобщения, спор о причинах.

const SO = 'b2-tema-sociedad'
const DE = 'b2-tema-derecho'
const CI = 'b2-tema-ciudad'
const DA = 'b2-tema-datos'
const LI = 'b2-linkers'

export default {
  slug: 'crime-and-safety',
  title: 'Преступление и безопасность',
  subtitle: 'Страх, цифры, суд и второй шанс',
  canDo: [
    'обсуждать преступность без паники',
    'разбирать статистику и восприятие',
    'говорить о суде и наказании',
    'спорить о полиции и доверии',
    'обсуждать возвращение к жизни после срока',
  ],
  lessons: [
    {
      title: 'Fear and figures',
      summary: 'Страх и цифры.',
      topics: [DA, SO, LI],
      dialogue: ['Страх', [
        ['Anna', 'Crime has fallen for twenty years.', 'Преступность падает двадцать лет.'],
        ['Ben', 'While the fear of it has risen.', 'Тогда как страх перед ней вырос.'],
        ['Anna', 'Which is not a contradiction, sadly.', 'К сожалению, это не противоречие.'],
        ['Ben', 'Since fear is fed by stories, not counts.', 'Ведь страх кормят истории, а не подсчёты.'],
        ['Anna', 'And there are more stories than ever.', 'А историй стало больше, чем когда-либо.'],
      ]],
      words: [
        ['has fallen for twenty years', 'падает двадцать лет', 'Crime has fallen for twenty years.'],
        ['the fear of it has risen', 'страх перед ней вырос', 'While the fear of it has risen.'],
        ['not a contradiction', 'не противоречие', 'Which is not a contradiction, sadly.'],
        ['is fed by stories', 'кормят истории', 'Since fear is fed by stories, not counts.'],
        ['more stories than ever', 'больше историй, чем когда-либо', 'And there are more stories than ever.'],
      ],
      rule: ['Is fed by — пассив с исполнителем', 'Fear is fed by stories. Предлог by называет источник действия в пассиве.'],
      quiz: [
        ['«Ведь страх кормят истории, а не подсчёты» —', ['Since fear is fed by stories, not counts', 'Since fear is fed from stories, not counts', 'Since fear is feed by stories, not counts'], 0],
        ['«Преступность падает двадцать лет» —', ['Crime has fallen for twenty years', 'Crime has fell for twenty years', 'Crime has fallen since twenty years'], 0],
        ['«А историй стало больше, чем когда-либо» —', ['And there are more stories than ever', 'And there is more stories than ever', 'And there are more stories that ever'], 0],
      ],
      order: ['Тогда как страх перед ней вырос.', 'While the fear of it has risen.'],
      produce: [
        ['Преступность падает двадцать лет.', 'Crime has fallen for twenty years.', []],
        ['Тогда как страх перед ней вырос.', 'While the fear of it has risen.', []],
        ['Ведь страх кормят истории, а не подсчёты.', 'Since fear is fed by stories, not counts.', []],
      ],
    },
    {
      title: 'The street at night',
      summary: 'Улица ночью.',
      topics: [CI, SO, LI],
      dialogue: ['Ночь', [
        ['Ben', 'Half the city avoids one underpass.', 'Половина города обходит один подземный переход.'],
        ['Anna', 'Where nothing has happened in years.', 'Где годами ничего не случалось.'],
        ['Ben', 'Because nobody goes there to check.', 'Потому что туда никто не ходит, чтобы проверить.'],
        ['Anna', 'Which is how empty places stay frightening.', 'Так пустые места и остаются страшными.'],
        ['Ben', 'And why light and shops fix more than cameras.', 'И почему свет и магазины помогают больше камер.'],
      ]],
      words: [
        ['avoids one underpass', 'обходит один переход', 'Half the city avoids one underpass.'],
        ['nothing has happened in years', 'годами ничего не случалось', 'Where nothing has happened in years.'],
        ['goes there to check', 'ходит туда проверить', 'Because nobody goes there to check.'],
        ['stay frightening', 'остаются страшными', 'Which is how empty places stay frightening.'],
        ['fix more than cameras', 'помогают больше камер', 'And why light and shops fix more than cameras.'],
      ],
      rule: ['Stay + прилагательное', 'Empty places stay frightening. После stay идёт прилагательное, а не наречие.'],
      quiz: [
        ['«Так пустые места и остаются страшными» —', ['Which is how empty places stay frightening', 'Which is how empty places stay frighteningly', 'Which is how empty places stays frightening'], 0],
        ['«Где годами ничего не случалось» —', ['Where nothing has happened in years', 'Where nothing has happen in years', 'Where nothing have happened in years'], 0],
        ['«И почему свет и магазины помогают больше камер» —', ['And why light and shops fix more than cameras', 'And why light and shops fixes more than cameras', 'And why light and shops fix more that cameras'], 0],
      ],
      order: ['Потому что туда никто не ходит, чтобы проверить.', 'Because nobody goes there to check.'],
      produce: [
        ['Половина города обходит один подземный переход.', 'Half the city avoids one underpass.', []],
        ['Где годами ничего не случалось.', 'Where nothing has happened in years.', []],
        ['Так пустые места и остаются страшными.', 'Which is how empty places stay frightening.', []],
      ],
    },
    {
      title: 'Reporting it',
      summary: 'Заявить.',
      topics: [DE, SO, LI],
      dialogue: ['Заявление', [
        ['Anna', 'The bike was stolen and never reported.', 'Велосипед украли, и заявления не было.'],
        ['Ben', 'Which most people do not bother with.', 'Большинство с этим не связывается.'],
        ['Anna', 'Since nothing is expected to come of it.', 'Ведь никто не ждёт, что что-то выйдет.'],
        ['Ben', 'And therefore the figures look better.', 'И поэтому цифры выглядят лучше.'],
        ['Anna', 'Which is a loop worth understanding.', 'Этот круг стоит понимать.'],
      ]],
      words: [
        ['was stolen and never reported', 'украли, и заявления не было', 'The bike was stolen and never reported.'],
        ['do not bother with', 'не связываются с', 'Which most people do not bother with.'],
        ['nothing is expected to come of it', 'никто не ждёт, что что-то выйдет', 'Since nothing is expected to come of it.'],
        ['the figures look better', 'цифры выглядят лучше', 'And therefore the figures look better.'],
        ['a loop worth understanding', 'круг, который стоит понимать', 'Which is a loop worth understanding.'],
      ],
      rule: ['Is expected to — безличное ожидание', 'Nothing is expected to come of it. Конструкция снимает вопрос о том, кто именно ожидает.'],
      quiz: [
        ['«Ведь никто не ждёт, что что-то выйдет» —', ['Since nothing is expected to come of it', 'Since nothing is expect to come of it', 'Since nothing is expected coming of it'], 0],
        ['«Велосипед украли, и заявления не было» —', ['The bike was stolen and never reported', 'The bike was stole and never reported', 'The bike were stolen and never reported'], 0],
        ['«Этот круг стоит понимать» —', ['Which is a loop worth understanding', 'Which is a loop worth to understand', 'Which is a loop worth understand'], 0],
      ],
      order: ['Большинство с этим не связывается.', 'Which most people do not bother with.'],
      produce: [
        ['Велосипед украли, и заявления не было.', 'The bike was stolen and never reported.', []],
        ['Ведь никто не ждёт, что что-то выйдет.', 'Since nothing is expected to come of it.', []],
        ['И поэтому цифры выглядят лучше.', 'And therefore the figures look better.', []],
      ],
    },
    {
      title: 'In court',
      summary: 'В суде.',
      topics: [DE, LI, SO],
      dialogue: ['Суд', [
        ['Ben', 'He was found guilty on two counts.', 'Его признали виновным по двум пунктам.'],
        ['Anna', 'And acquitted on the one that mattered.', 'И оправдали по тому, который был важен.'],
        ['Ben', 'Which the reporting reversed entirely.', 'Что в репортажах полностью перевернули.'],
        ['Anna', 'Because the headline had been written first.', 'Потому что заголовок написали заранее.'],
        ['Ben', 'Which happens more often than it should.', 'Это случается чаще, чем должно бы.'],
      ]],
      words: [
        ['was found guilty', 'признали виновным', 'He was found guilty on two counts.'],
        ['acquitted on the one that mattered', 'оправдали по важному пункту', 'And acquitted on the one that mattered.'],
        ['the reporting reversed', 'в репортажах перевернули', 'Which the reporting reversed entirely.'],
        ['had been written first', 'написали заранее', 'Because the headline had been written first.'],
        ['more often than it should', 'чаще, чем должно бы', 'Which happens more often than it should.'],
      ],
      rule: ['Had been written — пассив предпрошедшего', 'The headline had been written first. Форма ставит одно прошлое действие раньше другого.'],
      quiz: [
        ['«Потому что заголовок написали заранее» —', ['Because the headline had been written first', 'Because the headline had been wrote first', 'Because the headline has been written first then'], 0],
        ['«Его признали виновным по двум пунктам» —', ['He was found guilty on two counts', 'He was find guilty on two counts', 'He was found guilty in two counts'], 0],
        ['«Это случается чаще, чем должно бы» —', ['Which happens more often than it should', 'Which happen more often than it should', 'Which happens more often than it shoulds'], 0],
      ],
      order: ['И оправдали по тому, который был важен.', 'And acquitted on the one that mattered.'],
      produce: [
        ['Его признали виновным по двум пунктам.', 'He was found guilty on two counts.', []],
        ['Что в репортажах полностью перевернули.', 'Which the reporting reversed entirely.', []],
        ['Потому что заголовок написали заранее.', 'Because the headline had been written first.', []],
      ],
    },
    {
      title: 'What prison does',
      summary: 'Что делает тюрьма.',
      topics: [SO, DE, LI],
      dialogue: ['Тюрьма', [
        ['Anna', 'Two thirds are back within three years.', 'Две трети возвращаются в течение трёх лет.'],
        ['Ben', 'Which is either a failure or a purpose.', 'Это либо провал, либо задача.'],
        ['Anna', 'Depending on what you think it is for.', 'В зависимости от того, для чего она, по-вашему.'],
        ['Ben', 'Punishment, or a return to the street.', 'Наказание или возвращение на улицу.'],
        ['Anna', 'Which are different buildings, in practice.', 'На практике это разные здания.'],
      ]],
      words: [
        ['Two thirds are back', 'две трети возвращаются', 'Two thirds are back within three years.'],
        ['either a failure or a purpose', 'либо провал, либо задача', 'Which is either a failure or a purpose.'],
        ['Depending on what you think', 'в зависимости от того, что вы думаете', 'Depending on what you think it is for.'],
        ['a return to the street', 'возвращение на улицу', 'Punishment, or a return to the street.'],
        ['different buildings', 'разные здания', 'Which are different buildings, in practice.'],
      ],
      rule: ['Either… or', 'Either a failure or a purpose. Пара союзов соединяет два равных варианта и не требует отрицания.'],
      quiz: [
        ['«Это либо провал, либо задача» —', ['Which is either a failure or a purpose', 'Which is either a failure nor a purpose', 'Which is either a failure or purpose'], 0],
        ['«В зависимости от того, для чего она, по-вашему» —', ['Depending on what you think it is for', 'Depending of what you think it is for', 'Depending on what do you think it is for'], 0],
        ['«Две трети возвращаются в течение трёх лет» —', ['Two thirds are back within three years', 'Two third are back within three years', 'Two thirds is back within three years'], 0],
      ],
      order: ['Наказание или возвращение на улицу.', 'Punishment, or a return to the street.'],
      produce: [
        ['Две трети возвращаются в течение трёх лет.', 'Two thirds are back within three years.', []],
        ['Это либо провал, либо задача.', 'Which is either a failure or a purpose.', []],
        ['На практике это разные здания.', 'Which are different buildings, in practice.', []],
      ],
    },
    {
      title: 'A second chance',
      summary: 'Второй шанс.',
      topics: [SO, LI, DE],
      dialogue: ['После срока', [
        ['Ben', 'He has been out for four years.', 'Он на свободе четыре года.'],
        ['Anna', 'And has not been able to rent anywhere.', 'И нигде не смог снять жильё.'],
        ['Ben', 'Since the question is on every form.', 'Ведь вопрос стоит в каждой анкете.'],
        ['Anna', 'Which makes the sentence permanent.', 'Что делает приговор пожизненным.'],
        ['Ben', 'Whatever the judge actually said.', 'Что бы там ни сказал судья.'],
      ]],
      words: [
        ['has been out for four years', 'на свободе четыре года', 'He has been out for four years.'],
        ['has not been able to rent', 'не смог снять жильё', 'And has not been able to rent anywhere.'],
        ['on every form', 'в каждой анкете', 'Since the question is on every form.'],
        ['makes the sentence permanent', 'делает приговор пожизненным', 'Which makes the sentence permanent.'],
        ['Whatever the judge said', 'что бы ни сказал судья', 'Whatever the judge actually said.'],
      ],
      rule: ['Make something + прилагательное', 'It makes the sentence permanent. После make идёт объект и прилагательное без to be.'],
      quiz: [
        ['«Что делает приговор пожизненным» —', ['Which makes the sentence permanent', 'Which makes the sentence permanently', 'Which makes the sentence to be permanent'], 0],
        ['«И нигде не смог снять жильё» —', ['And has not been able to rent anywhere', 'And has not been able to rent nowhere', 'And has not been able renting anywhere'], 0],
        ['«Что бы там ни сказал судья» —', ['Whatever the judge actually said', 'Whatever did the judge actually say', 'Whatever the judge actually says then'], 0],
      ],
      order: ['Ведь вопрос стоит в каждой анкете.', 'Since the question is on every form.'],
      produce: [
        ['Он на свободе четыре года.', 'He has been out for four years.', []],
        ['И нигде не смог снять жильё.', 'And has not been able to rent anywhere.', []],
        ['Что делает приговор пожизненным.', 'Which makes the sentence permanent.', []],
      ],
    },
    {
      title: 'Trust in the police',
      summary: 'Доверие к полиции.',
      topics: [SO, CI, LI],
      dialogue: ['Доверие', [
        ['Anna', 'People call less where they trust less.', 'Там, где доверяют меньше, и звонят реже.'],
        ['Ben', 'Which is measured, not assumed.', 'Это измерено, а не предположено.'],
        ['Anna', 'And makes those streets less safe.', 'И делает те улицы менее безопасными.'],
        ['Ben', 'Whatever policing is put there afterwards.', 'Какую бы полицию туда потом ни поставили.'],
        ['Anna', 'Which is the expensive part to repair.', 'И чинится это дороже всего.'],
      ]],
      words: [
        ['call less where they trust less', 'звонят реже там, где меньше доверяют', 'People call less where they trust less.'],
        ['measured, not assumed', 'измерено, а не предположено', 'Which is measured, not assumed.'],
        ['less safe', 'менее безопасными', 'And makes those streets less safe.'],
        ['is put there afterwards', 'ставят туда потом', 'Whatever policing is put there afterwards.'],
        ['the expensive part to repair', 'что чинить дороже всего', 'Which is the expensive part to repair.'],
      ],
      rule: ['Where как союз места и условия', 'People call less where they trust less. Слово указывает не только место, но и обстоятельство.'],
      quiz: [
        ['«Там, где доверяют меньше, и звонят реже» —', ['People call less where they trust less', 'People call less where they trusts less', 'People calls less where they trust less'], 0],
        ['«Какую бы полицию туда потом ни поставили» —', ['Whatever policing is put there afterwards', 'Whatever policing is putted there afterwards', 'Whatever policing are put there afterwards'], 0],
        ['«И делает те улицы менее безопасными» —', ['And makes those streets less safe', 'And makes those streets less safely', 'And make those streets less safe'], 0],
      ],
      order: ['Это измерено, а не предположено.', 'Which is measured, not assumed.'],
      produce: [
        ['Там, где доверяют меньше, и звонят реже.', 'People call less where they trust less.', []],
        ['И делает те улицы менее безопасными.', 'And makes those streets less safe.', []],
        ['И чинится это дороже всего.', 'Which is the expensive part to repair.', []],
      ],
    },
    {
      title: 'What actually works',
      summary: 'Что действительно работает.',
      topics: [SO, DA, LI],
      dialogue: ['Работает', [
        ['Ben', 'Lighting, jobs, and somebody who knows your name.', 'Освещение, работа и кто-то, кто знает вас по имени.'],
        ['Anna', 'Which sounds soft and measures hard.', 'Звучит мягко, а меряется жёстко.'],
        ['Ben', 'Whereas longer sentences move little.', 'Тогда как более длинные сроки меняют мало.'],
        ['Anna', 'Which every review has found.', 'Это нашли все обзоры.'],
        ['Ben', 'And no election has ever run on.', 'И ни на одних выборах это не звучало.'],
      ]],
      words: [
        ['Lighting, jobs', 'освещение, работа', 'Lighting, jobs, and somebody who knows your name.'],
        ['sounds soft and measures hard', 'звучит мягко, меряется жёстко', 'Which sounds soft and measures hard.'],
        ['longer sentences move little', 'длинные сроки меняют мало', 'Whereas longer sentences move little.'],
        ['every review has found', 'нашли все обзоры', 'Which every review has found.'],
        ['no election has run on', 'ни на одних выборах не звучало', 'And no election has ever run on.'],
      ],
      rule: ['Безопасность обсуждают цифрами и пассивом', 'Пассив без исполнителя удобен там, где виноватого назвать нельзя, и опасен там, где можно.'],
      quiz: [
        ['«Тогда как более длинные сроки меняют мало» —', ['Whereas longer sentences move little', 'Whereas longer sentences moves little', 'Whereas more long sentences move little'], 0],
        ['«Звучит мягко, а меряется жёстко» —', ['Which sounds soft and measures hard', 'Which sounds softly and measures hardly', 'Which sound soft and measure hard'], 0],
        ['«Это нашли все обзоры» —', ['Which every review has found', 'Which every review have found', 'Which every reviews has found'], 0],
      ],
      order: ['И ни на одних выборах это не звучало.', 'And no election has ever run on.'],
      produce: [
        ['Освещение, работа и кто-то, кто знает вас по имени.', 'Lighting, jobs, and somebody who knows your name.', []],
        ['Звучит мягко, а меряется жёстко.', 'Which sounds soft and measures hard.', []],
        ['Тогда как более длинные сроки меняют мало.', 'Whereas longer sentences move little.', []],
      ],
    },
    {
      checkpoint: true,
      title: 'Проверка: преступление и безопасность',
      summary: 'Шесть фраз без подсказок.',
      topics: [SO, DE, CI, DA],
      produce: [
        ['Ведь страх кормят истории, а не подсчёты.', 'Since fear is fed by stories, not counts.', []],
        ['Так пустые места и остаются страшными.', 'Which is how empty places stay frightening.', []],
        ['Ведь никто не ждёт, что что-то выйдет.', 'Since nothing is expected to come of it.', []],
        ['Потому что заголовок написали заранее.', 'Because the headline had been written first.', []],
        ['Это либо провал, либо задача.', 'Which is either a failure or a purpose.', []],
        ['Что делает приговор пожизненным.', 'Which makes the sentence permanent.', []],
      ],
    },
  ],
}
