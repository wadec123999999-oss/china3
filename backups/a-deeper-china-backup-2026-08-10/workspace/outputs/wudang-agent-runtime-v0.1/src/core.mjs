import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { commercialFor } from '../../shared/commercial.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const database = JSON.parse(fs.readFileSync(path.join(here, '../../wudang-agent-database-20260802/武当山智能体数据库_V0.1.json'), 'utf8'));
const decisionLayer = JSON.parse(fs.readFileSync(path.join(here, '../../wudang-agent-database-20260802/武当山决策字段_V1.0.json'), 'utf8'));
const pointDecisionLayer = JSON.parse(fs.readFileSync(path.join(here, '../../wudang-agent-database-20260802/武当山点位决策字段_V1.0.json'), 'utf8'));

const priority = {
  heritage_architecture: ['WDM01', 'WDM04'],
  taoism_interest: ['WDM01', 'WDM05'],
  tai_chi: ['WDM06'],
  martial_arts_training: ['WDM06'],
  wellness_healing: ['WDM06'],
  two_nights: ['WDM02', 'WDM04'],
  three_or_four_nights: ['WDM02', 'WDM03', 'WDM04'],
  day_trip: ['WDM02'],
  limited_mobility: ['WDM03', 'WDM08'],
  fitness_concern: ['WDM03'],
  weather_sensitive: ['WDM03', 'WDM04'],
  sunrise_photo: ['WDM03', 'WDM04'],
  private_master_access: ['WDM05', 'WDM06'],
  religious_ritual: ['WDM05'],
  family: ['WDM03', 'WDM07'],
  cable_car: ['WDM03']
};

const supportIds = new Set(['WDM02', 'WDM03', 'WDM07', 'WDM08']);

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

  const taiChi = take('WDM06');
  if (taiChi) addModule(dayPlan[dayPlan.length - 1], taiChi);

  const architecture = take('WDM04');
  if (architecture) {
    const target = dayPlan.find(day => day.modules.length === 0) ?? dayPlan[0];
    addModule(target, architecture);
    addModule(target, take('WDM03'));
  }

  const primary = remaining.filter(module => !supportIds.has(module.id));
  const support = remaining.filter(module => supportIds.has(module.id));

  for (const module of primary) {
    const empty = dayPlan.find(day => day.modules.length === 0);
    const target = empty ?? dayPlan.find(day => day.modules.length < 2 && !day.modules.some(item => ['WDM04', 'WDM06'].includes(item.id)));
    if (target) addModule(target, module);
  }

  for (const module of support) {
    const target = dayPlan.find(day => day.modules.length === 1 && !day.modules.some(item => item.id === 'WDM06'))
      ?? dayPlan.find(day => day.modules.length === 0)
      ?? dayPlan.find(day => day.modules.length < 2 && !day.modules.some(item => item.id === 'WDM06'));
    if (target) addModule(target, module);
  }

  for (const day of dayPlan) {
    day.theme = day.modules.length === 0
      ? 'Protected transfer, weather or recovery buffer'
      : day.modules.length === 1
        ? day.modules[0].name
        : day.modules.map(module => module.name).join(' + ');
  }
  return dayPlan;
}

export function decide(input = {}) {
  const nights = Number.isFinite(input.nights) ? Math.max(0, Math.min(6, input.nights)) : null;
  const interests = Array.isArray(input.interests) ? input.interests : [];
  const ids = [];
  for (const interest of interests) for (const id of priority[interest] ?? []) if (!ids.includes(id)) ids.push(id);
  for (const id of ['WDM01', 'WDM04', 'WDM02', 'WDM03', 'WDM08']) if (!ids.includes(id)) ids.push(id);

  const dayCount = Math.max(1, nights ?? 2);
  const capacity = Math.min(dayCount + 2, 6);
  let modules = ids.slice(0, capacity).map(id => { const module = database.modules.find(item => item.id === id); return { ...module, decisionProfile: decisionLayer.modules[id] ?? null }; });
  const sensitive = interests.some(item => ['tai_chi', 'martial_arts_training', 'wellness_healing', 'private_master_access', 'religious_ritual'].includes(item));
  if ((nights === null || nights < 3) && sensitive) modules = modules.filter(module => module.id !== 'WDM06');
  const dayPlan = arrangeDays(modules, dayCount);

  const asks = [];
  if (nights === null) asks.push('How many protected nights remain after your arrival and departure days?');
  if (!interests.length) asks.push('Are you here for public heritage/architecture, mountain walking, Taoist history, or a bounded beginner Tai Chi interest?');
  if (sensitive) asks.push('Would a respectful public heritage route meet your aim? Private religious access, training and medical/wellness outcomes cannot be promised.');
  if (interests.some(item => ['limited_mobility', 'fitness_concern', 'family'].includes(item))) asks.push('What stair, walking, injury, child-safety or health constraints need human review?');

  const points = modules.flatMap(module => database.points.filter(point => point.module_id === module.id && point.field_status !== 'candidate_only').slice(0, 2).map(point => ({ ...point, name: pointDecisionLayer.guest_name_map?.[point.id] ?? point.name, decisionProfile: pointDecisionLayer.points?.[point.id] ?? null })));
  const warnings = ['This is a research draft. Recheck weather, warnings, access, transport, cable-car operations and on-site rules before any client-specific output.'];
  if (nights !== null && nights < 2) warnings.push('Do not promise a complete Wudang experience with fewer than two nights.');
  if (sensitive) warnings.push('Do not name, price, book or endorse any Tai Chi/martial provider, master, ritual or private access without current partner_ready evidence and human review.');
  if (interests.includes('wellness_healing')) warnings.push('Do not make medical, therapeutic, healing or suitability claims.');
  if (interests.some(item => ['sunrise_photo', 'weather_sensitive', 'cable_car'].includes(item))) warnings.push('Do not promise sunrise, mist, visibility, cable-car operation, open routes or a particular photo outcome.');
  const commercial = commercialFor(input, asks);

  return {
    city: 'Wudang Mountains',
    status: sensitive ? 'research_only_human_review_required' : 'draft_for_human_review',
    nights,
    dayPlan,
    selectedModules: modules,
    selectedPoints: points,
    requiredFollowUps: asks,
    warnings,
    commercial,
    deliveryRule: 'A Human-checked roadbook requires dated dynamic checks and real field evidence; any physical or religious resource requires a separate partner release.',
    decisionLayerVersion: decisionLayer.metadata.version,
    pointDecisionLayerVersion: pointDecisionLayer.metadata.version
  };
}

export { database, arrangeDays };
