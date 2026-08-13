"""
Two phone wallpapers for Coachirinho, one per language: London for English,
Madrid for Spanish. Same engine, same layering, two palettes — the cool one
borrows the app's default accent, the warm one its `data-learning='es'` accent.

Everything is drawn as silhouettes in depth bands (far / mid / near / front), so
the top half stays quiet enough to hold UI and the landmarks read at a glance.

    python3 cities.py            # both
    python3 cities.py madrid     # one
"""

import math
import random
import sys
from pathlib import Path

W, H = 1179, 2556          # 9:19.5 — a modern iPhone
HERE = Path(__file__).parent

CITIES = {
    "london": {
        # Pale, cool, and light at the top so a dark title sits on it cleanly.
        "sky": [("#f5f8ff", 0.0), ("#ebf1fd", 0.28), ("#e6e8fa", 0.50),
                ("#eee2ee", 0.64), ("#f8e1d8", 0.74), ("#fae4da", 1.0)],
        "sun": "#ffe6bd",
        "halo": "#ffd7ab",
        "haze": "#f3e7ef",
        "glow": "#ffffff",
        "far": "#ccd3ee",
        "mid": "#a7aedb",
        "landmark": "#7f85c4",
        "near": "#6a6fa8",
        "window": "#fff3d8",
        "water": ["#d3dcf5", "#bfc9e9"],
        "ground": ["#e2e6f7", "#c3c9e7"],
        "cloud": ("#ffffff", 0.7),
        "bird": "#8f95c4",
        "sun_pos": (0.17, 0.44),
        "sun_r": 118,
    },
    "madrid": {
        # The Spanish accent, warmed up — but light enough at the crown for a title.
        "sky": [("#fff3da", 0.0), ("#ffdfb0", 0.28), ("#fcbb87", 0.52),
                ("#f4966a", 0.68), ("#e97c52", 0.80), ("#dd6b47", 1.0)],
        "sun": "#ffc75a",
        "halo": "#ffb765",
        "haze": "#f7bd93",
        "glow": "#fff2d8",
        "far": "#e6ab86",
        "mid": "#cd8460",
        "landmark": "#a95c3f",
        "near": "#93513a",
        "window": "#ffd98a",
        "water": None,
        "ground": ["#efb98d", "#d99060"],
        "cloud": ("#fff4de", 0.5),
        "bird": "#a35f42",
        "sun_pos": (0.84, 0.42),
        "sun_r": 150,
    },
}
# ── Primitives ──────────────────────────────────────────────────────────────


def box(x, y, w, h, fill, r=0):
    """A building block, drawn from its base line upward."""
    rx = f' rx="{r}"' if r else ""
    return f'<rect x="{x:.1f}" y="{y - h:.1f}" width="{w:.1f}" height="{h:.1f}" fill="{fill}"{rx}/>'


def tri(cx, y, w, h, fill):
    return f'<path d="M{cx - w / 2:.1f},{y:.1f} L{cx:.1f},{y - h:.1f} L{cx + w / 2:.1f},{y:.1f} Z" fill="{fill}"/>'


def spire(cx, y, w, h, fill):
    """A tapered spike — steeper than a roof, thinner than a tower."""
    return (
        f'<path d="M{cx - w / 2:.1f},{y:.1f} Q{cx - w * 0.16:.1f},{y - h * 0.55:.1f} {cx:.1f},{y - h:.1f} '
        f'Q{cx + w * 0.16:.1f},{y - h * 0.55:.1f} {cx + w / 2:.1f},{y:.1f} Z" fill="{fill}"/>'
    )


def arch_holes(x, y, w, h, arches, fill, rects=()):
    """A wall with openings punched clean through it — arched and square, one path."""
    d = [f"M{x:.1f},{y:.1f} L{x:.1f},{y - h:.1f} L{x + w:.1f},{y - h:.1f} L{x + w:.1f},{y:.1f} Z"]
    for ax, aw, ah in arches:
        cx = x + ax
        d.append(
            f"M{cx - aw / 2:.1f},{y:.1f} L{cx - aw / 2:.1f},{y - ah + aw / 2:.1f} "
            f"A{aw / 2:.1f},{aw / 2:.1f} 0 0 1 {cx + aw / 2:.1f},{y - ah + aw / 2:.1f} "
            f"L{cx + aw / 2:.1f},{y:.1f} Z"
        )
    for rx, rw, rh in rects:
        cx = x + rx
        d.append(f"M{cx - rw / 2:.1f},{y:.1f} l0,{-rh:.1f} l{rw:.1f},0 l0,{rh:.1f} Z")
    return f'<path fill-rule="evenodd" d="{" ".join(d)}" fill="{fill}"/>'


