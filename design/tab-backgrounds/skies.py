"""
Backgrounds for the app tabs — one air, three hours.

See PHILOSOPHY.md. Each tab is not a different picture but the same landscape at
a different time of day: morning on "Сегодня", flat midday on "Тренировка",
evening on "Прогресс". They are siblings of the phone wallpapers in
design/wallpapers/, not of the course map: pale sky, a sun's halo, and the city
reduced to a whisper along the bottom edge.

    <tab>-en.svg / .png    cool chalk light, London on the horizon
    <tab>-es.svg / .png    dry warm light, Madrid on the horizon

1179 x 2800, anchored at the top, never tiled. The lower sixth fades to the flat
canvas tone, so a screen taller than the art has no visible seam. The whole upper
two thirds is empty air on purpose — that is where the cards and the text live,
and anything drawn there turns to mud under a white card.

    python3 skies.py            # all six
    python3 skies.py today      # one tab, both languages
"""

import math
import random
import sys
from pathlib import Path

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "wallpapers"))
import cities  # noqa: E402 — the landmarks the wallpapers are drawn from

W, H = 1179, 2800
HORIZON = 0.845          # where the city line sits
FADE = 0.855             # below this the sheet dissolves into flat canvas

# ── Light ───────────────────────────────────────────────────────────────────
#
# Two lands, three hours each. The stops are uneven on purpose: an evenly spaced
# gradient reads as a swatch, an uneven one reads as air. Every tone sits within
# a couple of steps of the canvas, because ink goes on top of all of this.

LIGHT = {
    ("today", "en"): {
        "canvas": "#eef1f6",
        "sky": [("#fbfcff", 0.00), ("#f4f7fe", 0.30), ("#edf1fb", 0.52),
                ("#eceef8", 0.70), ("#eef1f6", 1.00)],
        "sun": ("#fff7ea", 0.17, 0.57, 86),   # colour, x, y, radius
        "halo": "#ffe3c0",
        "haze": "#e6ebf6",
        "far": "#d7dded",
        "near": "#c6cee4",
        "bird": "#b9c1da",
        "clouds": [(0.26, 0.085, 560), (0.80, 0.155, 420), (0.16, 0.225, 300)],
        "bands": [(0.44, 26), (0.52, 20), (0.585, 15)],
        "birds": 5,
    },
    ("today", "es"): {
        "canvas": "#faf2e8",
        "sky": [("#fffcf6", 0.00), ("#fff6e8", 0.30), ("#fdf0dd", 0.52),
                ("#fbefdf", 0.70), ("#faf2e8", 1.00)],
        "sun": ("#ffeec9", 0.82, 0.55, 94),
        "halo": "#ffd79a",
        "haze": "#f4e6d2",
        "far": "#eddcc4",
        "near": "#e0c9aa",
        "bird": "#d5bb9d",
        "clouds": [(0.74, 0.095, 520), (0.22, 0.17, 400), (0.84, 0.235, 280)],
        "bands": [(0.45, 24), (0.53, 18), (0.60, 14)],
        "birds": 4,
    },
    ("practice", "en"): {
        "canvas": "#eef1f6",
        "sky": [("#f7f9fd", 0.00), ("#f2f5fc", 0.34), ("#eef2fa", 0.58),
                ("#edf0f8", 0.78), ("#eef1f6", 1.00)],
        "sun": None,                            # noon: light without a source
        "halo": None,
        "haze": "#e7ecf6",
        "far": "#dae0ef",
        "near": "#cad2e6",
        "bird": "#bcc4dc",
        "clouds": [(0.62, 0.055, 640)],
        # The drill screen: air laid down in even strata. The eye does not count
        # them, it feels the order.
        "bands": [(0.30, 16), (0.375, 16), (0.45, 16), (0.525, 16), (0.60, 16), (0.675, 16)],
        "birds": 0,
    },
    ("practice", "es"): {
        "canvas": "#faf2e8",
        "sky": [("#fffdf8", 0.00), ("#fdf8ee", 0.34), ("#fbf3e4", 0.58),
                ("#faf1e2", 0.78), ("#faf2e8", 1.00)],
        "sun": None,
        "halo": None,
        "haze": "#f3e7d5",
        "far": "#ecdfc9",
        "near": "#dfcbaf",
        "bird": "#d3bda1",
        "clouds": [(0.34, 0.06, 600)],
        "bands": [(0.30, 15), (0.375, 15), (0.45, 15), (0.525, 15), (0.60, 15), (0.675, 15)],
        "birds": 0,
    },
    ("progress", "en"): {
        "canvas": "#eef1f6",
        "sky": [("#f3f6fd", 0.00), ("#eff3fc", 0.26), ("#eceff9", 0.50),
                ("#eeeef7", 0.68), ("#f2eef4", 0.82), ("#eef1f6", 1.00)],
        "sun": None,                            # the sun is already down
        "halo": "#f6dcc8",                      # only its afterglow, low and wide
        "haze": "#e4e9f5",
        "far": "#d3daec",
        "near": "#bfc8e0",
        "bird": "#b4bdd6",
        "clouds": [(0.50, 0.105, 720)],
        # Strata climbing: intervals shorten as they rise, the way height is gained.
        "bands": [(0.66, 22), (0.575, 18), (0.505, 15), (0.452, 12), (0.415, 10)],
        "birds": 6,
    },
    ("progress", "es"): {
        "canvas": "#faf2e8",
        "sky": [("#fffaf1", 0.00), ("#fdf6ea", 0.26), ("#fbf1e2", 0.50),
                ("#faeddb", 0.68), ("#f8e8d3", 0.82), ("#faf2e8", 1.00)],
        "sun": None,
        "halo": "#f7cfa0",
        "haze": "#f2e3cd",
        "far": "#e9d8bf",
        "near": "#dbc3a3",
        "bird": "#cfb695",
        "clouds": [(0.46, 0.115, 700)],
        "bands": [(0.66, 20), (0.575, 17), (0.505, 14), (0.452, 11), (0.415, 9)],
        "birds": 5,
    },
}


