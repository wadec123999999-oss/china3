#!/usr/bin/env python3
"""Cluster the collected autocomplete sample into intent themes."""

from __future__ import annotations

import csv
import json
import re
from collections import Counter, defaultdict
from pathlib import Path


RULES = [
    ("duration_itinerary", r"\b(day|days|week|weeks|month|itinerary|route)\b"),
    ("first_time_choice", r"first (trip|time|visit)|where (to|should)|beijing or shanghai"),
    ("planner_tool", r"planner|planning|plan app|route planner|journey planner|map"),
    ("community_validation", r"reddit|forum|review"),
    ("practical_apps_payment", r"app|apps|payment|cashless|alipay|wechat|vpn|sim"),
    ("transport", r"train|rail|flight|transport|transfer"),
    ("visa_policy", r"visa|policy|rules|transit"),
    ("family", r"family|kids|children|baby"),
    ("cost_budget", r"cost|budget|cheap|price"),
    ("city_specific", r"shanghai|chongqing|beijing|chengdu"),
]


def main() -> None:
    root = Path(__file__).parent
    source = root / "autocomplete-keywords-20260808.csv"
    output = root / "autocomplete-intent-summary-20260808.json"
    counts: Counter[str] = Counter()
    by_channel: dict[str, Counter[str]] = defaultdict(Counter)
    examples: dict[str, list[str]] = defaultdict(list)
    total = 0
    with source.open(encoding="utf-8") as handle:
        for row in csv.DictReader(handle):
            query = row["suggestion"].lower()
            if query.startswith("error:"):
                continue
            total += 1
            matched = False
            for name, pattern in RULES:
                if re.search(pattern, query):
                    counts[name] += 1
                    by_channel[row["channel"]][name] += 1
                    if len(examples[name]) < 12:
                        examples[name].append(row["suggestion"])
                    matched = True
            if not matched:
                counts["other"] += 1
                by_channel[row["channel"]]["other"] += 1
    payload = {
        "sample_date": "2026-08-08",
        "method": "Live Google/YouTube autocomplete suggestions; directional intent evidence, not keyword volume.",
        "total_unique_suggestions": total,
        "theme_counts_multi_label": dict(counts.most_common()),
        "by_channel": {key: dict(value.most_common()) for key, value in by_channel.items()},
        "examples": examples,
    }
    output.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(payload, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
