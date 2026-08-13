"""
Shoot the mascot wearing each hat, so the fit can be judged without a browser.

    python3 preview.py            # idle, both hats
    python3 preview.py celebrate  # any state id from the page
"""

import sys
from pathlib import Path

HERE = Path(__file__).parent
HATS = ("none", "uk", "es")


def shoot(state="idle"):
    from playwright.sync_api import sync_playwright

    out = []
    with sync_playwright() as pw:
        browser = pw.chromium.launch(channel="chrome")
        page = browser.new_page(viewport={"width": 1200, "height": 900}, device_scale_factor=2)
        page.goto((HERE / "index.html").as_uri())
        page.click(f'#states button[data-s="{state}"]')
        for hat in HATS:
            page.click(f'#hats button[data-h="{hat}"]')
            page.wait_for_timeout(1500)  # снимаем живой кадр: с animations="disabled" Chrome роняет transform-box у уха
            path = HERE / f"preview-{state}-{hat}.png"
            page.locator("#stage").screenshot(path=str(path))
            out.append(path)
            print(path)
        browser.close()
    return out


if __name__ == "__main__":
    shoot(sys.argv[1] if len(sys.argv) > 1 else "idle")
