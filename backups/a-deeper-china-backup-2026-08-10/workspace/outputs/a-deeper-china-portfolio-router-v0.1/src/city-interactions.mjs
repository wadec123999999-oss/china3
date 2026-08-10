import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Bundlers can relocate this module into a server asset directory. Allow a
// host adapter to point back to the formal router root without duplicating
// the interaction manifest in the website project.
const routerRoot = resolve(
  process.env.A_DEEPER_CHINA_ROUTER_ROOT || resolve(dirname(fileURLToPath(import.meta.url)), '..'),
);
const manifest = JSON.parse(readFileSync(resolve(routerRoot, 'city-interactions-v1.json'), 'utf8'));

const norm = value => String(value ?? '').toLowerCase().trim();
const slug = value => norm(value).replace(/[–—]/g, '-').replace(/\s+/g, '_');

const aliases = new Map();
for (const unit of manifest.product_units) {
  for (const alias of [unit.id, unit.label, ...(unit.aliases ?? [])]) aliases.set(slug(alias), unit.id);
}

function normalizeUnitId(value) {
  const key = slug(value);
  return aliases.get(key) ?? (manifest.product_units.some(unit => unit.id === key) ? key : null);
}

export const CITY_INTERACTIONS = manifest;

export function getCityInteraction(cityUnit) {
  const id = normalizeUnitId(cityUnit);
  return id ? manifest.product_units.find(unit => unit.id === id) : undefined;
}

function sourceQuestionList(unit) {
  const questions = [];
  for (const ref of unit.database_refs ?? []) {
    try {
      const data = JSON.parse(readFileSync(resolve(routerRoot, ref), 'utf8'));
      const source = data.follow_up_questions ?? data.follow_up_rules ?? [];
      for (const item of source) {
        const ask = item.ask ?? item.question;
        if (!ask) continue;
        const triggers = item.when ?? (item.trigger ? [item.trigger] : []);
        questions.push({
          id: item.id ?? `${unit.id}-source-${questions.length + 1}`,
          priority: Number(item.priority ?? 3),
          triggers: Array.isArray(triggers) ? triggers : [triggers],
          ask,
          decision_effect: item.decision_effect ?? item.why ?? 'Changes route selection or human-review scope.',
          source: ref
        });
      }
    } catch {
      // The validator reports a missing source. Runtime remains usable with the curated overlay.
    }
  }
  return questions;
}

function textSignals(text, request = {}) {
  const raw = `${norm(text)} ${JSON.stringify(request).toLowerCase()}`;
  const tokens = new Set();
  const add = (token, ...patterns) => { if (patterns.some(pattern => raw.includes(pattern))) tokens.add(token); };
  add('first_visit', 'first visit', 'first-time', '首访', '第一次');
  add('days_missing', 'how many days', 'how long', '几天', '几晚');
  add('dates_missing', 'what date', 'when are you', '日期');
  add('family', 'family', 'children', 'kids', 'parents', '长辈', '亲子');
  add('mobility', 'wheelchair', 'stairs', 'mobility', 'injury', '膝', '台阶');
  add('rain', 'rain', 'weather', 'heat', '雨', '天气', '炎热');
  add('architecture', 'architecture', 'building', 'facade', '建筑');
  add('design', 'design', '设计');
  add('photo', 'photo', 'photograph', '摄影', '拍照');
  add('food', 'food', 'eat', 'yum cha', 'hotpot', '美食', '吃');
  add('history', 'history', 'imperial', '历史');
  add('religion', 'religion', 'temple', 'mosque', 'tao', '宗教', '寺');
  add('tea', 'tea', '茶');
  add('ceramics', 'ceramic', 'porcelain', 'kiln', '陶瓷', '瓷');
  add('craft', 'craft', 'maker', 'workshop', '手工', '工作坊');
  add('tech', 'tech', 'hardware', 'factory', 'company', 'technology', '科技');
  add('night', 'night', 'cyberpunk', '夜景', '赛博');
  add('landscape', 'landscape', 'karst', 'river', 'mountain', '风景', '山水');
  add('private_access', 'private', 'home visit', 'farmer', 'master', '私', '老师', '师傅');
  add('booking', 'book', 'booking', 'reserve', '预订', '预约');
  add('extension', 'extension', 'extra night', '加一天', '延伸');
  add('great_wall', 'great wall', '长城');
  add('panda', 'panda', '熊猫');
  add('cycling', 'cycling', 'bike', '骑行');
  add('longji', 'longji', '龙脊');
  add('wulong', 'wulong', '武隆');
  add('dazu', 'dazu', '大足');
  add('hong_kong', 'hong kong', '香港');
  add('sourcing', 'sourcing', 'supplier', '采购');
  add('buying', 'buy', 'purchase', 'collect', '购买', '收藏');
  add('tai_chi', 'tai chi', '太极');
  add('master', 'master', '宗师', '大师');
  if (request.nights == null) tokens.add('days_missing');
  if (request.constraints?.includes?.('private_access')) tokens.add('private_access');
  if (request.constraints?.includes?.('experience_booking')) tokens.add('booking');
  if (request.constraints?.includes?.('family')) tokens.add('family');
  if (request.constraints?.includes?.('limited_mobility')) tokens.add('mobility');
  return { raw, tokens };
}

