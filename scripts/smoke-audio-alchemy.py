#!/usr/bin/env python3
from __future__ import annotations

import subprocess
import sys
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, format: str, *args) -> None:
        return

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


def main() -> int:
    chrome = find_chrome()
    if not chrome:
        print("Chrome/Chromium is required for smoke-audio-alchemy.py.")
        return 1

    handler = partial(QuietHandler, directory=str(ROOT))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    base_url = f"http://127.0.0.1:{server.server_address[1]}"
    try:
        errors: list[str] = []

        dom = dump_dom(chrome, base_url + "/apps/audio-alchemy/ui/?self_test=1")
        for needle in [
            "Audio Alchemy",
            "FREE. Local processing. No AI.",
            "Self-test mode generated synthetic demo presets.",
            "Generated Preset Variants",
            "Download .vital",
            "Closest",
            "Brighter",
            "Generated 3 Vital variants from the uploaded sound. Free demo is limited to 3.",
        ]:
            require(dom, needle, "/apps/audio-alchemy/ui/?self_test=1", errors)

        if errors:
            print("Audio Alchemy smoke test failed:")
            for error in errors:
                print(f"- {error}")
            return 1

        print("Audio Alchemy smoke checks passed.")
        return 0
    finally:
        server.shutdown()
        server.server_close()


if __name__ == "__main__":
    sys.exit(main())
