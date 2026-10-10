#!/usr/bin/env python3
from __future__ import annotations

import sys
import threading
import json
import re
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.request import urlopen


ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
TOOL_RELEASES = ROOT / "src" / "data" / "tool-releases.json"


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

    releases = json.loads(TOOL_RELEASES.read_text(encoding="utf-8"))
    preset_mutator_free = releases["presetMutatorFree"]
    preset_mutator_pro = releases["presetMutatorPro"]
    wave_mutator = releases["waveMutator"]
    pattern_mutator = releases["patternMutator"]

    handler = partial(QuietHandler, directory=str(DIST))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    base_url = f"http://127.0.0.1:{server.server_address[1]}"
    try:
        errors: list[str] = []

        pages = {
            "/": ["Sounds", "Updates", "About", "Support", "Latest release", "KS BurnShaper", "KS Ghostform", "Callisto Drift", "Preset Mutator Free", "Kreativ Kollection V1", "Optional analytics"],
            "/news/": ["News moved to Updates", "Kreativ Sound Updates"],
            "/updates/": ["Kreativ Sound Updates and Changelog", "New releases, updates, and practical guides.", "Monthly product updates", "September 2026", "August 2026", f"{preset_mutator_pro['name']} v{preset_mutator_pro['version']}", f"{preset_mutator_free['name']} v{preset_mutator_free['version']}", f"{wave_mutator['name']} {wave_mutator['releaseLabel']} v{wave_mutator['version']}", "Website maintenance", "Read release notes", "Practical sound-design guides", "Earlier launches", "More guides", "Browse Tools", "Browse Plugins", "KS Ghostform", "144 factory presets"],
            "/posts/ghostform-release-2026-10-07.html": ["144 factory presets", "macOS 11", "64-bit VST3", "Ghostform User Manual v1.0", "September 25, 2026", "Published October 7, 2026", "https://kreativ.gumroad.com/l/ks-ghostform"],
            "/posts/callisto-drift-release-2026-10-07.html": ["128 presets", "32 presets", ".jup4x", "4.6.4.6366", "Published October 7, 2026", "https://kreativ.gumroad.com/l/callisto-drift-lite-jup-8-v4-presets", "https://kreativ.gumroad.com/l/callisto-drift-jup-8-v4-presets"],
            "/posts/catalog-discovery-update-2026-08-19.html": ["Historical announcement.", "Published August 19, 2026", "See current releases and updates."],
            "/posts/black-arcology-release-2026-04-30.html": ["128 presets", "32 free presets", "Last updated October 7, 2026", "Requirements"],
            "/plugins/ghostform": ["KS Ghostform", "Download Free", "144 factory presets", "macOS AU and VST3", "Windows 64-bit VST3", "Product Specifications", "Requirements", "Version 1.0.0", "Release notes", "Ghostform User Manual v1.0", "Installation", "not a standalone application"],
            "/plugins/burnshaper": ["KS BurnShaper", "Buy on Gumroad", "144 factory presets", "macOS 12", "14.44", "unsigned", "unverified", "do not disable protections", "Direct, Tube, Tape, Hard, Fold, or Digital", "fixed 4x oversampling", "Gumroad licence key", "Unactivated copies pass dry audio", "Requirements", "Installation", "Release notes", "Lifetime, no-questions-asked", "https://kreativ.gumroad.com/l/ks-burnshaper", "/assets/thumbs/burnshaper-interface.webp"],
            "/posts/burnshaper-release-2026-10-10.html": ["KS BurnShaper", "144 factory presets", "macOS 12", "Windows", "unsigned", "November 9", "€19", "https://kreativ.gumroad.com/l/ks-burnshaper"],
            "/tools/": ["Preset Mutator Free", "3 free / 32 Pro", "Free + Pro", "Open Preset Mutator Pro", "Get Pro for €19", "Wave Mutator Lite", "Pattern Mutator Lite"],
            "/tools/pattern-mutator/": ["Pattern Mutator Lite", "Generate. Lock. Mutate.", "Set the musical boundaries", "Download MIDI", "Free piano roll"],
            "/tools/pattern-mutator/changelog/": ["Pattern Mutator Lite", "Changelog", "Current release", f"v{pattern_mutator['version']}", "Back to Pattern Mutator Lite"],
            "/tools/wave-mutator/changelog/": ["Wave Mutator Lite", "Changelog", "Current beta release", f"v{wave_mutator['version']}", "Current beta limits"],
            "/tools/preset-mutator/": ["Preset Mutator Free", "Free + Pro", "Open Preset Mutator Pro", "Get Pro for €19", "32 preset variants per workflow for Vital, Serum 2 beta, and Pigments beta.", "Supported synths", "Activate Pro", "Gumroad license-key verification", "earlier signed Pro tokens still work", "Not included"],
            "/sounds/preset-mutator": ["Serum 2", "Arturia Pigments", "Supported synths", "Activate Pro", "Gumroad license-key verification", "Not included"],
            "/learn/": ["Sounds", "Practical guides now live with Updates.", "Browse practical guides", "Search guides"],
            "/music/": ["Music", "Olaru", "Memories", "bandcamp.com/EmbeddedPlayer/album=3005188030"],
            "/plugins/": ["Instruments and effects.", "KS BurnShaper", "KS Ghostform", "144 factory presets", "Buy on Gumroad", "Download Free", "Product Details", "https://kreativ.gumroad.com/l/ks-burnshaper", "https://kreativ.gumroad.com/l/ks-ghostform"],
            "/about/": ["Independent sound design by Andrei Olaru.", "I'm Andrei, the creator of Kreativ Sound.", "my music as Olaru", "free and Pro browser tools", "KS Ghostform", "/assets/thumbs/ghostform-interface.png", 'aria-label="Explore Kreativ Sound"', "Purchases and downloads are handled through Gumroad.", "contact Support"],
            "/contact/": ["Support | Kreativ Sound", "Get help with a product or purchase.", "info@kreativsound.com", '<option value="Callisto Drift"', '<option value="Callisto Drift Lite"', 'name="product_version"', 'id="contact-product-help"', 'action="https://formsubmit.co/info@kreativsound.com"', 'data-help-url="/plugins/ghostform#product-installation-title"', 'data-help-url="/tools/preset-mutator/#preset-mutator-activation-title"'],
            "/privacy/": ["Privacy Policy", "Optional analytics", "Google Analytics", "Cloudflare Web Analytics"],
            "/terms/": ["Terms of Use", "Purchases", "Product License"],
            "/refunds/": ["Refund Policy", "Refund requests", "Gumroad and PayPal purchases"],
            "/license/": ["Product License", "What the license allows", "What the license does not allow"],
            "/posts/how-to-use-juno-nocturnes-for-dark-ambient-2026-07-18.html": ["By Andrei Olaru", "Published July 18, 2026", "How to Use JUNO NOCTURNES for Dark Ambient"],
            "/search/": ["Find sounds, music, tools, and articles.", "Search Kreativ Sound", "Enter a product, album, artist, synth, format, guide, or tool."],
            "/sounds/": ["Browse Sound", "Need placement ideas?", "JUNO NOCTURNES", "Juno Nocturnes Lite", "Preset Packs", "Sample Packs", "Free Packs", "Legacy Archive"],
            "/sounds/kreativ-kollection-v1": ["Get the bundle on Gumroad", "49 EUR", "16 products", "Kreativ Kollection V1", "JUNO NOCTURNES", "Description", "What's Included", "Product Specifications", "Requirements"],
            "/sounds/juno-nocturnes-jun-6-v-presets": ["Buy on Gumroad", "Try Lite free", "JUNO NOCTURNES", "96 presets", "Arturia JUN-6 V", "Product Specifications", "Requirements", "Related sounds", "View full catalog"],
            "/sounds/callisto-drift-jup-8-v4-presets": ["Buy on Gumroad", "Try Lite free", "128 presets", "9 EUR", ".jup4x", "4.6.4.6366", "PDF preset catalogue", "https://kreativ.gumroad.com/l/callisto-drift-jup-8-v4-presets"],
            "/sounds/callisto-drift-lite-jup-8-v4-presets": ["Download Free", "32 presets", "Lite vs Full", "Get full Callisto Drift", ".jup4x", "4.6.4.6366", "https://kreativ.gumroad.com/l/callisto-drift-lite-jup-8-v4-presets"],
            "/sounds/daft-plasticz-presets": ["Download Free", "102 presets", "reFX PlastiCZ", "368 KB", "discontinued legacy instrument"],
            "/sounds/operators-fm8-presets": ["Buy on Gumroad", "Try Lite free", "OPERATORS", "64 presets", "Product Specifications", "Requirements"],
            "/sounds/juno-nocturnes-lite-jun-6-v-presets": ["Download Free", "Juno Nocturnes Lite", "16 presets", "Lite vs Full", "Upgrade to full Juno Nocturnes"],
            "/sounds/velvet-ruins-vital-presets": ["Buy on Gumroad", "Try Lite free", "VELVET RUINS 2", "256 presets", "ATMOS, MOTION, DUST, and SPACE", "backward compatibility", "Installation guide", "30-day money-back guarantee", "Vital or Vital Free", "Product Specifications", "Requirements"],
            "/sounds/velvet-ruins-lite-vital-presets": ["Download Free", "VELVET RUINS Lite", "32 presets", "8 cinematic experiments", "ATMOS, MOTION, DUST, and SPACE", "Vital or Vital Free", "Lite vs Full", "Upgrade to VELVET RUINS 2"],
            "/sounds/black-arcology-pigments-presets": ["Buy on Gumroad", "Try Lite free", "BLACK ARCOLOGY", "Product Specifications", "Requirements"],
            "/sounds/neolith-softube-models-presets": ["Buy on Gumroad", "NEOLITH", "64 presets", "2.09 MB", "Product Specifications", "Requirements"],
            "/sounds/bioforms-synplant-2-presets": ["Buy on Gumroad", "BIOFORMS", "Description", "Product Specifications", "Requirements"],
            "/sounds/sfxs-2-sound-effects": ["SFXS 2", "Listen to demo", "34 original sound effects", "24-bit WAV", "116 MB", "/assets/audio/sfxs-2-demo-01.mp3"],
            "/sounds/noize-2-noise-textures": ["NOIZE 2", "32 sounds", "44.1 kHz", "Listen to demo", "/assets/audio/noize-2-demo-01.mp3"],
            "/sounds/enigma-2-cinematic-atmospheres": ["ENIGMA 2", "12 sounds", "44.1 kHz", "Listen to demo", "/assets/audio/enigma-2-demo-01.mp3"],
            "/sounds/bleeps-2-percussion-sounds": ["BLEEPS 2", "Listen to demo", "44 sounds", "43 files at 24-bit PCM; 1 at 16-bit PCM", "44.1 kHz", "5.15 MB", "/assets/audio/bleeps-2-demo-01.mp3"],
            "/sounds/space-2-atmospheres-textures": ["SPACE 2", "10 sounds", "44.1 kHz", "Listen to demo", "/assets/audio/space-2-demo-01.mp3"],
            "/sounds/tectonic-2-dark-subs-textures": ["TECTONIC 2", "7 sounds", "6 files at 24-bit PCM; 1 at 16-bit PCM", "44.1 kHz", "Listen to demo", "/assets/audio/tectonic-2-demo-01.mp3"],
            "/sounds/horror-2-cinematic-textures": ["HORROR 2", "8 sounds", "7 files at 44.1 kHz; 1 at 48 kHz", "7 files at 24-bit PCM; 1 at 32-bit float", "Listen to demo", "/assets/audio/horror-2-demo-01.mp3"],
        }

        for hub in ("sounds", "plugins"):
            for page in (DIST / hub).rglob("*.html"):
                dom = page.read_text(encoding="utf-8")
                installation_heading = '<h2 id="product-installation-title"'
                if installation_heading not in dom:
                    continue
                label = str(page.relative_to(DIST))
                requirements_position = dom.find('<h2 id="product-requirements-title"')
                installation_position = dom.find(installation_heading)
                if requirements_position == -1 or requirements_position > installation_position:
                    errors.append(f"{label}: Installation must follow Requirements.")
                if dom.count(installation_heading) != 1:
                    errors.append(f"{label}: expected exactly one Installation heading.")

        for route, needles in pages.items():
            dom = fetch_html(base_url + route)
            for needle in needles:
                require(dom, needle, route, errors)

            if route == "/plugins/burnshaper":
                if dom.find('id="product-installation-title"') > dom.find('id="burnshaper-release-title"'):
                    errors.append(f"{route}: release notes must follow Installation.")
                forbid(dom, "Download Free", route, errors)
            if route == "/plugins/":
                if dom.find('id="burnshaper-title"') > dom.find('id="ghostform-title"'):
                    errors.append(f"{route}: the new BurnShaper release must precede Ghostform.")
            if route == "/updates/":
                require(dom, "KS BurnShaper added to Plugins", route, errors)
                require(dom, 'href="/posts/burnshaper-release-2026-10-10.html"', route, errors)
            if route == "/refunds/":
                require(dom, "KS BurnShaper", route, errors)
                require(dom, "lifetime, no-questions-asked full refunds", route, errors)
            if route == "/license/":
                require(dom, "KS BurnShaper plugin", route, errors)

            if route == "/about/":
                forbid(dom, "New: Kreativ Sound Plugins", route, errors)
                forbid(dom, "brand-plugin-facts", route, errors)
                forbid(dom, "Start with what you need.", route, errors)
                content = re.search(r'<nav\b[^>]*aria-label="Explore Kreativ Sound"[^>]*>(.*?)</nav>', dom, re.S)
                if not content:
                    errors.append(f"{route}: missing compact exploration navigation.")
                elif re.findall(r'href="([^"]+)"', content.group(1)) != ["/plugins/", "/sounds/", "/tools/", "/music/"]:
                    errors.append(f"{route}: expected Plugins, Sounds, Tools, Music in that order.")
                main_content = re.search(r'<main\b[^>]*>(.*?)</main>', dom, re.S)
                if main_content and len(re.sub(r'<[^>]+>', ' ', main_content.group(1)).split()) > 130:
                    errors.append(f"{route}: keep the About page at 130 words or fewer.")

            if route == "/contact/":
                require(dom, '<option value="KS BurnShaper"', route, errors)
                require(dom, 'data-help-url="/plugins/burnshaper#product-installation-title"', route, errors)
                forbid(dom, "Browse releases and free downloads.", route, errors)
                forbid(dom, "contact-other-links", route, errors)
                for help_url in re.findall(r'data-help-url="([^"]+)"', dom):
                    path, _, fragment = help_url.partition("#")
                    if not path.startswith("/") or path.startswith("//"):
                        errors.append(f"{route}: expected internal product help URL, got {help_url}")
                        continue
                    help_dom = fetch_html(base_url + path)
                    if fragment:
                        require(help_dom, f'id="{fragment}"', f"{route} help link {help_url}", errors)
                version_field = re.search(r'<input\b[^>]*id="contact-version"[^>]*>', dom)
                if not version_field or "required" in version_field.group():
                    errors.append(f"{route}: product version must be an optional form field.")

            if route == "/":
                require(dom, 'href="#latest-featured"', route, errors)
                require(dom, 'id="main-content"', route, errors)
                require(dom, 'class="site-header"', route, errors)
                require(dom, 'href="/sounds/"', route, errors)
                require(dom, 'href="/sounds/callisto-drift-jup-8-v4-presets"', route, errors)
                require(dom, 'href="/sounds/operators-fm8-presets"', route, errors)
                require(dom, 'href="/sounds/kreativ-kollection-v1"', route, errors)
                require(dom, 'href="/sounds/preset-mutator"', route, errors)
                require(dom, 'href="/preset-mutator/"', route, errors)
                require(dom, 'href="/plugins/"', route, errors)
                forbid(dom, 'href="/learn/"', route, errors)
                require(dom, "Flagship bundle", route, errors)
                require(dom, 'id="latest-title">KS BurnShaper</h2>', route, errors)
                require(dom, "Creative tool", route, errors)
                require(dom, "Explore Sounds", route, errors)
                require(dom, "Open Tools", route, errors)
                require(dom, 'href="/privacy/"', route, errors)
                forbid(dom, 'action="https://www.google.com/search"', route, errors)
                require(dom, 'action="/search/"', route, errors)
            if route == "/sounds/":
                require(dom, "Callisto Drift", route, errors)
                require(dom, "Callisto Drift Lite", route, errors)
                require(dom, 'class="catalog-anchor-links"', route, errors)
                require(dom, 'href="#catalog-presets"', route, errors)
                require(dom, 'href="#catalog-samples"', route, errors)
                require(dom, 'href="#catalog-free"', route, errors)
                require(dom, 'href="#catalog-legacy"', route, errors)
                forbid(dom, 'data-catalog-query', route, errors)
                forbid(dom, 'data-catalog-category=', route, errors)
                forbid(dom, 'data-catalog-more', route, errors)
                require(dom, 'class="product-card-demo-player"', route, errors)
                require(dom, 'controls preload="none"', route, errors)
            if route.startswith("/sounds/") and route != "/sounds/":
                require(dom, 'class="product-breadcrumbs"', route, errors)
                require(dom, 'href="/sounds/"', route, errors)
            if route.startswith("/plugins/") and route != "/plugins/":
                require(dom, 'class="product-breadcrumbs"', route, errors)
                require(dom, 'href="/plugins/"', route, errors)
            if route == "/plugins/ghostform":
                section_ids = ["product-requirements-title", "product-installation-title", "ghostform-release-title"]
                positions = [dom.find(f'<h2 id="{section_id}"') for section_id in section_ids]
                if -1 in positions or positions != sorted(positions):
                    errors.append(f"{route}: expected Requirements → Installation → Release notes.")
                for section_id in section_ids:
                    if dom.count(f'<h2 id="{section_id}"') != 1:
                        errors.append(f"{route}: expected exactly one {section_id} heading.")
            if route == "/music/":
                forbid(dom, "Rethyn", route, errors)
                forbid(dom, "Holo Signal", route, errors)
                require(dom, "data-music-player-toggle", route, errors)
                require(dom, "data-src=", route, errors)
            if route.startswith("/posts/"):
                require(dom, '"@type":"Article"' if "how-to-" in route else '"@type":"NewsArticle"', route, errors)
                require(dom, '"name":"Andrei Olaru"', route, errors)
                require(dom, 'href="/updates/"', route, errors)
            if route == "/posts/black-arcology-release-2026-04-30.html":
                forbid(dom, "Press release", route, errors)

        updates_dom = fetch_html(base_url + "/updates/")
        launches = re.search(r'<ul[^>]*data-latest-launches[^>]*>(.*?)</ul>', updates_dom, re.S)
        if not launches or len(re.findall(r"<li\b", launches.group(1))) != 6:
            errors.append("/updates/: expected exactly six visible launches.")
        if launches and re.search(r"Preset Mutator (Free|Pro) v", launches.group(1)):
            errors.append("/updates/: tool versions must be monthly updates, not launches.")
        months = re.findall(r'<details\b[^>]*data-update-month="[^"]+"[^>]*>', updates_dom)
        if not months or [bool(re.search(r"\bopen(?:\s|=|>)", month)) for month in months] != [True] + [False] * (len(months) - 1):
            errors.append("/updates/: only the newest product-update month should start open.")
        maintenance = re.search(r'<details\b[^>]*id="site-maintenance"[^>]*>', updates_dom)
        if not maintenance or re.search(r"\bopen(?:\s|=|>)", maintenance.group(0)):
            errors.append("/updates/: website maintenance must start collapsed.")
        log_source = (ROOT / "src" / "lib" / "site-updates.ts").read_text(encoding="utf-8")
        descriptions = re.findall(r'description: "([^"]+)"', log_source)
        for description in descriptions:
            if len(description.split()) > 20 or len(re.findall(r"[.!?](?:\s|$)", description)) != 1 or not description.endswith((".", "!", "?")):
                errors.append(f"/updates/: expected a single log sentence of at most 20 words: {description}")
        for removed in ("Useful first", "updates-tool-grid", "updates-quick-stats"):
            forbid(updates_dom, removed, "/updates/", errors)
        for slug in ("ghostform-release-2026-10-07", "callisto-drift-release-2026-10-07"):
            require(updates_dom, f'href="/posts/{slug}.html"', "/updates/", errors)

        repaired_guides = [
            "crafting-ambient-textures",
            "how-to-layer-bioforms-for-organic-motion-2026-03-14",
            "how-to-shape-vital-presets-for-dark-motion-2026-03-27",
            "how-to-use-audio-alchemy-free-2026-04-02",
            "how-to-use-tectonic-2-for-low-end-pressure-2026-03-14",
            "three-ways-to-use-neolith-for-cinematic-tension-2026-03-14",
        ]
        for guide in repaired_guides:
            route = f"/posts/{guide}.html"
            dom = fetch_html(base_url + route)
            require(dom, "<h2>1.", route, errors)
            require(dom, "<h2>3.", route, errors)
            forbid(dom, "&lt;h2", route, errors)
            forbid(dom, "&lt;a ", route, errors)
            if guide != "crafting-ambient-textures":
                require(dom, 'class="article-cta"', route, errors)
                require(dom, 'href="/updates/#guides"', route, errors)

        for source in (ROOT / "src" / "content" / "posts").glob("*.md"):
            text = source.read_text(encoding="utf-8")
            if "section: learn" not in text or "draft: true" in text:
                continue
            route = f"/posts/{source.stem}.html"
            dom = fetch_html(base_url + route)
            for required in ("You need:", "Result:", 'href="/updates/#guides"'):
                require(dom, required, route, errors)
            updated = re.search(r'^updated: "([^"]+)"', text, re.M)
            if updated:
                require(dom, "Last updated", route, errors)
                require(dom, f'"dateModified":"{updated.group(1)}"', route, errors)
            require(updates_dom, f'href="{route}"', "/updates/", errors)
            forbid(dom, "planned to expand later", route, errors)

        search = json.loads(fetch_html(base_url + "/search-index.json"))
        for slug in ["callisto-drift-jup-8-v4-presets", "callisto-drift-lite-jup-8-v4-presets"]:
            if not any(entry["url"].rstrip("/") == f"/sounds/{slug}" for entry in search):
                errors.append(f"Search index: missing {slug}")

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