# ── Marks ───────────────────────────────────────────────────────────────────


def defs(p):
    """Gradients only. Every soft edge in this sheet is a gradient, never a blur:
    blurs cost bytes and render differently in every engine."""
    stops = "".join(f'<stop offset="{o}" stop-color="{c}"/>' for c, o in p["sky"])
    out = [f'<linearGradient id="s" x1="0" y1="0" x2="0" y2="1">{stops}</linearGradient>']
    if p["halo"]:
        out.append(
            f'<radialGradient id="h"><stop offset="0" stop-color="{p["halo"]}" stop-opacity=".40"/>'
            f'<stop offset=".22" stop-color="{p["halo"]}" stop-opacity=".29"/>'
            f'<stop offset=".45" stop-color="{p["halo"]}" stop-opacity=".16"/>'
            f'<stop offset=".72" stop-color="{p["halo"]}" stop-opacity=".06"/>'
            f'<stop offset="1" stop-color="{p["halo"]}" stop-opacity="0"/></radialGradient>'
        )
    out.append(
        f'<linearGradient id="f" x1="0" y1="0" x2="0" y2="1">'
        f'<stop offset="0" stop-color="{p["canvas"]}" stop-opacity="0"/>'
        f'<stop offset="1" stop-color="{p["canvas"]}" stop-opacity="1"/></linearGradient>'
    )
    out.append(
        f'<linearGradient id="g" x1="0" y1="0" x2="0" y2="1">'
        f'<stop offset="0" stop-color="{p["haze"]}" stop-opacity="0"/>'
        f'<stop offset="1" stop-color="{p["haze"]}" stop-opacity=".9"/></linearGradient>'
    )
    out.append(
        f'<linearGradient id="b" x1="0" y1="0" x2="0" y2="1">'
        f'<stop offset="0" stop-color="{p["haze"]}" stop-opacity="0"/>'
        f'<stop offset=".5" stop-color="{p["haze"]}" stop-opacity=".6"/>'
        f'<stop offset="1" stop-color="{p["haze"]}" stop-opacity="0"/></linearGradient>'
    )
    return "".join(out)


def bands(p):
    """Strata of haze. Flat, horizontal, unequal — the quiet rhythm of the sheet."""
    out = []
    for y, h in p["bands"]:
        # h is the half-thickness of the visible core; the drawn band is wider so
        # the feather has room to happen.
        band = h * 5
        out.append(f'<rect y="{H * y - band / 2:.0f}" width="{W}" height="{band:.0f}" fill="url(#b)"/>')
    return "".join(out)


def clouds(p):
    """Flat-bottomed bands with a lumpy top — the only shape a cloud is allowed."""
    out = []
    for i, (cx, cy, w) in enumerate(p["clouds"]):
        out.append(cities.cloud_band(W * cx, H * cy, w, "#ffffff", 0.72 - i * 0.16, 5 + i))
    return "".join(out)


