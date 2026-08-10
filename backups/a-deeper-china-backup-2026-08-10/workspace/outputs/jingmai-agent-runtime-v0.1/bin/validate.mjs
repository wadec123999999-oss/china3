import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { database } from '../src/core.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../jingmai-agent-database-20260802');
const layer = JSON.parse(fs.readFileSync(path.join(root, '景迈茶山决策字段_V1.0.json'), 'utf8'));
const pointLayer = JSON.parse(fs.readFileSync(path.join(root, '景迈茶山点位决策字段_V1.0.json'), 'utf8'));
for (const key of ['metadata','modules','points','signals','follow_up_questions','launch_checks']) if (!database[key]) throw new Error(`Missing ${key}`);
if (database.modules.length < 8 || database.points.length < 20 || database.signals.length < 20) throw new Error('Below V0.1 depth');
for (const point of database.points) for (const key of ['id','module_id','why_it_matters','friction','field_status']) if (!(key in point)) throw new Error(`${point.id} missing ${key}`);
const moduleKeys = ['guest_need','hidden_need','selection_trigger','why_this_over_nearby_alternative','stop_condition','low_energy_branch','rain_branch','body_cost','point_mode','current_check_type','field_run_required','release_boundary'];
const moduleIds = new Set(database.modules.map(module => module.id));
if (layer.metadata?.version !== '1.0' || Object.keys(layer.modules ?? {}).length !== moduleIds.size) throw new Error('Decision layer metadata or module count mismatch');
for (const id of moduleIds) { const profile = layer.modules[id]; if (!profile) throw new Error(`Missing decision profile ${id}`); for (const key of moduleKeys) if (profile[key] === undefined || profile[key] === null || profile[key] === '') throw new Error(`${id} missing ${key}`); }
const pointIds = new Set(database.points.map(point => point.id));
if (pointLayer.metadata?.version !== '1.0' || Object.keys(pointLayer.guest_name_map ?? {}).length !== pointIds.size) throw new Error('Point decision layer metadata or guest-name map mismatch');
for (const id of pointIds) { const profile = pointLayer.points?.[id]; if (!profile) throw new Error(`Missing point decision profile ${id}`); const merged = { ...(pointLayer.defaults ?? {}), ...profile }; for (const key of ['point_role','guest_value','choose_rule','stop_after','alternative_to','field_focus','release_status']) if (merged[key] === undefined || merged[key] === null || merged[key] === '') throw new Error(`${id} missing ${key}`); }
console.log(`VALID V1: ${database.modules.length} modules; ${database.points.length} points; ${database.signals.length} signals; ${database.follow_up_questions.length} follow-up rules; ${database.launch_checks.length} launch checks; ${moduleIds.size} decision profiles; ${pointIds.size} point decision profiles`);
