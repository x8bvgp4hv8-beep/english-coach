"""
Backgrounds for the full course map — one per language, in the same hand as the
main-screen wallpapers next door: flat silhouettes in depth bands, pale enough
that dark lesson labels sit on them without a scrim.

The map scrolls for the whole course, so a single picture cannot cover it. Each
city is two pieces:

    <city>-top.png    the crown — sky, sun, skyline, then open ground (1179x1400)
    <city>-tile.png   that ground, looping seamlessly top to bottom (1179x4720)

The loop is seamless by construction rather than by luck: nothing is drawn near
the tile's edges, a fade to the canvas tone covers the last 3.5% at each end, and
both edges are stamped with that tone,
so any repeat count works and the course length never matters.

Both pieces keep the middle column quiet — the route of nodes and their labels
runs down the centre, so the scenery is banded left and right and a soft wash
lifts the centre back toward the canvas tone.

    .map {
      background-image: url(london-top.svg), url(london-tile.svg);
      background-repeat: no-repeat, repeat-y;
      background-position: top center, top center;
      background-size: 100% auto, 100% auto;   /* the crown covers the loop's top */
    }

The SVG is the asset to ship on the web — 27 KB against 1.9 MB of PNG, and it
scales to any screen. The PNG is for the native app and for looking at.

Usage:

    python3 route.py                # both cities: art + previews
    python3 route.py madrid         # one city
    python3 route.py --no-preview   # art only
"""

import math
import random
import sys
from pathlib import Path

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "wallpapers"))
import cities  # noqa: E402 — the landmarks and primitives the wallpapers are built from

W = 1179
CAP_H = 1400        # the crown: sky down to open ground
TILE_H = 4720       # the loop — about two phone screens, so the repeat is hard to spot
SEAM = 0.035        # share of the tile faded to flat tone at each end

# ── Palettes ────────────────────────────────────────────────────────────────
#
# Lighter than the wallpapers on purpose. A wallpaper only carries a title and a
# button; this one carries thirty blocks of lesson names in ink, so every tone is
# pulled up toward the app's own background and the silhouettes stay in the range
# where black text still reads as black.

MAPS = {
    "london": {
        "canvas": "#edf0f8",
        "sky": [("#f8faff", 0.0), ("#f1f5fe", 0.42), ("#eaeefb", 0.70), ("#edf0f8", 1.0)],
        "sun": "#ffeed2",
        "halo": "#ffdfbe",
        "haze": "#edf0f8",
        "far": "#ccd3ee",
        "mid": "#b6bde3",
        "near": "#9aa1d2",
        "landmark": "#a3aadb",
        "window": "#ffffff",
        "leaf": "#c3cbe8",
        "trunk": "#adb5da",
        "accent": "#d2596a",     # the bus, the kiosk, the pillar box — London's one red
        "cloud": ("#ffffff", 0.85),
        "bird": "#a8aed8",
        "sun_pos": (0.16, 0.29),
        "sun_r": 104,
    },
    "madrid": {
        "canvas": "#fbf2e9",
        "sky": [("#fffaf2", 0.0), ("#fff2e2", 0.42), ("#fdeada", 0.70), ("#fbf2e9", 1.0)],
        "sun": "#ffdfa6",
        "halo": "#ffcf9a",
        "haze": "#fbf2e9",
        "far": "#f0cdb0",
        "mid": "#e3b593",
        "near": "#cf9a74",
        "landmark": "#d9a883",
        "window": "#fffaf0",
        "leaf": "#cfbe94",
        "trunk": "#d3ab86",
        "accent": "#cf6a45",     # awnings and geraniums — the warm accent, used sparingly
        "cloud": ("#fffaf1", 0.8),
        "bird": "#d0a184",
        "sun_pos": (0.84, 0.27),
        "sun_r": 128,
    },
}


# ── Primitives ──────────────────────────────────────────────────────────────
#
# Anything the wallpapers already own is imported. What is added here is either
# bounded to a horizontal span (the wallpaper versions run the full width) or new
# to street level, where the map lives.


def skyline(y, x0, x1, seed, fill, lo, hi):
    """A run of anonymous blocks between two x's — the city the landmarks stand in."""
    r = random.Random(seed)
    out, x = [], float(x0)
    while x < x1:
        w = r.uniform(58, 132)
        h = r.uniform(lo, hi)
        out.append(cities.box(x, y, w, h, fill))
        if r.random() < 0.35:
            out.append(cities.box(x + w * 0.3, y - h, w * 0.3, r.uniform(14, 40), fill))
        x += w + r.uniform(-14, 12)
    return "".join(out)


def birds_at(seed, fill, x0, x1, y0, y1, n=6):
    r = random.Random(seed)
    out = []
    for _ in range(n):
        x, y = r.uniform(x0, x1), r.uniform(y0, y1)
        s = r.uniform(0.4, 0.85)
        out.append(
            f'<path transform="translate({x:.0f},{y:.0f}) scale({s:.2f})" '
            f'd="M-26,0 q13,-13 26,-2 q13,-11 26,2" fill="none" stroke="{fill}" '
            f'stroke-width="4.5" stroke-linecap="round" opacity="{r.uniform(0.25, 0.5):.2f}"/>'
        )
    return "".join(out)


