#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const db = JSON.parse(fs.readFileSync(path.join(here, '../../shanghai-agent-database-20260802/上海主城智能体数据库_V1.0.json'), 'utf8'));
const decisionLayer = JSON.parse(fs.readFileSync(path.join(here, '../../shanghai-agent-database-20260802/上海决策字段_V1.0.json'), 'utf8'));
const pointDecisionLayer = JSON.parse(fs.readFileSync(path.join(here, '../../shanghai-agent-database-20260802/上海点位决策字段_V1.0.json'), 'utf8'));
const checks = [
  ['route_modules', 24], ['route_module_localizations', 24], ['points', 40], ['story_cards', 15],
  ['signals', 30], ['follow_up_rules', 15], ['regression_tests', 60]
];
for (const [key,count] of checks) if (!Array.isArray(db[key]) || db[key].length !== count) throw new Error(`${key} must contain ${count}`);
for (const point of db.points) if (!point.id || !point.module || !point.why || !point.friction) throw new Error(`Incomplete point ${point.id}`);
for (const localized of db.route_module_localizations) if (!localized.module_id || !localized.english_title || !localized.guest_promise) throw new Error(`Incomplete localization ${localized.module_id}`);
const moduleIds = new Set(db.route_modules.map(module => module.id));
const decisionIds = new Set(Object.keys(decisionLayer.modules || {}));
if (decisionIds.size !== db.route_modules.length) throw new Error(`Decision layer must contain ${db.route_modules.length} module profiles`);
for (const id of moduleIds) if (!decisionIds.has(id)) throw new Error(`Missing decision profile ${id}`);
const requiredDecisionFields = ['guest_need', 'hidden_need', 'selection_trigger', 'why_this_over_nearby_alternative', 'stop_condition', 'low_energy_branch', 'rain_branch', 'body_cost', 'point_mode', 'current_check_type', 'field_run_required', 'release_boundary'];
const allowedPointModes = new Set(['single', 'sequence', 'choose_one', 'conditional', 'method']);
for (const [id, profile] of Object.entries(decisionLayer.modules || {})) {
  for (const field of requiredDecisionFields) if (profile[field] === undefined || profile[field] === null || profile[field] === '') throw new Error(`Incomplete decision profile ${id}.${field}`);
  if (!Array.isArray(profile.selection_trigger) || !profile.selection_trigger.length) throw new Error(`Invalid selection_trigger ${id}`);
  if (!Array.isArray(profile.current_check_type) || !profile.current_check_type.length) throw new Error(`Invalid current_check_type ${id}`);
  if (!allowedPointModes.has(profile.point_mode)) throw new Error(`Invalid point_mode ${id}.${profile.point_mode}`);
  if (typeof profile.field_run_required !== 'boolean') throw new Error(`Invalid field_run_required ${id}`);
}
const allPointIds = new Set(db.points.map(point => point.id));
const decisionPointIds = new Set(Object.keys(pointDecisionLayer.points || {}));
if (decisionPointIds.size !== allPointIds.size) throw new Error(`Point decision layer must contain ${allPointIds.size} profiles`);
for (const id of allPointIds) if (!decisionPointIds.has(id)) throw new Error(`Missing point decision profile ${id}`);
const requiredPointFields = ['point_role', 'guest_value', 'choose_rule', 'stop_after', 'alternative_to', 'field_focus', 'release_status'];
for (const [id, profile] of Object.entries(pointDecisionLayer.points || {})) {
  for (const field of requiredPointFields) if (profile[field] === undefined || profile[field] === null || profile[field] === '') throw new Error(`Incomplete point decision profile ${id}.${field}`);
  if (!Array.isArray(profile.alternative_to) || !Array.isArray(profile.field_focus)) throw new Error(`Invalid arrays in point decision profile ${id}`);
}
console.log('VALID V1: 24 modules; 40 points; 24 localizations; 30 signals; 15 follow-up rules; 15 story cards; 60 regression cases; 24 decision profiles; 40 point decision profiles');
