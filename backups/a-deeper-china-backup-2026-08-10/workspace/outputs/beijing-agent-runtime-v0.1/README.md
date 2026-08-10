# Beijing Agent Runtime V0.1

This deterministic layer sits between the Beijing database and a future website agent. It does not book services, process payment or claim live access.

The runtime reads two database-side editorial layers:

- `../beijing-agent-database-20260802/北京决策字段_V1.0.json`: module selection, inferred needs, stop rules, body cost and fallback branches.
- `../beijing-agent-database-20260802/北京点位决策字段_V1.0.json`: point roles, use rules, stop conditions, alternatives, field focus and English guest names.

Both layers are research structures, not field verification or booking permission.

```bash
npm test
npm run regression
npm run validate:decision-layer
npm run roadbook
```