def roof_row(x0, x1, y, seed, fill, window, tiled=False, lo=90, hi=180):
    """A terrace seen end-on: blocks, chimneys, a few lit windows."""
    r = random.Random(seed)
    out, x = [], float(x0)
    while x < x1:
        w = r.uniform(86, 148)
        h = r.uniform(lo, hi)
        out.append(cities.box(x, y, w, h, fill))
        if tiled and r.random() < 0.75:
            out.append(cities.tri(x + w / 2, y - h, w * 1.08, r.uniform(26, 48), fill))
        for _ in range(r.randrange(0, 3)):
            out.append(cities.box(
                x + r.uniform(0.15, 0.78) * w, y - h - (10 if tiled else 0),
                r.uniform(12, 21), r.uniform(20, 44), fill,
            ))
        out.append(cities.windows(
            x + w * 0.12, y - 14, w * 0.76, h * 0.52,
            r.randrange(3, 5), r.randrange(2, 4), window, r.randrange(9999), lit=0.3,
        ))
        x += w + r.uniform(-6, 18)
    return "".join(out)


def plane_tree(x, y, s, canopy, trunk):
    """A London plane: a straight trunk under a lumpy ball of leaf."""
    g = [
        f'<rect x="{x - 8 * s:.1f}" y="{y - 152 * s:.1f}" width="{16 * s:.1f}" '
        f'height="{152 * s:.1f}" rx="{4 * s:.1f}" fill="{trunk}"/>',
        f'<path d="M{x:.1f},{y - 112 * s:.1f} l{-36 * s:.1f},{-40 * s:.1f} '
        f'M{x:.1f},{y - 130 * s:.1f} l{32 * s:.1f},{-36 * s:.1f}" stroke="{trunk}" '
        f'stroke-width="{9 * s:.1f}" fill="none" stroke-linecap="round"/>',
    ]
    for dx, dy, rr in ((0, -200, 76), (-54, -168, 54), (56, -172, 58), (-20, -238, 50), (28, -232, 46)):
        g.append(f'<circle cx="{x + dx * s:.1f}" cy="{y + dy * s:.1f}" r="{rr * s:.1f}" fill="{canopy}"/>')
    return "".join(g)


def palm(x, y, s, frond, trunk):
    """A leaning trunk under six fronds — the tree of a Madrid plaza."""
    top_x, top_y = x + 34 * s, y - 196 * s
    g = [
        f'<path d="M{x - 11 * s:.1f},{y:.1f} q{4 * s:.1f},{-112 * s:.1f} {28 * s:.1f},{-196 * s:.1f} '
        f'l{14 * s:.1f},{4 * s:.1f} q{-22 * s:.1f},{86 * s:.1f} {-27 * s:.1f},{192 * s:.1f} Z" fill="{trunk}"/>'
    ]
    for angle, length in ((-172, 0.95), (-136, 1.05), (-104, 0.85), (-64, 1.05), (-24, 0.95), (12, 0.8)):
        a = math.radians(angle)
        ex, ey = top_x + math.cos(a) * 118 * s * length, top_y + math.sin(a) * 118 * s * length
        cx, cy = top_x + math.cos(a) * 66 * s * length, top_y + math.sin(a) * 66 * s * length
        g.append(
            f'<path d="M{top_x:.1f},{top_y:.1f} Q{cx:.1f},{cy - 30 * s:.1f} {ex:.1f},{ey:.1f} '
            f'Q{cx:.1f},{cy + 22 * s:.1f} {top_x:.1f},{top_y:.1f} Z" fill="{frond}"/>'
        )
    g.append(f'<circle cx="{top_x:.1f}" cy="{top_y:.1f}" r="{11 * s:.1f}" fill="{trunk}"/>')
    return "".join(g)


def bench(x, y, s, fill):
    w = 130 * s
    g = [f'<rect x="{x - w / 2:.1f}" y="{y - 42 * s:.1f}" width="{w:.1f}" height="{10 * s:.1f}" rx="{5 * s:.1f}" fill="{fill}"/>']
    for dy in (76, 94):
        g.append(f'<rect x="{x - w / 2:.1f}" y="{y - dy * s:.1f}" width="{w:.1f}" height="{9 * s:.1f}" rx="{4 * s:.1f}" fill="{fill}"/>')
    for dx in (-w * 0.42, w * 0.42):
        g.append(f'<rect x="{x + dx - 5 * s:.1f}" y="{y - 96 * s:.1f}" width="{10 * s:.1f}" height="{96 * s:.1f}" fill="{fill}"/>')
    return "".join(g)


def phone_box(x, y, s, fill, glass):
    """The K6 kiosk: a panelled box, a crowned cap."""
    w, h = 78 * s, 176 * s
    return (
        f'<rect x="{x - w / 2:.1f}" y="{y - h:.1f}" width="{w:.1f}" height="{h:.1f}" rx="{8 * s:.1f}" fill="{fill}"/>'
        + cities.windows(x - w * 0.34, y - h * 0.28, w * 0.68, h * 0.54, 3, 4, glass, 7, lit=1.0)
        + f'<rect x="{x - w * 0.60:.1f}" y="{y - h - 16 * s:.1f}" width="{w * 1.20:.1f}" height="{18 * s:.1f}" rx="{6 * s:.1f}" fill="{fill}"/>'
        + f'<path d="M{x - w * 0.30:.1f},{y - h - 16 * s:.1f} q{w * 0.30:.1f},{-30 * s:.1f} {w * 0.60:.1f},0 Z" fill="{fill}"/>'
    )


