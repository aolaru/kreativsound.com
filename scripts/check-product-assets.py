#!/usr/bin/env python3
from __future__ import annotations

import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PRODUCTS_TS = ROOT / "src/lib/products.ts"


def route_to_path(route: str) -> Path:
    if route.startswith("/products/") and route.endswith("/"):
        return ROOT / "src/lib/product-pages.ts"
    if route == "/":
        return ROOT / "src/pages/index.astro"
    if route.startswith("/") and route.endswith("/"):
        direct = ROOT / "src/pages" / route.strip("/") / "index.astro"
        return direct
    return ROOT / route.lstrip("/")


def main() -> int:
    text = PRODUCTS_TS.read_text()
    errors: list[str] = []

    for thumb in re.findall(r'(?:thumbnail|coverImage):\s*"([^"]+)"', text):
        path = ROOT / thumb
        if thumb.startswith(("http://", "https://")):
            continue
        if not path.exists():
            errors.append(f"Missing thumbnail: {thumb}")

    for demo in re.findall(r'src:\s*"([^"]+)"', text):
        if demo.startswith(("http://", "https://")):
            continue
        path = ROOT / demo
        if not path.exists():
            errors.append(f"Missing demo asset: {demo}")

    for details in re.findall(r'detailsUrl:\s*"([^"]+)"', text):
        if not details.startswith("/"):
            continue
        path = route_to_path(details)
        if not path.exists():
            errors.append(f"Missing detail page: {details} -> {path.relative_to(ROOT)}")

    for extra in re.findall(r'extraAction:\s*\{\s*label:\s*"[^"]+",\s*url:\s*"([^"]+)"\s*\}', text, flags=re.S):
        if extra.startswith(("http://", "https://")):
            continue
        path = ROOT / extra
        if not path.exists():
            errors.append(f"Missing extra action asset: {extra}")

    for url in re.findall(r'url:\s*"([^"]+)"', text):
        if url.startswith(("http://", "https://")):
            continue
        path = ROOT / url
        if not path.exists():
            errors.append(f"Missing product URL target: {url}")

    if errors:
        print("Product asset validation failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    print("All product asset references passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
