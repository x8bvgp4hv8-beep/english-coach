"""
Savanna wallpaper for Coachirinho — one landscape, three skins.

The scene is drawn once, procedurally, and painted with the token palette of each
app theme (cartoon / minimal / night) so a wallpaper never fights the UI on top of
it. Output is a phone-shaped PNG (1179x2556, the 9:19.5 of a modern iPhone) plus
the SVG it came from, so the art stays editable.

    python3 generate.py            # all three themes
    python3 generate.py night      # one theme
"""

import math
import random
import subprocess
import sys
from pathlib import Path

W, H = 1179, 2556
HERE = Path(__file__).parent

# ── Palettes ────────────────────────────────────────────────────────────────
# Each key maps to the layer it paints, taking its colours from the theme tokens
# in web/src/kit/kit.css and web/src/app/styles.css.

THEMES = {
    "cartoon": {
        "sky": [("#ffe2b2", 0.0), ("#ffcf8d", 0.34), ("#fbb06a", 0.60), ("#f28c4e", 1.0)],
        "sun": "#ffc247",
        "sun_ring": "#241e1a",
        "halo": "#ffc978",
        "hills": ["#f2a664", "#e2833f"],
        "ground": ["#c96c2e", "#a2501f"],
        "ink": "#241e1a",
        "far_ink": "#8a4a22",
        "outline": "#241e1a",
        "outline_w": 5,
        "stars": None,
        "grain": 0.05,
        "bird": "#241e1a",
        "haze": "#ffe0b0",
        "cloud": ("#fff3dc", 0.5),
    },
    "minimal": {
        "sky": [("#fbfbfd", 0.0), ("#f7f5f3", 0.5), ("#f3ece2", 0.8), ("#efe4d4", 1.0)],
        "sun": "#e59a2b",
        "sun_ring": None,
        "halo": "#f6dcae",
        "hills": ["#e9e6ef", "#ded9ea"],
        "ground": ["#ebe3d6", "#e2d7c5"],
        "ink": "#14121f",
        "far_ink": "#86839a",
        "outline": None,
        "outline_w": 0,
        "stars": None,
        "grain": 0.0,
        "bird": "#86839a",
        "haze": "#fbfbfd",
        "cloud": ("#ffffff", 0.75),
    },
    "night": {
        "sky": [("#2b2465", 0.0), ("#221c53", 0.35), ("#17123c", 0.66), ("#0f0d25", 1.0)],
        "sun": "#efeefb",
        "sun_ring": None,
        "halo": "#7b6ff0",
        "hills": ["#1b1547", "#141034"],
        "ground": ["#0d0a24", "#08061a"],
        "ink": "#05040f",
        "far_ink": "#241d55",
        "outline": None,
        "outline_w": 0,
        "stars": "#efeefb",
        "grain": 0.03,
        "bird": "#1e1850",
        "haze": "#58c8f0",
        "cloud": None,
    },
}

# ── Geometry helpers ────────────────────────────────────────────────────────


def smooth_path(points, close_to=None):
    """Catmull-Rom through `points`, emitted as cubic beziers."""
    d = f"M{points[0][0]:.1f},{points[0][1]:.1f}"
    for i in range(len(points) - 1):
        p0 = points[i - 1] if i > 0 else points[i]
        p1, p2 = points[i], points[i + 1]
        p3 = points[i + 2] if i + 2 < len(points) else p2
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d += f" C{c1[0]:.1f},{c1[1]:.1f} {c2[0]:.1f},{c2[1]:.1f} {p2[0]:.1f},{p2[1]:.1f}"
    if close_to is not None:
        d += f" L{W},{close_to} L0,{close_to} Z"
    return d


def ridge(y, amp, bumps, seed, close_to=H):
    """A horizon line: soft dunes rather than mountains."""
    r = random.Random(seed)
    pts = []
    n = bumps
    for i in range(n + 1):
        x = -80 + (W + 160) * i / n
        wave = math.sin(i / n * math.pi * 2.2 + seed) * amp
        pts.append((x, y + wave + r.uniform(-amp * 0.35, amp * 0.35)))
    return smooth_path(pts, close_to)


# ── Scene pieces ────────────────────────────────────────────────────────────


