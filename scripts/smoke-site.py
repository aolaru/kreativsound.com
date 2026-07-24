#!/usr/bin/env python3
from __future__ import annotations

import subprocess
import sys
import threading
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from socketserver import ThreadingMixIn


ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, format: str, *args) -> None:
        return

    def translate_path(self, path: str) -> str:
        resolved = Path(super().translate_path(path))
        if not resolved.exists() and not resolved.suffix:
            html_file = Path(f"{resolved}.html")
            if html_file.exists():
                return str(html_file)
        return str(resolved)

    def handle(self) -> None:
        try:
            super().handle()
        except BrokenPipeError:
            pass


def find_chrome() -> str | None:
    candidates = [
        "google-chrome",
        "chromium",
        "chromium-browser",
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    ]
    for candidate in candidates:
        result = subprocess.run(
            ["bash", "-lc", f"command -v '{candidate}'"],
            cwd=ROOT,
            capture_output=True,
            text=True,
        )
        if result.returncode == 0 and result.stdout.strip():
            return result.stdout.strip()
    return None


def dump_dom(chrome: str, url: str) -> str:
    commands = [
        [chrome, "--headless=new", "--no-sandbox", "--disable-gpu", "--virtual-time-budget=5000", "--dump-dom", url],
        [chrome, "--headless", "--no-sandbox", "--disable-gpu", "--virtual-time-budget=5000", "--dump-dom", url],
    ]
    last_error = None
    for command in commands:
        result = subprocess.run(command, cwd=ROOT, capture_output=True, text=True)
        if result.returncode == 0:
            return result.stdout
        last_error = result.stderr or result.stdout
    raise RuntimeError(last_error or f"Failed to dump DOM for {url}")


def require(dom: str, needle: str, label: str, errors: list[str]) -> None:
    if needle not in dom:
        errors.append(f"{label}: missing `{needle}`")


def forbid(dom: str, needle: str, label: str, errors: list[str]) -> None:
    if needle in dom:
        errors.append(f"{label}: unexpected `{needle}`")


