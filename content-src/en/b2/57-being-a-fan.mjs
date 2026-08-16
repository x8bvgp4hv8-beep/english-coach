// B2, блок 57 — Being a fan. Быть болельщиком.
//
// Тематический блок: клуб, деньги в спорте, национальная сборная, ритуалы и
// почему взрослые люди плачут из-за мяча. Оценки, уступки, сравнения.

const DP = 'b2-tema-deporte'
const CU = 'b2-tema-cultura'
const ME = 'b2-tema-medios'
const RI = 'b2-tema-riesgo'
const LI = 'b2-linkers'

export default {
  slug: 'being-a-fan',
  title: 'Быть болельщиком',
  subtitle: 'Клуб, деньги, сборная и ритуалы',
  canDo: [
    'объяснить, за кого и почему болеете',
    'спорить о деньгах в спорте',
    'обсуждать национальную сборную',
    'описывать ритуалы и суеверия',
    'говорить о проигрыше',
  ],
  lessons: [
    {
      title: 'How you choose a club',
      summary: 'Как выбирают клуб.',
      topics: [DP, CU, LI],
      dialogue: ['Выбор', [
        ['Anna', 'Nobody chooses, which is the whole point.', 'Никто не выбирает, в этом весь смысл.'],
        ['Ben', 'You inherit it, like a surname.', 'Его наследуешь, как фамилию.'],
        ['Anna', 'Or you happen to be eight in a good year.', 'Или тебе случилось быть восьмилетним в удачный год.'],
        ['Ben', 'Which is the only honest explanation.', 'Единственное честное объяснение.'],
        ['Anna', 'And is never the one people give.', 'И его-то люди и не называют.'],
      ]],
      words: [
        ['Nobody chooses', 'никто не выбирает', 'Nobody chooses, which is the whole point.'],
        ['inherit it, like a surname', 'наследуешь, как фамилию', 'You inherit it, like a surname.'],
        ['happen to be eight', 'случилось быть восьмилетним', 'Or you happen to be eight in a good year.'],
        ['the only honest explanation', 'единственное честное объяснение', 'Which is the only honest explanation.'],
        ['the one people give', 'то, что люди называют', 'And is never the one people give.'],
      ],
      rule: ['Happen to do', 'You happen to be eight. Оборот значит «так вышло, что», и требует инфинитива с to.'],
      quiz: [
        ['«Или тебе случилось быть восьмилетним в удачный год» —', ['Or you happen to be eight in a good year', 'Or you happen be eight in a good year', 'Or you happen being eight in a good year'], 0],
        ['«Никто не выбирает, в этом весь смысл» —', ['Nobody chooses, which is the whole point', 'Nobody choose, which is the whole point', 'Nobody chooses, what is the whole point'], 0],
        ['«И его-то люди и не называют» —', ['And is never the one people give', 'And is never the one people gives', 'And is never one people give'], 0],
      ],
      order: ['Его наследуешь, как фамилию.', 'You inherit it, like a surname.'],
      produce: [
        ['Никто не выбирает, в этом весь смысл.', 'Nobody chooses, which is the whole point.', []],
        ['Его наследуешь, как фамилию.', 'You inherit it, like a surname.', []],
        ['Единственное честное объяснение.', 'Which is the only honest explanation.', []],
      ],
    },
    {
      title: 'The price of a ticket',
      summary: 'Цена билета.',
      topics: [RI, DP, LI],
      dialogue: ['Билет', [
        ['Ben', 'A season ticket costs a month of rent.', 'Абонемент стоит месяц аренды.'],
        ['Anna', 'Which has doubled since his father went.', 'И это вдвое больше, чем когда ходил его отец.'],
        ['Ben', 'Whose seat was two hours of work.', 'Чьё место стоило двух часов работы.'],
        ['Anna', 'Which is the change nobody voted for.', 'Перемена, за которую никто не голосовал.'],
        ['Ben', 'And which emptied the cheap end first.', 'И которая первым опустошила дешёвый сектор.'],
      ]],
      words: [
        ['A season ticket', 'абонемент', 'A season ticket costs a month of rent.'],
        ['has doubled since', 'вдвое больше с тех пор', 'Which has doubled since his father went.'],
        ['Whose seat was two hours of work', 'чьё место стоило двух часов работы', 'Whose seat was two hours of work.'],
        ['nobody voted for', 'за что никто не голосовал', 'Which is the change nobody voted for.'],
        ['emptied the cheap end', 'опустошила дешёвый сектор', 'And which emptied the cheap end first.'],
      ],
      rule: ['Whose о предмете', 'Whose seat was two hours of work. Местоимение работает и для людей, и для вещей.'],
      quiz: [
        ['«Чьё место стоило двух часов работы» —', ['Whose seat was two hours of work', 'Which seat was two hours of work', 'Whose seat were two hours of work'], 0],
        ['«Перемена, за которую никто не голосовал» —', ['The change nobody voted for', 'The change nobody voted', 'The change what nobody voted for'], 0],
        ['«И это вдвое больше, чем когда ходил его отец» —', ['Which has doubled since his father went', 'Which has doubled since his father go', 'Which have doubled since his father went'], 0],
      ],
      order: ['Абонемент стоит месяц аренды.', 'A season ticket costs a month of rent.'],
      produce: [
        ['Абонемент стоит месяц аренды.', 'A season ticket costs a month of rent.', []],
        ['Чьё место стоило двух часов работы.', 'Whose seat was two hours of work.', []],
        ['И которая первым опустошила дешёвый сектор.', 'And which emptied the cheap end first.', []],
      ],
    },
    {
      title: 'Who owns the club',
      summary: 'Кому принадлежит клуб.',
      topics: [RI, ME, LI],
      dialogue: ['Владельцы', [
        ['Anna', 'It has been sold three times in a decade.', 'Его продали трижды за десять лет.'],
        ['Ben', 'Each time to somebody further away.', 'Каждый раз кому-то ещё более далёкому.'],
        ['Anna', 'Which the fans can do nothing about.', 'С чем болельщики ничего не могут поделать.'],
        ['Ben', 'Beyond not going, which hurts them more.', 'Кроме как не ходить, что бьёт по ним самим сильнее.'],
        ['Anna', 'Which is why the stands stay full.', 'Поэтому трибуны и остаются полными.'],
      ]],
      words: [
        ['has been sold three times', 'продали трижды', 'It has been sold three times in a decade.'],
        ['somebody further away', 'кто-то более далёкий', 'Each time to somebody further away.'],
        ['can do nothing about', 'ничего не могут поделать', 'Which the fans can do nothing about.'],
        ['Beyond not going', 'кроме как не ходить', 'Beyond not going, which hurts them more.'],
        ['the stands stay full', 'трибуны остаются полными', 'Which is why the stands stay full.'],
      ],
      rule: ['Do nothing about something', 'They can do nothing about it. Предлог about остаётся в конце придаточного.'],
      quiz: [
        ['«С чем болельщики ничего не могут поделать» —', ['Which the fans can do nothing about', 'Which the fans can do nothing', 'Which the fans can does nothing about'], 0],
        ['«Его продали трижды за десять лет» —', ['It has been sold three times in a decade', 'It has been sell three times in a decade', 'It have been sold three times in a decade'], 0],
        ['«Поэтому трибуны и остаются полными» —', ['Which is why the stands stay full', 'Which is why the stands stays full', 'Which is why the stands stay fully'], 0],
      ],
      order: ['Каждый раз кому-то ещё более далёкому.', 'Each time to somebody further away.'],
      produce: [
        ['Его продали трижды за десять лет.', 'It has been sold three times in a decade.', []],
        ['С чем болельщики ничего не могут поделать.', 'Which the fans can do nothing about.', []],
        ['Кроме как не ходить, что бьёт по ним самим сильнее.', 'Beyond not going, which hurts them more.', []],
      ],
    },
    {
      title: 'The national team',
      summary: 'Сборная.',
      topics: [DP, CU, LI],
      dialogue: ['Сборная', [
        ['Ben', 'People who hate flags own three.', 'Люди, ненавидящие флаги, держат по три.'],
        ['Anna', 'For six weeks, every two years.', 'На шесть недель, раз в два года.'],
        ['Ben', 'Which says something about belonging.', 'Что говорит кое-что о принадлежности.'],
        ['Anna', 'And about how rarely it is offered.', 'И о том, как редко её предлагают.'],
        ['Ben', 'Without a bill attached, at least.', 'Хотя бы без счёта в придачу.'],
      ]],
      words: [
        ['People who hate flags', 'люди, ненавидящие флаги', 'People who hate flags own three.'],
        ['every two years', 'раз в два года', 'For six weeks, every two years.'],
        ['says something about belonging', 'говорит о принадлежности', 'Which says something about belonging.'],
        ['how rarely it is offered', 'как редко её предлагают', 'And about how rarely it is offered.'],
        ['Without a bill attached', 'без счёта в придачу', 'Without a bill attached, at least.'],
      ],
      rule: ['Косвенный вопрос с how', 'About how rarely it is offered. Порядок слов прямой, глагол не выносится вперёд.'],
      quiz: [
        ['«И о том, как редко её предлагают» —', ['And about how rarely it is offered', 'And about how rarely is it offered', 'And about how rare it is offered'], 0],
        ['«Люди, ненавидящие флаги, держат по три» —', ['People who hate flags own three', 'People who hates flags own three', 'People what hate flags own three'], 0],
        ['«Хотя бы без счёта в придачу» —', ['Without a bill attached, at least', 'Without a bill attaching, at least', 'Without attached a bill, at least'], 0],
      ],
      order: ['На шесть недель, раз в два года.', 'For six weeks, every two years.'],
      produce: [
        ['Люди, ненавидящие флаги, держат по три.', 'People who hate flags own three.', []],
        ['Что говорит кое-что о принадлежности.', 'Which says something about belonging.', []],
        ['И о том, как редко её предлагают.', 'And about how rarely it is offered.', []],
      ],
    },
    {
      title: 'Superstitions',
      summary: 'Суеверия.',
      topics: [CU, DP, LI],
      dialogue: ['Ритуалы', [
        ['Anna', 'He watches the second half standing up.', 'Второй тайм он смотрит стоя.'],
        ['Ben', 'Which he knows changes nothing.', 'И знает, что это ничего не меняет.'],
        ['Anna', 'And does anyway, for eleven years.', 'И всё равно делает, одиннадцать лет.'],
        ['Ben', 'Since the ritual is not about the result.', 'Ведь ритуал не про результат.'],
        ['Anna', 'But about having something to do.', 'А про то, чтобы было чем заняться.'],
      ]],
      words: [
        ['watches the second half standing up', 'смотрит второй тайм стоя', 'He watches the second half standing up.'],
        ['knows changes nothing', 'знает, что ничего не меняет', 'Which he knows changes nothing.'],
        ['does anyway', 'всё равно делает', 'And does anyway, for eleven years.'],
        ['not about the result', 'не про результат', 'Since the ritual is not about the result.'],
        ['having something to do', 'чтобы было чем заняться', 'But about having something to do.'],
      ],
      rule: ['Which he knows + сказуемое', 'Which he knows changes nothing. Вставка he knows не меняет порядок слов придаточного.'],
      quiz: [
        ['«И знает, что это ничего не меняет» —', ['Which he knows changes nothing', 'Which he knows change nothing', 'Which he knows it changes nothing'], 0],
        ['«Второй тайм он смотрит стоя» —', ['He watches the second half standing up', 'He watches the second half stand up', 'He watch the second half standing up'], 0],
        ['«А про то, чтобы было чем заняться» —', ['But about having something to do', 'But about have something to do', 'But about having something to doing'], 0],
      ],
      order: ['И всё равно делает, одиннадцать лет.', 'And does anyway, for eleven years.'],
      produce: [
        ['Второй тайм он смотрит стоя.', 'He watches the second half standing up.', []],
        ['И знает, что это ничего не меняет.', 'Which he knows changes nothing.', []],
        ['Ведь ритуал не про результат.', 'Since the ritual is not about the result.', []],
      ],
    },
    {
      title: 'Losing badly',
      summary: 'Тяжёлое поражение.',
      topics: [DP, LI, CU],
      dialogue: ['Проигрыш', [
        ['Ben', 'We lost in the last minute, at home.', 'Мы проиграли на последней минуте, дома.'],
        ['Anna', 'Which nobody in the family mentioned for a week.', 'О чём в семье неделю не упоминали.'],
        ['Ben', 'Though everybody had watched it together.', 'Хотя смотрели все вместе.'],
        ['Anna', 'Which is grief, in a small and silly form.', 'Это горе, в маленькой и глупой форме.'],
        ['Ben', 'And is still, unmistakably, grief.', 'И всё-таки безошибочно горе.'],
      ]],
      words: [
        ['lost in the last minute', 'проиграли на последней минуте', 'We lost in the last minute, at home.'],
        ['nobody mentioned for a week', 'неделю не упоминали', 'Which nobody in the family mentioned for a week.'],
        ['had watched it together', 'смотрели вместе', 'Though everybody had watched it together.'],
        ['in a small and silly form', 'в маленькой и глупой форме', 'Which is grief, in a small and silly form.'],
        ['unmistakably, grief', 'безошибочно горе', 'And is still, unmistakably, grief.'],
      ],
      rule: ['Had watched — фон в прошлом', 'Everybody had watched it together. Предпрошедшее ставит просмотр раньше молчания.'],
      quiz: [
        ['«Хотя смотрели все вместе» —', ['Though everybody had watched it together', 'Though everybody had watch it together', 'Though everybody have watched it together'], 0],
        ['«Мы проиграли на последней минуте, дома» —', ['We lost in the last minute, at home', 'We losed in the last minute, at home', 'We lost on the last minute, at home'], 0],
        ['«И всё-таки безошибочно горе» —', ['And is still, unmistakably, grief', 'And is still, unmistakable, grief', 'And is still, unmistakably, grieve'], 0],
      ],
      order: ['О чём в семье неделю не упоминали.', 'Which nobody in the family mentioned for a week.'],
      produce: [
        ['Мы проиграли на последней минуте, дома.', 'We lost in the last minute, at home.', []],
        ['О чём в семье неделю не упоминали.', 'Which nobody in the family mentioned for a week.', []],
        ['Это горе, в маленькой и глупой форме.', 'Which is grief, in a small and silly form.', []],
      ],
    },
    {
      title: 'Explaining it to somebody who does not care',
      summary: 'Объяснить тому, кому всё равно.',
      topics: [CU, LI, DP],
      dialogue: ['Объяснение', [
        ['Anna', 'It is ninety minutes of shared uncertainty.', 'Это девяносто минут общей неизвестности.'],
        ['Ben', 'Which adults get almost nowhere else.', 'Чего взрослые почти нигде больше не получают.'],
        ['Anna', 'Legally, and with strangers, and out loud.', 'Законно, с незнакомцами и вслух.'],
        ['Ben', 'Which is a strange thing to have to defend.', 'Странно, что это приходится защищать.'],
        ['Anna', 'And is defended badly, by everybody.', 'И защищают это все плохо.'],
      ]],
      words: [
        ['shared uncertainty', 'общая неизвестность', 'It is ninety minutes of shared uncertainty.'],
        ['almost nowhere else', 'почти нигде больше', 'Which adults get almost nowhere else.'],
        ['and out loud', 'и вслух', 'Legally, and with strangers, and out loud.'],
        ['a strange thing to have to defend', 'странно, что приходится защищать', 'Which is a strange thing to have to defend.'],
        ['is defended badly', 'защищают плохо', 'And is defended badly, by everybody.'],
      ],
      rule: ['Have to внутри инфинитива', 'A strange thing to have to defend. Оборот соединяет необходимость и инфинитивное определение.'],
      quiz: [
        ['«Странно, что это приходится защищать» —', ['A strange thing to have to defend', 'A strange thing to have defend', 'A strange thing for have to defend'], 0],
        ['«Чего взрослые почти нигде больше не получают» —', ['Which adults get almost nowhere else', 'Which adults get almost anywhere else', 'Which adults gets almost nowhere else'], 0],
        ['«И защищают это все плохо» —', ['And is defended badly, by everybody', 'And is defend badly, by everybody', 'And is defended bad, by everybody'], 0],
      ],
      order: ['Законно, с незнакомцами и вслух.', 'Legally, and with strangers, and out loud.'],
      produce: [
        ['Это девяносто минут общей неизвестности.', 'It is ninety minutes of shared uncertainty.', []],
        ['Чего взрослые почти нигде больше не получают.', 'Which adults get almost nowhere else.', []],
        ['Странно, что это приходится защищать.', 'Which is a strange thing to have to defend.', []],
      ],
    },
    {
      title: 'Taking a child to a first match',
      summary: 'Первый матч с ребёнком.',
      topics: [DP, CU, LI],
      dialogue: ['Первый матч', [
        ['Ben', 'He watched the crowd, not the pitch.', 'Он смотрел на трибуны, а не на поле.'],
        ['Anna', 'Which is what everybody does at six.', 'Что в шесть лет делают все.'],
        ['Ben', 'And remembers thirty years later.', 'И помнят тридцать лет спустя.'],
        ['Anna', 'Long after the score has gone.', 'Долго после того, как счёт забылся.'],
        ['Ben', 'Which is the whole inheritance, really.', 'В этом и всё наследство, если честно.'],
      ]],
      words: [
        ['watched the crowd, not the pitch', 'смотрел на трибуны, а не на поле', 'He watched the crowd, not the pitch.'],
        ['what everybody does at six', 'что делают все в шесть', 'Which is what everybody does at six.'],
        ['remembers thirty years later', 'помнит тридцать лет спустя', 'And remembers thirty years later.'],
        ['the score has gone', 'счёт забылся', 'Long after the score has gone.'],
        ['the whole inheritance', 'всё наследство', 'Which is the whole inheritance, really.'],
      ],
      rule: ['Болельщик наследует, а не выбирает', 'Клуб, ритуал и первый матч передаются как семейная привычка, и спорить с этим бесполезно.'],
      quiz: [
        ['«Что в шесть лет делают все» —', ['Which is what everybody does at six', 'Which is what everybody do at six', 'Which is that everybody does at six'], 0],
        ['«Долго после того, как счёт забылся» —', ['Long after the score has gone', 'Long after the score has go', 'Long after the score have gone'], 0],
        ['«Он смотрел на трибуны, а не на поле» —', ['He watched the crowd, not the pitch', 'He watched on the crowd, not the pitch', 'He watch the crowd, not the pitch'], 0],
      ],
      order: ['В этом и всё наследство, если честно.', 'Which is the whole inheritance, really.'],
      produce: [
        ['Он смотрел на трибуны, а не на поле.', 'He watched the crowd, not the pitch.', []],
        ['И помнят тридцать лет спустя.', 'And remembers thirty years later.', []],
        ['В этом и всё наследство, если честно.', 'Which is the whole inheritance, really.', []],
      ],
    },
    {
      checkpoint: true,
      title: 'Проверка: быть болельщиком',
      summary: 'Шесть фраз без подсказок.',
      topics: [DP, CU, ME, RI],
      produce: [
        ['Или тебе случилось быть восьмилетним в удачный год.', 'Or you happen to be eight in a good year.', []],
        ['Чьё место стоило двух часов работы.', 'Whose seat was two hours of work.', []],
        ['С чем болельщики ничего не могут поделать.', 'Which the fans can do nothing about.', []],
        ['И о том, как редко её предлагают.', 'And about how rarely it is offered.', []],
        ['И знает, что это ничего не меняет.', 'Which he knows changes nothing.', []],
        ['Хотя смотрели все вместе.', 'Though everybody had watched it together.', []],
      ],
    },
  ],
}
