#!/usr/bin/env python3
import json
import sys
from pathlib import Path

REPORT_DIR = Path("reports/lighthouse")
REPORT_NAMES = ("home", "sounds", "plugins")
THRESHOLDS = {
    "performance": 85,
    "accessibility": 95,
    "best-practices": 95,
    "seo": 95,
}

status = 0

for report_name in REPORT_NAMES:
    report_path = REPORT_DIR / f"{report_name}.report.json"
    if not report_path.exists():
        print(f"Missing report: {report_path}")
        status = 1
        continue

    report = json.loads(report_path.read_text(encoding="utf-8"))
    categories = report.get("categories", {})
    for key, threshold in THRESHOLDS.items():
        category = categories.get(key)
        if not category:
            print(f"{report_name}: missing category {key}")
            status = 1
            continue
        score = round(float(category.get("score", 0)) * 100)
        print(f"{report_name} {key}: {score} (threshold {threshold})")
        if score < threshold:
            status = 1

if status != 0:
    print("Lighthouse thresholds failed.")
else:
    print("Lighthouse thresholds passed.")

sys.exit(status)
