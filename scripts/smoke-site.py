#!/usr/bin/env python3
from __future__ import annotations

import sys
import threading
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.request import urlopen


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


def fetch_html(url: str) -> str:
    with urlopen(url, timeout=10) as response:
        return response.read().decode("utf-8")


def require(dom: str, needle: str, label: str, errors: list[str]) -> None:
    if needle not in dom:
        errors.append(f"{label}: missing `{needle}`")


def forbid(dom: str, needle: str, label: str, errors: list[str]) -> None:
    if needle in dom:
        errors.append(f"{label}: unexpected `{needle}`")


def main() -> int:
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
            "/": ["Sounds", "Updates", "About", "Contact", "Latest release", "JUNO NOCTURNES", "Preset Mutator", "Kreativ Kollection V1", "Optional analytics"],
            "/news/": ["News moved to Updates", "Kreativ Sound Updates"],
            "/updates/": ["Kreativ Sound Updates and Changelog", "Changes, releases, and practical guides.", "Recent highlights", "Everything new, updated, and fixed.", "Preset Mutator PRO v0.4.3", "Preset Mutator Free v0.4.2", "Wave Mutator beta v0.2.1", "Earlier updates", "Release notes", "Practical sound-design guides.", "The current browser-tool line", "32 variants per run", "Plugins"],
            "/tools/": ["Preset Mutator", "3 free / 32 PRO", "Free + PRO", "Get PRO for €19", "Wave Mutator", "Pattern Mutator"],
            "/tools/pattern-mutator/": ["Pattern Mutator", "Generate. Lock. Mutate.", "Set the musical boundaries", "Download MIDI", "Free piano roll"],
            "/tools/pattern-mutator/changelog/": ["Pattern Mutator", "Changelog", "Current release", "v0.1.1", "Back to Pattern Mutator"],
            "/tools/preset-mutator/": ["Preset Mutator", "Free + PRO", "Get PRO for €19", "Free", "PRO", "32 Vital preset variants per workflow."],
            "/learn/": ["Sounds", "Practical guides now live with Updates.", "Browse practical guides", "Search guides"],
            "/music/": ["Music", "Olaru", "Memories", "bandcamp.com/EmbeddedPlayer/album=3005188030"],
            "/plugins/": ["Plugins", "Kreativ Sound plugins are coming soon.", "Coming soon", "View Updates", "Browse Sounds"],
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
            "/sounds/sfxs-2-sound-effects": ["SFXS 2", "Listen to demo", "/assets/audio/sfxs-2-demo-01.mp3"],
            "/sounds/noize-2-noise-textures": ["NOIZE 2", "Listen to demo", "/assets/audio/noize-2-demo-01.mp3"],
            "/sounds/enigma-2-cinematic-atmospheres": ["ENIGMA 2", "Listen to demo", "/assets/audio/enigma-2-demo-01.mp3"],
            "/sounds/bleeps-2-percussion-sounds": ["BLEEPS 2", "Listen to demo", "/assets/audio/bleeps-2-demo-01.mp3"],
            "/sounds/space-2-atmospheres-textures": ["SPACE 2", "Listen to demo", "/assets/audio/space-2-demo-01.mp3"],
            "/sounds/tectonic-2-dark-subs-textures": ["TECTONIC 2", "Listen to demo", "/assets/audio/tectonic-2-demo-01.mp3"],
            "/sounds/horror-2-cinematic-textures": ["HORROR 2", "Listen to demo", "/assets/audio/horror-2-demo-01.mp3"],
        }

        for route, needles in pages.items():
            dom = fetch_html(base_url + route)
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
                require(dom, 'href="/plugins/"', route, errors)
                forbid(dom, 'href="/learn/"', route, errors)
                require(dom, "Flagship bundle", route, errors)
                require(dom, 'id="latest-title">Kreativ Kollection V1</h2>', route, errors)
                require(dom, "Creative tool", route, errors)
                require(dom, "Full Catalog", route, errors)
                require(dom, 'href="/privacy/"', route, errors)
                forbid(dom, 'action="https://www.google.com/search"', route, errors)
                require(dom, 'action="/search/"', route, errors)
            if route == "/sounds/":
                require(dom, 'data-catalog-query', route, errors)
                require(dom, 'data-catalog-category="Bundle"', route, errors)
                require(dom, 'data-catalog-category="Presets"', route, errors)
                require(dom, 'data-catalog-category="Free"', route, errors)
                require(dom, 'data-catalog-more', route, errors)
                forbid(dom, 'class="catalog-anchor-links"', route, errors)
                forbid(dom, 'data-catalog-category="Tools"', route, errors)
            if route.startswith("/sounds/") and route != "/sounds/":
                require(dom, 'class="product-breadcrumbs"', route, errors)
                require(dom, 'href="/sounds/"', route, errors)
            if route == "/music/":
                forbid(dom, "Rethyn", route, errors)
                forbid(dom, "Holo Signal", route, errors)
                require(dom, "data-music-player-toggle", route, errors)
                require(dom, "data-src=", route, errors)
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
