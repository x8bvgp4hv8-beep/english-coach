"""Re-tag Spanish A1 exercises by the grammar they actually practise.

    python3 tools/retag-es.py            # показать раскладку, ничего не писать
    python3 tools/retag-es.py --write    # переписать es-a1.json и es-syllabus.json

Прогонять после любой правки содержания A1: без тем упражнение не пройдёт тесты,
а тема, поставленная на глаз, врёт на экране «Темы» и в «что проседает».

The batch authoring scripts stamped one grammar topic per unit, so "Работа" was 257
exercises of "Глагол ser" and "Отель" was 229 of "ir a и tener". That made three
features lie: «что проседает», the topic drills and the whole topics screen.

Each exercise now gets, from its own Spanish text: the structure it practises (at most
one), the form it practises (at most one), and the theme of the unit it lives in.
Vocabulary with no grammar in it keeps the theme alone, which is the honest answer.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
COURSE = ROOT / 'native/Sources/EnglishCoachCore/Resources/Languages/es/es-a1.json'
SYLLABUS = ROOT / 'native/Sources/EnglishCoachCore/Resources/Languages/es/es-syllabus.json'

# ---------------------------------------------------------------- lexical themes

THEMES = [
    ('es-a1-tema-saludos', 'Приветствия и вежливость', 'Hola, gracias, por favor, adiós — и как назвать себя.'),
    ('es-a1-tema-comida', 'Еда и напитки', 'Кафе, ресторан, заказ, продукты.'),
    ('es-a1-tema-descripcion', 'Описание и место', 'Какой предмет и где он находится.'),
    ('es-a1-tema-rutina', 'Время и распорядок', 'Часы, дни недели, даты и что ты делаешь каждый день.'),
    ('es-a1-tema-ocio', 'Вкусы и свободное время', 'Что нравится, чем занимаешься, какие планы.'),
    ('es-a1-tema-compras', 'Покупки и деньги', 'Цены, размеры, оплата, банк.'),
    ('es-a1-tema-familia', 'Люди и семья', 'Родные, возраст, кто есть кто.'),
    ('es-a1-tema-casa', 'Дом и быт', 'Комнаты, вещи, домашние дела.'),
    ('es-a1-tema-ciudad', 'Город и транспорт', 'Дорога, метро, такси, как куда добраться.'),
    ('es-a1-tema-tiempo', 'Погода и времена года', 'Жарко, холодно, дождь, время года.'),
    ('es-a1-tema-salud', 'Здоровье и самочувствие', 'Что болит, как себя чувствуешь, аптека и врач.'),
    ('es-a1-tema-citas', 'Встречи и приглашения', 'Договориться, пригласить, прийти в гости.'),
    ('es-a1-tema-viaje', 'Путешествия и жильё', 'Отель, бронь, страны и города.'),
    ('es-a1-tema-trabajo', 'Работа и учёба', 'Чем занимаешься, где учишься, что умеешь.'),
    ('es-a1-tema-contacto', 'Связь и интернет', 'Телефон, сообщения, почта, вай-фай.'),
    ('es-a1-tema-problemas', 'Когда что-то пошло не так', 'Опоздание, поломка, потеря, просьба о помощи.'),
]

# Unit title -> theme id. Written out in full so a new unit fails loudly instead of
# quietly inheriting someone else's theme.
UNIT_THEME = {
    'Первые слова': 'es-a1-tema-saludos',
    'Знакомство': 'es-a1-tema-saludos',
    'В кафе': 'es-a1-tema-comida',
    'Каждый день': 'es-a1-tema-rutina',
    'Какой и где': 'es-a1-tema-descripcion',
    'Вкусы и планы': 'es-a1-tema-ocio',
    'Числа и цены': 'es-a1-tema-compras',
    'Семья': 'es-a1-tema-familia',
    'Время и день': 'es-a1-tema-rutina',
    'Дом': 'es-a1-tema-casa',
    'Город и дорога': 'es-a1-tema-ciudad',
    'Магазин и одежда': 'es-a1-tema-compras',
    'Еда и ресторан': 'es-a1-tema-comida',
    'Погода и время года': 'es-a1-tema-tiempo',
    'Здоровье': 'es-a1-tema-salud',
    'Встречи и приглашения': 'es-a1-tema-citas',
    'Отель': 'es-a1-tema-viaje',
    'Транспорт и поездка': 'es-a1-tema-ciudad',
    'Работа': 'es-a1-tema-trabajo',
    'Телефон и сообщения': 'es-a1-tema-contacto',
    'Даты и праздники': 'es-a1-tema-rutina',
    'Свободное время': 'es-a1-tema-ocio',
    'Языки и учёба': 'es-a1-tema-trabajo',
    'Деньги и банк': 'es-a1-tema-compras',
    'Домашние дела': 'es-a1-tema-casa',
    'В гостях': 'es-a1-tema-citas',
    'Страны и города': 'es-a1-tema-viaje',
    'Метро и такси': 'es-a1-tema-ciudad',
    'Телефон и интернет': 'es-a1-tema-contacto',
    'Когда что-то пошло не так': 'es-a1-tema-problemas',
}

# ---------------------------------------------------------------- grammar detectors

AR_VERBS = """hablar trabajar estudiar comprar escuchar tomar necesitar llamar cocinar viajar pagar
cenar desayunar descansar mirar buscar esperar preguntar ayudar llegar entrar quedar usar cambiar
reservar alquilar limpiar lavar planchar arreglar preparar terminar empezar bailar cantar nadar
caminar andar visitar invitar dejar llevar pasar tardar apagar encender firmar enviar mandar
contestar reparar recordar olvidar tocar sacar echar acabar quitar ganar gastar ahorrar""".split()

ER_IR_VERBS = """comer beber leer aprender comprender vender correr responder creer deber
vivir escribir abrir subir salir venir decir hacer poner ver saber conocer pedir servir
dormir volver poder querer entender perder repetir seguir sentir preferir recibir descubrir""".split()

# Regular endings, plus the irregular forms that A1 actually uses.
IRREGULAR = {
    'hacer': 'hago haces hace hacemos hacen',
    'salir': 'salgo sales sale salimos salen',
    'venir': 'vengo vienes viene venimos vienen',
    'decir': 'digo dices dice decimos dicen',
    'poner': 'pongo pones pone ponemos ponen',
    'ver': 'veo ves ve vemos ven',
    'saber': 'sé sabes sabe sabemos saben',
    'conocer': 'conozco conoces conoce conocemos conocen',
    'pedir': 'pido pides pide pedimos piden',
    'servir': 'sirvo sirves sirve servimos sirven',
    'dormir': 'duermo duermes duerme dormimos duermen',
    'volver': 'vuelvo vuelves vuelve volvemos vuelven',
    'poder': 'puedo puedes puede podemos pueden',
    'querer': 'quiero quieres quiere queremos quieren',
    'entender': 'entiendo entiendes entiende entendemos entienden',
    'perder': 'pierdo pierdes pierde perdemos pierden',
    'repetir': 'repito repites repite repetimos repiten',
    'seguir': 'sigo sigues sigue seguimos siguen',
    'sentir': 'siento sientes siente sentimos sienten',
    'preferir': 'prefiero prefieres prefiere preferimos prefieren',
    'empezar': 'empiezo empiezas empieza empezamos empiezan',
    'cerrar': 'cierro cierras cierra cerramos cierran',
    'pensar': 'pienso piensas piensa pensamos piensan',
    'jugar': 'juego juegas juega jugamos juegan',
    'contar': 'cuento cuentas cuenta contamos cuentan',
    'encontrar': 'encuentro encuentras encuentra encontramos encuentran',
    'recordar': 'recuerdo recuerdas recuerda recordamos recuerdan',
    'costar': 'cuesta cuestan',
}


def forms(verbs, endings):
    out = set()
    for verb in verbs:
        stem = verb[:-2]
        for ending in endings:
            out.add(stem + ending)
        for form in IRREGULAR.get(verb, '').split():
            out.add(form)
    return out


AR_FORMS = forms(AR_VERBS, ['o', 'as', 'a', 'amos', 'áis', 'an'])
ER_IR_FORMS = forms(ER_IR_VERBS, ['o', 'es', 'e', 'emos', 'en', 'imos', 'ís'])
for extra in ('cierro cierras cierra cerramos cierran empiezo empiezas empieza empezamos empiezan '
              'juego juegas juega jugamos juegan cuento cuentas cuenta contamos cuentan '
              'cuesta cuestan pienso piensas piensa pensamos piensan encuentro encuentras encuentra '
              'recuerdo recuerdas recuerda').split():
    AR_FORMS.add(extra)
# "cuenta" and "queda" are nouns as often as verbs here; the article test below decides.
AMBIGUOUS = {'cuenta', 'cuentas', 'paso', 'pasa', 'llevo', 'trabajo', 'busco', 'cena', 'vale', 'como', 'sale'}

SER = {'soy', 'eres', 'es', 'somos', 'sois', 'son'}
ESTAR = {'estoy', 'estás', 'está', 'estamos', 'estáis', 'están'}
TENER = {'tengo', 'tienes', 'tiene', 'tenemos', 'tenéis', 'tienen'}
IR = {'voy', 'vas', 'va', 'vamos', 'vais', 'van'}
GUSTAR = {'gusta', 'gustan', 'gustaría', 'gustaban', 'encanta', 'encantan', 'interesa', 'interesan',
          'apetece', 'apetecen', 'duele', 'duelen'}
PRONOUNS = {'me', 'te', 'le', 'nos', 'os', 'les'}

# "uno"/"una" are left out on purpose: as written they are the article far more often
# than the number, and every "una persona" would otherwise count as counting practice.
NUMBERS = set("""cero dos tres cuatro cinco seis siete ocho nueve diez once doce trece catorce
quince dieciséis diecisiete dieciocho diecinueve veinte veintiuno veintidós treinta cuarenta cincuenta
sesenta setenta ochenta noventa cien ciento mil primero primera segundo segunda tercero""".split())

ADJECTIVES = set("""pequeño pequeña pequeños pequeñas bonito bonita bonitos bonitas nuevo nueva nuevos nuevas
viejo vieja caro cara caros caras barato barata baratos baratas largo larga corto corta limpio limpia
sucio sucia alto alta bajo baja tranquilo tranquila ruidoso ruidosa cómodo cómoda incómodo incómoda
rápido rápida lento lenta frío fría caliente listo lista cansado cansada cansados cansadas contento contenta
ocupado ocupada libre abierto abierta cerrado cerrada guapo guapa simpático simpática blanco blanca
negro negra rojo roja amarillo amarilla bueno buena buenos buenas malo mala rica rico seco seca
antiguo antigua moderno moderna oscuro oscura claro clara lleno llena vacío vacía""".split())

WORD = re.compile(r"[a-záéíóúüñ]+")
QUESTION_WORDS = {'qué', 'cómo', 'dónde', 'cuándo', 'quién', 'quiénes', 'cuánto', 'cuánta',
                  'cuántos', 'cuántas', 'cuál', 'cuáles', 'adónde'}


def spanish_of(exercise):
    kind = exercise['type']
    if kind == 'flashcard':
        return ' '.join([exercise.get('prompt', ''), exercise.get('example', '')])
    if kind in ('translate', 'word_order'):
        return exercise.get('canonicalAnswer', '')
    if kind == 'multiple_choice':
        prompt, answer = exercise.get('prompt', ''), exercise.get('correctOption', '')
        # Gap-fills carry the sentence in the prompt; a Russian prompt carries nothing.
        if re.search(r'[а-яё]', prompt.lower()):
            return answer
        return prompt.replace('___', answer)
    if kind == 'dialogue':
        return ' '.join(line['text'] for line in exercise.get('lines', []))
    return ''


def choice_between(exercise):
    """A gap-fill whose options are the two verbs IS the ser/estar question.

    The filled sentence only ever shows the right answer, so reading the text alone
    files "Mi hermano ___ médico." under ser and loses the contrast the exercise is
    actually drilling. The options say what is being asked.
    """
    if exercise['type'] != 'multiple_choice':
        return None
    options = {o.lower() for o in exercise.get('options', [])}
    if options & SER and options & ESTAR:
        return 'es-a1-ser-estar'
    return None


def structure_of(text, words):
    """The construction the sentence is built on — at most one, most marked first."""
    if any(w in GUSTAR for w in words) and any(w in PRONOUNS for w in words):
        return 'es-a1-gustar'
    if any(w in TENER for w in words):
        return 'es-a1-ir-tener'
    if re.search(r'\b(voy|vas|va|vamos|van)\s+a\s+[a-záéíóúñ]', text):
        return 'es-a1-ir-tener'
    has_ser, has_estar = bool(words & SER), bool(words & ESTAR)
    if has_ser and has_estar:
        return 'es-a1-ser-estar'
    if has_estar:
        return 'es-a1-estar'
    if has_ser:
        return 'es-a1-ser'
    real = words - AMBIGUOUS
    if real & ER_IR_FORMS:
        return 'es-a1-presente-er-ir'
    if real & AR_FORMS:
        return 'es-a1-presente-ar'
    return None


def form_of(text, words):
    """The form the sentence turns on — at most one."""
    if '¿' in text and (words & QUESTION_WORDS or '?' in text):
        return 'es-a1-preguntas'
    if 'hay' in words or words & NUMBERS or re.search(r'\d', text) or 'euros' in words or 'euro' in words:
        return 'es-a1-numeros'
    if words & {'los', 'las', 'unos', 'unas'}:
        return 'es-a1-plural'
    if words & ADJECTIVES and words & {'el', 'la', 'un', 'una'}:
        return 'es-a1-genero'
    # Only the indefinite article counts. "el"/"la" show up in almost every sentence, so
    # tagging on them would turn "Артикли" into a bucket for everything else.
    if words & {'un', 'una'}:
        return 'es-a1-articulos'
    return None


def main():
    course = json.loads(COURSE.read_text())
    syllabus = json.loads(SYLLABUS.read_text())

    known = {t['id'] for t in syllabus['topics']}
    for topic_id, title, summary in THEMES:
        if topic_id not in known:
            syllabus['topics'].append({
                'id': topic_id, 'level': 'A1', 'title': title, 'summary': summary, 'minExercises': 8,
            })

    stats = {}
    for chapter in course['chapters']:
        theme = UNIT_THEME[chapter['title']]
        for lesson in chapter['lessons']:
            for exercise in lesson['exercises']:
                text = spanish_of(exercise)
                words = set(WORD.findall(text.lower()))
                topics = []
                structure = choice_between(exercise) or structure_of(text.lower(), words)
                if structure:
                    topics.append(structure)
                form = form_of(text, words)
                if form:
                    topics.append(form)
                topics.append(theme)
                exercise['topics'] = topics
                for topic in topics:
                    stats[topic] = stats.get(topic, 0) + 1

    if '--write' in sys.argv:
        COURSE.write_text(json.dumps(course, ensure_ascii=False, indent=2) + '\n')
        SYLLABUS.write_text(json.dumps(syllabus, ensure_ascii=False, indent=2) + '\n')
        print('written')

    titles = {t['id']: t['title'] for t in syllabus['topics']}
    for topic_id, count in sorted(stats.items(), key=lambda kv: -kv[1]):
        print(f'{count:6}  {titles.get(topic_id, topic_id)}')
    missing = [t['id'] for t in syllabus['topics'] if t['level'] == 'A1' and t['id'] not in stats]
    print('A1 topics with no exercises:', missing or 'none')


main()
