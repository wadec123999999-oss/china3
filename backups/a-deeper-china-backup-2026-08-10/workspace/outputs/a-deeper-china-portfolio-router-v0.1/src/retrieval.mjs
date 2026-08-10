import { buildPortfolioRagRecords } from './portfolio-rag-export.mjs';
import { extractPortfolioRequest, routePortfolio, normalizeThemes } from './portfolio.mjs';
import { CITY_INTERACTIONS, getCityInteraction } from './city-interactions.mjs';

const records = buildPortfolioRagRecords();
const byCity = new Map();
const byToken = new Map();

function tokens(value = '') {
  return new Set(String(value).toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []);
}

function addToIndex(index, key, recordId) {
  if (!key) return;
  if (!index.has(key)) index.set(key, new Set());
  index.get(key).add(recordId);
}

for (const item of records) {
  addToIndex(byCity, item.destination_slug, item.id);
  const terms = new Set([...tokens(item.title), ...tokens(item.text), ...item.tags]);
  for (const term of terms) addToIndex(byToken, term, item.id);
}

const recordById = new Map(records.map(item => [item.id, item]));

const THEME_EXPANSIONS = {
  architecture: ['architecture', 'urbanism', 'building', 'heritage', 'design'],
  history: ['history', 'imperial', 'maritime', 'religion', 'heritage'],
  food: ['food', 'culinary', 'market'],
  landscape: ['landscape', 'mountain', 'river', 'walking', 'karst'],
  tea: ['tea', 'ecology', 'landscape', 'craft'],
  ceramics: ['ceramics', 'porcelain', 'craft', 'design'],
  technology: ['technology', 'tech', 'hardware', 'urbanism', 'design'],
  urbanism: ['urbanism', 'architecture', 'city', 'night'],
  family: ['family', 'slow', 'food', 'walking'],
  religion: ['religion', 'history', 'heritage', 'architecture']
};

function unitForRequestCity(value) {
  return getCityInteraction(value);
}

function requestCityUnits(request) {
  return [...new Map((request.cities ?? []).map(value => unitForRequestCity(value)).filter(Boolean).map(unit => [unit.id, unit])).values()];
}

function databaseIdsForUnits(units) {
  return [...new Set(units.flatMap(unit => unit.city_database_ids ?? []))];
}

function queryTerms(message, request) {
  const themes = normalizeThemes(request.interests ?? []);
  const expanded = themes.flatMap(theme => THEME_EXPANSIONS[theme] ?? [theme]);
  return new Set([...tokens(message), ...tokens(expanded.join(' ')), ...themes]);
}

/**
 * Plan retrieval before touching detailed city records. This is the key
 * separation between physical storage (city-owned) and query organization
 * (task-first).
 */
export function planRetrieval(message = '') {
  const request = extractPortfolioRequest(message);
  const routed = routePortfolio(request);
  const namedUnits = requestCityUnits(request);
  const recommendedUnits = routed.recommendation.map(item => getCityInteraction(item.city_unit)).filter(Boolean);
  const candidateUnits = namedUnits.length ? namedUnits : recommendedUnits.slice(0, 3);
  const databaseIds = databaseIdsForUnits(candidateUnits);
  const comparison = namedUnits.length > 1 || /\b(vs|versus|or|compare|比较|还是|哪个)\b/i.test(message);
  const guarded = (request.constraints ?? []).some(item => ['private_access', 'experience_booking', 'limited_mobility', 'medical', 'severe_allergy'].includes(item));
  const mode = guarded ? 'research_only' : comparison ? 'comparison' : namedUnits.length ? 'city_focused' : 'portfolio_discovery';
  const layers = mode === 'portfolio_discovery'
    ? ['portfolio_router', 'global_guardrail_layer']
    : mode === 'comparison'
      ? ['portfolio_router', 'city_decision_layer', 'global_guardrail_layer']
      : ['city_decision_layer', 'city_detail_layer', 'global_guardrail_layer'];
  return {
    version: '2026-08-09.v1',
    mode,
    message,
    request,
    candidate_product_units: candidateUnits.map(unit => unit.id),
    candidate_database_ids: databaseIds,
    retrieval_layers: layers,
    content_types: mode === 'portfolio_discovery'
      ? ['positioning_overview', 'traveler_faq']
      : ['positioning_overview', 'route_seed', 'traveler_faq', 'audience_fit', 'attraction', 'experience', 'food', 'transport', 'market_profile', 'source_note'],
    filters: {
      destination_slug: databaseIds,
      field_status_must_not_be: ['field_verified'],
      dynamic_facts_require_current_check: true
    },
    query_terms: [...queryTerms(message, request)].slice(0, 60),
    explanation: mode === 'city_focused'
      ? `A named city was detected, so detailed retrieval is filtered to ${databaseIds.join(', ')}.`
      : mode === 'comparison'
        ? `This is a comparison question, so only candidate city decision layers are opened: ${candidateUnits.map(unit => unit.label).join(' / ')}.`
        : mode === 'research_only'
          ? 'A guarded request was detected; boundaries and review tasks come before route detail.'
          : 'No city was named, so the system searches the small portfolio layer first and promotes at most three candidates.'
  };
}

function candidateIdsForPlan(plan) {
  const ids = new Set();
  if (plan.mode === 'portfolio_discovery') {
    for (const item of records) {
      if (plan.content_types.includes(item.content_type) || item.metadata.interaction_overlay === true) ids.add(item.id);
    }
    return ids;
  }
  for (const city of plan.candidate_database_ids) for (const id of byCity.get(city) ?? []) ids.add(id);
  return ids;
}

function score(item, plan) {
  const terms = new Set(plan.query_terms);
  const itemTerms = new Set([...tokens(item.title), ...tokens(item.text), ...item.tags]);
  const overlap = [...terms].filter(term => itemTerms.has(term)).length;
  let value = overlap * 2;
  if (item.metadata.interaction_overlay) value += 5;
  if (item.content_type === 'route_seed') value += 4;
  if (item.content_type === 'traveler_faq') value += 3;
  if (item.content_type === 'positioning_overview') value += 2;
  if (item.content_type === 'source_note') value -= 1;
  if (plan.mode === 'portfolio_discovery' && item.content_type === 'positioning_overview') value += 3;
  return value;
}

export function retrieveForMessage(message = '', { limit = 8 } = {}) {
  const plan = planRetrieval(message);
  const candidateIds = candidateIdsForPlan(plan);
  const ranked = [...candidateIds]
    .map(id => recordById.get(id))
    .filter(item => item && plan.content_types.includes(item.content_type))
    .map(item => ({ item, score: score(item, plan) }))
    .sort((a, b) => b.score - a.score || a.item.id.localeCompare(b.item.id));
  return {
    plan,
    candidate_count: ranked.length,
    records: ranked.slice(0, limit).map(({ item, score: itemScore }) => ({
      id: item.id,
      destination_slug: item.destination_slug,
      destination_name: item.destination_name,
      content_type: item.content_type,
      title: item.title,
      text: item.text,
      tags: item.tags,
      score: itemScore,
      release_boundary: item.metadata.release_boundary,
      dynamic_check_required: item.metadata.dynamic_check_required === true,
      interaction_overlay: item.metadata.interaction_overlay === true,
      product_unit_id: item.metadata.product_unit_id ?? null
    }))
  };
}

export function retrievalIndexStats() {
  return {
    record_count: records.length,
    city_count: byCity.size,
    token_count: byToken.size,
    product_unit_count: CITY_INTERACTIONS.product_units.length
  };
}

