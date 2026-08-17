// B2, блок 70 — Games and play. Игры.
//
// Тематический блок: настольные игры, видеоигры, азарт, соревнование и
// взрослые, которые разучились играть. Условия, оценки, лексика правил.

const CU = 'b2-tema-cultura'
const PS = 'b2-tema-psicologia'
const RE = 'b2-tema-relaciones'
const RI = 'b2-tema-riesgo'
const LI = 'b2-linkers'

export default {
  slug: 'games-and-play',
  title: 'Игры',
  subtitle: 'Настолки, видеоигры, азарт и правила',
  canDo: [
    'объяснять правила игры',
    'обсуждать проигрыш и азарт',
    'спорить о видеоиграх без крайностей',
    'говорить о ставках и риске',
    'объяснять, зачем взрослым играть',
  ],
  lessons: [
    {
      title: 'Explaining the rules',
      summary: 'Объяснить правила.',
      topics: [CU, LI, RE],
      dialogue: ['Правила', [
        ['Anna', 'You take one card and pass the rest on.', 'Берёшь одну карту, остальные передаёшь дальше.'],
        ['Ben', 'Which is three sentences, not eleven.', 'Это три предложения, а не одиннадцать.'],
        ['Anna', 'And is why anybody agrees to play.', 'И поэтому вообще соглашаются играть.'],
        ['Ben', 'Since the rest is learned in the first round.', 'Ведь остальное учится в первом же круге.'],
        ['Anna', 'Which every good explanation relies on.', 'На это и опирается любое хорошее объяснение.'],
      ]],
      words: [
        ['pass the rest on', 'остальное передаёшь дальше', 'You take one card and pass the rest on.'],
        ['three sentences, not eleven', 'три предложения, а не одиннадцать', 'Which is three sentences, not eleven.'],
        ['anybody agrees to play', 'вообще соглашаются играть', 'And is why anybody agrees to play.'],
        ['learned in the first round', 'учится в первом круге', 'Since the rest is learned in the first round.'],
        ['every good explanation relies on', 'на что опирается объяснение', 'Which every good explanation relies on.'],
      ],
      rule: ['Pass something on', 'Pass the rest on. Наречие on стоит после дополнения.'],
      quiz: [
        ['«Берёшь одну карту, остальные передаёшь дальше» —', ['You take one card and pass the rest on', 'You take one card and pass on the rest of', 'You takes one card and pass the rest on'], 0],
        ['«Ведь остальное учится в первом же круге» —', ['Since the rest is learned in the first round', 'Since the rest is learn in the first round', 'Since the rest are learned in the first round'], 0],
        ['«На это и опирается любое хорошее объяснение» —', ['Which every good explanation relies on', 'Which every good explanation relies', 'Which every good explanation rely on'], 0],
      ],
      order: ['Это три предложения, а не одиннадцать.', 'Which is three sentences, not eleven.'],
      produce: [
        ['Берёшь одну карту, остальные передаёшь дальше.', 'You take one card and pass the rest on.', []],
        ['И поэтому вообще соглашаются играть.', 'And is why anybody agrees to play.', []],
        ['На это и опирается любое хорошее объяснение.', 'Which every good explanation relies on.', []],
      ],
    },
    {
      title: 'The relative who cannot lose',
      summary: 'Родственник, который не умеет проигрывать.',
      topics: [RE, PS, LI],
      dialogue: ['Проигрыш', [
        ['Ben', 'He has left the table twice this year.', 'В этом году он дважды уходил из-за стола.'],
        ['Anna', 'Which everybody works around, silently.', 'Что все молча обходят.'],
        ['Ben', 'By choosing games that hide the score.', 'Выбирая игры, где счёт не виден.'],
        ['Anna', 'Which is a lot of trouble for one adult.', 'Многовато хлопот ради одного взрослого.'],
        ['Ben', 'And is easier than the conversation.', 'И проще, чем разговор.'],
      ]],
      words: [
        ['has left the table twice', 'дважды уходил из-за стола', 'He has left the table twice this year.'],
        ['works around, silently', 'молча обходят', 'Which everybody works around, silently.'],
        ['games that hide the score', 'игры, где счёт не виден', 'By choosing games that hide the score.'],
        ['a lot of trouble', 'многовато хлопот', 'Which is a lot of trouble for one adult.'],
        ['easier than the conversation', 'проще, чем разговор', 'And is easier than the conversation.'],
      ],
      rule: ['Work around something', 'Everybody works around it. Фразовый глагол значит «обходить проблему».'],
      quiz: [
        ['«Что все молча обходят» —', ['Which everybody works around, silently', 'Which everybody work around, silently', 'Which everybody works around, silent'], 0],
        ['«Выбирая игры, где счёт не виден» —', ['By choosing games that hide the score', 'By choose games that hide the score', 'By choosing games what hide the score'], 0],
        ['«В этом году он дважды уходил из-за стола» —', ['He has left the table twice this year', 'He has leave the table twice this year', 'He have left the table twice this year'], 0],
      ],
      order: ['И проще, чем разговор.', 'And is easier than the conversation.'],
      produce: [
        ['В этом году он дважды уходил из-за стола.', 'He has left the table twice this year.', []],
        ['Выбирая игры, где счёт не виден.', 'By choosing games that hide the score.', []],
        ['Многовато хлопот ради одного взрослого.', 'Which is a lot of trouble for one adult.', []],
      ],
    },
    {
      title: 'Video games, defended',
      summary: 'В защиту видеоигр.',
      topics: [CU, PS, LI],
      dialogue: ['Защита', [
        ['Anna', 'It is the only place he is genuinely competent.', 'Это единственное место, где он по-настоящему умел.'],
        ['Ben', 'Which is a serious sentence about a teenager.', 'Серьёзная фраза о подростке.'],
        ['Anna', 'And is worth hearing before banning anything.', 'И её стоит услышать до всяких запретов.'],
        ['Ben', 'Since the game is not the problem.', 'Ведь проблема не в игре.'],
        ['Anna', 'But the absence of anywhere else.', 'А в отсутствии любого другого места.'],
      ]],
      words: [
        ['genuinely competent', 'по-настоящему умел', 'The only place he is genuinely competent.'],
        ['a serious sentence', 'серьёзная фраза', 'Which is a serious sentence about a teenager.'],
        ['before banning anything', 'до всяких запретов', 'And is worth hearing before banning anything.'],
        ['the game is not the problem', 'проблема не в игре', 'Since the game is not the problem.'],
        ['the absence of anywhere else', 'отсутствие другого места', 'But the absence of anywhere else.'],
      ],
      rule: ['Before + герундий в совете', 'Before banning anything. После before идёт форма на -ing.'],
      quiz: [
        ['«И её стоит услышать до всяких запретов» —', ['And is worth hearing before banning anything', 'And is worth hearing before ban anything', 'And is worth to hear before banning anything'], 0],
        ['«Это единственное место, где он по-настоящему умел» —', ['The only place he is genuinely competent', 'The only place he is genuine competent', 'The only place what he is genuinely competent'], 0],
        ['«А в отсутствии любого другого места» —', ['But the absence of anywhere else', 'But the absence of anywhere other', 'But the absence from anywhere else'], 0],
      ],
      order: ['Ведь проблема не в игре.', 'Since the game is not the problem.'],
      produce: [
        ['Это единственное место, где он по-настоящему умел.', 'It is the only place he is genuinely competent.', []],
        ['И её стоит услышать до всяких запретов.', 'And is worth hearing before banning anything.', []],
        ['А в отсутствии любого другого места.', 'But the absence of anywhere else.', []],
      ],
    },
    {
      title: 'Designed to keep you',
      summary: 'Сделано, чтобы вы остались.',
      topics: [RI, PS, LI],
      dialogue: ['Механика', [
        ['Ben', 'The reward comes at an unpredictable interval.', 'Награда приходит через непредсказуемый промежуток.'],
        ['Anna', 'Which is the oldest trick in psychology.', 'Старейший приём в психологии.'],
        ['Ben', 'And works on rats, pigeons and adults.', 'И работает на крысах, голубях и взрослых.'],
        ['Anna', 'Which is not an insult, only a fact.', 'Это не оскорбление, а факт.'],
        ['Ben', 'And is worth knowing before you blame yourself.', 'И это стоит знать, прежде чем винить себя.'],
      ]],
      words: [
        ['at an unpredictable interval', 'через непредсказуемый промежуток', 'The reward comes at an unpredictable interval.'],
        ['the oldest trick', 'старейший приём', 'Which is the oldest trick in psychology.'],
        ['on rats, pigeons and adults', 'на крысах, голубях и взрослых', 'And works on rats, pigeons and adults.'],
        ['not an insult, only a fact', 'не оскорбление, а факт', 'Which is not an insult, only a fact.'],
        ['before you blame yourself', 'прежде чем винить себя', 'And is worth knowing before you blame yourself.'],
      ],
      rule: ['Blame yourself — возвратное', 'Before you blame yourself. Возвратное местоимение согласуется с подлежащим.'],
      quiz: [
        ['«И это стоит знать, прежде чем винить себя» —', ['And is worth knowing before you blame yourself', 'And is worth knowing before you blame you', 'And is worth knowing before you blame himself'], 0],
        ['«Награда приходит через непредсказуемый промежуток» —', ['The reward comes at an unpredictable interval', 'The reward come at an unpredictable interval', 'The reward comes on an unpredictable interval'], 0],
        ['«И работает на крысах, голубях и взрослых» —', ['And works on rats, pigeons and adults', 'And work on rats, pigeons and adults', 'And works in rats, pigeons and adults'], 0],
      ],
      order: ['Это не оскорбление, а факт.', 'Which is not an insult, only a fact.'],
      produce: [
        ['Награда приходит через непредсказуемый промежуток.', 'The reward comes at an unpredictable interval.', []],
        ['И работает на крысах, голубях и взрослых.', 'And works on rats, pigeons and adults.', []],
        ['И это стоит знать, прежде чем винить себя.', 'And is worth knowing before you blame yourself.', []],
      ],
    },
    {
      title: 'Betting on it',
      summary: 'Поставить на это.',
      topics: [RI, PS, LI],
      dialogue: ['Ставки', [
        ['Anna', 'He remembers every win and no losses.', 'Он помнит каждый выигрыш и ни одного проигрыша.'],
        ['Ben', 'Which is not lying, but how memory works.', 'Это не ложь, а то, как работает память.'],
        ['Anna', 'And is exactly what the odds are built on.', 'И именно на этом построены коэффициенты.'],
        ['Ben', 'Which a written record ruins in a week.', 'Что записанный учёт рушит за неделю.'],
        ['Anna', 'And which almost nobody keeps.', 'И который почти никто не ведёт.'],
      ]],
      words: [
        ['every win and no losses', 'каждый выигрыш и ни одного проигрыша', 'He remembers every win and no losses.'],
        ['not lying, but how memory works', 'не ложь, а как работает память', 'Which is not lying, but how memory works.'],
        ['what the odds are built on', 'на чём построены коэффициенты', 'And is exactly what the odds are built on.'],
        ['a written record', 'записанный учёт', 'Which a written record ruins in a week.'],
        ['almost nobody keeps', 'почти никто не ведёт', 'And which almost nobody keeps.'],
      ],
      rule: ['Built on — пассив с предлогом в конце', 'What the odds are built on. Предлог остаётся в хвосте придаточного.'],
      quiz: [
        ['«И именно на этом построены коэффициенты» —', ['And is exactly what the odds are built on', 'And is exactly what the odds are built', 'And is exactly that the odds are built on'], 0],
        ['«Он помнит каждый выигрыш и ни одного проигрыша» —', ['He remembers every win and no losses', 'He remembers every win and not losses', 'He remember every win and no losses'], 0],
        ['«Что записанный учёт рушит за неделю» —', ['Which a written record ruins in a week', 'Which a written record ruin in a week', 'Which a writing record ruins in a week'], 0],
      ],
      order: ['И который почти никто не ведёт.', 'And which almost nobody keeps.'],
      produce: [
        ['Он помнит каждый выигрыш и ни одного проигрыша.', 'He remembers every win and no losses.', []],
        ['И именно на этом построены коэффициенты.', 'And is exactly what the odds are built on.', []],
        ['Что записанный учёт рушит за неделю.', 'Which a written record ruins in a week.', []],
      ],
    },
    {
      title: 'Playing with children',
      summary: 'Играть с детьми.',
      topics: [RE, PS, LI],
      dialogue: ['С детьми', [
        ['Ben', 'I stopped letting him win at six.', 'В шесть я перестал ему поддаваться.'],
        ['Anna', 'Which he noticed before I told him.', 'Что он заметил раньше, чем я сказал.'],
        ['Ben', 'And which he says he preferred.', 'И что, по его словам, ему нравилось больше.'],
        ['Anna', 'Since winning against nothing is nothing.', 'Ведь победа над ничем — это ничто.'],
        ['Ben', 'Which children work out remarkably early.', 'До чего дети доходят на удивление рано.'],
      ]],
      words: [
        ['stopped letting him win', 'перестал поддаваться', 'I stopped letting him win at six.'],
        ['noticed before I told him', 'заметил раньше, чем я сказал', 'Which he noticed before I told him.'],
        ['he says he preferred', 'по его словам, нравилось больше', 'And which he says he preferred.'],
        ['winning against nothing', 'победа над ничем', 'Since winning against nothing is nothing.'],
        ['work out remarkably early', 'доходят на удивление рано', 'Which children work out remarkably early.'],
      ],
      rule: ['Let somebody do', 'I stopped letting him win. После let идёт голый инфинитив.'],
      quiz: [
        ['«В шесть я перестал ему поддаваться» —', ['I stopped letting him win at six', 'I stopped letting him to win at six', 'I stopped let him win at six'], 0],
        ['«До чего дети доходят на удивление рано» —', ['Which children work out remarkably early', 'Which children works out remarkably early', 'Which children work out remarkable early'], 0],
        ['«Ведь победа над ничем — это ничто» —', ['Since winning against nothing is nothing', 'Since win against nothing is nothing', 'Since winning against nothing are nothing'], 0],
      ],
      order: ['Что он заметил раньше, чем я сказал.', 'Which he noticed before I told him.'],
      produce: [
        ['В шесть я перестал ему поддаваться.', 'I stopped letting him win at six.', []],
        ['И что, по его словам, ему нравилось больше.', 'And which he says he preferred.', []],
        ['До чего дети доходят на удивление рано.', 'Which children work out remarkably early.', []],
      ],
    },
    {
      title: 'Adults who never play',
      summary: 'Взрослые, которые не играют.',
      topics: [PS, CU, LI],
      dialogue: ['Без игры', [
        ['Anna', 'He has not played anything since school.', 'Он ни во что не играл со школы.'],
        ['Ben', 'Which is more common than it should be.', 'Что бывает чаще, чем стоило бы.'],
        ['Anna', 'And is felt, in how badly he handles losing.', 'И это заметно по тому, как плохо он переносит проигрыш.'],
        ['Ben', 'At anything, including a conversation.', 'В чём угодно, включая разговор.'],
        ['Anna', 'Which is a large claim, and I stand by it.', 'Сильное заявление, и я на нём стою.'],
      ]],
      words: [
        ['has not played anything', 'ни во что не играл', 'He has not played anything since school.'],
        ['more common than it should be', 'чаще, чем стоило бы', 'Which is more common than it should be.'],
        ['how badly he handles losing', 'как плохо переносит проигрыш', 'In how badly he handles losing.'],
        ['including a conversation', 'включая разговор', 'At anything, including a conversation.'],
        ['I stand by it', 'я на нём стою', 'Which is a large claim, and I stand by it.'],
      ],
      rule: ['Handle + герундий', 'How badly he handles losing. После handle идёт форма на -ing.'],
      quiz: [
        ['«И это заметно по тому, как плохо он переносит проигрыш» —', ['In how badly he handles losing', 'In how badly he handles to lose', 'In how bad he handles losing'], 0],
        ['«Он ни во что не играл со школы» —', ['He has not played anything since school', 'He has not played nothing since school', 'He has not play anything since school'], 0],
        ['«Сильное заявление, и я на нём стою» —', ['A large claim, and I stand by it', 'A large claim, and I stand it', 'A large claim, and I stands by it'], 0],
      ],
      order: ['В чём угодно, включая разговор.', 'At anything, including a conversation.'],
      produce: [
        ['Он ни во что не играл со школы.', 'He has not played anything since school.', []],
        ['И это заметно по тому, как плохо он переносит проигрыш.', 'In how badly he handles losing.', []],
        ['Сильное заявление, и я на нём стою.', 'Which is a large claim, and I stand by it.', []],
      ],
    },
    {
      title: 'Why we play at all',
      summary: 'Зачем мы вообще играем.',
      topics: [CU, PS, LI],
      dialogue: ['Итог', [
        ['Ben', 'A game is a safe place to lose.', 'Игра — безопасное место, чтобы проиграть.'],
        ['Anna', 'Which adults have almost nowhere else.', 'Чего у взрослых почти нигде больше нет.'],
        ['Ben', 'And which is the whole training value.', 'И в этом вся её тренировочная ценность.'],
        ['Anna', 'Losing eleven times before Thursday.', 'Проиграть одиннадцать раз до четверга.'],
        ['Ben', 'And still being at the table on Friday.', 'И в пятницу всё ещё сидеть за столом.'],
      ]],
      words: [
        ['a safe place to lose', 'безопасное место, чтобы проиграть', 'A game is a safe place to lose.'],
        ['almost nowhere else', 'почти нигде больше', 'Which adults have almost nowhere else.'],
        ['the whole training value', 'вся тренировочная ценность', 'And which is the whole training value.'],
        ['Losing eleven times', 'проиграть одиннадцать раз', 'Losing eleven times before Thursday.'],
        ['still being at the table', 'всё ещё сидеть за столом', 'And still being at the table on Friday.'],
      ],
      rule: ['Игра — это тренировка проигрыша', 'Правила объясняют тремя фразами, остальное учится в первом круге, а ценность в том, что проиграть здесь безопасно.'],
      quiz: [
        ['«И в пятницу всё ещё сидеть за столом» —', ['And still being at the table on Friday', 'And still be at the table on Friday', 'And still being on the table on Friday'], 0],
        ['«Чего у взрослых почти нигде больше нет» —', ['Which adults have almost nowhere else', 'Which adults has almost nowhere else', 'Which adults have almost anywhere else'], 0],
        ['«Игра — безопасное место, чтобы проиграть» —', ['A game is a safe place to lose', 'A game is a safe place for lose', 'A game is a safe place to losing'], 0],
      ],
      order: ['Проиграть одиннадцать раз до четверга.', 'Losing eleven times before Thursday.'],
      produce: [
        ['Игра — безопасное место, чтобы проиграть.', 'A game is a safe place to lose.', []],
        ['Чего у взрослых почти нигде больше нет.', 'Which adults have almost nowhere else.', []],
        ['И в пятницу всё ещё сидеть за столом.', 'And still being at the table on Friday.', []],
      ],
    },
    {
      checkpoint: true,
      title: 'Проверка: игры',
      summary: 'Шесть фраз без подсказок.',
      topics: [CU, PS, RE, RI],
      produce: [
        ['Берёшь одну карту, остальные передаёшь дальше.', 'You take one card and pass the rest on.', []],
        ['Выбирая игры, где счёт не виден.', 'By choosing games that hide the score.', []],
        ['И её стоит услышать до всяких запретов.', 'And is worth hearing before banning anything.', []],
        ['И это стоит знать, прежде чем винить себя.', 'And is worth knowing before you blame yourself.', []],
        ['И именно на этом построены коэффициенты.', 'And is exactly what the odds are built on.', []],
        ['В шесть я перестал ему поддаваться.', 'I stopped letting him win at six.', []],
      ],
    },
  ],
}
