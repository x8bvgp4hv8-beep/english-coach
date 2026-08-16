// B2, блок 49 — People who turn up. Те, кто приходит.
//
// Тематический блок: волонтёрство, соседские инициативы, выгорание активистов
// и вопрос «почему это делаем мы, а не город». Модальные, уступки, планы.

const SO = 'b2-tema-sociedad'
const CI = 'b2-tema-ciudad'
const RE = 'b2-tema-relaciones'
const PS = 'b2-tema-psicologia'
const LI = 'b2-linkers'

export default {
  slug: 'people-who-turn-up',
  title: 'Те, кто приходит',
  subtitle: 'Волонтёрство, соседи и усталость активистов',
  canDo: [
    'позвать людей на общее дело',
    'распределить работу без начальника',
    'говорить о выгорании в волонтёрстве',
    'спорить, что должен делать город',
    'закрывать инициативу достойно',
  ],
  lessons: [
    {
      title: 'Six people on a Saturday',
      summary: 'Шесть человек в субботу.',
      topics: [CI, SO, LI],
      dialogue: ['Суббота', [
        ['Anna', 'Forty said yes, and six came.', 'Сорок сказали да, пришли шестеро.'],
        ['Ben', 'Which is the normal ratio, everywhere.', 'Обычное соотношение, везде.'],
        ['Anna', 'And is worth knowing before you plan.', 'И это стоит знать до планирования.'],
        ['Ben', 'Since six can clear one street.', 'Ведь шестеро могут расчистить одну улицу.'],
        ['Anna', 'Which is what we planned for, in the end.', 'На это мы в итоге и рассчитывали.'],
      ]],
      words: [
        ['Forty said yes', 'сорок сказали да', 'Forty said yes, and six came.'],
        ['the normal ratio', 'обычное соотношение', 'Which is the normal ratio, everywhere.'],
        ['before you plan', 'до планирования', 'And is worth knowing before you plan.'],
        ['can clear one street', 'могут расчистить одну улицу', 'Since six can clear one street.'],
        ['what we planned for', 'на что мы рассчитывали', 'Which is what we planned for, in the end.'],
      ],
      rule: ['Plan for something', 'What we planned for. Предлог for нужен, когда речь о том, к чему готовились.'],
      quiz: [
        ['«Сорок сказали да, пришли шестеро» —', ['Forty said yes, and six came', 'Forty said yes, and six come', 'Forty says yes, and six came'], 0],
        ['«На это мы в итоге и рассчитывали» —', ['Which is what we planned for, in the end', 'Which is what we planned, in the end', 'Which is that we planned for, in the end'], 0],
        ['«И это стоит знать до планирования» —', ['And is worth knowing before you plan', 'And is worth to know before you plan', 'And is worth knowing before you will plan'], 0],
      ],
      order: ['Обычное соотношение, везде.', 'Which is the normal ratio, everywhere.'],
      produce: [
        ['Сорок сказали да, пришли шестеро.', 'Forty said yes, and six came.', []],
        ['И это стоит знать до планирования.', 'And is worth knowing before you plan.', []],
        ['Ведь шестеро могут расчистить одну улицу.', 'Since six can clear one street.', []],
      ],
    },
    {
      title: 'Nobody is in charge',
      summary: 'Начальника нет.',
      topics: [SO, RE, LI],
      dialogue: ['Организация', [
        ['Ben', 'Nobody can be told what to do here.', 'Здесь никому нельзя приказать.'],
        ['Anna', 'Which is the point, and the difficulty.', 'В этом и смысл, и трудность.'],
        ['Ben', 'So tasks are claimed, not assigned.', 'Поэтому задачи берут, а не раздают.'],
        ['Anna', 'On a list anybody can add to.', 'В списке, куда каждый может дописать.'],
        ['Ben', 'Which works until the boring jobs.', 'Что работает до скучных дел.'],
      ]],
      words: [
        ['can be told what to do', 'можно приказать', 'Nobody can be told what to do here.'],
        ['the point, and the difficulty', 'смысл и трудность', 'Which is the point, and the difficulty.'],
        ['claimed, not assigned', 'берут, а не раздают', 'So tasks are claimed, not assigned.'],
        ['anybody can add to', 'куда каждый может дописать', 'On a list anybody can add to.'],
        ['until the boring jobs', 'до скучных дел', 'Which works until the boring jobs.'],
      ],
      rule: ['Модальный пассив с косвенным вопросом', 'Nobody can be told what to do. Конструкция соединяет can be told и what to do без союза.'],
      quiz: [
        ['«Здесь никому нельзя приказать» —', ['Nobody can be told what to do here', 'Nobody can be tell what to do here', 'Nobody can be told what do here'], 0],
        ['«Поэтому задачи берут, а не раздают» —', ['So tasks are claimed, not assigned', 'So tasks are claim, not assigned', 'So tasks is claimed, not assigned'], 0],
        ['«В списке, куда каждый может дописать» —', ['On a list anybody can add to', 'On a list anybody can add', 'On a list anybody can to add'], 0],
      ],
      order: ['Что работает до скучных дел.', 'Which works until the boring jobs.'],
      produce: [
        ['Здесь никому нельзя приказать.', 'Nobody can be told what to do here.', []],
        ['Поэтому задачи берут, а не раздают.', 'So tasks are claimed, not assigned.', []],
        ['В списке, куда каждый может дописать.', 'On a list anybody can add to.', []],
      ],
    },
    {
      title: 'The one who does everything',
      summary: 'Тот, кто делает всё.',
      topics: [PS, SO, LI],
      dialogue: ['Один за всех', [
        ['Anna', 'She has been holding it together for four years.', 'Она держит всё это четыре года.'],
        ['Ben', 'Which everybody admires and nobody replaces.', 'Чем все восхищаются и никто её не сменяет.'],
        ['Anna', 'Since replacing her means learning her job.', 'Ведь сменить её значит выучить её работу.'],
        ['Ben', 'Which she has never written down.', 'Которую она никогда не записывала.'],
        ['Anna', 'And which will leave with her.', 'И которая уйдёт вместе с ней.'],
      ]],
      words: [
        ['holding it together', 'держит всё это', 'She has been holding it together for four years.'],
        ['nobody replaces', 'никто не сменяет', 'Which everybody admires and nobody replaces.'],
        ['replacing her', 'сменить её', 'Since replacing her means learning her job.'],
        ['never written down', 'никогда не записывала', 'Which she has never written down.'],
        ['will leave with her', 'уйдёт вместе с ней', 'And which will leave with her.'],
      ],
      rule: ['Have been doing — длящееся до сих пор', 'She has been holding it together for four years. Форма подчёркивает длительность и продолжение.'],
      quiz: [
        ['«Она держит всё это четыре года» —', ['She has been holding it together for four years', 'She has been hold it together for four years', 'She is holding it together for four years'], 0],
        ['«Ведь сменить её значит выучить её работу» —', ['Since replacing her means learning her job', 'Since replace her means learning her job', 'Since replacing her mean learning her job'], 0],
        ['«Которую она никогда не записывала» —', ['Which she has never written down', 'Which she has never wrote down', 'Which she have never written down'], 0],
      ],
      order: ['И которая уйдёт вместе с ней.', 'And which will leave with her.'],
      produce: [
        ['Она держит всё это четыре года.', 'She has been holding it together for four years.', []],
        ['Ведь сменить её значит выучить её работу.', 'Since replacing her means learning her job.', []],
        ['И которая уйдёт вместе с ней.', 'And which will leave with her.', []],
      ],
    },
    {
      title: 'Why us and not the council',
      summary: 'Почему мы, а не мэрия.',
      topics: [SO, CI, LI],
      dialogue: ['Вопрос', [
        ['Ben', 'The council should be cutting this grass.', 'Эту траву должна косить мэрия.'],
        ['Anna', 'Which it stopped doing in twenty nineteen.', 'Что она перестала делать в девятнадцатом.'],
        ['Ben', 'And which our cutting it hides.', 'И что наша косьба скрывает.'],
        ['Anna', 'Since a tidy street files no complaints.', 'Ведь опрятная улица жалоб не подаёт.'],
        ['Ben', 'Which is the argument for doing nothing.', 'Это и есть аргумент за бездействие.'],
      ]],
      words: [
        ['should be cutting this grass', 'должна косить эту траву', 'The council should be cutting this grass.'],
        ['stopped doing in twenty nineteen', 'перестала делать в девятнадцатом', 'Which it stopped doing in twenty nineteen.'],
        ['our cutting it hides', 'наша косьба скрывает', 'And which our cutting it hides.'],
        ['files no complaints', 'жалоб не подаёт', 'Since a tidy street files no complaints.'],
        ['the argument for doing nothing', 'аргумент за бездействие', 'Which is the argument for doing nothing.'],
      ],
      rule: ['Should be doing — упрёк о настоящем', 'The council should be cutting this grass. Форма говорит о том, что не делается сейчас.'],
      quiz: [
        ['«Эту траву должна косить мэрия» —', ['The council should be cutting this grass', 'The council should be cut this grass', 'The council should being cutting this grass'], 0],
        ['«Ведь опрятная улица жалоб не подаёт» —', ['Since a tidy street files no complaints', 'Since a tidy street file no complaints', 'Since a tidy street files not complaints'], 0],
        ['«Что она перестала делать в девятнадцатом» —', ['Which it stopped doing in twenty nineteen', 'Which it stopped to do in twenty nineteen', 'Which it stop doing in twenty nineteen'], 0],
      ],
      order: ['Это и есть аргумент за бездействие.', 'Which is the argument for doing nothing.'],
      produce: [
        ['Эту траву должна косить мэрия.', 'The council should be cutting this grass.', []],
        ['Что она перестала делать в девятнадцатом.', 'Which it stopped doing in twenty nineteen.', []],
        ['Ведь опрятная улица жалоб не подаёт.', 'Since a tidy street files no complaints.', []],
      ],
    },
    {
      title: 'Money in a shoebox',
      summary: 'Деньги в коробке из-под обуви.',
      topics: [SO, RE, LI],
      dialogue: ['Касса', [
        ['Anna', 'We raised nine hundred in two weeks.', 'Мы собрали девятьсот за две недели.'],
        ['Ben', 'Which needs an account and two signatures.', 'На это нужен счёт и две подписи.'],
        ['Anna', 'Before anybody is even suspected.', 'Ещё до того, как кого-то заподозрят.'],
        ['Ben', 'Which is protection, not distrust.', 'Это защита, а не недоверие.'],
        ['Anna', 'And has saved more groups than it annoyed.', 'И спасло больше групп, чем раздражило.'],
      ]],
      words: [
        ['raised nine hundred', 'собрали девятьсот', 'We raised nine hundred in two weeks.'],
        ['an account and two signatures', 'счёт и две подписи', 'Which needs an account and two signatures.'],
        ['Before anybody is suspected', 'до того, как кого-то заподозрят', 'Before anybody is even suspected.'],
        ['protection, not distrust', 'защита, а не недоверие', 'Which is protection, not distrust.'],
        ['more groups than it annoyed', 'больше групп, чем раздражило', 'And has saved more groups than it annoyed.'],
      ],
      rule: ['Before + пассив в настоящем', 'Before anybody is even suspected. После before настоящее время описывает будущее событие.'],
      quiz: [
        ['«Ещё до того, как кого-то заподозрят» —', ['Before anybody is even suspected', 'Before anybody will be even suspected', 'Before anybody is even suspect'], 0],
        ['«Мы собрали девятьсот за две недели» —', ['We raised nine hundred in two weeks', 'We raised nine hundreds in two weeks', 'We rised nine hundred in two weeks'], 0],
        ['«И спасло больше групп, чем раздражило» —', ['And has saved more groups than it annoyed', 'And has saved more groups that it annoyed', 'And have saved more groups than it annoyed'], 0],
      ],
      order: ['Это защита, а не недоверие.', 'Which is protection, not distrust.'],
      produce: [
        ['Мы собрали девятьсот за две недели.', 'We raised nine hundred in two weeks.', []],
        ['На это нужен счёт и две подписи.', 'Which needs an account and two signatures.', []],
        ['Ещё до того, как кого-то заподозрят.', 'Before anybody is even suspected.', []],
      ],
    },
    {
      title: 'The argument in the group chat',
      summary: 'Ссора в общем чате.',
      topics: [RE, PS, LI],
      dialogue: ['Чат', [
        ['Ben', 'Two hundred messages about a fence.', 'Двести сообщений про забор.'],
        ['Anna', 'Which would have taken nine minutes in person.', 'В живом разговоре ушло бы девять минут.'],
        ['Ben', 'Since nobody can hear a shrug in writing.', 'Ведь пожатие плечами в тексте не слышно.'],
        ['Anna', 'So I called the two of them.', 'Поэтому я позвонила им обоим.'],
        ['Ben', 'Which ended it before Thursday.', 'Что закончило это до четверга.'],
      ]],
      words: [
        ['Two hundred messages', 'двести сообщений', 'Two hundred messages about a fence.'],
        ['would have taken nine minutes', 'ушло бы девять минут', 'Which would have taken nine minutes in person.'],
        ['hear a shrug in writing', 'услышать пожатие плечами в тексте', 'Since nobody can hear a shrug in writing.'],
        ['called the two of them', 'позвонила им обоим', 'So I called the two of them.'],
        ['ended it before Thursday', 'закончило до четверга', 'Which ended it before Thursday.'],
      ],
      rule: ['Would have taken — несбывшийся вариант', 'It would have taken nine minutes in person. Форма сравнивает случившееся с невыбранным путём.'],
      quiz: [
        ['«В живом разговоре ушло бы девять минут» —', ['Which would have taken nine minutes in person', 'Which would has taken nine minutes in person', 'Which would have took nine minutes in person'], 0],
        ['«Ведь пожатие плечами в тексте не слышно» —', ['Since nobody can hear a shrug in writing', 'Since nobody can hears a shrug in writing', 'Since nobody can hear a shrug in written'], 0],
        ['«Поэтому я позвонила им обоим» —', ['So I called the two of them', 'So I called to the two of them', 'So I call the two of them'], 0],
      ],
      order: ['Двести сообщений про забор.', 'Two hundred messages about a fence.'],
      produce: [
        ['Двести сообщений про забор.', 'Two hundred messages about a fence.', []],
        ['В живом разговоре ушло бы девять минут.', 'Which would have taken nine minutes in person.', []],
        ['Ведь пожатие плечами в тексте не слышно.', 'Since nobody can hear a shrug in writing.', []],
      ],
    },
    {
      title: 'Burning out quietly',
      summary: 'Тихо выгореть.',
      topics: [PS, SO, LI],
      dialogue: ['Выгорание', [
        ['Anna', 'I stopped answering, without saying so.', 'Я перестала отвечать, не сказав об этом.'],
        ['Ben', 'Which is how most volunteers leave.', 'Так большинство волонтёров и уходит.'],
        ['Anna', 'And which nobody can plan around.', 'И под это нельзя подстроиться.'],
        ['Ben', 'Whereas a date and a handover can be.', 'Тогда как под дату и передачу дел — можно.'],
        ['Anna', 'Which I owe them, honestly.', 'Что я им, честно говоря, должна.'],
      ]],
      words: [
        ['stopped answering', 'перестала отвечать', 'I stopped answering, without saying so.'],
        ['how most volunteers leave', 'как уходит большинство волонтёров', 'Which is how most volunteers leave.'],
        ['nobody can plan around', 'нельзя подстроиться', 'And which nobody can plan around.'],
        ['a date and a handover', 'дата и передача дел', 'Whereas a date and a handover can be.'],
        ['I owe them', 'я им должна', 'Which I owe them, honestly.'],
      ],
      rule: ['Усечённый ответ с can be', 'Whereas a date and a handover can be. Смысловой глагол опускается, оставляя вспомогательный.'],
      quiz: [
        ['«Тогда как под дату и передачу дел — можно» —', ['Whereas a date and a handover can be', 'Whereas a date and a handover can', 'Whereas a date and a handover can be planned around it'], 0],
        ['«Я перестала отвечать, не сказав об этом» —', ['I stopped answering, without saying so', 'I stopped to answer, without saying so', 'I stopped answering, without say so'], 0],
        ['«И под это нельзя подстроиться» —', ['And which nobody can plan around', 'And which nobody can plan', 'And which nobody can to plan around'], 0],
      ],
      order: ['Так большинство волонтёров и уходит.', 'Which is how most volunteers leave.'],
      produce: [
        ['Я перестала отвечать, не сказав об этом.', 'I stopped answering, without saying so.', []],
        ['И под это нельзя подстроиться.', 'And which nobody can plan around.', []],
        ['Что я им, честно говоря, должна.', 'Which I owe them, honestly.', []],
      ],
    },
    {
      title: 'Closing it properly',
      summary: 'Закрыть по-человечески.',
      topics: [SO, RE, LI],
      dialogue: ['Финал', [
        ['Ben', 'We ended it at the fourth birthday.', 'Мы закончили на четвёртый день рождения.'],
        ['Anna', 'Which almost nothing does, deliberately.', 'Так почти ничего специально не делает.'],
        ['Ben', 'And left the tools with the school.', 'И оставили инструменты школе.'],
        ['Anna', 'Which is a better ending than fading.', 'Это лучший финал, чем угасание.'],
        ['Ben', 'And makes the next thing easier to start.', 'И облегчает начало следующего дела.'],
      ]],
      words: [
        ['ended it at the fourth birthday', 'закончили на четвёртый день рождения', 'We ended it at the fourth birthday.'],
        ['almost nothing does, deliberately', 'почти ничего специально не делает', 'Which almost nothing does, deliberately.'],
        ['left the tools with the school', 'оставили инструменты школе', 'And left the tools with the school.'],
        ['better ending than fading', 'лучший финал, чем угасание', 'Which is a better ending than fading.'],
        ['easier to start', 'легче начать', 'And makes the next thing easier to start.'],
      ],
      rule: ['Общее дело держится на списке и дате', 'Задачи, которые берут добровольно, и дата окончания спасают инициативу вернее энтузиазма.'],
      quiz: [
        ['«Это лучший финал, чем угасание» —', ['Which is a better ending than fading', 'Which is a better ending than fade', 'Which is a more better ending than fading'], 0],
        ['«И облегчает начало следующего дела» —', ['And makes the next thing easier to start', 'And makes the next thing easier to starting', 'And make the next thing easier to start'], 0],
        ['«Мы закончили на четвёртый день рождения» —', ['We ended it at the fourth birthday', 'We ended it in the fourth birthday', 'We end it at the fourth birthday'], 0],
      ],
      order: ['И оставили инструменты школе.', 'And left the tools with the school.'],
      produce: [
        ['Мы закончили на четвёртый день рождения.', 'We ended it at the fourth birthday.', []],
        ['И оставили инструменты школе.', 'And left the tools with the school.', []],
        ['И облегчает начало следующего дела.', 'And makes the next thing easier to start.', []],
      ],
    },
    {
      checkpoint: true,
      title: 'Проверка: те, кто приходит',
      summary: 'Шесть фраз без подсказок.',
      topics: [SO, CI, RE, PS],
      produce: [
        ['На это мы в итоге и рассчитывали.', 'Which is what we planned for, in the end.', []],
        ['Здесь никому нельзя приказать.', 'Nobody can be told what to do here.', []],
        ['Она держит всё это четыре года.', 'She has been holding it together for four years.', []],
        ['Эту траву должна косить мэрия.', 'The council should be cutting this grass.', []],
        ['Ещё до того, как кого-то заподозрят.', 'Before anybody is even suspected.', []],
        ['В живом разговоре ушло бы девять минут.', 'Which would have taken nine minutes in person.', []],
      ],
    },
  ],
}