def pillar_box(x, y, s, fill, slot):
    w, h = 56 * s, 104 * s
    return (
        f'<path d="M{x - w / 2:.1f},{y:.1f} L{x - w / 2:.1f},{y - h + w * 0.5:.1f} '
        f'A{w / 2:.1f},{w / 2:.1f} 0 0 1 {x + w / 2:.1f},{y - h + w * 0.5:.1f} L{x + w / 2:.1f},{y:.1f} Z" fill="{fill}"/>'
        f'<rect x="{x - w * 0.28:.1f}" y="{y - h * 0.60:.1f}" width="{w * 0.56:.1f}" height="{8 * s:.1f}" rx="{4 * s:.1f}" fill="{slot}" opacity="0.55"/>'
    )


def railing(x0, x1, y, s, fill):
    """A low embankment rail — a horizon line at street level."""
    g = [cities.box(x0, y - 62 * s, x1 - x0, 11 * s, fill)]
    x = x0
    while x < x1:
        g.append(cities.box(x, y, 9 * s, 62 * s, fill))
        x += 34 * s
    return "".join(g)


def awning_cafe(x, y, s, fill, accent, glass):
    """A terrace: a scalloped awning over a table and two chairs."""
    w = 300 * s
    g = [cities.box(x - w / 2, y, w, 190 * s, fill)]
    g.append(cities.windows(x - w * 0.40, y - 26 * s, w * 0.80, 108 * s, 3, 2, glass, 21, lit=0.5))
    # The awning itself, its scalloped edge drawn as a run of arcs.
    top = y - 196 * s
    g.append(f'<path d="M{x - w * 0.56:.1f},{top:.1f} L{x + w * 0.56:.1f},{top:.1f} '
             f'L{x + w * 0.50:.1f},{top + 54 * s:.1f} L{x - w * 0.50:.1f},{top + 54 * s:.1f} Z" fill="{accent}"/>')
    n = 7
    for i in range(n):
        cx = x - w * 0.50 + w * (i + 0.5) / n
        g.append(f'<circle cx="{cx:.1f}" cy="{top + 54 * s:.1f}" r="{w * 0.5 / n:.1f}" fill="{accent}"/>')
    for dx in (-w * 0.46, w * 0.46):
        g.append(cities.box(x + dx, y, 7 * s, 196 * s - 54 * s, fill))
    # Table and chairs, small enough to read as furniture rather than as shapes.
    tx, ty = x + w * 0.10, y
    g.append(f'<ellipse cx="{tx:.1f}" cy="{ty - 74 * s:.1f}" rx="{40 * s:.1f}" ry="{9 * s:.1f}" fill="{fill}"/>')
    g.append(cities.box(tx - 4 * s, ty, 8 * s, 74 * s, fill))
    for dx in (-72 * s, 74 * s):
        g.append(cities.box(tx + dx - 22 * s, ty - 52 * s, 44 * s, 8 * s, fill))
        g.append(cities.box(tx + dx - 22 * s, ty - 96 * s, 8 * s, 44 * s, fill))
        g.append(cities.box(tx + dx - 20 * s, ty, 6 * s, 52 * s, fill))
        g.append(cities.box(tx + dx + 14 * s, ty, 6 * s, 52 * s, fill))
    return "".join(g)


def fountain(x, y, s, fill, water):
    """A plaza fountain: a wide basin, a stem, an upper bowl, three jets."""
    g = [
        f'<ellipse cx="{x:.1f}" cy="{y:.1f}" rx="{112 * s:.1f}" ry="{26 * s:.1f}" fill="{fill}"/>',
        f'<ellipse cx="{x:.1f}" cy="{y - 6 * s:.1f}" rx="{96 * s:.1f}" ry="{19 * s:.1f}" fill="{water}"/>',
        cities.box(x - 13 * s, y - 10 * s, 26 * s, 78 * s, fill),
        f'<ellipse cx="{x:.1f}" cy="{y - 88 * s:.1f}" rx="{54 * s:.1f}" ry="{14 * s:.1f}" fill="{fill}"/>',
        cities.box(x - 7 * s, y - 96 * s, 14 * s, 34 * s, fill),
    ]
    for dx in (-1, 0, 1):
        g.append(
            f'<path d="M{x:.1f},{y - 130 * s:.1f} q{dx * 46 * s:.1f},{-30 * s:.1f} {dx * 62 * s:.1f},{34 * s:.1f}" '
            f'fill="none" stroke="{water}" stroke-width="{7 * s:.1f}" stroke-linecap="round" opacity="0.8"/>'
        )
    return "".join(g)


def geraniums(x, y, s, pot, bloom):
    """Two pots of colour at a doorway — Madrid's version of the red bus."""
    g = []
    for dx, ss in ((0, 1.0), (46 * s, 0.8)):
        px, sc = x + dx, s * ss
        g.append(f'<path d="M{px - 22 * sc:.1f},{y - 40 * sc:.1f} L{px + 22 * sc:.1f},{y - 40 * sc:.1f} '
                 f'L{px + 16 * sc:.1f},{y:.1f} L{px - 16 * sc:.1f},{y:.1f} Z" fill="{pot}"/>')
        for bx, by, rr in ((-14, -54, 13), (10, -58, 14), (-2, -70, 12)):
            g.append(f'<circle cx="{px + bx * sc:.1f}" cy="{y + by * sc:.1f}" r="{rr * sc:.1f}" fill="{bloom}"/>')
    return "".join(g)


def sierra_band(y, x0, x1, seed, fill, amp, depth):
    """The Guadarrama line — jagged, and closed at a stated depth so it can sit anywhere."""
    r = random.Random(seed)
    pts = [f"M{x0:.0f},{y + amp * 0.6:.0f}"]
    x = float(x0)
    while x < x1:
        x += r.uniform(70, 170)
        pts.append(f"L{x:.0f},{y - r.uniform(0.2, 1.0) * amp:.0f}")
    pts.append(f"L{x1:.0f},{y + depth:.0f} L{x0:.0f},{y + depth:.0f} Z")
    return f'<path d="{" ".join(pts)}" fill="{fill}"/>'


