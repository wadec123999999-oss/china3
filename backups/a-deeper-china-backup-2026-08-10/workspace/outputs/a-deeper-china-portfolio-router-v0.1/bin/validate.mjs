import { CITY_UNITS } from '../src/portfolio.mjs';
const ids = CITY_UNITS.map(x => x.id);
if (new Set(ids).size !== ids.length) throw new Error('Duplicate city-unit IDs');
for (const unit of CITY_UNITS) if (!unit.name || !unit.themes.length || !unit.minNights || !unit.cautions.length) throw new Error(`Incomplete unit: ${unit.id}`);
console.log(`VALID V0.1: ${CITY_UNITS.length} city units; ${ids.length} unique IDs`);
