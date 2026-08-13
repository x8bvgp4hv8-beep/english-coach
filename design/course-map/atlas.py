"""
The background of the course map — drawn as a map.

Nothing here is borrowed from the phone wallpapers next door, and that is the
point: a wallpaper is a landscape seen from the ground, and a course map is
territory seen from above. Different projection, different vocabulary, drawn
from scratch — parcels of field, groves, a river, roads, contour lines, the
faint graticule of a printed map.

One file per language, and one file only: the strip loops seamlessly top to
bottom, so the route can be thirty blocks or three hundred.

    <land>.svg / .png   1179 x 3540, tiling vertically

The loop is periodic by construction, not by fading:

  * the river and the roads are sine functions of y with a whole number of
    waves over the height, so they leave the bottom edge exactly where they
    enter the top one;
  * the graticule spacing divides the height;
  * everything else is drawn three times — at -H, 0 and +H — so any parcel
    that crosses an edge finishes on the other side.

The route of lesson nodes runs down the middle, so the middle third carries
only pale ground: no blocks, no contour lines, nothing with an edge that could
be mistaken for a UI line under the labels.

    python3 atlas.py            # both
    python3 atlas.py meseta     # one
"""

import math
import random
import sys
from pathlib import Path

W, H = 1179, 3540
HERE = Path(__file__).parent
LANE = (0.30, 0.70)      # the corridor the nodes and their labels occupy
LITE = False             # the embeddable cut: fewer marks, whole-pixel coordinates

# ── Palettes ────────────────────────────────────────────────────────────────
#
# Named for the country the course is in rather than for a city: this is land,
# not a skyline. Every tone sits within a few steps of the canvas, because the
# lesson titles are ink on top of it.

LANDS = {
    "downs": {                      # English: chalk downland, hedged fields, a slow river
        "canvas": "#eef1f6",
        "grid": "#e2e7ef",
        "fields": ["#e4eae4", "#dfe7e6", "#e7ebe4", "#dde5e8"],
        "hedge": "#c2d0c8",
        "grove": "#bdd0c2",
        "water": "#d9e4f4",
        "shore": "#c7d5ec",
        "blocks": "#dfe4ee",
        "block_edge": "#ccd3e2",
        "road": "#e8ebf1",
        "lane": "#dde2ec",
        "contour": "#d3dbe8",
        "accent": "#cf7f83",        # a few tile roofs, the only warm thing on the sheet
    },
    "meseta": {                     # Spanish: dry plateau, olive rows, a shallow river
        "canvas": "#faf2e8",
        "grid": "#f0e6d8",
        "fields": ["#f3e8d6", "#efe3cd", "#f4ecdc", "#ece2ce"],
        "hedge": "#d3c3a2",
        "grove": "#cfc9a0",
        "water": "#e6e8dd",
        "shore": "#d8dcca",
        "blocks": "#f1e2cf",
        "block_edge": "#e2cdb2",
        "road": "#f5ecdf",
        "lane": "#eee0cc",
        "contour": "#e6d6be",
        "accent": "#d08a63",
    },
}


# ── Ground ──────────────────────────────────────────────────────────────────


def graticule(p):
    """The printed grid. 1179 / 6 and 3540 / 12 both land on whole pixels, so the
    lines meet across the loop."""
    out = []
    for i in range(1, 6):
        x = W * i / 6
        out.append(f'<line x1="{x:.0f}" y1="0" x2="{x:.0f}" y2="{H}" stroke="{p["grid"]}" stroke-width="1"/>')
    for j in range(12):
        y = H * j / 12
        out.append(f'<line x1="0" y1="{y:.0f}" x2="{W}" y2="{y:.0f}" stroke="{p["grid"]}" stroke-width="1"/>')
    return f'<g opacity="0.55">{"".join(out)}</g>'


