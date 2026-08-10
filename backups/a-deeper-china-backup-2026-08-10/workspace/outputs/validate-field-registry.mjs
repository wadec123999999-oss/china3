import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const registry = JSON.parse(fs.readFileSync(path.join(root, '现场核验总登记册_V1.0.json'), 'utf8'));
const template = JSON.parse(fs.readFileSync(path.join(root, '现场核验记录模板_V1.0.json'), 'utf8'));
const errors = [];
const allowedStatus = new Set(['not_started', 'in_progress', 'blocked', 'passed', 'failed']);
const requiredTemplate = ['launch_check_id','city','reviewer','field_date','status','route_reality','dynamic_checks','foreign_visitor_usability','ethical_and_commercial_gate','evidence','blocking_conditions','decision','follow_up_actions','sign_off'];
for (const key of requiredTemplate) if (!(key in template)) errors.push(`template missing ${key}`);
if (registry.cities.length !== 13) errors.push(`expected 13 cities, found ${registry.cities.length}`);
for (const city of registry.cities) {
  if (!allowedStatus.has(city.status)) errors.push(`${city.city}: invalid status ${city.status}`);
  const dbPath = path.join(root, '..', city.database);
  const runtimePath = path.join(root, '..', city.runtime);
  if (!fs.existsSync(dbPath)) { errors.push(`${city.city}: missing database ${city.database}`); continue; }
  if (!fs.existsSync(runtimePath)) { errors.push(`${city.city}: missing runtime ${city.runtime}`); continue; }
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const packagePath = path.join(runtimePath, 'package.json');
  const corePath = path.join(runtimePath, 'src/core.mjs');
  if (!fs.existsSync(packagePath) || !JSON.parse(fs.readFileSync(packagePath, 'utf8')).scripts?.['validate:decision-layer']) errors.push(`${city.city}: missing validate:decision-layer script`);
  if (!fs.existsSync(corePath)) errors.push(`${city.city}: missing src/core.mjs`);
  else { const core = fs.readFileSync(corePath, 'utf8'); if (!core.includes('decisionLayerVersion') || !core.includes('pointDecisionLayerVersion')) errors.push(`${city.city}: runtime version contract missing`); }
  let available = [];
  if (Array.isArray(db.launch_checks)) available = db.launch_checks.map(check => check.id ?? check.launch_check_id);
  if (Array.isArray(db.launch_field_checks)) available = db.launch_field_checks.map(check => check.id ?? check.launch_check_id);
  if (city.city === 'Shanghai') {
    const fieldOpsPath = path.join(runtimePath, 'src/field-ops.mjs');
    if (fs.existsSync(fieldOpsPath)) available = [...fs.readFileSync(fieldOpsPath, 'utf8').matchAll(/id:\s*['"]([^'"]+)['"]/g)].map(match => match[1]);
  }
  for (const id of city.launch_checks) if (!available.includes(id)) errors.push(`${city.city}: registry references unavailable launch check ${id}`);
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`VALID FIELD REGISTRY V1: ${registry.cities.length} cities; ${registry.standard_gates.length} standard gates; template ${requiredTemplate.length} required sections`);
