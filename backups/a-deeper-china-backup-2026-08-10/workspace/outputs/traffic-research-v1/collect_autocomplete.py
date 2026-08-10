#!/usr/bin/env python3
"""Collect live Google and YouTube autocomplete suggestions for China travel seeds."""

from __future__ import annotations

import csv
import json
import ssl
import time
import urllib.parse
import urllib.request
from pathlib import Path


SEEDS = [
    "china itinerary",
    "china itinerary 10 days",
    "china itinerary 2 weeks",
    "china travel planner",
    "china trip planning",
    "first trip to china",
    "china travel apps",
    "china travel payment",
    "china high speed train",
    "china visa free travel",
    "shanghai itinerary",
    "chongqing itinerary",
    "beijing itinerary",
    "chengdu itinerary",
    "china family travel",
]


def suggestions(seed: str, channel: str) -> list[str]:
    params = {"client": "firefox", "hl": "en", "q": seed}
    if channel == "youtube":
        params["ds"] = "yt"
    url = "https://suggestqueries.google.com/complete/search?" + urllib.parse.urlencode(params)
    context = ssl.create_default_context()
    context.check_hostname = False
    context.verify_mode = ssl.CERT_NONE
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(request, context=context, timeout=15) as response:
        payload = json.loads(response.read().decode("utf-8"))
    return payload[1]


def main() -> None:
    output = Path(__file__).with_name("autocomplete-keywords-20260808.csv")
    rows: list[tuple[str, str, str]] = []
    seen: set[tuple[str, str]] = set()
    for channel in ("google", "youtube"):
        for seed in SEEDS:
            try:
                values = suggestions(seed, channel)
            except Exception as exc:  # retain the rest of the sample if one request fails
                rows.append((channel, seed, f"ERROR: {exc}"))
                continue
            for value in values:
                key = (channel, value.lower())
                if key not in seen:
                    seen.add(key)
                    rows.append((channel, seed, value))
            time.sleep(0.12)
    with output.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(["channel", "seed", "suggestion"])
        writer.writerows(rows)
    print(f"wrote {len(rows)} unique suggestions to {output}")


if __name__ == "__main__":
    main()