def windows(x, y, w, h, cols, rows, fill, seed, lit=0.55, pad=0.18):
    """Lit windows: a grid, thinned at random so the façade does not look printed."""
    r = random.Random(seed)
    out = []
    cw = w / (cols + (cols + 1) * pad)
    ch = h / (rows + (rows + 1) * pad * 1.6)
    gx, gy = cw * pad, ch * pad * 1.6
    for i in range(cols):
        for j in range(rows):
            if r.random() > lit:
                continue
            wx = x + gx + i * (cw + gx)
            wy = y - h + gy + j * (ch + gy)
            out.append(
                f'<rect x="{wx:.1f}" y="{wy:.1f}" width="{cw:.1f}" height="{ch:.1f}" '
                f'fill="{fill}" opacity="{r.uniform(0.35, 0.95):.2f}"/>'
            )
    return "".join(out)


def cloud_band(cx, cy, w, fill, opacity, seed):
    """A flat-bottomed band of cloud: a lumpy top edge over a straight base."""
    r = random.Random(seed)
    h = w * r.uniform(0.09, 0.13)
    l = cx - w / 2
    pts = [(l, cy)]
    for i in range(1, 5):
        t = i / 5
        pts.append((l + w * t, cy - h * (0.55 + 0.5 * math.sin(t * math.pi)) * r.uniform(0.85, 1.1)))
    pts.append((cx + w / 2, cy))
    d = f"M{pts[0][0]:.1f},{pts[0][1]:.1f}"
    for i in range(len(pts) - 1):
        p0 = pts[i - 1] if i else pts[i]
        p1, p2 = pts[i], pts[i + 1]
        p3 = pts[i + 2] if i + 2 < len(pts) else p2
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d += f" C{c1[0]:.1f},{c1[1]:.1f} {c2[0]:.1f},{c2[1]:.1f} {p2[0]:.1f},{p2[1]:.1f}"
    d += " Z"
    return f'<path d="{d}" fill="{fill}" opacity="{opacity:.2f}"/>'


def birds(seed, fill, y0, y1):
    r = random.Random(seed)
    out = []
    for _ in range(7):
        x, y = r.uniform(W * 0.1, W * 0.92), r.uniform(y0, y1)
        s = r.uniform(0.45, 0.95)
        out.append(
            f'<path transform="translate({x:.0f},{y:.0f}) scale({s:.2f})" '
            f'd="M-26,0 q13,-13 26,-2 q13,-11 26,2" fill="none" stroke="{fill}" '
            f'stroke-width="4.5" stroke-linecap="round" opacity="{r.uniform(0.3, 0.65):.2f}"/>'
        )
    return "".join(out)


def skyline_fill(y, seed, fill, lo, hi, opacity=1.0):
    """A generic run of blocks — the anonymous city the landmarks stand out from."""
    r = random.Random(seed)
    out, x = [], -60.0
    while x < W + 60:
        w = r.uniform(58, 132)
        h = r.uniform(lo, hi)
        out.append(box(x, y, w, h, fill))
        if r.random() < 0.35:  # a roof box or an aerial, for a broken top line
            out.append(box(x + w * 0.3, y - h, w * 0.3, r.uniform(14, 40), fill))
        x += w + r.uniform(-14, 12)
    return f'<g opacity="{opacity}">{"".join(out)}</g>'


# ── London landmarks ────────────────────────────────────────────────────────


