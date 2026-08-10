import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CITY_INTERACTIONS } from './city-interactions.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const outputsRoot = path.resolve(here, '../..');

export const PORTFOLIO_RAG_VERSION = '2026-08-09.v1';

export const CITY_DATABASES = [
  { id: 'shanghai', name: 'Shanghai', file: 'shanghai-agent-database-20260802/上海主城智能体数据库_V1.0.json' },
  { id: 'beijing', name: 'Beijing', file: 'beijing-agent-database-20260802/北京智能体数据库_V0.1.json' },
  { id: 'chengdu', name: 'Chengdu', file: 'chengdu-agent-database-20260802/成都智能体数据库_V0.1.json' },
  { id: 'chongqing', name: 'Chongqing', file: 'chongqing-agent-database-20260729/重庆主城智能体数据库_V1.0.json' },
  { id: 'guangzhou', name: 'Guangzhou', file: 'guangzhou-agent-database-20260802/广州智能体数据库_V0.1.json' },
  { id: 'shenzhen', name: 'Shenzhen', file: 'shenzhen-agent-database-20260802/深圳智能体数据库_V0.1.json' },
  { id: 'guilin_yangshuo', name: 'Guilin–Yangshuo', file: 'guilin-yangshuo-agent-database-20260802/桂林阳朔智能体数据库_V0.1.json' },
  { id: 'hangzhou', name: 'Hangzhou', file: 'hangzhou-agent-database-20260802/杭州智能体数据库_V0.1.json' },
  { id: 'suzhou', name: 'Suzhou', file: 'suzhou-agent-database-20260802/苏州智能体数据库_V0.1.json' },
  { id: 'quanzhou_dehua', name: 'Quanzhou–Dehua', file: 'quanzhou-dehua-agent-database-20260802/泉州德化智能体数据库_V0.1.json' },
  { id: 'jingdezhen', name: 'Jingdezhen', file: 'jingdezhen-agent-database-20260802/景德镇智能体数据库_V0.1.json' },
  { id: 'wudang', name: 'Wudang Mountains', file: 'wudang-agent-database-20260802/武当山智能体数据库_V0.1.json' },
  { id: 'jingmai', name: 'Jingmai Mountain', file: 'jingmai-agent-database-20260802/景迈茶山智能体数据库_V0.1.json' }
];

const ALLOWED_TYPES = new Set([
  'positioning_overview', 'sell_point', 'audience_fit', 'route_seed',
  'traveler_faq', 'attraction', 'experience', 'food', 'transport',
  'market_profile', 'source_note'
]);

function text(value) {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.map(text).filter(Boolean).join('; ');
  if (typeof value === 'object') return '';
  return String(value).replace(/\s+/g, ' ').trim();
}

function list(value) {
  return Array.isArray(value) ? value.map(text).filter(Boolean) : text(value) ? [text(value)] : [];
}

function stableId(value) {
  return text(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96) || 'untitled';
}

