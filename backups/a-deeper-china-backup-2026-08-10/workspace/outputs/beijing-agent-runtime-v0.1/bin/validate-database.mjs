import { database } from '../src/core.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const decisionLayer = JSON.parse(fs.readFileSync(path.resolve(here, '../../beijing-agent-database-20260802/北京决策字段_V1.0.json'), 'utf8'));
const pointDecisionLayer = JSON.parse(fs.readFileSync(path.resolve(here, '../../beijing-agent-database-20260802/北京点位决策字段_V1.0.json'), 'utf8'));
const required = ['metadata', 'modules', 'points', 'signals', 'follow_up_questions', 'launch_checks'];
for (const key of required) if (!database[key]) throw new Error('Missing ' + key);
if (database.modules.length < 8 || database.points.length < 20 || database.signals.length < 20) throw new Error('Database is below V0.1 minimum depth.');
for (const point of database.points) for (const key of ['id', 'name', 'module_id', 'why_it_matters', 'friction', 'field_status']) if (!(key in point)) throw new Error(point.id + ' missing ' + key);
const requiredDecision = ['guest_need','hidden_need','selection_trigger','why_this_over_nearby_alternative','stop_condition','low_energy_branch','rain_branch','body_cost','point_mode','current_check_type','field_run_required','release_boundary'];
const moduleIds = new Set(database.modules.map(module => module.id));
if (Object.keys(decisionLayer.modules ?? {}).length !== moduleIds.size) throw new Error('Decision layer module count mismatch');
for (const id of moduleIds) {
  const profile = decisionLayer.modules[id];
  if (!profile) throw new Error('Missing decision profile ' + id);
  for (const field of requiredDecision) if (profile[field] === undefined || profile[field] === null || profile[field] === '') throw new Error(`${id} missing ${field}`);
}
const pointIds = new Set(database.points.map(point => point.id));
if (Object.keys(pointDecisionLayer.points ?? {}).length !== pointIds.size) throw new Error('Point decision layer count mismatch');
if (Object.keys(pointDecisionLayer.guest_name_map ?? {}).length !== pointIds.size) throw new Error('Point guest-name map count mismatch');
for (const id of pointIds) {
  const profile = pointDecisionLayer.points[id];
  if (!profile) throw new Error('Missing point decision profile ' + id);
  for (const field of ['point_role','guest_value','choose_rule','stop_after','alternative_to','field_focus','release_status']) if (profile[field] === undefined || profile[field] === null || profile[field] === '') throw new Error(`${id} missing ${field}`);
  if (!String(pointDecisionLayer.guest_name_map[id] ?? '').trim()) throw new Error(`${id} missing guest name`);
}
console.log('VALID V1: ' + database.modules.length + ' modules; ' + database.points.length + ' points; ' + database.signals.length + ' signals; ' + database.follow_up_questions.length + ' follow-up rules; ' + database.launch_checks.length + ' launch checks; ' + moduleIds.size + ' decision profiles; ' + pointIds.size + ' point decision profiles');