def big_ben(x, y, s, fill, face):
    """Elizabeth Tower: shaft, clock face, pinnacled roof, spire."""
    w, h = 108 * s, 620 * s
    g = [box(x - w / 2, y, w, h, fill)]
    # The stone belt courses that break up the shaft.
    for t in (0.34, 0.52, 0.64):
        g.append(box(x - w * 0.56, y - h * t, w * 1.12, 10 * s, fill))
    # Clock face, high on the shaft.
    cy = y - h * 0.80
    g.append(f'<circle cx="{x:.1f}" cy="{cy:.1f}" r="{w * 0.36:.1f}" fill="{face}"/>')
    g.append(
        f'<path d="M{x:.1f},{cy:.1f} L{x:.1f},{cy - w * 0.24:.1f} M{x:.1f},{cy:.1f} L{x + w * 0.17:.1f},{cy + w * 0.10:.1f}" '
        f'stroke="{fill}" stroke-width="{4 * s:.1f}" stroke-linecap="round"/>'
    )
    # Belfry, roof and spire.
    g.append(box(x - w * 0.58, y - h - 4 * s, w * 1.16, 44 * s, fill))
    g.append(tri(x, y - h - 44 * s, w * 1.06, 96 * s, fill))
    for dx in (-w * 0.53, w * 0.53):
        g.append(spire(x + dx, y - h - 44 * s, 20 * s, 70 * s, fill))
    g.append(spire(x, y - h - 140 * s, 26 * s, 118 * s, fill))
    return "".join(g)


def westminster(x, y, s, fill, window):
    """The Palace: a long pinnacled façade with the Victoria Tower at one end."""
    w, h = 520 * s, 180 * s
    g = [box(x, y, w, h, fill)]
    g.append(arch_holes(x, y, w, h * 0.62, [(i * w / 9 + w / 18, 24 * s, 66 * s) for i in range(9)], fill))
    # Pinnacle line along the roof.
    n = 11
    for i in range(n):
        px = x + w * (i + 0.5) / n
        g.append(spire(px, y - h, 16 * s, 46 * s, fill))
    # Victoria Tower.
    tw, th = 118 * s, 360 * s
    g.append(box(x - tw * 0.1, y, tw, th, fill))
    g.append(windows(x - tw * 0.1, y, tw, th * 0.9, 3, 7, window, 4, lit=0.30))
    g.append(box(x - tw * 0.16, y - th, tw * 1.12, 22 * s, fill))
    for dx in (0.08, 0.92):
        g.append(spire(x - tw * 0.1 + tw * dx, y - th - 22 * s, 18 * s, 54 * s, fill))
    g.append(spire(x + tw * 0.4, y - th - 22 * s, 26 * s, 40 * s, fill))
    return "".join(g)


def london_eye(cx, cy, r, fill, rim_w=7):
    """The wheel: rim, spokes, capsules, A-frame."""
    g = [
        f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="none" stroke="{fill}" stroke-width="{rim_w}"/>',
        f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r * 0.06:.1f}" fill="{fill}"/>',
    ]
    n = 28
    for i in range(n):
        a = i * 2 * math.pi / n
        ex, ey = cx + math.cos(a) * r, cy + math.sin(a) * r
        g.append(
            f'<line x1="{cx:.1f}" y1="{cy:.1f}" x2="{ex:.1f}" y2="{ey:.1f}" stroke="{fill}" stroke-width="2"/>'
        )
        g.append(f'<ellipse cx="{ex:.1f}" cy="{ey:.1f}" rx="{r * 0.045:.1f}" ry="{r * 0.032:.1f}" fill="{fill}"/>')
    # A-frame: two slim legs to the ground and one back stay, like the real one.
    base = cy + r * 1.32
    for dx in (-0.16, 0.16):
        g.append(
            f'<path d="M{cx + r * dx * 0.20:.1f},{cy:.1f} L{cx + r * dx:.1f},{base:.1f}" '
            f'stroke="{fill}" stroke-width="{r * 0.055:.1f}" stroke-linecap="round"/>'
        )
    g.append(
        f'<path d="M{cx:.1f},{cy:.1f} L{cx + r * 0.62:.1f},{base:.1f}" stroke="{fill}" '
        f'stroke-width="{r * 0.030:.1f}" stroke-linecap="round"/>'
    )
    g.append(f'<rect x="{cx - r * 0.26:.1f}" y="{base - r * 0.06:.1f}" width="{r * 0.52:.1f}" height="{r * 0.08:.1f}" rx="{r * 0.03:.1f}" fill="{fill}"/>')
    return "".join(g)


def shard(x, y, s, fill):
    """A tapering glass spike with staggered facet tips."""
    w, h = 150 * s, 700 * s
    return (
        f'<path d="M{x - w / 2:.1f},{y:.1f} L{x - w * 0.06:.1f},{y - h:.1f} L{x + w * 0.02:.1f},{y - h * 0.97:.1f} '
        f'L{x + w * 0.09:.1f},{y - h * 0.93:.1f} L{x + w / 2:.1f},{y:.1f} Z" fill="{fill}"/>'
    )


