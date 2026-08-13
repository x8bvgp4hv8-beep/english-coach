"""
Two finished language scenes: the city wallpaper with the mascot standing on it,
wearing the hat for that language. English → London + bowler, Spanish → Madrid +
cordobés.

The mascot markup and its CSS are lifted straight out of design/mascot-hats/index.html
at build time, so the scenes never drift from the source the hats were fitted in.

Outputs, per language:
    <lang>.html   living scene (open it and the mascot breathes, blinks, sways)
    <lang>.png    still, 1179x2556
    <lang>.mp4    6 s loop of the same scene

    python3 build.py            # both languages
    python3 build.py es         # one
    python3 build.py en --state wave
"""

import re
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).parent
MASCOT = HERE.parent / "mascot-hats" / "index.html"
WALLS = HERE.parent / "wallpapers"

W, H = 1179, 2556
LANGS = {
    # hat id, wallpaper, and where the mascot's feet land on that wallpaper
    "en": {"hat": "uk", "wall": "london.png", "size": 0.60, "top": 0.487},
    "es": {"hat": "es", "wall": "madrid.png", "size": 0.60, "top": 0.487},
}

PAGE = """<!doctype html>
<html lang="ru"><head><meta charset="utf-8">
<title>Coachirinho — сцена {lang}</title>
<style>
  html,body{{margin:0;height:100%;background:#000;overflow:hidden}}
  /* Сцена живёт в координатах телефона и целиком масштабируется под окно,
     поэтому один и тот же файл годится и для скриншота, и для записи. */
  .phone{{position:relative;width:{W}px;height:{H}px;transform-origin:top left;overflow:hidden}}
  .wall{{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}}
  .mascot{{position:absolute;left:50%;transform:translateX(-50%);
    width:{mw}px;top:{mtop}px}}
  .mascot svg{{width:100%;height:auto;display:block}}
{mascot_css}
</style></head>
<body>
<div class="phone" id="phone">
  <img class="wall" src="{wall}" alt="">
  <div class="mascot stage state-{state}" data-hat="{hat}">
{mascot_svg}
  </div>
</div>
<script>
  // Вписываем телефон в окно: рендер и запись идут в разных размерах.
  const p = document.getElementById('phone');
  const fit = () => {{
    const k = Math.min(innerWidth / {W}, innerHeight / {H});
    p.style.transform = `scale(${{k}})`;
  }};
  addEventListener('resize', fit); fit();
</script>
</body></html>
"""


def mascot_parts():
    """Pull the palette variables, the drawing rules and the rhino <svg> out of the hats page."""
    src = MASCOT.read_text(encoding="utf-8")
    css = re.search(r"<style>(.*?)</style>", src, re.S).group(1)
    # The tokens live in :root and the JS only re-tints them, so the defaults are enough.
    tokens = css[css.index(":root{"): css.index("  *{box-sizing")]
    # Then the drawing and animation halves; the demo page chrome would fight the scene.
    art = css[css.index("/* ============ РИСУНОК ============ */"): css.index("  .note{")]
    svg = re.search(r'(<svg class="rhino".*?</svg>)', src, re.S).group(1)
    return tokens + art, svg


def build(lang, state="idle"):
    cfg = LANGS[lang]
    css, svg = mascot_parts()
    html = PAGE.format(
        lang=lang, W=W, H=H, wall=(WALLS / cfg["wall"]).as_uri(),
        mw=int(W * cfg["size"]), mtop=int(H * cfg["top"]),
        hat=cfg["hat"], state=state, mascot_css=css, mascot_svg=svg,
    )
    page = HERE / f"{lang}.html"
    page.write_text(html, encoding="utf-8")
    return page


def shoot(lang, page, seconds=6):
    """A still at full size, then a video of the same scene at half size."""
    from playwright.sync_api import sync_playwright

    png = HERE / f"{lang}.png"
    mp4 = HERE / f"{lang}.mp4"
    vid_w, vid_h = W // 2, H // 2

    with sync_playwright() as pw:
        browser = pw.chromium.launch(channel="chrome")
        page_ctx = browser.new_page(viewport={"width": W, "height": H})
        page_ctx.goto(page.as_uri())
        page_ctx.wait_for_timeout(1200)
        page_ctx.screenshot(path=str(png))
        page_ctx.close()

        ctx = browser.new_context(
            viewport={"width": vid_w, "height": vid_h},
            record_video_dir=str(HERE / "_raw"),
            record_video_size={"width": vid_w, "height": vid_h},
        )
        vp = ctx.new_page()
        vp.goto(page.as_uri())
        vp.wait_for_timeout(seconds * 1000)
        webm = vp.video.path()
        ctx.close()
        browser.close()

    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", str(webm),
         "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2", "-c:v", "libx264",
         "-pix_fmt", "yuv420p", "-crf", "20", str(mp4)],
        check=True,
    )
    Path(webm).unlink(missing_ok=True)
    return png, mp4


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    state = "idle"
    if "--state" in sys.argv:
        state = sys.argv[sys.argv.index("--state") + 1]
    for lang in args or LANGS:
        p = build(lang, state)
        png, mp4 = shoot(lang, p)
        print(png)
        print(mp4)