function ruleMatches(rule, signals) {
  const triggers = (rule.triggers ?? []).map(norm);
  if (!triggers.length) return false;
  return triggers.some(trigger => signals.tokens.has(trigger) || signals.raw.includes(trigger));
}

function fallbackQuestion(unit, sourceQuestions, signals) {
  const candidates = sourceQuestions
    .filter(item => ruleMatches(item, signals))
    .sort((a, b) => a.priority - b.priority);
  return candidates[0];
}

/**
 * Select at most `limit` questions that could change the city route. The curated
 * overlay is used first; source-city questions remain available as a fallback.
 */
export function selectCityFollowUps(cityUnit, { text = '', request = {}, limit = 2 } = {}) {
  const unit = getCityInteraction(cityUnit);
  if (!unit) return [];
  const signals = textSignals(text, request);
  const sourceQuestions = sourceQuestionList(unit);
  const selected = [];
  for (const item of [...unit.follow_up_questions].sort((a, b) => a.priority - b.priority)) {
    if (ruleMatches(item, signals) || (selected.length === 0 && item.priority === 1)) selected.push({ ...item, source: 'city-interaction-overlay' });
    if (selected.length >= limit) break;
  }
  if (selected.length < limit) {
    const source = fallbackQuestion(unit, sourceQuestions, signals);
    if (source && !selected.some(item => item.ask === source.ask)) selected.push(source);
  }
  if (selected.length < limit) {
    for (const item of unit.follow_up_questions) {
      if (!selected.some(existing => existing.ask === item.ask)) selected.push({ ...item, source: 'city-interaction-overlay' });
      if (selected.length >= limit) break;
    }
  }
  return selected.slice(0, limit);
}

export function cityInteractionAudit() {
  const sourceById = new Map(manifest.source_databases.map(item => [item.id, item]));
  return manifest.product_units.map(unit => ({
    id: unit.id,
    label: unit.label,
    database_ids: unit.city_database_ids,
    source_refs: unit.database_refs,
    question_count: unit.follow_up_questions.length,
    latent_need_count: unit.latent_need_rules.length,
    rule_count: Object.values(unit.selection_rules ?? {}).flat().length,
    status: unit.status,
    all_database_ids_registered: unit.city_database_ids.every(id => sourceById.has(id))
  }));
}

export function sourceQuestionsForCity(cityUnit) {
  const unit = getCityInteraction(cityUnit);
  return unit ? sourceQuestionList(unit) : [];
}
