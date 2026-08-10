import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

const PLATFORMS = new Set([
  'official', 'on_site', 'xiaohongshu', 'mafengwo', 'qyer', 'ctrip',
  'dianping', 'wechat', 'douyin', 'bilibili', 'youtube', 'tiktok',
  'reddit', 'google_maps', 'other'
]);
const EVIDENCE_STATUSES = new Set(['lead_only', 'corroborated', 'field_verified', 'contradicted', 'expired']);
const SOURCE_USES = new Set([
  'lead_only', 'corroborate_before_database', 'context_with_citation',
  'requires_current_check', 'eligible_for_human_checked', 'exclude'
]);
const REVIEW_STATUSES = new Set([
  'unreviewed', 'usable_as_context', 'needs_corroboration',
  'dynamic_check_required', 'community_signal_only', 'excluded'
]);

function isDate(value) {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

function isUrl(value) {
  return typeof value === 'string' && /^https?:\/\/[^\s]+$/i.test(value);
}

function cityMatches(record, city) {
  if (!city || !Array.isArray(record.city_scope) || record.city_scope.length === 0) return true;
  const requested = String(city).toLowerCase();
  const requestedParts = requested.split(/[–-]/).map(value => value.trim()).filter(Boolean);
  return record.city_scope.some(scope => {
    const value = String(scope).toLowerCase();
    return requestedParts.some(part => value === part || value.includes(part) || part.includes(value));
  });
}

function knownModuleIds(databasePath) {
  if (!databasePath) return null;
  const database = JSON.parse(fs.readFileSync(databasePath, 'utf8'));
  const modules = database.modules || database.route_modules || [];
  return new Set(modules.map(module => (
    module.id || module.module_id || module['模块ID'] || module.name || module['模块名称']
  )).filter(Boolean));
}

/**
 * Audit a source pack before it can be used by the research/runtime layer.
 * This is intentionally stricter than the JSON schema: source packs are
 * research leads, never the place to assert field verification.
 */
export function auditSourcePack(records, {
  city = null,
  databasePath = null,
  asOf = '2026-08-03T23:59:59+08:00'
} = {}) {
  const errors = [];
  const warnings = [];
  const rows = Array.isArray(records) ? records : [];
  if (!Array.isArray(records)) errors.push('source pack must be an array');
  if (!isDate(asOf)) errors.push('asOf must be a parseable date-time');
  const asOfTime = isDate(asOf) ? Date.parse(asOf) : Number.POSITIVE_INFINITY;
  const ids = new Set();
  const modules = knownModuleIds(databasePath);

  rows.forEach((record, index) => {
    const prefix = `record[${index}]`;
    if (!record || typeof record !== 'object' || Array.isArray(record)) {
      errors.push(`${prefix} must be an object`);
      return;
    }
    const required = ['schema_version', 'source_id', 'platform', 'captured_at', 'city_scope', 'claim_type', 'claim', 'commercial_signal', 'independence', 'evidence_status', 'review_status', 'source_score', 'source_use'];
    for (const key of required) if (!(key in record)) errors.push(`${prefix}.${key} is required`);
    if (record.schema_version !== '0.1') errors.push(`${prefix}.schema_version must be 0.1`);
    if (typeof record.source_id !== 'string' || !/^SRC-[A-Z][A-Z-]{1,23}-[0-9]{8}-[A-Z0-9-]{2,32}$/.test(record.source_id)) {
      errors.push(`${prefix}.source_id has an invalid format`);
    } else if (ids.has(record.source_id)) {
      errors.push(`${prefix}.source_id is duplicated: ${record.source_id}`);
    } else ids.add(record.source_id);
    if (!PLATFORMS.has(record.platform)) errors.push(`${prefix}.platform is unsupported`);
    if (!isDate(record.captured_at)) errors.push(`${prefix}.captured_at must be a date-time`);
    else if (Date.parse(record.captured_at) > asOfTime) errors.push(`${prefix}.captured_at is after audit date`);
    if (record.published_at !== null && record.published_at !== undefined && !isDate(record.published_at)) errors.push(`${prefix}.published_at must be null or a date-time`);
    if (isDate(record.published_at) && isDate(record.captured_at) && Date.parse(record.published_at) > Date.parse(record.captured_at)) errors.push(`${prefix}.published_at is after captured_at`);
    if (!Array.isArray(record.city_scope) || record.city_scope.length === 0) errors.push(`${prefix}.city_scope must be non-empty`);
    else if (!cityMatches(record, city)) errors.push(`${prefix}.city_scope does not match ${city}`);
    if (!isUrl(record.url)) warnings.push(`${prefix} has no normalized URL`);
    if (typeof record.claim !== 'string' || record.claim.trim().length < 10) errors.push(`${prefix}.claim is too short`);
    if (!EVIDENCE_STATUSES.has(record.evidence_status)) errors.push(`${prefix}.evidence_status is unsupported`);
    if (!SOURCE_USES.has(record.source_use)) errors.push(`${prefix}.source_use is unsupported`);
    if (!REVIEW_STATUSES.has(record.review_status)) errors.push(`${prefix}.review_status is unsupported`);
    if (record.evidence_status === 'field_verified' || record.source_use === 'eligible_for_human_checked') {
      errors.push(`${prefix} claims field verification in a source pack; use a dated field record instead`);
    }
    if (!Number.isInteger(record.source_score) || record.source_score < 0 || record.source_score > 100) errors.push(`${prefix}.source_score must be an integer from 0 to 100`);
    if (!Array.isArray(record.corroboration_ids)) errors.push(`${prefix}.corroboration_ids must be an array`);
    if (Array.isArray(record.corroboration_ids)) {
      for (const id of record.corroboration_ids) {
        if (id === record.source_id) errors.push(`${prefix}.corroboration_ids cannot contain itself`);
        if (typeof id !== 'string') errors.push(`${prefix}.corroboration_ids contains a non-string value`);
      }
    }
    if (Array.isArray(record.module_ids) && modules) {
      for (const moduleId of record.module_ids) {
        if (modules.has(moduleId)) continue;
        // A shared source pack may bind one record to modules in both component
        // cities. Validate only the module IDs owned by the city being audited;
        // the other component will validate them on its own pass.
        if (Array.isArray(record.city_scope) && record.city_scope.length > 1) {
          warnings.push(`${prefix}.module_ids includes a component-city module outside ${city}: ${moduleId}`);
        } else {
          errors.push(`${prefix}.module_ids references unknown module ${moduleId}`);
        }
      }
    }
    if (record.review_status === 'community_signal_only' && record.source_use !== 'lead_only') warnings.push(`${prefix} community signal should normally remain lead_only`);
  });

  for (const record of rows) {
    if (!record || !Array.isArray(record.corroboration_ids)) continue;
    for (const id of record.corroboration_ids) if (!ids.has(id)) errors.push(`${record.source_id}.corroboration_ids references missing source ${id}`);
  }

  return {
    valid: errors.length === 0,
    city,
    as_of: asOf,
    count: rows.length,
    errors: [...new Set(errors)],
    warnings: [...new Set(warnings)]
  };
}

export function auditSourcePackFile(sourcePackPath, options = {}) {
  const records = JSON.parse(fs.readFileSync(sourcePackPath, 'utf8'));
  return auditSourcePack(records, options);
}

export function auditAllManifestPacks({ manifestPath = path.join(here, 'city-source-coverage.manifest.json'), asOf = '2026-08-03T23:59:59+08:00' } = {}) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const results = [];
  for (const item of manifest) {
    const databasePath = path.resolve(here, item.database);
    const database = JSON.parse(fs.readFileSync(databasePath, 'utf8'));
    if (!database.metadata?.source_pack_ref) {
      results.push({ city: item.city, valid: false, count: 0, errors: ['database has no source_pack_ref'], warnings: [] });
      continue;
    }
    const sourcePackPath = path.resolve(path.dirname(databasePath), database.metadata.source_pack_ref);
    const allRecords = JSON.parse(fs.readFileSync(sourcePackPath, 'utf8'));
    const scopedRecords = allRecords.filter(record => cityMatches(record, item.city));
    results.push({
      city: item.city,
      ...auditSourcePack(scopedRecords, { city: item.city, databasePath, asOf })
    });
  }
  return { valid: results.every(result => result.valid), results };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const asOfIndex = process.argv.indexOf('--as-of');
  const asOf = asOfIndex >= 0 ? process.argv[asOfIndex + 1] : '2026-08-03T23:59:59+08:00';
  const result = auditAllManifestPacks({ asOf });
  for (const item of result.results) {
    const label = item.valid ? 'PASS' : 'FAIL';
    process.stdout.write(`${label} ${item.city}: ${item.count} records${item.errors.length ? `; ${item.errors.join('; ')}` : ''}\n`);
  }
  process.stdout.write(`${result.valid ? 'SOURCE PACK AUDIT PASS' : 'SOURCE PACK AUDIT FAIL'}: ${result.results.length} cities\n`);
  if (!result.valid) process.exitCode = 1;
}