function record({ city, type, title, body, tags = [], metadata = {}, source = {}, verification = {} }) {
  const contentType = ALLOWED_TYPES.has(type) ? type : 'source_note';
  const sourceUrl = source.url || null;
  const sourceConfidence = source.confidence || (sourceUrl ? 'official' : 'curated');
  return {
    id: `${city.id}:${contentType}:${stableId(metadata.record_key || title)}`,
    destination_slug: city.id,
    destination_name: city.name,
    language: 'en',
    content_type: contentType,
    title: text(title),
    text: text(body),
    tags: [...new Set(tags.map(stableId).filter(Boolean))],
    metadata: {
      city_id: city.id,
      database_status: metadata.database_status || 'content_foundation_not_field_verified',
      release_boundary: metadata.release_boundary || 'research_draft_only',
      dynamic_check_required: metadata.dynamic_check_required === true,
      ...metadata
    },
    source: source.file || source.id || 'portfolio_city_database',
    source_url: sourceUrl,
    source_confidence: sourceConfidence,
    provenance: {
      source_id: source.id || null,
      source_kind: source.kind || (sourceUrl ? 'external_source' : 'internal_database'),
      raw_reference: source.raw_reference || null,
      captured_at: source.captured_at || null,
      review_status: source.review_status || null,
      source_use: source.source_use || null
    },
    verification: {
      field_status: verification.field_status || 'not_field_verified',
      human_review_required: verification.human_review_required !== false,
      client_safe_as_static_fact: verification.client_safe_as_static_fact === true
    },
    version: PORTFOLIO_RAG_VERSION
  };
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function normalizeSource(item = {}, file = null) {
  const rawUrl = item.url || item.source_url_1 || null;
  return {
    id: item.source_id || item.id || item.legacy_source_id || null,
    url: typeof rawUrl === 'string' && /^https:\/\//.test(rawUrl) ? rawUrl : null,
    raw_reference: rawUrl && !/^https:\/\//.test(rawUrl) ? rawUrl : null,
    confidence: item.platform === 'official' || item.independence === 'official_primary' ? 'official' : 'curated',
    kind: item.platform || item.independence || 'source_pack',
    captured_at: item.captured_at || item.checked_date || null,
    review_status: item.review_status || item.current_verdict || null,
    source_use: item.source_use || null,
    file
  };
}

function loadSourceIndex(database, databaseFile) {
  const sources = [];
  if (Array.isArray(database.sources)) sources.push(...database.sources);
  const ref = database.metadata?.source_pack_ref;
  if (ref) {
    const sourceFile = path.resolve(path.dirname(databaseFile), ref);
    if (fs.existsSync(sourceFile)) {
      const value = readJson(sourceFile);
      if (Array.isArray(value)) sources.push(...value.map((item) => ({ ...item, __source_file: sourceFile })));
    }
  }
  const index = new Map();
  for (const item of sources) {
    const normalized = normalizeSource(item, item.__source_file || databaseFile);
    for (const key of [item.source_id, item.id, item.legacy_source_id].filter(Boolean)) index.set(key, normalized);
  }
  return { index, sources };
}

function sourceFor({ value, sourceIndex, databaseFile }) {
  if (typeof value === 'string' && /^https?:\/\//.test(value)) {
    return { url: value, confidence: 'official', kind: 'direct_database_url', file: databaseFile };
  }
  if (value && sourceIndex.has(value)) return sourceIndex.get(value);
  return { file: databaseFile };
}

function databaseStatus(database) {
  return database.metadata?.status || 'content_foundation_not_field_verified';
}

function releaseBoundary(status) {
  return status.startsWith('experimental') ? 'research_draft_human_review_required' : 'research_draft_only';
}

function exportCity(city) {
  const databaseFile = path.join(outputsRoot, city.file);
  const database = readJson(databaseFile);
  const { index: sourceIndex, sources } = loadSourceIndex(database, databaseFile);
  const status = databaseStatus(database);
  const baseMetadata = {
    database_status: status,
    release_boundary: releaseBoundary(status),
    database_file: city.file
  };
  const records = [];
  const metadata = database.metadata || {};
  const overview = [
    metadata.promise || metadata.scope || metadata.database || city.name,
    metadata.audience ? `Audience: ${metadata.audience}.` : '',
    metadata.commercial_boundary ? `Boundary: ${metadata.commercial_boundary}` : '',
    metadata.hard_rule ? `Release rule: ${metadata.hard_rule}` : ''
  ].filter(Boolean).join('\n\n');
  records.push(record({
    city,
    type: 'positioning_overview',
    title: `${city.name} decision overview`,
    body: overview,
    tags: ['city_overview', 'decision_layer', 'independent_travel'],
    metadata: { ...baseMetadata, record_key: 'overview' },
    source: { file: databaseFile },
    verification: { human_review_required: true }
  }));

  const modules = database.modules || database.route_modules || [];
  for (const item of modules) {
    const id = item.id || item.module_id || item['模块ID'];
    const name = item.name || item['模块名称'] || item.sourceName || id;
    const question = item.question || item['只讲一个核心解释'] || item.explanation || '';
    const rule = item.output_rule || item['对客现实提醒'] || item['禁止/降级条件'] || item.practicalNote || item['英文现实提醒'] || '';
    const checks = item.dynamic_checks || item.requiredConfirmations || item.confirmations || item['英文必须确认'] || '';
    records.push(record({
      city,
      type: 'route_seed',
      title: name,
      body: [question && `Decision question: ${question}`, rule && `Route rule: ${rule}`, text(checks) && `Current checks: ${text(checks)}`].filter(Boolean).join('\n'),
      tags: ['route_module', id, 'decision_logic'],
      metadata: { ...baseMetadata, record_key: id || name, module_id: id || null, dynamic_check_required: Boolean(text(checks)) },
      source: { file: databaseFile },
      verification: { human_review_required: true }
    }));
  }

  for (const item of database.points || []) {
    const id = item.id || item.ID || item['点位ID'];
    const name = item.name || item['地点/体验'] || id;
    const moduleId = item.module_id || item.module || item['原始模块'] || null;
    const why = item.why_it_matters || item.why || item['为什么值得去'] || '';
    const role = item.role || item['产品角色'] || item['角色'] || '';
    const friction = item.friction || item['风险/摩擦'] || '';
    const agentUse = item.agent_use || item['智能体动作'] || item['对客现实提醒'] || '';
    const dynamicRef = item.dynamic_source || item.source || item['来源ID'] || null;
    const source = sourceFor({ value: dynamicRef, sourceIndex, databaseFile });
    const dynamic = item.dynamic === true || Boolean(item.dynamic_source) || /dynamic|reservation|opening|weather|crowd|queue/i.test(text(friction));
    records.push(record({
      city,
      type: 'attraction',
      title: name,
      body: [
        why && `Why it matters: ${text(why)}`,
        role && `Role: ${text(role)}`,
        text(item.best_for || item['原适合客群']) && `Best for: ${text(item.best_for || item['原适合客群'])}`,
        text(friction) && `Friction: ${text(friction)}`,
        agentUse && `Route use: ${text(agentUse)}`
      ].filter(Boolean).join('\n'),
      tags: ['place', moduleId, id, ...list(item.best_for || item['原适合客群'])],
      metadata: {
        ...baseMetadata,
        record_key: id || name,
        point_id: id || null,
        module_id: moduleId,
        role: text(role) || null,
        dynamic_check_required: dynamic,
        source_reference: dynamicRef || null
      },
      source,
      verification: {
        field_status: item.field_status || (item.dynamic ? 'needs_operational_check' : 'not_field_verified'),
        human_review_required: true,
        client_safe_as_static_fact: false
      }
    }));
  }

  for (const item of database.signals || []) {
    const id = item.id || item.signal_id || item.signal || item.expression_example;
    const signal = item.signal || item.expression_example || id;
    const meaning = item.meaning || item.need_or_state || item.latent_need || '';
    const followUp = item.follow_up || item.follow_up_question || item.must_confirm || '';
    records.push(record({
      city,
      type: 'traveler_faq',
      title: `Intent signal: ${signal}`,
      body: [meaning && `Interpretation: ${text(meaning)}`, followUp && `Confirm before deciding: ${text(followUp)}`].filter(Boolean).join('\n'),
      tags: ['traveler_signal', 'intent', id],
      metadata: { ...baseMetadata, record_key: id || signal, signal_id: id || null, intent_record: true },
      source: { file: databaseFile },
      verification: { human_review_required: false, client_safe_as_static_fact: true }
    }));
  }

  for (const [index, item] of (database.follow_up_questions || database.follow_up_rules || []).entries()) {
    const id = item.id || item.when || item.topic || item.trigger || item.priority || `follow-up-${index + 1}`;
    const when = item.when || item.trigger || item.topic || 'When route scope is unclear';
    const ask = item.ask || item.question || '';
    if (!text(ask)) continue;
    records.push(record({
      city,
      type: 'traveler_faq',
      title: text(when),
      body: `Ask: ${text(ask)}${item.why ? `\nWhy: ${text(item.why)}` : ''}`,
      tags: ['follow_up', 'intake', id],
      metadata: { ...baseMetadata, record_key: `follow-up-${index + 1}-${id || ask}`, follow_up_record: true },
      source: { file: databaseFile },
      verification: { human_review_required: false, client_safe_as_static_fact: true }
    }));
  }

  for (const [index, item] of (database.profiles || []).entries()) {
    const id = item.id || item.profile || item.name;
    const label = item.profile || item.name || id;
    const summary = item.core_need || item.status || item.output_promise || '';
    const failure = item.common_failure || item.delete_first || '';
    records.push(record({
      city,
      type: 'audience_fit',
      title: `${city.name}: ${text(label)}`,
      body: [summary && `Best-fit need: ${text(summary)}`, failure && `Avoid: ${text(failure)}`].filter(Boolean).join('\n'),
      tags: ['audience_fit', id],
      metadata: { ...baseMetadata, record_key: `profile-${index + 1}-${id || label}`, profile_id: id || null },
      source: { file: databaseFile },
      verification: { human_review_required: false, client_safe_as_static_fact: true }
    }));
  }

  for (const item of database.story_cards || []) {
    const id = item.id || item.card_id;
    const title = item.title || item.topic || id;
    const body = item.deep_explanation || item['深度解释'] || item.onsite_entry || '';
    if (!text(body)) continue;
    const source = sourceFor({ value: item.source_url_1 || item.source_url || null, sourceIndex, databaseFile });
    records.push(record({
      city,
      type: 'source_note',
      title,
      body: [body, item.avoid_saying && `Avoid saying: ${text(item.avoid_saying)}`].filter(Boolean).join('\n'),
      tags: ['story_card', id, item.content_role || 'context'],
      metadata: { ...baseMetadata, record_key: `story-${id || title}`, module_id: item.module || null, dynamic_check_required: item.evidence_status !== 'field_verified' },
      source,
      verification: { human_review_required: true, client_safe_as_static_fact: item.evidence_status === 'field_verified' }
    }));
  }

  for (const [index, rawItem] of (database.launch_checks || database.field_checks || []).entries()) {
    const item = typeof rawItem === 'string' ? { id: `field-${index + 1}`, name: rawItem, purpose: rawItem } : rawItem;
    const id = item.id || item.check_id || item.launch_check_id || item.name || item.object || `field-${index + 1}`;
    const title = item.name || item.object || item.module || id;
    const purpose = item.purpose || item.why_launch_critical || item.must_record || item.method || '';
    records.push(record({
      city,
      type: 'source_note',
      title: `Pending verification: ${text(title)}`,
      body: `This is a live review task, not released evidence.\nScope: ${text(purpose)}`,
      tags: ['verification_task', 'dynamic_gate', id],
      metadata: {
        ...baseMetadata,
        record_key: `check-${id || title}`,
        check_id: id || null,
        check_priority: item.priority || item.blocking_level || null,
        check_method: item.method || null,
        dynamic_check_required: true,
        release_boundary: 'human_review_evidence_required'
      },
      source: sourceFor({ value: item.source_url || null, sourceIndex, databaseFile }),
      verification: { field_status: item.status || 'not_started', human_review_required: true, client_safe_as_static_fact: false }
    }));
  }

  for (const item of sources) {
    const source = normalizeSource(item, item.__source_file || databaseFile);
    if (!source.id || !source.url) continue;
    records.push(record({
      city,
      type: 'source_note',
      title: `Source: ${source.id}`,
      body: text(item.claim || item.core_information || item.notes || 'External source retained for a dated review task.'),
      tags: ['source_register', item.claim_type || source.kind, source.id],
      metadata: { ...baseMetadata, record_key: `source-${source.id}`, source_record: true, dynamic_check_required: source.review_status === 'dynamic_check_required' },
      source,
      verification: { human_review_required: source.review_status === 'dynamic_check_required', client_safe_as_static_fact: source.source_use === 'context_with_citation' }
    }));
  }
  return records;
}

function exportInteractionOverlay(city) {
  const units = CITY_INTERACTIONS.product_units.filter(unit => unit.city_database_ids.includes(city.id));
  const overlayFile = path.join(path.dirname(fileURLToPath(import.meta.url)), '../city-interactions-v1.json');
  return units.map(unit => record({
    city,
    type: 'traveler_faq',
    title: `${unit.label} active interaction layer`,
    body: [
      `What this product unit is for: ${unit.identity.what_it_is}`,
      `What it is not for: ${unit.identity.not_for}`,
      `Minimum protected nights: ${unit.min_protected_nights}.`,
      `Selection rules: ${unit.selection_rules.include_when.join('; ')}.`,
      `Protect: ${unit.selection_rules.protect.join('; ')}.`,
      `Delete or split when: ${unit.selection_rules.exclude_or_split_when.join('; ')}.`,
      `Prioritized questions: ${unit.follow_up_questions.map(item => item.ask).join(' | ')}`,
      `Potential needs to confirm: ${unit.latent_need_rules.map(item => item.confirmation_question).join(' | ')}`,
      `Human review triggers: ${unit.human_review_triggers.join('; ')}.`
    ].join('\n'),
    tags: ['active_interaction', 'latent_need', 'selection_rule', unit.id],
    metadata: {
      database_status: 'content_ready_human_review_required',
      release_boundary: 'research_draft_only',
      record_key: `interaction-${unit.id}`,
      interaction_overlay: true,
      product_unit_id: unit.id,
      minimum_protected_nights: unit.min_protected_nights,
      dynamic_check_required: true,
      overlay_version: CITY_INTERACTIONS.schema_version
    },
    source: { file: overlayFile },
    verification: { field_status: 'not_field_verified', human_review_required: false, client_safe_as_static_fact: true }
  }));
}

export function buildPortfolioRagRecords() {
  const records = CITY_DATABASES.flatMap(city => [...exportCity(city), ...exportInteractionOverlay(city)]);
  const ids = new Set();
  for (const item of records) {
    if (ids.has(item.id)) throw new Error(`Duplicate portfolio RAG record id: ${item.id}`);
    ids.add(item.id);
  }
  return records;
}

export function summarizePortfolioRag(records = buildPortfolioRagRecords()) {
  const byCity = {};
  const byType = {};
  let withExternalSource = 0;
  let pendingDynamic = 0;
  let fieldVerified = 0;
  for (const item of records) {
    byCity[item.destination_slug] = (byCity[item.destination_slug] || 0) + 1;
    byType[item.content_type] = (byType[item.content_type] || 0) + 1;
    if (item.source_url) withExternalSource += 1;
    if (item.metadata.dynamic_check_required) pendingDynamic += 1;
    if (item.verification.field_status === 'field_verified') fieldVerified += 1;
  }
  return { version: PORTFOLIO_RAG_VERSION, total_records: records.length, city_count: Object.keys(byCity).length, by_city: byCity, by_content_type: byType, with_external_source: withExternalSource, dynamic_check_required: pendingDynamic, field_verified: fieldVerified };
}
