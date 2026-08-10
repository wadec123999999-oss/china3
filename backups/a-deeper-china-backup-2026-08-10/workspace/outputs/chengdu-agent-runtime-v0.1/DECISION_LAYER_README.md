# Chengdu decision layers

The runtime reads two database-side editorial layers:

- `../chengdu-agent-database-20260802/成都决策字段_V1.0.json` — module selection, inferred needs, stop rules, body cost and fallback branches.
- `../chengdu-agent-database-20260802/成都点位决策字段_V1.0.json` — point roles, use rules, stop conditions, alternatives, field focus and English guest names.

They make the roadbook explain why one Chengdu branch was chosen and what was deliberately left out. They do not constitute field verification, live availability or booking permission.

```bash
npm run validate:decision-layer
npm test
```
