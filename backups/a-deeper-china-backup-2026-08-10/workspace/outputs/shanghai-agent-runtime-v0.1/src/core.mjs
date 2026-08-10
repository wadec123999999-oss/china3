import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { commercialFor } from '../../shared/commercial.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const database = JSON.parse(fs.readFileSync(path.join(here, '../../shanghai-agent-database-20260802/上海主城智能体数据库_V1.0.json'), 'utf8'));
const decisionLayer = JSON.parse(fs.readFileSync(path.join(here, '../../shanghai-agent-database-20260802/上海决策字段_V1.0.json'), 'utf8'));
const pointDecisionLayer = JSON.parse(fs.readFileSync(path.join(here, '../../shanghai-agent-database-20260802/上海点位决策字段_V1.0.json'), 'utf8'));
const priority = {
  first_visit: ['SHM01', 'SHM04', 'SHM02'],
  architecture: ['SHM02', 'SHM01', 'SHM06'],
  art_design: ['SHM06', 'SHM04', 'SHM02'],
  history: ['SHM03', 'SHM04', 'SHM02'],
  slow: ['SHM05', 'SHM02', 'SHM06'],
  photo: ['SHM01', 'SHM02', 'SHM07'],
  family: ['SHM04', 'SHM01', 'SHM05'],
  rain_heat: ['SHM04', 'SHM03', 'SHM02'],
  tai_chi: ['SHM05'],
  jiangnan_extension: ['SHM08'],
  religion: ['SHM12', 'SHM13'],
  jewish_history: ['SHM11', 'SHM10'],
  film: ['SHM14'],
  literature: ['SHM16'],
  creative: ['SHM19', 'SHM06'],
  arrival: ['SHM18', 'SHM01'],
  layover: ['SHM18'],
  accessibility: ['SHM20', 'SHM04'],
  ethical_photo: ['SHM22', 'SHM02'],
  one_week: ['SHM21', 'SHM22', 'SHM09'],
  suzhou_extension: ['SHM23'],
  hangzhou_extension: ['SHM24']
};

const compatiblePairs = new Set([
  'SHM01:SHM07','SHM01:SHM10','SHM01:SHM18',
  'SHM02:SHM05','SHM02:SHM14','SHM02:SHM16','SHM02:SHM19','SHM02:SHM22',
  'SHM03:SHM12','SHM03:SHM13','SHM03:SHM15','SHM03:SHM17',
  'SHM04:SHM05','SHM06:SHM09','SHM06:SHM20'
]);

const pairKey=(a,b)=>[a,b].sort().join(':');

function arrangeDays(modules, dayCount) {
  const count=Math.max(1,dayCount);
  const dayPlan=Array.from({length:count},(_,index)=>({day:index+1,theme:null,modules:[]}));
  modules.slice(0,count).forEach((module,index)=>dayPlan[index].modules.push(module));
  for(const module of modules.slice(count)){
    const compatible=dayPlan.find(day=>day.modules.length<2&&day.modules.some(existing=>compatiblePairs.has(pairKey(existing.id,module.id))));
    const target=compatible||[...dayPlan].reverse().find(day=>day.modules.length<2);
    if(target)target.modules.push(module);
  }
  for(const day of dayPlan){
    day.theme=day.modules.length===1?day.modules[0].name:day.modules.map(module=>module.name).join(' + ');
  }
  return dayPlan;
}

export function decide(input = {}) {
  const days = Number.isFinite(input.days) ? Math.max(1, Math.min(4, input.days)) : 2;
  const interests = Array.isArray(input.interests) ? input.interests : [];
  // A first-time visitor needs a coherent city frame before personal interests refine it.
  const tags = new Set(input.firstVisit === true ? ['first_visit', ...interests] : interests);
  if (input.withFamily === true) tags.add('family');
  if (input.weatherConstraint) tags.add('rain_heat');
  const ordered = [];
  for (const tag of tags) for (const moduleId of priority[tag] ?? []) if (!ordered.includes(moduleId)) ordered.push(moduleId);
  for (const fallback of ['SHM01', 'SHM02', 'SHM04', 'SHM03', 'SHM06']) if (!ordered.includes(fallback)) ordered.push(fallback);
  const selectedIds = ordered.slice(0, Math.min(days + 1, 4));
  const modules = selectedIds.map(id => {
    const module = database.route_modules.find(m => m.id === id);
    const decisionProfile = decisionLayer.modules[id];
    return decisionProfile ? { ...module, decisionProfile } : module;
  });
  const dayPlan = arrangeDays(modules, days);
  const points = modules.flatMap(module => database.points
    .filter(point => point.module === module.id && point.id !== 'SH020' && !['SH037','SH038','SH039','SH040'].includes(point.id))
    .slice(0, 2)
    .map(point => ({ ...point, decisionProfile: pointDecisionLayer.points[point.id] || null })));
  const warnings = [];
  if (interests.includes('tai_chi')) warnings.push('Tai Chi is a research candidate only. Do not quote, book or collect payment until all supplier release gates pass.');
  if (interests.some(tag => ['suzhou_extension','hangzhou_extension','jiangnan_extension'].includes(tag))) warnings.push('Jiangnan extension output is a decision handoff, not a full destination roadbook, until the matching city database is approved.');
  if (input.weatherConstraint) warnings.push('Re-check opening, reservations, transport and weather before sending this roadbook.');
  const followUps = requiredFollowUps(input);
  return {
    city: 'Shanghai', status: 'draft_for_human_review', days, dayPlan, selectedModules: modules, selectedPoints: points,
    requiredFollowUps: followUps, warnings, commercial: commercialFor(input, followUps),
    deliveryRule: 'This output may be used as a tailored draft only; dynamic facts need current verification before guest delivery.',
    decisionLayerVersion: decisionLayer.metadata.version,
    pointDecisionLayerVersion: pointDecisionLayer.metadata.version
  };
}

export function requiredFollowUps(input = {}) {
  const asks = [];
  if (!Number.isFinite(input.days)) asks.push('How many full days and which arrival/departure constraints do you have?');
  if (!Array.isArray(input.interests) || input.interests.length === 0) asks.push('Do you care most about architecture, art/design, history, food, public life, photography, or a slower pace?');
  if (!input.mobility) asks.push('Any mobility needs, children/older relatives, or heat/rain constraints?');
  if (Array.isArray(input.interests) && input.interests.includes('tai_chi')) asks.push('For Tai Chi: preferred date/time, group size, physical limitations and whether English instruction is essential?');
  return asks;
}

export { database };
export { decisionLayer };
export { pointDecisionLayer };
export { arrangeDays };