def gherkin(x, y, s, fill):
    """30 St Mary Axe: a bullet, wider at the waist, with a tiny cap."""
    w, h = 132 * s, 420 * s
    return (
        f'<path d="M{x - w / 2:.1f},{y:.1f} C{x - w * 0.60:.1f},{y - h * 0.55:.1f} {x - w * 0.34:.1f},{y - h * 0.92:.1f} '
        f'{x:.1f},{y - h:.1f} C{x + w * 0.34:.1f},{y - h * 0.92:.1f} {x + w * 0.60:.1f},{y - h * 0.55:.1f} '
        f'{x + w / 2:.1f},{y:.1f} Z" fill="{fill}"/>'
        f'<circle cx="{x:.1f}" cy="{y - h - 8 * s:.1f}" r="{12 * s:.1f}" fill="{fill}"/>'
    )


def river_bridge(y, s, fill, deck_h=26):
    """A low arched crossing spanning the whole width — Westminster, not Tower."""
    g = []
    piers = 5
    span = (W + 200) / piers
    for i in range(piers):
        cx = -100 + span * (i + 0.5)
        # Each arch is a filled semicircle subtracted by drawing the spandrels only.
        g.append(
            f'<path d="M{cx - span / 2:.1f},{y:.1f} L{cx - span / 2:.1f},{y - 64 * s:.1f} '
            f'A{span / 2:.1f},{58 * s:.1f} 0 0 1 {cx + span / 2:.1f},{y - 64 * s:.1f} '
            f'L{cx + span / 2:.1f},{y:.1f} Z" fill="{fill}" opacity="0"/>'
        )
    # Deck.
    g.append(box(-40, y - 66 * s, W + 80, deck_h, fill))
    # Piers and the spandrel walls between the arches.
    for i in range(piers + 1):
        cx = -100 + span * i
        g.append(box(cx - 22 * s, y, 44 * s, 68 * s, fill))
    for i in range(piers):
        cx = -100 + span * (i + 0.5)
        g.append(
            f'<path d="M{cx - span / 2 + 20 * s:.1f},{y - 66 * s:.1f} '
            f'L{cx - span / 2 + 20 * s:.1f},{y - 6 * s:.1f} '
            f'A{span / 2 - 20 * s:.1f},{46 * s:.1f} 0 0 1 {cx + span / 2 - 20 * s:.1f},{y - 6 * s:.1f} '
            f'L{cx + span / 2 - 20 * s:.1f},{y - 66 * s:.1f} Z" fill="{fill}"/>'
        )
    # Parapet lamps along the deck.
    for i in range(7):
        lx = 40 + i * (W - 80) / 6
        g.append(box(lx - 4 * s, y - 66 * s - deck_h, 8 * s, 46 * s, fill))
        g.append(f'<circle cx="{lx:.1f}" cy="{y - 66 * s - deck_h - 50 * s:.1f}" r="{9 * s:.1f}" fill="{fill}"/>')
    return "".join(g)


def bus(x, y, s, fill, glass):
    """A double-decker: the one spot of colour London is allowed."""
    w, h = 150 * s, 80 * s
    return (
        f'<rect x="{x:.1f}" y="{y - h:.1f}" width="{w:.1f}" height="{h:.1f}" rx="{10 * s:.1f}" fill="{fill}"/>'
        + windows(x + w * 0.06, y - h * 0.52, w * 0.88, h * 0.34, 4, 1, glass, 2, lit=1.0)
        + windows(x + w * 0.06, y - h * 0.08, w * 0.88, h * 0.30, 4, 1, glass, 3, lit=1.0)
        + f'<circle cx="{x + w * 0.24:.1f}" cy="{y:.1f}" r="{9 * s:.1f}" fill="{fill}"/>'
        + f'<circle cx="{x + w * 0.78:.1f}" cy="{y:.1f}" r="{9 * s:.1f}" fill="{fill}"/>'
    )


