# Shanghai Agent Runtime V0.1

This folder is the deterministic layer between the Shanghai content database and a future website agent. It does not book services, process payment, or claim live operating facts.

## Input contract

```json
{
  "days": 3,
  "firstVisit": true,
  "interests": ["architecture", "photo"],
  "withFamily": false,
  "weatherConstraint": false,
  "mobility": "standard"
}
```

Supported interest tags: `architecture`, `art_design`, `history`, `slow`, `photo`, `family`, `rain_heat`, `tai_chi`, `jiangnan_extension`.

## Output contract

`decide(input)` returns selected modules, points, necessary follow-up questions, warnings and a mandatory `draft_for_human_review` status. Selected modules and points are enriched from the database-side decision layers:

- `上海决策字段_V1.0.json`: guest need, inferred need, selection trigger, stop rule, body cost, fallback and release boundary for all 24 modules.
- `上海点位决策字段_V1.0.json`: point role, use rule, stop condition, alternatives, field focus and release status for all 40 points.

`renderRoadbook(input)` produces guest-facing controlled English. It deliberately excludes internal IDs, rank scores and all unverified commercial claims.

## Commercial boundary

The database’s Tai Chi item is a `research_candidate`. The runtime never quotes, books or collects payment for it. Change that only after the seven-gate supplier record has real evidence and a human approves `commercial_release`.

## Verify

```bash
npm test
node bin/validate-v1-database.mjs
node bin/roadbook.mjs path/to/input.json
```