# ── Page ────────────────────────────────────────────────────────────────────


def defs(p):
    stops = "".join(f'<stop offset="{o}" stop-color="{c}"/>' for c, o in p["sky"])
    return f"""
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">{stops}</linearGradient>
    <radialGradient id="halo" cx="50%" cy="50%">
      <stop offset="0%" stop-color="{p['halo']}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="{p['halo']}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="{p['haze']}" stop-opacity="0"/>
      <stop offset="100%" stop-color="{p['haze']}" stop-opacity="0.9"/>
    </linearGradient>
    <linearGradient id="lane" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="{p['canvas']}" stop-opacity="0"/>
      <stop offset="20%" stop-color="{p['canvas']}" stop-opacity="0.30"/>
      <stop offset="38%" stop-color="{p['canvas']}" stop-opacity="0.72"/>
      <stop offset="62%" stop-color="{p['canvas']}" stop-opacity="0.72"/>
      <stop offset="80%" stop-color="{p['canvas']}" stop-opacity="0.30"/>
      <stop offset="100%" stop-color="{p['canvas']}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="shelf-l" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="{p['near']}" stop-opacity="0.34"/>
      <stop offset="55%" stop-color="{p['near']}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="{p['near']}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="shelf-r" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0%" stop-color="{p['near']}" stop-opacity="0.34"/>
      <stop offset="55%" stop-color="{p['near']}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="{p['near']}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="seam" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="{p['canvas']}" stop-opacity="1"/>
      <stop offset="{SEAM * 100:.0f}%" stop-color="{p['canvas']}" stop-opacity="0"/>
      <stop offset="{100 - SEAM * 100:.0f}%" stop-color="{p['canvas']}" stop-opacity="0"/>
      <stop offset="100%" stop-color="{p['canvas']}" stop-opacity="1"/>
    </linearGradient>
    """


def page(p, height, body):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{height}" viewBox="0 0 {W} {height}">'
        f'<defs>{defs(p)}</defs>{"".join(body)}</svg>'
    )


# ── The crown ───────────────────────────────────────────────────────────────
#
# What the learner sees before the first scroll: the city on its horizon, and
# below it the open ground the whole route walks over. The bottom edge is flat
# canvas tone, which is exactly what the tile begins and ends with.

HORIZON = 0.80


def cap_sky(p, g):
    g.append(f'<rect width="{W}" height="{CAP_H}" fill="url(#sky)"/>')
    sx, sy = W * p["sun_pos"][0], CAP_H * p["sun_pos"][1]
    g.append(f'<circle cx="{sx:.0f}" cy="{sy:.0f}" r="{p["sun_r"] * 3.4:.0f}" fill="url(#halo)"/>')
    g.append(f'<circle cx="{sx:.0f}" cy="{sy:.0f}" r="{p["sun_r"]}" fill="{p["sun"]}"/>')
    for i, (cx, cy, w) in enumerate(((W * 0.24, CAP_H * 0.11, 520), (W * 0.82, CAP_H * 0.21, 400))):
        g.append(cities.cloud_band(cx, cy, w, p["cloud"][0], p["cloud"][1] * (1 - i * 0.2), 5 + i))
    g.append(birds_at(3, p["bird"], W * 0.08, W * 0.94, CAP_H * 0.16, CAP_H * 0.42))


def london_cap():
    p = MAPS["london"]
    g = []
    cap_sky(p, g)

    band = CAP_H * 0.75
    g.append(f'<rect y="{band - 380:.0f}" width="{W}" height="420" fill="url(#haze)"/>')
    g.append(f'<g opacity="0.5">{skyline(band, -60, W + 60, 11, p["far"], 50, 150)}</g>')
    g.append(f'<g opacity="0.5">{cities.shard(W * 0.955, band, 0.40, p["far"])}</g>')
    g.append(f'<g opacity="0.5">{cities.gherkin(W * 0.60, band, 0.30, p["far"])}</g>')

    mid = CAP_H * 0.80
    g.append(f'<g opacity="0.7">{skyline(mid, -60, W + 60, 21, p["mid"], 30, 76)}</g>')
    g.append(f'<g opacity="0.85">{cities.london_eye(W * 0.855, mid - 168, 132, p["landmark"], rim_w=6)}</g>')
    g.append(f'<g opacity="0.85">{cities.westminster(W * 0.02, mid, 0.40, p["landmark"], p["window"])}</g>')
    g.append(f'<g opacity="0.85">{cities.big_ben(W * 0.075, mid, 0.44, p["landmark"], p["sky"][0][0])}</g>')

    # Ground: the tone the whole route runs on, with the embankment as its top edge.
    y = CAP_H * HORIZON
    g.append(f'<rect y="{y:.0f}" width="{W}" height="{CAP_H - y:.0f}" fill="{p["canvas"]}"/>')
    g.append(f'<g opacity="0.35">{railing(-40, W + 40, y + 96, 0.62, p["near"])}</g>')
    g.append(f'<g opacity="0.85">{cities.bus(W * 0.055, y + 190, 0.62, p["accent"], p["window"])}</g>')
    g.append(f'<g opacity="0.42">{cities.street_lamp(W * 0.90, y + 196, 0.46, p["near"])}</g>')
    return g


