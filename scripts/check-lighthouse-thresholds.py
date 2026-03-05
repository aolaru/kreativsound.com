#!/usr/bin/env python3
import json
import sys
from pathlib import Path

REPORT_PATH = Path("reports/lighthouse/latest.report.json")
THRESHOLDS = {
    "performance": 85,
    "accessibility": 95,
    "best-practices": 95,
    "seo": 95,
}

if not REPORT_PATH.exists():
    print(f"Missing report: {REPORT_PATH}")
    sys.exit(1)

report = json.loads(REPORT_PATH.read_text(encoding="utf-8"))
categories = report.get("categories", {})
status = 0

for key, threshold in THRESHOLDS.items():
    category = categories.get(key)
    if not category:
      print(f"Missing category in report: {key}")
      status = 1
      continue
    score = round(float(category.get("score", 0)) * 100)
    print(f"{key}: {score} (threshold {threshold})")
    if score < threshold:
        status = 1

if status != 0:
    print("Lighthouse thresholds failed.")
else:
    print("Lighthouse thresholds passed.")

sys.exit(status)
