// B2, блок 50 — Things we buy. Вещи, которые мы покупаем.
//
// Тематический блок: реклама, тёмные паттерны, подписки, возврат и вопрос
// «нужна ли мне эта вещь». Пассив, условия, критика формулировок.

const RI = 'b2-tema-riesgo'
const ME = 'b2-tema-medios'
const DA = 'b2-tema-datos'
const CP = 'b1-tema-compras'
const LI = 'b2-linkers'

export default {
  slug: 'things-we-buy',
  title: 'Вещи, которые мы покупаем',
  subtitle: 'Реклама, подписки, возврат и сомнение',
  canDo: [
    'разбирать рекламное обещание',
    'замечать уловки интерфейса',
    'отменять подписку и спорить',
    'возвращать товар по правилам',
    'обсуждать, нужна ли вещь вообще',
  ],
  lessons: [
    {
      title: 'Up to seventy per cent off',
      summary: 'Скидки до семидесяти процентов.',
      topics: [ME, CP, LI],
      dialogue: ['Витрина', [
        ['Anna', 'Up to seventy per cent off, it says.', 'Написано: скидки до семидесяти процентов.'],
        ['Ben', 'Which means one shelf at the back.', 'Что означает одну полку в глубине.'],
        ['Anna', 'And ten per cent on everything else.', 'И десять процентов на всё остальное.'],
        ['Ben', 'Which is legal, and tells you nothing.', 'Это законно и ничего не сообщает.'],
        ['Anna', 'Beyond the fact that they know we read fast.', 'Кроме того, что они знают: мы читаем быстро.'],
      ]],
      words: [
        ['Up to seventy per cent off', 'скидки до семидесяти процентов', 'Up to seventy per cent off, it says.'],
        ['one shelf at the back', 'одна полка в глубине', 'Which means one shelf at the back.'],
        ['on everything else', 'на всё остальное', 'And ten per cent on everything else.'],
        ['legal, and tells you nothing', 'законно и ничего не сообщает', 'Which is legal, and tells you nothing.'],
        ['they know we read fast', 'они знают, что мы читаем быстро', 'The fact that they know we read fast.'],
      ],
      rule: ['Up to — верхняя граница обещания', 'Up to seventy per cent off. Оборот обещает максимум, не средний случай.'],
      quiz: [
        ['«Что означает одну полку в глубине» —', ['Which means one shelf at the back', 'Which mean one shelf at the back', 'Which means one shelf in the back of'], 0],
        ['«Это законно и ничего не сообщает» —', ['Which is legal, and tells you nothing', 'Which is legal, and tell you nothing', 'Which is legal, and tells you anything'], 0],
        ['«Кроме того, что они знают: мы читаем быстро» —', ['The fact that they know we read fast', 'The fact what they know we read fast', 'The fact that they know we read fastly'], 0],
      ],
      order: ['И десять процентов на всё остальное.', 'And ten per cent on everything else.'],
      produce: [
        ['Написано: скидки до семидесяти процентов.', 'Up to seventy per cent off, it says.', []],
        ['Что означает одну полку в глубине.', 'Which means one shelf at the back.', []],
        ['Это законно и ничего не сообщает.', 'Which is legal, and tells you nothing.', []],
      ],
    },
    {
      title: 'The button that is hard to find',
      summary: 'Кнопка, которую трудно найти.',
      topics: [DA, ME, LI],
      dialogue: ['Интерфейс', [
        ['Ben', 'Cancelling takes eleven clicks.', 'Отмена занимает одиннадцать кликов.'],
        ['Anna', 'Which is a design decision, not an accident.', 'Это решение дизайна, а не случайность.'],
        ['Ben', 'Made by somebody with a target.', 'Принятое кем-то с планом по показателям.'],
        ['Anna', 'And measured, to the click.', 'И измеренное, с точностью до клика.'],
        ['Ben', 'Which is worth remembering while you sigh.', 'Это стоит помнить, пока вы вздыхаете.'],
      ]],
      words: [
        ['Cancelling takes eleven clicks', 'отмена занимает одиннадцать кликов', 'Cancelling takes eleven clicks.'],
        ['a design decision', 'решение дизайна', 'Which is a design decision, not an accident.'],
        ['Made by somebody with a target', 'принятое кем-то с планом', 'Made by somebody with a target.'],
        ['measured, to the click', 'измеренное с точностью до клика', 'And measured, to the click.'],
        ['while you sigh', 'пока вы вздыхаете', 'Which is worth remembering while you sigh.'],
      ],
      rule: ['Причастие вместо which is', 'Made by somebody with a target. Форма на -ed сокращает придаточное определение.'],
      quiz: [
        ['«Принятое кем-то с планом по показателям» —', ['Made by somebody with a target', 'Making by somebody with a target', 'Made from somebody with a target'], 0],
        ['«Отмена занимает одиннадцать кликов» —', ['Cancelling takes eleven clicks', 'Cancel takes eleven clicks', 'Cancelling take eleven clicks'], 0],
        ['«Это стоит помнить, пока вы вздыхаете» —', ['Which is worth remembering while you sigh', 'Which is worth to remember while you sigh', 'Which is worth remembering while you sighs'], 0],
      ],
      order: ['И измеренное, с точностью до клика.', 'And measured, to the click.'],
      produce: [
        ['Отмена занимает одиннадцать кликов.', 'Cancelling takes eleven clicks.', []],
        ['Это решение дизайна, а не случайность.', 'Which is a design decision, not an accident.', []],
        ['И измеренное, с точностью до клика.', 'And measured, to the click.', []],
      ],
    },
    {
      title: 'Subscriptions you forgot',
      summary: 'Забытые подписки.',
      topics: [RI, DA, LI],
      dialogue: ['Подписки', [
        ['Anna', 'Four of them, none of them used.', 'Четыре штуки, ни одной не пользуюсь.'],
        ['Ben', 'Which is thirty a month, quietly.', 'Это тридцать в месяц, тихо.'],
        ['Anna', 'And is how the whole model works.', 'И на этом вся модель и держится.'],
        ['Ben', 'Since the price is set to be forgettable.', 'Ведь цену подбирают так, чтобы забылась.'],
        ['Anna', 'Which is a strange thing to design for.', 'Странная цель для проектирования.'],
      ]],
      words: [
        ['none of them used', 'ни одной не пользуюсь', 'Four of them, none of them used.'],
        ['thirty a month, quietly', 'тридцать в месяц, тихо', 'Which is thirty a month, quietly.'],
        ['how the whole model works', 'на чём держится модель', 'And is how the whole model works.'],
        ['set to be forgettable', 'подобрана, чтобы забылась', 'Since the price is set to be forgettable.'],
        ['a strange thing to design for', 'странная цель проектирования', 'Which is a strange thing to design for.'],
      ],
      rule: ['Is set to — задано намеренно', 'The price is set to be forgettable. Форма показывает умысел без указания автора.'],
      quiz: [
        ['«Ведь цену подбирают так, чтобы забылась» —', ['Since the price is set to be forgettable', 'Since the price is set being forgettable', 'Since the price is sat to be forgettable'], 0],
        ['«Четыре штуки, ни одной не пользуюсь» —', ['Four of them, none of them used', 'Four of them, none of them use', 'Four of them, no of them used'], 0],
        ['«Странная цель для проектирования» —', ['A strange thing to design for', 'A strange thing to design', 'A strange thing for design for'], 0],
      ],
      order: ['И на этом вся модель и держится.', 'And is how the whole model works.'],
      produce: [
        ['Четыре штуки, ни одной не пользуюсь.', 'Four of them, none of them used.', []],
        ['Это тридцать в месяц, тихо.', 'Which is thirty a month, quietly.', []],
        ['Ведь цену подбирают так, чтобы забылась.', 'Since the price is set to be forgettable.', []],
      ],
    },
    {
      title: 'Sending it back',
      summary: 'Вернуть товар.',
      topics: [CP, RI, LI],
      dialogue: ['Возврат', [
        ['Ben', 'You have fourteen days, by law.', 'По закону у вас четырнадцать дней.'],
        ['Anna', 'Which the shop policy cannot shorten.', 'Что политика магазина сократить не может.'],
        ['Ben', 'However the sign at the till is worded.', 'Как бы ни была сформулирована табличка у кассы.'],
        ['Anna', 'Which is worth saying, calmly, once.', 'И это стоит сказать, спокойно, один раз.'],
        ['Ben', 'After which it is usually accepted.', 'После чего обычно принимают.'],
      ]],
      words: [
        ['fourteen days, by law', 'четырнадцать дней по закону', 'You have fourteen days, by law.'],
        ['cannot shorten', 'не может сократить', 'Which the shop policy cannot shorten.'],
        ['However the sign is worded', 'как бы ни была сформулирована табличка', 'However the sign at the till is worded.'],
        ['calmly, once', 'спокойно, один раз', 'Which is worth saying, calmly, once.'],
        ['it is usually accepted', 'обычно принимают', 'After which it is usually accepted.'],
      ],
      rule: ['However + прилагательное или наречие', 'However the sign is worded. Слово вводит уступку и требует прямого порядка слов.'],
      quiz: [
        ['«Как бы ни была сформулирована табличка у кассы» —', ['However the sign at the till is worded', 'However is the sign at the till worded', 'However the sign at the till is word'], 0],
        ['«Что политика магазина сократить не может» —', ['Which the shop policy cannot shorten', 'Which the shop policy cannot shortens', 'Which the shop policy can not to shorten'], 0],
        ['«После чего обычно принимают» —', ['After which it is usually accepted', 'After which it is usually accept', 'After what it is usually accepted'], 0],
      ],
      order: ['По закону у вас четырнадцать дней.', 'You have fourteen days, by law.'],
      produce: [
        ['По закону у вас четырнадцать дней.', 'You have fourteen days, by law.', []],
        ['Как бы ни была сформулирована табличка у кассы.', 'However the sign at the till is worded.', []],
        ['И это стоит сказать, спокойно, один раз.', 'Which is worth saying, calmly, once.', []],
      ],
    },
    {
      title: 'The reviews',
      summary: 'Отзывы.',
      topics: [ME, DA, LI],
      dialogue: ['Отзывы', [
        ['Anna', 'Read the three star ones only.', 'Читайте только те, что на три звезды.'],
        ['Ben', 'Which are written by people with nothing to prove.', 'Их пишут люди, которым нечего доказывать.'],
        ['Anna', 'And usually name one flaw and one strength.', 'И обычно называют один минус и один плюс.'],
        ['Ben', 'Which is all a review can honestly do.', 'Это всё, что отзыв честно может.'],
        ['Anna', 'And is enough to decide with.', 'И этого хватает для решения.'],
      ]],
      words: [
        ['the three star ones', 'те, что на три звезды', 'Read the three star ones only.'],
        ['nothing to prove', 'нечего доказывать', 'Written by people with nothing to prove.'],
        ['one flaw and one strength', 'один минус и один плюс', 'And usually name one flaw and one strength.'],
        ['all a review can do', 'всё, что может отзыв', 'Which is all a review can honestly do.'],
        ['enough to decide with', 'хватает для решения', 'And is enough to decide with.'],
      ],
      rule: ['All + придаточное без that', 'All a review can honestly do. Слово that опускается, когда придаточное определяет all.'],
      quiz: [
        ['«Это всё, что отзыв честно может» —', ['Which is all a review can honestly do', 'Which is all a review can honestly does', 'Which is all what a review can honestly do'], 0],
        ['«Их пишут люди, которым нечего доказывать» —', ['Written by people with nothing to prove', 'Written by people with nothing to proving', 'Writing by people with nothing to prove'], 0],
        ['«И этого хватает для решения» —', ['And is enough to decide with', 'And is enough to decide', 'And is enough for decide with'], 0],
      ],
      order: ['Читайте только те, что на три звезды.', 'Read the three star ones only.'],
      produce: [
        ['Читайте только те, что на три звезды.', 'Read the three star ones only.', []],
        ['И обычно называют один минус и один плюс.', 'And usually name one flaw and one strength.', []],
        ['Это всё, что отзыв честно может.', 'Which is all a review can honestly do.', []],
      ],
    },
    {
      title: 'Buying the expensive one',
      summary: 'Купить дорогое.',
      topics: [RI, CP, LI],
      dialogue: ['Цена', [
        ['Ben', 'The boots cost three times as much.', 'Ботинки стоили втрое дороже.'],
        ['Anna', 'And have lasted eight years, so far.', 'И носятся восемь лет, пока что.'],
        ['Ben', 'Which is cheaper, per winter.', 'Что дешевле, в пересчёте на зиму.'],
        ['Anna', 'Provided you do not lose them.', 'При условии, что вы их не потеряете.'],
        ['Ben', 'Which is the flaw in every such argument.', 'В этом слабость любого такого довода.'],
      ]],
      words: [
        ['three times as much', 'втрое дороже', 'The boots cost three times as much.'],
        ['have lasted eight years', 'носятся восемь лет', 'And have lasted eight years, so far.'],
        ['cheaper, per winter', 'дешевле в пересчёте на зиму', 'Which is cheaper, per winter.'],
        ['do not lose them', 'не потеряете их', 'Provided you do not lose them.'],
        ['the flaw in every such argument', 'слабость любого такого довода', 'Which is the flaw in every such argument.'],
      ],
      rule: ['Three times as much', 'They cost three times as much. Кратность строится через as much as, а не через more.'],
      quiz: [
        ['«Ботинки стоили втрое дороже» —', ['The boots cost three times as much', 'The boots cost three times as more', 'The boots costed three times as much'], 0],
        ['«И носятся восемь лет, пока что» —', ['And have lasted eight years, so far', 'And have last eight years, so far', 'And has lasted eight years, so far'], 0],
        ['«При условии, что вы их не потеряете» —', ['Provided you do not lose them', 'Provided you will not lose them', 'Provided you do not lost them'], 0],
      ],
      order: ['Что дешевле, в пересчёте на зиму.', 'Which is cheaper, per winter.'],
      produce: [
        ['Ботинки стоили втрое дороже.', 'The boots cost three times as much.', []],
        ['И носятся восемь лет, пока что.', 'And have lasted eight years, so far.', []],
        ['В этом слабость любого такого довода.', 'Which is the flaw in every such argument.', []],
      ],
    },
    {
      title: 'The thing you did not need',
      summary: 'Вещь, которая не понадобилась.',
      topics: [CP, RI, LI],
      dialogue: ['Ошибка', [
        ['Anna', 'I used it twice, in two years.', 'Я пользовалась ею дважды за два года.'],
        ['Ben', 'Which the shop counted as a success.', 'Что магазин записал в успехи.'],
        ['Anna', 'And I counted as an expensive lesson.', 'А я записала в дорогие уроки.'],
        ['Ben', 'Which is worth naming, rather than hiding.', 'Это стоит назвать, а не прятать.'],
        ['Anna', 'Since the hidden ones repeat.', 'Ведь спрятанные повторяются.'],
      ]],
      words: [
        ['used it twice', 'пользовалась дважды', 'I used it twice, in two years.'],
        ['counted as a success', 'записал в успехи', 'Which the shop counted as a success.'],
        ['an expensive lesson', 'дорогой урок', 'And I counted as an expensive lesson.'],
        ['worth naming', 'стоит назвать', 'Which is worth naming, rather than hiding.'],
        ['the hidden ones repeat', 'спрятанные повторяются', 'Since the hidden ones repeat.'],
      ],
      rule: ['Count as — засчитывать чем-то', 'The shop counted it as a success. Предлог as вводит то, чем сочли предмет.'],
      quiz: [
        ['«Что магазин записал в успехи» —', ['Which the shop counted as a success', 'Which the shop counted like a success of', 'Which the shop count as a success'], 0],
        ['«Это стоит назвать, а не прятать» —', ['Which is worth naming, rather than hiding', 'Which is worth to name, rather than hiding', 'Which is worth naming, rather than hide'], 0],
        ['«Ведь спрятанные повторяются» —', ['Since the hidden ones repeat', 'Since the hidden ones repeats', 'Since the hide ones repeat'], 0],
      ],
      order: ['Я пользовалась ею дважды за два года.', 'I used it twice, in two years.'],
      produce: [
        ['Я пользовалась ею дважды за два года.', 'I used it twice, in two years.', []],
        ['А я записала в дорогие уроки.', 'And I counted as an expensive lesson.', []],
        ['Ведь спрятанные повторяются.', 'Since the hidden ones repeat.', []],
      ],
    },
    {
      title: 'A week before deciding',
      summary: 'Неделя до решения.',
      topics: [RI, CP, LI],
      dialogue: ['Правило', [
        ['Ben', 'Anything over a hundred waits a week.', 'Всё дороже сотни ждёт неделю.'],
        ['Anna', 'Which kills about half of them.', 'Что убивает примерно половину покупок.'],
        ['Ben', 'And costs nothing but the sale price.', 'И стоит только цены распродажи.'],
        ['Anna', 'Which is what the countdown clock is for.', 'Для этого таймер обратного отсчёта и нужен.'],
        ['Ben', 'And why it is on every page.', 'И поэтому он на каждой странице.'],
      ]],
      words: [
        ['Anything over a hundred', 'всё дороже сотни', 'Anything over a hundred waits a week.'],
        ['kills about half of them', 'убивает половину', 'Which kills about half of them.'],
        ['nothing but the sale price', 'только цена распродажи', 'And costs nothing but the sale price.'],
        ['the countdown clock', 'таймер обратного отсчёта', 'Which is what the countdown clock is for.'],
        ['on every page', 'на каждой странице', 'And why it is on every page.'],
      ],
      rule: ['Покупку решает не цена, а срок', 'Отложенное решение и три звезды в отзывах отсекают больше ошибок, чем любое сравнение характеристик.'],
      quiz: [
        ['«Что убивает примерно половину покупок» —', ['Which kills about half of them', 'Which kill about half of them', 'Which kills about a half them'], 0],
        ['«И стоит только цены распродажи» —', ['And costs nothing but the sale price', 'And costs nothing but the sale prices', 'And cost nothing but the sale price'], 0],
        ['«Всё дороже сотни ждёт неделю» —', ['Anything over a hundred waits a week', 'Anything over a hundred wait a week', 'Anything over hundred waits a week'], 0],
      ],
      order: ['И поэтому он на каждой странице.', 'And why it is on every page.'],
      produce: [
        ['Всё дороже сотни ждёт неделю.', 'Anything over a hundred waits a week.', []],
        ['Что убивает примерно половину покупок.', 'Which kills about half of them.', []],
        ['Для этого таймер обратного отсчёта и нужен.', 'Which is what the countdown clock is for.', []],
      ],
    },
    {
      checkpoint: true,
      title: 'Проверка: вещи, которые мы покупаем',
      summary: 'Шесть фраз без подсказок.',
      topics: [RI, ME, DA, CP],
      produce: [
        ['Что означает одну полку в глубине.', 'Which means one shelf at the back.', []],
        ['Принятое кем-то с планом по показателям.', 'Made by somebody with a target.', []],
        ['Ведь цену подбирают так, чтобы забылась.', 'Since the price is set to be forgettable.', []],
        ['Как бы ни была сформулирована табличка у кассы.', 'However the sign at the till is worded.', []],
        ['Это всё, что отзыв честно может.', 'Which is all a review can honestly do.', []],
        ['Ботинки стоили втрое дороже.', 'The boots cost three times as much.', []],
      ],
    },
  ],
}