def madrid_cap():
    p = MAPS["madrid"]
    g = []
    cap_sky(p, g)

    ridge = CAP_H * 0.70
    g.append(f'<rect y="{ridge - 340:.0f}" width="{W}" height="380" fill="url(#haze)"/>')
    g.append(f'<g opacity="0.4">{sierra_band(ridge, -60, W + 60, 6, p["far"], 96, 420)}</g>')

    band = CAP_H * 0.755
    g.append(f'<g opacity="0.35">{cities.cuatro_torres(W * 0.60, band, 0.30, p["mid"])}</g>')
    g.append(f'<g opacity="0.55">{skyline(band, -60, W + 60, 13, p["far"], 40, 120)}</g>')

    mid = CAP_H * 0.80
    g.append(f'<g opacity="0.7">{skyline(mid, -60, W + 60, 27, p["mid"], 28, 70)}</g>')
    g.append(f'<g opacity="0.85">{cities.metropolis(W * 0.115, mid, 0.50, p["landmark"], p["window"])}</g>')
    g.append(f'<g opacity="0.85">{cities.alcala(W * 0.85, mid, 0.44, p["landmark"])}</g>')

    y = CAP_H * HORIZON
    g.append(f'<rect y="{y:.0f}" width="{W}" height="{CAP_H - y:.0f}" fill="{p["canvas"]}"/>')
    g.append(f'<g opacity="0.3">{railing(-40, W + 40, y + 92, 0.58, p["near"])}</g>')
    g.append(f'<g opacity="0.8">{geraniums(W * 0.07, y + 188, 0.85, p["near"], p["accent"])}</g>')
    g.append(f'<g opacity="0.42">{cities.street_lamp(W * 0.905, y + 192, 0.46, p["near"])}</g>')
    return g


# ── The loop ────────────────────────────────────────────────────────────────
#
# Five scenes down the tile, alternating sides, none of them touching the seam.
# Read top to bottom it is a walk: rooftops, a park, the river, a street corner,
# a square — and then it starts again, which is what an endless course looks like.


def shelf(side, y, width, height=64):
    """The bank the scenery stands on: ground that reaches in from the frame and
    fades out before the route. Without it the silhouettes hang in the air."""
    x = 0 if side == "l" else W - width
    return (
        f'<rect x="{x:.0f}" y="{y - 7:.0f}" width="{width:.0f}" height="7" fill="url(#shelf-{side})"/>'
        f'<g opacity="0.55"><rect x="{x:.0f}" y="{y:.0f}" width="{width:.0f}" height="{height}" fill="url(#shelf-{side})"/></g>'
    )


# Ten scenes down the loop, alternating banks. Read top to bottom it is a walk —
# terrace, park, the river, a corner, a square — and then it starts over, which is
# what an endless course looks like.
SCENES = [(420 + i * 460, "r" if i % 2 == 0 else "l") for i in range(10)]


def london_tile():
    p = MAPS["london"]
    g = []
    ys = [y for y, _ in SCENES]
    for (y, side), width in zip(SCENES, (0.46, 0.42, 0.38, 0.44, 0.40, 0.36, 0.45, 0.40, 0.43, 0.38)):
        g.append(shelf(side, y, W * width))

    g.append(f'<g opacity="0.55">{roof_row(W * 0.60, W + 70, ys[0], 31, p["mid"], p["window"], lo=120, hi=215)}</g>')
    g.append(f'<g opacity="0.5">{cities.street_lamp(W * 0.74, ys[0], 0.44, p["near"])}</g>')

    g.append('<g opacity="0.6">')
    for x, s in ((W * 0.08, 1.0), (W * 0.22, 0.82), (W * 0.32, 0.6)):
        g.append(plane_tree(x, ys[1], s, p["leaf"], p["trunk"]))
    g.append("</g>")
    g.append(f'<g opacity="0.5">{bench(W * 0.17, ys[1], 0.8, p["near"])}</g>')

    g.append(f'<g opacity="0.4">{cities.london_eye(W * 0.95, ys[2] - 190, 150, p["landmark"], rim_w=6)}</g>')
    g.append(f'<g opacity="0.5">{railing(W * 0.66, W + 40, ys[2], 0.62, p["near"])}</g>')

    g.append(f'<g opacity="0.55">{roof_row(-70, W * 0.26, ys[3], 47, p["mid"], p["window"], lo=110, hi=195)}</g>')
    g.append(f'<g opacity="0.8">{phone_box(W * 0.30, ys[3], 0.8, p["accent"], p["window"])}</g>')
    g.append(f'<g opacity="0.5">{cities.street_lamp(W * 0.11, ys[3], 0.44, p["near"])}</g>')

    g.append('<g opacity="0.6">')
    for x, s in ((W * 0.94, 0.95), (W * 0.82, 0.68)):
        g.append(plane_tree(x, ys[4], s, p["leaf"], p["trunk"]))
    g.append("</g>")
    g.append(f'<g opacity="0.8">{cities.bus(W * 0.65, ys[4], 0.62, p["accent"], p["window"])}</g>')

    g.append(f'<g opacity="0.5">{railing(-40, W * 0.30, ys[5], 0.6, p["near"])}</g>')
    g.append(f'<g opacity="0.6">{plane_tree(W * 0.07, ys[5], 0.72, p["leaf"], p["trunk"])}</g>')
    g.append(f'<g opacity="0.7">{pillar_box(W * 0.24, ys[5], 0.75, p["accent"], p["window"])}</g>')

    g.append(f'<g opacity="0.32">{cities.gherkin(W * 0.90, ys[6], 0.34, p["landmark"])}</g>')
    g.append(f'<g opacity="0.55">{roof_row(W * 0.64, W + 70, ys[6], 63, p["mid"], p["window"], lo=100, hi=175)}</g>')
    g.append(f'<g opacity="0.5">{cities.street_lamp(W * 0.90, ys[6], 0.42, p["near"])}</g>')

    g.append(f'<g opacity="0.6">{plane_tree(W * 0.13, ys[7], 0.9, p["leaf"], p["trunk"])}</g>')
    g.append(f'<g opacity="0.5">{bench(W * 0.28, ys[7], 0.72, p["near"])}</g>')
    g.append(f'<g opacity="0.5">{cities.street_lamp(W * 0.03, ys[7], 0.4, p["near"])}</g>')

    g.append(f'<g opacity="0.32">{cities.shard(W * 0.86, ys[8], 0.30, p["landmark"])}</g>')
    g.append(f'<g opacity="0.55">{roof_row(W * 0.66, W + 70, ys[8], 71, p["mid"], p["window"], lo=90, hi=160)}</g>')

    g.append('<g opacity="0.6">')
    for x, s in ((W * 0.06, 0.88), (W * 0.20, 0.66)):
        g.append(plane_tree(x, ys[9], s, p["leaf"], p["trunk"]))
    g.append("</g>")
    g.append(f'<g opacity="0.5">{cities.street_lamp(W * 0.31, ys[9], 0.42, p["near"])}</g>')
    return g


