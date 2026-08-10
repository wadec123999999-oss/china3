import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { commercialFor } from '../../shared/commercial.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const database = JSON.parse(fs.readFileSync(path.join(here, '../../beijing-agent-database-20260802/北京智能体数据库_V0.1.json'), 'utf8'));
const decisionLayer = JSON.parse(fs.readFileSync(path.join(here, '../../beijing-agent-database-20260802/北京决策字段_V1.0.json'), 'utf8'));
const pointDecisionLayer = JSON.parse(fs.readFileSync(path.join(here, '../../beijing-agent-database-20260802/北京点位决策字段_V1.0.json'), 'utf8'));

const priority = {
  first_visit: ['BJM01', 'BJM04', 'BJM03'],
  history_architecture: ['BJM01', 'BJM02', 'BJM05'],
  hutong_not_touristy: ['BJM03', 'BJM02'],
  great_wall_must: ['BJM04'],
  art_design: ['BJM06', 'BJM03'],
  palace_overload: ['BJM02', 'BJM03', 'BJM06'],
  arrive_late: ['BJM07'],
  family: ['BJM07', 'BJM02', 'BJM03'],
  rain_or_heat: ['BJM07', 'BJM06', 'BJM01'],
  second_visit: ['BJM06', 'BJM03', 'BJM05'],
  layover: ['BJM07'],
  china_multi_city: ['BJM08', 'BJM07']
};

const compatiblePairs=new Set(['BJM01:BJM07','BJM02:BJM03','BJM03:BJM06','BJM05:BJM06','BJM07:BJM08']);
const pairKey=(a,b)=>[a,b].sort().join(':');

function arrangeDays(modules,dayCount){
  const count=Math.max(1,dayCount);const dayPlan=Array.from({length:count},(_,index)=>({day:index+1,theme:null,modules:[]}));
  const wall=modules.find(module=>module.id==='BJM04');
  if(wall)dayPlan[Math.min(1,count-1)].modules.push(wall);
  const remaining=modules.filter(module=>module.id!=='BJM04');
  for(const module of remaining){
    const empty=dayPlan.find(day=>day.modules.length===0);
    if(empty){empty.modules.push(module);continue;}
    const compatible=dayPlan.find(day=>day.modules.length<2&&!day.modules.some(existing=>existing.id==='BJM04')&&day.modules.some(existing=>compatiblePairs.has(pairKey(existing.id,module.id))));
    const target=compatible||[...dayPlan].reverse().find(day=>day.modules.length<2&&!day.modules.some(existing=>existing.id==='BJM04'));
    if(target)target.modules.push(module);
  }
  for(const day of dayPlan)day.theme=day.modules.length===1?day.modules[0].name:day.modules.map(module=>module.name).join(' + ');
  return dayPlan;
}

export function requiredFollowUps(input = {}) {
  const interests = Array.isArray(input.interests) ? input.interests : [];
  const asks = [];
  if (!Number.isFinite(input.days)) asks.push('How many full days do you have, and what are your arrival/departure constraints?');
  if (!interests.length) asks.push('Do you want imperial history, neighbourhood life, the Great Wall, art/design, food, photography, or a slower pace most?');
  if (!input.arrivalTime) asks.push('Which airport and arrival time are you working with, and is your first full day genuinely free?');
  if (!input.mobility) asks.push('Any mobility needs, children/older relatives, fear of heights, or heat/rain constraints?');
  if (interests.includes('great_wall_must')) asks.push('For the Wall, do you prioritise scenery, an iconic first visit, fewer transfers, or physical challenge?');
  if (interests.includes('booking_help_requested')) asks.push('Would a human-checked brief with official booking links be useful, while you make all bookings directly?');
  return asks;
}

export function decide(input = {}) {
  const days = Number.isFinite(input.days) ? Math.max(1, Math.min(5, input.days)) : 3;
  const interests = Array.isArray(input.interests) ? input.interests : [];
  const tags = new Set(input.firstVisit ? ['first_visit', ...interests] : interests);
  if (input.withFamily) tags.add('family');
  if (input.weatherConstraint) tags.add('rain_or_heat');
  if (input.arriveLate) tags.add('arrive_late');
  const ordered = [];
  for (const tag of tags) for (const id of priority[tag] ?? []) if (!ordered.includes(id)) ordered.push(id);
  for (const fallback of ['BJM01', 'BJM04', 'BJM03', 'BJM02', 'BJM06']) if (!ordered.includes(fallback)) ordered.push(fallback);
  const selectedModules = ordered.slice(0, Math.min(days + 1, 5)).map(id => {
    const module = database.modules.find(m => m.id === id);
    return { ...module, decisionProfile: decisionLayer.modules[id] ?? null };
  });
  const dayPlan=arrangeDays(selectedModules,days);
  const selectedPoints = selectedModules.flatMap(module => database.points
    .filter(point => point.module_id === module.id && !['candidate_only'].includes(point.field_status))
    .slice(0, 2)
    .map(point => ({ ...point, name: pointDecisionLayer.guest_name_map?.[point.id] ?? point.name, decisionProfile: pointDecisionLayer.points[point.id] ?? null })));
  const warnings = [
    'This is a draft for human review. Re-check live entry, reservations, weather, transport, exhibitions and payment details immediately before delivery.'
  ];
  if (interests.includes('great_wall_must')) warnings.push('Do not select a Wall section or promise an ascent/return plan until fitness, weather and current transport are verified.');
  if (interests.includes('booking_help_requested') || interests.includes('experience_booking_requested')) warnings.push('Product boundary: provide research and official links only; do not book, quote or package third-party services.');
  if (interests.includes('hutong_not_touristy') || interests.includes('ethical_photo')) warnings.push('Keep to public space; do not frame residents or private courtyards as attractions.');
  const followUps = requiredFollowUps(input);
  return {
    city: 'Beijing',
    status: 'draft_for_human_review',
    days,
    dayPlan,
    selectedModules,
    selectedPoints,
    requiredFollowUps: followUps,
    warnings,
    commercial: commercialFor(input, followUps),
    deliveryRule: 'Release only after the Beijing human-checklist is completed for the traveller date.',
    decisionLayerVersion: decisionLayer.metadata.version,
    pointDecisionLayerVersion: pointDecisionLayer.metadata.version
  };
}

export { database };
export { arrangeDays };
