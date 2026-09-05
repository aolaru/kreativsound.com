#!/usr/bin/env python3
from __future__ import annotations

import sys
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.request import urlopen


ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, format: str, *args) -> None:
        return

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


def main() -> int:
    if not DIST.exists():
        print("dist/ is required for smoke-audio-alchemy.py. Run npm run build first.")
        return 1

    handler = partial(QuietHandler, directory=str(DIST))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    base_url = f"http://127.0.0.1:{server.server_address[1]}"
    try:
        errors: list[str] = []

        dom = fetch_html(base_url + "/preset-mutator/")
        for needle in [
            "Preset Mutator Free",
            "From Scratch",
            "Create a Vital preset from intent",
            "Preset Intent",
            "Generate 3 Variants",
            "Generated Preset Variants",
        ]:
            require(dom, needle, "/preset-mutator/", errors)

        mutate_dom = fetch_html(base_url + "/preset-mutator/mutate/")
        for needle in [
            "Preset Mutator Free",
            "Mutate one Vital preset",
            "into new variants",
            "Scratch",
            "Preset",
            "Audio",
            "Generate 3 Variants",
            "Mutation Controls",
            "Kreativ Sound browser tool for preset-driven mutation.",
        ]:
            require(mutate_dom, needle, "/preset-mutator/mutate/", errors)

        scratch_dom = fetch_html(base_url + "/preset-mutator/scratch/")
        for needle in [
            "Preset Mutator Free",
            "Create a Vital preset from intent",
            "From Scratch",
            "Scratch",
            "Preset",
            "Audio",
            "Preset Intent",
            "Generate 3 Variants",
            "Serum 2 and Pigments 7 are planned.",
        ]:
            require(scratch_dom, needle, "/preset-mutator/scratch/", errors)

        if errors:
            print("Preset Mutator Free smoke test failed:")
            for error in errors:
                print(f"- {error}")
            return 1

        print("Preset Mutator Free smoke checks passed.")
        return 0
    finally:
        server.shutdown()
        server.server_close()


if __name__ == "__main__":
    sys.exit(main())
