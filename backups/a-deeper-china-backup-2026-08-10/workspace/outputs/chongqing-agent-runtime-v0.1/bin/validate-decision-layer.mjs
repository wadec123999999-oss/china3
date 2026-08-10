#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const database = JSON.parse(fs.readFileSync(path.resolve(here, "../../chongqing-agent-database-20260729/重庆主城智能体数据库_V1.0.json"), "utf8"));
const layer = JSON.parse(fs.readFileSync(path.resolve(here, "../../chongqing-agent-database-20260729/重庆决策字段_V1.0.json"), "utf8"));
const pointLayer = JSON.parse(fs.readFileSync(path.resolve(here, "../../chongqing-agent-database-20260729/重庆点位决策字段_V1.0.json"), "utf8"));
const required = ["guest_need", "hidden_need", "selection_trigger", "why_this_over_nearby_alternative", "stop_condition", "low_energy_branch", "rain_branch", "body_cost", "point_mode", "current_check_type", "field_run_required", "release_boundary"];
const modes = new Set(["single", "sequence", "choose_one", "conditional", "method"]);
const databaseIds = new Set(database.route_modules.map((module) => module["模块ID"]));
const layerIds = new Set(Object.keys(layer.modules ?? {}));
if (databaseIds.size !== layerIds.size) throw new Error(`Expected ${databaseIds.size} decision profiles, got ${layerIds.size}`);
for (const id of databaseIds) {
  const profile = layer.modules[id];
  if (!profile) throw new Error(`Missing decision profile ${id}`);
  for (const field of required) if (profile[field] === undefined || profile[field] === null || profile[field] === "") throw new Error(`Incomplete ${id}.${field}`);
  if (!Array.isArray(profile.selection_trigger) || !profile.selection_trigger.length) throw new Error(`Invalid selection_trigger ${id}`);
  if (!Array.isArray(profile.current_check_type) || !profile.current_check_type.length) throw new Error(`Invalid current_check_type ${id}`);
  if (!modes.has(profile.point_mode)) throw new Error(`Invalid point_mode ${id}.${profile.point_mode}`);
  if (typeof profile.field_run_required !== "boolean") throw new Error(`Invalid field_run_required ${id}`);
}
console.log(`VALID DECISION LAYER: ${layerIds.size} Chongqing module profiles`);
const pointIds = new Set(database.points.map((point) => point.ID));
const pointLayerIds = new Set(Object.keys(pointLayer.points ?? {}));
if (pointIds.size !== pointLayerIds.size) throw new Error(`Expected ${pointIds.size} point profiles, got ${pointLayerIds.size}`);
const pointRequired = ["point_role", "guest_value", "choose_rule", "stop_after", "alternative_to", "field_focus", "release_status"];
for (const id of pointIds) {
  const profile = pointLayer.points[id];
  if (!profile) throw new Error(`Missing point decision profile ${id}`);
  for (const field of pointRequired) if (profile[field] === undefined || profile[field] === null || profile[field] === "") throw new Error(`Incomplete ${id}.${field}`);
  if (!Array.isArray(profile.alternative_to) || !Array.isArray(profile.field_focus)) throw new Error(`Invalid arrays ${id}`);
}
console.log(`VALID POINT LAYER: ${pointLayerIds.size} Chongqing point profiles`);