def madrid_tile():
    p = MAPS["madrid"]
    g = []
    ys = [y for y, _ in SCENES]
    for (y, side), width in zip(SCENES, (0.44, 0.40, 0.46, 0.38, 0.42, 0.36, 0.44, 0.41, 0.38, 0.43)):
        g.append(shelf(side, y, W * width))

    g.append(f'<g opacity="0.55">{roof_row(W * 0.62, W + 70, ys[0], 33, p["mid"], p["window"], tiled=True, lo=110, hi=195)}</g>')
    g.append(f'<g opacity="0.5">{cities.street_lamp(W * 0.72, ys[0], 0.44, p["near"])}</g>')

    g.append('<g opacity="0.6">')
    for x, s in ((W * 0.06, 1.0), (W * 0.21, 0.78)):
        g.append(palm(x, ys[1], s, p["leaf"], p["trunk"]))
    g.append("</g>")
    g.append(f'<g opacity="0.5">{fountain(W * 0.25, ys[1], 0.72, p["near"], p["far"])}</g>')

    g.append(f'<g opacity="0.32">{cities.alcala(W * 0.90, ys[2], 0.44, p["landmark"])}</g>')
    g.append(f'<g opacity="0.5">{railing(W * 0.62, W + 40, ys[2], 0.6, p["near"])}</g>')

    g.append(f'<g opacity="0.55">{awning_cafe(W * 0.09, ys[3], 0.82, p["mid"], p["accent"], p["window"])}</g>')
    g.append(f'<g opacity="0.75">{geraniums(W * 0.26, ys[3], 0.75, p["near"], p["accent"])}</g>')

    g.append(f'<g opacity="0.6">{palm(W * 0.93, ys[4], 0.92, p["leaf"], p["trunk"])}</g>')
    g.append(f'<g opacity="0.55">{roof_row(W * 0.68, W + 70, ys[4], 39, p["mid"], p["window"], tiled=True, lo=90, hi=150)}</g>')
    g.append(f'<g opacity="0.5">{bench(W * 0.76, ys[4], 0.74, p["near"])}</g>')

    g.append(f'<g opacity="0.5">{railing(-40, W * 0.28, ys[5], 0.58, p["near"])}</g>')
    g.append(f'<g opacity="0.6">{palm(W * 0.05, ys[5], 0.7, p["leaf"], p["trunk"])}</g>')

    g.append(f'<g opacity="0.32">{cities.metropolis(W * 0.90, ys[6], 0.42, p["landmark"], p["window"])}</g>')
    g.append(f'<g opacity="0.55">{roof_row(W * 0.66, W + 70, ys[6], 57, p["mid"], p["window"], tiled=True, lo=100, hi=170)}</g>')
    g.append(f'<g opacity="0.5">{cities.street_lamp(W * 0.71, ys[6], 0.42, p["near"])}</g>')

    g.append(f'<g opacity="0.55">{roof_row(-70, W * 0.24, ys[7], 51, p["mid"], p["window"], tiled=True, lo=100, hi=175)}</g>')
    g.append(f'<g opacity="0.75">{geraniums(W * 0.28, ys[7], 0.7, p["near"], p["accent"])}</g>')

    g.append(f'<g opacity="0.6">{palm(W * 0.88, ys[8], 0.85, p["leaf"], p["trunk"])}</g>')
    g.append(f'<g opacity="0.5">{fountain(W * 0.72, ys[8], 0.62, p["near"], p["far"])}</g>')

    g.append(f'<g opacity="0.6">{palm(W * 0.08, ys[9], 0.9, p["leaf"], p["trunk"])}</g>')
    g.append(f'<g opacity="0.5">{bench(W * 0.25, ys[9], 0.74, p["near"])}</g>')
    g.append(f'<g opacity="0.5">{cities.street_lamp(W * 0.02, ys[9], 0.42, p["near"])}</g>')
    return g


# ── Composition ─────────────────────────────────────────────────────────────


