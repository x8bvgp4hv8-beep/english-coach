"""
Proof that the sheets work under the app, not next to it.

A background is only right if the screen on top of it still reads. This builds a
mock of each tab — the real cards, the real type sizes — over its sheet, at phone
size, in both languages, and shoots it.

    python3 preview.py
"""

import sys
from pathlib import Path

HERE = Path(__file__).parent

CSS = """
* { margin:0; padding:0; box-sizing:border-box; -webkit-font-smoothing:antialiased; }
body {
  font-family: ui-rounded, 'SF Pro Rounded', -apple-system, 'Segoe UI', system-ui, sans-serif;
  color:#1d2229; background-color:%(canvas)s;
  background-image:url('%(sheet)s');
  background-repeat:no-repeat; background-position:top center; background-size:100%% auto;
}
.wrap { padding:14px 16px 90px; }
.top { display:flex; gap:8px; align-items:center; }
.chip { background:rgba(255,255,255,.72); border-radius:999px; padding:6px 12px; font-size:12px; font-weight:700; color:#5f666f; }
h1 { font-size:27px; font-weight:800; letter-spacing:-.02em; margin:14px 0 4px; }
.sub { font-size:14px; color:#79808a; margin-bottom:16px; }
.card { background:#fff; border-radius:20px; padding:16px; box-shadow:0 8px 24px rgba(29,34,41,.07); margin-bottom:12px; }
.card.row { display:flex; align-items:center; gap:13px; }
.ico { width:44px; height:44px; border-radius:13px; flex:none; display:grid; place-items:center; color:#fff; font-size:17px; }
.kick { font-size:9px; font-weight:800; letter-spacing:1.1px; color:#e0982f; }
.ttl { font-size:16px; font-weight:700; margin:3px 0 2px; }
.cap { font-size:11px; color:#79808a; }
.bar { height:6px; border-radius:3px; background:#e6e9ee; margin-top:12px; overflow:hidden; }
.bar i { display:block; height:100%%; background:#dd9a33; }
.sec { font-size:12px; font-weight:800; letter-spacing:.6px; margin:24px 0 3px; }
.sec + .cap { margin-bottom:10px; }
.list { background:#fff; border-radius:20px; box-shadow:0 8px 24px rgba(29,34,41,.07); overflow:hidden; }
.item { display:flex; align-items:center; gap:12px; padding:11px 14px; border-bottom:1px solid #eef0f3; }
.item:last-child { border-bottom:none; }
.item .ico { width:36px; height:36px; border-radius:11px; font-size:15px; }
.item .ttl { font-size:15px; margin:0; }
.item .cap { font-size:11px; }
.chev { margin-left:auto; color:#c3c9d1; font-size:13px; }
.lvl { background:rgba(255,255,255,.66); border-radius:18px; padding:14px 16px; margin-top:20px; }
.lvl .ttl { font-size:15px; }
.lvl .bar i { background:#6cab7e; }
.grid { display:grid; grid-template-columns:1fr 1fr; gap:10px 18px; margin-top:6px; }
.m { font-size:11px; color:#79808a; display:flex; justify-content:space-between; }
.m b { color:#3b424b; }
.days { display:flex; justify-content:space-between; align-items:flex-end; height:120px; margin-top:14px; }
.days div { width:26px; background:#3b424b; border-radius:6px; }
.tabs { position:fixed; left:0; right:0; bottom:0; height:76px; background:#fff; border-top:1px solid #e8ebef;
  display:grid; grid-template-columns:repeat(4,1fr); align-items:center; justify-items:center; padding-bottom:8px; }
.tabs div { font-size:11px; color:#8b929c; display:grid; justify-items:center; gap:4px; }
.tabs .on { color:#3b424b; font-weight:700; }
.tabs i { font-size:18px; font-style:normal; }
"""