def wave(cx, amp, waves, phase, samples=96):
    """A vertical meander as a function of y — periodic over the height, so it
    crosses the seam without a join."""
    samples = 40 if LITE else samples
    pts = []
    for i in range(samples + 1):
        y = H * i / samples
        x = cx + amp * math.sin(2 * math.pi * waves * y / H + phase)
        pts.append((x, y))
    d = f"M{pts[0][0]:.1f},{pts[0][1]:.1f}"
    for i in range(1, len(pts)):
        x0, y0 = pts[i - 1]
        x1, y1 = pts[i]
        d += f" C{x0:.1f},{y0 + (y1 - y0) / 3:.1f} {x1:.1f},{y1 - (y1 - y0) / 3:.1f} {x1:.1f},{y1:.1f}"
    return d


def river(p, cx, amp, waves, width, phase=0.0):
    """Water: a wide soft band, a darker shore line, and hatching on one bank —
    the way a river is inked on a paper map."""
    d = wave(cx, amp, waves, phase)
    g = [f'<path d="{d}" fill="none" stroke="{p["water"]}" stroke-width="{width}" stroke-linecap="round"/>']
    # Bank hatching: short ticks along the wave, drawn from sampled normals.
    ticks = []
    n_ticks = 44 if LITE else 120
    for i in range(0, n_ticks):
        y = H * i / n_ticks
        x = cx + amp * math.sin(2 * math.pi * waves * y / H + phase)
        dx = amp * math.cos(2 * math.pi * waves * y / H + phase) * (2 * math.pi * waves / H)
        nx, ny = 1 / math.hypot(1, dx), -dx / math.hypot(1, dx)
        x0 = x + nx * width * 0.5
        y0 = y + ny * width * 0.5
        ticks.append(
            f'<line x1="{x0:.1f}" y1="{y0:.1f}" x2="{x0 + nx * 13:.1f}" y2="{y0 + ny * 13:.1f}" '
            f'stroke="{p["shore"]}" stroke-width="2"/>'
        )
    g.append(f'<g opacity="0.45">{"".join(ticks)}</g>')
    return "".join(g)


def road(p, cx, amp, waves, width, phase, colour, dash=None):
    d = wave(cx, amp, waves, phase)
    da = f' stroke-dasharray="{dash}"' if dash else ""
    return (
        f'<path d="{d}" fill="none" stroke="{colour}" stroke-width="{width}" '
        f'stroke-linecap="round"{da}/>'
    )


# ── Parcels ─────────────────────────────────────────────────────────────────


def parcel(cx, cy, w, h, fill, seed, rot=0.0, edge=None):
    """A field: a closed figure with slightly crooked sides, the way land is
    actually divided. Straight enough to read as a boundary, never a rectangle."""
    r = random.Random(seed)
    pts = []
    n = r.randrange(5, 8)
    for i in range(n):
        a = 2 * math.pi * i / n + r.uniform(-0.15, 0.15)
        rx, ry = w / 2 * r.uniform(0.82, 1.0), h / 2 * r.uniform(0.82, 1.0)
        pts.append((math.cos(a) * rx, math.sin(a) * ry))
    d = "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + " Z"
    stroke = f' stroke="{edge}" stroke-width="2.5"' if edge else ""
    return (
        f'<path transform="translate({cx:.0f},{cy:.0f}) rotate({rot:.0f})" d="{d}" '
        f'fill="{fill}"{stroke}/>'
    )


def grove(cx, cy, rx, ry, fill, seed, n=26):
    """Woodland from above: a scatter of little crowns, denser in the middle."""
    n = max(10, n // 2) if LITE else n
    r = random.Random(seed)
    out = []
    for _ in range(n):
        a, t = r.uniform(0, 2 * math.pi), math.sqrt(r.random())
        x, y = cx + math.cos(a) * rx * t, cy + math.sin(a) * ry * t
        out.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r.uniform(9, 17):.1f}" fill="{fill}"/>')
    return "".join(out)


def orchard(cx, cy, w, h, fill, seed, rot=0.0, step=34):
    """Planted rows — olives on the meseta, an orchard on the downs. The rows are
    what tells a planted field from a wild one at a glance."""
    step = step * 1.5 if LITE else step
    r = random.Random(seed)
    out = []
    rows = int(h / step)
    cols = int(w / step)
    for i in range(rows):
        for j in range(cols):
            x = -w / 2 + step / 2 + j * step + r.uniform(-3, 3)
            y = -h / 2 + step / 2 + i * step + r.uniform(-3, 3)
            out.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r.uniform(5, 7.5):.1f}" fill="{fill}"/>')
    return f'<g transform="translate({cx:.0f},{cy:.0f}) rotate({rot:.0f})">{"".join(out)}</g>'


