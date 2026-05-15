#!/usr/bin/env python3
from __future__ import annotations

import argparse
import subprocess
import sys
import xml.etree.ElementTree as ET
from datetime import date
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SITEMAP = ROOT / "sitemap.xml"
NS = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
ET.register_namespace("", NS["sm"])


def run_git(args: list[str]) -> str:
    result = subprocess.run(
        ["git", *args],
        cwd=ROOT,
        check=False,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        return ""
    return result.stdout.strip()


def loc_to_path(loc: str) -> Path | None:
    prefix = "https://kreativsound.com"
    if not loc.startswith(prefix):
        return None
    route = loc[len(prefix):]

    if route.startswith("/posts/") and route.endswith(".html"):
        slug = route.split("/posts/", 1)[1][:-5]
        return ROOT / "src/content/posts" / f"{slug}.md"

    if route.startswith("/products/"):
        return ROOT / "src/lib/product-pages.ts"

    if route == "/":
        return ROOT / "src/pages/index.astro"

    if route.endswith("/"):
        return ROOT / "src/pages" / route.strip("/") / "index.astro"

    return ROOT / route.lstrip("/")


def compute_lastmod(path: Path) -> str:
    today = date.today().isoformat()
    rel = path.relative_to(ROOT).as_posix()
    status = run_git(["status", "--porcelain", "--", rel])
    if status:
        return today
    committed = run_git(["log", "-1", "--format=%cs", "--", rel])
    return committed or today


def updated_tree() -> tuple[ET.ElementTree, bool]:
    tree = ET.parse(SITEMAP)
    changed = False
    for url in tree.findall("sm:url", NS):
        loc_node = url.find("sm:loc", NS)
        lastmod_node = url.find("sm:lastmod", NS)
        if loc_node is None or lastmod_node is None or not loc_node.text:
            continue
        mapped = loc_to_path(loc_node.text)
        if mapped is None or not mapped.exists():
            continue
        desired = compute_lastmod(mapped)
        if lastmod_node.text != desired:
            lastmod_node.text = desired
            changed = True
    return tree, changed


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="Exit non-zero if sitemap.xml needs updates.")
    args = parser.parse_args()

    tree, changed = updated_tree()

    if args.check:
        if changed:
            print("sitemap.xml lastmod values are stale. Run python3 scripts/update-sitemap-lastmod.py and commit the result.")
            return 1
        print("sitemap.xml lastmod values are current.")
        return 0

    ET.indent(tree, space="  ")
    tree.write(SITEMAP, encoding="UTF-8", xml_declaration=True)
    print("Updated sitemap.xml lastmod values.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