def main() -> int:
    chrome = find_chrome()
    if not chrome:
        print("Chrome/Chromium is required for smoke-site.py.")
        return 1

    if not DIST.exists():
        print("dist/ is required for smoke-site.py. Run npm run build first.")
        return 1

    handler = partial(QuietHandler, directory=str(DIST))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    base_url = f"http://127.0.0.1:{server.server_address[1]}"
    try:
        errors: list[str] = []

        pages = {
            "/": ["Sounds", "News", "About", "Contact", "Latest release", "JUNO NOCTURNES", "Preset Mutator", "Kreativ Kollection V1", "Optional analytics"],
            "/news/": ["Sounds", "Latest Sound Releases", "Practical Sound-Design Guides", "How to Use JUNO NOCTURNES for Dark Ambient", "Site and tool changelog"],
            "/learn/": ["Sounds", "Practical guides now live with News.", "Browse practical guides", "Search guides"],
            "/music/": ["Music", "Olaru", "Memories", "bandcamp.com/EmbeddedPlayer/album=3005188030"],
            "/about/": ["Sounds", "About"],
            "/contact/": ["Sounds", "info@kreativsound.com"],
            "/privacy/": ["Privacy Policy", "Optional analytics", "Google Analytics", "Cloudflare Web Analytics"],
            "/terms/": ["Terms of Use", "Purchases", "Product License"],
            "/refunds/": ["Refund Policy", "Refund requests", "Gumroad and PayPal purchases"],
            "/license/": ["Product License", "What the license allows", "What the license does not allow"],
            "/posts/how-to-use-juno-nocturnes-for-dark-ambient-2026-07-18.html": ["By Andrei Olaru", "Published July 18, 2026", "How to Use JUNO NOCTURNES for Dark Ambient"],
            "/search/": ["Find sounds, music, tools, and articles.", "Search Kreativ Sound", "Enter a product, album, artist, synth, format, guide, or tool."],
            "/sounds/": ["Browse Sound", "Find a sound", "Need placement ideas?", "JUNO NOCTURNES", "Juno Nocturnes Lite", "Preset Packs", "Sample Packs", "Free Packs"],
            "/sounds/kreativ-kollection-v1": ["Get the bundle on Gumroad", "49 EUR", "16 products", "Kreativ Kollection V1", "JUNO NOCTURNES", "Description", "What's Included", "Product Specifications", "Requirements"],
            "/sounds/juno-nocturnes-jun-6-v-presets": ["Buy on Gumroad", "Try Lite free", "JUNO NOCTURNES", "96 presets", "Arturia JUN-6 V", "Product Specifications", "Requirements", "Related sounds", "View full catalog"],
            "/sounds/operators-fm8-presets": ["Buy on Gumroad", "Try Lite free", "OPERATORS", "64 presets", "Product Specifications", "Requirements"],
            "/sounds/juno-nocturnes-lite-jun-6-v-presets": ["Download Free", "Juno Nocturnes Lite", "16 presets", "Lite vs Full", "Upgrade to full Juno Nocturnes"],
            "/sounds/velvet-ruins-vital-presets": ["Buy on Gumroad", "Try Lite free", "VELVET RUINS", "Description", "Product Specifications", "Requirements"],
            "/sounds/black-arcology-pigments-presets": ["Buy on Gumroad", "Try Lite free", "BLACK ARCOLOGY", "Product Specifications", "Requirements"],
            "/sounds/neolith-softube-models-presets": ["Buy on Gumroad", "NEOLITH", "Description", "Product Specifications", "Requirements"],
            "/sounds/bioforms-synplant-2-presets": ["Buy on Gumroad", "BIOFORMS", "Description", "Product Specifications", "Requirements"],
        }

        for route, needles in pages.items():
            dom = dump_dom(chrome, base_url + route)
            for needle in needles:
                require(dom, needle, route, errors)

            if route == "/":
                require(dom, 'href="#latest-featured"', route, errors)
                require(dom, 'id="main-content"', route, errors)
                require(dom, 'class="site-header"', route, errors)
                require(dom, 'href="/sounds/"', route, errors)
                require(dom, 'href="/sounds/juno-nocturnes-jun-6-v-presets"', route, errors)
                require(dom, 'href="/sounds/operators-fm8-presets"', route, errors)
                require(dom, 'href="/sounds/kreativ-kollection-v1"', route, errors)
                require(dom, 'href="/sounds/preset-mutator"', route, errors)
                require(dom, 'href="/preset-mutator/"', route, errors)
                forbid(dom, 'href="/learn/"', route, errors)
                require(dom, "Flagship bundle", route, errors)
                require(dom, "Creative tool", route, errors)
                require(dom, "Full Catalog", route, errors)
                require(dom, 'href="/privacy/"', route, errors)
                forbid(dom, 'action="https://www.google.com/search"', route, errors)
                require(dom, 'action="/search/"', route, errors)
            if route == "/sounds/":
                require(dom, 'data-catalog-query', route, errors)
                require(dom, 'data-catalog-category="Presets"', route, errors)
                require(dom, 'data-catalog-category="Free"', route, errors)
                forbid(dom, 'class="catalog-anchor-links"', route, errors)
            if route.startswith("/sounds/") and route != "/sounds/":
                require(dom, 'class="product-breadcrumbs"', route, errors)
                require(dom, 'href="/sounds/"', route, errors)
            if route == "/music/":
                forbid(dom, "Rethyn", route, errors)
                forbid(dom, "Holo Signal", route, errors)
            if route.startswith("/posts/"):
                require(dom, '"@type":"Article"', route, errors)
                require(dom, '"name":"Andrei Olaru"', route, errors)

        if errors:
            print("Smoke test failed:")
            for error in errors:
                print(f"- {error}")
            return 1

        print("Rendered smoke checks passed.")
        return 0
    finally:
        server.shutdown()
        server.server_close()


if __name__ == "__main__":
    sys.exit(main())