def hamlet(cx, cy, w, h, p, seed, roofs=2):
    """A village in plan: little blocks along a lane, a couple of them roofed."""
    r = random.Random(seed)
    out = []
    n = r.randrange(7, 13)
    for i in range(n):
        bw, bh = r.uniform(26, 52), r.uniform(22, 44)
        x = cx + r.uniform(-w / 2, w / 2 - bw)
        y = cy + r.uniform(-h / 2, h / 2 - bh)
        fill = p["accent"] if i < roofs else p["blocks"]
        op = "0.55" if i < roofs else "1"
        out.append(
            f'<rect x="{x:.1f}" y="{y:.1f}" width="{bw:.1f}" height="{bh:.1f}" rx="3" '
            f'fill="{fill}" opacity="{op}" stroke="{p["block_edge"]}" stroke-width="1.5"/>'
        )
    return "".join(out)


def contours(cx, cy, rings, fill, seed, rx=180, ry=120):
    """A hill: closed contour lines, each one a wobble of the last."""
    r = random.Random(seed)
    out = []
    for k in range(rings):
        t = 1 - k / rings
        pts = []
        n = 14
        for i in range(n):
            a = 2 * math.pi * i / n
            rr = r.uniform(0.9, 1.1)
            pts.append((cx + math.cos(a) * rx * t * rr, cy + math.sin(a) * ry * t * rr))
        d = f"M{pts[0][0]:.1f},{pts[0][1]:.1f}"
        for i in range(1, n + 1):
            p0 = pts[(i - 1) % n]
            p1 = pts[i % n]
            mx, my = (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2
            d += f" Q{p0[0]:.1f},{p0[1]:.1f} {mx:.1f},{my:.1f}"
        out.append(f'<path d="{d} Z" fill="none" stroke="{fill}" stroke-width="2"/>')
    return "".join(out)


def lake(cx, cy, rx, ry, p, seed):
    r = random.Random(seed)
    pts = []
    n = 11
    for i in range(n):
        a = 2 * math.pi * i / n
        rr = r.uniform(0.78, 1.05)
        pts.append((cx + math.cos(a) * rx * rr, cy + math.sin(a) * ry * rr))
    d = f"M{pts[0][0]:.1f},{pts[0][1]:.1f}"
    for i in range(1, n + 1):
        p0, p1 = pts[(i - 1) % n], pts[i % n]
        mx, my = (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2
        d += f" Q{p0[0]:.1f},{p0[1]:.1f} {mx:.1f},{my:.1f}"
    return f'<path d="{d} Z" fill="{p["water"]}" stroke="{p["shore"]}" stroke-width="2"/>'


# ── The sheets ──────────────────────────────────────────────────────────────
#
# Both lands are built the same way and read differently because the land does:
# the downs are hedged and wet, the meseta is planted and dry.


def downs(p):
    g = []
    # Fields, left bank and right bank, none of them inside the route corridor.
    plots = [
        (0.13, 250, 480, 330, -8, 0), (0.86, 430, 520, 380, 6, 1),
        (0.10, 700, 430, 300, 12, 2), (0.89, 980, 470, 340, -5, 3),
        (0.16, 1180, 520, 360, -14, 4), (0.84, 1520, 500, 330, 9, 5),
        (0.11, 1680, 450, 310, 4, 6), (0.88, 2060, 540, 370, -7, 7),
        (0.15, 2260, 480, 340, 11, 8), (0.85, 2600, 460, 320, -10, 9),
        (0.12, 2820, 500, 350, 6, 10), (0.87, 3120, 520, 360, -4, 11),
        (0.14, 3340, 440, 300, 8, 12),
    ]
    for fx, fy, fw, fh, rot, seed in plots:
        fill = p["fields"][seed % len(p["fields"])]
        g.append(parcel(W * fx, fy, fw, fh, fill, seed, rot, edge=p["hedge"]))

    g.append(contours(W * 0.08, 1420, 4, p["contour"], 21, rx=250, ry=170))
    g.append(contours(W * 0.93, 2760, 3, p["contour"], 22, rx=210, ry=150))

    g.append(f'<g opacity="0.75">{grove(W * 0.90, 780, 120, 90, p["grove"], 31)}</g>')
    g.append(f'<g opacity="0.75">{grove(W * 0.07, 2000, 105, 80, p["grove"], 32, 20)}</g>')
    g.append(f'<g opacity="0.75">{grove(W * 0.94, 3300, 110, 85, p["grove"], 33, 22)}</g>')
    g.append(f'<g opacity="0.7">{orchard(W * 0.15, 2480, 260, 190, p["grove"], 34, rot=-9)}</g>')

    g.append(lake(W * 0.88, 1780, 130, 80, p, 41))

    g.append(hamlet(W * 0.11, 900, 220, 150, p, 51))
    g.append(hamlet(W * 0.89, 2320, 240, 160, p, 52))
    g.append(hamlet(W * 0.10, 3120, 210, 140, p, 53))
    return g


def meseta(p):
    g = []
    plots = [
        (0.14, 300, 500, 340, 7, 0), (0.87, 520, 480, 330, -6, 1),
        (0.11, 760, 440, 300, -11, 2), (0.88, 1040, 520, 360, 5, 3),
        (0.15, 1300, 470, 320, 9, 4), (0.85, 1620, 500, 350, -8, 5),
        (0.12, 1840, 460, 310, 12, 6), (0.89, 2180, 530, 370, -4, 7),
        (0.16, 2420, 490, 330, -9, 8), (0.84, 2720, 470, 320, 7, 9),
        (0.11, 2960, 510, 350, 5, 10), (0.88, 3260, 480, 330, -11, 11),
        (0.15, 3440, 430, 290, 6, 12),
    ]
    for fx, fy, fw, fh, rot, seed in plots:
        fill = p["fields"][seed % len(p["fields"])]
        g.append(parcel(W * fx, fy, fw, fh, fill, seed, rot, edge=p["hedge"]))

    # Olives, in rows, are the meseta's signature — four plantations down the sheet.
    for cx, cy, rot, seed in ((0.13, 620, 8, 61), (0.88, 1420, -6, 62),
                              (0.12, 2240, 10, 63), (0.87, 3040, -8, 64)):
        g.append(f'<g opacity="0.8">{orchard(W * cx, cy, 300, 220, p["grove"], seed, rot=rot, step=38)}</g>')

    g.append(contours(W * 0.92, 800, 4, p["contour"], 23, rx=230, ry=160))
    g.append(contours(W * 0.07, 1720, 3, p["contour"], 24, rx=220, ry=150))
    g.append(contours(W * 0.93, 2560, 4, p["contour"], 25, rx=240, ry=165))

    g.append(f'<g opacity="0.7">{grove(W * 0.09, 1080, 100, 78, p["grove"], 35, 18)}</g>')
    g.append(f'<g opacity="0.7">{grove(W * 0.9, 3320, 105, 80, p["grove"], 36, 20)}</g>')

    g.append(hamlet(W * 0.12, 1980, 230, 150, p, 54, roofs=3))
    g.append(hamlet(W * 0.88, 2880, 250, 165, p, 55, roofs=3))
    g.append(hamlet(W * 0.10, 3380, 200, 130, p, 56, roofs=2))
    return g


LAYOUTS = {"downs": downs, "meseta": meseta}
# The water and the roads differ per land: the downs get a proper river and a
# lane; the meseta gets a shallow one and two dust roads.
WATER = {
    "downs": [("river", 0.80, 150, 2, 34, 0.0)],
    "meseta": [("river", 0.22, 145, 2, 24, 0.7)],
}
ROADS = {
    "downs": [(0.46, 300, 3, 7, 1.9, "road"), (0.54, 170, 1, 4, 3.4, "lane")],
    "meseta": [(0.48, 330, 3, 6, 2.2, "road"), (0.56, 200, 2, 4, 2.6, "lane"),
               (0.44, 120, 4, 3, 1.1, "lane")],
}


def sheet(land):
    p = LANDS[land]
    body = [f'<rect width="{W}" height="{H}" fill="{p["canvas"]}"/>', graticule(p)]

    # Roads and water first: the parcels are laid over them, as on a real sheet.
    for cx, amp, waves, width, phase, key in ROADS[land]:
        body.append(road(p, W * cx, amp, waves, width, phase, p[key]))
    for _, cx, amp, waves, width, phase in WATER[land]:
        body.append(river(p, W * cx, amp, waves, width, phase))

    scene = "".join(LAYOUTS[land](p))
    # One definition, three placements: anything crossing an edge lands on the other side.
    body.append(f'<defs><g id="scene">{scene}</g></defs>')
    for dy in (0, -H, H):
        body.append(f'<use href="#scene" transform="translate(0,{dy})"/>')

    # The corridor the route runs down, lifted back toward the paper tone.
    body.append(f'<rect width="{W}" height="{H}" fill="url(#lane)"/>')
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">'
        f'<defs><linearGradient id="lane" x1="0" y1="0" x2="1" y2="0">'
        f'<stop offset="0%" stop-color="{p["canvas"]}" stop-opacity="0"/>'
        f'<stop offset="{LANE[0] * 100 - 8:.0f}%" stop-color="{p["canvas"]}" stop-opacity="0.25"/>'
        f'<stop offset="42%" stop-color="{p["canvas"]}" stop-opacity="0.62"/>'
        f'<stop offset="58%" stop-color="{p["canvas"]}" stop-opacity="0.62"/>'
        f'<stop offset="{LANE[1] * 100 + 8:.0f}%" stop-color="{p["canvas"]}" stop-opacity="0.25"/>'
        f'<stop offset="100%" stop-color="{p["canvas"]}" stop-opacity="0"/>'
        f'</linearGradient></defs>{"".join(body)}</svg>'
    )


def render(land, chrome):
    svg_path = HERE / f"{land}.svg"
    png_path = HERE / f"{land}.png"
    svg_path.write_text(sheet(land), encoding="utf-8")
    page = chrome.new_page(viewport={"width": W, "height": H})
    page.goto(svg_path.as_uri())
    page.screenshot(path=str(png_path))
    page.close()
    print(png_path)




# ── Preview ─────────────────────────────────────────────────────────────────
#
# The sheet is only right if lesson titles stay readable on it, so it is checked
# under the real thing: the route of nodes drawn over the background at phone
# size. The screen markup is borrowed from route.py rather than written twice.


def preview(land, chrome):
    import route

    label = {"downs": ("Английский", "A2"), "meseta": ("Испанский", "A2")}[land]
    route.LANGS["_atlas"] = {"lang": label[0], "level": label[1]}
    route.MAPS["_atlas"] = LANDS[land]
    html = route.preview_html("_atlas").replace(
        "</style>",
        f"body {{ background-image: url('{land}.png'); background-repeat: repeat-y; "
        f"background-position: top center; background-size: 100% auto; }}</style>",
    )
    path = HERE / f"{land}-preview.html"
    path.write_text(html, encoding="utf-8")
    page = chrome.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=2)
    page.goto(path.as_uri())
    page.wait_for_timeout(400)
    for i, y in enumerate((0, 1150, 2300)):
        page.evaluate(f"window.scrollTo(0, {y})")
        page.wait_for_timeout(120)
        shot = HERE / f"{land}-preview-{i + 1}.png"
        page.screenshot(path=str(shot))
        print(shot)
    page.close()

if __name__ == "__main__":
    from playwright.sync_api import sync_playwright

    with sync_playwright() as pw:
        browser = pw.chromium.launch(channel="chrome")
        for land in [a for a in sys.argv[1:] if not a.startswith("--")] or list(LANDS):
            render(land, browser)
            if "--no-preview" not in sys.argv:
                preview(land, browser)
        browser.close()
