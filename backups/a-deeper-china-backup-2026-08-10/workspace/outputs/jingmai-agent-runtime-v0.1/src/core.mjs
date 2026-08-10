import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { commercialFor } from '../../shared/commercial.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const database = JSON.parse(fs.readFileSync(path.join(here, '../../jingmai-agent-database-20260802/景迈茶山智能体数据库_V0.1.json'), 'utf8'));
const decisionLayer = JSON.parse(fs.readFileSync(path.join(here, '../../jingmai-agent-database-20260802/景迈茶山决策字段_V1.0.json'), 'utf8'));
const pointDecisionLayer = JSON.parse(fs.readFileSync(path.join(here, '../../jingmai-agent-database-20260802/景迈茶山点位决策字段_V1.0.json'), 'utf8'));

const priority = {
  tea_culture: ['JMM01', 'JMM04'],
  old_tree_tea: ['JMM01', 'JMM04'],
  tea_purchase: ['JMM04'],
  tea_health: ['JMM04'],
  tea_investment: ['JMM04'],
  tea_farmer_visit: ['JMM03', 'JMM07'],
  tea_ceremony: ['JMM03', 'JMM07'],
  three_nights: ['JMM02', 'JMM05'],
  four_nights: ['JMM02', 'JMM05', 'JMM07'],
  two_nights: ['JMM02'],
  rainy_season: ['JMM05', 'JMM06'],
  sunrise_photo: ['JMM05'],
  walking: ['JMM05'],
  scooter: ['JMM05'],
  self_drive: ['JMM05'],
  limited_mobility: ['JMM05', 'JMM08'],
  family: ['JMM05', 'JMM06'],
  photography: ['JMM03']
};

const supportIds = new Set(['JMM02', 'JMM06', 'JMM07', 'JMM08']);

function addModule(day, module) {
  if (module && day.modules.length < 2 && !day.modules.some(item => item.id === module.id)) day.modules.push(module);
}

function arrangeDays(modules, dayCount) {
  const count = Math.max(1, dayCount);
  const dayPlan = Array.from({ length: count }, (_, index) => ({ day: index + 1, theme: null, modules: [] }));
  const remaining = [...modules];

  const take = id => {
    const index = remaining.findIndex(module => module.id === id);
    return index >= 0 ? remaining.splice(index, 1)[0] : null;
  };

  const teaLandscape = take('JMM01');
  const villageEtiquette = take('JMM03');
  const ecology = take('JMM05');
  if (teaLandscape) addModule(dayPlan[0], teaLandscape);
  if (villageEtiquette) addModule(dayPlan[Math.min(1, dayPlan.length - 1)], villageEtiquette);
  if (ecology) addModule(dayPlan[Math.min(2, dayPlan.length - 1)], ecology);

  const teaBoundary = take('JMM04');
  if (teaBoundary) {
    const landscapeDay = dayPlan.find(day => day.modules.some(module => module.id === 'JMM01'));
    addModule(landscapeDay ?? dayPlan.find(day => day.modules.length === 0) ?? dayPlan[0], teaBoundary);
  }

  const releaseGate = take('JMM07');
  if (releaseGate) {
    const villageDay = dayPlan.find(day => day.modules.some(module => module.id === 'JMM03'));
    addModule(villageDay ?? dayPlan.find(day => day.modules.length === 1) ?? dayPlan[0], releaseGate);
  }

  const primary = remaining.filter(module => !supportIds.has(module.id));
  const support = remaining.filter(module => supportIds.has(module.id));

  for (const module of primary) {
    const target = dayPlan.find(day => day.modules.length === 0) ?? dayPlan.find(day => day.modules.length < 2);
    if (target) addModule(target, module);
  }
  for (const module of support) {
    const target = dayPlan.find(day => day.modules.length === 1)
      ?? dayPlan.find(day => day.modules.length === 0)
      ?? dayPlan.find(day => day.modules.length < 2);
    if (target) addModule(target, module);
  }

  for (const day of dayPlan) {
    day.theme = day.modules.length === 0
      ? 'Protected road, weather, connectivity or recovery buffer'
      : day.modules.length === 1
        ? day.modules[0].name
        : day.modules.map(module => module.name).join(' + ');
  }
  return dayPlan;
}