TABS = {
    "today": """
      <div class="top"><span class="chip">🔥 12 дней</span><span class="chip">6 / 10 мин</span></div>
      <h1>Сегодня</h1><div class="sub">Четыре минуты до дневной цели — это один урок.</div>
      <div class="card"><div class="row" style="display:flex;align-items:center;gap:13px">
        <div class="ico" style="background:#dd9a33">▶</div>
        <div><div class="kick">СЛЕДУЮЩИЙ УРОК · 7 МИН</div><div class="ttl">%(lesson)s</div>
        <div class="cap">Блок 4 · Планы и время</div></div></div>
        <div class="bar"><i style="width:56%%"></i></div></div>
      <div class="card row"><div class="ico" style="background:#3f6b78">↻</div>
        <div><div class="ttl">Повторить пройденное</div><div class="cap">Пять минут, начиная с самых давних</div></div>
        <div class="chev">›</div></div>
      <div class="lvl"><div class="ttl">%(course)s</div>
        <div class="bar"><i style="width:60%%"></i></div>
        <div class="cap" style="margin-top:8px">пройдено 18 из 30 блоков</div></div>
    """,
    "practice": """
      <h1 style="margin-top:6px">Тренировка</h1>
      <div class="sub">Одно и то же, разными руками — так оно и остаётся в голове.</div>
      <div class="list">
        <div class="item"><div class="ico" style="background:#e0a33c">✎</div><div><div class="ttl">Перевод текстом</div><div class="cap">Напиши фразу целиком, без подсказок</div></div><div class="chev">›</div></div>
        <div class="item"><div class="ico" style="background:#5a6b96">◈</div><div><div class="ttl">Выбор варианта</div><div class="cap">Четыре похожих, верный один</div></div><div class="chev">›</div></div>
        <div class="item"><div class="ico" style="background:#6cab7e">≡</div><div><div class="ttl">Порядок слов</div><div class="cap">Слова даны, порядок — нет</div></div><div class="chev">›</div></div>
        <div class="item"><div class="ico" style="background:#3f6b78">💬</div><div><div class="ttl">Диалог</div><div class="cap">Сначала целиком, потом по репликам</div></div><div class="chev">›</div></div>
        <div class="item"><div class="ico" style="background:#d4674f">▮</div><div><div class="ttl">Аудирование</div><div class="cap">Слушай и записывай, текста на экране нет</div></div><div class="chev">›</div></div>
        <div class="item"><div class="ico" style="background:#3b424b">▤</div><div><div class="ttl">Карточки</div><div class="cap">Фраза и перевод, проверяешь себя сам</div></div><div class="chev">›</div></div>
      </div>
      <div class="sec">СЛАБЫЕ ТЕМЫ</div><div class="cap">Начни отсюда — здесь ошибок больше всего</div>
      <div class="card"><div class="ttl">%(topic)s</div><div class="cap">Что уже случилось, но всё ещё важно сейчас</div></div>
    """,
    "progress": """
      <h1 style="margin-top:6px">Как идут дела</h1>
      <div class="grid">
        <div><div class="m"><span>Эта неделя</span><b>5 / 7 дней</b></div><div class="bar"><i style="width:71%%;background:#6cab7e"></i></div></div>
        <div><div class="m"><span>Слов в активе</span><b>412</b></div><div class="bar"><i style="width:34%%;background:#3b424b"></i></div></div>
      </div>
      <div class="lvl"><div class="ttl">%(course)s</div><div class="bar"><i style="width:60%%"></i></div>
        <div class="cap" style="margin-top:8px">пройдено 18 из 30 блоков</div></div>
      <div class="sec">МИНУТЫ ПО ДНЯМ</div><div class="cap">Цель — 10 минут в день</div>
      <div class="days"><div style="height:70%%"></div><div style="height:40%%;background:#e6e9ee"></div><div style="height:100%%"></div>
        <div style="height:62%%"></div><div style="height:22%%;background:#e6e9ee"></div><div style="height:8%%;background:#e6e9ee"></div>
        <div style="height:8%%;background:#e6e9ee"></div></div>
    """,
}

LANG = {
    "en": {"canvas": "#eef1f6", "course": "Английский A2", "lesson": "Договориться о встрече", "topic": "Present Perfect"},
    "es": {"canvas": "#faf2e8", "course": "Испанский A1", "lesson": "Заказать в баре", "topic": "Ser и estar"},
}

NAV = ("Сегодня", "Курс", "Тренировка", "Прогресс")
ACTIVE = {"today": 0, "practice": 2, "progress": 3}


def page(tab, lang):
    v = dict(LANG[lang], sheet=f"{tab}-{lang}.svg")
    css = CSS % v
    body = TABS[tab] % v
    tabs = "".join(
        f'<div class="{"on" if i == ACTIVE[tab] else ""}"><i>{ic}</i>{name}</div>'
        for i, (ic, name) in enumerate(zip(("⌂", "⤳", "⊪", "⊫"), NAV))
    )
    return (
        f'<!doctype html><html lang="ru"><head><meta charset="utf-8"><style>{css}</style></head>'
        f'<body><div class="wrap">{body}</div><div class="tabs">{tabs}</div></body></html>'
    )


if __name__ == "__main__":
    from playwright.sync_api import sync_playwright

    with sync_playwright() as pw:
        b = pw.chromium.launch(channel="chrome")
        for tab in TABS:
            for lang in LANG:
                path = HERE / f"mock-{tab}-{lang}.html"
                path.write_text(page(tab, lang), encoding="utf-8")
                pg = b.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=2)
                pg.goto(path.as_uri())
                pg.wait_for_timeout(350)
                shot = HERE / f"mock-{tab}-{lang}.png"
                pg.screenshot(path=str(shot))
                pg.close()
                print(shot.name)
        b.close()