def street_lamp(x, y, s, fill, flip=False):
    """A straight post under a glass globe — the one shape that says 'street'."""
    h = 330 * s
    top = y - h
    return (
        f'<path d="M{x - 22 * s:.1f},{y:.1f} L{x + 22 * s:.1f},{y:.1f} L{x + 10 * s:.1f},{y - 34 * s:.1f} '
        f'L{x - 10 * s:.1f},{y - 34 * s:.1f} Z" fill="{fill}"/>'
        f'<rect x="{x - 6 * s:.1f}" y="{top:.1f}" width="{12 * s:.1f}" height="{h - 28 * s:.1f}" fill="{fill}"/>'
        f'<rect x="{x - 20 * s:.1f}" y="{top - 4 * s:.1f}" width="{40 * s:.1f}" height="{9 * s:.1f}" rx="{4 * s:.1f}" fill="{fill}"/>'
        f'<circle cx="{x:.1f}" cy="{top - 30 * s:.1f}" r="{22 * s:.1f}" fill="{fill}"/>'
        f'<path d="M{x - 12 * s:.1f},{top - 48 * s:.1f} L{x:.1f},{top - 66 * s:.1f} L{x + 12 * s:.1f},{top - 48 * s:.1f} Z" fill="{fill}"/>'
    )


# ── Madrid landmarks ────────────────────────────────────────────────────────


def metropolis(x, y, s, fill, window):
    """Edificio Metrópolis: a wide corner block, a slim drum, a small dome, a winged figure."""
    w, h = 320 * s, 320 * s
    g = [
        f'<path d="M{x - w / 2:.1f},{y:.1f} L{x - w / 2:.1f},{y - h * 0.60:.1f} '
        f'Q{x - w * 0.46:.1f},{y - h:.1f} {x:.1f},{y - h:.1f} Q{x + w * 0.46:.1f},{y - h:.1f} '
        f'{x + w / 2:.1f},{y - h * 0.60:.1f} L{x + w / 2:.1f},{y:.1f} Z" fill="{fill}"/>'
    ]
    g.append(windows(x - w * 0.44, y - 6 * s, w * 0.88, h * 0.48, 6, 3, window, 12, lit=0.5))
    # Cornice and the colonnade around the top floor.
    g.append(box(x - w * 0.52, y - h * 0.62, w * 1.04, 13 * s, fill))
    for i in range(9):
        g.append(box(x - w * 0.40 + i * w * 0.10, y - h * 0.64, 11 * s, 58 * s, fill))
    g.append(box(x - w * 0.44, y - h * 0.88, w * 0.88, 14 * s, fill))
    # Drum, then a dome that is a cap rather than a ball.
    dr = w * 0.19
    drum_y = y - h * 0.88 - 14 * s
    g.append(box(x - dr, drum_y, dr * 2, 44 * s, fill))
    dome_y = drum_y - 44 * s
    g.append(
        f'<path d="M{x - dr:.1f},{dome_y:.1f} A{dr:.1f},{dr * 0.92:.1f} 0 0 1 {x + dr:.1f},{dome_y:.1f} Z" fill="{fill}"/>'
    )
    top = dome_y - dr * 0.92
    g.append(box(x - dr * 0.22, top, dr * 0.44, 26 * s, fill))
    # The winged Victoria: figure, raised arm, one wing.
    fy = top - 26 * s
    g.append(f'<circle cx="{x:.1f}" cy="{fy - 26 * s:.1f}" r="{7 * s:.1f}" fill="{fill}"/>')
    g.append(
        f'<path d="M{x - 6 * s:.1f},{fy:.1f} L{x - 3 * s:.1f},{fy - 21 * s:.1f} L{x + 4 * s:.1f},{fy - 21 * s:.1f} '
        f'L{x + 8 * s:.1f},{fy:.1f} Z" fill="{fill}"/>'
        f'<path d="M{x + 3 * s:.1f},{fy - 19 * s:.1f} q{18 * s:.1f},{-8 * s:.1f} {24 * s:.1f},{-28 * s:.1f}" '
        f'fill="none" stroke="{fill}" stroke-width="{5 * s:.1f}" stroke-linecap="round"/>'
        f'<path d="M{x - 5 * s:.1f},{fy - 15 * s:.1f} q{-20 * s:.1f},{-15 * s:.1f} {-16 * s:.1f},{-40 * s:.1f} '
        f'q{16 * s:.1f},{16 * s:.1f} {18 * s:.1f},{34 * s:.1f} Z" fill="{fill}"/>'
    )
    return "".join(g)