def canopy_path(cx, cy, w, h, seed=0, bumps=4, sag=0.16):
    """
    The umbrella: a lens, not a slab. The top is a lumpy dome, the underside is
    almost straight, and the two meet at thin edges — which is what makes a crown
    read as an acacia rather than a mushroom cap.
    """
    r = random.Random(seed)
    l, rr = cx - w / 2, cx + w / 2
    pts = [(l, cy)]
    for i in range(1, bumps):
        t = i / bumps
        lift = h * (0.62 + 0.44 * math.sin(t * math.pi) ** 0.6) * r.uniform(0.9, 1.08)
        pts.append((l + w * t, cy - lift))
    pts.append((rr, cy))
    d = smooth_path(pts)
    d += (
        f" C{cx + w * 0.24:.1f},{cy + h * sag:.1f} {cx - w * 0.24:.1f},{cy + h * sag:.1f} {l:.1f},{cy:.1f} Z"
    )
    return d


def acacia(x, y, s, fill, seed, outline=None, ow=0):
    """An umbrella thorn: a slim trunk that forks, limbs that fan into a flat crown."""
    r = random.Random(seed)
    h = 330 * s                      # trunk height
    lean = r.uniform(-0.06, 0.06)
    fork_y = y - h * 0.46            # where the trunk splits
    top = y - h
    tip_x = x + h * lean
    cw, ch = 540 * s, 92 * s         # crown width / height — flat, and wider than tall
    cy = top - ch * 0.10
    parts = []

    trunk = (
        f"M{x - 13 * s:.1f},{y:.1f} "
        f"C{x - 10 * s:.1f},{y - h * 0.3:.1f} {x - 8 * s:.1f},{fork_y:.1f} {tip_x - 5 * s:.1f},{fork_y - h * 0.12:.1f} "
        f"L{tip_x + 5 * s:.1f},{fork_y - h * 0.12:.1f} "
        f"C{x + 9 * s:.1f},{fork_y:.1f} {x + 11 * s:.1f},{y - h * 0.28:.1f} {x + 15 * s:.1f},{y:.1f} Z"
    )
    parts.append(f'<path d="{trunk}" fill="{fill}"/>')

    # Limbs fan out of the fork and carry the crown — the gap under them is the
    # whole silhouette, so they stay visible below the foliage.
    for dx, reach in ((-1, 0.40), (1, 0.42), (-0.34, 0.15), (0.38, 0.17)):
        ex = tip_x + dx * cw * reach
        parts.append(
            f'<path d="M{tip_x:.1f},{fork_y - h * 0.08:.1f} '
            f"Q{tip_x + dx * cw * reach * 0.35:.1f},{top + h * 0.06:.1f} {ex:.1f},{cy + ch * 0.06:.1f}\" "
            f'fill="none" stroke="{fill}" stroke-width="{max(2.2, 8 * s):.1f}" stroke-linecap="round"/>'
        )

    parts.append(f'<path d="{canopy_path(tip_x, cy, cw, ch)}" fill="{fill}"/>')
    # A shallow second tier, offset, so the top edge is stepped rather than domed.
    parts.append(
        f'<path d="{canopy_path(tip_x + cw * r.uniform(-0.14, 0.14), cy - ch * 0.46, cw * 0.52, ch * 0.52)}" fill="{fill}"/>'
    )
    # A clump that hangs slightly apart, the way a real crown breaks against the sky.
    parts.append(
        f'<path d="{canopy_path(tip_x + cw * r.choice((-0.46, 0.48)), cy + ch * 0.30, cw * 0.22, ch * 0.34)}" fill="{fill}"/>'
    )
    return f"<g>{''.join(parts)}</g>"


def giraffe(x, y, s, fill, flip=False):
    """Silhouette read from the shape everyone knows: legs, barrel, long neck."""
    t = f"translate({x:.1f},{y:.1f}) scale({-s if flip else s:.3f},{s:.3f})"
    body = [
        # legs, front pair slightly ahead of the back pair
        '<path d="M-38,-72 L-26,-72 L-22,0 L-34,0 Z"/>',
        '<path d="M-14,-74 L-2,-74 L-4,0 L-16,0 Z"/>',
        '<path d="M28,-74 L40,-74 L44,0 L32,0 Z"/>',
        '<path d="M50,-70 L62,-70 L68,0 L56,0 Z"/>',
        # barrel + rump
        '<path d="M-46,-96 C-46,-124 -20,-134 10,-134 C40,-134 58,-126 62,-104 '
        'C64,-90 52,-70 30,-70 L-14,-70 C-36,-70 -46,-80 -46,-96 Z"/>',
        # neck
        '<path d="M44,-118 C52,-152 62,-186 74,-214 L98,-208 C90,-176 82,-140 74,-108 Z"/>',
        # head + horns
        '<path d="M72,-214 C78,-224 96,-234 108,-230 C118,-227 120,-216 112,-210 '
        'C104,-204 86,-202 76,-206 Z"/>',
        '<path d="M84,-228 L82,-242 L90,-242 L92,-227 Z"/>',
        '<path d="M96,-231 L96,-244 L104,-243 L104,-230 Z"/>',
        # tail
        '<path d="M-44,-120 C-56,-108 -60,-92 -58,-76" fill="none" stroke-width="5" stroke-linecap="round"/>',
        '<ellipse cx="-58" cy="-70" rx="5" ry="9"/>',
    ]
    return f'<g transform="{t}" fill="{fill}" stroke="{fill}">{"".join(body)}</g>'


