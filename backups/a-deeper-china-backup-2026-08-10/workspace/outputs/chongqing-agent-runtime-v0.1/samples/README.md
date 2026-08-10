# Chongqing English Roadbook Samples

These files demonstrate how the deterministic runtime turns a traveller request into guest-facing English. They are editorial and safety-boundary samples, not confirmed bookings.

| File | Scenario | What it demonstrates |
|---|---|---|
| `sample-1day-first-visit.md` | First visit, one day, wants to understand the city | Global selection across all 24 modules and a three-part city narrative |
| `sample-1day-history.md` | Migration and wartime history | Theme-led selection without adding unrelated visual landmarks |
| `sample-1day-food.md` | Food culture in one day | Food as social interpretation, with allergy and commercial boundaries |
| `sample-1day-repeat-visitor.md` | Repeat visitor seeking Huangjueping and a teahouse | Suppression of the standard first-visit skyline route |
| `sample-3day-family-draft.md` | Lower walking load and missing arrival details | Follow-up questions, hard filtering and an unreleased draft state |

All five samples:

- use the controlled English module library rather than live translation;
- omit module IDs, internal scores and inferred profile labels;
- show dynamic or venue-level checks before release;
- refuse to turn research candidates into a price, booking or availability promise.

Regenerate them with `npm run samples`.