def alcala(x, y, s, fill):
    """Puerta de Alcalá: five openings — three arched, two square — under a sculpted attic."""
    w, h = 460 * s, 250 * s
    arches = [(w * 0.5, 104 * s, 200 * s), (w * 0.29, 82 * s, 162 * s), (w * 0.71, 82 * s, 162 * s)]
    rects = [(w * 0.09, 50 * s, 112 * s), (w * 0.91, 50 * s, 112 * s)]
    g = [arch_holes(x - w / 2, y, w, h, arches, fill, rects)]
    # Entablature, attic, trophy group.
    g.append(box(x - w * 0.54, y - h, w * 1.08, 26 * s, fill))
    g.append(box(x - w * 0.24, y - h - 26 * s, w * 0.48, 52 * s, fill))
    g.append(f'<circle cx="{x:.1f}" cy="{y - h - 96 * s:.1f}" r="{15 * s:.1f}" fill="{fill}"/>')
    for dx in (-w * 0.34, w * 0.34):
        g.append(f'<circle cx="{x + dx:.1f}" cy="{y - h - 44 * s:.1f}" r="{11 * s:.1f}" fill="{fill}"/>')
    return "".join(g)


def cuatro_torres(x, y, s, fill):
    """The four towers, each with the top that tells it apart."""
    g = []
    hs = [520, 590, 640, 560]
    for i, hh in enumerate(hs):
        bx = x + i * 122 * s
        w, h = 84 * s, hh * s
        g.append(box(bx, y, w, h, fill))
        if i == 0:      # Torre Espacio — a curved shoulder
            g.append(f'<path d="M{bx:.1f},{y - h:.1f} q{w * 0.5:.1f},{-34 * s:.1f} {w:.1f},0 Z" fill="{fill}"/>')
        elif i == 1:    # Torre de Cristal — a glass pyramid
            g.append(tri(bx + w / 2, y - h, w, 80 * s, fill))
        elif i == 2:    # Torre Cepsa — a flat cap on visible pillars
            g.append(box(bx - 8 * s, y - h, w + 16 * s, 20 * s, fill))
        else:           # Torre PwC — a slim crown
            g.append(box(bx + w * 0.28, y - h, w * 0.44, 54 * s, fill))
    return "".join(g)


def sierra(y, seed, fill, amp, opacity=1.0):
    """The Guadarrama line: jagged, not rolling."""
    r = random.Random(seed)
    pts = [f"M-60,{y + amp * 0.6:.0f}"]
    x = -60.0
    while x < W + 60:
        x += r.uniform(70, 170)
        pts.append(f"L{x:.0f},{y - r.uniform(0.2, 1.0) * amp:.0f}")
    pts.append(f"L{W + 60},{H} L-60,{H} Z")
    return f'<path d="{" ".join(pts)}" fill="{fill}" opacity="{opacity}"/>'


def rooftops(y, seed, fill, window, tiles=True):
    """The near roofline: gables, chimneys, aerials — Madrid seen from a terrace."""
    r = random.Random(seed)
    out, x = [], -70.0
    while x < W + 70:
        w = r.uniform(120, 240)
        h = r.uniform(120, 260)
        out.append(box(x, y, w, h, fill))
        if tiles and r.random() < 0.55:  # a pitched roof over the block
            out.append(tri(x + w / 2, y - h, w * 1.06, r.uniform(30, 62), fill))
        for _ in range(r.randrange(0, 3)):  # chimneys
            cx = x + r.uniform(0.1, 0.85) * w
            ch = r.uniform(26, 58)
            out.append(box(cx, y - h - (10 if tiles else 0), r.uniform(16, 30), ch, fill))
        if r.random() < 0.4:  # a TV aerial
            ax, ah = x + r.uniform(0.2, 0.8) * w, r.uniform(40, 70)
            out.append(f'<path d="M{ax:.0f},{y - h:.0f} l0,{-ah:.0f}" stroke="{fill}" stroke-width="4"/>')
            for k in range(3):
                yy = y - h - ah + 6 + k * 12
                out.append(f'<path d="M{ax - 14:.0f},{yy:.0f} l28,0" stroke="{fill}" stroke-width="3"/>')
        out.append(windows(x + w * 0.1, y - 12, w * 0.8, h * 0.62, r.randrange(4, 6), r.randrange(3, 5), window, r.randrange(9999), lit=0.34))
        x += w + r.uniform(-10, 26)
    return "".join(out)