export function decide(input = {}) {
  const nights = Number.isFinite(input.nights) ? Math.max(0, Math.min(7, input.nights)) : null;
  const interests = Array.isArray(input.interests) ? input.interests : [];
  const ids = [];
  for (const interest of interests) for (const id of priority[interest] ?? []) if (!ids.includes(id)) ids.push(id);
  for (const id of ['JMM01', 'JMM03', 'JMM05', 'JMM02', 'JMM06', 'JMM08']) if (!ids.includes(id)) ids.push(id);

  const dayCount = Math.max(1, nights ?? 3);
  const capacity = Math.min(dayCount + 2, 7);
  let modules = ids.slice(0, capacity).map(id => { const module = database.modules.find(item => item.id === id); return { ...module, decisionProfile: decisionLayer.modules[id] ?? null }; });
  const contact = interests.some(item => ['tea_farmer_visit', 'tea_ceremony'].includes(item));
  if ((nights === null || nights < 4) && contact) modules = modules.filter(module => module.id !== 'JMM07');
  const dayPlan = arrangeDays(modules, dayCount);

  const asks = [];
  if (nights === null) asks.push('How many protected nights remain after your arrival and departure days?');
  if (!interests.length) asks.push('Are you here for tea landscape, tasting-learning, walking, village context, or a purchase decision?');
  if (contact) asks.push('Would a respectful public or approved observation meet your aim? Private homes, tea gardens and ceremonies cannot be promised.');
  if (interests.some(item => ['tea_purchase', 'old_tree_tea', 'tea_health', 'tea_investment'].includes(item))) asks.push('Are you learning, tasting, buying for personal use, collecting, or seeking health/investment advice?');
  if (interests.some(item => ['walking', 'limited_mobility', 'family', 'scooter', 'self_drive'].includes(item))) asks.push('What walking, mud, road, licence, child-safety or mobility constraints need human review?');

  const points = modules.flatMap(module => database.points.filter(point => point.module_id === module.id && point.field_status !== 'candidate_only').slice(0, 2).map(point => ({ ...point, name: pointDecisionLayer.guest_name_map?.[point.id] ?? point.name, decisionProfile: pointDecisionLayer.points?.[point.id] ?? null })));
  const warnings = ['This is a research draft. Recheck road conditions, weather, access, community rules, accommodation and communication before any client-specific output.'];
  if (nights !== null && nights < 3) warnings.push('Do not output a deep Jingmai product with fewer than three protected nights.');
  if (contact) warnings.push('Do not name, price, book or promise a tea farmer, home, tea garden, ceremony, guide or driver without current partner_ready evidence and human review.');
  if (interests.some(item => ['old_tree_tea', 'tea_purchase', 'tea_health', 'tea_investment'].includes(item))) warnings.push('Do not authenticate tea, tree age, origin, quality, health effect, price, investment value, shipping or export.');
  if (interests.some(item => ['sunrise_photo', 'rainy_season', 'walking', 'scooter', 'self_drive'].includes(item))) warnings.push('Do not promise mist, sunrise, clear views, trail access, road state, vehicle availability or safe self-drive conditions.');
  const commercial = commercialFor(input, asks);

  return {
    city: 'Jingmai Mountain',
    status: contact ? 'research_only_human_review_required' : 'draft_for_human_review',
    nights,
    dayPlan,
    selectedModules: modules,
    selectedPoints: points,
    requiredFollowUps: asks,
    warnings,
    commercial,
    deliveryRule: 'A Human-checked roadbook requires dated field/dynamic evidence; every local interaction needs separate partner release and community-consent evidence.',
    decisionLayerVersion: decisionLayer.metadata.version,
    pointDecisionLayerVersion: pointDecisionLayer.metadata.version
  };
}

export { database, arrangeDays };
