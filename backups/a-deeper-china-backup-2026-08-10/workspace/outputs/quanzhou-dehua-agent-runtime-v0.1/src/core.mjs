import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { commercialFor } from '../../shared/commercial.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const database=JSON.parse(fs.readFileSync(path.join(here,'../../quanzhou-dehua-agent-database-20260802/泉州德化智能体数据库_V0.1.json'),'utf8'));
const decisionLayer=JSON.parse(fs.readFileSync(path.join(here,'../../quanzhou-dehua-agent-database-20260802/泉州德化决策字段_V1.0.json'),'utf8'));const pointDecisionLayer=JSON.parse(fs.readFileSync(path.join(here,'../../quanzhou-dehua-agent-database-20260802/泉州德化点位决策字段_V1.0.json'),'utf8'));
const priority={maritime_history:['QZM01','QZM03'],religion:['QZM02'],buddhism:['QZM02'],islamic_history:['QZM02'],maritime_belief:['QZM02'],urbanism:['QZM03','QZM04'],nanyin:['QZM04'],food_driven:['QZM04'],ceramics:['QZM05','QZM06'],ceramic_purchase:['QZM06'],maker_experience:['QZM05','QZM06'],craft_design:['QZM05'],two_days:['QZM07'],three_days:['QZM07','QZM05'],rain_heat:['QZM08']};
const compatiblePairs=new Set(['QZM01:QZM03','QZM01:QZM07','QZM02:QZM04','QZM05:QZM06','QZM05:QZM07','QZM07:QZM08']);
const pairKey=(a,b)=>[a,b].sort().join(':');

function arrangeDays(modules,dayCount){
  const count=Math.max(1,dayCount),dayPlan=Array.from({length:count},(_,i)=>({day:i+1,theme:null,modules:[]}));
  const remaining=[...modules];
  const dehuaIndex=remaining.findIndex(module=>module.id==='QZM05');
  if(dehuaIndex>=0){const day=dayPlan.find(item=>item.modules.length===0);day.modules.push(remaining.splice(dehuaIndex,1)[0]);const boundaryIndex=remaining.findIndex(module=>module.id==='QZM06');if(boundaryIndex>=0)day.modules.push(remaining.splice(boundaryIndex,1)[0]);}
  const primary=remaining.filter(module=>!['QZM07','QZM08'].includes(module.id));
  const support=remaining.filter(module=>['QZM07','QZM08'].includes(module.id));
  for(const module of primary){const empty=dayPlan.find(day=>day.modules.length===0);if(empty){empty.modules.push(module);continue;}const compatible=dayPlan.find(day=>day.modules.length<2&&!day.modules.some(existing=>existing.id==='QZM05')&&day.modules.some(existing=>compatiblePairs.has(pairKey(existing.id,module.id))));const target=compatible||[...dayPlan].reverse().find(day=>day.modules.length<2&&!day.modules.some(existing=>existing.id==='QZM05'));if(target)target.modules.push(module);}
  for(const module of support){const compatible=dayPlan.find(day=>day.modules.length<2&&day.modules.some(existing=>compatiblePairs.has(pairKey(existing.id,module.id))));const target=compatible||dayPlan.find(day=>day.modules.length===0)||[...dayPlan].reverse().find(day=>day.modules.length<2);if(target)target.modules.push(module);}
  for(const day of dayPlan)day.theme=day.modules.length===0?'Protected transfer, weather or recovery buffer':day.modules.length===1?day.modules[0].name:day.modules.map(module=>module.name).join(' + ');
  return dayPlan;
}

export function decide(input={}){
  const days=Number.isFinite(input.days)?Math.max(1,Math.min(4,input.days)):2;
  const interests=Array.isArray(input.interests)?input.interests:[];
  const tags=new Set(interests);if(input.weatherConstraint)tags.add('rain_heat');
  const ids=[];for(const tag of tags)for(const id of priority[tag]??[])if(!ids.includes(id))ids.push(id);
  for(const id of ['QZM01','QZM02','QZM03','QZM08'])if(!ids.includes(id))ids.push(id);
  const capacity=days===1?2:Math.min(days+2,5);
  let modules=ids.slice(0,capacity).map(id=>({...database.modules.find(module=>module.id===id),decisionProfile:decisionLayer.modules[id]??null}));
  if(days<=2&&interests.some(item=>['ceramics','maker_experience'].includes(item)))modules=modules.filter(module=>module.id!=='QZM05');
  const dayPlan=arrangeDays(modules,days);
  const asks=[];
  if(!Number.isFinite(input.days))asks.push('How many full days do you have, and can Dehua receive a separate third day?');
  if(!interests.length)asks.push('Is your priority maritime systems, religious exchange, public urban life, Nanyin, ceramics, design or food?');
  if(!input.mobility)asks.push('Any weather, walking, sacred-site etiquette or transfer constraints?');
  if(interests.some(item=>['ceramics','ceramic_purchase','maker_experience'].includes(item)))asks.push('Do you want production context, design, buying ceramics, or a verified making encounter?');
  const points=modules.flatMap(module=>database.points.filter(point=>point.module_id===module.id&&point.field_status!=='candidate_only').slice(0,2).map(point=>({...point,name:pointDecisionLayer.guest_name_map?.[point.id]??point.name,decisionProfile:pointDecisionLayer.points[point.id]??null})));
  const warnings=['This is a draft for human review. Recheck sacred access, ritual conditions, weather, transport and current cultural programmes before delivery.'];
  if(days<=2&&interests.some(item=>['ceramics','maker_experience'].includes(item)))warnings.push('Do not add Dehua to a two-day Quanzhou core. It needs a separate third day.');
  if(interests.includes('maker_experience'))warnings.push('Maker resources are research-only until an individual release card is partner_ready. Do not quote, book or promise a workshop.');
  if(interests.includes('ceramic_purchase'))warnings.push('Do not authenticate quality, provenance, price, shipping or export suitability.');
  if(interests.includes('booking_help_requested')||interests.includes('experience_booking_requested'))warnings.push('Product boundary: research and official links only; do not book, quote or package third-party services.');
  return {city:'Quanzhou–Dehua',status:'draft_for_human_review',days,dayPlan,selectedModules:modules,selectedPoints:points,requiredFollowUps:asks,warnings,commercial:commercialFor(input,asks),deliveryRule:'Release only after current human review and, for any experience, a separate resource release card.',decisionLayerVersion:decisionLayer.metadata.version,pointDecisionLayerVersion:pointDecisionLayer.metadata.version};
}

export { database, arrangeDays };