def cap(city):
    p = MAPS[city]
    body = london_cap() if city == "london" else madrid_cap()
    # The lane wash starts under the skyline: over the sky it would read as a beam.
    lane_top = CAP_H * 0.74
    body.append(f'<rect y="{lane_top:.0f}" width="{W}" height="{CAP_H - lane_top:.0f}" fill="url(#lane)" opacity="0.7"/>')
    body.append(f'<rect y="{CAP_H - 3}" width="{W}" height="3" fill="{p["canvas"]}"/>')
    return page(p, CAP_H, body)


def tile(city):
    p = MAPS[city]
    body = [f'<rect width="{W}" height="{TILE_H}" fill="{p["canvas"]}"/>']
    body += london_tile() if city == "london" else madrid_tile()
    body.append(f'<rect width="{W}" height="{TILE_H}" fill="url(#lane)"/>')
    body.append(f'<rect width="{W}" height="{TILE_H}" fill="url(#seam)"/>')
    # Chrome dithers gradients by a level or two, which would band at every repeat:
    # both edges are stamped with the flat tone so the loop closes exactly.
    body.append(f'<rect width="{W}" height="3" fill="{p["canvas"]}"/>')
    body.append(f'<rect y="{TILE_H - 3}" width="{W}" height="3" fill="{p["canvas"]}"/>')
    return page(p, TILE_H, body)


PIECES = {"top": (cap, CAP_H), "tile": (tile, TILE_H)}


def render(city, chrome):
    """Write both pieces of one city, SVG first so the art stays editable."""
    out = []
    for name, (build, height) in PIECES.items():
        svg_path = HERE / f"{city}-{name}.svg"
        png_path = HERE / f"{city}-{name}.png"
        svg_path.write_text(build(city), encoding="utf-8")
        page_ = chrome.new_page(viewport={"width": W, "height": height})
        page_.goto(svg_path.as_uri())
        page_.screenshot(path=str(png_path))
        page_.close()
        print(png_path)
        out.append(png_path)
    return out


# ── Preview ─────────────────────────────────────────────────────────────────
#
# The art is only right if lesson names stay readable on it, so the check is the
# screen itself: the route, its labels and the cards drawn over the background at
# phone size. This is a proof, not a component — the real screen is in the app.

LANGS = {
    "london": {"lang": "Английский", "level": "A2"},
    "madrid": {"lang": "Испанский", "level": "A2"},
}

BLOCKS = [
    ("3", "Про себя и других", "Рассказать, кто ты и чем занят", "6 / 6", [
        ("Как тебя зовут", "4 мин", "done"),
        ("Чем ты занимаешься", "5 мин", "done"),
        ("Семья и близкие", "6 мин", "done"),
        ("Откуда ты", "5 мин", "done"),
        ("Блок без подсказок", "8 мин", "check-done"),
    ]),
    ("4", "Планы и время", "Договориться, перенести, отказаться — не обидев", "3 / 5", [
        ("Дни недели и время", "5 мин", "done"),
        ("Свободен или занят", "6 мин", "done"),
        ("Договориться о встрече", "7 мин", "current"),
        ("Перенести и отменить", "6 мин", "next"),
        ("Блок без подсказок", "9 мин", "check"),
    ]),
    ("5", "Дом и быт", "Снять жильё и объяснить, что сломалось", "", [
        ("Комнаты и вещи", "5 мин", "locked"),
        ("Что сломалось", "6 мин", "locked"),
        ("Разговор с хозяином", "7 мин", "locked"),
    ]),
    ("6", "Работа и письма", "Написать коллеге так, чтобы поняли с первого раза", "", [
        ("Короткое письмо", "6 мин", "locked"),
        ("Попросить об услуге", "6 мин", "locked"),
        ("Сообщить плохую новость", "7 мин", "locked"),
    ]),
]

