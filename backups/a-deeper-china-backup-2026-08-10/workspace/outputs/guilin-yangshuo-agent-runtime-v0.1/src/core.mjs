import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { commercialFor } from '../../shared/commercial.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const database=JSON.parse(fs.readFileSync(path.join(here,'../../guilin-yangshuo-agent-database-20260802/桂林阳朔智能体数据库_V0.1.json'),'utf8'));
const decisionLayer=JSON.parse(fs.readFileSync(path.join(here,'../../guilin-yangshuo-agent-database-20260802/桂林阳朔决策字段_V1.0.json'),'utf8'));const pointDecisionLayer=JSON.parse(fs.readFileSync(path.join(here,'../../guilin-yangshuo-agent-database-20260802/桂林阳朔点位决策字段_V1.0.json'),'utf8'));
const priority={karst:['GYM01'],li_river:['GYM02'],yulong:['GYM03'],non_cycling:['GYM03','GYM08'],cycling:['GYM03','GYM08'],photography:['GYM05'],family:['GYM03','GYM08'],limited_mobility:['GYM03','GYM08'],adventure:['GYM05'],longji:['GYM07'],three_nights:['GYM08'],five_nights:['GYM07','GYM08'],rain_fog:['GYM08'],guangzhou_extension:['GYM08'],zhangjiajie_extension:['GYM08'],quiet:['GYM04'],nightlife:['GYM04']};
const compatiblePairs=new Set(['GYM01:GYM03','GYM01:GYM04','GYM01:GYM05','GYM02:GYM08','GYM03:GYM04','GYM03:GYM08','GYM06:GYM08']);
const pairKey=(a,b)=>[a,b].sort().join(':');

function arrangeDays(modules,dayCount){
  const count=Math.max(1,dayCount);
  const dayPlan=Array.from({length:count},(_,i)=>({day:i+1,theme:null,modules:[]}));
  const remaining=[...modules];
  for(const id of ['GYM02','GYM07']){
    const index=remaining.findIndex(module=>module.id===id);
    if(index>=0){const empty=dayPlan.find(day=>day.modules.length===0);if(empty)empty.modules.push(remaining.splice(index,1)[0]);}
  }
  for(const module of remaining){
    const empty=dayPlan.find(day=>day.modules.length===0);
    if(empty){empty.modules.push(module);continue;}
    const weatherPair=module.id==='GYM08'?dayPlan.find(day=>day.modules.length<2&&day.modules.some(existing=>existing.id==='GYM02')):null;
    const compatible=dayPlan.find(day=>day.modules.length<2&&!day.modules.some(existing=>['GYM02','GYM07'].includes(existing.id))&&day.modules.some(existing=>compatiblePairs.has(pairKey(existing.id,module.id))));
    const target=weatherPair||compatible||[...dayPlan].reverse().find(day=>day.modules.length<2&&!day.modules.some(existing=>['GYM02','GYM07'].includes(existing.id)));
    if(target)target.modules.push(module);
  }
  for(const day of dayPlan)day.theme=day.modules.length===0?'Protected weather, transfer or recovery buffer':day.modules.length===1?day.modules[0].name:day.modules.map(module=>module.name).join(' + ');
  return dayPlan;
}

export function decide(input={}){
  const days=Number.isFinite(input.days)?Math.max(1,Math.min(5,input.days)):3;
  const interests=Array.isArray(input.interests)?input.interests:[];
  const tags=new Set(interests);if(input.weatherConstraint)tags.add('rain_fog');
  const ids=[];for(const tag of tags)for(const id of priority[tag]??[])if(!ids.includes(id))ids.push(id);
  for(const id of ['GYM01','GYM02','GYM03','GYM08'])if(!ids.includes(id))ids.push(id);
  let modules=ids.slice(0,Math.min(days+1,5)).map(id=>({...database.modules.find(module=>module.id===id),decisionProfile:decisionLayer.modules[id]??null}));
  const short=days<=3;
  if(short&&interests.includes('longji'))modules=modules.filter(module=>module.id!=='GYM07');
  const dayPlan=arrangeDays(modules,days);
  const asks=[];
  if(!Number.isFinite(input.days))asks.push('How many nights do you have, and which day is purely for arrival or transfer?');
  if(!interests.length)asks.push('Is your priority river, walking/cycling, photography, family slow travel, adventure or rest?');
  if(!input.mobility)asks.push('Any motion sickness, road-riding, mobility, heat/rain or water concerns?');
  if(interests.includes('li_river'))asks.push('Are you comfortable with a long boat day, motion, weather uncertainty and carrying luggage?');
  if(interests.includes('non_cycling'))asks.push('Would you prefer a short public walk, vehicle-assisted access, or a water-based option after conditions are checked?');
  const points=modules.flatMap(module=>database.points.filter(point=>point.module_id===module.id&&point.field_status!=='candidate_only').slice(0,2).map(point=>({...point,name:pointDecisionLayer.guest_name_map?.[point.id]??point.name,decisionProfile:pointDecisionLayer.points[point.id]??null})));
  const warnings=['This is a draft for human review. Recheck water, weather, transport, access, tickets and safety before delivery.'];
  if(short&&interests.includes('longji'))warnings.push('Do not add Longji to a three-night-or-shorter Guilin–Yangshuo stay. It needs a separate full day.');
  if(interests.includes('non_cycling'))warnings.push('Do not assume cycling or e-bike use. Output only a verified non-cycling route.');
  if(interests.some(item=>['guangzhou_extension','zhangjiajie_extension'].includes(item)))warnings.push('Protect the intercity transfer day; do not add a major landscape activity.');
  if(interests.includes('booking_help_requested')||interests.includes('experience_booking_requested'))warnings.push('Product boundary: research and official links only; do not book, quote or package third-party services.');
  return {city:'Guilin–Yangshuo',status:'draft_for_human_review',days,dayPlan,selectedModules:modules,selectedPoints:points,requiredFollowUps:asks,warnings,commercial:commercialFor(input,asks),deliveryRule:'Release only after current human review.',decisionLayerVersion:decisionLayer.metadata.version,pointDecisionLayerVersion:pointDecisionLayer.metadata.version};
}

export { database, arrangeDays };