# ── Scenes ──────────────────────────────────────────────────────────────────
#
# Composed for the language screen, not as standalone art. The screen puts a title
# and a flag at the top, a speech bubble under it, the mascot down the middle, and
# chips plus a button at the bottom — so this file keeps those bands quiet:
#
#   0.00–0.38   sky only (title, flag, arrows, speech bubble)
#   0.38–0.72   landmarks pushed to the left and right thirds, glow behind centre
#   0.66–0.72   the horizon, so the mascot stands on ground rather than on a roof
#   0.72–0.86   open ground (the mascot's feet and shadow)
#   0.86–1.00   flat tone, no detail (level chips, primary button)

HORIZON = 0.705       # where the ground starts
BAND = 0.655          # where the city stands
CENTRE = (0.30, 0.70)  # the column the mascot occupies — keep it clear


def sky_defs(p):
    stops = "".join(f'<stop offset="{o}" stop-color="{c}"/>' for c, o in p["sky"])
    g0, g1 = p["ground"]
    return f"""
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">{stops}</linearGradient>
    <radialGradient id="halo" cx="50%" cy="50%">
      <stop offset="0%" stop-color="{p['halo']}" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="{p['halo']}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="50%">
      <stop offset="0%" stop-color="{p['glow']}" stop-opacity="0.55"/>
      <stop offset="62%" stop-color="{p['glow']}" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="{p['glow']}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="{p['haze']}" stop-opacity="0"/>
      <stop offset="100%" stop-color="{p['haze']}" stop-opacity="0.85"/>
    </linearGradient>
    <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="{g0}"/>
      <stop offset="100%" stop-color="{g1}"/>
    </linearGradient>
    <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="{(p.get('water') or [g0, g1])[0]}"/>
      <stop offset="100%" stop-color="{(p.get('water') or [g0, g1])[1]}"/>
    </linearGradient>
    """


def sky(p, g):
    """Sky, sun, a couple of high clouds — all kept out of the speech-bubble band."""
    g.append(f'<rect width="{W}" height="{H}" fill="url(#sky)"/>')
    sx, sy = W * p["sun_pos"][0], H * p["sun_pos"][1]
    r = p["sun_r"]
    g.append(f'<circle cx="{sx:.0f}" cy="{sy:.0f}" r="{r * 3.6:.0f}" fill="url(#halo)"/>')
    g.append(f'<circle cx="{sx:.0f}" cy="{sy:.0f}" r="{r}" fill="{p["sun"]}"/>')
    for i, (cx, cy, w) in enumerate(((W * 0.20, H * 0.075, 560), (W * 0.83, H * 0.135, 430),
                                     (W * 0.14, H * 0.215, 330))):
        g.append(cloud_band(cx, cy, w, p["cloud"][0], p["cloud"][1] * (1 - i * 0.15), 5 + i))
    g.append(birds(3, p["bird"], H * 0.10, H * 0.30))


def ground(p, g):
    """Open ground for the mascot, flattening to a plain tone under the button."""
    y = H * HORIZON
    g.append(f'<rect y="{y:.0f}" width="{W}" height="{H - y:.0f}" fill="url(#ground)"/>')
    # A soft pool of light where the mascot stands, so the silhouette separates.
    g.append(
        f'<ellipse cx="{W * 0.5:.0f}" cy="{H * 0.60:.0f}" rx="{W * 0.55:.0f}" ry="{H * 0.17:.0f}" fill="url(#glow)"/>'
    )


def centre_is_clear(x, w=0.0):
    """True when a piece at x (0–1) stays out of the mascot's column."""
    return x + w / 2 < CENTRE[0] or x - w / 2 > CENTRE[1]