def birds(p):
    """Three strokes each, never on a line. Life, at the smallest possible cost."""
    if not p["birds"]:
        return ""
    r = random.Random(11)
    out = []
    for _ in range(p["birds"]):
        x, y = r.uniform(W * 0.12, W * 0.9), r.uniform(H * 0.10, H * 0.34)
        s = r.uniform(0.34, 0.62)
        out.append(
            f'<path transform="translate({x:.0f},{y:.0f}) scale({s:.2f})" '
            f'd="M-26,0 q13,-13 26,-2 q13,-11 26,2" fill="none" stroke="{p["bird"]}" '
            f'stroke-width="5" stroke-linecap="round" opacity="{r.uniform(0.3, 0.5):.2f}"/>'
        )
    return "".join(out)


def horizon(p, land):
    """The city, whispered. It is here for weight, not for recognition — but the
    one silhouette that is recognisable tells you which country you are in."""
    y = H * HORIZON
    g = [f'<rect y="{y - 300:.0f}" width="{W}" height="320" fill="url(#g)"/>']
    g.append(f'<g opacity=".42">{cities.skyline_fill(y, 21, p["far"], 26, 86)}</g>')
    if land == "en":
        g.append(f'<g opacity=".5">{cities.london_eye(W * 0.845, y - 96, 74, p["near"], rim_w=4)}</g>')
        g.append(f'<g opacity=".5">{cities.big_ben(W * 0.115, y, 0.26, p["near"], p["canvas"])}</g>')
        g.append(f'<g opacity=".45">{cities.shard(W * 0.965, y, 0.2, p["near"])}</g>')
    else:
        g.append(f'<g opacity=".5">{cities.alcala(W * 0.845, y, 0.26, p["near"])}</g>')
        g.append(f'<g opacity=".5">{cities.metropolis(W * 0.13, y, 0.3, p["near"], p["canvas"])}</g>')
        g.append(f'<g opacity=".45">{cities.cuatro_torres(W * 0.44, y, 0.16, p["near"])}</g>')
    return "".join(g)


def sheet(tab, land):
    p = LIGHT[(tab, land)]
    body = [f'<rect width="{W}" height="{H}" fill="url(#s)"/>']

    if p["halo"] and p["sun"]:
        _, sx, sy, sr = p["sun"]
        body.append(f'<circle cx="{W * sx:.0f}" cy="{H * sy:.0f}" r="{sr * 4.2:.0f}" fill="url(#h)"/>')
    elif p["halo"]:
        # Afterglow: no disc, only a wide low bloom sitting on the horizon.
        body.append(
            f'<ellipse cx="{W * 0.5:.0f}" cy="{H * 0.80:.0f}" rx="{W * 0.95:.0f}" '
            f'ry="{H * 0.20:.0f}" fill="url(#h)"/>'
        )
    if p["sun"]:
        colour, sx, sy, sr = p["sun"]
        body.append(f'<circle cx="{W * sx:.0f}" cy="{H * sy:.0f}" r="{sr}" fill="{colour}"/>')

    body.append(bands(p))
    body.append(clouds(p))
    body.append(birds(p))
    body.append(horizon(p, land))
    body.append(f'<rect y="{H * FADE:.0f}" width="{W}" height="{H * (1 - FADE):.0f}" fill="url(#f)"/>')
    body.append(f'<rect y="{H - 3}" width="{W}" height="3" fill="{p["canvas"]}"/>')

    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">'
        f'<defs>{defs(p)}</defs>{"".join(body)}</svg>'
    )


def render(tab, land, chrome):
    import re

    svg = sheet(tab, land)
    # Whole pixels only. Two-or-more digit integer parts, so fractional opacities
    # survive — a looser regex turns opacity="0.5" into opacity="0" and blanks layers.
    svg = re.sub(r"(-?\d{2,})\.\d+", r"\1", svg)
    svg_path = HERE / f"{tab}-{land}.svg"
    png_path = HERE / f"{tab}-{land}.png"
    svg_path.write_text(svg, encoding="utf-8")
    page = chrome.new_page(viewport={"width": W, "height": H})
    page.goto(svg_path.as_uri())
    page.screenshot(path=str(png_path))
    page.close()
    print(f"{svg_path.name}  {len(svg.encode()):>6} bytes")


if __name__ == "__main__":
    from playwright.sync_api import sync_playwright

    tabs = [a for a in sys.argv[1:] if not a.startswith("--")] or ["today", "practice", "progress"]
    with sync_playwright() as pw:
        browser = pw.chromium.launch(channel="chrome")
        for tab in tabs:
            for land in ("en", "es"):
                render(tab, land, browser)
        browser.close()
