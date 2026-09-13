/**
 * Что в испанском выдаёт глагол — и почему это знание лежит отдельно.
 *
 * Правила отбора слов (`vocabulary.ts`) и правила аудирования (`listening.ts`) спрашивают
 * об испанском одно и то же: есть ли здесь личная форма глагола. Если каждый спросит
 * по-своему, в проекте появятся два определения правды, и они разъедутся на первой же
 * правке — так уже было со списком фраз для озвучки, и это пришлось разбирать отдельно.
 *
 * Списки собраны из замеров самого контента, а не придуманы: 150 самых частых слов
 * коротких карточек A1 и A2 и 170 самых частых слов десяти тысяч фраз-предложений.
 */

/**
 * Личные формы испанских глаголов — те, что встречаются в контенте чаще всего.
 *
 * Хвост `(?![\wáéíóúñü])` вместо `\b` обязателен. `\w` в JavaScript — это латиница без
 * диакритики, поэтому после «á» границы слова нет, и правило `\bestá\b` не совпадало
 * с «El bar está lleno» никогда: испанские предложения с «está», «será», «sé» молча
 * проходили в словарь как единицы. Поймано живой проверкой на карточках курса.
 *
 * Омонимы в списке отсутствуют намеренно: `trabajo` — это и «работа», и «я работаю»;
 * `cambio` — «сдача» и «я меняю»; `cuenta` — «счёт»; `falta` — «нехватка»; `como` — «как»;
 * `vaya` — восклицание «ну и…»; `para` — прежде всего предлог «для». Считать их
 * глаголами значит выбрасывать настоящие существительные.
 */
export const SPANISH_VERB_FORMS =
  /\b(es|son|eres|soy|somos|sois|está|están|estoy|estás|estamos|estáis|era|eran|estaba|fue|fueron|fui|fuiste|fuimos|hice|hiciste|hizo|tuve|tuvo|estuve|estuvo|dije|dijo|pude|pudo|puse|puso|vine|vino|dio|vio|supe|quise|hubo|ha|han|he|hemos|habéis|has|hay|hab[íi]a|tiene|tienen|tengo|tienes|tenemos|tenéis|puede|pueden|puedo|puedes|podemos|podéis|va|van|voy|vas|vamos|vais|será|sería|quiero|quieres|quiere|queremos|quieren|sé|sabes|sabe|sabemos|saben|hago|haces|hace|hacen|hecho|digo|dices|dice|dicen|veo|ves|vemos|doy|das|da|damos|dan|siento|sientes|siente|llevo|llevas|lleva|llevamos|llevan|llamo|llamas|llama|llego|llegas|llega|llegan|necesito|necesitas|necesita|pongo|pones|pone|ponen|vuelvo|vuelves|vuelve|vuelven|espero|esperas|espera|esperamos|vengo|vienes|viene|venimos|vienen|salgo|sales|sale|salen|debo|debes|debe|quedo|quedas|queda|quedan|quedamos|apunto|gusta|gustan|duele|duelen|toca|tocan|pasa|pasan|cuesta|cuestan|funciona|significa|toma|ayuda|parece|suena|empieza|termina|depende|vive|viven|escribe|lee|juega|pregunta|gana|pierde|crece|cae|sube|dejo|dejas|pido|pides|sirve|sirven|prefiero|prefieres|arriesgo|salvas|envuelve|pruebo|miro|miras)(?![\wáéíóúñü])/i

/**
 * Окончания личных форм, по которым глагол виден без списка.
 *
 * Список форм не может быть полным — глаголов тысячи. Но эти окончания в испанском
 * принадлежат почти только глаголу: -amos, -emos, -imos (мы), -aste, -iste (ты в
 * прошедшем), -aron, -ieron (они в прошедшем). Поэтому «¿Pagamos a medias?» и
 * «Llamamos al técnico» ловятся правилом, а не перечнем.
 */
export const SPANISH_VERB_ENDINGS = /\b\w*(amos|emos|imos|aste|iste|aron|ieron)(?![\wáéíóúñü])/i

/**
 * Клитика в начале — верный признак предложения: «Me lo pruebo», «Te lo miro»,
 * «Se me hizo tarde».
 *
 * Артикли `la`, `lo`, `los`, `las` в список не входят: по первому слову их не отличить
 * от той же клитики, а «la próxima» и «lo mismo» — настоящие единицы.
 */
export const SPANISH_CLITIC_LEAD = /^(me|te|se|nos|os|le|les)\s/i

/**
 * Клитика перед словом: это слово — глагол, каким бы редким он ни был.
 *
 * Правило морфологическое, а не списочное, и потому ловит то, чего в списке нет:
 * «Ahora me duermo», «Te paso la receta», «Se cobra cada mes». Берутся только
 * однозначные клитики — `lo`, `la`, `los`, `las` отсюда исключены, потому что это ещё и
 * артикли, и «la casa» попало бы под правило как глагольная связка.
 */
export const SPANISH_CLITIC_VERB = /\b(me|te|se|nos|os|le|les)\s+\w{3,}(?![\wáéíóúñü])/i

/**
 * Прошедшее первого и третьего лица: «trabajé», «llegué», «comió», «salió».
 *
 * Четыре знака перед ударной гласной — не прихоть: так под правило не попадают «café»
 * (caf + é) и «bebé». «Canapé» и «carné» попадут, но это цена в два слова на язык.
 */
export const SPANISH_PAST_ENDINGS = /\b\w{4,}(é|ó)(?![\wáéíóúñü])/i

/**
 * Омонимы «существительное или глагол» — только для вопроса «есть ли здесь глагол».
 *
 * В отборе слов их считать глаголами нельзя: `trabajo` там значит «работа», и правило
 * выбрасывало бы настоящее существительное. А в аудировании ошибка стоит дёшево и в
 * другую сторону: «Trabajo ocho horas al día» — полное предложение, и лишний раз
 * признать его предложением лучше, чем выкинуть из набора.
 */
export const SPANISH_AMBIGUOUS_VERBS =
  /\b(trabajo|cambio|cuenta|falta|paso|pienso|bebo|bebe|cojo|coge|gasto|compro|hablo|habla|entiendo|entiende|cruza|recojo|escucho|aprovecho|enseño|mando|suele|suelen|diré|reía|costaba|cueste)(?![\wáéíóúñü])/i

/** Есть ли в тексте личная форма глагола — по списку, окончанию, клитике или омониму. */
export function hasSpanishVerb(text: string): boolean {
  return SPANISH_VERB_FORMS.test(text)
    || SPANISH_VERB_ENDINGS.test(text)
    || SPANISH_CLITIC_VERB.test(text)
    || SPANISH_PAST_ENDINGS.test(text)
    || SPANISH_AMBIGUOUS_VERBS.test(text)
}
