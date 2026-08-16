// B2, блок 47 — Ill in another country. Заболеть в чужой стране.
//
// Тематический блок: приёмный покой, страховка, объяснить симптомы, спорить
// со счётом. Пассив, косвенные вопросы, вежливое настаивание.

const SA = 'b2-tema-sanidad'
const VJ = 'b1-tema-viaje'
const SE = 'b1-tema-servicios'
const RI = 'b2-tema-riesgo'
const LI = 'b2-linkers'

export default {
  slug: 'ill-in-another-country',
  title: 'Заболеть в чужой стране',
  subtitle: 'Приёмный покой, страховка и счёт',
  canDo: [
    'описать симптомы точно',
    'разобраться в системе приёма',
    'настаивать вежливо и твёрдо',
    'работать со страховкой на месте',
    'оспаривать медицинский счёт',
  ],
  lessons: [
    {
      title: 'Which door to use',
      summary: 'В какую дверь идти.',
      topics: [SA, VJ, LI],
      dialogue: ['Вход', [
        ['Anna', 'I did not know which door to use.', 'Я не знала, в какую дверь идти.'],
        ['Ben', 'Which nobody explains to visitors.', 'Чего приезжим никто не объясняет.'],
        ['Anna', 'And which decides how long you wait.', 'И от чего зависит, сколько вы ждёте.'],
        ['Ben', 'Four hours, or forty minutes.', 'Четыре часа или сорок минут.'],
        ['Anna', 'Depending on a sign in a language I read slowly.', 'В зависимости от таблички на языке, который я читаю медленно.'],
      ]],
      words: [
        ['which door to use', 'в какую дверь идти', 'I did not know which door to use.'],
        ['nobody explains to visitors', 'приезжим никто не объясняет', 'Which nobody explains to visitors.'],
        ['decides how long you wait', 'решает, сколько вы ждёте', 'And which decides how long you wait.'],
        ['Four hours, or forty minutes', 'четыре часа или сорок минут', 'Four hours, or forty minutes.'],
        ['a language I read slowly', 'язык, который я читаю медленно', 'A sign in a language I read slowly.'],
      ],
      rule: ['Вопросительное слово с инфинитивом', 'Which door to use. Конструкция заменяет целое придаточное и звучит естественно.'],
      quiz: [
        ['«Я не знала, в какую дверь идти» —', ['I did not know which door to use', 'I did not know which door use', 'I did not knew which door to use'], 0],
        ['«И от чего зависит, сколько вы ждёте» —', ['And which decides how long you wait', 'And which decides how long do you wait', 'And which decide how long you wait'], 0],
        ['«Чего приезжим никто не объясняет» —', ['Which nobody explains to visitors', 'Which nobody explains visitors', 'Which nobody explain to visitors'], 0],
      ],
      order: ['Четыре часа или сорок минут.', 'Four hours, or forty minutes.'],
      produce: [
        ['Я не знала, в какую дверь идти.', 'I did not know which door to use.', []],
        ['Чего приезжим никто не объясняет.', 'Which nobody explains to visitors.', []],
        ['И от чего зависит, сколько вы ждёте.', 'And which decides how long you wait.', []],
      ],
    },
    {
      title: 'Describing the pain',
      summary: 'Описать боль.',
      topics: [SA, LI, VJ],
      dialogue: ['Симптомы', [
        ['Ben', 'Sharp, on the right, worse when I breathe in.', 'Резкая, справа, сильнее на вдохе.'],
        ['Anna', 'Which is three facts in one sentence.', 'Три факта в одном предложении.'],
        ['Ben', 'And is worth more than the word bad.', 'И это дороже слова «плохо».'],
        ['Anna', 'Since bad is where every triage stalls.', 'Ведь на «плохо» любая сортировка встаёт.'],
        ['Ben', 'Which I learned the slow way, once.', 'Я это однажды выучил медленным способом.'],
      ]],
      words: [
        ['Sharp, on the right', 'резкая, справа', 'Sharp, on the right, worse when I breathe in.'],
        ['worse when I breathe in', 'сильнее на вдохе', 'It is worse when I breathe in.'],
        ['three facts in one sentence', 'три факта в одном предложении', 'Which is three facts in one sentence.'],
        ['every triage stalls', 'любая сортировка встаёт', 'Since bad is where every triage stalls.'],
        ['the slow way', 'медленным способом', 'Which I learned the slow way, once.'],
      ],
      rule: ['Точные признаки вместо оценки', 'Sharp, on the right, worse when I breathe in. Характер, место и условие ускоряют приём сильнее любых прилагательных.'],
      quiz: [
        ['«Резкая, справа, сильнее на вдохе» —', ['Sharp, on the right, worse when I breathe in', 'Sharp, in the right, worse when I breathe in', 'Sharply, on the right, worse when I breathe in'], 0],
        ['«Ведь на «плохо» любая сортировка встаёт» —', ['Since bad is where every triage stalls', 'Since bad is where every triage stall', 'Since bad is what every triage stalls'], 0],
        ['«И это дороже слова «плохо»» —', ['And is worth more than the word bad', 'And is worth more that the word bad', 'And is worth more than word bad'], 0],
      ],
      order: ['Три факта в одном предложении.', 'Which is three facts in one sentence.'],
      produce: [
        ['Резкая, справа, сильнее на вдохе.', 'Sharp, on the right, worse when I breathe in.', []],
        ['И это дороже слова «плохо».', 'And is worth more than the word bad.', []],
        ['Ведь на «плохо» любая сортировка встаёт.', 'Since bad is where every triage stalls.', []],
      ],
    },
    {
      title: 'The insurance card',
      summary: 'Страховая карта.',
      topics: [RI, SE, LI],
      dialogue: ['Страховка', [
        ['Anna', 'They asked to be paid up front.', 'Они попросили оплатить вперёд.'],
        ['Ben', 'Which the policy covers, once claimed.', 'Что полис покрывает, если подать заявление.'],
        ['Anna', 'Provided the receipt names the treatment.', 'При условии, что в чеке указана процедура.'],
        ['Ben', 'And not just the word services.', 'А не просто слово «услуги».'],
        ['Anna', 'Which they will write, if asked at the desk.', 'Что они напишут, если попросить на стойке.'],
      ]],
      words: [
        ['asked to be paid up front', 'попросили оплатить вперёд', 'They asked to be paid up front.'],
        ['once claimed', 'если подать заявление', 'Which the policy covers, once claimed.'],
        ['names the treatment', 'указывает процедуру', 'Provided the receipt names the treatment.'],
        ['just the word services', 'просто слово «услуги»', 'And not just the word services.'],
        ['if asked at the desk', 'если попросить на стойке', 'Which they will write, if asked at the desk.'],
      ],
      rule: ['Once claimed — сокращённое придаточное', 'Which the policy covers, once claimed. Подлежащее и be опускаются, остаётся причастие.'],
      quiz: [
        ['«Что полис покрывает, если подать заявление» —', ['Which the policy covers, once claimed', 'Which the policy covers, once claiming', 'Which the policy cover, once claimed'], 0],
        ['«При условии, что в чеке указана процедура» —', ['Provided the receipt names the treatment', 'Provided the receipt name the treatment', 'Provided the receipt will name the treatment'], 0],
        ['«Что они напишут, если попросить на стойке» —', ['Which they will write, if asked at the desk', 'Which they will write, if ask at the desk', 'Which they will write, if asked on the desk'], 0],
      ],
      order: ['А не просто слово «услуги».', 'And not just the word services.'],
      produce: [
        ['Они попросили оплатить вперёд.', 'They asked to be paid up front.', []],
        ['Что полис покрывает, если подать заявление.', 'Which the policy covers, once claimed.', []],
        ['При условии, что в чеке указана процедура.', 'Provided the receipt names the treatment.', []],
      ],
    },
    {
      title: 'Being sent home too early',
      summary: 'Слишком ранняя выписка.',
      topics: [SA, LI, RI],
      dialogue: ['Выписка', [
        ['Ben', 'I was discharged after ninety minutes.', 'Меня выписали через полтора часа.'],
        ['Anna', 'Which felt fast, and may have been right.', 'Показалось быстро и, возможно, было верно.'],
        ['Ben', 'So I asked what to watch for.', 'Поэтому я спросил, на что смотреть.'],
        ['Anna', 'Which is the question that gets written down.', 'Именно этот вопрос и записывают.'],
        ['Ben', 'And which changes the answer, usually.', 'И который обычно меняет ответ.'],
      ]],
      words: [
        ['was discharged', 'выписали', 'I was discharged after ninety minutes.'],
        ['may have been right', 'возможно, было верно', 'Which felt fast, and may have been right.'],
        ['what to watch for', 'на что смотреть', 'So I asked what to watch for.'],
        ['gets written down', 'записывают', 'Which is the question that gets written down.'],
        ['changes the answer', 'меняет ответ', 'And which changes the answer, usually.'],
      ],
      rule: ['May have been — догадка о прошлом', 'It may have been right. Форма оценивает вероятность уже случившегося.'],
      quiz: [
        ['«Показалось быстро и, возможно, было верно» —', ['Which felt fast, and may have been right', 'Which felt fast, and may has been right', 'Which felt fast, and may have be right'], 0],
        ['«Поэтому я спросил, на что смотреть» —', ['So I asked what to watch for', 'So I asked what to watch', 'So I asked what for to watch'], 0],
        ['«Меня выписали через полтора часа» —', ['I was discharged after ninety minutes', 'I was discharge after ninety minutes', 'I were discharged after ninety minutes'], 0],
      ],
      order: ['И который обычно меняет ответ.', 'And which changes the answer, usually.'],
      produce: [
        ['Меня выписали через полтора часа.', 'I was discharged after ninety minutes.', []],
        ['Поэтому я спросил, на что смотреть.', 'So I asked what to watch for.', []],
        ['Именно этот вопрос и записывают.', 'Which is the question that gets written down.', []],
      ],
    },
    {
      title: 'Prescriptions abroad',
      summary: 'Рецепты за границей.',
      topics: [SE, SA, LI],
      dialogue: ['Аптека', [
        ['Anna', 'The same drug has a different name here.', 'То же лекарство здесь называется иначе.'],
        ['Ben', 'Which the pharmacist matches by the compound.', 'Что фармацевт сопоставляет по составу.'],
        ['Anna', 'If you show the box, or the leaflet.', 'Если показать коробку или вкладыш.'],
        ['Ben', 'Which is worth photographing before you travel.', 'Что стоит сфотографировать перед поездкой.'],
        ['Anna', 'And has saved me a whole day, twice.', 'И дважды сэкономило мне целый день.'],
      ]],
      words: [
        ['a different name here', 'здесь называется иначе', 'The same drug has a different name here.'],
        ['matches by the compound', 'сопоставляет по составу', 'Which the pharmacist matches by the compound.'],
        ['the box, or the leaflet', 'коробка или вкладыш', 'If you show the box, or the leaflet.'],
        ['worth photographing', 'стоит сфотографировать', 'Which is worth photographing before you travel.'],
        ['saved me a whole day', 'сэкономило целый день', 'And has saved me a whole day, twice.'],
      ],
      rule: ['Worth + герундий', 'Worth photographing before you travel. После worth всегда идёт форма на -ing.'],
      quiz: [
        ['«Что стоит сфотографировать перед поездкой» —', ['Which is worth photographing before you travel', 'Which is worth to photograph before you travel', 'Which is worth photograph before you travel'], 0],
        ['«Что фармацевт сопоставляет по составу» —', ['Which the pharmacist matches by the compound', 'Which the pharmacist match by the compound', 'Which the pharmacist matches for the compound'], 0],
        ['«И дважды сэкономило мне целый день» —', ['And has saved me a whole day, twice', 'And has save me a whole day, twice', 'And have saved me a whole day, twice'], 0],
      ],
      order: ['Если показать коробку или вкладыш.', 'If you show the box, or the leaflet.'],
      produce: [
        ['То же лекарство здесь называется иначе.', 'The same drug has a different name here.', []],
        ['Если показать коробку или вкладыш.', 'If you show the box, or the leaflet.', []],
        ['Что стоит сфотографировать перед поездкой.', 'Which is worth photographing before you travel.', []],
      ],
    },
    {
      title: 'The bill',
      summary: 'Счёт.',
      topics: [RI, SA, LI],
      dialogue: ['Счёт', [
        ['Ben', 'Two thousand for a scan and a night.', 'Две тысячи за снимок и одну ночь.'],
        ['Anna', 'Which is itemised, if you request it.', 'Что расписывается по пунктам, если запросить.'],
        ['Ben', 'And drops, once the double entries go.', 'И падает, когда уходят двойные записи.'],
        ['Anna', 'Which appear in about a third of bills.', 'Они встречаются примерно в трети счетов.'],
        ['Ben', 'And are never described as errors.', 'И их никогда не называют ошибками.'],
      ]],
      words: [
        ['for a scan and a night', 'за снимок и ночь', 'Two thousand for a scan and a night.'],
        ['is itemised', 'расписывается по пунктам', 'Which is itemised, if you request it.'],
        ['once the double entries go', 'когда уходят двойные записи', 'And drops, once the double entries go.'],
        ['in about a third of bills', 'примерно в трети счетов', 'Which appear in about a third of bills.'],
        ['never described as errors', 'никогда не называют ошибками', 'And are never described as errors.'],
      ],
      rule: ['Describe as — назвать чем-то', 'They are never described as errors. Предлог as обязателен после describe.'],
      quiz: [
        ['«И их никогда не называют ошибками» —', ['And are never described as errors', 'And are never described errors', 'And are never describe as errors'], 0],
        ['«Что расписывается по пунктам, если запросить» —', ['Which is itemised, if you request it', 'Which is itemise, if you request it', 'Which is itemised, if you will request it'], 0],
        ['«И падает, когда уходят двойные записи» —', ['And drops, once the double entries go', 'And drop, once the double entries go', 'And drops, once the double entries goes'], 0],
      ],
      order: ['Они встречаются примерно в трети счетов.', 'Which appear in about a third of bills.'],
      produce: [
        ['Две тысячи за снимок и одну ночь.', 'Two thousand for a scan and a night.', []],
        ['Что расписывается по пунктам, если запросить.', 'Which is itemised, if you request it.', []],
        ['И их никогда не называют ошибками.', 'And are never described as errors.', []],
      ],
    },
    {
      title: 'Translating for somebody else',
      summary: 'Переводить за другого.',
      topics: [SA, LI, VJ],
      dialogue: ['Перевод', [
        ['Anna', 'I translated for my mother, badly.', 'Я переводила для мамы, плохо.'],
        ['Ben', 'Which is how most people do it.', 'Так это и делает большинство.'],
        ['Anna', 'And which hospitals should not rely on.', 'И на что больницам не стоит полагаться.'],
        ['Ben', 'Since a wrong word changes a dose.', 'Ведь неверное слово меняет дозу.'],
        ['Anna', 'Which is why I now ask for an interpreter.', 'Поэтому я теперь прошу переводчика.'],
      ]],
      words: [
        ['translated for my mother', 'переводила для мамы', 'I translated for my mother, badly.'],
        ['how most people do it', 'как это делает большинство', 'Which is how most people do it.'],
        ['should not rely on', 'не стоит полагаться на', 'And which hospitals should not rely on.'],
        ['a wrong word changes a dose', 'неверное слово меняет дозу', 'Since a wrong word changes a dose.'],
        ['ask for an interpreter', 'прошу переводчика', 'Which is why I now ask for an interpreter.'],
      ],
      rule: ['Rely on — предлог в конце придаточного', 'Which hospitals should not rely on. Предлог остаётся в хвосте после модального глагола.'],
      quiz: [
        ['«И на что больницам не стоит полагаться» —', ['And which hospitals should not rely on', 'And which hospitals should not rely', 'And which hospitals should not to rely on'], 0],
        ['«Ведь неверное слово меняет дозу» —', ['Since a wrong word changes a dose', 'Since a wrong word change a dose', 'Since a wrong word changes the dose of it'], 0],
        ['«Поэтому я теперь прошу переводчика» —', ['Which is why I now ask for an interpreter', 'Which is why I now ask an interpreter', 'What is why I now ask for an interpreter'], 0],
      ],
      order: ['Так это и делает большинство.', 'Which is how most people do it.'],
      produce: [
        ['Я переводила для мамы, плохо.', 'I translated for my mother, badly.', []],
        ['И на что больницам не стоит полагаться.', 'And which hospitals should not rely on.', []],
        ['Ведь неверное слово меняет дозу.', 'Since a wrong word changes a dose.', []],
      ],
    },
    {
      title: 'What to carry, medically',
      summary: 'Что возить с собой.',
      topics: [VJ, SA, LI],
      dialogue: ['С собой', [
        ['Ben', 'A photo of every box, and one page.', 'Фото каждой упаковки и одна страница.'],
        ['Anna', 'Listing conditions, doses and allergies.', 'Со списком диагнозов, доз и аллергий.'],
        ['Ben', 'In English, and in the local language.', 'На английском и на местном языке.'],
        ['Anna', 'Which takes an evening to prepare.', 'На подготовку уходит один вечер.'],
        ['Ben', 'And answers the first eight questions.', 'И это отвечает на первые восемь вопросов.'],
      ]],
      words: [
        ['A photo of every box', 'фото каждой упаковки', 'A photo of every box, and one page.'],
        ['Listing conditions, doses', 'со списком диагнозов, доз', 'Listing conditions, doses and allergies.'],
        ['in the local language', 'на местном языке', 'In English, and in the local language.'],
        ['an evening to prepare', 'вечер на подготовку', 'Which takes an evening to prepare.'],
        ['the first eight questions', 'первые восемь вопросов', 'And answers the first eight questions.'],
      ],
      rule: ['Заболеть за границей — это про бумаги', 'Точные симптомы, чек с названием процедуры и одна страница анамнеза решают больше, чем язык.'],
      quiz: [
        ['«Со списком диагнозов, доз и аллергий» —', ['Listing conditions, doses and allergies', 'List conditions, doses and allergies', 'Listing conditions, doses and allergy'], 0],
        ['«На подготовку уходит один вечер» —', ['Which takes an evening to prepare', 'Which take an evening to prepare', 'Which takes an evening for prepare'], 0],
        ['«И это отвечает на первые восемь вопросов» —', ['And answers the first eight questions', 'And answer the first eight questions', 'And answers to the first eight questions'], 0],
      ],
      order: ['На английском и на местном языке.', 'In English, and in the local language.'],
      produce: [
        ['Фото каждой упаковки и одна страница.', 'A photo of every box, and one page.', []],
        ['Со списком диагнозов, доз и аллергий.', 'Listing conditions, doses and allergies.', []],
        ['И это отвечает на первые восемь вопросов.', 'And answers the first eight questions.', []],
      ],
    },
    {
      checkpoint: true,
      title: 'Проверка: заболеть в чужой стране',
      summary: 'Шесть фраз без подсказок.',
      topics: [SA, VJ, SE, RI],
      produce: [
        ['Я не знала, в какую дверь идти.', 'I did not know which door to use.', []],
        ['Резкая, справа, сильнее на вдохе.', 'Sharp, on the right, worse when I breathe in.', []],
        ['Что полис покрывает, если подать заявление.', 'Which the policy covers, once claimed.', []],
        ['Поэтому я спросил, на что смотреть.', 'So I asked what to watch for.', []],
        ['Что стоит сфотографировать перед поездкой.', 'Which is worth photographing before you travel.', []],
        ['И их никогда не называют ошибками.', 'And are never described as errors.', []],
      ],
    },
  ],
}