PREVIEW_CSS = """
* { margin: 0; padding: 0; box-sizing: border-box; -webkit-font-smoothing: antialiased; }
body {
  font-family: ui-rounded, 'SF Pro Rounded', -apple-system, 'Segoe UI', system-ui, sans-serif;
  color: #1d2229;
  background-color: %(canvas)s;
  background-image: url('%(top)s'), url('%(tile)s');
  background-repeat: no-repeat, repeat-y;
  background-position: top center, top center;
  background-size: 100%% auto, 100%% auto;
}
.sheet { padding: 0 0 90px; }
.now {
  position: sticky; top: 0; z-index: 5; margin: 14px 16px 0;
  background: #fff; border-radius: 24px; padding: 20px;
  box-shadow: 0 10px 30px rgba(29, 34, 41, 0.10);
}
.kicker { font-size: 11px; font-weight: 800; letter-spacing: 1.3px; color: #e0982f; }
.now h1 { font-size: 25px; font-weight: 800; letter-spacing: -0.02em; margin: 7px 0 4px; }
.meta { font-size: 14px; color: #79808a; }
.go {
  margin-top: 16px; height: 58px; border-radius: 15px; background: #3b424b;
  color: #fff; font-size: 17px; font-weight: 700; display: grid; place-items: center;
}
.course { text-align: center; font-size: 13px; color: #8b929c; margin: 16px 0 14px; }
.course b { color: #5f666f; font-weight: 700; }
.block {
  margin: 26px 16px 8px; background: #3b424b; border-radius: 20px; padding: 14px 18px;
  display: flex; align-items: center; gap: 12px;
}
.block.locked { background: #dfe3e9; }
.block .num { font-size: 10px; font-weight: 800; letter-spacing: 1.4px; color: #a6adb7; }
.block.locked .num { color: #a2a9b3; }
.block h2 { font-size: 19px; font-weight: 800; color: #fff; margin: 2px 0 3px; }
.block.locked h2 { color: #8d949e; }
.block p { font-size: 13px; color: #b0b7c0; }
.block.locked p { color: #a8aeb8; }
.block .count { margin-left: auto; font-size: 15px; font-weight: 700; color: #cfd5dc; }
.block.locked .count { font-size: 17px; color: #a8aeb8; }
.node { display: grid; justify-items: center; gap: 7px; margin: 22px 0; position: relative; }
.disc {
  width: 62px; height: 62px; border-radius: 50%%; display: grid; place-items: center;
  font-size: 24px; color: #fff; position: relative;
}
.disc::after {
  content: ''; position: absolute; inset: 0; border-radius: 50%%;
  box-shadow: 0 6px 0 rgba(29, 34, 41, 0.13); z-index: -1;
}
.done .disc, .check-done .disc { background: #6cab7e; }
.current .disc { background: #dd9a33; }
.next .disc { background: #fff; color: #3b424b; box-shadow: inset 0 0 0 2px #e4e8ee; }
.check .disc { background: #dfe3e9; color: #a3aab4; }
.locked .disc { background: #dfe3e9; font-size: 21px; }
.locked .disc, .block.locked .count { filter: grayscale(1); opacity: 0.6; }
.node .name { font-size: 13.5px; font-weight: 700; text-align: center; max-width: 150px; }
.locked .name, .check .name { color: #8d949e; }
.node .min { font-size: 12px; color: #8b929c; }
.tag {
  position: absolute; top: -22px; background: #dd9a33; color: #fff; font-size: 11px;
  font-weight: 800; letter-spacing: 1.2px; padding: 4px 11px; border-radius: 9px;
  box-shadow: 0 3px 0 rgba(29, 34, 41, 0.12);
}
.tabs {
  position: fixed; left: 0; right: 0; bottom: 0; height: 78px; background: #fff;
  border-top: 1px solid #e8ebef; display: grid; grid-template-columns: repeat(4, 1fr);
  align-items: center; justify-items: center; padding-bottom: 8px;
}
.tabs div { display: grid; justify-items: center; gap: 4px; font-size: 11px; color: #8b929c; }
.tabs .on { color: #3b424b; font-weight: 700; }
.tabs i { font-size: 19px; font-style: normal; }
"""

ICON = {"done": "✓", "check-done": "◎", "current": "▶", "next": "▶", "check": "◎", "locked": "🔒"}


def preview_html(city):
    p = MAPS[city]
    meta = LANGS[city]
    css = PREVIEW_CSS % {"canvas": p["canvas"], "top": f"{city}-top.png", "tile": f"{city}-tile.png"}
    rows = []
    index = 0
    for number, title, subtitle, count, lessons in BLOCKS:
        locked = " locked" if not count else ""
        rows.append(
            f'<div class="block{locked}"><div><div class="num">БЛОК {number}</div>'
            f'<h2>{title}</h2><p>{subtitle}</p></div>'
            f'<div class="count">{count or "🔒"}</div></div>'
        )
        for name, minutes, state in lessons:
            # The route drifts side to side, the way a path does on a map.
            offset = math.sin(index * 0.85) * 84
            tag = '<div class="tag">СТАРТ</div>' if state == "current" else ""
            rows.append(
                f'<div class="node {state}" style="transform: translateX({offset:.0f}px)">'
                f'{tag}<div class="disc">{ICON[state]}</div>'
                f'<div class="name">{name}</div><div class="min">{minutes}</div></div>'
            )
            index += 1
    tabs = "".join(
        f'<div class="{cls}"><i>{icon}</i>{label}</div>'
        for icon, label, cls in (("⌂", "Сегодня", ""), ("⤳", "Курс", "on"), ("⊪", "Тренировка", ""), ("⊫", "Прогресс", ""))
    )
    return (
        f'<!doctype html><html lang="ru"><head><meta charset="utf-8">'
        f'<title>Карта курса — {meta["lang"]}</title><style>{css}</style></head><body>'
        f'<div class="sheet">'
        f'<div class="now"><div class="kicker">СЕЙЧАС ЗДЕСЬ</div><h1>Договориться о встрече</h1>'
        f'<div class="meta">Блок 4 · урок 3 из 5 · 7 мин</div><div class="go">Продолжить</div></div>'
        f'<div class="course">{meta["lang"]} {meta["level"]} · <b>30 блоков</b> · пройдено 3½</div>'
        f'{"".join(rows)}</div><div class="tabs">{tabs}</div></body></html>'
    )


def preview(city, chrome):
    html_path = HERE / f"{city}-preview.html"
    html_path.write_text(preview_html(city), encoding="utf-8")
    page_ = chrome.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=2)
    page_.goto(html_path.as_uri())
    page_.wait_for_timeout(400)
    shots = []
    for i, y in enumerate((0, 1180, 2360)):
        page_.evaluate(f"window.scrollTo(0, {y})")
        page_.wait_for_timeout(120)
        shot = HERE / f"{city}-preview-{i + 1}.png"
        page_.screenshot(path=str(shot))
        shots.append(shot)
        print(shot)
    page_.close()
    return shots


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    want_preview = "--no-preview" not in sys.argv
    from playwright.sync_api import sync_playwright

    with sync_playwright() as pw:
        browser = pw.chromium.launch(channel="chrome")
        for city in args or list(MAPS):
            render(city, browser)
            if want_preview:
                preview(city, browser)
        browser.close()