def antelope(x, y, s, fill, flip=False):
    t = f"translate({x:.1f},{y:.1f}) scale({-s if flip else s:.3f},{s:.3f})"
    body = [
        '<path d="M-30,-40 L-23,-40 L-21,0 L-28,0 Z"/>',
        '<path d="M-12,-40 L-5,-40 L-6,0 L-13,0 Z"/>',
        '<path d="M16,-40 L23,-40 L25,0 L18,0 Z"/>',
        '<path d="M30,-38 L37,-38 L40,0 L33,0 Z"/>',
        '<path d="M-36,-54 C-36,-72 -18,-80 4,-80 C26,-80 40,-74 42,-60 '
        'C43,-50 34,-38 18,-38 L-16,-38 C-30,-38 -36,-46 -36,-54 Z"/>',
        '<path d="M32,-70 C38,-88 44,-100 50,-110 L62,-106 C56,-92 50,-76 46,-62 Z"/>',
        '<path d="M48,-110 C54,-118 68,-122 74,-118 C79,-114 76,-106 68,-104 C60,-102 52,-104 48,-110 Z"/>',
        '<path d="M54,-120 C58,-138 60,-150 56,-162" fill="none" stroke-width="4" stroke-linecap="round"/>',
        '<path d="M64,-119 C70,-136 74,-148 72,-160" fill="none" stroke-width="4" stroke-linecap="round"/>',
        '<path d="M-34,-70 C-44,-64 -48,-52 -46,-42" fill="none" stroke-width="4" stroke-linecap="round"/>',
    ]
    return f'<g transform="{t}" fill="{fill}" stroke="{fill}">{"".join(body)}</g>'


def grass(x, y, s, fill, seed, blades=7):
    """A tuft, not a scatter: blades rise from one point and lean the same way."""
    r = random.Random(seed)
    lean = r.choice((-1, 1)) * r.uniform(0.10, 0.30)
    out = []
    for i in range(blades):
        spread = (i / max(1, blades - 1) - 0.5) * 2          # -1 … 1 across the tuft
        dx = spread * 16 * s
        h = (74 - abs(spread) * 26) * s * r.uniform(0.82, 1.12)
        bend = (spread * 0.55 + lean) * h
        out.append(
            f'<path d="M{x + dx:.1f},{y:.1f} Q{x + dx + bend * 0.25:.1f},{y - h * 0.62:.1f} '
            f'{x + dx + bend:.1f},{y - h:.1f}" fill="none" stroke="{fill}" '
            f'stroke-width="{max(1.6, 5.5 * s):.1f}" stroke-linecap="round"/>'
        )
    return "".join(out)


def clouds(seed, fill, opacity):
    """Long, low, flat-bottomed bands — savanna sky, not cotton wool."""
    r = random.Random(seed)
    out = []
    for cx, cy, w, o in ((W * 0.30, H * 0.115, 620, 1.0), (W * 0.74, H * 0.185, 460, 0.75),
                         (W * 0.22, H * 0.255, 380, 0.55), (W * 0.66, H * 0.33, 300, 0.4)):
        h = w * r.uniform(0.10, 0.14)
        out.append(f'<path d="{canopy_path(cx, cy, w, h)}" fill="{fill}" opacity="{opacity * o:.2f}"/>')
    return "".join(out)


def birds(seed, fill):
    r = random.Random(seed)
    out = []
    for i in range(6):
        x = r.uniform(W * 0.12, W * 0.9)
        y = r.uniform(H * 0.10, H * 0.28)
        s = r.uniform(0.5, 1.0)
        out.append(
            f'<path transform="translate({x:.0f},{y:.0f}) scale({s:.2f})" '
            f'd="M-26,0 q13,-14 26,-2 q13,-12 26,2" fill="none" stroke="{fill}" '
            f'stroke-width="4.5" stroke-linecap="round" opacity="{r.uniform(0.35, 0.7):.2f}"/>'
        )
    return "".join(out)


