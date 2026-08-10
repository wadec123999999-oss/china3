import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const qualityDir = path.resolve(here, '../../a-deeper-china-quality-system-v0.1');

const REFRESH_FILES = {
  Shanghai: '上海当前来源刷新_20260803.json',
  Chongqing: '重庆当前来源刷新_20260803.json',
  Beijing: '北京当前来源刷新_20260803.json',
  Chengdu: '成都当前来源刷新_20260803.json',
  Guangzhou: '广州深圳当前来源刷新_20260803.json',
  Shenzhen: '广州深圳当前来源刷新_20260803.json',
  'Guilin–Yangshuo': '桂林阳朔当前来源刷新_20260803.json',
  Hangzhou: '杭州苏州当前来源刷新_20260803.json',
  Suzhou: '杭州苏州当前来源刷新_20260803.json',
  'Quanzhou–Dehua': '泉州德化当前来源刷新_20260803.json',
  Jingdezhen: '景德镇当前来源刷新_20260803.json',
  'Wudang Mountains': '武当山当前来源刷新_20260803.json',
  'Jingmai Mountain': '景迈茶山当前来源刷新_20260803.json'
};

function dateOnly(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

function cityMatches(record, city) {
  const requested = String(city || '').toLowerCase();
  const parts = requested.split(/[–-]/).map(part => part.trim()).filter(Boolean);
  return Array.isArray(record.city_scope) && record.city_scope.some(scope => {
    const value = String(scope).toLowerCase();
    return parts.some(part => value === part || value.includes(part) || part.includes(value));
  });
}

function moduleMatches(record, moduleIds) {
  if (!moduleIds.length) return true;
  return Array.isArray(record.module_ids) && record.module_ids.some(id => moduleIds.includes(id));
}

function taskId(city, index) {
  return `CST-${String(city).toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '')}-${String(index + 1).padStart(2, '0')}`;
}

/**
 * Convert dated source-refresh records into concrete, empty evidence tasks.
 * The result is intentionally not evidence: a reviewer must still supply
 * checked_by, checked_at, evidence_url and a concrete finding for the exact
 * client travel date.
 */
export function createCurrentSourceTasks({
  city,
  module_ids = [],
  travel_start,
  travel_end,
  as_of = '2026-08-03T23:59:59+08:00'
} = {}) {
  const errors = [];
  if (!city) errors.push('city is required');
  if (!dateOnly(travel_start)) errors.push('travel_start must be YYYY-MM-DD');
  if (!dateOnly(travel_end)) errors.push('travel_end must be YYYY-MM-DD');
  if (dateOnly(travel_start) && dateOnly(travel_end) && travel_start > travel_end) errors.push('travel_end must be on or after travel_start');
  if (!Array.isArray(module_ids) || module_ids.some(id => typeof id !== 'string')) errors.push('module_ids must be an array of strings');
  const filename = REFRESH_FILES[city];
  if (!filename) errors.push(`no dated source-refresh file is registered for ${city || 'this city'}`);
  if (errors.length) return { valid: false, status: 'invalid', errors, city: city || null, tasks: [] };

  const refreshPath = path.join(qualityDir, filename);
  if (!fs.existsSync(refreshPath)) return { valid: false, status: 'invalid', errors: [`source-refresh file missing: ${filename}`], city, tasks: [] };
  const records = JSON.parse(fs.readFileSync(refreshPath, 'utf8'));
  const selected = records.filter(record =>
    cityMatches(record, city) &&
    record.source_use === 'requires_current_check' &&
    moduleMatches(record, module_ids)
  );
  const tasks = selected.map((record, index) => ({
    task_id: taskId(city, index),
    source_id: record.source_id,
    module_ids: Array.isArray(record.module_ids) ? record.module_ids : [],
    source_url: record.url || null,
    claim_to_check: record.claim,
    applies_to_travel_start: travel_start,
    applies_to_travel_end: travel_end,
    required_evidence: {
      checked_by: null,
      checked_at: null,
      evidence_url: null,
      finding: null
    },
    status: 'pending',
    instruction: 'Do not mark complete from the source page alone; record what was checked for this client date and attach the page, screenshot, call record or field note.'
  }));

  return {
    valid: true,
    status: tasks.length ? 'pending_current_check' : 'no_dynamic_tasks_for_selected_scope',
    city,
    module_ids,
    travel_start,
    travel_end,
    source_refresh_as_of: as_of,
    source_refresh_file: filename,
    tasks,
    boundary: 'These are empty review tasks, not evidence and not a release decision.'
  };
}

export { REFRESH_FILES };