def london():
    p = CITIES["london"]
    g = []
    sky(p, g)

    band = H * BAND
    g.append(f'<rect y="{band - 460:.0f}" width="{W}" height="500" fill="url(#haze)"/>')

    # Far band: the City, hazed back and kept to the right where the mascot is not.
    g.append(f'<g opacity="0.75">{skyline_fill(band, 11, p["far"], 60, 170)}</g>')
    g.append(f'<g opacity="0.8">{shard(W * 0.93, band, 0.52, p["far"])}</g>')
    g.append(f'<g opacity="0.8">{gherkin(W * 0.72, band, 0.44, p["far"])}</g>')

    # Mid band: Westminster and Big Ben left, the Eye right, low blocks between them.
    mid = H * 0.685
    g.append(f'<g opacity="0.95">{skyline_fill(mid, 21, p["mid"], 40, 96)}</g>')
    g.append(london_eye(W * 0.83, mid - 215, 172, p["landmark"]))
    g.append(westminster(W * 0.10, mid, 0.52, p["landmark"], p["window"]))
    g.append(big_ben(W * 0.085, mid, 0.58, p["landmark"], p["sky"][0][0]))

    # A sliver of the Thames along the foot of the city, then the embankment.
    river_top = H * 0.678
    g.append(f'<rect y="{river_top:.0f}" width="{W}" height="{H * HORIZON - river_top:.0f}" fill="url(#water)"/>')
    r = random.Random(8)
    for _ in range(22):
        g.append(
            f'<rect x="{r.uniform(-40, W):.0f}" y="{r.uniform(river_top + 6, H * HORIZON - 8):.0f}" '
            f'width="{r.uniform(50, 220):.0f}" height="3" rx="1.5" fill="{p["far"]}" opacity="{r.uniform(0.12, 0.3):.2f}"/>'
        )
    ground(p, g)

    # Embankment edge: a low balustrade, faded so it never competes with the mascot.
    y = H * HORIZON
    g.append(f'<rect y="{y:.0f}" width="{W}" height="8" fill="{p["near"]}" opacity="0.35"/>')
    rail = H * 0.80                       # below the mascot's feet, not behind them
    g.append(f'<g opacity="0.42">{box(0, rail, W, 12, p["near"])}')
    for i in range(30):
        g.append(box(-14 + i * 42, rail, 12, 34, p["near"]))
    g.append("</g>")
    # One red bus, parked left of the mascot — the single spot of colour.
    g.append(f'<g opacity="0.92">{bus(W * 0.09, rail + 96, 0.7, "#c8102e", p["window"])}</g>')
    g.append(f'<g opacity="0.5">{street_lamp(W * 0.90, rail + 22, 0.52, p["near"])}</g>')
    return g


def madrid():
    p = CITIES["madrid"]
    g = []
    sky(p, g)

    # The Sierra, low and soft, behind everything.
    sier = H * 0.615
    g.append(f'<rect y="{sier - 420:.0f}" width="{W}" height="460" fill="url(#haze)"/>')
    g.append(sierra(sier, 6, p["far"], 118, 0.5))

    band = H * BAND
    g.append(f'<g opacity="0.55">{cuatro_torres(W * 0.66, band, 0.42, p["mid"])}</g>')
    g.append(f'<g opacity="0.8">{skyline_fill(band, 13, p["far"], 50, 150)}</g>')

    # Mid band: Metropolis left, the Alcalá gate right, low roofs across the middle.
    mid = H * 0.69
    g.append(f'<g opacity="0.95">{skyline_fill(mid, 27, p["mid"], 36, 88)}</g>')
    g.append(metropolis(W * 0.145, mid, 0.66, p["landmark"], p["window"]))
    g.append(alcala(W * 0.845, mid, 0.58, p["landmark"]))

    ground(p, g)

    # A low terrace wall at the edge of the plaza, and one lamp far right.
    y = H * HORIZON
    g.append(f'<rect y="{y:.0f}" width="{W}" height="8" fill="{p["near"]}" opacity="0.3"/>')
    rail = H * 0.80
    g.append(f'<g opacity="0.4">{box(0, rail, W, 14, p["near"])}')
    for i in range(28):
        g.append(box(-16 + i * 44, rail, 14, 36, p["near"]))
    g.append("</g>")
    g.append(f'<g opacity="0.55">{street_lamp(W * 0.90, rail + 26, 0.54, p["near"])}</g>')
    return g


def scene(city):
    p = CITIES[city]
    g = london() if city == "london" else madrid()
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">'
        f'<defs>{sky_defs(p)}</defs>{"".join(g)}</svg>'
    )


def render(city):
    svg_path = HERE / f"{city}.svg"
    png_path = HERE / f"{city}.png"
    svg_path.write_text(scene(city), encoding="utf-8")
    from playwright.sync_api import sync_playwright

    with sync_playwright() as pw:
        browser = pw.chromium.launch(channel="chrome")
        page = browser.new_page(viewport={"width": W, "height": H})
        page.goto(svg_path.as_uri())
        page.screenshot(path=str(png_path))
        browser.close()
    print(png_path)
    return png_path


if __name__ == "__main__":
    for city in sys.argv[1:] or list(CITIES):
        render(city)