def stars(seed, fill):
    r = random.Random(seed)
    out = []
    for _ in range(150):
        x, y = r.uniform(0, W), r.uniform(0, H * 0.52)
        rad = r.uniform(1.2, 3.4)
        fade = 1 - (y / (H * 0.52)) ** 0.7
        out.append(
            f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{rad:.1f}" fill="{fill}" '
            f'opacity="{max(0.05, r.uniform(0.25, 0.95) * fade):.2f}"/>'
        )
    # A thin scatter of brighter ones, so the sky has a few anchors.
    for _ in range(9):
        x, y = r.uniform(0, W), r.uniform(H * 0.04, H * 0.36)
        out.append(
            f'<circle cx="{x:.0f}" cy="{y:.0f}" r="4.6" fill="{fill}" opacity="0.9"/>'
            f'<circle cx="{x:.0f}" cy="{y:.0f}" r="14" fill="{fill}" opacity="0.10"/>'
        )
    return "".join(out)


# ── The scene ───────────────────────────────────────────────────────────────


def scene(name):
    p = THEMES[name]
    night = name == "night"
    horizon = H * 0.545
    ink, far_ink = p["ink"], p["far_ink"]
    ol, ow = p["outline"], p["outline_w"]
    # A low sun setting into the far ridge; at night a small moon high up instead.
    sun_x = W * (0.72 if night else 0.60)
    sun_y = H * 0.20 if night else horizon - 118
    sun_r = 86 if night else 232

    stops = "".join(f'<stop offset="{o}" stop-color="{c}"/>' for c, o in p["sky"])
    defs = f"""
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">{stops}</linearGradient>
    <radialGradient id="halo" cx="50%" cy="50%">
      <stop offset="0%" stop-color="{p['halo']}" stop-opacity="{0.55 if night else 0.75}"/>
      <stop offset="100%" stop-color="{p['halo']}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="{p['haze']}" stop-opacity="0"/>
      <stop offset="100%" stop-color="{p['haze']}" stop-opacity="{0.30 if night else 0.55}"/>
    </linearGradient>
    <radialGradient id="vignette" cx="50%" cy="42%" r="78%">
      <stop offset="55%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="{0.30 if night else 0.10}"/>
    </radialGradient>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3"/>
      <feColorMatrix type="saturate" values="0"/></filter>
    <filter id="soft"><feGaussianBlur stdDeviation="26"/></filter>
    """

    g = [f'<rect width="{W}" height="{H}" fill="url(#sky)"/>']

    if night:
        g.append(stars(7, p["stars"]))
    if p["cloud"]:
        g.append(clouds(5, p["cloud"][0], p["cloud"][1]))

    g.append(f'<circle cx="{sun_x:.0f}" cy="{sun_y:.0f}" r="{sun_r * (3.2 if not night else 4.4):.0f}" fill="url(#halo)"/>')
    g.append(f'<circle cx="{sun_x:.0f}" cy="{sun_y:.0f}" r="{sun_r}" fill="{p["sun"]}"/>')
    if night:
        # A bite out of the disc turns the sun into a moon.
        g.append(
            f'<circle cx="{sun_x + 40:.0f}" cy="{sun_y - 28:.0f}" r="{sun_r * 0.9:.0f}" '
            f'fill="{p["sky"][0][0]}"/>'
        )

    if p["sun_ring"]:
        g.append(
            f'<circle cx="{sun_x:.0f}" cy="{sun_y:.0f}" r="{sun_r}" fill="none" '
            f'stroke="{p["sun_ring"]}" stroke-width="{ow}"/>'
        )

    g.append(birds(3, p["bird"]))
    g.append(f'<rect y="{horizon - 420:.0f}" width="{W}" height="520" fill="url(#haze)"/>')

    # Far ridge — the sun sinks behind it, which is what puts the eye on the horizon.
    g.append(f'<path d="{ridge(horizon, 26, 5, 1.4)}" fill="{p["hills"][0]}"/>')
    if ol:
        g.append(f'<path d="{ridge(horizon, 26, 5, 1.4)}" fill="none" stroke="{ol}" stroke-width="{ow}"/>')
    far_trees = []
    r = random.Random(21)
    for x in (60, 210, 330, 520, 690, 790, 960, 1120):
        far_trees.append(acacia(x + r.uniform(-30, 30), horizon + r.uniform(6, 30), r.uniform(0.11, 0.17), far_ink, x))
    g.append(f'<g opacity="{0.8 if night else 0.5}">{"".join(far_trees)}</g>')

    # Middle plain: the herd, kept clear of the trees so every silhouette reads.
    mid = horizon + 190
    g.append(f'<path d="{ridge(mid, 34, 4, 2.7)}" fill="{p["hills"][1]}"/>')
    if ol:
        g.append(f'<path d="{ridge(mid, 34, 4, 2.7)}" fill="none" stroke="{ol}" stroke-width="{ow}"/>')

    shadow = 0.16 if not night else 0.28
    def footing(x, y, w):
        return f'<ellipse cx="{x:.0f}" cy="{y:.0f}" rx="{w:.0f}" ry="{w * 0.16:.0f}" fill="{ink}" opacity="{shadow}"/>'

    herd = [
        (giraffe, W * 0.44, mid + 112, 0.60, False),
        (giraffe, W * 0.56, mid + 136, 0.44, True),
        (antelope, W * 0.70, mid + 128, 0.38, True),
        (antelope, W * 0.785, mid + 144, 0.32, True),
    ]
    for fn, hx, hy, hs, flip in herd:
        g.append(footing(hx + 8 * hs, hy, 60 * hs))
        g.append(fn(hx, hy, hs, ink, flip=flip))
    g.append(acacia(W * 0.95, mid + 92, 0.30, ink, 5))
    g.append(acacia(W * 0.04, mid + 116, 0.26, ink, 17))

    # Foreground: the ground the phone stands on.
    near = H * 0.80
    g.append(f'<path d="{ridge(near, 40, 3, 4.1)}" fill="{p["ground"][0]}"/>')
    if ol:
        g.append(f'<path d="{ridge(near, 40, 3, 4.1)}" fill="none" stroke="{ol}" stroke-width="{ow}"/>')

    # The hero tree, off-centre, breaking every ridge line behind it.
    g.append(footing(W * 0.20, near + 74, 150))
    g.append(acacia(W * 0.19, near + 72, 1.0, ink, 9))

    g.append(f'<path d="{ridge(H * 0.93, 34, 3, 5.3)}" fill="{p["ground"][1]}"/>')
    if ol:
        g.append(f'<path d="{ridge(H * 0.93, 34, 3, 5.3)}" fill="none" stroke="{ol}" stroke-width="{ow}"/>')

    # Grass sits along the two near ridges only, thinning upward, dense at the very bottom.
    tufts = []
    r = random.Random(33)
    for band_y, count, lo, hi in ((near + 26, 8, 0.5, 0.85), (H * 0.945, 14, 0.85, 1.6)):
        for i in range(count):
            x = -50 + (W + 100) * (i + r.uniform(0.05, 0.95)) / count
            y = band_y + r.uniform(-18, 52)
            tufts.append(grass(x, y, r.uniform(lo, hi), ink, r.randrange(9999), blades=r.choice((5, 6, 7, 9))))
            if r.random() < 0.45:  # a smaller neighbour, so tufts read as clumps
                tufts.append(grass(x + r.uniform(-90, 90), y + r.uniform(6, 40),
                                   r.uniform(lo * 0.5, hi * 0.6), ink, r.randrange(9999), blades=5))
    g.append("".join(tufts))

    g.append(f'<rect width="{W}" height="{H}" fill="url(#vignette)"/>')
    if p["grain"]:
        g.append(f'<rect width="{W}" height="{H}" filter="url(#grain)" opacity="{p["grain"]}" style="mix-blend-mode:multiply"/>')

    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" '
        f'viewBox="0 0 {W} {H}"><defs>{defs}</defs>{"".join(g)}</svg>'
    )


def render(name):
    svg_path = HERE / f"savanna-{name}.svg"
    png_path = HERE / f"savanna-{name}.png"
    svg_path.write_text(scene(name), encoding="utf-8")

    from playwright.sync_api import sync_playwright

    with sync_playwright() as pw:
        browser = pw.chromium.launch(channel="chrome")
        page = browser.new_page(viewport={"width": W, "height": H})
        page.goto(svg_path.as_uri())
        page.screenshot(path=str(png_path))
        browser.close()
    print(f"{png_path}")
    return png_path


if __name__ == "__main__":
    wanted = sys.argv[1:] or list(THEMES)
    for theme in wanted:
        render(theme)
