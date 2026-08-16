// B2, блок 53 — On the phone to a system. Телефон и система.
//
// Тематический блок: колл-центры, скрипты, эскалация, запись разговора и
// умение не сорваться. Вежливое давление, косвенные вопросы, точные слова.

const SE = 'b1-tema-servicios'
const RI = 'b2-tema-riesgo'
const PS = 'b2-tema-psicologia'
const DE = 'b2-tema-derecho'
const LI = 'b2-linkers'

export default {
  slug: 'on-the-phone-to-a-system',
  title: 'Телефон и система',
  subtitle: 'Колл-центры, скрипты и эскалация',
  canDo: [
    'вести разговор с оператором по делу',
    'просить эскалацию правильно',
    'фиксировать обещания',
    'сохранять спокойствие под скриптом',
    'закрывать вопрос письменно',
  ],
  lessons: [
    {
      title: 'Forty minutes of music',
      summary: 'Сорок минут музыки.',
      topics: [SE, PS, LI],
      dialogue: ['Ожидание', [
        ['Anna', 'I was kept on hold for forty minutes.', 'Меня держали на линии сорок минут.'],
        ['Ben', 'Which is a cost, moved onto you.', 'Это издержки, переложенные на вас.'],
        ['Anna', 'And is measured on their side, precisely.', 'И с их стороны они точно измерены.'],
        ['Ben', 'As a saving, in somebody report.', 'Как экономия, в чьём-то отчёте.'],
        ['Anna', 'Which is worth knowing while you wait.', 'Это стоит знать, пока ждёшь.'],
      ]],
      words: [
        ['was kept on hold', 'держали на линии', 'I was kept on hold for forty minutes.'],
        ['a cost, moved onto you', 'издержки, переложенные на вас', 'Which is a cost, moved onto you.'],
        ['measured on their side', 'измерены с их стороны', 'And is measured on their side, precisely.'],
        ['As a saving', 'как экономия', 'As a saving, in somebody report.'],
        ['while you wait', 'пока ждёшь', 'Which is worth knowing while you wait.'],
      ],
      rule: ['Keep somebody on hold', 'I was kept on hold. Пассив от keep сохраняет предлог on и существительное hold.'],
      quiz: [
        ['«Меня держали на линии сорок минут» —', ['I was kept on hold for forty minutes', 'I was keep on hold for forty minutes', 'I was kept in hold for forty minutes'], 0],
        ['«Это издержки, переложенные на вас» —', ['Which is a cost, moved onto you', 'Which is a cost, moving onto you', 'Which is a cost, moved on you to'], 0],
        ['«И с их стороны они точно измерены» —', ['And is measured on their side, precisely', 'And is measure on their side, precisely', 'And is measured on their side, precise'], 0],
      ],
      order: ['Как экономия, в чьём-то отчёте.', 'As a saving, in somebody report.'],
      produce: [
        ['Меня держали на линии сорок минут.', 'I was kept on hold for forty minutes.', []],
        ['Это издержки, переложенные на вас.', 'Which is a cost, moved onto you.', []],
        ['Это стоит знать, пока ждёшь.', 'Which is worth knowing while you wait.', []],
      ],
    },
    {
      title: 'The script on the other end',
      summary: 'Скрипт на том конце.',
      topics: [SE, PS, LI],
      dialogue: ['Скрипт', [
        ['Ben', 'He is reading, and cannot leave the page.', 'Он читает и не может уйти со страницы.'],
        ['Anna', 'Which is not his decision, and shows.', 'Это не его решение, и это видно.'],
        ['Ben', 'So shouting at him changes nothing.', 'Поэтому крик на него ничего не меняет.'],
        ['Anna', 'Except how the next hour goes.', 'Кроме того, как пройдёт следующий час.'],
        ['Ben', 'For both of us, and it goes badly.', 'Для нас обоих, и пройдёт он плохо.'],
      ]],
      words: [
        ['cannot leave the page', 'не может уйти со страницы', 'He is reading, and cannot leave the page.'],
        ['not his decision, and shows', 'не его решение, и это видно', 'Which is not his decision, and shows.'],
        ['shouting at him', 'крик на него', 'So shouting at him changes nothing.'],
        ['how the next hour goes', 'как пройдёт следующий час', 'Except how the next hour goes.'],
        ['For both of us', 'для нас обоих', 'For both of us, and it goes badly.'],
      ],
      rule: ['Герундий как подлежащее с предлогом', 'Shouting at him changes nothing. Предлог at входит в оборот и остаётся при глаголе.'],
      quiz: [
        ['«Поэтому крик на него ничего не меняет» —', ['So shouting at him changes nothing', 'So shout at him changes nothing', 'So shouting on him changes nothing'], 0],
        ['«Кроме того, как пройдёт следующий час» —', ['Except how the next hour goes', 'Except how does the next hour go', 'Except how the next hour go'], 0],
        ['«Это не его решение, и это видно» —', ['Which is not his decision, and shows', 'Which is not his decision, and show', 'Which is not him decision, and shows'], 0],
      ],
      order: ['Он читает и не может уйти со страницы.', 'He is reading, and cannot leave the page.'],
      produce: [
        ['Он читает и не может уйти со страницы.', 'He is reading, and cannot leave the page.', []],
        ['Поэтому крик на него ничего не меняет.', 'So shouting at him changes nothing.', []],
        ['Для нас обоих, и пройдёт он плохо.', 'For both of us, and it goes badly.', []],
      ],
    },
    {
      title: 'The words that move it',
      summary: 'Слова, которые сдвигают дело.',
      topics: [SE, DE, LI],
      dialogue: ['Формулы', [
        ['Anna', 'I would like to raise a formal complaint.', 'Я хотела бы подать официальную жалобу.'],
        ['Ben', 'Which starts a clock on their side.', 'Что запускает у них отсчёт.'],
        ['Anna', 'And produces a reference number.', 'И порождает номер обращения.'],
        ['Ben', 'Which everything afterwards hangs on.', 'На котором висит всё дальнейшее.'],
        ['Anna', 'And which I read back to them.', 'И который я зачитываю им обратно.'],
      ]],
      words: [
        ['raise a formal complaint', 'подать официальную жалобу', 'I would like to raise a formal complaint.'],
        ['starts a clock', 'запускает отсчёт', 'Which starts a clock on their side.'],
        ['produces a reference number', 'порождает номер обращения', 'And produces a reference number.'],
        ['everything hangs on', 'на чём всё висит', 'Which everything afterwards hangs on.'],
        ['read back to them', 'зачитываю им обратно', 'And which I read back to them.'],
      ],
      rule: ['Hang on — зависеть, предлог в конце', 'Which everything hangs on. Предлог остаётся в хвосте придаточного.'],
      quiz: [
        ['«На котором висит всё дальнейшее» —', ['Which everything afterwards hangs on', 'Which everything afterwards hangs', 'Which on everything afterwards hangs'], 0],
        ['«Я хотела бы подать официальную жалобу» —', ['I would like to raise a formal complaint', 'I would like raise a formal complaint', 'I would like to raise a formal complain'], 0],
        ['«И порождает номер обращения» —', ['And produces a reference number', 'And produce a reference number', 'And produces the reference number of'], 0],
      ],
      order: ['Что запускает у них отсчёт.', 'Which starts a clock on their side.'],
      produce: [
        ['Я хотела бы подать официальную жалобу.', 'I would like to raise a formal complaint.', []],
        ['И порождает номер обращения.', 'And produces a reference number.', []],
        ['На котором висит всё дальнейшее.', 'Which everything afterwards hangs on.', []],
      ],
    },
    {
      title: 'Asking for the supervisor',
      summary: 'Попросить старшего.',
      topics: [SE, PS, LI],
      dialogue: ['Эскалация', [
        ['Ben', 'Could I speak to whoever can approve this?', 'Могу я поговорить с тем, кто может это утвердить?'],
        ['Anna', 'Which is better than asking for a manager.', 'Что лучше, чем просить менеджера.'],
        ['Ben', 'Since it names the power, not the title.', 'Ведь так называют полномочие, а не должность.'],
        ['Anna', 'And is harder to answer with a no.', 'И на это труднее ответить «нет».'],
        ['Ben', 'Which is exactly the point.', 'В этом и весь смысл.'],
      ]],
      words: [
        ['whoever can approve this', 'тот, кто может это утвердить', 'Could I speak to whoever can approve this?'],
        ['asking for a manager', 'просить менеджера', 'Which is better than asking for a manager.'],
        ['names the power, not the title', 'называет полномочие, а не должность', 'Since it names the power, not the title.'],
        ['harder to answer with a no', 'труднее ответить «нет»', 'And is harder to answer with a no.'],
        ['exactly the point', 'в этом весь смысл', 'Which is exactly the point.'],
      ],
      rule: ['Whoever после предлога', 'Speak to whoever can approve this. Форма whoever сохраняется, потому что она подлежащее придаточного.'],
      quiz: [
        ['«Могу я поговорить с тем, кто может это утвердить?» —', ['Could I speak to whoever can approve this?', 'Could I speak to whomever can approve this?', 'Could I speak whoever can approve this?'], 0],
        ['«Ведь так называют полномочие, а не должность» —', ['Since it names the power, not the title', 'Since it name the power, not the title', 'Since it names the power, no the title'], 0],
        ['«И на это труднее ответить «нет»» —', ['And is harder to answer with a no', 'And is harder to answer with no a', 'And is more hard to answer with a no'], 0],
      ],
      order: ['Что лучше, чем просить менеджера.', 'Which is better than asking for a manager.'],
      produce: [
        ['Могу я поговорить с тем, кто может это утвердить?', 'Could I speak to whoever can approve this?', []],
        ['Ведь так называют полномочие, а не должность.', 'Since it names the power, not the title.', []],
        ['И на это труднее ответить «нет».', 'And is harder to answer with a no.', []],
      ],
    },
    {
      title: 'Getting it in writing',
      summary: 'Получить письменно.',
      topics: [DE, SE, LI],
      dialogue: ['Письменно', [
        ['Anna', 'Could you send me that by email?', 'Не могли бы вы прислать это письмом?'],
        ['Ben', 'Which turns a promise into evidence.', 'Что превращает обещание в доказательство.'],
        ['Anna', 'And is refused surprisingly often.', 'И в этом на удивление часто отказывают.'],
        ['Ben', 'Which tells you what the promise was worth.', 'Что и говорит, чего стоило обещание.'],
        ['Anna', 'Before you have spent another hour.', 'Ещё до того, как вы потратите ещё час.'],
      ]],
      words: [
        ['send me that by email', 'прислать письмом', 'Could you send me that by email?'],
        ['turns a promise into evidence', 'превращает обещание в доказательство', 'Which turns a promise into evidence.'],
        ['is refused surprisingly often', 'отказывают на удивление часто', 'And is refused surprisingly often.'],
        ['what the promise was worth', 'чего стоило обещание', 'Which tells you what the promise was worth.'],
        ['another hour', 'ещё час', 'Before you have spent another hour.'],
      ],
      rule: ['Turn something into', 'It turns a promise into evidence. Предлог into показывает превращение одного в другое.'],
      quiz: [
        ['«Что превращает обещание в доказательство» —', ['Which turns a promise into evidence', 'Which turns a promise in evidence', 'Which turn a promise into evidence'], 0],
        ['«И в этом на удивление часто отказывают» —', ['And is refused surprisingly often', 'And is refuse surprisingly often', 'And is refused surprising often'], 0],
        ['«Что и говорит, чего стоило обещание» —', ['Which tells you what the promise was worth', 'Which tells you that the promise was worth', 'Which tell you what the promise was worth'], 0],
      ],
      order: ['Ещё до того, как вы потратите ещё час.', 'Before you have spent another hour.'],
      produce: [
        ['Не могли бы вы прислать это письмом?', 'Could you send me that by email?', []],
        ['Что превращает обещание в доказательство.', 'Which turns a promise into evidence.', []],
        ['И в этом на удивление часто отказывают.', 'And is refused surprisingly often.', []],
      ],
    },
    {
      title: 'When the line goes dead',
      summary: 'Когда линия обрывается.',
      topics: [SE, PS, LI],
      dialogue: ['Обрыв', [
        ['Ben', 'We were cut off at minute fifty two.', 'Нас разъединило на пятьдесят второй минуте.'],
        ['Anna', 'Which nobody calls back after.', 'После чего никто не перезванивает.'],
        ['Ben', 'Though they have the number, obviously.', 'Хотя номер у них, разумеется, есть.'],
        ['Anna', 'So I ask for a callback at the start.', 'Поэтому я прошу обратный звонок в начале.'],
        ['Ben', 'Which costs one sentence and saves an hour.', 'Что стоит одного предложения и экономит час.'],
      ]],
      words: [
        ['were cut off', 'нас разъединило', 'We were cut off at minute fifty two.'],
        ['nobody calls back', 'никто не перезванивает', 'Which nobody calls back after.'],
        ['they have the number', 'номер у них есть', 'Though they have the number, obviously.'],
        ['ask for a callback', 'прошу обратный звонок', 'So I ask for a callback at the start.'],
        ['saves an hour', 'экономит час', 'Which costs one sentence and saves an hour.'],
      ],
      rule: ['Be cut off — разъединение', 'We were cut off. Пассив фразового глагола сохраняет наречие off после причастия.'],
      quiz: [
        ['«Нас разъединило на пятьдесят второй минуте» —', ['We were cut off at minute fifty two', 'We were cut of at minute fifty two', 'We was cut off at minute fifty two'], 0],
        ['«Поэтому я прошу обратный звонок в начале» —', ['So I ask for a callback at the start', 'So I ask a callback at the start', 'So I ask for a callback in the start'], 0],
        ['«Что стоит одного предложения и экономит час» —', ['Which costs one sentence and saves an hour', 'Which cost one sentence and saves an hour', 'Which costs one sentence and save an hour'], 0],
      ],
      order: ['Хотя номер у них, разумеется, есть.', 'Though they have the number, obviously.'],
      produce: [
        ['Нас разъединило на пятьдесят второй минуте.', 'We were cut off at minute fifty two.', []],
        ['После чего никто не перезванивает.', 'Which nobody calls back after.', []],
        ['Поэтому я прошу обратный звонок в начале.', 'So I ask for a callback at the start.', []],
      ],
    },
    {
      title: 'The compensation offered',
      summary: 'Предложенная компенсация.',
      topics: [RI, SE, LI],
      dialogue: ['Компенсация', [
        ['Anna', 'They offered twenty as a goodwill gesture.', 'Они предложили двадцать в знак доброй воли.'],
        ['Ben', 'Which is the phrase meaning no liability.', 'Формула, означающая «без признания вины».'],
        ['Anna', 'And is worth taking, if you note it.', 'И это стоит взять, если зафиксировать.'],
        ['Ben', 'Since the next call starts from twenty.', 'Ведь следующий звонок начнётся с двадцати.'],
        ['Anna', 'Rather than from zero, as before.', 'А не с нуля, как раньше.'],
      ]],
      words: [
        ['as a goodwill gesture', 'в знак доброй воли', 'They offered twenty as a goodwill gesture.'],
        ['meaning no liability', 'означающая «без вины»', 'Which is the phrase meaning no liability.'],
        ['worth taking', 'стоит взять', 'And is worth taking, if you note it.'],
        ['starts from twenty', 'начнётся с двадцати', 'Since the next call starts from twenty.'],
        ['Rather than from zero', 'а не с нуля', 'Rather than from zero, as before.'],
      ],
      rule: ['Причастие вместо which means', 'The phrase meaning no liability. Форма на -ing сокращает определение.'],
      quiz: [
        ['«Формула, означающая «без признания вины»» —', ['The phrase meaning no liability', 'The phrase mean no liability', 'The phrase meant no liability'], 0],
        ['«И это стоит взять, если зафиксировать» —', ['And is worth taking, if you note it', 'And is worth to take, if you note it', 'And is worth taking, if you will note it'], 0],
        ['«Ведь следующий звонок начнётся с двадцати» —', ['Since the next call starts from twenty', 'Since the next call start from twenty', 'Since the next call starts of twenty'], 0],
      ],
      order: ['А не с нуля, как раньше.', 'Rather than from zero, as before.'],
      produce: [
        ['Они предложили двадцать в знак доброй воли.', 'They offered twenty as a goodwill gesture.', []],
        ['Формула, означающая «без признания вины».', 'Which is the phrase meaning no liability.', []],
        ['Ведь следующий звонок начнётся с двадцати.', 'Since the next call starts from twenty.', []],
      ],
    },
    {
      title: 'Keeping your own record',
      summary: 'Вести свою запись.',
      topics: [SE, DE, LI],
      dialogue: ['Запись', [
        ['Ben', 'Date, name, reference, one line of promise.', 'Дата, имя, номер, строка обещания.'],
        ['Anna', 'Which takes twenty seconds after each call.', 'Что занимает двадцать секунд после каждого звонка.'],
        ['Ben', 'And wins the argument, four calls later.', 'И выигрывает спор четырьмя звонками позже.'],
        ['Anna', 'When nobody else remembers anything.', 'Когда никто больше ничего не помнит.'],
        ['Ben', 'Which is the entire method, again.', 'И снова в этом весь метод.'],
      ]],
      words: [
        ['Date, name, reference', 'дата, имя, номер', 'Date, name, reference, one line of promise.'],
        ['one line of promise', 'строка обещания', 'One line of promise is enough.'],
        ['twenty seconds after each call', 'двадцать секунд после звонка', 'Which takes twenty seconds after each call.'],
        ['four calls later', 'четырьмя звонками позже', 'And wins the argument, four calls later.'],
        ['nobody else remembers', 'никто больше не помнит', 'When nobody else remembers anything.'],
      ],
      rule: ['Разговор с системой выигрывает бумага', 'Номер обращения, имя и обещание письмом решают спор быстрее любого тона.'],
      quiz: [
        ['«Что занимает двадцать секунд после каждого звонка» —', ['Which takes twenty seconds after each call', 'Which take twenty seconds after each call', 'Which takes twenty second after each call'], 0],
        ['«Когда никто больше ничего не помнит» —', ['When nobody else remembers anything', 'When nobody else remember anything', 'When nobody else remembers nothing'], 0],
        ['«И выигрывает спор четырьмя звонками позже» —', ['And wins the argument, four calls later', 'And win the argument, four calls later', 'And wins the argument, four calls after later'], 0],
      ],
      order: ['Дата, имя, номер, строка обещания.', 'Date, name, reference, one line of promise.'],
      produce: [
        ['Дата, имя, номер, строка обещания.', 'Date, name, reference, one line of promise.', []],
        ['Что занимает двадцать секунд после каждого звонка.', 'Which takes twenty seconds after each call.', []],
        ['Когда никто больше ничего не помнит.', 'When nobody else remembers anything.', []],
      ],
    },
    {
      checkpoint: true,
      title: 'Проверка: телефон и система',
      summary: 'Шесть фраз без подсказок.',
      topics: [SE, RI, PS, DE],
      produce: [
        ['Меня держали на линии сорок минут.', 'I was kept on hold for forty minutes.', []],
        ['Поэтому крик на него ничего не меняет.', 'So shouting at him changes nothing.', []],
        ['Я хотела бы подать официальную жалобу.', 'I would like to raise a formal complaint.', []],
        ['Могу я поговорить с тем, кто может это утвердить?', 'Could I speak to whoever can approve this?', []],
        ['Что превращает обещание в доказательство.', 'Which turns a promise into evidence.', []],
        ['Формула, означающая «без признания вины».', 'Which is the phrase meaning no liability.', []],
      ],
    },
  ],
}
