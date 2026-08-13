"""
Standalone mascot assets, one per language: the rhino wearing its hat, nothing else
behind it.

Each language gets:
    assets/rhino-<lang>.svg    self-contained, animated, scales to any size
    assets/rhino-<lang>.png    still, 800x800, transparent
    assets/rhino-<lang>.webm   6 s seamless loop, transparent (VP9 alpha)
    assets/rhino-<lang>.apng   same loop as animated PNG, for anywhere webm is awkward

The markup and CSS come from index.html at build time, so the assets never drift
from the page the hats were fitted in.

    python3 assets.py           # both, everything
    python3 assets.py en        # one language
    python3 assets.py --svg     # skip the frame-by-frame recording
"""

import re
import shutil
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).parent
OUT = HERE / "assets"
SIZE = 800          # px per side of the rendered frames
FPS = 30
LOOP = 6            # seconds — every animation below is retimed to divide into this
LANGS = {"en": "uk", "es": "es"}

# The idle loop mixes 2.4 s, 3 s, 5.2 s and 5.8 s cycles, which never line up. For a
# seamless asset they are retimed to divisors of LOOP; the app keeps the originals.
LOOP_CSS = """
  .breathe{animation-duration:3s}
  .head{animation-duration:3s}
  .hat{animation-duration:3s}
  .eyes{animation-duration:6s}
  .ear-l,.ear-r{animation-duration:6s}
  .tail{animation-duration:3s}
"""


def parts():
    src = (HERE / "index.html").read_text(encoding="utf-8")
    css = re.search(r"<style>(.*?)</style>", src, re.S).group(1)
    tokens = css[css.index(":root{"): css.index("  *{box-sizing")]
    art = css[css.index("/* ============ РИСУНОК ============ */"): css.index("  .note{")]
    svg = re.search(r'(<svg class="rhino".*?</svg>)', src, re.S).group(1)
    return tokens + art, svg


def one_hat(svg, keep):
    """Drop the hat this language does not wear, so the asset carries only its own."""
    drop = "es" if keep == "uk" else "uk"
    start = svg.index(f'<g class="hat hat-{drop}"')
    depth, i = 0, start
    while True:                      # walk to the matching </g>
        nxt_open = svg.find("<g", i + 1)
        nxt_close = svg.find("</g>", i + 1)
        if nxt_open != -1 and nxt_open < nxt_close:
            depth, i = depth + 1, nxt_open
        else:
            if depth == 0:
                return svg[:start] + svg[nxt_close + 4:]
            depth, i = depth - 1, nxt_close


def make_svg(lang):
    css, svg = parts()
    hat = LANGS[lang]
    svg = one_hat(svg, hat)
    svg = svg.replace('<svg class="rhino"',
                      f'<svg class="rhino" width="{SIZE}" height="{SIZE}"', 1)
    style = f"<style>{css}{LOOP_CSS}\n  .hat-{hat}{{display:block}}\n</style>"
    svg = svg.replace(">", ">\n" + style, 1)
    path = OUT / f"rhino-{lang}.svg"
    path.write_text(svg, encoding="utf-8")
    return path


def page_for(lang):
    """A transparent page holding one asset, used only as a rendering surface."""
    css, svg = parts()
    hat = LANGS[lang]
    svg = one_hat(svg, hat)
    html = f"""<!doctype html><meta charset="utf-8"><style>
      html,body{{margin:0;background:transparent}}
      .rhino{{width:{SIZE}px;height:{SIZE}px;display:block}}
      {css}{LOOP_CSS}
      .hat-{hat}{{display:block}}
    </style>{svg}"""
    path = OUT / f"_render-{lang}.html"
    path.write_text(html, encoding="utf-8")
    return path


def record(lang, page):
    """Step the animations frame by frame, so the loop is exact rather than captured."""
    from playwright.sync_api import sync_playwright

    frames = OUT / f"_frames-{lang}"
    if frames.exists():
        shutil.rmtree(frames)
    frames.mkdir(parents=True)
    total = LOOP * FPS

    with sync_playwright() as pw:
        browser = pw.chromium.launch(channel="chrome")
        page_ctx = browser.new_page(viewport={"width": SIZE, "height": SIZE})
        page_ctx.goto(page.as_uri())
        for i in range(total):
            t = i / FPS
            # A negative delay seeks each animation to t; pausing freezes it there.
            page_ctx.add_style_tag(content=f"""
                *{{animation-play-state:paused !important;
                   animation-delay:-{t:.4f}s !important}}""")
            page_ctx.screenshot(path=str(frames / f"{i:04d}.png"), omit_background=True)
        browser.close()

    still = OUT / f"rhino-{lang}.png"
    shutil.copy(frames / "0000.png", still)

    webm = OUT / f"rhino-{lang}.webm"
    apng = OUT / f"rhino-{lang}.apng"
    src = ["-framerate", str(FPS), "-i", str(frames / "%04d.png")]
    # -auto-alt-ref 0 is what actually keeps the alpha plane in VP9.
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *src,
                    "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-auto-alt-ref", "0",
                    "-b:v", "0", "-crf", "28", "-an", str(webm)], check=True)
    # APNG carries every frame uncompressed-ish, so it ships at half size.
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *src,
                    "-vf", f"scale={SIZE // 2}:{SIZE // 2}",
                    "-f", "apng", "-plays", "0", str(apng)], check=True)
    shutil.rmtree(frames)
    page.unlink(missing_ok=True)
    return still, webm, apng


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    langs = [a for a in sys.argv[1:] if not a.startswith("--")] or list(LANGS)
    for lang in langs:
        print(make_svg(lang))
        if "--svg" not in sys.argv:
            for p in record(lang, page_for(lang)):
                print(p)
